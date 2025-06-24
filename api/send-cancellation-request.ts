import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendTransactionalEmail } from '../src/utils/brevo.js';
import formidable from 'formidable';
import fs from 'fs';

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
  [key: string]: any;
}

function formatDataToHtml(data: Omit<CancellationData, 'documentosAdicionales'>, attachedFiles: Record<string, string[]>): string {
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
    if (key === 'aceptaTerminosYPolitica' || !value) continue;
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
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }
            resolve({ fields, files });
        });
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const tempFilePaths: string[] = [];

    try {
        const { fields, files } = await parseForm(req);

        const formData: CancellationData = {
            nombreCompleto: fields.nombreCompleto?.[0] || '',
            numeroCedula: fields.numeroCedula?.[0] || '',
            telefono: fields.telefono?.[0] || '',
            email: fields.email?.[0] || '',
            nombreAseguradora: fields.nombreAseguradora?.[0] || '',
            numeroPoliza: fields.numeroPoliza?.[0] || '',
            tipoSeguro: fields.tipoSeguro?.[0] || '',
            otroSeguro: fields.otroSeguro?.[0],
            cancellationReason: fields.cancellationReason?.[0] || 'No especificado',
            aceptaTerminosYPolitica: fields.aceptaTerminosYPolitica?.[0] === 'true',
        };

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
                        const fileContent = fs.readFileSync(file.filepath);
                        attachments.push({ name: file.originalFilename || 'adjunto', content: fileContent.toString('base64') });
                        
                        if (!attachedFileNames[key]) {
                            attachedFileNames[key] = [];
                        }
                        attachedFileNames[key].push(file.originalFilename || 'adjunto');
                        tempFilePaths.push(file.filepath);
                    }
                }
            }
        }

        const senderName = process.env.BREVO_SENDER_NAME || 'Proense Asesora Digital';
        const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@proense.co';
        const agentEmail = process.env.AGENT_EMAIL || 'comercial@proense.co';

        const formattedDataHtml = formatDataToHtml(formData, attachedFileNames);

        // Email to Client
        const clientEmailHtmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #003366;">Confirmación de tu solicitud de cancelación</h1>
                <p>Hola ${formData.nombreCompleto},</p>
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
                    <li><strong>Nombre:</strong> ${formData.nombreCompleto}</li>
                    <li><strong>Email:</strong> ${formData.email}</li>
                    <li><strong>Teléfono:</strong> ${formData.telefono}</li>
                </ul>
                <p><strong>Nota:</strong> Se ha enviado un correo al cliente solicitando su confirmación explícita para proceder. Por favor, espera la confirmación antes de procesar la cancelación.</p>
            </div>
        `;

        await sendTransactionalEmail({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: formData.email, name: formData.nombreCompleto }],
            subject: 'Confirma tu Solicitud de Cancelación de Póliza',
            htmlContent: clientEmailHtmlContent,
        });

        await sendTransactionalEmail({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: agentEmail, name: 'Agente Proense' }],
            subject: `Solicitud de Cancelación: ${formData.nombreCompleto}`,
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
            if (errorMessage.includes("excede el tamaño máximo") || errorMessage.includes("no es válido")) {
                statusCode = 400;
            }
        }
        return res.status(statusCode).json({ message: errorMessage });
    } finally {
        for (const path of tempFilePaths) {
            fs.unlink(path, (err) => {
                if (err) console.error(`Failed to delete temporary file: ${path}`, err);
            });
        }
    }
}
