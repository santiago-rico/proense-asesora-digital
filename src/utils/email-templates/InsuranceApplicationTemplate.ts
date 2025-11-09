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
  ProgressSteps,
  Divider
} from './EmailComponents.js';

interface InsuranceApplicationData {
  // Basic Info
  nombreCompleto: string;
  telefono: string;
  email: string;
  
  // Insurance Info
  tipoSeguro: string;
  metodoPago: string;
  periodicidadPago: string;
  
  // Conditional fields
  numeroCedula?: string;
  beneficiarios?: string;
  listaBeneficiarios?: string;
  numeroCedulaRepLegal?: string;
  nit?: string;
  tieneEnfermedadesDiagnosticadas?: 'si' | 'no';
  enfermedadesEspecificar?: string;
  valorActualDeuda?: string;
  conduceMoto?: 'si' | 'no';
  
  // Declaration
  declaraRenta: 'si' | 'no';
  ingresosNoDeclarante?: string;
  egresosNoDeclarante?: string;
  activosNoDeclarante?: string;
  pasivosNoDeclarante?: string;
  
  // Terms
  aceptaTerminosYPolitica: boolean;
}

interface AttachedFiles {
  [key: string]: string[];
}

interface EmailTemplateProps {
  data: InsuranceApplicationData;
  attachedFiles: AttachedFiles;
  isUserEmail: boolean;
  isDarkMode?: boolean;
  baseUrl?: string;
}

