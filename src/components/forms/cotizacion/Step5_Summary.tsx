import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';

const fieldLabels: Record<string, string> = {
  // Personal Information
  firstName: 'Nombre',
  lastName: 'Apellido',
  birthDate: 'Fecha de Nacimiento',
  phoneNumber: 'Teléfono',
  email: 'Correo Electrónico',
  cedula: 'Número de Cédula',
  city: 'Ciudad',
  address: 'Dirección',
  employmentStatus: 'Estado Laboral',
  occupationSector: 'Actividad Laboral o Sector Económico',

  // Insurance Type
  insuranceType: 'Tipo de Seguro',

  // Vida Insurance Fields
  monthlyIncome: 'Ingreso Mensual',
  maritalStatus: 'Estado Civil',
  hasChildren: '¿Tiene Hijos?',
  height: 'Estatura',
  weight: 'Peso',
  epsName: 'EPS',
  practicesSports: '¿Practica Deportes?',
  sportsDetails: 'Deportes que Practica',
  hasHealthConditions: '¿Tiene Enfermedades?',
  healthConditionsDetails: 'Enfermedades',

  // Auto Insurance Fields
  vehiclePlate: 'Placa del Vehículo',
  vehicleCity: 'Ciudad de Circulación',
  vehicleType: 'Tipo de Vehículo',
  vehicleUse: 'Uso Principal del Vehículo',
  hasAccessories: '¿Tiene Accesorios o Modificaciones?',
  accessoriesValue: 'Valor Estimado de Accesorios',
  accessoriesType: 'Tipo de Accesorios',

  // Hogar Insurance Fields
  insuredPropertyAddress: 'Dirección del Inmueble a Asegurar',
  insuredPropertyCity: 'Ciudad del Inmueble a Asegurar',
  buildingFloors: 'Número de Pisos del Edificio',
  estrato: 'Estrato',
  propertyType: 'Tipo de Vivienda',
  propertyUse: 'Uso de la Vivienda',
  residesInProperty: '¿Habitas la Vivienda?',
  propertyArea: 'Área de la Vivienda (M2)',
  hasEconomicActivity: '¿Se Desarrolla Actividad Económica?',
  propertyValue: 'Valor Comercial de la Vivienda',
  contentsValue: 'Valor de los Contenidos',
  insuranceMethod: 'Método de Aseguramiento',

  // Salud Insurance Fields
  preExistingConditions: 'Condiciones Preexistentes',

  // Mascotas Insurance Fields
  petType: 'Tipo de Mascota',
  petName: 'Nombre de la Mascota',
  petGender: 'Sexo de la Mascota',
  petAge: 'Edad de la Mascota',
  petBreed: 'Raza de la Mascota',
  petVaccinated: '¿Tiene Esquema de Vacunas al Día?',
  petHasSeriousIllness: '¿Ha Tenido Enfermedades o Accidentes Graves?',
  petSeriousIllnessDetails: 'Enfermedades o Accidentes',

  // Additional Comments
  additionalComments: 'Comentarios Adicionales',
};

// Value mappings for display
const employmentStatusLabels: Record<string, string> = {
  empleado_completo: 'Empleado(a) a tiempo completo',
  empleado_parcial: 'Empleado(a) a tiempo parcial',
  autonomo: 'Trabajador(a) autónomo(a) / Freelance',
  desempleado: 'Desempleado(a)',
  estudiante: 'Estudiante',
  jubilado: 'Jubilado(a)',
  ama_casa: 'Ama de casa',
  incapacidad: 'Incapacidad laboral',
};

const insuranceTypeLabels: Record<string, string> = {
  vida: 'Seguro de Vida',
  auto: 'Seguro de Auto',
  hogar: 'Seguro de Hogar',
  salud: 'Seguro de Salud',
  mascotas: 'Seguro de Mascotas',
};

const maritalStatusLabels: Record<string, string> = {
  soltero: 'Soltero/a',
  casado: 'Casado/a',
  union_libre: 'Unión Libre',
  divorciado: 'Divorciado/a',
  viudo: 'Viudo/a',
};

