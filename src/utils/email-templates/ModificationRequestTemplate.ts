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
}

interface AttachedFiles {
  [key: string]: string[];
}

interface EmailTemplateProps {
  data: ModificationData;
  attachedFiles: AttachedFiles;
  isUserEmail: boolean;
  isDarkMode?: boolean;
}

export function ModificationRequestTemplate({ 
  data, 
  attachedFiles, 
  isUserEmail, 
  isDarkMode = false 
}: EmailTemplateProps): string {
  const preheader = isUserEmail 
    ? `Confirmación de tu solicitud de modificación - ${data.nombreAseguradora}`
    : `Solicitud de modificación: ${data.nombreCompleto}`;
  
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
    
    rows.push({ 
      label: 'Modificaciones Solicitadas', 
      value: data.modificaciones,
      isHighlighted: true
    });
    
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
    ${Heading({ level: 1, text: 'Confirmación de tu solicitud de modificación', isDarkMode, align: 'center' })}
    
    ${Spacer({ height: 'md' })}
    
    ${Paragraph({ 
      text: `Hola ${data.nombreCompleto},`, 
      isDarkMode 
    })}
    
    ${Paragraph({ 
      text: 'Hemos recibido tu solicitud para modificar tu póliza. A continuación, encontrarás un resumen de la información que nos proporcionaste:', 
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
      type: 'warning',
      title: '⚠️ Acción Requerida',
      message: 'Para hacer efectiva esta modificación, por favor, responde a este correo electrónico escribiendo únicamente:',
      isDarkMode
    })}
    
    ${Card({
      content: `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="center" style="padding: 20px; background-color: #fff3cd; border-radius: 8px;">
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #856404;">
                "Confirmo la solicitud de modificación"
              </p>
            </td>
          </tr>
        </table>
      `,
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    ${Paragraph({ 
      text: 'Una vez recibamos tu confirmación, uno de nuestros asesores procesará tu solicitud y se pondrá en contacto contigo si se requiere información adicional.', 
      isDarkMode 
    })}
    
    ${Spacer({ height: 'lg' })}
    
    ${Card({
      content: `
        ${Heading({ level: 3, text: '📋 Próximos Pasos', isDarkMode })}
        <ol style="margin: 16px 0; padding-left: 20px; color: ${isDarkMode ? '#e0e0e0' : '#2c3e50'};">
          <li style="margin-bottom: 8px;">Confirma tu solicitud respondiendo este correo</li>
          <li style="margin-bottom: 8px;">Un asesor revisará los cambios solicitados</li>
          <li style="margin-bottom: 8px;">Te contactaremos si necesitamos información adicional</li>
          <li style="margin-bottom: 8px;">Recibirás la confirmación una vez procesados los cambios</li>
        </ol>
      `,
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    ${Paragraph({ 
      text: '¿No deseas proceder con estos cambios? Simplemente ignora este mensaje y tu póliza continuará sin modificaciones.', 
      isDarkMode 
    })}
    
    ${Spacer({ height: 'md' })}
    
    ${Divider({ isDarkMode })}
    
    ${Spacer({ height: 'md' })}
    
    ${Paragraph({ 
      text: 'Para cualquier consulta adicional, estamos aquí para ayudarte:', 
      isDarkMode 
    })}
    
    ${IconText({ icon: '📞', text: '+57 315 586 2884', isDarkMode })}
    ${IconText({ icon: '✉️', text: 'comercial@proense.co', isDarkMode })}
  `;
  
  const agentContent = `
    ${Alert({
      type: 'info',
      title: 'Nueva Solicitud de Modificación de Póliza',
      message: 'Se ha recibido una nueva solicitud de modificación a través del formulario de servicio al cliente.',
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center">
          ${StatusBadge({ text: 'Pendiente de Confirmación', type: 'warning', isDarkMode })}
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
        ${Heading({ level: 3, text: '📝 Modificaciones Detalladas', isDarkMode })}
        <div style="padding: 16px; background-color: ${isDarkMode ? '#404040' : '#f8f9fa'}; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; white-space: pre-wrap; color: ${isDarkMode ? '#e0e0e0' : '#2c3e50'};">
            ${data.modificaciones}
          </p>
        </div>
      `,
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    ${Card({
      content: `
        ${Heading({ level: 3, text: '⚠️ IMPORTANTE - Proceso de Confirmación', isDarkMode })}
        ${Paragraph({ 
          text: 'Se ha enviado un correo al cliente solicitando su confirmación explícita. <strong>NO PROCESAR</strong> la modificación hasta recibir la confirmación del cliente respondiendo con:', 
          isDarkMode 
        })}
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 16px 0;">
          <tr>
            <td align="center" style="padding: 16px; background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px;">
              <p style="margin: 0; font-weight: bold; color: #0c5460;">
                "Confirmo la solicitud de modificación"
              </p>
            </td>
          </tr>
        </table>
        
        ${Paragraph({ 
          text: 'Pasos a seguir tras recibir la confirmación:', 
          isDarkMode 
        })}
        
        <ol style="margin: 16px 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Verificar que el correo provenga del email registrado</li>
          <li style="margin-bottom: 8px;">Analizar la viabilidad de las modificaciones solicitadas</li>
          <li style="margin-bottom: 8px;">Contactar al cliente si se requiere información adicional</li>
          <li style="margin-bottom: 8px;">Procesar los cambios según procedimientos de la aseguradora</li>
          <li style="margin-bottom: 8px;">Enviar confirmación al cliente con los cambios aplicados</li>
        </ol>
      `,
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td>
          ${Button({
            href: `mailto:${data.email}?subject=Re: Solicitud de Modificación - ${data.nombreAseguradora}`,
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
    ${IconText({ icon: '🆔', text: `CC: ${data.numeroCedula}`, isDarkMode })}
    ${IconText({ icon: '📞', text: data.telefono, isDarkMode })}
    ${IconText({ icon: '✉️', text: data.email, isDarkMode })}
    ${IconText({ icon: '🏢', text: `${data.nombreAseguradora} - ${formattedInsuranceType}`, isDarkMode })}
  `;
  
  const content = isUserEmail ? userContent : agentContent;
  
  return BaseTemplate({ preheader, content, isDarkMode });
}