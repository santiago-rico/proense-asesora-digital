import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
import {
  HOGAR_ASEGURABILIDAD_KEYS,
  HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE,
  requiresAsegurabilidad,
  type HogarAsegurabilidadKey,
} from '@/data/hogarAsegurabilidad';
import {
  SALUD_ASEGURABILIDAD_QUESTIONS,
  SALUD_ASEGURABILIDAD_TEXT_MAX_LENGTH,
  getMissingSaludAnswers,
  requiresSaludAsegurabilidad,
  type SaludAsegurabilidadQuestion,
} from '@/data/saludAsegurabilidad';
import { DECLARACION_ASESORIA_REQUIRED_MESSAGE } from '@/data/declaracionAsesoria';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const detailedFileArraySchema = z.array(z.instanceof(File))
  .optional()
  .superRefine((files, ctx) => {
    if (!files || files.length === 0) return;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE || !ACCEPTED_MIME_TYPES.includes(file.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Verifica los archivos: solo se aceptan PDF, JPG, PNG, WEBP, DOC, DOCX (máx. 5MB).",
        });
        return; // Stop validation on first error
      }
    }
  });

const siNoOptional = z.union([z.enum(['si', 'no']), z.literal('')]).optional();

// Seguro de Hogar y Empresarial - Declaración de asegurabilidad (one si/no field per question)
const hogarAsegurabilidadShape = Object.fromEntries(
  HOGAR_ASEGURABILIDAD_KEYS.map(key => [key, siNoOptional])
) as Record<HogarAsegurabilidadKey, typeof siNoOptional>;

// Seguro de Vida y Salud - Declaración de asegurabilidad (si/no fields plus free-text follow-ups)
type SaludTextKey = Extract<SaludAsegurabilidadQuestion, { type: 'text' }>['key'];
type SaludSiNoKey = Exclude<SaludAsegurabilidadQuestion['key'], SaludTextKey>;
const saludTextOptional = z.string()
  .max(SALUD_ASEGURABILIDAD_TEXT_MAX_LENGTH, `Máximo ${SALUD_ASEGURABILIDAD_TEXT_MAX_LENGTH} caracteres.`)
  .optional();
const saludAsegurabilidadShape = Object.fromEntries(
  SALUD_ASEGURABILIDAD_QUESTIONS.map(q => [q.key, q.type === 'text' ? saludTextOptional : siNoOptional])
) as Record<SaludSiNoKey, typeof siNoOptional> & Record<SaludTextKey, typeof saludTextOptional>;

