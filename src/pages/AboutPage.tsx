
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import LeadGenerationDialog from "@/components/forms/LeadGenerationDialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Briefcase, Users } from "lucide-react";

const AboutPage: React.FC = () => {
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);

  const handleOpenLeadDialog = () => setIsLeadDialogOpen(true);
  // const handleCloseLeadDialog = () => setIsLeadDialogOpen(false); // Not strictly needed if onOpenChange is used directly
  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <div className="pt-16">
        {/* Page Header */}
        <div className="bg-primary text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Sobre Nosotros</h1>
            <p className="text-lg text-center max-w-3xl mx-auto">
              Más de 25 años de experiencia ayudando a colombianos a proteger lo que más valoran.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Nuestra Historia</h2>
                <p className="text-gray-700 mb-4">
                  Proense Seguros nació en 1998 con una misión clara: brindar asesoría personalizada y 
                  de calidad en seguros para las familias colombianas. Lo que comenzó como una pequeña 
                  oficina en Bogotá ha crecido hasta convertirse en una correduría de seguros 
                  reconocida a nivel nacional.
                </p>
                <p className="text-gray-700 mb-4">
                  Durante más de 25 años, hemos ayudado a miles de familias y empresas a encontrar 
                  la protección adecuada para sus necesidades específicas, siempre poniendo el 
                  servicio al cliente y la transparencia como pilares fundamentales.
                </p>
                <p className="text-gray-700">
                  Hoy, seguimos comprometidos con brindar soluciones personalizadas y un 
                  acompañamiento integral a cada uno de nuestros clientes, adaptándonos a las nuevas 
                  tecnologías y necesidades del mercado sin perder nuestra esencia.
                </p>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
                  alt="Oficina de Proense Seguros" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/20"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Nuestros Valores</h2>
              <p className="text-gray-700">
                Estos son los principios que guían nuestro trabajo diario y la relación con nuestros clientes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Confianza</h3>
                  <p className="text-gray-700 text-center">
                    Construimos relaciones a largo plazo basadas en la transparencia y la honestidad.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Servicio</h3>
                  <p className="text-gray-700 text-center">
                    Brindamos atención personalizada y soluciones adaptadas a cada cliente.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Profesionalismo</h3>
                  <p className="text-gray-700 text-center">
                    Contamos con un equipo de expertos altamente capacitados en el sector asegurador.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Nuestro Equipo</h2>
              <p className="text-gray-700">
                Un grupo de profesionales comprometidos con brindarte el mejor servicio y asesoría.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="h-64 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7" 
                    alt="Carlos Rodríguez" 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">Carlos Rodríguez</h3>
                  <p className="text-primary mb-3">Director General</p>
                  <p className="text-gray-700">
                    Con más de 20 años en el sector, Carlos lidera nuestro equipo con una visión clara y un profundo conocimiento del mercado asegurador colombiano.
                  </p>
                </div>
              </div>
              
              {/* Team Member 2 */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="h-64 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2" 
                    alt="Ana Martínez" 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">Ana Martínez</h3>
                  <p className="text-primary mb-3">Directora Comercial</p>
                  <p className="text-gray-700">
                    Ana se especializa en desarrollar soluciones personalizadas para grandes clientes y empresas, garantizando la mejor protección posible.
                  </p>
                </div>
              </div>
              
              {/* Team Member 3 */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="h-64 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" 
                    alt="Javier López" 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">Javier López</h3>
                  <p className="text-primary mb-3">Asesor Senior</p>
                  <p className="text-gray-700">
                    Con 15 años de experiencia, Javier es experto en seguros de vida y salud, ayudando a nuestros clientes a proteger lo que más importa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 md:py-16 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Listo para Proteger lo que Más Quieres?</h2>
              <p className="mb-6 text-lg text-white/90">Nuestros asesores están listos para ayudarte a encontrar la protección adecuada para ti, tu familia o tu negocio.</p>
              <button
                onClick={handleOpenLeadDialog}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11 rounded-md px-8"
              >
                Solicitar Asesoría Gratuita
              </button>
            </div>
          </div>
        </section>
      </div>
      <LeadGenerationDialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen} />
    </Layout>
  );
};

export default AboutPage;