const estratoLabels: Record<string, string> = {
  estrato_1: 'Estrato 1',
  estrato_2: 'Estrato 2',
  estrato_3: 'Estrato 3',
  estrato_4: 'Estrato 4',
  estrato_5: 'Estrato 5',
  estrato_6: 'Estrato 6',
};

const propertyTypeLabels: Record<string, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  casa_campestre: 'Casa Campestre',
  finca: 'Finca',
};

const propertyUseLabels: Record<string, string> = {
  arrendamiento: 'Arrendamiento',
  propio: 'Propio',
};

const insuranceMethodLabels: Record<string, string> = {
  valor_comercial: 'Valor Comercial',
  valor_reconstruccion: 'Valor de Reconstrucción',
};

const petTypeLabels: Record<string, string> = {
  perro: 'Perro',
  gato: 'Gato',
  otro: 'Otro',
};

const petGenderLabels: Record<string, string> = {
  hembra: 'Hembra',
  macho: 'Macho',
};

const vehicleTypeLabels: Record<string, string> = {
  nuevo: 'Nuevo (0 Km)',
  usado: 'Usado',
};

const vehicleUseLabels: Record<string, string> = {
  familiar: 'Familiar',
  trabajo: 'Trabajo',
  empresa: 'Al servicio de una empresa',
};

const accessoriesTypeLabels: Record<string, string> = {
  planta_sonido: 'Planta de sonido',
  ductos_escape: 'Ductos de escape',
  rines_lujo: 'Rines de lujo',
  pintura_personalizada: 'Pintura personalizada',
  otro: 'Otro',
};

const monthLabels: Record<string, string> = {
  '1': 'Enero',
  '2': 'Febrero',
  '3': 'Marzo',
  '4': 'Abril',
  '5': 'Mayo',
  '6': 'Junio',
  '7': 'Julio',
  '8': 'Agosto',
  '9': 'Septiembre',
  '10': 'Octubre',
  '11': 'Noviembre',
  '12': 'Diciembre',
};

// Define the order of fields for the summary section by category
const personalInfoFields = [
  'firstName',
  'lastName',
  'birthDate',
  'phoneNumber',
  'email',
  'cedula',
  'city',
  'address',
  'employmentStatus',
];

const insuranceTypeField = ['insuranceType'];

const vidaFields = [
  'monthlyIncome',
  'maritalStatus',
  'hasChildren',
  'height',
  'weight',
  'epsName',
  'practicesSports',
  'sportsDetails',
  'hasHealthConditions',
  'healthConditionsDetails',
  'additionalComments',
];
const autoFields = [
  'vehiclePlate',
  'vehicleCity',
  'vehicleType',
  'vehicleUse',
  'hasAccessories',
  'accessoriesValue',
  'accessoriesType',
  'additionalComments',
];
const hogarFields = [
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
  'additionalComments',
];
const saludFields = ['preExistingConditions', 'additionalComments'];
const mascotasFields = [
  'petType',
  'petName',
  'petGender',
  'petAge',
  'petBreed',
  'petVaccinated',
  'petHasSeriousIllness',
  'petSeriousIllnessDetails',
  'additionalComments',
];

