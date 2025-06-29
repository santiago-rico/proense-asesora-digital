import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import es from 'react-phone-number-input/locale/es.json';
import { FormSuccessScreen } from "@/components/shared/FormSuccessScreen";
import { LEAD_FORM_INSURANCE_TYPES } from "@/constants/insuranceTypes";

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre es requerido" }),
  email: z.string().email({ message: "Email inválido" }),
  telefono: z.string().refine(isValidPhoneNumber, { message: "Número de teléfono inválido" }),
  tipoSeguro: z.string().min(1, { message: "Por favor seleccione un tipo de seguro" }),
  mensaje: z.string().optional(),
  terminos: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
  website: z.string().optional(), // Honeypot field
});

type FormData = z.infer<typeof formSchema>;

interface LeadFormProps {
  initialInsuranceType?: string;
  onLinkClick?: () => void;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
}

const LeadForm: React.FC<LeadFormProps> = ({ initialInsuranceType, onLinkClick, title, subtitle, onClose }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf-token');
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      tipoSeguro: initialInsuranceType || "",
      mensaje: "",
      terminos: false,
      website: "", // Honeypot field
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        tipoSeguro: data.tipoSeguro,
        mensaje: data.mensaje,
        website: data.website, // Honeypot field
      };

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
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
          Object.entries(result.errors).forEach(([field, messages]) => {
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
        
        throw new Error(result.message || 'Error al enviar la solicitud.');
      }

      setIsSubmitted(true);
      form.reset({
        nombre: "",
        email: "",
        telefono: "",
        tipoSeguro: initialInsuranceType || "",
        mensaje: "",
        terminos: false,
        website: "",
      });

    } catch (error) {
      let errorMessage = "Ocurrió un error al enviar tu solicitud. Por favor, intenta de nuevo.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error al enviar solicitud",
        description: errorMessage,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <FormSuccessScreen
        title="¡Solicitud Enviada!"
        description="Gracias por contactarnos. Un asesor se pondrá en contacto contigo pronto."
        onDismiss={onClose || handleReset}
        className={onClose ? "" : "min-h-[720px] flex flex-col justify-center"}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre completo"
                    {...field}
                    autoComplete="name"
                    required
                  />
                </FormControl>
                <FormDescription>
                  Ingresa tu nombre completo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="tu@email.com"
                    {...field}
                    autoComplete="email"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-2">
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <PhoneInput
                      placeholder="Número telefónico"
                      defaultCountry="CO"
                      labels={es}
                      searchPlaceholder="Buscar país..."
                      {...field}
                      autoComplete="tel"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tipoSeguro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Seguro de Interés</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo de seguro" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_FORM_INSURANCE_TYPES.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mensaje"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensaje (opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="¿En qué podemos ayudarte?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terminos"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    required
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    <span className="text-xs text-gray-600">
                      Acepto la{" "}
                      <Link to="/politica-de-privacidad" className="underline hover:text-gray-900" onClick={onLinkClick}>
                        Política de Privacidad
                      </Link>{" "}
                      y los{" "}
                      <Link to="/terminos-y-condiciones" className="underline hover:text-gray-900" onClick={onLinkClick}>
                        Términos y Condiciones
                      </Link>
                      .
                    </span>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          {/* Honeypot field for bot protection */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem className="sr-only">
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} tabIndex={-1} autoComplete="off" />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" variant="secondary" className="w-full" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Obtener Mi Asesoría Gratuita'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LeadForm;
