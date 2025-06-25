import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import es from 'react-phone-number-input/locale/es.json';

const tiposSeguro = [
  { value: "vida", label: "Seguro de Vida" },
  { value: "salud", label: "Seguro de Salud" },
  { value: "hogar", label: "Seguro de Hogar" },
  { value: "auto", label: "Seguro de Auto" },
  { value: "viaje", label: "Seguro de Viaje" },
  { value: "arl", label: "ARL" },
  { value: "empresarial", label: "Seguro Empresarial" },
  { value: "mascotas", label: "Seguro para Mascotas" },
  // Add more as needed
];

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre es requerido" }),
  email: z.string().email({ message: "Email inválido" }),
  telefono: z.string().refine(isValidPhoneNumber, { message: "Número de teléfono inválido" }),
  tipoSeguro: z.string().min(1, { message: "Por favor seleccione un tipo de seguro" }),
  mensaje: z.string().optional(),
  terminos: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface LeadFormProps {
  initialInsuranceType?: string;
  onLinkClick?: () => void;
  title?: string;
  subtitle?: string;
}

const LeadForm: React.FC<LeadFormProps> = ({ initialInsuranceType, onLinkClick, title, subtitle }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      tipoSeguro: initialInsuranceType || "",
      mensaje: "",
      terminos: false,
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
      };

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al enviar la solicitud.');
      }

      toast({
        title: "Solicitud enviada con éxito",
        description: result.message || "Gracias por contactarnos. Un asesor se pondrá en contacto contigo pronto.",
      });
      form.reset({
        nombre: "",
        email: "",
        telefono: "",
        tipoSeguro: initialInsuranceType || "",
        mensaje: "",
        terminos: false,
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
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="tu@email.com" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo de seguro" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposSeguro.map((tipo) => (
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LeadForm;