const Step5_Summary: React.FC = () => {
  const {
    control,
    getValues,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const formData = getValues();
  const insuranceType = formData.insuranceType;

  const handleCheckboxChange = (
    checked: boolean,
    onChange: (checked: boolean) => void,
    fieldName: string
  ) => {
    onChange(checked);
    if (checked) {
      clearErrors(fieldName);
    }
  };

  const renderValue = (value: unknown, fieldName: string) => {
    if (value === undefined || value === null || value === '') return null;

    // Handle birthDate special case
    if (fieldName === 'birthDate' && typeof value === 'object') {
      const birthDateObj = value as { day: string; month: string; year: string };
      const monthLabel = monthLabels[birthDateObj.month] || birthDateObj.month;
      return `${birthDateObj.day} de ${monthLabel} de ${birthDateObj.year}`;
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    // Handle specific value mappings
    if (
      fieldName === 'hasChildren' ||
      fieldName === 'practicesSports' ||
      fieldName === 'hasHealthConditions' ||
      fieldName === 'residesInProperty' ||
      fieldName === 'hasEconomicActivity' ||
      fieldName === 'hasAccessories' ||
      fieldName === 'petVaccinated' ||
      fieldName === 'petHasSeriousIllness'
    ) {
      return value === 'si' ? 'Sí' : value === 'no' ? 'No' : null;
    }

    // Format height and weight
    if (fieldName === 'height' && typeof value === 'string') {
      return `${value} cm`;
    }

    if (fieldName === 'weight' && typeof value === 'string') {
      return `${value} kg`;
    }

    if (fieldName === 'employmentStatus' && typeof value === 'string') {
      return employmentStatusLabels[value] || value;
    }

    if (fieldName === 'insuranceType' && typeof value === 'string') {
      return insuranceTypeLabels[value] || value;
    }

    if (fieldName === 'maritalStatus' && typeof value === 'string') {
      return maritalStatusLabels[value] || value;
    }

    if (fieldName === 'estrato' && typeof value === 'string') {
      return estratoLabels[value] || value;
    }

    if (fieldName === 'propertyType' && typeof value === 'string') {
      return propertyTypeLabels[value] || value;
    }

    if (fieldName === 'propertyUse' && typeof value === 'string') {
      return propertyUseLabels[value] || value;
    }

    if (fieldName === 'insuranceMethod' && typeof value === 'string') {
      return insuranceMethodLabels[value] || value;
    }

    if (fieldName === 'petType' && typeof value === 'string') {
      return petTypeLabels[value] || value;
    }

    if (fieldName === 'petGender' && typeof value === 'string') {
      return petGenderLabels[value] || value;
    }

    if (fieldName === 'vehicleType' && typeof value === 'string') {
      return vehicleTypeLabels[value] || value;
    }

    if (fieldName === 'vehicleUse' && typeof value === 'string') {
      return vehicleUseLabels[value] || value;
    }

    if (fieldName === 'accessoriesType' && typeof value === 'string') {
      return accessoriesTypeLabels[value] || value;
    }

    // Format currency for monetary fields
    if (
      (fieldName === 'monthlyIncome' ||
        fieldName === 'propertyValue' ||
        fieldName === 'contentsValue' ||
        fieldName === 'accessoriesValue') &&
      typeof value === 'string'
    ) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `$${numValue.toLocaleString('es-CO')} COP`;
      }
    }

    // Format area field
    if (fieldName === 'propertyArea' && typeof value === 'string') {
      return `${value} M2`;
    }

    return String(value);
  };

  const getInsuranceDetailsFields = () => {
    switch (insuranceType) {
      case 'vida':
        return vidaFields;
      case 'auto':
        return autoFields;
      case 'hogar':
        return hogarFields;
      case 'salud':
        return saludFields;
      case 'mascotas':
        return mascotasFields;
      default:
        return [];
    }
  };

  // Get all fields to display in a flat list
  const getAllFieldsToDisplay = () => {
    const allFields = [
      ...personalInfoFields,
      ...insuranceTypeField,
      ...getInsuranceDetailsFields(),
    ];
    return allFields;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-1">Revisa y Confirma tu Información</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Asegúrate de que todos los datos sean correctos antes de enviar tu solicitud de cotización.
      </p>

      <div className="space-y-3 rounded-md border p-4">
        {getAllFieldsToDisplay().map((fieldName) => {
          const value = formData[fieldName];
          const displayValue = renderValue(value, fieldName);
          if (displayValue === null) return null;

          return (
            <div
              key={fieldName}
              className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
                {fieldLabels[fieldName] || fieldName}:
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400 sm:text-right">
                {displayValue}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <FormField
          control={control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked as boolean, field.onChange, 'acceptTerms')
                  }
                  className={errors.acceptTerms ? 'border-red-500' : ''}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  He leído y acepto la{' '}
                  <Link
                    to="/politica-de-privacidad"
                    target="_blank"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Política de Privacidad
                  </Link>{' '}
                  y los{' '}
                  <Link
                    to="/terminos-y-condiciones"
                    target="_blank"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Términos y Condiciones
                  </Link>{' '}
                  <span className="text-red-500">*</span>.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700/30 text-center mt-6">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Al hacer clic en "Enviar Cotización", usted está firmando electrónicamente este
            documento y aceptando los términos aquí descritos, según lo establecido en la Ley 527
            de 1999.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step5_Summary;
