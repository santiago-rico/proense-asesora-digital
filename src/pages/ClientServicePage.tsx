
import React from "react";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/shared/HeroBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import MultiStepForm from "@/components/forms/emision/MultiStepForm";
import { ModificationForm } from '@/components/forms/modificacion/ModificationForm';

interface ClientServicePageProps {
  type: "emision" | "modificacion" | "cancelacion" | "siniestro";
  handleOpenLeadDialog: () => void;
}

const ClientServicePage: React.FC<ClientServicePageProps> = ({ type, handleOpenLeadDialog }) => {
  const { toast } = useToast();

  interface ServiceDataType {
  title: string;
  description: string;
  heroImage: string;
  imagePosition?: string;
  formTitle: string;
  steps: string[];
}

const serviceData: Record<ClientServicePageProps["type"], ServiceDataType> = {
    emision: {
      title: "Emisión de Pólizas",
      description: "Solicita la emisión de una nueva póliza con nuestro proceso sencillo y seguro.",
      heroImage: "/images/hero-emision.jpg",
      imagePosition: "center center",
      formTitle: "Solicitud de Emisión de Póliza",
      steps: [
        "Completa el formulario con tus datos personales y la información del seguro solicitado.",
        "Adjunta la documentación requerida según el tipo de seguro.",
        "Acepta la solictud de emisión respondiendo al correo electrónico de confirmación.",
        "Un asesor revisará tu solicitud y te contactará para finalizar el proceso."
      ]
    },
    modificacion: {
      title: "Modificaciones de Pólizas",
      description: "Gestiona cambios en tu póliza existente de manera rápida y efectiva.",
      heroImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80",
      imagePosition: "center center",
      formTitle: "Solicitud de Modificación de Póliza",
      steps: [
        "Indica tu número de póliza y datos personales.",
        "Especifica los cambios que deseas realizar en tu póliza.",
        "Adjunta documentación de respaldo si es necesario.",
        "Acepta la solictud de modificación respondiendo al correo electrónico de confirmación."
      ]
    },
    cancelacion: {
      title: "Cancelación de Pólizas",
      description: "Solicita la cancelación de tu póliza siguiendo nuestro proceso estructurado.",
      heroImage: "https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?auto=format&fit=crop&q=80",
      imagePosition: "center center",
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
      imagePosition: "center center",
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

  const onSubmit = (formData: any) => {
    console.log("Form data:", formData);
    toast({
      title: "Solicitud enviada",
      description: "Gracias por tu solicitud. Un asesor se pondrá en contacto contigo pronto.",
    });
  };

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <HeroBanner
        title={data.title}
        description={data.description}
        ctaText="Ir al Formulario"
        backgroundImage={data.heroImage}
        imagePosition={data.imagePosition}
        handleOpenLeadDialog={() => {
          const formElement = document.getElementById("service-form");
          if (formElement) {
            formElement.scrollIntoView({ behavior: "smooth" });
          }
        }}
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
                {type === 'emision' ? (
                  <MultiStepForm />
                ) : type === 'modificacion' ? (
                  <ModificationForm />
                ) : (
                  <p>Funcionalidad de {data.title} en construcción.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-12 md:py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Necesitas ayuda?</h2>
            <p className="mb-6 text-lg text-white/90">
              Si tienes dudas sobre cómo completar este formulario, nuestro equipo está listo para asistirte.
            </p>
            <div className="mt-6">
              <Button asChild className="bg-secondary hover:bg-secondary/90 h-11 px-8 text-white">
                <a href="/contacto">Contactar a un Asesor</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ClientServicePage;
