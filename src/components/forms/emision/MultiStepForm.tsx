import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Step1_BasicInfo from './Step1_BasicInfo';
import Step2_InsuranceSelection from './Step2_InsuranceSelection';
import Step3_ConditionalFields from './Step3_ConditionalFields';
import Step4_Declaration from './Step4_Declaration';
import Step5_Summary from './Step5_Summary';
import { Button } from '@/components/ui/button';
import NumberedProgressBar from './NumberedProgressBar';
import { useToast } from '@/hooks/use-toast';
import { formSchema, FormSchemaType } from './formSchema';

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
      clearErrors(fieldsForCurrentStep as (keyof FormSchemaType)[]);
    }
  }, [currentStep, clearErrors]); // `steps` is stable, not needed in dep array if defined outside component scope

  const handleNext = async () => {
    const fields = steps[currentStep].fields;
    // Validate all fields in the current step when proceeding
    const output = await trigger(fields as (keyof FormSchemaType)[], { shouldFocus: true });

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
