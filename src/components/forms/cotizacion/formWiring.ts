import type { DefaultValues } from 'react-hook-form';
import type { QuoteFormSchemaType } from './formSchema';

/**
 * Step layout and initial values for the quote (cotización) form.
 *
 * Kept out of `MultiStepQuoteForm.tsx` so the component file only exports a
 * component (Fast Refresh requirement) and so `__tests__/formWiring.test.ts`
 * can assert the schema/steps/defaults invariants without mounting anything.
 */

// Every field declared in `quoteFormSchema` must appear in exactly one step
// (enforced by `__tests__/formWiring.test.ts`). A required field missing from
// these lists is never checked by "Siguiente"; its error then lands on a step
// that is not mounted, so "Enviar Cotización" fails with nothing on screen.
export const steps = [
  {
    id: 1,
    name: 'Información Personal',
    fields: [
      'firstName',
      'lastName',
      'birthDate',
      'phoneNumber',
      'email',
      'cedula',
      'city',
      'address',
      'employmentStatus',
      'occupationSector'
    ]
  },
  {
    id: 2,
    name: 'Tipo de Seguro',
    fields: ['insuranceType']
  },
  {
    id: 3,
    // Union of every conditional field Step3 can render. The Zod schema only
    // requires the ones matching the selected insuranceType, so listing them
    // all is safe — and necessary: a required field missing from this list is
    // never checked by "Siguiente", and its error later surfaces on the summary
    // step where the field is not rendered, so the submit silently does nothing.
    name: 'Detalles del Seguro',
    fields: [
      // Vida
      'monthlyIncome',
      'maritalStatus',
      'hasChildren',
      // Vida + Salud
      'height',
      'weight',
      'epsName',
      'practicesSports',
      'sportsDetails',
      'hasHealthConditions',
      'healthConditionsDetails',
      // Auto
      'vehiclePlate',
      'vehicleCity',
      'vehicleType',
      'vehicleUse',
      'hasAccessories',
      'accessoriesValue',
      'accessoriesType',
      // Hogar
      'insuredPropertyAddress',
      'insuredPropertyCity',
      'propertyRelationship',
      'ownerName',
      'ownerCedula',
      'ownerBirthDate',
      'buildingFloors',
      'unitFloor',
      'basementCount',
      'estrato',
      'propertyType',
      'constructionType',
      'constructionYear',
      'residesInProperty',
      'propertyArea',
      'hasEconomicActivity',
      'propertyValue',
      'wantsContentsCoverage',
      'contentsValue',
      'electricContentsValue',
      'theftValue',
      'portableContentsValue',
      'insuranceMethod',
      // Mascotas
      'petType',
      'petName',
      'petGender',
      'petAge',
      'petBreed',
      'petVaccinated',
      'petHasSeriousIllness',
      'petSeriousIllnessDetails',
      // All types
      'additionalComments'
    ]
  },
  {
    id: 4,
    name: 'Resumen y Envío',
    fields: ['acceptTerms']
  }
];

// The server validates the flattened payload (MultiStepQuoteForm sends birthDate
// as birthDate_day/_month/_year), so a 400 names those parts by their payload
// keys, which match no form field.
const SERVER_ERROR_FIELDS: Record<string, string> = {
  birthDate_day: 'birthDate.day',
  birthDate_month: 'birthDate.month',
  birthDate_year: 'birthDate.year',
};

/** The form field (possibly a dotted path) a key of the server's 400 `errors` belongs to. */
export const formFieldForServerError = (key: string): string => SERVER_ERROR_FIELDS[key] ?? key;

/** Index of the step that renders `field` (a top-level name or dotted path), or -1. */
export const stepIndexForField = (field: string): number =>
  steps.findIndex((step) => step.fields.includes(field.split('.')[0]));

// Exported for `__tests__/formWiring.test.ts`: every schema field needs an
// entry here, otherwise its input mounts uncontrolled (value === undefined) and
// React only switches it to controlled on the first keystroke.
export const quoteFormDefaultValues: DefaultValues<QuoteFormSchemaType> = {
  firstName: '',
  lastName: '',
  birthDate: {
    day: '',
    month: '',
    year: ''
  },
  phoneNumber: '',
  email: '',
  cedula: '',
  city: '',
  address: '',
  employmentStatus: undefined,
  occupationSector: '',
  insuranceType: undefined,
  // Vida fields
  monthlyIncome: '',
  maritalStatus: '',
  hasChildren: '',
  height: '',
  weight: '',
  epsName: '',
  practicesSports: '',
  sportsDetails: '',
  hasHealthConditions: '',
  healthConditionsDetails: '',
  // Auto fields
  vehiclePlate: '',
  vehicleCity: '',
  vehicleType: '',
  vehicleUse: '',
  hasAccessories: '',
  accessoriesValue: '',
  accessoriesType: '',
  // Hogar fields
  insuredPropertyAddress: '',
  insuredPropertyCity: '',
  propertyRelationship: '',
  ownerName: '',
  ownerCedula: '',
  ownerBirthDate: '',
  buildingFloors: '',
  unitFloor: '',
  basementCount: '',
  estrato: '',
  propertyType: '',
  constructionType: '',
  constructionYear: '',
  residesInProperty: '',
  propertyArea: '',
  hasEconomicActivity: '',
  propertyValue: '',
  wantsContentsCoverage: '',
  contentsValue: '',
  electricContentsValue: '',
  theftValue: '',
  portableContentsValue: '',
  insuranceMethod: '',
  // Salud fields
  preExistingConditions: '',
  // Mascotas fields
  petType: '',
  petName: '',
  petGender: '',
  petAge: '',
  petBreed: '',
  petVaccinated: '',
  petHasSeriousIllness: '',
  petSeriousIllnessDetails: '',
  // Additional fields
  additionalComments: '',
  acceptTerms: false,
  website: '', // Honeypot field
};
