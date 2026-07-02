import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendTransactionalEmail } from '../src/utils/brevo.js';
import formidable from 'formidable';
import fs from 'fs';
import { z } from 'zod';
import { JSDOM } from 'jsdom';
import { withRateLimit, rateLimitConfigs } from './utils/rate-limiter.js';
import { ModificationRequestTemplate } from '../src/utils/email-templates/ModificationRequestTemplate.js';
import { getNotificationEmails } from './utils/notification-emails.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const config = {
  api: {
    bodyParser: false,
  },
};

// Validation schema for the form data
const modificationValidationSchema = z.object({
  nombreCompleto: z.string().trim().min(1, 'El nombre completo es requerido'),
  numeroCedula: z.string().trim().min(1, 'El número de cédula es requerido'),
  telefono: z.string().trim().min(1, 'El teléfono es requerido'),
  email: z.string().trim().email('Email inválido'),
  nombreAseguradora: z.string().trim().min(1, 'El nombre de la aseguradora es requerido'),
  numeroPoliza: z.string().trim().optional(),
  tipoSeguro: z.string().trim().min(1, 'El tipo de seguro es requerido'),
  otroSeguro: z.string().trim().optional(),
  modificaciones: z.string().trim().min(1, 'Las modificaciones son requeridas'),
  aceptaTerminosYPolitica: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
  website: z.string().optional(), // Honeypot field
}).superRefine((data, ctx) => {
  if (data.tipoSeguro === 'otro' && (!data.otroSeguro || data.otroSeguro.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['otroSeguro'],
      message: 'Debe especificar el tipo de seguro',
    });
  }
});

interface ModificationData {
  nombreCompleto: string;
  numeroCedula: string;
  telefono: string;
  email: string;
  nombreAseguradora: string;
  numeroPoliza?: string;
  tipoSeguro: string;
  otroSeguro?: string;
  modificaciones: string;
  aceptaTerminosYPolitica: boolean;
  [key: string]: string | boolean | undefined;
}


async function parseForm(req: VercelRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
    const form = formidable({
        maxFileSize: MAX_FILE_SIZE,
        allowEmptyFiles: true,
        minFileSize: 0,
    });

    return new Promise((resolve, reject) => {
        form.parse(req, (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
            if (err) {
                return reject(err);
            }
            resolve({ fields, files });
        });
    });
}

