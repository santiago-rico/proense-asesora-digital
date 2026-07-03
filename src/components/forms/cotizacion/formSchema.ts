import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

// Quote form validation schema.
//
// The plain object shape is exported separately as `quoteFormBaseSchema` so its
// field list can be introspected (see `__tests__/schemaParity.test.ts`, which
// asserts the server schema in `api/schemas/quote-request-schema.ts` accepts
// every field collected here). `quoteFormSchema` layers the cross-field
// conditional validation on top and is what the form actually uses.
export const quoteFormBaseSchema = z.object({
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
    .refine(val => z.email().safeParse(val).success, {
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
    'empleado_completo',
    'empleado_parcial',
    'autonomo',
    'desempleado',
    'estudiante',
    'jubilado',
    'ama_casa',
    'incapacidad'
  ], {
    required_error: 'Selecciona tu situación laboral',
    invalid_type_error: 'Selecciona una opción válida'
  }),

  occupationSector: z.string().optional(),

  // Step 2: Insurance Type Selection
  insuranceType: z.enum(['vida', 'auto', 'hogar', 'salud', 'mascotas'], {
    required_error: 'Selecciona un tipo de seguro',
    invalid_type_error: 'Selecciona un tipo de seguro válido'
  }),

  // Step 3: Conditional Fields for Seguro de Vida
  monthlyIncome: z.string().optional(),
  maritalStatus: z.string().optional(),
  hasChildren: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  epsName: z.string().optional(),
  practicesSports: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  sportsDetails: z.string().optional(),
  hasHealthConditions: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  healthConditionsDetails: z.string().optional(),

  // Step 3: Conditional Fields for Seguro de Auto
  vehiclePlate: z.string().optional(),
  vehicleCity: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleUse: z.string().optional(),
  hasAccessories: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  accessoriesValue: z.string().optional(),
  accessoriesType: z.string().optional(),

  // Step 3: Conditional Fields for Seguro de Hogar
  insuredPropertyAddress: z.string().optional(),
  insuredPropertyCity: z.string().optional(),
  buildingFloors: z.string().optional(),
  estrato: z.string().optional(),
  propertyType: z.string().optional(),
  propertyUse: z.string().optional(),
  residesInProperty: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  propertyArea: z.string().optional(),
  hasEconomicActivity: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  propertyValue: z.string().optional(),
  contentsValue: z.string().optional(),
  insuranceMethod: z.string().optional(),

  // Step 3: Conditional Fields for Seguro de Salud
  preExistingConditions: z.string().optional(),

  // Step 3: Conditional Fields for Seguro de Mascotas
  petType: z.string().optional(),
  petName: z.string().optional(),
  petGender: z.string().optional(),
  petAge: z.string().optional(),
  petBreed: z.string().optional(),
  petVaccinated: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  petHasSeriousIllness: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  petSeriousIllnessDetails: z.string().optional(),

  // Step 3: Additional Comments
  additionalComments: z.string().optional(),

  // Step 4: Consent and Terms
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar la política de privacidad y los términos y condiciones para continuar'
  }),

  // Honeypot field for bot protection
  website: z.string().optional(),
});

