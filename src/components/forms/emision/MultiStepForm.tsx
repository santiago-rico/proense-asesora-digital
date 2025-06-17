import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
import Step1_BasicInfo from './Step1_BasicInfo';
import Step2_InsuranceSelection from './Step2_InsuranceSelection';
import Step3_ConditionalFields from './Step3_ConditionalFields';
import Step4_Declaration from './Step4_Declaration';
import Step5_Summary from './Step5_Summary';
import { Button } from '@/components/ui/button';
import NumberedProgressBar from './NumberedProgressBar';
import { useToast } from '@/hooks/use-toast';

const fileSchema = z.instanceof(File, { message: 'Se requiere un archivo.' }).optional();
const fileArraySchema = z.array(z.instanceof(File)).optional();

export const formSchema = z.object({
  nombreCompleto: z.string().min(1, 'El nombre es requerido'),
  telefono: z.string().refine(isValidPhoneNumber, { message: 'Número de teléfono inválido' }),
  email: z.string().email('Email inválido'),
  tipoSeguro: z.string().min(1, 'Selecciona un tipo de seguro'),
  metodoPago: z.string().min(1, 'Selecciona un método de pago'),
  periodicidadPago: z.string().min(1, 'Selecciona la periodicidad de pago'),
  numeroCedula: z.string().optional(),
  fotoCedula: fileArraySchema,
  beneficiarios: z.string().optional(),
  documentosBeneficiarios: fileArraySchema,
  listaBeneficiarios: z.string().optional(),
  certificadoLibertad: fileArraySchema,
  tarjetaPropiedad: fileArraySchema,
  numeroCedulaRepLegal: z.string().optional(),
  fotoCedulaRepLegal: fileArraySchema,
  nit: z.string().optional(),
  rut: fileArraySchema,
  camaraComercio: fileArraySchema,
  declaraRenta: z.enum(['si', 'no'], {
    required_error: "Debes seleccionar una opción para declarar renta.",
    invalid_type_error: "Debes seleccionar una opción para declarar renta.",
  }),
  archivoDeclaracionRenta: fileArraySchema,
  contratoArrendamiento: fileArraySchema, // Added for Seguro de Rentas
  // Fields for Seguro de Vida - Crédito Protegido
  tieneEnfermedadesDiagnosticadas: z.enum(['si', 'no']).optional(),
  enfermedadesEspecificar: z.string().optional(),
  valorActualDeuda: z.string().optional(),
  conduceMoto: z.enum(['si', 'no']).optional(),
  // Fields for non-declarers
  ingresosNoDeclarante: z.string().optional(),
  egresosNoDeclarante: z.string().optional(),
  activosNoDeclarante: z.string().optional(),
  pasivosNoDeclarante: z.string().optional(),
  // Step 5 fields
  aceptaTerminosYPolitica: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar la política de privacidad y los términos y condiciones para continuar.',
  }),
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

