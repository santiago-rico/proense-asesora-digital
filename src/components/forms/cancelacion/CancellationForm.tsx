import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';
import { Checkbox } from '@/components/ui/checkbox';
import es from 'react-phone-number-input/locale/es.json';
import { isValidPhoneNumber } from 'react-phone-number-input';
import FileUpload from '@/components/forms/emision/FileUpload';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';

const tiposDeSeguro = [
  { value: 'vida', label: 'Seguro de Vida' },
  { value: 'salud', label: 'Seguro de Salud' },
  { value: 'auto', label: 'Seguro de Auto' },
  { value: 'hogar', label: 'Seguro de Hogar' },
  { value: 'pymes', label: 'Seguro para PYMES' },
  { value: 'mascotas', label: 'Seguro de Mascotas' },
  { value: 'motos', label: 'Seguro de Motos' },
  { value: 'arrendamiento', label: 'Seguro de Arrendamiento' },
  { value: 'viaje', label: 'Seguro de Viaje' },
  { value: 'otro', label: 'Otro' },
];

const cancellationSchema = z.object({
  documentosAdicionales: z.any().optional(),
  nombreCompleto: z.string().min(1, 'El nombre completo es requerido'),
  numeroCedula: z.string().min(1, 'El número de cédula es requerido'),
  telefono: z.string().refine(isValidPhoneNumber, { message: 'Número de teléfono inválido' }),
  email: z.string().email('Correo electrónico inválido'),
  nombreAseguradora: z.string().min(1, 'El nombre de la aseguradora es requerido'),
  numeroPoliza: z.string().optional(),
  tipoSeguro: z.string().min(1, 'Debe seleccionar un tipo de seguro'),
  otroSeguro: z.string().optional(),
  cancellationReason: z.string().optional(),
  aceptaTerminosYPolitica: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar la política de privacidad y los términos y condiciones para continuar.',
  }),
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

const SuccessScreen = ({ onReset }: { onReset: () => void }) => (
  <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg mx-auto text-center border border-green-200">
    <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
    <h2 className="text-2xl font-bold text-gray-800 mb-3">¡Solicitud de Cancelación Enviada!</h2>
    <p className="text-gray-600 mb-4">
      Hemos recibido tu solicitud y hemos enviado un correo electrónico a tu dirección con los detalles.
    </p>
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 text-left">
      <p className="font-bold text-yellow-900">Importante: Acción Requerida</p>
      <p className="text-yellow-800 mt-1">
        Para que tu solicitud de cancelación sea procesada, es <strong>indispensable</strong> que respondas al correo que te hemos enviado confirmando tu decisión. De lo contrario, la cancelación no se hará efectiva.
      </p>
    </div>
    <Button onClick={onReset} size="lg">Realizar otra solicitud</Button>
  </div>
);

export function CancellationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
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
    },
  });

  const tipoSeguro = form.watch('tipoSeguro');

  const onSubmit: SubmitHandler<CancellationFormValues> = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'documentosAdicionales') {
        if (Array.isArray(value)) {
          value.forEach(file => {
            formData.append(key, file);
          });
        }
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    try {
      const response = await fetch('/api/send-cancellation-request', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al enviar la solicitud.');
      }

      setFormSubmitted(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error en el envío',
        description: error instanceof Error ? error.message : 'Ocurrió un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setFormSubmitted(false);
  };

  if (formSubmitted) {
    return <SuccessScreen onReset={handleReset} />;
  }

  return (
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
                  <Input placeholder="Nombre completo" {...field} />
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
                  <Input placeholder="Número de cédula" {...field} />
                </FormControl>
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
                  <PhoneInput {...field} labels={es} defaultCountry="CO" searchPlaceholder="Buscar país..." />
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
                  <Input type="email" placeholder="tu@email.com" {...field} />
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
                  <Input placeholder="Nombre de la aseguradora" {...field} />
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
                  <Input placeholder="Número de póliza" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo de seguro" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposDeSeguro.map((tipo) => (
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
                    <Input placeholder="Especifica el seguro" {...field} />
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
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? 'Enviando Solicitud...' : 'Enviar Solicitud de Cancelación'}
        </Button>
      </form>
    </Form>
  );
}
