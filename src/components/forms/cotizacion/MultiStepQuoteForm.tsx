import { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Step1_PersonalInfo from './Step1_PersonalInfo';
import Step2_InsuranceSelection from './Step2_InsuranceSelection';
import Step3_ConditionalFields from './Step3_ConditionalFields';
import Step5_Summary from './Step5_Summary';
import { Button } from '@/components/ui/button';
import NumberedProgressBar from './NumberedProgressBar';
import { useToast } from '@/hooks/use-toast';
import { quoteFormSchema, QuoteFormSchemaType } from './formSchema';
import { FormSuccessScreen } from '@/components/shared/FormSuccessScreen';
import { safeParseResponse } from '@/utils/safe-response';

const steps = [
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
    name: 'Detalles del Seguro',
    fields: [
      'monthlyIncome',
      'maritalStatus',
      'hasChildren',
      'vehicleMake',
      'vehicleModel',
      'vehicleYear',
      'propertyType',
      'propertyValue',
      'preExistingConditions',
      'petType',
      'petName',
      'petAge',
      'additionalComments'
    ]
  },
  {
    id: 4,
    name: 'Resumen y Envío',
    fields: ['acceptTerms']
  }
];

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

  const methods = useForm<QuoteFormSchemaType>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
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

  useEffect(() => {
    // When the step changes, clear any existing errors for the fields of the new current step.
    // This ensures that errors don't persist from a previous attempt to validate this step.
    const fieldsForCurrentStep = steps[currentStep]?.fields;
    if (fieldsForCurrentStep) {
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
