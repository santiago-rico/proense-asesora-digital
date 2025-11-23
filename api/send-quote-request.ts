import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendTransactionalEmail } from '../src/utils/brevo.js';
import { z } from 'zod';
import { JSDOM } from 'jsdom';
import { withRateLimit, rateLimitConfigs } from './utils/rate-limiter.js';

// Defines the expected structure of the quote request data
interface QuoteRequestData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  birthDate: {
    day: string;
    month: string;
    year: string;
  };
  phoneNumber: string;
  email: string;
  cedula: string;
  city: string;
  address: string;
  employmentStatus: string;

  // Step 2: Insurance Selection
  insuranceType: string;

  // Step 3: Conditional Fields - Vida
  monthlyIncome?: string;
  maritalStatus?: string;
  hasChildren?: 'si' | 'no' | '';

  // Step 3: Conditional Fields - Auto
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;

  // Step 3: Conditional Fields - Hogar
  propertyType?: string;
  propertyValue?: string;

  // Step 3: Conditional Fields - Salud
  preExistingConditions?: string;

  // Step 3: Conditional Fields - Mascotas
  petType?: string;
  petName?: string;
  petAge?: string;

  // Step 4: Additional Information
  previousInsurance: boolean;
  previousInsurer?: string;
  claimsHistory?: string;
  additionalComments?: string;

  // Step 5: Terms
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing?: boolean;

  // Honeypot
  website?: string;

  // Allow other fields
  [key: string]: string | boolean | { day: string; month: string; year: string } | undefined;
}

// Backend validation schema
const backendSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'El nombre es requerido').max(100).transform(str => str.trim()),
  lastName: z.string().min(1, 'El apellido es requerido').max(100).transform(str => str.trim()),
  birthDate_day: z.string().regex(/^(0?[1-9]|[12][0-9]|3[01])$/, 'Día inválido'),
  birthDate_month: z.string().min(1, 'Mes requerido'),
  birthDate_year: z.string().regex(/^(19|20)\d{2}$/, 'Año inválido'),
  phoneNumber: z.string().min(10, 'Número de teléfono inválido').transform(str => str.trim()),
  email: z.string().email('Correo electrónico inválido').transform(str => str.trim().toLowerCase()),
  cedula: z.string().min(1, 'Número de cédula requerido').regex(/^\d+$/, 'Solo números permitidos').transform(str => str.trim()),
  city: z.string().min(1, 'Ciudad requerida').transform(str => str.trim()),
  address: z.string().min(1, 'Dirección requerida').transform(str => str.trim()),
  employmentStatus: z.enum(['empleado', 'independiente', 'desempleado', 'pensionado', 'estudiante']),

  // Insurance Information
  insuranceType: z.enum(['vida', 'auto', 'hogar', 'salud', 'mascotas']),

  // Conditional fields
  monthlyIncome: z.string().transform(str => str.trim()).optional(),
  maritalStatus: z.string().transform(str => str.trim()).optional(),
  hasChildren: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  vehicleMake: z.string().transform(str => str.trim()).optional(),
  vehicleModel: z.string().transform(str => str.trim()).optional(),
  vehicleYear: z.string().transform(str => str.trim()).optional(),
  propertyType: z.string().transform(str => str.trim()).optional(),
  propertyValue: z.string().transform(str => str.trim()).optional(),
  preExistingConditions: z.string().transform(str => str.trim()).optional(),
  petType: z.string().transform(str => str.trim()).optional(),
  petName: z.string().transform(str => str.trim()).optional(),
  petAge: z.string().transform(str => str.trim()).optional(),

  // Additional Information
  previousInsurance: z.enum(['true', 'false']).transform(val => val === 'true'),
  previousInsurer: z.string().transform(str => str.trim()).optional(),
  claimsHistory: z.string().transform(str => str.trim()).optional(),
  additionalComments: z.string().transform(str => str.trim()).optional(),

  // Terms
  acceptTerms: z.enum(['true', 'false']).transform(val => val === 'true'),
  acceptPrivacy: z.enum(['true', 'false']).transform(val => val === 'true'),
  acceptMarketing: z.enum(['true', 'false', '']).transform(val => val === 'true').optional(),

  // Honeypot field
  website: z.string().optional(),
});

