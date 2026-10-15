import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom'; // Assuming you use react-router for links
import { HOGAR_ASEGURABILIDAD_KEYS, HOGAR_ASEGURABILIDAD_QUESTIONS, requiresAsegurabilidad } from '@/data/hogarAsegurabilidad';
import {
  SALUD_ASEGURABILIDAD_KEYS,
  SALUD_ASEGURABILIDAD_QUESTIONS,
  SALUD_ASEGURABILIDAD_SI_NO_KEYS,
  isSaludQuestionShown,
  requiresSaludAsegurabilidad,
} from '@/data/saludAsegurabilidad';
import {
  DECLARACION_ASESORIA_CHECKBOX_LABEL,
  DECLARACION_ASESORIA_INTRO,
  DECLARACION_ASESORIA_POINTS,
  DECLARACION_ASESORIA_TITLE,
} from '@/data/declaracionAsesoria';

const hogarAsegurabilidadKeys: readonly string[] = HOGAR_ASEGURABILIDAD_KEYS;
const saludSiNoKeys: readonly string[] = SALUD_ASEGURABILIDAD_SI_NO_KEYS;

const fieldLabels: Record<string, string> = {
  nombreCompleto: 'Nombre Completo',
  telefono: 'Teléfono',
  email: 'Email',
  tipoSeguro: 'Tipo de Seguro Solicitado',
  metodoPago: 'Método de Pago Preferido',
  periodicidadPago: 'Periodicidad de Pago',
  // Conditional fields from Step3 - add as they are defined
  numeroCedula: 'Número de Cédula (Vida)',
  fotoCedula: 'Foto Cédula (Vida)',
  beneficiarios: 'Beneficiarios (Vida)',
  documentosBeneficiarios: 'Documentos Beneficiarios (Vida)',
  listaBeneficiarios: 'Lista de Beneficiarios (Vida)',
  certificadoLibertad: 'Certificado de Libertad y Tradición (Hogar)',
  ...Object.fromEntries(HOGAR_ASEGURABILIDAD_QUESTIONS.map(q => [q.key, q.shortLabel])),
  ...Object.fromEntries(SALUD_ASEGURABILIDAD_QUESTIONS.map(q => [q.key, q.shortLabel])),
  tarjetaPropiedad: 'Tarjeta de Propiedad (Autos)',
  numeroCedulaRepLegal: 'Cédula Representante Legal (Empresarial)',
  fotoCedulaRepLegal: 'Foto Cédula Representante Legal (Empresarial)',
  nit: 'NIT (Empresarial)',
  rut: 'RUT (Empresarial)',
  camaraComercio: 'Cámara de Comercio (Empresarial)',
  // Step 4 fields
  declaraRenta: '¿Declara Renta?',
  archivoDeclaracionRenta: 'Archivo Declaración de Renta',
  ingresosNoDeclarante: 'Ingresos Mensuales (No Declarante)',
  egresosNoDeclarante: 'Egresos Mensuales (No Declarante)',
  activosNoDeclarante: 'Activos (No Declarante)',
  pasivosNoDeclarante: 'Pasivos (No Declarante)',
};

// Define the order of fields for the summary section
const summaryFieldOrder = [
  'nombreCompleto',
  'telefono',
  'email',
  'tipoSeguro',
  'metodoPago',
  'periodicidadPago',
  'numeroCedula',
  'fotoCedula',
  'beneficiarios',
  'documentosBeneficiarios',
  'listaBeneficiarios',
  'certificadoLibertad',
  'tarjetaPropiedad',
  'numeroCedulaRepLegal',
  'fotoCedulaRepLegal',
  'nit',
  'rut',
  'camaraComercio',
  // Last of the Step 3 fields, as in the form: hogar and empresarial, then vida and salud
  ...HOGAR_ASEGURABILIDAD_KEYS,
  ...SALUD_ASEGURABILIDAD_KEYS,
  'declaraRenta',
  'archivoDeclaracionRenta',
  'ingresosNoDeclarante',
  'egresosNoDeclarante',
  'activosNoDeclarante',
  'pasivosNoDeclarante',
];

