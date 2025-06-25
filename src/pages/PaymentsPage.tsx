import React from "react";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/shared/HeroBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const paymentLinks = [
  {
    name: "SURA",
    logo: "/lovable-uploads/83a1a1e2-f157-40ab-811c-9b45269da69d.png",
    alt: "Logo de SURA",
    url: "https://www.segurossura.com.co/paginas/pago-express.aspx/"
  },
  {
    name: "Allianz",
    logo: "/lovable-uploads/c33875ba-6734-435f-bf22-5586c816d1ce.png",
    alt: "Logo de Allianz",
    url: "https://www.allianz.co/clientes/todos-los-clientes/pagos.html"
  },
  {
    name: "SBS Seguros",
    logo: "/lovable-uploads/f5c1b75c-0b14-4963-92b5-994f576c1e14.png",
    alt: "Logo de SBS Seguros",
    url: "https://www.sbseguros.co/servicio-al-cliente/alternativas-pagos"
  }
];

const PaymentsPage: React.FC<{ handleOpenLeadDialog: () => void; }> = ({ handleOpenLeadDialog }) => {
  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <HeroBanner
        title="Paga tu seguro en un solo clic"
        description="Te hacemos la vida más fácil. Solo selecciona tu aseguradora, haz clic y realiza tu pago de forma segura."
        backgroundImage="/images/hero-pagos.jpg"
        imagePosition="center 40%"
      />

      {/* Steps Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Qué tienes que hacer?</h2>
            <p className="text-gray-700">Sigue estos sencillos pasos para realizar el pago de tu póliza de manera segura.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">1</div>
              <CardContent className="pt-8 pb-6"><p><b>Selecciona tu aseguradora:</b> Encuentra la compañía con la que tienes tu póliza.</p></CardContent>
            </Card>
            <Card className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">2</div>
              <CardContent className="pt-8 pb-6"><p><b>Haz clic en el botón:</b> Serás redirigido al portal oficial de pagos de tu aseguradora.</p></CardContent>
            </Card>
            <Card className="relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">3</div>
              <CardContent className="pt-8 pb-6"><p><b>Completa el pago:</b> Sigue las instrucciones en el portal para realizar el pago de tu póliza.</p></CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Links Section */}
      <section className="py-16 bg-gray-50" id="payment-links">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Selecciona tu aseguradora</h2>
            <p className="text-gray-700">Haz clic en el botón para ser redirigido al portal oficial de pagos de tu aseguradora.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {paymentLinks.map((company) => (
              <Card key={company.name} className="flex flex-col items-center p-6 text-center shadow-lg rounded-lg">
                <img src={company.logo} alt={company.alt} className="h-20 mb-6 object-contain" />
                <Button asChild className="mt-auto">
                  <a href={company.url} target="_blank" rel="noopener noreferrer">
                    Ir a pagar
                  </a>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-12 md:py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Necesitas ayuda?</h2>
            <p className="mb-6 text-lg text-white/90">Si tienes preguntas sobre tu póliza o el proceso de pago, no dudes en comunicarte con nosotros. ¡Estamos aquí para ayudarte!</p>
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

export default PaymentsPage;