async function QuoteRequestTemplate(
  data: QuoteRequestData,
  isUserEmail: boolean,
  isDarkMode: boolean = false,
  baseUrl?: string
): Promise<string> {
  const { BaseTemplate } = await import('../src/utils/email-templates/BaseTemplate.js');
  const {
    Heading,
    Paragraph,
    Alert,
    Card,
    DataTable,
    Spacer,
    BulletList,
    Divider,
  } = await import('../src/utils/email-templates/EmailComponents.js');

  const insuranceTypeMap: Record<string, string> = {
    vida: 'Seguro de Vida',
    salud: 'Seguro de Salud',
    auto: 'Seguro de Auto',
    hogar: 'Seguro de Hogar',
    mascotas: 'Seguro de Mascotas',
  };

  const employmentStatusMap: Record<string, string> = {
    empleado: 'Empleado',
    independiente: 'Independiente',
    desempleado: 'Desempleado',
    pensionado: 'Pensionado',
    estudiante: 'Estudiante',
  };

  const formattedInsuranceType = insuranceTypeMap[data.insuranceType] || data.insuranceType;
  const fullName = `${data.firstName} ${data.lastName}`;
  const birthDateFormatted = `${data.birthDate.day}/${data.birthDate.month}/${data.birthDate.year}`;

  if (isUserEmail) {
    // User confirmation email
    const preheader = `Confirmación de tu solicitud de cotización para ${formattedInsuranceType}`;

    const content = `
      ${Alert({
        type: 'success',
        title: '¡Solicitud Recibida!',
        message: 'Hemos recibido tu solicitud de cotización. Un asesor se pondrá en contacto contigo pronto.',
        isDarkMode,
      })}

      ${Spacer({ height: 'md' })}

      ${Paragraph({
        text: `Hola ${data.firstName},`,
        isDarkMode,
      })}

      ${Paragraph({
        text: 'Gracias por confiar en Proense Seguros para tu solicitud de cotización. Hemos recibido tu información y uno de nuestros asesores especializados la está revisando.',
        isDarkMode,
      })}

      ${Spacer({ height: 'md' })}

      ${Heading({ level: 2, text: 'Resumen de tu Solicitud', isDarkMode })}

      ${Card({
        content: DataTable({
          rows: [
            { label: 'Tipo de Seguro', value: formattedInsuranceType, isHighlighted: true },
            { label: 'Nombre Completo', value: fullName },
            { label: 'Correo Electrónico', value: data.email },
            { label: 'Teléfono', value: data.phoneNumber },
            { label: 'Ciudad', value: data.city },
          ],
          isDarkMode,
        }),
        isDarkMode,
        noPadding: true,
      })}

      ${Spacer({ height: 'lg' })}

      ${Divider({ isDarkMode })}

      ${Heading({ level: 3, text: '¿Qué Sigue?', isDarkMode })}

      ${BulletList({
        items: [
          'Un asesor especializado revisará tu solicitud',
          'Te contactaremos dentro de las próximas 24 horas hábiles',
          'Recibirás cotizaciones comparativas de múltiples aseguradoras',
          'Te ayudaremos a elegir la mejor opción para tus necesidades',
        ],
        isDarkMode,
        icon: '✓',
      })}

      ${Spacer({ height: 'md' })}

      ${Paragraph({
        text: 'Si tienes alguna pregunta, no dudes en contactarnos.',
        isDarkMode,
        isLast: true,
      })}
    `;

    return BaseTemplate({ preheader, content, isDarkMode, baseUrl });
  } else {
    // Agent notification email
    const preheader = `Nueva solicitud de cotización de ${fullName} - ${formattedInsuranceType}`;

    const basicInfoRows = [
      { label: 'Nombre Completo', value: fullName, isHighlighted: true },
      { label: 'Correo Electrónico', value: data.email },
      { label: 'Teléfono', value: data.phoneNumber },
      { label: 'Cédula', value: data.cedula },
      { label: 'Fecha de Nacimiento', value: birthDateFormatted },
      { label: 'Ciudad', value: data.city },
      { label: 'Dirección', value: data.address },
      { label: 'Situación Laboral', value: employmentStatusMap[data.employmentStatus] || data.employmentStatus },
    ];

    const insuranceInfoRows = [
      { label: 'Tipo de Seguro', value: formattedInsuranceType, isHighlighted: true },
    ];

    // Add conditional fields based on insurance type
    if (data.insuranceType === 'vida') {
      if (data.monthlyIncome) insuranceInfoRows.push({ label: 'Ingresos Mensuales', value: data.monthlyIncome });
      if (data.maritalStatus) insuranceInfoRows.push({ label: 'Estado Civil', value: data.maritalStatus });
      if (data.hasChildren) insuranceInfoRows.push({ label: 'Tiene Hijos', value: data.hasChildren === 'si' ? 'Sí' : 'No' });
    } else if (data.insuranceType === 'auto') {
      if (data.vehicleMake) insuranceInfoRows.push({ label: 'Marca del Vehículo', value: data.vehicleMake });
      if (data.vehicleModel) insuranceInfoRows.push({ label: 'Modelo del Vehículo', value: data.vehicleModel });
      if (data.vehicleYear) insuranceInfoRows.push({ label: 'Año del Vehículo', value: data.vehicleYear });
    } else if (data.insuranceType === 'hogar') {
      if (data.propertyType) insuranceInfoRows.push({ label: 'Tipo de Propiedad', value: data.propertyType });
      if (data.propertyValue) insuranceInfoRows.push({ label: 'Valor de la Propiedad', value: data.propertyValue });
    } else if (data.insuranceType === 'salud') {
      if (data.preExistingConditions) insuranceInfoRows.push({ label: 'Condiciones Preexistentes', value: data.preExistingConditions });
    } else if (data.insuranceType === 'mascotas') {
      if (data.petType) insuranceInfoRows.push({ label: 'Tipo de Mascota', value: data.petType });
      if (data.petName) insuranceInfoRows.push({ label: 'Nombre de la Mascota', value: data.petName });
      if (data.petAge) insuranceInfoRows.push({ label: 'Edad de la Mascota', value: `${data.petAge} años` });
    }

    const additionalInfoRows = [
      { label: 'Ha tenido seguro anteriormente', value: data.previousInsurance ? 'Sí' : 'No' },
    ];

    if (data.previousInsurance && data.previousInsurer) {
      additionalInfoRows.push({ label: 'Aseguradora Anterior', value: data.previousInsurer });
    }

    if (data.claimsHistory) {
      additionalInfoRows.push({ label: 'Historial de Reclamaciones', value: data.claimsHistory });
    }

    const content = `
      ${Alert({
        type: 'info',
        title: 'Nueva Solicitud de Cotización',
        message: 'Se ha recibido una nueva solicitud de cotización a través del formulario web.',
        isDarkMode,
      })}

      ${Spacer({ height: 'md' })}

      ${Heading({ level: 2, text: 'Información Personal del Solicitante', isDarkMode })}

      ${Card({
        content: DataTable({ rows: basicInfoRows, isDarkMode }),
        isDarkMode,
        noPadding: true,
      })}

      ${Spacer({ height: 'md' })}

      ${Heading({ level: 2, text: 'Información del Seguro Solicitado', isDarkMode })}

      ${Card({
        content: DataTable({ rows: insuranceInfoRows, isDarkMode }),
        isDarkMode,
        noPadding: true,
      })}

      ${Spacer({ height: 'md' })}

      ${Heading({ level: 2, text: 'Información Adicional', isDarkMode })}

      ${Card({
        content: DataTable({ rows: additionalInfoRows, isDarkMode }),
        isDarkMode,
        noPadding: true,
      })}

      ${data.additionalComments ? `
        ${Spacer({ height: 'md' })}

        ${Heading({ level: 3, text: 'Comentarios Adicionales del Cliente', isDarkMode })}

        ${Card({
          content: `
            ${Paragraph({ text: data.additionalComments, isDarkMode, isLast: true })}
          `,
          isDarkMode,
        })}
      ` : ''}

      ${Spacer({ height: 'lg' })}

      ${Divider({ isDarkMode })}

      ${Heading({ level: 3, text: 'Próximos Pasos', isDarkMode })}

      ${BulletList({
        items: [
          'Contactar al cliente dentro de las próximas 24 horas hábiles',
          'Solicitar información adicional específica según el tipo de seguro',
          'Preparar cotizaciones comparativas de múltiples aseguradoras',
          'Presentar las opciones al cliente y hacer seguimiento hasta el cierre',
        ],
        isDarkMode,
        icon: '→',
      })}

      ${Spacer({ height: 'md' })}
    `;

    return BaseTemplate({ preheader, content, isDarkMode, baseUrl });
  }
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Dynamic imports for security modules
    const dompurifyModule = await import('dompurify');
    const DOMPurify = typeof dompurifyModule.default === 'function' ? dompurifyModule.default : dompurifyModule;
    const { parse } = await import('cookie');
    const { default: Tokens } = (await import('csrf')) as unknown as {
      default: new () => { verify: (secret: string, token: string) => boolean };
    };
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

    const rawFormData = req.body as Record<string, string>;

    // Check honeypot field first
    if (rawFormData.website && rawFormData.website.length > 0) {
      // Silently accept but don't process spam submissions
      return res.status(200).json({
        message: 'Solicitud enviada con éxito.',
        data: { messageId: 'spam-filtered' },
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

    const validatedData = validationResult.data;

    // Reconstruct birthDate object
    const formData: QuoteRequestData = {
      ...validatedData,
      birthDate: {
        day: validatedData.birthDate_day,
        month: validatedData.birthDate_month,
        year: validatedData.birthDate_year,
      },
    };

    // Sanitize all text fields to prevent XSS
    const sanitizedData: QuoteRequestData = {
      firstName: DOMPurifyInstance.sanitize(formData.firstName),
      lastName: DOMPurifyInstance.sanitize(formData.lastName),
      birthDate: {
        day: DOMPurifyInstance.sanitize(formData.birthDate.day),
        month: DOMPurifyInstance.sanitize(formData.birthDate.month),
        year: DOMPurifyInstance.sanitize(formData.birthDate.year),
      },
      phoneNumber: DOMPurifyInstance.sanitize(formData.phoneNumber),
      email: DOMPurifyInstance.sanitize(formData.email),
      cedula: DOMPurifyInstance.sanitize(formData.cedula),
      city: DOMPurifyInstance.sanitize(formData.city),
      address: DOMPurifyInstance.sanitize(formData.address),
      employmentStatus: DOMPurifyInstance.sanitize(formData.employmentStatus),
      insuranceType: DOMPurifyInstance.sanitize(formData.insuranceType),
      monthlyIncome: formData.monthlyIncome ? DOMPurifyInstance.sanitize(formData.monthlyIncome) : undefined,
      maritalStatus: formData.maritalStatus ? DOMPurifyInstance.sanitize(formData.maritalStatus) : undefined,
      hasChildren: formData.hasChildren as 'si' | 'no' | '' | undefined,
      vehicleMake: formData.vehicleMake ? DOMPurifyInstance.sanitize(formData.vehicleMake) : undefined,
      vehicleModel: formData.vehicleModel ? DOMPurifyInstance.sanitize(formData.vehicleModel) : undefined,
      vehicleYear: formData.vehicleYear ? DOMPurifyInstance.sanitize(formData.vehicleYear) : undefined,
      propertyType: formData.propertyType ? DOMPurifyInstance.sanitize(formData.propertyType) : undefined,
      propertyValue: formData.propertyValue ? DOMPurifyInstance.sanitize(formData.propertyValue) : undefined,
      preExistingConditions: formData.preExistingConditions
        ? DOMPurifyInstance.sanitize(formData.preExistingConditions)
        : undefined,
      petType: formData.petType ? DOMPurifyInstance.sanitize(formData.petType) : undefined,
      petName: formData.petName ? DOMPurifyInstance.sanitize(formData.petName) : undefined,
      petAge: formData.petAge ? DOMPurifyInstance.sanitize(formData.petAge) : undefined,
      previousInsurance: formData.previousInsurance,
      previousInsurer: formData.previousInsurer ? DOMPurifyInstance.sanitize(formData.previousInsurer) : undefined,
      claimsHistory: formData.claimsHistory ? DOMPurifyInstance.sanitize(formData.claimsHistory) : undefined,
      additionalComments: formData.additionalComments
        ? DOMPurifyInstance.sanitize(formData.additionalComments)
        : undefined,
      acceptTerms: formData.acceptTerms,
      acceptPrivacy: formData.acceptPrivacy,
      acceptMarketing: formData.acceptMarketing,
    };

    const senderName = process.env.BREVO_SENDER_NAME || 'Proense Asesora Digital';
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@proense.co';
    const agentEmail = process.env.AGENT_EMAIL || 'comercial@proense.co';

    // Get the base URL from the request
    const baseUrl = req.headers.host ? `https://${req.headers.host}` : undefined;

    const insuranceTypeMap: Record<string, string> = {
      vida: 'Seguro de Vida',
      salud: 'Seguro de Salud',
      auto: 'Seguro de Auto',
      hogar: 'Seguro de Hogar',
      mascotas: 'Seguro de Mascotas',
    };

    const formattedInsuranceType = insuranceTypeMap[sanitizedData.insuranceType] || sanitizedData.insuranceType;

    // 1. Email to User
    const userEmailSubject = `Confirmación de Solicitud de Cotización - Proense Seguros`;
    const userEmailHtmlContent = await QuoteRequestTemplate(sanitizedData, true, false, baseUrl);

    const userBrevoPayload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: sanitizedData.email, name: `${sanitizedData.firstName} ${sanitizedData.lastName}` }],
      subject: userEmailSubject,
      htmlContent: userEmailHtmlContent,
    };

    // 2. Email to Agent
    const agentEmailSubject = `Nueva Solicitud de Cotización - ${formattedInsuranceType}`;
    const agentEmailHtmlContent = await QuoteRequestTemplate(sanitizedData, false, false, baseUrl);

    const agentBrevoPayload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: agentEmail, name: 'Agente Proense' }],
      subject: agentEmailSubject,
      htmlContent: agentEmailHtmlContent,
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

    return res.status(200).json({ message: 'Solicitud de cotización enviada con éxito.' });
  } catch (error) {
    console.error('Error processing quote request:', error);
    let errorMessage = 'Error interno del servidor.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(500).json({ message: errorMessage });
  }
}

// Export the handler with rate limiting applied
export default withRateLimit(rateLimitConfigs.forms, handler);