export const formSchema = z.object({
  nombreCompleto: z.string().min(1, 'El nombre es requerido').transform(str => str.trim()),
  telefono: z.string().refine(isValidPhoneNumber, { message: 'Número de teléfono inválido' }).transform(str => str.trim()),
  email: z.string().transform(str => str.trim().toLowerCase()).refine(val => z.email().safeParse(val).success, { message: 'Email inválido' }),
  tipoSeguro: z.string().min(1, 'Selecciona un tipo de seguro'),
  metodoPago: z.string().min(1, 'Selecciona un método de pago'),
  periodicidadPago: z.string().min(1, 'Selecciona la periodicidad de pago'),
  numeroCedula: z.string().optional(),
  fotoCedula: detailedFileArraySchema,
  beneficiarios: z.string().optional(),
  documentosBeneficiarios: detailedFileArraySchema,
  listaBeneficiarios: z.string().optional(),
  certificadoLibertad: detailedFileArraySchema,
  tarjetaPropiedad: detailedFileArraySchema,
  numeroCedulaRepLegal: z.string().optional(),
  fotoCedulaRepLegal: detailedFileArraySchema,
  nit: z.string().optional(),
  rut: detailedFileArraySchema,
  camaraComercio: detailedFileArraySchema,
  declaraRenta: z.enum(['si', 'no'], { error: "Debes seleccionar una opción para declarar renta." }),
  archivoDeclaracionRenta: detailedFileArraySchema,
  contratoArrendamiento: detailedFileArraySchema, // Added for Seguro de Rentas
  // Fields for Seguro de Vida - Crédito Protegido
  tieneEnfermedadesDiagnosticadas: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  enfermedadesEspecificar: z.string().optional(),
  valorActualDeuda: z.string().optional(),
  conduceMoto: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  ...hogarAsegurabilidadShape,
  ...saludAsegurabilidadShape,
  // Fields for non-declarers
  ingresosNoDeclarante: z.string().optional(),
  egresosNoDeclarante: z.string().optional(),
  activosNoDeclarante: z.string().optional(),
  pasivosNoDeclarante: z.string().optional(),
  // Step 5 fields
  aceptaDeclaracionAsesoria: z.boolean().refine(val => val === true, {
    message: DECLARACION_ASESORIA_REQUIRED_MESSAGE,
  }),
  aceptaTerminosYPolitica: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar la política de privacidad y los términos y condiciones para continuar.',
  }),
  
  // Honeypot field for bot protection
  website: z.string().optional(),
}).superRefine((data, ctx) => {
  // Step 3: Conditional validation based on tipoSeguro
  const commonFieldsNeeded = ['vida', 'salud', 'hogar', 'auto', 'mascotas', 'rentas', 'responsabilidad_civil', 'vida_credito_protegido'].includes(data.tipoSeguro);
  if (commonFieldsNeeded) {
    if (!data.numeroCedula || data.numeroCedula.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El número de cédula es requerido.", path: ["numeroCedula"] });
    }
    if (!data.fotoCedula || data.fotoCedula.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La foto de la cédula es requerida.", path: ["fotoCedula"] });
    }
  }

  if (data.tipoSeguro === 'vida') {
    if (!data.beneficiarios || data.beneficiarios.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Los nombres de beneficiarios y porcentajes son requeridos.", path: ["beneficiarios"] });
    }
    if (!data.documentosBeneficiarios || data.documentosBeneficiarios.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Los documentos de identidad de los beneficiarios son requeridos.", path: ["documentosBeneficiarios"] });
    }
  } else if (data.tipoSeguro === 'salud') {
    if (!data.listaBeneficiarios || data.listaBeneficiarios.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La lista de beneficiarios es requerida.", path: ["listaBeneficiarios"] });
    }
  } else if (data.tipoSeguro === 'hogar') {
    if (!data.certificadoLibertad || data.certificadoLibertad.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El certificado de libertad y tradición es requerido.", path: ["certificadoLibertad"] });
    }
  } else if (data.tipoSeguro === 'auto') {
    if (!data.tarjetaPropiedad || data.tarjetaPropiedad.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La tarjeta de propiedad es requerida.", path: ["tarjetaPropiedad"] });
    }
  } else if (data.tipoSeguro === 'rentas') {
    // numeroCedula and fotoCedula are covered by commonFieldsNeeded
    // As per new reference, 'rentas' now requires beneficiary information
    if (!data.beneficiarios || data.beneficiarios.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Los nombres de beneficiarios y porcentajes son requeridos.", path: ["beneficiarios"] });
    }
    if (!data.documentosBeneficiarios || data.documentosBeneficiarios.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Los documentos de identidad de los beneficiarios son requeridos.", path: ["documentosBeneficiarios"] });
    }
  } else if (data.tipoSeguro === 'responsabilidad_civil') {
    // numeroCedula and fotoCedula are covered by commonFieldsNeeded
    // Beneficiary fields are no longer required for responsabilidad_civil
  } else if (data.tipoSeguro === 'vida_credito_protegido') {
    // numeroCedula and fotoCedula are covered by commonFieldsNeeded
    if (!data.tieneEnfermedadesDiagnosticadas) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debes indicar si tienes enfermedades diagnosticadas.", path: ["tieneEnfermedadesDiagnosticadas"] });
    } else if (data.tieneEnfermedadesDiagnosticadas === 'si' && (!data.enfermedadesEspecificar || data.enfermedadesEspecificar.trim() === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debes especificar tus enfermedades.", path: ["enfermedadesEspecificar"] });
    }

    if (!data.valorActualDeuda || data.valorActualDeuda.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El valor actual de la deuda es requerido.", path: ["valorActualDeuda"] });
    } else {
      // Attempt to parse after removing common currency symbols and spaces
      const deudaNum = Number(data.valorActualDeuda.replace(/[$,.]/g, '').replace(/\s/g, ''));
      if (isNaN(deudaNum) || deudaNum <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El valor de la deuda debe ser un número positivo.", path: ["valorActualDeuda"] });
      }
    }

    if (!data.conduceMoto) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debes indicar si conduces motocicleta.", path: ["conduceMoto"] });
    }
  } else if (data.tipoSeguro === 'empresarial') {
    if (!data.numeroCedulaRepLegal || data.numeroCedulaRepLegal.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El número de cédula del representante legal es requerido.", path: ["numeroCedulaRepLegal"] });
    }
    if (!data.fotoCedulaRepLegal || data.fotoCedulaRepLegal.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La foto de la cédula del representante legal es requerida.", path: ["fotoCedulaRepLegal"] });
    }
    if (!data.nit || data.nit.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El NIT es requerido.", path: ["nit"] });
    }
    if (!data.rut || data.rut.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El RUT es requerido.", path: ["rut"] });
    }
    if (!data.camaraComercio || data.camaraComercio.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La cámara de comercio es requerida.", path: ["camaraComercio"] });
    }
  }

  // Step 3: Declaración de asegurabilidad (hogar and empresarial). A "Sí" never
  // blocks the submission, but every question must be answered.
  if (requiresAsegurabilidad(data.tipoSeguro)) {
    for (const key of HOGAR_ASEGURABILIDAD_KEYS) {
      if (data[key] !== 'si' && data[key] !== 'no') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE, path: [key] });
      }
    }
  }

  // Step 3: Declaración de asegurabilidad (vida and salud). Every shown question
  // must be answered except the optional ones; follow-ups only while their
  // question is answered "Sí".
  if (requiresSaludAsegurabilidad(data.tipoSeguro)) {
    for (const key of getMissingSaludAnswers(data)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE, path: [key] });
    }
  }

  // Step 4: Conditional validation based on declaraRenta
  if (data.declaraRenta === 'si') {
    if (!data.archivoDeclaracionRenta || data.archivoDeclaracionRenta.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El archivo de declaración de renta es requerido.", path: ["archivoDeclaracionRenta"] });
    }
  } else if (data.declaraRenta === 'no') {
    if (!data.ingresosNoDeclarante || data.ingresosNoDeclarante.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Los ingresos son requeridos.", path: ["ingresosNoDeclarante"] });
    }
    if (!data.egresosNoDeclarante || data.egresosNoDeclarante.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Los egresos son requeridos.", path: ["egresosNoDeclarante"] });
    }
    if (!data.activosNoDeclarante || data.activosNoDeclarante.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Los activos son requeridos.", path: ["activosNoDeclarante"] });
    }
    if (!data.pasivosNoDeclarante || data.pasivosNoDeclarante.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Los pasivos son requeridos.", path: ["pasivosNoDeclarante"] });
    }
  }
});

export type FormSchemaType = z.infer<typeof formSchema>;