async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const tempFilePaths: string[] = [];

    try {
        // Dynamic imports for security modules
        const dompurifyModule = await import('dompurify');
        const DOMPurify = typeof dompurifyModule.default === 'function' ? dompurifyModule.default : dompurifyModule;
        const { parse } = await import('cookie');
        const { default: Tokens } = await import('csrf') as unknown as { default: new() => { verify: (secret: string, token: string) => boolean } };
        const tokens = new Tokens();
        
        // Initialize DOMPurify with JSDOM
        const window = new JSDOM('').window;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const DOMPurifyInstance = (DOMPurify as any)(window);
        
        // Verify CSRF token
        const cookies = parse(req.headers.cookie || '');
        const secret = cookies._csrf_secret;
        const token = req.headers['x-csrf-token'] as string;
        
        if (!secret || !token || !tokens.verify(secret, token)) {
            return res.status(403).json({ message: 'Invalid CSRF token' });
        }

        const { fields, files } = await parseForm(req);

        // Check honeypot field first
        if (fields.website && fields.website[0] && fields.website[0].length > 0) {
            // Silently accept but don't process spam submissions
            return res.status(200).json({ 
                message: 'Solicitud enviada con éxito.'
            });
        }

        // Type-cast formidable fields for consistent processing
        const rawFormData = Object.entries(fields).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = Array.isArray(value) ? value[0] : value;
            }
            return acc;
        }, {} as Record<string, string>);

        // Parse and validate the form data
        const validationResult = modificationValidationSchema.safeParse({
            ...rawFormData,
            aceptaTerminosYPolitica: rawFormData.aceptaTerminosYPolitica === 'true'
        });

        if (!validationResult.success) {
            return res.status(400).json({
                message: 'Datos inválidos.',
                errors: validationResult.error.flatten().fieldErrors,
            });
        }

        const validatedData = validationResult.data;

        const formData: ModificationData = {
            nombreCompleto: DOMPurifyInstance.sanitize(validatedData.nombreCompleto),
            numeroCedula: DOMPurifyInstance.sanitize(validatedData.numeroCedula),
            telefono: DOMPurifyInstance.sanitize(validatedData.telefono),
            email: DOMPurifyInstance.sanitize(validatedData.email),
            nombreAseguradora: DOMPurifyInstance.sanitize(validatedData.nombreAseguradora),
            numeroPoliza: validatedData.numeroPoliza ? DOMPurifyInstance.sanitize(validatedData.numeroPoliza) : '',
            tipoSeguro: DOMPurifyInstance.sanitize(validatedData.tipoSeguro),
            otroSeguro: validatedData.otroSeguro ? DOMPurifyInstance.sanitize(validatedData.otroSeguro) : undefined,
            modificaciones: DOMPurifyInstance.sanitize(validatedData.modificaciones),
            aceptaTerminosYPolitica: validatedData.aceptaTerminosYPolitica,
        };

                const attachments: { name: string; content: string }[] = [];
        const attachedFileNames: Record<string, string[]> = {};

        for (const key in files) {
            const fileArray = files[key];
            if (fileArray) {
                attachedFileNames[key] = [];
                for (const file of fileArray) {
                    if (file.size > 0) {
                        if (file.size > MAX_FILE_SIZE) {
                            throw new Error(`El archivo ${file.originalFilename} excede el tamaño máximo de 5 MB.`);
                        }
                        if (!ALLOWED_MIME_TYPES.includes(file.mimetype || '')) {
                            throw new Error(`El tipo de archivo de ${file.originalFilename} no es válido.`);
                        }
                        const fileContent = fs.readFileSync(file.filepath).toString('base64');
                                                attachments.push({ name: file.originalFilename || 'archivo', content: fileContent });
                        attachedFileNames[key].push(file.originalFilename || 'archivo');
                        tempFilePaths.push(file.filepath);
                    }
                }
            }
        }

        // Check total attachment size (Brevo has ~10MB limit, base64 adds ~33%)
        const totalAttachmentSize = attachments.reduce((sum, att) => sum + att.content.length, 0);
        const BREVO_ATTACHMENT_LIMIT = 8 * 1024 * 1024; // 8MB in base64 (conservative limit)
        if (totalAttachmentSize > BREVO_ATTACHMENT_LIMIT) {
          // Attachments too large for Brevo - send email without attachments and note it
          attachments.length = 0; // Clear attachments
          console.warn(`Attachments too large (${(totalAttachmentSize / (1024 * 1024)).toFixed(1)}MB base64), sending without attachments`);
        }

        const senderName = process.env.BREVO_SENDER_NAME || 'Proense Asesora Digital';
        const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@proense.co';
        const notificationRecipients = getNotificationEmails('modificacion');

        // Get the base URL from the request
        const baseUrl = req.headers.host ? `https://${req.headers.host}` : undefined;

        // Email to Client
        const clientEmailHtmlContent = ModificationRequestTemplate({
            data: formData,
            attachedFiles: attachedFileNames,
            isUserEmail: true,
            isDarkMode: false,
            baseUrl
        });

        // Email to Agent
        const agentEmailHtmlContent = ModificationRequestTemplate({
            data: formData,
            attachedFiles: attachedFileNames,
            isUserEmail: false,
            isDarkMode: false,
            baseUrl
        });

        await sendTransactionalEmail({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: formData.email, name: formData.nombreCompleto }],
            subject: 'Confirma tu Solicitud de Modificación de Póliza',
            htmlContent: clientEmailHtmlContent,
        });

        await sendTransactionalEmail({
            sender: { name: senderName, email: senderEmail },
            to: notificationRecipients,
            subject: `Solicitud de Modificación: ${formData.nombreCompleto}`,
            htmlContent: agentEmailHtmlContent,
            attachment: attachments.length > 0 ? attachments : undefined,
        });

        return res.status(200).json({ message: 'Solicitud enviada con éxito.' });

    } catch (error) {
        console.error('Error processing modification request:', error);
        let errorMessage = 'Error interno del servidor.';
        let statusCode = 500;
        if (error instanceof Error) {
            errorMessage = error.message;
            if (errorMessage.includes("excede el tamaño máximo") || errorMessage.includes("no es válido")) {
                statusCode = 400;
            }
        }
        return res.status(statusCode).json({ message: errorMessage });
    } finally {
        for (const path of tempFilePaths) {
            fs.unlink(path, (err: NodeJS.ErrnoException | null) => {
                if (err) console.error(`Failed to delete temporary file: ${path}`, err);
            });
        }
    }
}

// Export the handler with rate limiting applied
export default withRateLimit(rateLimitConfigs.forms, handler);
