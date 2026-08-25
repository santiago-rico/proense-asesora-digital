import { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Step1_PersonalInfo from './Step1_PersonalInfo';
import Step2_InsuranceSelection from './Step2_InsuranceSelection';
import Step3_ConditionalFields from './Step3_ConditionalFields';
import Step5_Summary from './Step5_Summary';
import { Button } from '@/components/ui/button';
import NumberedProgressBar from './NumberedProgressBar';
import { useToast } from '@/hooks/use-toast';
import { quoteFormSchema, QuoteFormSchemaType } from './formSchema';
import { steps, quoteFormDefaultValues } from './formWiring';
import { FormSuccessScreen } from '@/components/shared/FormSuccessScreen';
import { safeParseResponse } from '@/utils/safe-response';

interface MultiStepQuoteFormProps {
  onSuccess?: () => void;
}

const MultiStepQuoteForm = ({ onSuccess }: MultiStepQuoteFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  // Set when we jump to an earlier step *because* its fields have errors, so the
  // effect below does not immediately clear the errors we sent the user to fix.
  const preserveErrorsOnStepChange = useRef(false);

  const methods = useForm<QuoteFormSchemaType>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(quoteFormSchema),
    defaultValues: quoteFormDefaultValues
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

  useEffect(() => {
    // When the step changes, clear any existing errors for the fields of the new current step.
    // This ensures that errors don't persist from a previous attempt to validate this step.
    const fieldsForCurrentStep = steps[currentStep]?.fields;
    if (preserveErrorsOnStepChange.current) {
      // We were sent here by a failed submit (or a 400 from the server) that
      // set errors on these very fields — clearing them now would hide the only
      // thing telling the user why the form would not send.
      preserveErrorsOnStepChange.current = false;
    } else if (fieldsForCurrentStep) {
      clearErrors(fieldsForCurrentStep as (keyof QuoteFormSchemaType)[]);
    }

    // On initial mount, scroll to top of page
    if (isInitialMount.current) {
      isInitialMount.current = false;
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }

    // On step changes (not initial mount), scroll to top of form with extra offset above
    if (formRef.current) {
      const elementPosition = formRef.current.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 100; // 100px above the form

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [currentStep, clearErrors]);

  // Call onSuccess callback when form is submitted
  useEffect(() => {
    if (formSubmitted && onSuccess) {
      onSuccess();
    }
  }, [formSubmitted, onSuccess]);

  const handleNext = async () => {
    const fields = steps[currentStep].fields;
    // Validate all fields in the current step when proceeding
    const output = await trigger(fields as (keyof QuoteFormSchemaType)[], { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // react-hook-form silently drops the submit when validation fails. Every
  // invalid field lives on an earlier, unmounted step, so without this the
  // "Enviar Cotización" button just does nothing: no toast, no scroll, no
  // message — the submission is simply lost.
  const onInvalid = (errors: FieldErrors<QuoteFormSchemaType>) => {
    // Pressing Enter inside any text input submits the form implicitly, on every
    // step. Only the real "Enviar Cotización" button on the last step should
    // react — otherwise we would drag the user forward into steps they have not
    // filled in yet, reporting errors for questions they have not been asked.
    if (currentStep !== steps.length - 1) return;

    const errorFields = Object.keys(errors);
    const stepWithError = steps.findIndex((step) =>
      step.fields.some((field) => errorFields.includes(field))
    );

    if (stepWithError !== -1 && stepWithError < currentStep) {
      preserveErrorsOnStepChange.current = true;
      setCurrentStep(stepWithError);
    }

    toast({
      variant: 'destructive',
      title: 'Faltan datos por completar',
      description: 'Revisa los campos marcados en rojo antes de enviar tu cotización.',
    });
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: QuoteFormSchemaType) => {
    if (!csrfToken) {
      toast({
        title: "Error",
        description: "Por favor, recarga la página e intenta nuevamente.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Quote form data submitted:', data);

    // Flatten birthDate for server-side validation
    const payload: Record<string, string> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return; // Skip null or undefined values
      }

      // Special handling for birthDate object - flatten it to match server schema
      if (key === 'birthDate' && typeof value === 'object' && !Array.isArray(value)) {
        const birthDate = value as { day: string; month: string; year: string };
        payload['birthDate_day'] = birthDate.day;
        payload['birthDate_month'] = birthDate.month;
        payload['birthDate_year'] = birthDate.year;
      } else if (typeof value === 'boolean') {
        // Convert boolean to string for backend validation
        payload[key] = value ? 'true' : 'false';
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // This shouldn't happen with the current schema, but handle it just in case
        payload[key] = JSON.stringify(value);
      } else {
        // String, etc.
        payload[key] = String(value);
      }
    });

    try {
      const response = await fetch('/api/send-quote-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
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
              methods.setError(field as keyof QuoteFormSchemaType, {
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
            preserveErrorsOnStepChange.current = true;
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
          title: "Error al Enviar Cotización",
          description: errorMessage || (result?.message as string) || "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        });
        console.error('API Error:', result);
      }
    } catch (error) {
      console.error('Error de red u otro error:', error);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={formRef}>
      {formSubmitted ? (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <FormSuccessScreen
            title="¡Cotización Enviada!"
            description="Hemos recibido tu solicitud de cotización correctamente."
            showEmailConfirmation={true}
            email={methods.watch('email')}
            showWarning={false}
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
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
            <h3 className="text-xl font-semibold">{steps[currentStep].name}</h3>

            {currentStep === 0 && <Step1_PersonalInfo />}
            {currentStep === 1 && <Step2_InsuranceSelection />}
            {currentStep === 2 && <Step3_ConditionalFields />}
            {currentStep === 3 && <Step5_Summary />}

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
                  className="w-full sm:w-auto min-h-[44px] touch-manipulation order-first sm:order-none"
                >
                  Siguiente
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="submit"
                  disabled={isSubmitting || !csrfToken}
                  className="w-full sm:w-auto min-h-[44px] touch-manipulation order-first sm:order-none"
                >
                  {!csrfToken ? 'Cargando...' : isSubmitting ? 'Enviando...' : 'Enviar Cotización'}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
};

export default MultiStepQuoteForm;
