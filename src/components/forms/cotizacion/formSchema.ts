import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

// Quote form validation schema
export const quoteFormSchema = z.object({
  // Step 1: Personal Information
  firstName: z.string()
    .min(1, 'El nombre es requerido')
    .transform(str => str.trim()),

  lastName: z.string()
    .min(1, 'El apellido es requerido')
    .transform(str => str.trim()),

  birthDate: z.object({
    day: z.string().regex(/^(0?[1-9]|[12][0-9]|3[01])$/, 'Día inválido'),
    month: z.string().min(1, 'Mes requerido'),
    year: z.string().regex(/^(19|20)\d{2}$/, 'Año inválido')
  }),

  phoneNumber: z.string()
    .refine(isValidPhoneNumber, { message: 'Número de teléfono inválido' })
    .transform(str => str.trim()),

  email: z.string()
    .transform(str => str.trim().toLowerCase())
    .refine(val => z.string().email().safeParse(val).success, {
      message: 'Email inválido'
    }),

  cedula: z.string()
    .min(1, 'Número de cédula requerido')
    .regex(/^\d+$/, 'Solo números permitidos')
    .transform(str => str.trim()),

  city: z.string()
    .min(1, 'Ciudad requerida')
    .transform(str => str.trim()),

  address: z.string()
    .min(1, 'Dirección requerida')
    .transform(str => str.trim()),

  employmentStatus: z.enum([
    'empleado',
    'independiente',
    'desempleado',
    'pensionado',
    'estudiante'
  ], {
    required_error: 'Selecciona tu situación laboral',
    invalid_type_error: 'Selecciona una opción válida'
  }),

  // Step 2: Insurance Type Selection
  insuranceType: z.enum(['vida', 'auto', 'hogar', 'salud', 'mascotas'], {
    required_error: 'Selecciona un tipo de seguro',
    invalid_type_error: 'Selecciona un tipo de seguro válido'
  }),

  // Step 3: Conditional Fields for Seguro de Vida
  monthlyIncome: z.string().optional(),
  maritalStatus: z.string().optional(),
  hasChildren: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),

  // Step 3: Conditional Fields for Seguro de Auto
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),

  // Step 3: Conditional Fields for Seguro de Hogar
  propertyType: z.string().optional(),
  propertyValue: z.string().optional(),

  // Step 3: Conditional Fields for Seguro de Salud
  preExistingConditions: z.string().optional(),

  // Step 3: Conditional Fields for Seguro de Mascotas
  petType: z.string().optional(),
  petName: z.string().optional(),
  petAge: z.string().optional(),

  // Step 4: Additional Information
  previousInsurance: z.boolean({
    required_error: 'Indica si has tenido seguro anteriormente',
    invalid_type_error: 'Selecciona una opción válida'
  }),
  previousInsurer: z.string().optional(),
  claimsHistory: z.string().optional(),
  additionalComments: z.string().optional(),

  // Step 5: Consent and Terms
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones para continuar'
  }),

  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar la política de privacidad para continuar'
  }),

  acceptMarketing: z.boolean().optional(),

  // Honeypot field for bot protection
  website: z.string().optional(),
}).superRefine((data, ctx) => {
  // Conditional validation based on insurance type

  if (data.insuranceType === 'vida') {
    // Validate required fields for Seguro de Vida
    if (!data.monthlyIncome || data.monthlyIncome.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Los ingresos mensuales son requeridos para seguro de vida',
        path: ['monthlyIncome']
      });
    }

    if (!data.maritalStatus || data.maritalStatus.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El estado civil es requerido para seguro de vida',
        path: ['maritalStatus']
      });
    }

    if (!data.hasChildren || data.hasChildren === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indica si tienes hijos',
        path: ['hasChildren']
      });
    }
  } else if (data.insuranceType === 'auto') {
    // Validate required fields for Seguro de Auto
    if (!data.vehicleMake || data.vehicleMake.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La marca del vehículo es requerida',
        path: ['vehicleMake']
      });
    }

    if (!data.vehicleModel || data.vehicleModel.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El modelo del vehículo es requerido',
        path: ['vehicleModel']
      });
    }

    if (!data.vehicleYear || data.vehicleYear.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El año del vehículo es requerido',
        path: ['vehicleYear']
      });
    } else {
      // Validate year format and range
      const yearNum = parseInt(data.vehicleYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El año debe estar entre 1900 y ${currentYear + 1}`,
          path: ['vehicleYear']
        });
      }
    }
  } else if (data.insuranceType === 'hogar') {
    // Validate required fields for Seguro de Hogar
    if (!data.propertyType || data.propertyType.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El tipo de propiedad es requerido',
        path: ['propertyType']
      });
    }

    if (!data.propertyValue || data.propertyValue.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El valor de la propiedad es requerido',
        path: ['propertyValue']
      });
    }
  } else if (data.insuranceType === 'salud') {
    // Validate required fields for Seguro de Salud
    if (!data.preExistingConditions || data.preExistingConditions.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes indicar si tienes condiciones preexistentes (escribe "Ninguna" si no aplica)',
        path: ['preExistingConditions']
      });
    }
  } else if (data.insuranceType === 'mascotas') {
    // Validate required fields for Seguro de Mascotas
    if (!data.petType || data.petType.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El tipo de mascota es requerido',
        path: ['petType']
      });
    }

    if (!data.petName || data.petName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nombre de la mascota es requerido',
        path: ['petName']
      });
    }

    if (!data.petAge || data.petAge.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La edad de la mascota es requerida',
        path: ['petAge']
      });
    } else {
      // Validate age is a positive number
      const ageNum = parseInt(data.petAge, 10);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La edad debe ser un número válido entre 0 y 50',
          path: ['petAge']
        });
      }
    }
  }
});

export type QuoteFormSchemaType = z.infer<typeof quoteFormSchema>;
