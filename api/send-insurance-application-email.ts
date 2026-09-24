// IMPORTANT: You must install formidable: npm install formidable
// And for types: npm install -D @types/formidable
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendTransactionalEmail } from '../src/utils/brevo.js';
import formidable from 'formidable';
import fs from 'fs';
import { z } from 'zod';
import { JSDOM } from 'jsdom';
import { withRateLimit, rateLimitConfigs } from './utils/rate-limiter.js';
import { InsuranceApplicationTemplate } from '../src/utils/email-templates/InsuranceApplicationTemplate.js';
import { getNotificationEmails } from './utils/notification-emails.js';
import {
  HOGAR_ASEGURABILIDAD_KEYS,
  HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE,
  type HogarAsegurabilidadKey,
} from '../src/data/hogarAsegurabilidad.js';

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

// Disable Vercel's default body parser to handle multipart/form-data.
// maxDuration is raised from the platform default (~10-15s) so the function is
// not killed mid-flight while receiving large mobile uploads and calling Brevo.
// 60s is the ceiling on Hobby and is safe on Pro.
export const config = {
  maxDuration: 60,
  api: {
    bodyParser: false,
  },
};

// Defines the expected structure of the form data from MultiStepForm.tsx
// Hogar declaración de asegurabilidad answers are keyed by HOGAR_ASEGURABILIDAD_KEYS.
interface InsuranceApplicationData extends Partial<Record<HogarAsegurabilidadKey, 'si' | 'no' | ''>> {
  // Step 1: Basic Info
  nombreCompleto: string;
  telefono: string;
  email: string;
  // tipoDocumento: string; // Not present in the Zod schema provided, confirm if needed
  // numeroDocumento: string; // Not present in the Zod schema provided, confirm if needed
  // fechaNacimiento: string; // Not present in the Zod schema provided, confirm if needed

  // Step 2: Insurance Selection
  tipoSeguro: string;
  metodoPago: string;
  periodicidadPago: string;

  // Step 3: Conditional Fields (common or specific)
  numeroCedula?: string;
  fotoCedula?: File[];
  beneficiarios?: string; // Used for 'vida'
  documentosBeneficiarios?: File[]; // Used for 'vida'
  listaBeneficiarios?: string; // Used for 'salud'
  certificadoLibertad?: File[]; // Used for 'hogar'
  tarjetaPropiedad?: File[]; // Used for 'auto'
  
  // Empresarial
  numeroCedulaRepLegal?: string;
  fotoCedulaRepLegal?: File[];
  nit?: string;
  rut?: File[];
  camaraComercio?: File[];

  // Rentas
  contratoArrendamiento?: File[];

  // Vida - Crédito Protegido
  tieneEnfermedadesDiagnosticadas?: 'si' | 'no';
  enfermedadesEspecificar?: string;
  valorActualDeuda?: string;
  conduceMoto?: 'si' | 'no';

  // Step 4: Declaration
  declaraRenta: 'si' | 'no';
  archivoDeclaracionRenta?: File[];
  // Fields for non-declarers (if declaraRenta is 'no')
  ingresosNoDeclarante?: string;
  egresosNoDeclarante?: string;
  activosNoDeclarante?: string;
  pasivosNoDeclarante?: string;

  // Step 5: Terms
  aceptaTerminosYPolitica: boolean;

  // Allow other fields that might be dynamically added or part of the broader form state
  [key: string]: string | boolean | File[] | undefined;
}