export function InsuranceApplicationTemplate({ 
  data, 
  attachedFiles, 
  isUserEmail, 
  isDarkMode = false,
  baseUrl
}: EmailTemplateProps): string {
  const preheader = isUserEmail 
    ? `Confirmación de tu solicitud de ${data.tipoSeguro}`
    : `Nueva solicitud de póliza: ${data.nombreCompleto}`;
  
  // Format insurance type
  const insuranceTypeMap: Record<string, string> = {
    vida: 'Seguro de Vida',
    salud: 'Seguro de Salud',
    auto: 'Seguro de Auto',
    hogar: 'Seguro de Hogar',
    empresarial: 'Seguro Empresarial',
    rentas: 'Seguro de Rentas',
    'vida-deudores': 'Vida Deudores',
  };
  
  const formattedInsuranceType = insuranceTypeMap[data.tipoSeguro] || data.tipoSeguro;
  
  // Build data rows based on what information is available
  const buildDataRows = () => {
    const rows = [
      { label: 'Nombre Completo', value: data.nombreCompleto, isHighlighted: true },
      { label: 'Teléfono', value: data.telefono },
      { label: 'Correo Electrónico', value: data.email },
      { label: 'Tipo de Seguro', value: formattedInsuranceType, isHighlighted: true },
      { label: 'Método de Pago', value: data.metodoPago },
      { label: 'Periodicidad de Pago', value: data.periodicidadPago },
    ];
    
    // Add conditional fields
    if (data.numeroCedula) {
      rows.push({ label: 'Número de Cédula', value: data.numeroCedula });
    }
    
    if (data.beneficiarios) {
      rows.push({ label: 'Beneficiarios', value: data.beneficiarios });
    }
    
    if (data.listaBeneficiarios) {
      rows.push({ label: 'Lista de Beneficiarios', value: data.listaBeneficiarios });
    }
    
    if (data.nit) {
      rows.push({ label: 'NIT', value: data.nit });
    }
    
    if (data.numeroCedulaRepLegal) {
      rows.push({ label: 'Cédula Rep. Legal', value: data.numeroCedulaRepLegal });
    }
    
    if (data.tieneEnfermedadesDiagnosticadas) {
      rows.push({ 
        label: 'Enfermedades Preexistentes', 
        value: data.tieneEnfermedadesDiagnosticadas === 'si' ? 'Sí' : 'No' 
      });
      
      if (data.tieneEnfermedadesDiagnosticadas === 'si' && data.enfermedadesEspecificar) {
        rows.push({ label: 'Detalle Enfermedades', value: data.enfermedadesEspecificar });
      }
    }
    
    if (data.valorActualDeuda) {
      rows.push({ label: 'Valor Actual de Deuda', value: data.valorActualDeuda });
    }
    
    if (data.conduceMoto) {
      rows.push({ label: 'Conduce Motocicleta', value: data.conduceMoto === 'si' ? 'Sí' : 'No' });
    }
    
    // Financial information
    rows.push({ label: 'Declara Renta', value: data.declaraRenta === 'si' ? 'Sí' : 'No' });
    
    if (data.declaraRenta === 'no') {
      if (data.ingresosNoDeclarante) {
        rows.push({ label: 'Ingresos Anuales', value: data.ingresosNoDeclarante });
      }
      if (data.egresosNoDeclarante) {
        rows.push({ label: 'Egresos Anuales', value: data.egresosNoDeclarante });
      }
      if (data.activosNoDeclarante) {
        rows.push({ label: 'Activos', value: data.activosNoDeclarante });
      }
      if (data.pasivosNoDeclarante) {
        rows.push({ label: 'Pasivos', value: data.pasivosNoDeclarante });
      }
    }
    
    // Add attached files information
    Object.entries(attachedFiles).forEach(([key, files]) => {
      if (files.length > 0) {
        const fileLabels: Record<string, string> = {
          fotoCedula: 'Foto Cédula',
          documentosBeneficiarios: 'Documentos Beneficiarios',
          certificadoLibertad: 'Certificado de Libertad',
          tarjetaPropiedad: 'Tarjeta de Propiedad',
          fotoCedulaRepLegal: 'Foto Cédula Rep. Legal',
          rut: 'RUT',
          camaraComercio: 'Cámara de Comercio',
          contratoArrendamiento: 'Contrato Arrendamiento',
          archivoDeclaracionRenta: 'Declaración de Renta',
          documentosAdicionales: 'Documentos Adicionales',
        };
        
        const label = fileLabels[key] || key;
        rows.push({ 
          label: `📎 ${label}`, 
          value: files.join(', '),
          isHighlighted: true
        });
      }
    });
    
    return rows;
  };
  
  const userContent = `
    ${Heading({ level: 1, text: `¡Gracias por tu solicitud, ${data.nombreCompleto}!`, isDarkMode, align: 'center' })}
    
    ${Spacer({ height: 'md' })}
    
    ${Alert({
      type: 'success',
      title: 'Solicitud Recibida',
      message: `Hemos recibido tu solicitud para un ${formattedInsuranceType}. Un asesor se pondrá en contacto contigo pronto.`,
      isDarkMode
    })}
    
    ${Spacer({ height: 'lg' })}
    
    ${ProgressSteps({
      steps: ['Solicitud', 'Revisión', 'Contacto', 'Emisión'],
      currentStep: 0,
      isDarkMode
    })}
    
    ${Spacer({ height: 'lg' })}
    
    ${Heading({ level: 2, text: 'Resumen de tu Solicitud', isDarkMode })}
    
    ${Card({
      content: DataTable({ rows: buildDataRows(), isDarkMode }),
      isDarkMode,
      noPadding: true
    })}
    
    ${Spacer({ height: 'lg' })}
    
    ${Card({
      content: `
        ${Heading({ level: 3, text: '📞 ¿Necesitas hacer cambios?', isDarkMode })}
        ${Paragraph({ 
          text: 'Si necesitas modificar algún dato o tienes preguntas, contáctanos:', 
          isDarkMode 
        })}
        ${IconText({ icon: '📱', text: '+57 315 586 2884', isDarkMode })}
        ${IconText({ icon: '✉️', text: 'comercial@proense.co', isDarkMode })}
      `,
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    ${Divider({ isDarkMode })}
    
    ${Spacer({ height: 'md' })}
    
    ${Paragraph({ 
      text: '<strong>Importante:</strong> Esta es una confirmación de recepción de tu solicitud. Un asesor revisará tu información y se pondrá en contacto contigo pronto para informarte sobre los siguientes pasos para la emisión de tu póliza.', 
      isDarkMode,
      align: 'center'
    })}
  `;
  
  const agentContent = `
    ${Alert({
      type: 'info',
      title: 'Nueva Solicitud de Póliza',
      message: 'Se ha recibido una nueva solicitud de seguro a través del formulario de emisión digital.',
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center">
          ${StatusBadge({ text: 'Pendiente de Revisión', type: 'warning', isDarkMode })}
        </td>
      </tr>
    </table>
    
    ${Spacer({ height: 'lg' })}
    
    ${Heading({ level: 2, text: 'Información del Solicitante', isDarkMode })}
    
    ${Card({
      content: DataTable({ rows: buildDataRows(), isDarkMode }),
      isDarkMode,
      noPadding: true
    })}
    
    ${Spacer({ height: 'lg' })}
    
    ${Card({
      content: `
        ${Heading({ level: 3, text: '⚡ Acciones Requeridas', isDarkMode })}
        <ol style="margin: 16px 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Verificar la documentación adjunta</li>
          <li style="margin-bottom: 8px;">Validar la información proporcionada</li>
          <li style="margin-bottom: 8px;">Contactar al cliente dentro de 24 horas</li>
          <li style="margin-bottom: 8px;">Preparar cotización según el tipo de seguro</li>
        </ol>
      `,
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    ${Button({
      href: `mailto:${data.email}`,
      text: 'Responder al Cliente',
      variant: 'primary',
      isDarkMode,
      fullWidth: false
    })}
  `;
  
  const content = isUserEmail ? userContent : agentContent;
  
  return BaseTemplate({ preheader, content, isDarkMode, baseUrl });
}