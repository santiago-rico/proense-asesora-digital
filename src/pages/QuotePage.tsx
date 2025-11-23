import React, { useRef, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/shared/HeroBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MultiStepQuoteForm from "@/components/forms/cotizacion/MultiStepQuoteForm";

interface QuotePageProps {
  handleOpenLeadDialog: () => void;
}

const QuotePage: React.FC<QuotePageProps> = ({ handleOpenLeadDialog }) => {
  const formContainerRef = useRef<HTMLDivElement>(null);

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

  const ctaAction = () => {
    const targetElement = document.getElementById("quote-form");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <HeroBanner
        title="Cotización de Seguros"
        description="Obtén una cotización personalizada para tu seguro. Completa el formulario y te responderemos con las mejores opciones del mercado."
        ctaText="Ir al Formulario"
        backgroundImage="/images/hero-emision.avif"
        imagePosition="center center"
        handleOpenLeadDialog={ctaAction}
        useOptimizedImage={true}
        customHeightClass="h-[50vh] sm:h-[55vh] md:h-[60vh] min-h-[350px] sm:min-h-[400px] md:min-h-[450px]"
      />

      {/* Steps Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Proceso de Cotización</h2>
            <p className="text-gray-700">Sigue estos sencillos pasos para obtener tu cotización personalizada.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">1</div>
              <CardContent className="pt-8 pb-6"><p>Completa el formulario con tus datos personales y el tipo de seguro que necesitas.</p></CardContent>
            </Card>
            <Card className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">2</div>
              <CardContent className="pt-8 pb-6"><p>Proporciona los detalles específicos del objeto o persona a asegurar.</p></CardContent>
            </Card>
            <Card className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">3</div>
              <CardContent className="pt-8 pb-6"><p>Un asesor analizará tu solicitud y te contactará con las mejores opciones.</p></CardContent>
            </Card>
            <Card className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">4</div>
              <CardContent className="pt-8 pb-6"><p>Recibe cotizaciones comparativas de múltiples aseguradoras en tu correo electrónico.</p></CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-gray-50" id="quote-form">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto" ref={formContainerRef}>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Solicitud de Cotización</h2>
                <MultiStepQuoteForm onSuccess={handleFormSuccess} />
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
            <p className="mb-6 text-lg text-white/90">Si tienes dudas sobre el proceso de cotización, nuestro equipo está listo para asistirte.</p>
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

export default QuotePage;
