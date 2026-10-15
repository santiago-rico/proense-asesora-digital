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
import { getThemeStyles } from './EmailStyles.js';
import {
  HOGAR_ASEGURABILIDAD_TITLE,
  HOGAR_ASEGURABILIDAD_DISCLAIMER,
  getAsegurabilidadQuestions,
  requiresAsegurabilidad,
  type HogarAsegurabilidadKey,
} from '../../data/hogarAsegurabilidad.js';
import {
  SALUD_ASEGURABILIDAD_QUESTIONS,
  SALUD_ASEGURABILIDAD_SI_NO_KEYS,
  getShownSaludQuestions,
  isSaludFlagged,
  requiresSaludAsegurabilidad,
  type SaludAsegurabilidadKey,
} from '../../data/saludAsegurabilidad.js';
import {
  DECLARACION_ASESORIA_TITLE,
  DECLARACION_ASESORIA_INTRO,
  DECLARACION_ASESORIA_POINTS,
} from '../../data/declaracionAsesoria.js';

// Declaración de asegurabilidad answers are keyed by HOGAR_ASEGURABILIDAD_KEYS
// (hogar and empresarial) and SALUD_ASEGURABILIDAD_KEYS (vida and salud).
interface InsuranceApplicationData
  extends Partial<Record<HogarAsegurabilidadKey, 'si' | 'no' | ''>>, Partial<Record<SaludAsegurabilidadKey, string>> {
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
  
  // Terms and Declaración de Asesoría y Conformidad
  aceptaTerminosYPolitica: boolean;
  aceptaDeclaracionAsesoria: boolean;
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
  /** Server time the client accepted the Declaración de Asesoría y Conformidad. */
  declaracionAceptadaEn?: Date;
}

