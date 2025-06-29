import React, { useRef, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/shared/HeroBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MultiStepForm from "@/components/forms/emision/MultiStepForm";
import { CancellationForm } from '@/components/forms/cancelacion/CancellationForm';
import { ModificationForm } from '@/components/forms/modificacion/ModificationForm';
import OptimizedImage from "@/components/shared/OptimizedImage";

interface ClientServicePageProps {
  type: "emision" | "modificacion" | "cancelacion" | "siniestro";
  handleOpenLeadDialog: () => void;
}

const emergencyLines = [
  {
    name: "SURA",
    logo: "/lovable-uploads/83a1a1e2-f157-40ab-811c-9b45269da69d.png",
    alt: "Logo de SURA",
    phoneLines: [
      { type: "tel", label: "Celular", value: "#888" },
      { type: "tel", label: "Línea Nacional", value: "018000518888" },
      { type: "whatsapp", label: "WhatsApp", value: "+573152757888" }
    ]
  },
  {
    name: "Allianz",
    logo: "/lovable-uploads/c33875ba-6734-435f-bf22-5586c816d1ce.png",
    alt: "Logo de Allianz",
    phoneLines: [
      { type: "tel", label: "Celular", value: "#265" },
      { type: "tel", label: "Línea Nacional", value: "018000513500" }
    ]
  },
  {
    name: "SBS Seguros",
    logo: "/lovable-uploads/f5c1b75c-0b14-4963-92b5-994f576c1e14.png",
    alt: "Logo de SBS Seguros",
    phoneLines: [
        { type: "tel", label: "Celular", value: "#360" },
        { type: "tel", label: "Línea Nacional", value: "018000911360" },
        { type: "whatsapp", label: "WhatsApp", value: "+573183900000" }
    ]
  },
  {
    name: "Assist Card",
    logo: "/lovable-uploads/884861ea-65a5-47a4-8f5a-cec4fbbd14da.png",
    alt: "Logo de Assist Card",
    phoneLines: [
        { type: "tel", label: "Línea Nacional", value: "018000910684" },
        { type: "whatsapp", label: "WhatsApp", value: "+5491127039665" },
        { type: "tel", label: "Bogotá", value: "6016581799" }
    ]
  }
];

const ClientServicePage: React.FC<ClientServicePageProps> = ({ type, handleOpenLeadDialog }) => {
  const formContainerRef = useRef<HTMLDivElement>(null);

  interface ServiceDataType {
    title: string;
    description: string;
    heroImage: string;
    imagePosition?: string;
    formTitle?: string;
    steps?: string[];
    ctaText?: string;
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
      ],
      ctaText: "Ir al Formulario",
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
      ],
      ctaText: "Ir al Formulario",
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
      ],
      ctaText: "Ir al Formulario",
    },
    siniestro: {
      title: "¿Qué hacer en caso de un siniestro?",
      description: "En Proense Seguros, estamos aquí para ayudarte. Sigue estos pasos para reportar tu siniestro de manera efectiva y recibir el soporte que necesitas.",
      heroImage: "/images/hero-contact.jpg",
      imagePosition: "center center",
    }
  };

  const data = serviceData[type];

  const ctaAction = () => {
    const targetElement = document.getElementById(type === 'siniestro' ? "emergency-lines" : "service-form");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFormSuccess = useCallback(() => {
    if (formContainerRef.current) {
      // Adaptive offset based on screen size
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      
      let yOffset = -120; // Desktop offset
      if (isMobile) {
        yOffset = -80; // Smaller offset for mobile
      } else if (isTablet) {
        yOffset = -100; // Medium offset for tablets
      }
      
      const y = formContainerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <HeroBanner
        title={data.title}
        description={data.description}
        ctaText={data.ctaText}
        backgroundImage={data.heroImage}
        imagePosition={data.imagePosition}
        handleOpenLeadDialog={ctaAction}
      />

      {type === 'siniestro' ? (
        <>
          {/* Steps Section for Siniestro */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl font-bold mb-4">Pasos a seguir en caso de un siniestro o emergencia</h2>
                <p className="text-gray-700">Actúa con calma y sigue estas recomendaciones. Estamos aquí para ayudarte.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Card className="relative">
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">1</div>
                  <CardContent className="pt-8 pb-6"><p><b>Contacta a emergencias:</b> Contacta a la línea de emergencias 123 y a la línea de emergencias de tu aseguradora.</p></CardContent>
                </Card>
                <Card className="relative">
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">2</div>
                  <CardContent className="pt-8 pb-6"><p><b>Sigue instrucciones:</b> Presta atención a las recomendaciones de los profesionales que te asisten para no agravar la situación.</p></CardContent>
                </Card>
                <Card className="relative">
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">3</div>
                  <CardContent className="pt-8 pb-6"><p><b>Reúne información:</b> Ten a la mano los detalles de tu póliza y del incidente (fotos, datos de terceros, etc.).</p></CardContent>
                </Card>
                <Card className="relative">
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">4</div>
                  <CardContent className="pt-8 pb-6"><p><b>Inicia tu reclamación:</b> Una vez la emergencia haya pasado, comunícate con nosotros para que juntos realicemos la reclamación.</p></CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Emergency Lines Section */}
          <section className="py-16 bg-gray-50" id="emergency-lines">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl font-bold mb-4">Líneas de Emergencia de Aseguradoras</h2>
                <p className="text-gray-700">Contacta directamente a tu aseguradora utilizando los siguientes números de emergencia.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {emergencyLines.map((company) => (
                  <Card key={company.name} className="flex flex-col items-center p-6 text-center shadow-lg rounded-lg">
                    <OptimizedImage src={company.logo} alt={company.alt} className="h-16 mb-4 object-contain" loading="lazy" />
                    <div className="space-y-2">
                      {company.phoneLines.map((line) => {
                        let href = "";
                        if (line.type === "tel") {
                          href = `tel:${line.value.replace(/\s/g, "")}`;
                        } else if (line.type === "whatsapp") {
                          href = `https://wa.me/${line.value.replace(/\s/g, "")}`;
                        }

                        return (
                          <p key={line.label} className="text-gray-800 font-medium">
                            {line.label}:{' '}
                            {href ? (
                              <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                {line.value}
                              </a>
                            ) : (
                              line.value
                            )}
                          </p>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Steps Section for other types */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl font-bold mb-4">Proceso de {data.title}</h2>
                <p className="text-gray-700">Sigue estos sencillos pasos para completar tu solicitud de {data.title?.toLowerCase()}.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {data.steps?.map((step, index) => (
                  <Card key={index} className="relative">
                    <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">{index + 1}</div>
                    <CardContent className="pt-8 pb-6"><p>{step}</p></CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Form Section for other types */}
          <section className="py-16 bg-gray-50" id="service-form">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto" ref={formContainerRef}>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6">{data.formTitle}</h2>
                    {type === 'emision' ? <MultiStepForm onSuccess={handleFormSuccess} /> :
                     type === 'modificacion' ? <ModificationForm onSuccess={handleFormSuccess} /> :
                     type === 'cancelacion' ? <CancellationForm onSuccess={handleFormSuccess} /> : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Support Section */}
      <section className="py-12 md:py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Necesitas ayuda?</h2>
            <p className="mb-6 text-lg text-white/90">Si tienes dudas sobre el proceso, nuestro equipo está listo para asistirte.</p>
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
