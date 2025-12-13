import { BaseTemplate } from './BaseTemplate.js';
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
  
  // Format insurance type for display
  const insuranceTypeMap: Record<string, string> = {
    vida: 'Seguro de Vida',
    salud: 'Seguro de Salud',
    auto: 'Seguro de Auto',
    hogar: 'Seguro de Hogar',
    empresarial: 'Seguro Empresarial',
    rentas: 'Seguro de Rentas',
    'vida-deudores': 'Vida Deudores',
    otro: 'Otro tipo de seguro',
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