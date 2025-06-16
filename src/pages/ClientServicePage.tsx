
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/shared/HeroBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

interface ClientServicePageProps {
  type: "emision" | "modificacion" | "cancelacion" | "siniestro";
  handleOpenLeadDialog: () => void;
}

const ClientServicePage: React.FC<ClientServicePageProps> = ({ type, handleOpenLeadDialog }) => {
  const { toast } = useToast();

  const serviceData = {
    emision: {
      title: "Emisión de Pólizas",
      description: "Solicita la emisión de una nueva póliza con nuestro proceso sencillo y seguro.",
      heroImage: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&q=80",
      formTitle: "Solicitud de Emisión de Póliza",
      steps: [
        "Completa el formulario con tus datos personales y la información del seguro solicitado.",
        "Adjunta la documentación requerida según el tipo de seguro.",
        "Firma electrónicamente para confirmar la solicitud.",
        "Un asesor revisará tu solicitud y te contactará para finalizar el proceso."
      ]
    },
    modificacion: {
      title: "Modificaciones de Pólizas",
      description: "Gestiona cambios en tu póliza existente de manera rápida y efectiva.",
      heroImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80",
      formTitle: "Solicitud de Modificación de Póliza",
      steps: [
        "Indica tu número de póliza y datos personales.",
        "Especifica los cambios que deseas realizar en tu póliza.",
        "Adjunta documentación de respaldo si es necesario.",
        "Firma electrónicamente para autorizar los cambios."
      ]
    },
    cancelacion: {
      title: "Cancelación de Pólizas",
      description: "Solicita la cancelación de tu póliza siguiendo nuestro proceso estructurado.",
      heroImage: "https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?auto=format&fit=crop&q=80",
      formTitle: "Solicitud de Cancelación de Póliza",
      steps: [
        "Proporciona los datos de identificación de tu póliza.",
        "Indica el motivo de la cancelación.",
        "Firma electrónicamente para confirmar la solicitud.",
        "Recibirás una confirmación de cancelación una vez procesada."
      ]
    },
    siniestro: {
      title: "Información de Siniestros",
      description: "Reporta un siniestro o solicita información sobre el estado de un reclamo existente.",
      heroImage: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80",
      formTitle: "Solicitud de Información sobre Siniestros",
      steps: [
        "Proporciona los detalles de tu póliza y del siniestro.",
        "Describe lo ocurrido y adjunta evidencias fotográficas.",
        "Incluye cualquier documento relevante para el reclamo.",
        "Un gestor de siniestros se pondrá en contacto contigo para guiarte en el proceso."
      ]
    }
  };

  const data = serviceData[type];

  const formSchema = z.object({
    nombreCompleto: z.string().min(2, { message: "El nombre es requerido" }),
    email: z.string().email({ message: "Email inválido" }),
    telefono: z.string().min(7, { message: "Teléfono inválido" }),
    numeroPóliza: z.string().optional(),
    tipoSeguro: z.string().min(1, { message: "Por favor seleccione un tipo de seguro" }),
    metodoPago: type === "emision" ? z.string().min(1, { message: "Por favor seleccione un método de pago" }) : z.string().optional(),
    periodicidadPago: type === "emision" ? z.string().min(1, { message: "Por favor seleccione la periodicidad" }) : z.string().optional(),
    detallesSolicitud: z.string().min(10, { message: "Por favor proporcione detalles de su solicitud" }),
    terminos: z.boolean().refine((val) => val === true, { message: "Debes aceptar los términos y condiciones" }),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: "",
      email: "",
      telefono: "",
      numeroPóliza: "",
      tipoSeguro: "",
      metodoPago: "",
      periodicidadPago: "",
      detallesSolicitud: "",
      terminos: false,
    },
  });

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

  const metodosPago = [
    { value: "tarjeta", label: "Tarjeta de Crédito" },
    { value: "debito", label: "Débito Automático" },
    { value: "transferencia", label: "Transferencia Bancaria" },
    { value: "efectivo", label: "Pago en Efectivo" },
  ];

  const periodicidades = [
    { value: "mensual", label: "Mensual" },
    { value: "trimestral", label: "Trimestral" },
    { value: "semestral", label: "Semestral" },
    { value: "anual", label: "Anual" },
  ];

  const onSubmit = (formData: FormData) => {
    console.log("Form data:", formData);
    toast({
      title: "Solicitud enviada",
      description: "Gracias por tu solicitud. Un asesor se pondrá en contacto contigo pronto.",
    });
    form.reset();
  };

  // Mock file upload function
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast({
        title: "Archivo cargado",
        description: `Se ha subido el archivo: ${e.target.files[0].name}`,
      });
    }
  };

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <HeroBanner 
        title={data.title}
        description={data.description} 
        ctaText="Ir al Formulario"
        backgroundImage={data.heroImage}
        handleOpenLeadDialog={handleOpenLeadDialog}
      />

      {/* Steps Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Proceso de {data.title}</h2>
            <p className="text-gray-700">
              Sigue estos sencillos pasos para completar tu solicitud de {data.title.toLowerCase()}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.steps.map((step, index) => (
              <Card key={index} className="relative">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  {index + 1}
                </div>
                <CardContent className="pt-8 pb-6">
                  <p>{step}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-gray-50" id="service-form">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">{data.formTitle}</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="nombreCompleto"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu nombre completo" {...field} />
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
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                              <Input placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu número telefónico" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(type === "modificacion" || type === "cancelacion" || type === "siniestro") && (
                        <FormField
                          control={form.control}
                          name="numeroPóliza"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Póliza</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: POL-12345678" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="tipoSeguro"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Seguro</FormLabel>
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
                    </div>

                    {type === "emision" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="metodoPago"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Método de Pago Preferido</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un método de pago" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {metodosPago.map((metodo) => (
                                      <SelectItem key={metodo.value} value={metodo.value}>
                                        {metodo.label}
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
                          name="periodicidadPago"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Periodicidad de Pago</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona la periodicidad" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {periodicidades.map((period) => (
                                      <SelectItem key={period.value} value={period.value}>
                                        {period.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="detallesSolicitud"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detalles de la Solicitud</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Por favor proporciona todos los detalles relevantes para tu solicitud"
                              rows={5}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Documentos Adjuntos</p>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">Arrastra archivos aquí o</p>
                          <label className="mt-2 inline-block">
                            <span className="rounded bg-primary px-3 py-1 text-sm text-white cursor-pointer">
                              Seleccionar archivos
                            </span>
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={handleFileUpload}
                              multiple
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Formatos aceptados: PDF, JPG, PNG (máx. 5MB por archivo)
                        </p>
                      </div>

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
                                <Link to="/politica-de-privacidad" className="underline hover:text-gray-900">
                                  Política de Privacidad
                                </Link>{" "}
                                y los{" "}
                                <Link to="/terminos-y-condiciones" className="underline hover:text-gray-900">
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
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Firma Electrónica</p>
                      <div className="border border-gray-300 rounded-md p-4 bg-gray-50 text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          Al hacer clic en "Firmar y Enviar", usted está firmando electrónicamente este documento según lo establecido en la Ley 527 de 1999.
                        </p>
                        <Button type="submit" className="w-full">
                          Firmar y Enviar Solicitud
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">¿Necesitas ayuda?</h2>
            <p className="mb-6 text-gray-700">
              Si tienes dudas sobre cómo completar este formulario, nuestro equipo está listo para asistirte.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild variant="outline">
                <a href="/contacto">Contactar a un Asesor</a>
              </Button>
              <Button asChild variant="link">
                <a href="/faq">Preguntas Frecuentes</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ClientServicePage;
