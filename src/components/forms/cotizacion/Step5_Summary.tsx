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
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  // Insurance Type
  insuranceType: 'Tipo de Seguro',

  // Vida Insurance Fields
  monthlyIncome: 'Ingreso Mensual',
  maritalStatus: 'Estado Civil',
  hasChildren: '¿Tiene Hijos?',

  // Auto Insurance Fields
  vehicleMake: 'Marca del Vehículo',
  vehicleModel: 'Modelo del Vehículo',
  vehicleYear: 'Año del Vehículo',

  // Hogar Insurance Fields
  propertyType: 'Tipo de Propiedad',
  propertyValue: 'Valor de la Propiedad',

  // Salud Insurance Fields
  preExistingConditions: 'Condiciones Preexistentes',

  // Mascotas Insurance Fields
  petType: 'Tipo de Mascota',
  petName: 'Nombre de la Mascota',
  petAge: 'Edad de la Mascota',

  // Additional Information
  previousInsurance: '¿Ha Tenido Seguro Anteriormente?',
  previousInsurer: 'Aseguradora Anterior',
  claimsHistory: 'Historial de Reclamaciones',
  additionalComments: 'Comentarios Adicionales',
};

// Value mappings for display
const employmentStatusLabels: Record<string, string> = {
  empleado: 'Empleado',
  independiente: 'Independiente',
  desempleado: 'Desempleado',
  pensionado: 'Pensionado',
  estudiante: 'Estudiante',
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

const propertyTypeLabels: Record<string, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
};

const petTypeLabels: Record<string, string> = {
  perro: 'Perro',
  gato: 'Gato',
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

const vidaFields = ['monthlyIncome', 'maritalStatus', 'hasChildren'];
const autoFields = ['vehicleMake', 'vehicleModel', 'vehicleYear'];
const hogarFields = ['propertyType', 'propertyValue'];
const saludFields = ['preExistingConditions'];
const mascotasFields = ['petType', 'petName', 'petAge'];

const additionalInfoFields = [
  'previousInsurance',
  'previousInsurer',
  'claimsHistory',
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
    if (fieldName === 'hasChildren') {
      return value === 'si' ? 'Sí' : value === 'no' ? 'No' : null;
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

    if (fieldName === 'propertyType' && typeof value === 'string') {
      return propertyTypeLabels[value] || value;
    }

    if (fieldName === 'petType' && typeof value === 'string') {
      return petTypeLabels[value] || value;
    }

    // Format currency for monetary fields
    if (
      (fieldName === 'monthlyIncome' || fieldName === 'propertyValue') &&
      typeof value === 'string'
    ) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `$${numValue.toLocaleString('es-CO')}`;
      }
    }

    return String(value);
  };

  const renderSection = (title: string, fields: string[]) => {
    const hasVisibleFields = fields.some((fieldName) => {
      const value = formData[fieldName];
      return renderValue(value, fieldName) !== null;
    });

    if (!hasVisibleFields) return null;

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {title}
        </h4>
        <div className="space-y-2">
          {fields.map((fieldName) => {
            const value = formData[fieldName];
            const displayValue = renderValue(value, fieldName);
            if (displayValue === null) return null;

            return (
              <div
                key={fieldName}
                className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <p className="font-medium text-sm text-gray-600 dark:text-gray-400">
                  {fieldLabels[fieldName] || fieldName}:
                </p>
                <div className="text-sm text-gray-900 dark:text-gray-100 sm:text-right font-medium">
                  {displayValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Revisa y Confirma tu Información</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Asegúrate de que todos los datos sean correctos antes de enviar tu solicitud de
          cotización.
        </p>
      </div>

      <div className="space-y-6 rounded-md border p-4 bg-gray-50/50 dark:bg-gray-800/50">
        {renderSection('Información Personal', personalInfoFields)}
        {renderSection('Tipo de Seguro', insuranceTypeField)}
        {renderSection('Detalles del Seguro', getInsuranceDetailsFields())}
        {renderSection('Información Adicional', additionalInfoFields)}
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
          Una vez enviada tu solicitud, recibirás un correo electrónico de confirmación con los
          detalles de tu cotización. Nuestro equipo se pondrá en contacto contigo a la brevedad.
        </AlertDescription>
      </Alert>

      <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <FormField
          control={control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
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
                  He leído y acepto los{' '}
                  <Link
                    to="/terminos-y-condiciones"
                    target="_blank"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Términos y Condiciones
                  </Link>{' '}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="acceptPrivacy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked as boolean, field.onChange, 'acceptPrivacy')
                  }
                  className={errors.acceptPrivacy ? 'border-red-500' : ''}
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
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="acceptMarketing"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked as boolean, field.onChange, 'acceptMarketing')
                  }
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Acepto recibir información sobre productos, promociones y noticias de Proense
                  Asesora Digital (opcional)
                </FormLabel>
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
