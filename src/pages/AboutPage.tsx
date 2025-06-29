import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import LeadGenerationDialog from "@/components/forms/LeadGenerationDialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Heart, Zap, BarChart2, UserCheck, Handshake, LifeBuoy } from "lucide-react";
import OptimizedImage from "@/components/shared/OptimizedImage";

interface AboutPageProps {
  handleOpenLeadDialog: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ handleOpenLeadDialog }) => {

  // Updated years of experience
  const yearsOfExperience = "25+"; 

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <div className="pt-16">
        {/* Image Hero Section */}
        <section className="relative h-[300px] md:h-[400px] bg-gray-800">
          <OptimizedImage 
            src="/images/hero-about-us.jpeg" // Placeholder image - replace with your desired image
            alt="Sobre Nosotros Proense Asesores" 
            className="absolute inset-0 w-full h-full object-cover opacity-50" // Added opacity to image for better text readability
            loading="eager"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/30"></div> {/* Dark overlay for better text contrast */}
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white">Sobre Nosotros</h1>
          </div>
        </section>

        {/* Introductory Text Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Proense Asesores: Tu Aliado Estratégico en Seguros</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                En Proense Asesores, entendemos que la tranquilidad no tiene precio. Por eso, nos dedicamos a ser tu socio de confianza en el mundo de los seguros, ofreciéndote soluciones claras, personalizadas y efectivas para proteger tu futuro, el de tu familia y tu patrimonio.
              </p>
            </div>
          </div>
        </section>

        {/* Nuestra Trayectoria (Our History) */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-secondary">Nuestra Trayectoria: {yearsOfExperience} Años Protegiendo lo que Más Importa</h2>
                <p className="text-gray-700 mb-4">
                  Proense Asesores nació con una misión clara: brindar asesoría personalizada y de calidad en seguros. Lo que comenzó como una visión enfocada en el cliente ha crecido hasta convertirse en una correduría de seguros reconocida por su compromiso y experticia.
                </p>
                <p className="text-gray-700 mb-4">
                  Durante {yearsOfExperience} años, hemos acompañado a miles de personas, familias y empresas a encontrar la protección adecuada para sus necesidades específicas, construyendo relaciones basadas en la confianza y la transparencia.
                </p>
                <p className="text-gray-700">
                  Hoy, mantenemos firme nuestro compromiso de brindar soluciones innovadoras y un acompañamiento integral, adaptándonos a un mundo en constante cambio sin perder la esencia de un servicio cercano y humano.
                </p>
              </div>
              <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-xl order-1 md:order-2 bg-slate-100 flex items-center justify-center p-8">
                <OptimizedImage 
                  src="/images/logo.png"
                  alt="Proense Asesores Logo" 
                  className="max-w-full max-h-full"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Por Qué Elegirnos (Why Choose Us) - REORDERED AND REFINED */}
        <section className="py-16 md:py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">La Diferencia Proense: Valor Agregado para Ti</h2>
              <p className="text-lg text-gray-700">
                Elegir Proense Asesores significa optar por un servicio que va más allá de una simple póliza. Te ofrecemos:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="rounded-full bg-secondary/10 p-4 mb-4">
                  <UserCheck className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Asesoría Experta y Personalizada</h3>
                <p className="text-gray-600 text-sm">Analizamos tus necesidades para ofrecerte una cobertura a la medida. Más que una cotización, te ayudamos a elegir la solución más adecuada.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="rounded-full bg-secondary/10 p-4 mb-4">
                  <BarChart2 className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Encontramos el Seguro Perfecto para Ti</h3>
                <p className="text-gray-600 text-sm">Comparamos las mejores aseguradoras del país analizando tres factores clave: precios competitivos, coberturas amplias y condiciones claras, para que tomes la mejor decisión.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="rounded-full bg-secondary/10 p-4 mb-4">
                  <Handshake className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Acompañamiento Permanente</h3>
                <p className="text-gray-600 text-sm">Te acompañamos durante toda la vida de tu póliza, gestionando vencimientos y manteniéndote informado para que siempre estés protegido.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="rounded-full bg-secondary/10 p-4 mb-4">
                  <LifeBuoy className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Soporte Integral en Reclamaciones</h3>
                <p className="text-gray-600 text-sm">Cuando más nos necesitas, te ofrecemos nuestro respaldo en la presentación de reclamaciones, asegurando un proceso ágil y sin estrés.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Nuestra Filosofía (Our Philosophy & Values) */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestra Filosofía</h2>
              <p className="text-lg text-gray-700">
                Creemos firmemente que la base de una asesoría excepcional radica en valores sólidos y un enfoque centrado en el cliente.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Confianza y Transparencia</h3>
                  <p className="text-gray-600 text-sm">
                    Construimos relaciones duraderas basadas en la honestidad, la comunicación clara y la total transparencia en cada paso.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Asesoría Personalizada</h3>
                  <p className="text-gray-600 text-sm">
                    Nuestro equipo de expertos se dedica a entender tus necesidades únicas para ofrecerte soluciones de seguros a tu medida.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Compromiso Contigo</h3>
                  <p className="text-gray-600 text-sm">
                    Tu paz mental es nuestra prioridad. Trabajamos para asegurar que tengas la cobertura adecuada y el respaldo necesario.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Innovación Constante</h3>
                  <p className="text-gray-600 text-sm">
                    Adoptamos la innovación para mejorar continuamente tu experiencia y la eficiencia de nuestros servicios de asesoría.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-20 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para Proteger lo que Más Quieres?</h2>
              <p className="mb-8 text-lg text-white/90">Nuestros asesores están listos para ayudarte a encontrar la protección adecuada para ti, tu familia o tu negocio.</p>
              <Button
                onClick={handleOpenLeadDialog}
                size="lg"
                variant="secondary"
                className="px-10 py-6 text-lg"
              >
                Solicitar Asesoría Gratuita
              </Button>
            </div>
          </div>
        </section>
      </div>
      
    </Layout>
  );
};

export default AboutPage;