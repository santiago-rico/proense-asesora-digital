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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Disable Vercel's default body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Defines the expected structure of the form data from MultiStepForm.tsx
interface InsuranceApplicationData {
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

// Backend validation schema with trimming
const backendSchema = z.object({
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
});

async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
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

    // Collect all temp file paths for reliable cleanup and validate them
    for (const key in files) {
      const fileArray = files[key];
      if (fileArray) {
        for (const file of fileArray) {
          tempFilePaths.push(file.filepath);

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

    const senderName = process.env.BREVO_SENDER_NAME || 'Proense Asesora Digital';
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@proense.co';
    const agentEmail = process.env.AGENT_EMAIL || 'comercial@proense.co';

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
      to: [{ email: agentEmail, name: 'Agente Proense' }],
      subject: agentEmailSubject,
      htmlContent: agentEmailHtmlContent,
      attachment: attachments.length > 0 ? attachments : undefined,
    };

    // Send emails
    const userEmailResult = await sendTransactionalEmail(userBrevoPayload);
    if (!userEmailResult.success) {
      console.error('Failed to send email to user:', userEmailResult.error);
      // We don't abort here; the agent email is more critical.
    }

    const agentEmailResult = await sendTransactionalEmail(agentBrevoPayload);
    if (!agentEmailResult.success) {
      console.error('Failed to send email to agent:', agentEmailResult.error);
      // This is a critical failure.
      return res.status(agentEmailResult.status || 500).json({
        message: 'Error enviando email de notificación al agente.',
        details: agentEmailResult.error,
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
