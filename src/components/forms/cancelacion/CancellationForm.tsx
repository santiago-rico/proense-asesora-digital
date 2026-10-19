import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';
import { Checkbox } from '@/components/ui/checkbox';
import es from 'react-phone-number-input/locale/es.json';
import { isValidPhoneNumber } from 'react-phone-number-input';
import FileUpload from '@/components/forms/emision/FileUpload';
import { useToast } from '@/hooks/use-toast';
import { useCsrf } from '@/hooks/use-csrf';
import { AlertTriangle } from 'lucide-react';
import { FormSuccessScreen } from '@/components/shared/FormSuccessScreen';
import { SERVICE_FORM_INSURANCE_TYPES } from '@/constants/insuranceTypes';
import { safeParseResponse } from '@/utils/safe-response';

const cancellationSchema = z.object({
  documentosAdicionales: z.any().optional(),
  nombreCompleto: z.string().min(1, 'El nombre completo es requerido'),
  numeroCedula: z.string().min(1, 'El número de cédula es requerido'),
  telefono: z.string().refine(isValidPhoneNumber, { message: 'Número de teléfono inválido' }),
  email: z.email({ error: 'Correo electrónico inválido' }),
  nombreAseguradora: z.string().min(1, 'El nombre de la aseguradora es requerido'),
  numeroPoliza: z.string().optional(),
  tipoSeguro: z.string().min(1, 'Debe seleccionar un tipo de seguro'),
  otroSeguro: z.string().optional(),
  cancellationReason: z.string().optional(),
  aceptaTerminosYPolitica: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar la política de privacidad y los términos y condiciones para continuar.',
  }),
  website: z.string().optional(), // Honeypot field
}).superRefine((data, ctx) => {
  if (data.tipoSeguro === 'otro' && (!data.otroSeguro || data.otroSeguro.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['otroSeguro'],
      message: 'Debe especificar el tipo de seguro',
    });
  }
});

type CancellationFormValues = z.infer<typeof cancellationSchema>;


interface CancellationFormProps {
  onSuccess?: () => void;
}