const parseForm = (
  req: VercelRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req, (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

// Every submission carries all hogar declaration keys ('' when unanswered or
// for other insurance types); they are only required for tipoSeguro 'hogar'.
const siNoOrEmpty = z.union([z.enum(['si', 'no']), z.literal('')]).optional();
const hogarAsegurabilidadFields = Object.fromEntries(
  HOGAR_ASEGURABILIDAD_KEYS.map(key => [key, siNoOrEmpty]),
) as Record<HogarAsegurabilidadKey, typeof siNoOrEmpty>;

// Backend validation schema with trimming
export const backendSchema = z.object({
  // Personal Information
  nombreCompleto: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).transform(str => str.trim()),
  telefono: z.string().regex(/^\+?[0-9]{10,15}$/, 'Número de teléfono inválido').transform(str => str.trim()),
  email: z.string().email('Correo electrónico inválido').transform(str => str.trim().toLowerCase()),
  
  // Insurance Information
  tipoSeguro: z.string().min(1).transform(str => str.trim()),
  metodoPago: z.string().transform(str => str.trim()),
  periodicidadPago: z.string().transform(str => str.trim()),
  
  // Conditional fields
  numeroCedula: z.string().transform(str => str.trim()).optional(),
  beneficiarios: z.string().transform(str => str.trim()).optional(),
  listaBeneficiarios: z.string().transform(str => str.trim()).optional(),
  numeroCedulaRepLegal: z.string().transform(str => str.trim()).optional(),
  nit: z.string().transform(str => str.trim()).optional(),
  tieneEnfermedadesDiagnosticadas: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  enfermedadesEspecificar: z.string().transform(str => str.trim()).optional(),
  valorActualDeuda: z.string().transform(str => str.trim()).optional(),
  conduceMoto: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  ...hogarAsegurabilidadFields,
  
  // Declaration
  declaraRenta: z.enum(['si', 'no']),
  ingresosNoDeclarante: z.string().transform(str => str.trim()).optional(),
  egresosNoDeclarante: z.string().transform(str => str.trim()).optional(),
  activosNoDeclarante: z.string().transform(str => str.trim()).optional(),
  pasivosNoDeclarante: z.string().transform(str => str.trim()).optional(),
  
  // Terms
  aceptaTerminosYPolitica: z.enum(['true', 'false']).transform(val => val === 'true'),
  
  // Honeypot field
  website: z.string().optional(),
}).superRefine((data, ctx) => {
  // A "Sí" never blocks the submission (it is information for the asesor),
  // but every question must be answered for hogar.
  if (data.tipoSeguro !== 'hogar') return;
  // Pages loaded before the declaration shipped send none of the keys; accept
  // those in-flight submissions instead of rejecting on fields they can't show.
  if (HOGAR_ASEGURABILIDAD_KEYS.every(key => data[key] === undefined)) return;
  for (const key of HOGAR_ASEGURABILIDAD_KEYS) {
    if (data[key] !== 'si' && data[key] !== 'no') {
      ctx.addIssue({ code: 'custom', message: HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE, path: [key] });
    }
  }
});

async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const tempFilePaths: string[] = [];
  const handlerStart = Date.now();
  // Diagnostic: request body size as reported by the client (no PII).
  const contentLengthMB = (Number(req.headers['content-length'] || 0) / (1024 * 1024)).toFixed(2);

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

    // Collect all temp file paths for reliable cleanup and validate them
    let fileCount = 0;
    let totalUploadedBytes = 0;
    for (const key in files) {
      const fileArray = files[key];
      if (fileArray) {
        for (const file of fileArray) {
          tempFilePaths.push(file.filepath);
          fileCount++;
          totalUploadedBytes += file.size;

          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`El archivo "${file.originalFilename}" excede el tamaño máximo de 5MB.`);
          }

          // Validate MIME type
          if (!file.mimetype || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new Error(`El tipo de archivo "${file.originalFilename}" no es válido. Solo se aceptan PDF, JPG, PNG, WEBP.`);
          }
        }
      }
    }

    // Diagnostic (Tier 0): sizes/counts only, no PII. Lets us see in Vercel logs
    // how big real mobile submissions are and correlate with 413/504/timeouts.
    console.log(
      `[emision] submission received: contentLength=${contentLengthMB}MB, files=${fileCount}, ` +
      `uploadedBytes=${(totalUploadedBytes / (1024 * 1024)).toFixed(2)}MB, ` +
      `parseTime=${Date.now() - handlerStart}ms`,
    );

    // Type assertion for form fields
    const rawFormData = Object.entries(fields).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        // The `formidable` library wraps all field values in an array.
        // We take the first element, as we don't expect multiple values for a single field.
        acc[key] = Array.isArray(value) ? value[0] : value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    // Check honeypot field first
    if (rawFormData.website && rawFormData.website.length > 0) {
      // Silently accept but don't process spam submissions
      return res.status(200).json({ 
        message: 'Solicitud enviada con éxito.',
        data: { messageId: 'spam-filtered' }
      });
    }
    
    // Validate with backend schema
    const validationResult = backendSchema.safeParse(rawFormData);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos inválidos.',
        errors: validationResult.error.flatten().fieldErrors,
      });
    }
    
    const formData = validationResult.data as InsuranceApplicationData;
    
    // Sanitize all text fields to prevent XSS
    const sanitizedData = {
      ...formData,
      nombreCompleto: DOMPurifyInstance.sanitize(formData.nombreCompleto),
      telefono: DOMPurifyInstance.sanitize(formData.telefono),
      email: DOMPurifyInstance.sanitize(formData.email),
      tipoSeguro: DOMPurifyInstance.sanitize(formData.tipoSeguro),
      metodoPago: DOMPurifyInstance.sanitize(formData.metodoPago),
      periodicidadPago: DOMPurifyInstance.sanitize(formData.periodicidadPago),
      numeroCedula: formData.numeroCedula ? DOMPurifyInstance.sanitize(formData.numeroCedula) : undefined,
      beneficiarios: formData.beneficiarios ? DOMPurifyInstance.sanitize(formData.beneficiarios) : undefined,
      listaBeneficiarios: formData.listaBeneficiarios ? DOMPurifyInstance.sanitize(formData.listaBeneficiarios) : undefined,
      numeroCedulaRepLegal: formData.numeroCedulaRepLegal ? DOMPurifyInstance.sanitize(formData.numeroCedulaRepLegal) : undefined,
      nit: formData.nit ? DOMPurifyInstance.sanitize(formData.nit) : undefined,
      enfermedadesEspecificar: formData.enfermedadesEspecificar ? DOMPurifyInstance.sanitize(formData.enfermedadesEspecificar) : undefined,
      valorActualDeuda: formData.valorActualDeuda ? DOMPurifyInstance.sanitize(formData.valorActualDeuda) : undefined,
      ingresosNoDeclarante: formData.ingresosNoDeclarante ? DOMPurifyInstance.sanitize(formData.ingresosNoDeclarante) : undefined,
      egresosNoDeclarante: formData.egresosNoDeclarante ? DOMPurifyInstance.sanitize(formData.egresosNoDeclarante) : undefined,
      activosNoDeclarante: formData.activosNoDeclarante ? DOMPurifyInstance.sanitize(formData.activosNoDeclarante) : undefined,
      pasivosNoDeclarante: formData.pasivosNoDeclarante ? DOMPurifyInstance.sanitize(formData.pasivosNoDeclarante) : undefined,
    } as InsuranceApplicationData;

    const attachments: { name: string; content: string }[] = [];
    const attachedFileNames: Record<string, string[]> = {};

    for (const key in files) {
      const fileArray = files[key];
      if (fileArray) {
        attachedFileNames[key] = [];
        for (const file of fileArray) {
          const fileContent = fs.readFileSync(file.filepath);
          const filename = file.originalFilename || 'attachment.dat';
          attachments.push({
            name: filename,
            content: fileContent.toString('base64'),
          });
          attachedFileNames[key].push(filename);
          // Note: Temp files are not unlinked here; they are handled in the `finally` block.
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
    const notificationRecipients = getNotificationEmails('emision');

    // Get the base URL from the request
    const baseUrl = req.headers.host ? `https://${req.headers.host}` : undefined;

    // 1. Email to User
    const userEmailSubject = `Confirmación de tu solicitud de seguro: ${formData.tipoSeguro}`;
    const userEmailHtmlContent = InsuranceApplicationTemplate({
      data: sanitizedData,
      attachedFiles: attachedFileNames,
      isUserEmail: true,
      isDarkMode: false,
      baseUrl
    });

    const userBrevoPayload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: sanitizedData.email, name: sanitizedData.nombreCompleto }],
      subject: userEmailSubject,
      htmlContent: userEmailHtmlContent,
    };

    // 2. Email to Agent
    const agentEmailSubject = `Nueva Solicitud de Póliza: ${sanitizedData.nombreCompleto} - ${sanitizedData.tipoSeguro}`;
    const agentEmailHtmlContent = InsuranceApplicationTemplate({
      data: sanitizedData,
      attachedFiles: attachedFileNames,
      isUserEmail: false,
      isDarkMode: false,
      baseUrl
    });

    const agentBrevoPayload = {
      sender: { name: senderName, email: senderEmail },
      to: notificationRecipients,
      subject: agentEmailSubject,
      htmlContent: agentEmailHtmlContent,
      attachment: attachments.length > 0 ? attachments : undefined,
    };

    // Send both emails in parallel to minimize function execution time: each
    // Brevo call carries the full base64 attachments, so sending them
    // sequentially roughly doubles the time spent here. The user confirmation is
    // best-effort; the agent notification is critical.
    const brevoStart = Date.now();
    const [userOutcome, agentOutcome] = await Promise.allSettled([
      sendTransactionalEmail(userBrevoPayload),
      sendTransactionalEmail(agentBrevoPayload),
    ]);
    console.log(
      `[emision] brevo finished in ${Date.now() - brevoStart}ms ` +
      `(attachments=${attachments.length}, totalHandler=${Date.now() - handlerStart}ms)`,
    );

    if (userOutcome.status === 'rejected' || !userOutcome.value.success) {
      const err = userOutcome.status === 'rejected' ? userOutcome.reason : userOutcome.value.error;
      console.error('Failed to send email to user:', err);
      // We don't abort here; the agent email is more critical.
    }

    if (agentOutcome.status === 'rejected' || !agentOutcome.value.success) {
      const status = agentOutcome.status === 'fulfilled' ? (agentOutcome.value.status || 500) : 500;
      const details = agentOutcome.status === 'rejected' ? String(agentOutcome.reason) : agentOutcome.value.error;
      console.error('Failed to send email to agent:', details);
      // This is a critical failure.
      return res.status(status).json({
        message: 'Error enviando email de notificación al agente.',
        details,
      });
    }

    return res.status(200).json({ message: 'Solicitud enviada con éxito.' });

  } catch (error) {
    console.error('Error processing form submission:', error);
    let errorMessage = 'Error interno del servidor.';
    let statusCode = 500;
    if (error instanceof Error) {
        errorMessage = error.message;
        // Check if it's one of our validation errors and set status to 400
        if (errorMessage.includes("excede el tamaño máximo") || errorMessage.includes("no es válido")) {
          statusCode = 400; // Bad Request
        }
    }
    return res.status(statusCode).json({ message: errorMessage });
  } finally {
    // Reliably clean up all temporary files
    for (const path of tempFilePaths) {
      fs.unlink(path, (err: NodeJS.ErrnoException | null) => {
        if (err) {
          console.error(`Failed to delete temporary file: ${path}`, err);
        }
      });
    }
  }
}

// Export the handler with rate limiting applied
export default withRateLimit(rateLimitConfigs.forms, handler);
