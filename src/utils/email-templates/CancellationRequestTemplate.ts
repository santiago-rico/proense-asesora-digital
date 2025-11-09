import { BaseTemplate } from './BaseTemplate.js';
import { 
  Heading, 
  Paragraph, 
  Button,
  Alert, 
  Card, 
  DataTable, 
  IconText, 
  Spacer,
  StatusBadge,
  Divider,
  DataTableRow
} from './EmailComponents.js';

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
}

interface AttachedFiles {
  [key: string]: string[];
}

interface EmailTemplateProps {
  data: CancellationData;
  attachedFiles: AttachedFiles;
  isUserEmail: boolean;
  isDarkMode?: boolean;
  baseUrl?: string;
}

export function CancellationRequestTemplate({ 
  data, 
  attachedFiles, 
  isUserEmail, 
  isDarkMode = false,
  baseUrl
}: EmailTemplateProps): string {
  const preheader = isUserEmail 
    ? `Confirmación de tu solicitud de cancelación - ${data.nombreAseguradora}`
    : `Solicitud de cancelación: ${data.nombreCompleto}`;
  
  // Format insurance type
  const insuranceTypeMap: Record<string, string> = {
    vida: 'Seguro de Vida',
    salud: 'Seguro de Salud',
    auto: 'Seguro de Auto',
    hogar: 'Seguro de Hogar',
    empresarial: 'Seguro Empresarial',
    rentas: 'Seguro de Rentas',
    'vida-deudores': 'Vida Deudores',
    otro: data.otroSeguro || 'Otro tipo de seguro',
  };
  
  const formattedInsuranceType = insuranceTypeMap[data.tipoSeguro] || data.tipoSeguro;
  
  // Build data rows
  const buildDataRows = (): DataTableRow[] => {
    const rows: DataTableRow[] = [
      { label: 'Nombre Completo', value: data.nombreCompleto, isHighlighted: true },
      { label: 'Número de Cédula', value: data.numeroCedula },
      { label: 'Teléfono', value: data.telefono },
      { label: 'Correo Electrónico', value: data.email },
      { label: 'Aseguradora', value: data.nombreAseguradora, isHighlighted: true },
    ];
    
    if (data.numeroPoliza) {
      rows.push({ label: 'Número de Póliza', value: data.numeroPoliza });
    }
    
    rows.push({ label: 'Tipo de Seguro', value: formattedInsuranceType });
    
    if (data.cancellationReason) {
      rows.push({ 
        label: 'Motivo de Cancelación', 
        value: data.cancellationReason,
        isHighlighted: true
      });
    }
    
    // Add attached files
    Object.entries(attachedFiles).forEach(([key, files]) => {
      if (files.length > 0) {
        rows.push({ 
          label: '📎 Documentos Adjuntos', 
          value: files.join(', '),
          isHighlighted: true
        });
      }
    });
    
    return rows;
  };
  
  const userContent = `
    ${Heading({ level: 1, text: 'Confirmación de tu solicitud de cancelación', isDarkMode, align: 'center' })}
    
    ${Spacer({ height: 'md' })}
    
    ${Paragraph({ 
      text: `Hola ${data.nombreCompleto},`, 
      isDarkMode 
    })}
    
    ${Paragraph({ 
      text: 'Hemos recibido tu solicitud para cancelar tu póliza. A continuación, encontrarás un resumen de la información que nos proporcionaste:', 
      isDarkMode 
    })}
    
    ${Spacer({ height: 'md' })}
    
    ${Card({
      content: DataTable({ rows: buildDataRows(), isDarkMode }),
      isDarkMode,
      noPadding: true
    })}
    
    ${Spacer({ height: 'lg' })}
    
    ${Alert({
      type: 'danger',
      title: '⚠️ Acción Requerida',
      message: 'Para hacer efectiva esta cancelación, por favor, responde a este correo electrónico escribiendo únicamente:',
      isDarkMode
    })}
    
    ${Card({
      content: `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="center" style="padding: 20px; background-color: #f8d7da; border-radius: 8px;">
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #721c24;">
                "Confirmo la solicitud de cancelación"
              </p>
            </td>
          </tr>
        </table>
      `,
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    ${Paragraph({ 
      text: 'Una vez recibamos tu confirmación, uno de nuestros asesores procesará tu solicitud y se pondrá en contacto contigo.', 
      isDarkMode 
    })}
    
    ${Spacer({ height: 'lg' })}
    
    ${Card({
      content: `
        ${Heading({ level: 3, text: '❓ ¿Cambiste de opinión?', isDarkMode })}
        ${Paragraph({ 
          text: 'Si no deseas proceder con la cancelación o si no realizaste esta solicitud, simplemente ignora este mensaje y tu póliza continuará activa.', 
          isDarkMode,
          isLast: true
        })}
      `,
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    ${Divider({ isDarkMode })}
    
    ${Spacer({ height: 'md' })}
    
    ${Paragraph({ 
      text: 'Para cualquier consulta adicional, no dudes en contactarnos:', 
      isDarkMode 
    })}
    
    ${IconText({ icon: '📞', text: '+57 315 586 2884', isDarkMode })}
    ${IconText({ icon: '✉️', text: 'comercial@proense.co', isDarkMode })}
  `;
  
  const agentContent = `
    ${Alert({
      type: 'warning',
      title: 'Nueva Solicitud de Cancelación de Póliza',
      message: 'Se ha recibido una nueva solicitud de cancelación a través del formulario de servicio al cliente.',
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center">
          ${StatusBadge({ text: 'Pendiente de Confirmación', type: 'danger', isDarkMode })}
        </td>
      </tr>
    </table>
    
    ${Spacer({ height: 'lg' })}
    
    ${Heading({ level: 2, text: 'Detalles de la Solicitud', isDarkMode })}
    
    ${Card({
      content: DataTable({ rows: buildDataRows(), isDarkMode }),
      isDarkMode,
      noPadding: true
    })}
    
    ${Spacer({ height: 'lg' })}
    
    ${Card({
      content: `
        ${Heading({ level: 3, text: '⚠️ IMPORTANTE', isDarkMode })}
        ${Paragraph({ 
          text: 'Se ha enviado un correo al cliente solicitando su confirmación explícita. <strong>NO PROCESAR</strong> la cancelación hasta recibir la confirmación del cliente respondiendo con el texto exacto:', 
          isDarkMode 
        })}
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 16px 0;">
          <tr>
            <td align="center" style="padding: 16px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
              <p style="margin: 0; font-weight: bold; color: #856404;">
                "Confirmo la solicitud de cancelación"
              </p>
            </td>
          </tr>
        </table>
        
        ${Paragraph({ 
          text: 'Una vez recibida la confirmación:', 
          isDarkMode 
        })}
        
        <ol style="margin: 16px 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Verificar que el correo de confirmación provenga del mismo email registrado</li>
          <li style="margin-bottom: 8px;">Procesar la cancelación según los procedimientos de la aseguradora</li>
          <li style="margin-bottom: 8px;">Confirmar al cliente cuando la cancelación esté completada</li>
          <li style="margin-bottom: 8px;">Documentar el proceso en el sistema</li>
        </ol>
      `,
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td>
          ${Button({
            href: `mailto:${data.email}?subject=Re: Solicitud de Cancelación - ${data.nombreAseguradora}`,
            text: 'Contactar Cliente',
            variant: 'primary',
            isDarkMode
          })}
        </td>
        <td align="right">
          ${Button({
            href: '#',
            text: 'Ver en CRM',
            variant: 'secondary',
            isDarkMode
          })}
        </td>
      </tr>
    </table>
    
    ${Spacer({ height: 'lg' })}
    
    ${Divider({ isDarkMode })}
    
    ${Spacer({ height: 'md' })}
    
    ${Heading({ level: 3, text: 'Datos de Contacto del Cliente', isDarkMode })}
    
    ${IconText({ icon: '👤', text: data.nombreCompleto, isDarkMode })}
    ${IconText({ icon: '📞', text: data.telefono, isDarkMode })}
    ${IconText({ icon: '✉️', text: data.email, isDarkMode })}
  `;
  
  const content = isUserEmail ? userContent : agentContent;
  
  return BaseTemplate({ preheader, content, isDarkMode, baseUrl });
}