export const quoteFormSchema = quoteFormBaseSchema.superRefine((data, ctx) => {
  // Conditional validation for occupation sector based on employment status
  const employmentStatusesRequiringOccupation = [
    'empleado_completo',
    'empleado_parcial',
    'autonomo',
    'jubilado',
    'incapacidad'
  ];

  if (employmentStatusesRequiringOccupation.includes(data.employmentStatus)) {
    if (!data.occupationSector || data.occupationSector.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La actividad laboral o sector económico es requerida',
        path: ['occupationSector']
      });
    }
  }

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

    if (!data.height || data.height.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La estatura es requerida para seguro de vida',
        path: ['height']
      });
    }

    if (!data.weight || data.weight.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El peso es requerido para seguro de vida',
        path: ['weight']
      });
    }

    if (!data.epsName || data.epsName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nombre de la EPS es requerido para seguro de vida',
        path: ['epsName']
      });
    }

    if (!data.practicesSports || data.practicesSports === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indica si practicas algún deporte',
        path: ['practicesSports']
      });
    }

    // Conditional validation for sports details
    if (data.practicesSports === 'si') {
      if (!data.sportsDetails || data.sportsDetails.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debes especificar qué deportes practicas',
          path: ['sportsDetails']
        });
      }
    }

    if (!data.hasHealthConditions || data.hasHealthConditions === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indica si tienes o padeces alguna enfermedad',
        path: ['hasHealthConditions']
      });
    }

    // Conditional validation for health conditions details
    if (data.hasHealthConditions === 'si') {
      if (!data.healthConditionsDetails || data.healthConditionsDetails.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debes describir las enfermedades que padeces',
          path: ['healthConditionsDetails']
        });
      }
    }
  } else if (data.insuranceType === 'auto') {
    // Validate required fields for Seguro de Auto
    if (!data.vehiclePlate || data.vehiclePlate.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La placa del vehículo es requerida',
        path: ['vehiclePlate']
      });
    }

    if (!data.vehicleCity || data.vehicleCity.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La ciudad de circulación es requerida',
        path: ['vehicleCity']
      });
    }

    if (!data.vehicleType || data.vehicleType.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El tipo de vehículo es requerido',
        path: ['vehicleType']
      });
    }

    if (!data.vehicleUse || data.vehicleUse.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El uso principal del vehículo es requerido',
        path: ['vehicleUse']
      });
    }

    // Conditional validation for accessories
    if (data.hasAccessories === 'si') {
      if (!data.accessoriesValue || data.accessoriesValue.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El valor estimado de accesorios es requerido',
          path: ['accessoriesValue']
        });
      }

      if (!data.accessoriesType || data.accessoriesType.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El tipo de accesorios es requerido',
          path: ['accessoriesType']
        });
      }
    }
  } else if (data.insuranceType === 'hogar') {
    // Validate required fields for Seguro de Hogar
    if (!data.insuredPropertyAddress || data.insuredPropertyAddress.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La dirección del inmueble a asegurar es requerida',
        path: ['insuredPropertyAddress']
      });
    }

    if (!data.insuredPropertyCity || data.insuredPropertyCity.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La ciudad del inmueble a asegurar es requerida',
        path: ['insuredPropertyCity']
      });
    }

    // buildingFloors is optional - no validation needed

    if (!data.estrato || data.estrato.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El estrato es requerido',
        path: ['estrato']
      });
    }

    if (!data.propertyType || data.propertyType.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El tipo de vivienda es requerido',
        path: ['propertyType']
      });
    }

    if (!data.propertyUse || data.propertyUse.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El uso de la vivienda es requerido',
        path: ['propertyUse']
      });
    }

    if (!data.residesInProperty || data.residesInProperty === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indica si habitas la vivienda',
        path: ['residesInProperty']
      });
    }

    if (!data.propertyArea || data.propertyArea.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El área de la vivienda es requerida',
        path: ['propertyArea']
      });
    }

    if (!data.hasEconomicActivity || data.hasEconomicActivity === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indica si se desarrolla alguna actividad económica',
        path: ['hasEconomicActivity']
      });
    }

    // Only validate propertyValue if propertyUse is 'propio'
    if (data.propertyUse === 'propio') {
      if (!data.propertyValue || data.propertyValue.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El valor de la vivienda es requerido',
          path: ['propertyValue']
        });
      }
    }

    if (!data.insuranceMethod || data.insuranceMethod.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona cómo deseas asegurar el predio',
        path: ['insuranceMethod']
      });
    }
  } else if (data.insuranceType === 'salud') {
    // Validate required fields for Seguro de Salud
    if (!data.height || data.height.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La estatura es requerida para seguro de salud',
        path: ['height']
      });
    }

    if (!data.weight || data.weight.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El peso es requerido para seguro de salud',
        path: ['weight']
      });
    }

    if (!data.epsName || data.epsName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nombre de la EPS es requerido para seguro de salud',
        path: ['epsName']
      });
    }

    if (!data.practicesSports || data.practicesSports === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indica si practicas algún deporte',
        path: ['practicesSports']
      });
    }

    // Conditional validation for sports details
    if (data.practicesSports === 'si') {
      if (!data.sportsDetails || data.sportsDetails.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debes especificar qué deportes practicas',
          path: ['sportsDetails']
        });
      }
    }

    if (!data.hasHealthConditions || data.hasHealthConditions === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indica si tienes o padeces alguna enfermedad',
        path: ['hasHealthConditions']
      });
    }

    // Conditional validation for health conditions details
    if (data.hasHealthConditions === 'si') {
      if (!data.healthConditionsDetails || data.healthConditionsDetails.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debes describir las enfermedades que padeces',
          path: ['healthConditionsDetails']
        });
      }
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

    if (!data.petGender || data.petGender.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El sexo de la mascota es requerido',
        path: ['petGender']
      });
    }

    if (!data.petAge || data.petAge.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La edad de la mascota es requerida',
        path: ['petAge']
      });
    }

    if (!data.petBreed || data.petBreed.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La raza de la mascota es requerida',
        path: ['petBreed']
      });
    }

    if (!data.petHasSeriousIllness || data.petHasSeriousIllness === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indica si tu mascota ha tenido enfermedades o accidentes graves',
        path: ['petHasSeriousIllness']
      });
    }

    // Conditional validation for serious illness details
    if (data.petHasSeriousIllness === 'si') {
      if (!data.petSeriousIllnessDetails || data.petSeriousIllnessDetails.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Debes describir las enfermedades o accidentes de tu mascota',
          path: ['petSeriousIllnessDetails']
        });
      }
    }
  }
});

export type QuoteFormSchemaType = z.infer<typeof quoteFormSchema>;
