import { z } from 'zod';

/**
 * Server-side validation schema for quote requests (cotizaciones).
 *
 * This is the single source of truth for which fields the API accepts. Zod
 * strips any key that is not declared here, so every field the client form
 * (`src/components/forms/cotizacion/formSchema.ts`) collects MUST have a
 * matching entry below — otherwise it is silently dropped before the
 * notification email is rendered.
 *
 * The client sends `birthDate` as a nested object which `MultiStepQuoteForm`
 * flattens into `birthDate_day` / `birthDate_month` / `birthDate_year` before
 * POSTing. That is the only intentional shape difference between the two
 * schemas; a parity test (`__tests__/schemaParity.test.ts`) guards the rest.
 */
export const backendQuoteSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'El nombre es requerido').max(100).transform(str => str.trim()),
  lastName: z.string().min(1, 'El apellido es requerido').max(100).transform(str => str.trim()),
  birthDate_day: z.string().regex(/^(0?[1-9]|[12][0-9]|3[01])$/, 'Día inválido'),
  birthDate_month: z.string().min(1, 'Mes requerido'),
  birthDate_year: z.string().regex(/^(19|20)\d{2}$/, 'Año inválido'),
  phoneNumber: z.string().min(10, 'Número de teléfono inválido').transform(str => str.trim()),
  email: z.string().email('Correo electrónico inválido').transform(str => str.trim().toLowerCase()),
  cedula: z.string().min(1, 'Número de cédula requerido').regex(/^\d+$/, 'Solo números permitidos').transform(str => str.trim()),
  city: z.string().min(1, 'Ciudad requerida').transform(str => str.trim()),
  address: z.string().min(1, 'Dirección requerida').transform(str => str.trim()),
  employmentStatus: z.enum(['empleado_completo', 'empleado_parcial', 'autonomo', 'desempleado', 'estudiante', 'jubilado', 'ama_casa', 'incapacidad']),
  occupationSector: z.string().transform(str => str.trim()).optional(),

  // Insurance Information
  insuranceType: z.enum(['vida', 'auto', 'hogar', 'salud', 'mascotas']),

  // Conditional fields
  monthlyIncome: z.string().transform(str => str.trim()).optional(),
  maritalStatus: z.string().transform(str => str.trim()).optional(),
  hasChildren: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  height: z.string().transform(str => str.trim()).optional(),
  weight: z.string().transform(str => str.trim()).optional(),
  epsName: z.string().transform(str => str.trim()).optional(),
  practicesSports: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  sportsDetails: z.string().transform(str => str.trim()).optional(),
  hasHealthConditions: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  healthConditionsDetails: z.string().transform(str => str.trim()).optional(),
  vehiclePlate: z.string().transform(str => str.trim()).optional(),
  vehicleCity: z.string().transform(str => str.trim()).optional(),
  vehicleType: z.string().transform(str => str.trim()).optional(),
  vehicleUse: z.string().transform(str => str.trim()).optional(),
  hasAccessories: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  accessoriesValue: z.string().transform(str => str.trim()).optional(),
  accessoriesType: z.string().transform(str => str.trim()).optional(),
  insuredPropertyAddress: z.string().transform(str => str.trim()).optional(),
  insuredPropertyCity: z.string().transform(str => str.trim()).optional(),
  buildingFloors: z.string().transform(str => str.trim()).optional(),
  estrato: z.string().transform(str => str.trim()).optional(),
  propertyType: z.string().transform(str => str.trim()).optional(),
  // Legacy field: replaced by propertyRelationship on the client, kept here so
  // in-flight submissions from older clients are not dropped during deploy.
  propertyUse: z.string().transform(str => str.trim()).optional(),
  propertyRelationship: z.string().transform(str => str.trim()).optional(),
  ownerName: z.string().transform(str => str.trim()).optional(),
  ownerCedula: z.string().transform(str => str.trim()).optional(),
  ownerBirthDate: z.string().transform(str => str.trim()).optional(),
  residesInProperty: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  constructionType: z.string().transform(str => str.trim()).optional(),
  constructionYear: z.string().transform(str => str.trim()).optional(),
  unitFloor: z.string().transform(str => str.trim()).optional(),
  basementCount: z.string().transform(str => str.trim()).optional(),
  propertyArea: z.string().transform(str => str.trim()).optional(),
  hasEconomicActivity: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  propertyValue: z.string().transform(str => str.trim()).optional(),
  wantsContentsCoverage: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  contentsValue: z.string().transform(str => str.trim()).optional(),
  electricContentsValue: z.string().transform(str => str.trim()).optional(),
  theftValue: z.string().transform(str => str.trim()).optional(),
  portableContentsValue: z.string().transform(str => str.trim()).optional(),
  insuranceMethod: z.string().transform(str => str.trim()).optional(),
  preExistingConditions: z.string().transform(str => str.trim()).optional(),
  petType: z.string().transform(str => str.trim()).optional(),
  petName: z.string().transform(str => str.trim()).optional(),
  petGender: z.string().transform(str => str.trim()).optional(),
  petAge: z.string().transform(str => str.trim()).optional(),
  petBreed: z.string().transform(str => str.trim()).optional(),
  petVaccinated: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  petHasSeriousIllness: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  petSeriousIllnessDetails: z.string().transform(str => str.trim()).optional(),

  // Additional Comments
  additionalComments: z.string().transform(str => str.trim()).optional(),

  // Terms
  acceptTerms: z.enum(['true', 'false']).transform(val => val === 'true'),

  // Honeypot field
  website: z.string().optional(),
});

export type BackendQuoteData = z.infer<typeof backendQuoteSchema>;
