import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Step1_PersonalInfo from './Step1_PersonalInfo';
import Step2_InsuranceSelection from './Step2_InsuranceSelection';
import Step3_ConditionalFields from './Step3_ConditionalFields';
import Step4_AdditionalInfo from './Step4_AdditionalInfo';
import Step5_Summary from './Step5_Summary';
import { Button } from '@/components/ui/button';
import NumberedProgressBar from './NumberedProgressBar';
import { useToast } from '@/hooks/use-toast';
import { quoteFormSchema, QuoteFormSchemaType } from './formSchema';
import { FormSuccessScreen } from '@/components/shared/FormSuccessScreen';

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
      'employmentStatus'
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
      'petAge'
    ]
  },
  {
    id: 4,
    name: 'Información Adicional',
    fields: [
      'previousInsurance',
      'previousInsurer',
      'claimsHistory',
      'additionalComments'
    ]
  },
  {
    id: 5,
    name: 'Resumen y Envío',
    fields: ['acceptTerms', 'acceptPrivacy', 'acceptMarketing']
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
      insuranceType: undefined,
      monthlyIncome: '',
      maritalStatus: '',
      hasChildren: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      propertyType: '',
      propertyValue: '',
      preExistingConditions: '',
      petType: '',
      petName: '',
      petAge: '',
      previousInsurance: false,
      previousInsurer: '',
      claimsHistory: '',
      additionalComments: '',
      acceptTerms: false,
      acceptPrivacy: false,
      acceptMarketing: false,
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

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return; // No adjuntar valores nulos o indefinidos
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle nested objects like birthDate
        formData.append(key, JSON.stringify(value));
      } else {
        // Es un string, booleano, etc.
        formData.append(key, String(value));
      }
    });

    try {
      const response = await fetch('/api/send-quote-request', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        setFormSubmitted(true);
        // Reset form after successful submission if needed
        // methods.reset();
      } else {
        // Handle CSRF-specific errors
        if (response.status === 403 && result.message?.includes('CSRF')) {
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
        if (response.status === 400 && result.errors) {
          // Find the first step that has an error
          let stepWithError = -1;

          Object.entries(result.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              methods.setError(field as keyof QuoteFormSchemaType, {
                type: 'server',
                message: messages[0]
              });

              // Find which step contains this field
              steps.forEach((step, index) => {
                if (step.fields.includes(field) && stepWithError === -1) {
                  stepWithError = index;
                }
              });
            }
          });

          // Navigate to the step with the first error
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
          description: result.message || "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        });
        console.error('API Error:', result);
      }
    } catch (error) {
      console.error('Error de red u otro error:', error);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudo enviar la cotización. Verifica tu conexión a internet e intenta de nuevo.",
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
            {currentStep === 3 && <Step4_AdditionalInfo />}
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