export function InsuranceApplicationTemplate({ 
  data, 
  attachedFiles, 
  isUserEmail, 
  isDarkMode = false,
  baseUrl,
  declaracionAceptadaEn
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
        rows.push({ label: 'Ingresos Mensuales', value: data.ingresosNoDeclarante });
      }
      if (data.egresosNoDeclarante) {
        rows.push({ label: 'Egresos Mensuales', value: data.egresosNoDeclarante });
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
  
  // Declaración de asegurabilidad, quoted in the wording the client saw: hogar
  // and empresarial ask the same flat questions, vida and salud their own, with
  // follow-ups. Question text is long, so it gets a dedicated table (wide
  // question, narrow answer) instead of DataTable's 40% label column.
  // A "Sí" is information for the asesor, never a blocker.
  const asegurabilidadQuestions = requiresAsegurabilidad(data.tipoSeguro)
    ? getAsegurabilidadQuestions(data.tipoSeguro)
    : [];
  const hasAsegurabilidad = asegurabilidadQuestions.some(q => data[q.key] === 'si' || data[q.key] === 'no');
  const asegurabilidadSiCount = asegurabilidadQuestions.filter(q => data[q.key] === 'si').length;
  
  // Vida and salud: only the questions the client was shown, so a follow-up
  // whose parent is not "Sí" never appears even if a value came along.
  const saludQuestions = requiresSaludAsegurabilidad(data.tipoSeguro) ? getShownSaludQuestions(data) : [];
  const hasSaludAsegurabilidad = saludQuestions.length > 0
    && SALUD_ASEGURABILIDAD_SI_NO_KEYS.some(key => data[key] === 'si' || data[key] === 'no');
  const saludFlaggedCount = saludQuestions.filter(q => isSaludFlagged(q, data[q.key])).length;
  // Top-level questions keep the insurer's numbering (1–6); follow-ups have none.
  const saludTopLevelKeys: string[] = SALUD_ASEGURABILIDAD_QUESTIONS.filter(q => !('parent' in q)).map(q => q.key);
  
  const siNoAnswerText = (answer: string | undefined) =>
    answer === 'si' ? 'Sí' : answer === 'no' ? 'No' : 'No respondida';
  
  type QuestionRow = { question: string; answerText: string; isHighlighted: boolean; isFollowUp?: boolean };
  
  const buildQuestionTable = (rows: QuestionRow[]) => {
    const styles = getThemeStyles(isDarkMode);
    const siHighlightStyle = 'font-weight: 700; background-color: #fff3cd; color: #856404;';
    
    const tableRows = rows.map((row, index) => {
      const bgClass = index % 2 === 1 ? 'darkmode-table-alt' : 'darkmode-table-bg';
      const cellStyle = index % 2 === 0 ? styles.tableCell : styles.tableCellAlt;
      // Follow-ups are indented under the question they depend on
      const questionStyle = row.isFollowUp ? `${cellStyle} padding-left: 40px;` : cellStyle;
      
      return `
        <tr>
          <td style="${questionStyle}" class="darkmode-text darkmode-border ${bgClass}">
            ${row.question}
          </td>
          <td width="90" style="${cellStyle} width: 90px; text-align: center; ${row.isHighlighted ? siHighlightStyle : ''}" class="darkmode-border ${row.isHighlighted ? '' : `darkmode-text ${bgClass}`}">
            ${row.answerText}
          </td>
        </tr>
      `;
    }).join('');
    
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="${styles.table}">
        ${tableRows}
      </table>
    `;
  };
  
  const buildAsegurabilidadTable = (highlightSi: boolean) => buildQuestionTable(
    asegurabilidadQuestions.map((q, index) => ({
      question: `${index + 1}. ${q.question}`,
      answerText: siNoAnswerText(data[q.key]),
      isHighlighted: highlightSi && data[q.key] === 'si',
    })),
  );
  
  const buildSaludAsegurabilidadTable = (highlight: boolean) => buildQuestionTable(
    saludQuestions.map(q => {
      const answer = data[q.key];
      const isFollowUp = 'parent' in q;
      return {
        question: isFollowUp ? q.question : `${saludTopLevelKeys.indexOf(q.key) + 1}. ${q.question}`,
        answerText: q.type === 'text' ? (answer || 'No indicado') : siNoAnswerText(answer),
        isHighlighted: highlight && isSaludFlagged(q, answer),
        isFollowUp,
      };
    }),
  );
  
  const buildAsegurabilidadCard = (table: string, alertMessage: string) => {
    const siAlert = alertMessage
      ? Alert({
          type: 'warning',
          message: alertMessage,
          isDarkMode
        })
      : '';
    
    return `
    ${Spacer({ height: 'lg' })}
    
    ${Heading({ level: 2, text: HOGAR_ASEGURABILIDAD_TITLE, isDarkMode })}
    
    ${siAlert}
    
    ${Paragraph({ text: HOGAR_ASEGURABILIDAD_DISCLAIMER, isDarkMode })}
    
    ${Card({
      content: table,
      isDarkMode,
      noPadding: true
    })}
    `;
  };
  
  // The agent email highlights the answers to review and counts them in an alert.
  const buildAsegurabilidadSection = (isAgent: boolean) => {
    if (hasAsegurabilidad) {
      return buildAsegurabilidadCard(
        buildAsegurabilidadTable(isAgent),
        isAgent && asegurabilidadSiCount > 0
          ? `El cliente respondió «Sí» a ${asegurabilidadSiCount} ${asegurabilidadSiCount === 1 ? 'pregunta' : 'preguntas'} de la declaración de asegurabilidad (resaltadas abajo).`
          : '',
      );
    }
    if (hasSaludAsegurabilidad) {
      // Not every "Sí" is counted: having had a citología is not a risk.
      return buildAsegurabilidadCard(
        buildSaludAsegurabilidadTable(isAgent),
        isAgent && saludFlaggedCount > 0
          ? `${saludFlaggedCount} ${saludFlaggedCount === 1 ? 'respuesta' : 'respuestas'} de la declaración de asegurabilidad ${saludFlaggedCount === 1 ? 'requiere' : 'requieren'} revisión (resaltadas abajo).`
          : '',
      );
    }
    return '';
  };
  
  // Declaración de Asesoría y Conformidad: the exact text the client accepted,
  // with the acceptance time, as the record of the declaration in both emails.
  const buildDeclaracionAsesoriaSection = () => {
    if (!data.aceptaDeclaracionAsesoria) return '';
    
    const styles = getThemeStyles(isDarkMode);
    const points = DECLARACION_ASESORIA_POINTS
      .map(point => `<li style="${styles.p}" class="darkmode-text mobile-text">${point}</li>`)
      .join('');
    const acceptedAt = declaracionAceptadaEn
      ? Paragraph({
          text: `<strong>Aceptada electrónicamente el ${new Intl.DateTimeFormat('es-CO', {
            timeZone: 'America/Bogota',
            dateStyle: 'long',
            timeStyle: 'short',
          }).format(declaracionAceptadaEn)} (hora de Colombia).</strong>`,
          isDarkMode,
          isLast: true
        })
      : '';
    
    return `
    ${Spacer({ height: 'lg' })}
    
    ${Heading({ level: 2, text: DECLARACION_ASESORIA_TITLE, isDarkMode })}
    
    ${Card({
      content: `
        ${Paragraph({ text: DECLARACION_ASESORIA_INTRO, isDarkMode })}
        <ol style="margin: 16px 0; padding-left: 20px;">${points}</ol>
        ${acceptedAt}
      `,
      isDarkMode
    })}
    `;
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
    
    ${buildAsegurabilidadSection(false)}
    
    ${buildDeclaracionAsesoriaSection()}
    
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
    
    ${buildAsegurabilidadSection(true)}
    
    ${buildDeclaracionAsesoriaSection()}
    
    ${Spacer({ height: 'lg' })}
    
    ${Card({
      content: `
        ${Heading({ level: 3, text: '⚡ Acciones Requeridas', isDarkMode })}
        <ol style="margin: 16px 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Verificar la documentación adjunta</li>
          <li style="margin-bottom: 8px;">Validar la información proporcionada</li>
          <li style="margin-bottom: 8px;">Contactar al cliente tan pronto como se haya procesado la solicitud</li>
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