export function CancellationForm({ onSuccess }: CancellationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { token: csrfToken, loading: csrfLoading, error: csrfError, refetch: refetchCsrf } = useCsrf();
  const form = useForm<CancellationFormValues>({
    resolver: zodResolver(cancellationSchema),
    mode: 'onBlur',
    defaultValues: {
      nombreCompleto: '',
      numeroCedula: '',
      telefono: '',
      email: '',
      nombreAseguradora: '',
      numeroPoliza: '',
      tipoSeguro: '',
      otroSeguro: '',
      cancellationReason: '',
      aceptaTerminosYPolitica: false,
      documentosAdicionales: [],
      website: '', // Honeypot field
    },
  });

  const tipoSeguro = form.watch('tipoSeguro');

  // Call onSuccess callback when form is submitted
  useEffect(() => {
    if (formSubmitted && onSuccess) {
      onSuccess();
    }
  }, [formSubmitted, onSuccess]);

  const onSubmit: SubmitHandler<CancellationFormValues> = async (data) => {
    // Validate CSRF token is available
    if (!csrfToken) {
      toast({
        title: "Error de Seguridad",
        description: "Token de seguridad no disponible. Por favor, recarga la página e intenta de nuevo.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'documentosAdicionales' && Array.isArray(value)) {
        value.forEach(file => {
          formData.append(key, file);
        });
      } else if (value !== null && value !== undefined) {
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
    const MAX_TOTAL_SIZE = 4 * 1024 * 1024; // 4MB
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
      const response = await fetch('/api/send-cancellation-request', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for CSRF validation
        headers: {
          'X-CSRF-Token': csrfToken, // Send CSRF token in header
        },
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
          // Refetch CSRF token and reload form
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          return;
        }

        // Handle validation errors
        if (status === 400 && result?.errors) {
          // Set field-specific errors in the form
          Object.entries(result.errors as Record<string, unknown>).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              form.setError(field as keyof FormData, {
                type: 'server',
                message: messages[0]
              });
            }
          });

          toast({
            title: "Por favor revisa los campos del formulario",
            description: "Algunos campos tienen errores que necesitan ser corregidos.",
            variant: "destructive",
          });
          return;
        }

        throw new Error(errorMessage || (result?.message as string) || 'Error al enviar la solicitud.');
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.';
      toast({
        variant: 'destructive',
        title: 'Error en el envío',
        description: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setFormSubmitted(false);
  };

  return (
    <div>
      {formSubmitted ? (
        <FormSuccessScreen
          title="¡Solicitud de Cancelación Enviada!"
          description="Hemos recibido tu solicitud y hemos enviado un correo electrónico a tu dirección con los detalles."
          showWarning={true}
          warningMessage="Para que tu solicitud de cancelación sea procesada, es indispensable que respondas al correo que te hemos enviado confirmando tu decisión. De lo contrario, la cancelación no se hará efectiva."
          onDismiss={handleReset}
          secondaryActionLabel="Realizar otra solicitud"
          onSecondaryAction={handleReset}
        />
      ) : csrfLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando formulario seguro...</p>
          </div>
        </div>

      ) : csrfError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Error de Seguridad</h3>
          </div>
          <p className="text-red-700 mb-4">
            No se pudo cargar el token de seguridad necesario para el formulario.
          </p>
          <p className="text-sm text-red-600 mb-4">
            Error: {csrfError}
          </p>
          <Button 
            onClick={refetchCsrf}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nombreCompleto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo del tomador <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nombre completo" 
                    {...field} 
                    autoComplete="name"
                    required
                    aria-required="true"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numeroCedula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de cédula del tomador <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Número de cédula" 
                    {...field} 
                    autoComplete="on"
                    required
                    aria-required="true"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Mínimo 6 caracteres
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono de contacto <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <PhoneInput 
                    {...field} 
                    labels={es} 
                    defaultCountry="CO" 
                    placeholder="300 123 4567"
                    searchPlaceholder="Buscar país..." 
                    autoComplete="tel"
                    required
                    aria-required="true"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de contacto <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="tu@email.com" 
                    {...field} 
                    autoComplete="email"
                    required
                    aria-required="true"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombreAseguradora"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la aseguradora <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nombre de la aseguradora" 
                    {...field} 
                    autoComplete="organization"
                    required
                    aria-required="true"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numeroPoliza"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de póliza (Opcional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Número de póliza" 
                    {...field} 
                    autoComplete="off"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoSeguro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Qué seguro quieres cancelar? <span className="text-red-500">*</span></FormLabel>
                {/* No `required` on Select: the hidden native select it renders blocks submit before zod can show its message */}
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger aria-required="true">
                      <SelectValue placeholder="Selecciona un tipo de seguro" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SERVICE_FORM_INSURANCE_TYPES.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {tipoSeguro === 'otro' && (
            <FormField
              control={form.control}
              name="otroSeguro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especifica qué seguro <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Especifica el seguro" 
                      {...field} 
                      autoComplete="off"
                      required
                      aria-required="true"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <FormField
          control={form.control}
          name="cancellationReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo de la cancelación (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el motivo de la cancelación"
                  className="resize-none"
                  {...field}
                  autoComplete="off"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FileUpload 
          name="documentosAdicionales"
          label="Adjuntar Paz y Salvo u otros documentos (Opcional)"
          multiple
        />

        <FormField
          control={form.control}
          name="aceptaTerminosYPolitica"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Acepto la <a href="/politica-de-privacidad" target="_blank" className="text-primary hover:underline">Política de Privacidad</a> y los <a href="/terminos-y-condiciones" target="_blank" className="text-primary hover:underline">Términos y Condiciones</a> <span className="text-red-500">*</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Honeypot field - hidden from users */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem style={{ display: 'none' }}>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input {...field} tabIndex={-1} autoComplete="off" />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || !csrfToken} className="w-full md:w-auto">
          {isSubmitting ? 'Enviando Solicitud...' : 'Enviar Solicitud de Cancelación'}
        </Button>
        </form>
      </Form>
      )}
    </div>
  );
}
