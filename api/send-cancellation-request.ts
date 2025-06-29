import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendTransactionalEmail } from '../src/utils/brevo.js';
import formidable from 'formidable';
import fs from 'fs';
import { z } from 'zod';
import { JSDOM } from 'jsdom';
import { withRateLimit, rateLimitConfigs } from './utils/rate-limiter.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const config = {
  api: {
    bodyParser: false,
  },
};

// Zod schema for validation
const cancellationSchema = z.object({
  nombreCompleto: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  numeroCedula: z.string()
    .min(6, 'El número de cédula debe tener al menos 6 caracteres')
    .max(20, 'El número de cédula no puede exceder 20 caracteres'),
  telefono: z.string()
    .regex(/^\+?[0-9\s\-()]{10,20}$/, 'Número de teléfono inválido'),
  email: z.string()
    .email('Correo electrónico inválido')
    .max(100, 'El correo no puede exceder 100 caracteres'),
  nombreAseguradora: z.string()
    .min(2, 'El nombre de la aseguradora debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la aseguradora no puede exceder 100 caracteres'),
  numeroPoliza: z.string()
    .max(50, 'El número de póliza no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  tipoSeguro: z.string()
    .min(1, 'Debe seleccionar un tipo de seguro')
    .max(50, 'El tipo de seguro no puede exceder 50 caracteres'),
  otroSeguro: z.string()
    .max(100, 'La descripción no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  cancellationReason: z.string()
    .max(1000, 'El motivo no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  aceptaTerminosYPolitica: z.boolean()
    .refine(val => val === true, 'Debes aceptar los términos y condiciones'),
  website: z.string().optional(), // Honeypot field
});

interface CancellationData {
  nombreCompleto: string;
  numeroCedula: string;
  telefono: string;
  email: string;
  nombreAseguradora: string;
  numeroPoliza?: string;
  tipoSeguro: string;
  otroSeguro?: string;
  cancellationReason?: string;
  aceptaTerminosYPolitica: boolean;
  website?: string; // Honeypot field
  [key: string]: string | boolean | undefined;
}

function formatDataToHtml(data: Omit<CancellationData, 'documentosAdicionales' | 'website'>, attachedFiles: Record<string, string[]>): string {
  let html = '<h2>Detalles de la Solicitud de Cancelación:</h2>';
  const fieldLabels: Record<string, string> = {
    nombreCompleto: 'Nombre Completo',
    numeroCedula: 'Número de Cédula',
    telefono: 'Teléfono',
    email: 'Email',
    nombreAseguradora: 'Nombre de la Aseguradora',
    numeroPoliza: 'Número de Póliza',
    tipoSeguro: 'Tipo de Seguro',
    otroSeguro: 'Otro Seguro (Especificado)',
    cancellationReason: 'Motivo de la Cancelación',
    documentosAdicionales: 'Documentos Adicionales',
  };

  html += '<table style="width: 100%; border-collapse: collapse;">';
  for (const [key, value] of Object.entries(data)) {
    if (key === 'aceptaTerminosYPolitica' || key === 'website' || !value) continue;
    const label = fieldLabels[key] || key;
    html += `<tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;"><strong>${label}:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`;
  }

  if (Object.keys(attachedFiles).length > 0) {
    for (const [key, files] of Object.entries(attachedFiles)) {
        if (files.length > 0) {
            const label = fieldLabels[key] || key;
            html += `<tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;"><strong>${label}:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${files.join(', ')}</td></tr>`;
        }
    }
  }

  html += '</table>';
  return html;
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
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const tempFilePaths: string[] = [];

    try {
        // Dynamic imports for security modules
        const dompurifyModule = await import('dompurify');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const DOMPurify = (dompurifyModule as any).default || dompurifyModule;
        const { parse } = await import('cookie');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Tokens = (await import('csrf') as any).default;
        const tokens = new Tokens();
        
        // Initialize DOMPurify with JSDOM
        const window = new JSDOM('').window;
        const DOMPurifyInstance = typeof DOMPurify === 'function' ? DOMPurify(window) : DOMPurify.default(window);
        
        // Verify CSRF token
        const cookies = parse(req.headers.cookie || '');
        const secret = cookies._csrf_secret;
        const token = req.headers['x-csrf-token'] as string;
        
        if (!secret || !token || !tokens.verify(secret, token)) {
            return res.status(403).json({ message: 'Token de seguridad inválido' });
        }

        const { fields, files } = await parseForm(req);

        // Extract and trim form data
        // Handle both single values and arrays from formidable
        const getFieldValue = (field: string | string[] | undefined): string => {
            if (Array.isArray(field)) return field[0] || '';
            return field || '';
        };
        
        const rawFormData = {
            nombreCompleto: getFieldValue(fields.nombreCompleto as string | string[]).trim(),
            numeroCedula: getFieldValue(fields.numeroCedula as string | string[]).trim(),
            telefono: getFieldValue(fields.telefono as string | string[]).trim(),
            email: getFieldValue(fields.email as string | string[]).trim(),
            nombreAseguradora: getFieldValue(fields.nombreAseguradora as string | string[]).trim(),
            numeroPoliza: getFieldValue(fields.numeroPoliza as string | string[]).trim(),
            tipoSeguro: getFieldValue(fields.tipoSeguro as string | string[]).trim(),
            otroSeguro: getFieldValue(fields.otroSeguro as string | string[]).trim(),
            cancellationReason: getFieldValue(fields.cancellationReason as string | string[]).trim(),
            aceptaTerminosYPolitica: getFieldValue(fields.aceptaTerminosYPolitica as string | string[]) === 'true',
            website: getFieldValue(fields.website as string | string[]).trim(), // Honeypot field
        };

        // Validate form data with Zod
        const validationResult = cancellationSchema.safeParse(rawFormData);
        
        if (!validationResult.success) {
            return res.status(400).json({
                message: 'Datos inválidos.',
                errors: validationResult.error.flatten().fieldErrors,
            });
        }

        const validatedData = validationResult.data;

        // Check honeypot field for bot protection
        if (validatedData.website && validatedData.website.length > 0) {
            // Silently accept but don't process spam submissions
            return res.status(200).json({ 
                message: 'Solicitud enviada con éxito.',
                data: { messageId: 'spam-filtered' }
            });
        }

        // Sanitize user inputs to prevent XSS
        const sanitizedData: CancellationData = {
            nombreCompleto: DOMPurifyInstance.sanitize(validatedData.nombreCompleto),
            numeroCedula: DOMPurifyInstance.sanitize(validatedData.numeroCedula),
            telefono: DOMPurifyInstance.sanitize(validatedData.telefono),
            email: DOMPurifyInstance.sanitize(validatedData.email),
            nombreAseguradora: DOMPurifyInstance.sanitize(validatedData.nombreAseguradora),
            numeroPoliza: validatedData.numeroPoliza ? DOMPurifyInstance.sanitize(validatedData.numeroPoliza) : undefined,
            tipoSeguro: DOMPurifyInstance.sanitize(validatedData.tipoSeguro),
            otroSeguro: validatedData.otroSeguro ? DOMPurifyInstance.sanitize(validatedData.otroSeguro) : undefined,
            cancellationReason: validatedData.cancellationReason ? DOMPurifyInstance.sanitize(validatedData.cancellationReason) : 'No especificado',
            aceptaTerminosYPolitica: validatedData.aceptaTerminosYPolitica,
        };

        // Process file attachments with security validation
        const attachments: { name: string; content: string }[] = [];
        const attachedFileNames: Record<string, string[]> = {};

        for (const key in files) {
            const fileArray = files[key];
            if (fileArray) {
                for (const file of fileArray) {
                    if (file.size > 0) {
                        if (file.size > MAX_FILE_SIZE) {
                            throw new Error(`El archivo ${file.originalFilename} excede el tamaño máximo de 5 MB.`);
                        }
                        if (!ALLOWED_MIME_TYPES.includes(file.mimetype || '')) {
                            throw new Error(`El tipo de archivo de ${file.originalFilename} no es válido.`);
                        }
                        
                        // Sanitize file name
                        const sanitizedFileName = DOMPurifyInstance.sanitize(file.originalFilename || 'adjunto');
                        
                        const fileContent = fs.readFileSync(file.filepath);
                        attachments.push({ 
                            name: sanitizedFileName, 
                            content: fileContent.toString('base64') 
                        });
                        
                        if (!attachedFileNames[key]) {
                            attachedFileNames[key] = [];
                        }
                        attachedFileNames[key].push(sanitizedFileName);
                        tempFilePaths.push(file.filepath);
                    }
                }
            }
        }

        const senderName = process.env.BREVO_SENDER_NAME || 'Proense Asesora Digital';
        const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@proense.co';
        const agentEmail = process.env.AGENT_EMAIL || 'comercial@proense.co';

        const formattedDataHtml = formatDataToHtml(sanitizedData, attachedFileNames);

        // Email to Client
        const clientEmailHtmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #003366;">Confirmación de tu solicitud de cancelación</h1>
                <p>Hola ${sanitizedData.nombreCompleto},</p>
                <p>Hemos recibido tu solicitud para cancelar tu póliza. A continuación, encontrarás un resumen de la información que nos proporcionaste:</p>
                ${formattedDataHtml}
                <p><strong>Para hacer efectiva esta cancelación, por favor, responde a este correo electrónico escribiendo únicamente:</strong></p>
                <p style="font-size: 1.2em; font-weight: bold; color: #D9534F;">Confirmo la solicitud de cancelación</p>
                <p>Una vez recibamos tu confirmación, uno de nuestros asesores procesará tu solicitud y se pondrá en contacto contigo.</p>
                <p>Si no deseas proceder o si no realizaste esta solicitud, por favor ignora este mensaje.</p>
                <p>Atentamente,<br/>El equipo de Proense Asesora Digital</p>
            </div>
        `;

        // Email to Agent
        const agentEmailHtmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #003366;">Nueva Solicitud de Cancelación de Póliza</h1>
                <p>Se ha recibido una nueva solicitud de cancelación de póliza a través del formulario de servicio al cliente.</p>
                ${formattedDataHtml}
                <p><strong>Datos de Contacto del Cliente:</strong></p>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Nombre:</strong> ${sanitizedData.nombreCompleto}</li>
                    <li><strong>Email:</strong> ${sanitizedData.email}</li>
                    <li><strong>Teléfono:</strong> ${sanitizedData.telefono}</li>
                </ul>
                <p><strong>Nota:</strong> Se ha enviado un correo al cliente solicitando su confirmación explícita para proceder. Por favor, espera la confirmación antes de procesar la cancelación.</p>
            </div>
        `;

        await sendTransactionalEmail({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: sanitizedData.email, name: sanitizedData.nombreCompleto }],
            subject: 'Confirma tu Solicitud de Cancelación de Póliza',
            htmlContent: clientEmailHtmlContent,
        });

        await sendTransactionalEmail({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: agentEmail, name: 'Agente Proense' }],
            subject: `Solicitud de Cancelación: ${sanitizedData.nombreCompleto}`,
            htmlContent: agentEmailHtmlContent,
            attachment: attachments.length > 0 ? attachments : undefined,
        });

        return res.status(200).json({ message: 'Solicitud enviada con éxito.' });

    } catch (error) {
        console.error('Error processing cancellation request:', error);
        let errorMessage = 'Error interno del servidor.';
        let statusCode = 500;
        
        if (error instanceof Error) {
            errorMessage = error.message;
            if (errorMessage.includes("excede el tamaño máximo") || 
                errorMessage.includes("no es válido") ||
                errorMessage.includes("Datos inválidos")) {
                statusCode = 400;
            }
        }
        
        return res.status(statusCode).json({ message: errorMessage });
    } finally {
        // Clean up temporary files
        for (const path of tempFilePaths) {
            fs.unlink(path, (err: NodeJS.ErrnoException | null) => {
                if (err) console.error(`Failed to delete temporary file: ${path}`, err);
            });
        }
    }
}

// Export the handler with rate limiting applied
export default withRateLimit(rateLimitConfigs.forms, handler);
