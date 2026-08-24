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
      'buildingFloors',
      'estrato',
      'propertyType',
      'propertyUse',
      'residesInProperty',
      'propertyArea',
      'hasEconomicActivity',
      'propertyValue',
      'contentsValue',
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
  buildingFloors: '',
  estrato: '',
  propertyType: '',
  propertyUse: '',
  residesInProperty: '',
  propertyArea: '',
  hasEconomicActivity: '',
  propertyValue: '',
  contentsValue: '',
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
