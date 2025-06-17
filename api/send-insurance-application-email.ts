// IMPORTANT: You must install formidable: npm install formidable
// And for types: npm install -D @types/formidable
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendTransactionalEmail } from '../src/utils/brevo.js';
import formidable from 'formidable';
import fs from 'fs';

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
  [key: string]: any;
}

// Helper function to format form data as HTML for emails
function formatDataToHtml(
  data: Omit<InsuranceApplicationData, 'fotoCedula' | 'documentosBeneficiarios' | 'certificadoLibertad' | 'tarjetaPropiedad' | 'fotoCedulaRepLegal' | 'rut' | 'camaraComercio' | 'contratoArrendamiento' | 'archivoDeclaracionRenta'>,
  attachedFiles: Record<string, string[]>
): string {
  let html = '<h2>Detalles de la Solicitud de Seguro:</h2>';
  
  const fieldLabels: Record<string, string> = {
    nombreCompleto: 'Nombre Completo',
    telefono: 'Teléfono',
    email: 'Email',
    tipoSeguro: 'Tipo de Seguro',
    metodoPago: 'Método de Pago',
    periodicidadPago: 'Periodicidad de Pago',
    numeroCedula: 'Número de Cédula (Tomador)',
    fotoCedula: 'Foto Cédula (Tomador)',
    beneficiarios: 'Nombres de Beneficiarios y Porcentajes (Seguro de Vida)',
    documentosBeneficiarios: 'Documentos de Identidad Beneficiarios (Seguro de Vida)',
    listaBeneficiarios: 'Lista de Beneficiarios (Seguro de Salud)',
    certificadoLibertad: 'Certificado de Libertad y Tradición (Seguro de Hogar)',
    tarjetaPropiedad: 'Tarjeta de Propiedad (Seguro de Auto)',
    numeroCedulaRepLegal: 'Número de Cédula (Representante Legal - Empresarial)',
    fotoCedulaRepLegal: 'Foto Cédula (Representante Legal - Empresarial)',
    nit: 'NIT (Empresarial)',
    rut: 'RUT (Empresarial)',
    camaraComercio: 'Cámara de Comercio (Empresarial)',
    contratoArrendamiento: 'Contrato de Arrendamiento (Seguro de Rentas)',
    tieneEnfermedadesDiagnosticadas: '¿Tiene enfermedades preexistentes diagnosticadas? (Vida Crédito Protegido)',
    enfermedadesEspecificar: 'Especificar enfermedades (Vida Crédito Protegido)',
    valorActualDeuda: 'Valor Actual de la Deuda (Vida Crédito Protegido)',
    conduceMoto: '¿Conduce motocicleta? (Vida Crédito Protegido)',
    declaraRenta: '¿Declara Renta?',
    archivoDeclaracionRenta: 'Archivo Declaración de Renta',
    ingresosNoDeclarante: 'Ingresos Anuales (No Declarante)',
    egresosNoDeclarante: 'Egresos Anuales (No Declarante)',
    activosNoDeclarante: 'Activos (No Declarante)',
    pasivosNoDeclarante: 'Pasivos (No Declarante)',
    aceptaTerminosYPolitica: 'Acepta Términos, Condiciones y Política de Privacidad',
  };

  html += '<table style="width: 100%; border-collapse: collapse;">';

  // Define an order for fields to appear in the email, if desired
  const orderedKeys = [
    'nombreCompleto', 'telefono', 'email', 'tipoSeguro', 'metodoPago', 'periodicidadPago',
    'numeroCedula', 'fotoCedula', 'beneficiarios', 'documentosBeneficiarios', 'listaBeneficiarios',
    'certificadoLibertad', 'tarjetaPropiedad', 'numeroCedulaRepLegal', 'fotoCedulaRepLegal',
    'nit', 'rut', 'camaraComercio', 'contratoArrendamiento', 'tieneEnfermedadesDiagnosticadas',
    'enfermedadesEspecificar', 'valorActualDeuda', 'conduceMoto', 'declaraRenta',
    'archivoDeclaracionRenta', 'ingresosNoDeclarante', 'egresosNoDeclarante',
    'activosNoDeclarante', 'pasivosNoDeclarante', 'aceptaTerminosYPolitica'
  ];

  // Add any keys from data that are not in orderedKeys (e.g., dynamic fields)
  const allKeys = [...orderedKeys, ...Object.keys(data).filter(k => !orderedKeys.includes(k))];
  const uniqueKeys = Array.from(new Set(allKeys)); // Ensure uniqueness

  for (const key of orderedKeys) {
    const label = fieldLabels[key];
    const value = (data as any)[key];

    if (value === undefined || value === null || value === '') {
        // For non-file fields, if they are empty, don't render them.
        // We check for attachedFiles separately.
        if (!Object.keys(attachedFiles).includes(key)) {
            continue;
        }
    }

    html += `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${label}</strong></td>`;

    if (attachedFiles[key] && attachedFiles[key].length > 0) {
      html += `<td style="padding: 8px; border: 1px solid #ddd;">${attachedFiles[key].join(', ')} (Adjunto)</td>`;
    } else if (typeof value === 'boolean') {
      html += `<td style="padding: 8px; border: 1px solid #ddd;">${value ? 'Sí' : 'No'}</td>`;
    } else if (value !== undefined && value !== null && value !== '') { // More robust check for actual value
      html += `<td style="padding: 8px; border: 1px solid #ddd;">${String(value).replace(/\n/g, '<br>')}</td>`;
    } else { // Handles undefined, null, or empty string for non-file, non-boolean fields
      html += `<td style="padding: 8px; border: 1px solid #ddd;">No proporcionado</td>`;
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

const parseForm = (
  req: VercelRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req, (err: any, fields: formidable.Fields, files: formidable.Files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);

    const formData: any = {};
    for (const key in fields) {
      if (fields[key]) {
        formData[key] = fields[key]?.[0];
      }
    }
    // Convert boolean string back to boolean
    if (formData.aceptaTerminosYPolitica) {
        formData.aceptaTerminosYPolitica = formData.aceptaTerminosYPolitica === 'true';
    }

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
          // Clean up the temporary file
          fs.unlinkSync(file.filepath);
        }
      }
    }

    const senderName = process.env.BREVO_SENDER_NAME || 'Proense Asesora Digital';
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@proense.co';
    const agentEmail = process.env.AGENT_EMAIL || 'comercial@proense.co';

    const formattedDataHtml = formatDataToHtml(formData, attachedFileNames);

    // 1. Email to User
    const userEmailSubject = `Confirmación de tu solicitud de seguro: ${formData.tipoSeguro}`;
    const userEmailHtmlContent = `
      <h1>¡Gracias por tu solicitud, ${formData.nombreCompleto}!</h1>
      <p>Hemos recibido tu solicitud para un ${formData.tipoSeguro}. Un asesor se pondrá en contacto contigo pronto.</p>
      <p>Por favor, revisa los detalles que enviaste:</p>
      ${formattedDataHtml}
      <p>Si necesitas hacer algún cambio o tienes alguna pregunta, por favor responde a este correo o contáctanos al +57 315 586 2884 o comercial@proense.co.</p>
      <p><strong>Importante:</strong> Esta es una confirmación de recepción de tu solicitud. Un asesor revisará tu información y se pondrá en contacto contigo pronto para informarte sobre los siguientes pasos para la emisión de tu póliza. Es posible que se requieran documentos adicionales o una verificación.</p>
      <p>Atentamente,<br/>El equipo de Proense Asesora Digital</p>
    `;

    const userBrevoPayload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: formData.email, name: formData.nombreCompleto }],
      subject: userEmailSubject,
      htmlContent: userEmailHtmlContent,
    };

    // 2. Email to Agent
    const agentEmailSubject = `Nueva Solicitud de Póliza: ${formData.nombreCompleto} - ${formData.tipoSeguro}`;
    const agentEmailHtmlContent = `
      <h1>Nueva Solicitud de Póliza Recibida</h1>
      <p>Se ha recibido una nueva solicitud de seguro a través del formulario de emisión digital.</p>
      ${formattedDataHtml}
      <p><strong>Datos de Contacto del Solicitante:</strong></p>
      <ul>
        <li><strong>Nombre:</strong> ${formData.nombreCompleto}</li>
        <li><strong>Email:</strong> ${formData.email}</li>
        <li><strong>Teléfono:</strong> ${formData.telefono}</li>
      </ul>
    `;

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
    }

    const agentEmailResult = await sendTransactionalEmail(agentBrevoPayload);
    if (!agentEmailResult.success) {
      console.error('Failed to send email to agent:', agentEmailResult.error);
      return res.status(agentEmailResult.status || 500).json({
        message: 'Error enviando email de notificación al agente.',
        details: agentEmailResult.error,
      });
    }

    return res.status(200).json({ message: 'Solicitud enviada con éxito.' });

  } catch (error) {
    console.error('Error processing form submission:', error);
    let errorMessage = 'Error interno del servidor.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return res.status(500).json({ message: errorMessage });
  }
}
