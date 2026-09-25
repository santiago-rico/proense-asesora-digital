import { useState, useEffect, type MouseEvent } from 'react';
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
import { FormSuccessScreen } from '@/components/shared/FormSuccessScreen';
import { safeParseResponse } from '@/utils/safe-response';
import { fetchWithRetry, isTimeoutError } from '@/utils/fetch-with-retry';
import { HOGAR_ASEGURABILIDAD_KEYS, type HogarAsegurabilidadKey } from '@/data/hogarAsegurabilidad';

const steps = [
  { id: 1, name: 'Información Básica', fields: ['nombreCompleto', 'telefono', 'email'] },
  { id: 2, name: 'Selección de Seguro', fields: ['tipoSeguro', 'metodoPago', 'periodicidadPago'] },
  { id: 3, name: 'Detalles del Seguro', fields: ['numeroCedula', 'fotoCedula', 'beneficiarios', 'documentosBeneficiarios', 'listaBeneficiarios', 'certificadoLibertad', 'tarjetaPropiedad', 'numeroCedulaRepLegal', 'fotoCedulaRepLegal', 'nit', 'rut', 'camaraComercio', 'contratoArrendamiento', 'tieneEnfermedadesDiagnosticadas', 'enfermedadesEspecificar', 'valorActualDeuda', 'conduceMoto', ...HOGAR_ASEGURABILIDAD_KEYS] },
  { id: 4, name: 'Declaración', fields: ['declaraRenta', 'archivoDeclaracionRenta', 'ingresosNoDeclarante', 'egresosNoDeclarante', 'activosNoDeclarante', 'pasivosNoDeclarante'] },
  { id: 5, name: 'Resumen y Envío', fields: ['aceptaTerminosYPolitica'] },
];

interface MultiStepFormProps {
  onSuccess?: () => void;
}

const MultiStepForm = ({ onSuccess }: MultiStepFormProps) => {
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
      ...(Object.fromEntries(HOGAR_ASEGURABILIDAD_KEYS.map(key => [key, ''])) as Record<HogarAsegurabilidadKey, ''>),
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
  

  // Navigation buttons open a step without errors left over from an earlier
  // attempt to validate it. The server-error handler in onSubmit calls
  // setCurrentStep directly instead, so the errors it has just set survive.
  const goToStep = (index: number) => {
    clearErrors(steps[index].fields as (keyof FormSchemaType)[]);
    setCurrentStep(index);
  };

  // Keeps focus in the current field while a navigation button is pressed.
  // Otherwise mousedown blurs the field, its onBlur validation adds or removes an
  // error message, the button shifts under the pointer and the click is lost.
  // Skipping that blur validation is safe: handleNext and onSubmit validate the
  // whole step themselves.
  const keepFieldFocus = (event: MouseEvent<HTMLButtonElement>) => event.preventDefault();

  // Call onSuccess callback when form is submitted
  useEffect(() => {
    if (formSubmitted && onSuccess) {
      onSuccess();
    }
  }, [formSubmitted, onSuccess]);

  const handleNext = async () => {
    const fields = steps[currentStep].fields;
    // Validate all fields in the current step when proceeding
    const output = await trigger(fields as (keyof FormSchemaType)[], { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
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

    // Check total file size before submitting
    let totalFileSize = 0;
    for (const pair of formData.entries()) {
      if (pair[1] instanceof File) {
        totalFileSize += pair[1].size;
      }
    }
    const MAX_TOTAL_SIZE = 4 * 1024 * 1024; // 4MB to leave room for form data overhead
    if (totalFileSize > MAX_TOTAL_SIZE) {
      toast({
        variant: "destructive",
        title: "Archivos demasiado grandes",
        description: `El tamaño total de los archivos (${(totalFileSize / (1024 * 1024)).toFixed(1)}MB) excede el límite de 4MB. Por favor, reduce el tamaño o la cantidad de archivos.`,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetchWithRetry('/api/send-insurance-application-email', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: formData, // El navegador establecerá automáticamente el Content-Type a multipart/form-data
        credentials: 'include',
        // Keep the client above the server's maxDuration (60s) so a slow-but-
        // successful upload resolves with the server's real result instead of a
        // false "tardó demasiado" that would tempt the user into a resubmit.
        timeoutMs: 63000,
        retries: 1,
      });

      const { ok, status, data: result, errorMessage } = await safeParseResponse(response);

      if (ok) {
        setFormSubmitted(true);
      } else {
        // Handle CSRF-specific errors
        if (status === 403 && (result as Record<string, unknown>)?.message?.toString().includes('CSRF')) {
          toast({
            title: "Error de Seguridad",
            description: "Token de seguridad inválido. Recargando página...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          return;
        }

        // Handle validation errors
        if (status === 400 && result?.errors) {
          let stepWithError = -1;
          Object.entries(result.errors as Record<string, string[]>).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              methods.setError(field as keyof FormSchemaType, {
                type: 'server',
                message: messages[0]
              });
              steps.forEach((step, index) => {
                if (step.fields.includes(field) && stepWithError === -1) {
                  stepWithError = index;
                }
              });
            }
          });
          if (stepWithError !== -1 && stepWithError !== currentStep) {
            setCurrentStep(stepWithError);
          }
          toast({
            title: "Por favor revisa los campos del formulario",
            description: "Algunos campos tienen errores que necesitan ser corregidos.",
            variant: "destructive",
          });
          return;
        }

        toast({
          variant: "destructive",
          title: "Error al Enviar Solicitud",
          description: errorMessage || (result?.message as string) || "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        });
        console.error('API Error:', result);
      }
    } catch (error) {
      console.error('Error de red u otro error:', error);
      const timedOut = isTimeoutError(error);
      toast({
        variant: "destructive",
        title: timedOut ? "El envío tardó demasiado" : "Error de Conexión",
        description: timedOut
          ? "El envío tardó demasiado, posiblemente por el tamaño de los archivos o una conexión lenta. Intenta con menos archivos o desde una red WiFi."
          : "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo. Si el problema persiste, intenta con menos archivos o desde una red WiFi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {formSubmitted ? (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <FormSuccessScreen
            title="¡Solicitud Enviada!"
            description="Hemos recibido tu solicitud correctamente."
            showEmailConfirmation={true}
            email={methods.watch('email')}
            onDismiss={() => {
              setFormSubmitted(false);
              setCurrentStep(0);
              methods.reset();
            }}
          />
        </div>
      ) : (
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

        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between items-stretch sm:items-center pt-6 border-t mt-8">
          {currentStep > 0 && (
            <Button 
              type="button" 
              onClick={handlePrev}
              onMouseDown={keepFieldFocus}
              variant="outline"
              className="w-full sm:w-auto min-h-[44px] touch-manipulation"
            >
              Anterior
            </Button>
          )}
          <div className="hidden sm:block" /> 
          {currentStep < steps.length - 1 && (
            <Button 
              type="button" 
              onClick={handleNext}
              onMouseDown={keepFieldFocus}
              className="w-full sm:w-auto min-h-[44px] touch-manipulation order-first sm:order-none"
            >
              Siguiente
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button 
              type="submit"
              onMouseDown={keepFieldFocus}
              disabled={isSubmitting || !csrfToken}
              className="w-full sm:w-auto min-h-[44px] touch-manipulation order-first sm:order-none"
            >
              {!csrfToken ? 'Cargando...' : isSubmitting ? 'Enviando...' : 'Firmar y Enviar Solicitud'}
            </Button>
          )}
        </div>
        </form>
      </FormProvider>
      )}
    </div>
  );
};

export default MultiStepForm;