const Step5_Summary: React.FC = () => {
  const { 
    control, 
    getValues, 
    clearErrors, 
    formState: { errors } 
  } = useFormContext();
  const formData = getValues();

  const handleCheckboxChange = (
    name: 'aceptaDeclaracionAsesoria' | 'aceptaTerminosYPolitica',
    checked: boolean,
    onChange: (checked: boolean) => void,
  ) => {
    // Update the checkbox value
    onChange(checked);
    
    // Clear the error if the checkbox is checked
    if (checked) {
      clearErrors(name);
    }
  };

  const renderValue = (value: unknown, fieldName: string) => {
    if (value === undefined || value === null || value === '') return null; // Hide if no value

    if (Array.isArray(value)) {
      if (value.length === 0) return null; // Hide if empty array
      if (value[0] instanceof File) {
        return (
          <ul className="list-disc list-inside text-right">
            {value.map((file: File, index: number) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        );
      }
      return value.join(', '); // For other arrays, join by comma
    }
    if (value instanceof File) {
      return value.name;
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    if (fieldName === 'declaraRenta' || hogarAsegurabilidadKeys.includes(fieldName) || saludSiNoKeys.includes(fieldName)) {
        return value === 'si' ? 'Sí' : (value === 'no' ? 'No' : null);
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-1">Revisa y Confirma tu Información</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Asegúrate de que todos los datos sean correctos antes de enviar tu solicitud.</p>
      <div className="space-y-3 rounded-md border p-4">
        {summaryFieldOrder.map((fieldName) => {
          // Answers left over from switching to a ramo without the declaración de asegurabilidad are not part of this request
          if (hogarAsegurabilidadKeys.includes(fieldName) && !requiresAsegurabilidad(formData.tipoSeguro)) return null;
          // Same for vida and salud, plus follow-ups whose question is no longer answered "Sí"
          const saludQuestion = SALUD_ASEGURABILIDAD_QUESTIONS.find(q => q.key === fieldName);
          if (saludQuestion && (!requiresSaludAsegurabilidad(formData.tipoSeguro) || !isSaludQuestionShown(saludQuestion, formData))) return null;
          const value = formData[fieldName];
          const displayValue = renderValue(value, fieldName);
          if (displayValue === null) return null; // Don't render if value is null/empty

          return (
            <div key={fieldName} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <p className="font-medium text-sm text-gray-700 dark:text-gray-300">{fieldLabels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1')}:</p>
              <div className="text-sm text-gray-600 dark:text-gray-400 sm:text-right">{displayValue}</div>
            </div>
          );
        })}
      </div>

      <section
        aria-labelledby="declaracion-asesoria-titulo"
        className="space-y-4 rounded-md border border-gray-200 dark:border-gray-700 p-4"
      >
        <h4 id="declaracion-asesoria-titulo" className="text-base font-semibold">
          {DECLARACION_ASESORIA_TITLE}
        </h4>
        <p className="text-sm text-gray-800 dark:text-gray-200">{DECLARACION_ASESORIA_INTRO}</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          {DECLARACION_ASESORIA_POINTS.map(point => (
            <li key={point}>{point}</li>
          ))}
        </ol>
        <FormField
          control={control}
          name="aceptaDeclaracionAsesoria"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 border-t border-gray-200 dark:border-gray-700 pt-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => handleCheckboxChange('aceptaDeclaracionAsesoria', checked as boolean, field.onChange)}
                  className={errors.aceptaDeclaracionAsesoria ? 'border-red-500' : ''}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  {DECLARACION_ASESORIA_CHECKBOX_LABEL} <span className="text-red-500">*</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </section>

      <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <FormField
          control={control}
          name="aceptaTerminosYPolitica"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={(checked) => handleCheckboxChange('aceptaTerminosYPolitica', checked as boolean, field.onChange)} 
                  className={errors.aceptaTerminosYPolitica ? 'border-red-500' : ''}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  He leído y acepto la <Link to="/politica-de-privacidad" target="_blank" className="text-blue-600 hover:underline">Política de Privacidad</Link> y los <Link to="/terminos-y-condiciones" target="_blank" className="text-blue-600 hover:underline">Términos y Condiciones</Link> <span className="text-red-500">*</span>.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700/30 text-center mt-6">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Al hacer clic en "Firmar y Enviar Solicitud", usted está firmando electrónicamente este documento y aceptando los términos aquí descritos, según lo establecido en la Ley 527 de 1999.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step5_Summary;

