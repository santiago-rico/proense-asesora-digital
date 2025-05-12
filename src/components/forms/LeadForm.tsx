
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre es requerido" }),
  email: z.string().email({ message: "Email inválido" }),
  telefono: z.string().optional(),
  tipoSeguro: z.string().min(1, { message: "Por favor seleccione un tipo de seguro" }),
  mensaje: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const LeadForm: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      tipoSeguro: "",
      mensaje: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    toast({
      title: "Solicitud enviada",
      description: "Gracias por contactarnos. Un asesor se pondrá en contacto contigo pronto.",
    });
    form.reset();
  };

  const tiposSeguro = [
    { value: "vida", label: "Seguro de Vida" },
    { value: "salud", label: "Seguro de Salud" },
    { value: "auto", label: "Seguro de Auto" },
    { value: "hogar", label: "Seguro de Hogar" },
    { value: "pymes", label: "Seguro para PYMES" },
    { value: "mascotas", label: "Seguro para Mascotas" },
    { value: "arrendamiento", label: "Seguro de Arrendamiento" },
    { value: "viaje", label: "Seguro de Viaje" },
    { value: "otro", label: "Otro" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Solicita Información</h3>
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

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Tu número telefónico" {...field} />
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

          <Button type="submit" className="w-full">
            Enviar Solicitud
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LeadForm;