const steps = [
  { id: 1, name: 'Información Básica', fields: ['nombreCompleto', 'telefono', 'email'] },
  { id: 2, name: 'Selección de Seguro', fields: ['tipoSeguro', 'metodoPago', 'periodicidadPago'] },
  { id: 3, name: 'Detalles del Seguro', fields: ['numeroCedula', 'fotoCedula', 'beneficiarios', 'documentosBeneficiarios', 'listaBeneficiarios', 'certificadoLibertad', 'tarjetaPropiedad', 'numeroCedulaRepLegal', 'fotoCedulaRepLegal', 'nit', 'rut', 'camaraComercio', 'contratoArrendamiento', 'tieneEnfermedadesDiagnosticadas', 'enfermedadesEspecificar', 'valorActualDeuda', 'conduceMoto'] },
  { id: 4, name: 'Declaración', fields: ['declaraRenta', 'archivoDeclaracionRenta', 'ingresosNoDeclarante', 'egresosNoDeclarante', 'activosNoDeclarante', 'pasivosNoDeclarante'] },
  { id: 5, name: 'Resumen y Envío', fields: ['aceptaTerminosYPolitica'] },
];

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<FormSchemaType>({
    mode: 'onChange', // Validate on input change for immediate feedback
    reValidateMode: 'onChange', // Re-validate on change after submission/trigger for dynamic error clearing
    resolver: zodResolver(formSchema),
    defaultValues: {
        nombreCompleto: '',
        telefono: '',
        email: '',
        tipoSeguro: '',
        metodoPago: '',
        periodicidadPago: '',
        declaraRenta: 'si', // Default to 'si'
        fotoCedula: [],
        documentosBeneficiarios: [],
        certificadoLibertad: [],
        tarjetaPropiedad: [],
        fotoCedulaRepLegal: [],
        rut: [],
        camaraComercio: [],
        archivoDeclaracionRenta: [],
        contratoArrendamiento: [],
        // vida_credito_protegido defaults
        tieneEnfermedadesDiagnosticadas: undefined,
        enfermedadesEspecificar: '',
        valorActualDeuda: '',
        conduceMoto: undefined,
        // Step 5 defaults
        aceptaTerminosYPolitica: false,
    }
  });

  const { handleSubmit, trigger, clearErrors } = methods;

  useEffect(() => {
    // When the step changes, clear any existing errors for the fields of the new current step.
    // This ensures that errors don't persist from a previous attempt to validate this step.
    const fieldsForCurrentStep = steps[currentStep]?.fields;
    if (fieldsForCurrentStep) {
      clearErrors(fieldsForCurrentStep as any);
    }
  }, [currentStep, clearErrors]); // `steps` is stable, not needed in dep array if defined outside component scope

  const handleNext = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as any, { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormSchemaType) => {
    setIsSubmitting(true);
    console.log('Form data submitted:', data);

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return; // No adjuntar valores nulos o indefinidos
      } 

      if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
        // Es un array de archivos
        value.forEach(file => {
          formData.append(key, file);
        });
      } else if (value instanceof File) {
        // Es un solo archivo
        formData.append(key, value);
      } else {
        // Es un string, booleano, etc.
        formData.append(key, String(value));
      }
    });

    try {
      const response = await fetch('/api/send-insurance-application-email', {
        method: 'POST',
        body: formData, // El navegador establecerá automáticamente el Content-Type a multipart/form-data
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Solicitud Enviada Exitosamente",
          description: result.message || "Tu solicitud ha sido procesada. Nos pondremos en contacto pronto.",
        });
        // Opcionalmente, reiniciar el formulario o redirigir al usuario
        // methods.reset();
        // setCurrentStep(0);
      } else {
        toast({
          variant: "destructive",
          title: "Error al Enviar Solicitud",
          description: result.message || "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        });
        console.error('API Error:', result);
      }
    } catch (error) {
      console.error('Error de red u otro error:', error);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudo enviar la solicitud. Verifica tu conexión a internet e intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mb-8">
        <NumberedProgressBar currentStep={currentStep + 1} steps={steps} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <h3 className="text-xl font-semibold">{steps[currentStep].name}</h3>

        {currentStep === 0 && <Step1_BasicInfo />}
        {currentStep === 1 && <Step2_InsuranceSelection />}
        {currentStep === 2 && <Step3_ConditionalFields />}
        {currentStep === 3 && <Step4_Declaration />}
        {currentStep === 4 && <Step5_Summary />}

        <div className="flex justify-between">
          {currentStep > 0 && (
            <Button type="button" onClick={handlePrev} variant="outline">
              Anterior
            </Button>
          )}
          <div /> 
          {currentStep < steps.length - 1 && (
            <Button type="button" onClick={handleNext}>
              Siguiente
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="submit" disabled={isSubmitting}>
              Firmar y Enviar Solicitud
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default MultiStepForm;
