import { BaseTemplate } from './BaseTemplate.js';
import { LEAD_FORM_INSURANCE_TYPES } from '../../constants/insuranceTypes.js';
import { 
  Heading, 
  Paragraph, 
  Alert, 
  Card, 
  DataTable, 
  Spacer,
  BulletList,
  Divider
} from './EmailComponents.js';

interface LeadTemplateData {
  nombre: string;
  email: string;
  telefono?: string;
  tipoSeguro: string;
  mensaje?: string;
}

export function LeadTemplate(data: LeadTemplateData, isDarkMode: boolean = false, baseUrl?: string): string {
  const preheader = `Nueva solicitud de asesoría de ${data.nombre} - ${data.tipoSeguro}`;
  
  // Format insurance type for display, with the same labels as the LeadForm
  // select; rentas and otro are no longer options but older leads may send them
  const insuranceTypeMap: Record<string, string> = {
    rentas: 'Seguro de Rentas',
    otro: 'Otro tipo de seguro',
    ...Object.fromEntries(LEAD_FORM_INSURANCE_TYPES.map(({ value, label }) => [value, label])),
  };
  
  const formattedInsuranceType = insuranceTypeMap[data.tipoSeguro] || data.tipoSeguro;
  
  // Build the data rows for the table
  const dataRows = [
    { label: 'Nombre', value: data.nombre, isHighlighted: true },
    { label: 'Correo Electrónico', value: data.email },
    { label: 'Teléfono', value: data.telefono || 'No proporcionado' },
    { label: 'Tipo de Seguro', value: formattedInsuranceType, isHighlighted: true },
  ];
  
  const content = `
    ${Alert({
      type: 'info',
      title: 'Nueva Solicitud de Asesoría',
      message: 'Se ha recibido una nueva solicitud de asesoría a través del formulario web.',
      isDarkMode
    })}
    
    ${Spacer({ height: 'md' })}
    
    ${Heading({ level: 2, text: 'Información del Solicitante', isDarkMode })}
    
    ${Card({
      content: DataTable({ rows: dataRows, isDarkMode }),
      isDarkMode,
      noPadding: true
    })}
    
    ${data.mensaje ? `
      ${Spacer({ height: 'md' })}
      
      ${Heading({ level: 3, text: 'Mensaje del Cliente', isDarkMode })}
      
      ${Card({
        content: `
          ${Paragraph({ text: data.mensaje, isDarkMode, isLast: true })}
        `,
        isDarkMode
      })}
    ` : ''}
    
    ${Spacer({ height: 'lg' })}
    
    ${Divider({ isDarkMode })}
    
    ${Heading({ level: 3, text: 'Próximos Pasos', isDarkMode })}
    
    ${BulletList({
      items: [
        'Contactar al cliente tan pronto como se haya procesado la solicitud',
        'Agendar una reunión para entender sus necesidades específicas',
        'Preparar una cotización personalizada según el tipo de seguro solicitado',
        'Hacer seguimiento hasta el cierre de la venta'
      ],
      isDarkMode,
      icon: '→'
    })}
    
    ${Spacer({ height: 'md' })}
    
  `;
  
  return BaseTemplate({ preheader, content, isDarkMode, baseUrl });
}