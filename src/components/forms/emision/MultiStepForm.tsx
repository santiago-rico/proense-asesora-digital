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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileSchema = z.instanceof(File, { message: 'Se requiere un archivo.' }).optional();

const detailedFileArraySchema = z.array(z.instanceof(File))
  .optional()
  .superRefine((files, ctx) => {
    if (!files || files.length === 0) return true;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE || !ACCEPTED_MIME_TYPES.includes(file.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Verifica los archivos: solo se aceptan PDF, JPG, PNG, WEBP, DOC, DOCX (máx. 5MB).",
        });
        return false; // Stop validation on first error
      }
    }
    return true;
  });


export const formSchema = z.object({
  nombreCompleto: z.string().min(1, 'El nombre es requerido').transform(str => str.trim()),
  telefono: z.string().refine(isValidPhoneNumber, { message: 'Número de teléfono inválido' }).transform(str => str.trim()),
  email: z.string().transform(str => str.trim().toLowerCase()).refine(val => z.string().email().safeParse(val).success, { message: 'Email inválido' }),
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
  declaraRenta: z.enum(['si', 'no'], {
    required_error: "Debes seleccionar una opción para declarar renta.",
    invalid_type_error: "Debes seleccionar una opción para declarar renta.",
  }),
  archivoDeclaracionRenta: detailedFileArraySchema,
  contratoArrendamiento: detailedFileArraySchema, // Added for Seguro de Rentas
  // Fields for Seguro de Vida - Crédito Protegido
  tieneEnfermedadesDiagnosticadas: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  enfermedadesEspecificar: z.string().optional(),
  valorActualDeuda: z.string().optional(),
  conduceMoto: z.union([z.enum(['si', 'no']), z.literal('')]).optional(),
  // Fields for non-declarers
  ingresosNoDeclarante: z.string().optional(),
  egresosNoDeclarante: z.string().optional(),
  activosNoDeclarante: z.string().optional(),
  pasivosNoDeclarante: z.string().optional(),
  // Step 5 fields
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
    if (!data.tieneEnfermedadesDiagnosticadas || data.tieneEnfermedadesDiagnosticadas === '') {
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

    if (!data.conduceMoto || data.conduceMoto === '') {
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
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const { toast } = useToast();

  const methods = useForm<FormSchemaType>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: '',
      telefono: '',
      email: '',
      tipoSeguro: '',
      metodoPago: '',
      periodicidadPago: '',
      numeroCedula: '',
      beneficiarios: '',
      listaBeneficiarios: '',
      numeroCedulaRepLegal: '',
      nit: '',
      declaraRenta: 'si',
      fotoCedula: [],
      documentosBeneficiarios: [],
      certificadoLibertad: [],
      tarjetaPropiedad: [],
      fotoCedulaRepLegal: [],
      rut: [],
      camaraComercio: [],
      archivoDeclaracionRenta: [],
      contratoArrendamiento: [],
      tieneEnfermedadesDiagnosticadas: '',
      enfermedadesEspecificar: '',
      valorActualDeuda: '',
      conduceMoto: '',
      ingresosNoDeclarante: '',
      egresosNoDeclarante: '',
      activosNoDeclarante: '',
      pasivosNoDeclarante: '',
      aceptaTerminosYPolitica: false,
      website: '', // Honeypot field
    }
  });

  const { handleSubmit, trigger, clearErrors, register } = methods;
  
  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf-token', {
          credentials: 'include'
        });
        const data = await response.json();
        setCsrfToken(data.token);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
        toast({
          title: "Error de Seguridad",
          description: "No se pudo verificar la seguridad del formulario. Por favor, recarga la página.",
          variant: "destructive",
        });
      }
    };
    fetchCsrfToken();
  }, [toast]);
  
  const SuccessScreen = () => (
    <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
        <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">¡Solicitud Enviada!</h2>
      <p className="mt-4 text-lg text-gray-600">
        Hemos recibido tu solicitud correctamente.
      </p>
      <p className="mt-2 text-gray-600">
        Por favor revisa tu correo electrónico <span className="font-medium">{methods.watch('email')}</span> y responde <b>"Acepto"</b> para que tu solicitud sea procesada.
      </p>
      <div className="mt-8">
        <p className="text-sm text-gray-500">
          Si no encuentras nuestro correo, por favor revisa tu carpeta de spam.
        </p>
      </div>
    </div>
  );

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
    // Validate all fields in the current step when proceeding
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
    if (!csrfToken) {
      toast({
        title: "Error",
        description: "Por favor, recarga la página e intenta nuevamente.",
        variant: "destructive",
      });
      return;
    }
    
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
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: formData, // El navegador establecerá automáticamente el Content-Type a multipart/form-data
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        setFormSubmitted(true);
        // Reset form after successful submission if needed
        // methods.reset();
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

  if (formSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <SuccessScreen />
      </div>
    );
  }

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
        
        {/* Honeypot field - hidden from users but visible to bots */}
        <input
          type="text"
          {...register('website')}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

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
            <Button type="submit" disabled={isSubmitting || !csrfToken}>
              {!csrfToken ? 'Cargando...' : isSubmitting ? 'Enviando...' : 'Firmar y Enviar Solicitud'}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default MultiStepForm;
