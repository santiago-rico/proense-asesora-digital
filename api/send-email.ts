import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { JSDOM } from 'jsdom';
import { withRateLimit, rateLimitConfigs } from './_utils/rate-limiter.js';
import { LeadTemplate } from '../src/utils/email-templates/LeadTemplate.js';
import { getNotificationEmails } from './_utils/notification-emails.js';
import { CSRF_ERROR_CODE } from '../src/utils/csrf-error.js';

// Define the validation schema with Zod
const leadFormSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es requerido'),
  email: z.string().trim().email('Email inválido'),
  telefono: z.string().trim().optional(),
  tipoSeguro: z.string().trim().min(1, 'El tipo de seguro es requerido'),
  mensaje: z.string().trim().optional(),
  website: z.string().optional(), // Honeypot field
});

async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Dynamic imports for CommonJS modules
    const dompurifyModule = await import('dompurify');
    // Handle both default export and named export cases
    const DOMPurify = typeof dompurifyModule.default === 'function' ? dompurifyModule.default : dompurifyModule;
    const { parseCookie } = await import('cookie');
    const { default: Tokens } = await import('csrf') as unknown as { default: new() => { verify: (secret: string, token: string) => boolean } };
    const tokens = new Tokens();
    
    // Initialize DOMPurify with JSDOM
    const window = new JSDOM('').window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOMPurifyInstance = (DOMPurify as any)(window);
    
    // Verify CSRF token
    const cookies = parseCookie(req.headers.cookie || '');
    const secret = cookies._csrf_secret;
    const token = req.headers['x-csrf-token'] as string;
    
    if (!secret || !token || !tokens.verify(secret, token)) {
      return res.status(403).json({ message: 'Invalid CSRF token', code: CSRF_ERROR_CODE });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Honeypot check
    if (req.body.website) {
      // This is likely a bot, return a success response to not alert them
      return res.status(200).json({ message: 'Solicitud enviada con éxito.' });
    }

    // Validate and parse the request body
    const validationResult = leadFormSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Datos inválidos.', 
        errors: validationResult.error.flatten().fieldErrors 
      });
    }

    const {
      nombre,
      email,
      telefono,
      tipoSeguro,
      mensaje,
    } = validationResult.data;

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME;
    const notificationRecipients = getNotificationEmails('asesoria');

    if (!apiKey || !senderEmail || !senderName) {
      console.error('Missing environment variables for email sending');
      return res.status(500).json({ message: 'Server configuration error for sending email.' });
    }

    // Sanitize inputs to prevent XSS
    const sanitizedNombre = DOMPurifyInstance.sanitize(nombre);
    const sanitizedMensaje = DOMPurifyInstance.sanitize(mensaje || '');

    const subject = `Nuevo Lead de Asesoría: ${sanitizedNombre}`;
    
    // Get the base URL from the request
    const baseUrl = req.headers.host ? `https://${req.headers.host}` : undefined;
    
    // Use the new email template
    const htmlContent = LeadTemplate({
      nombre: sanitizedNombre,
      email,
      telefono,
      tipoSeguro,
      mensaje: sanitizedMensaje
    }, false, baseUrl);

    const brevoPayload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: notificationRecipients,
      subject,
      htmlContent,
    };

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json();
      console.error('Brevo API Error:', brevoResponse.status, errorData);
      return res.status(brevoResponse.status).json({
        message: 'Error sending email via Brevo.',
        details: errorData,
      });
    }

    // If the response is OK (2xx status), we can assume success.
    const responseData = await brevoResponse.json();

    // Brevo API typically returns 201 Created. A 200 response here confirms receipt.
    return res.status(200).json({ 
        message: 'Solicitud enviada con éxito.', 
        data: responseData 
    });

  } catch (error) {
    console.error('Error in send-email handler:', error);
    let errorMessage = 'Internal server error.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return res.status(500).json({ message: errorMessage });
  }
}

// Export the handler with rate limiting applied
export default withRateLimit(rateLimitConfigs.forms, handler);
