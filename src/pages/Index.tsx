
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/shared/HeroBanner";
import InsuranceCard from "@/components/shared/InsuranceCard";
import BlogPostCard from "@/components/shared/BlogPostCard";
import TestimonialCard from "@/components/shared/TestimonialCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { User, Heart, Shield, Car, Home, Briefcase } from "lucide-react";
import { getRecentBlogPosts } from "@/services/blogService";

const insuranceTypes = [
  {
    title: "Seguro de Vida",
    description: "Protege a tus seres queridos y garantiza su futuro financiero.",
    icon: <Heart className="h-6 w-6" />,
    link: "/seguros/vida",
  },
  {
    title: "Seguro de Salud",
    description: "Accede a la mejor atención médica privada para ti y tu familia.",
    icon: <User className="h-6 w-6" />,
    link: "/seguros/salud",
  },
  {
    title: "Seguro de Auto",
    description: "Cobertura completa para tu vehículo ante cualquier eventualidad.",
    icon: <Car className="h-6 w-6" />,
    link: "/seguros/auto",
  },
  {
    title: "Seguro de Hogar",
    description: "Protege tu hogar y tus pertenencias contra daños y robos.",
    icon: <Home className="h-6 w-6" />,
    link: "/seguros/hogar",
  },
  {
    title: "Seguro para PYMES",
    description: "Soluciones personalizadas para proteger tu negocio.",
    icon: <Briefcase className="h-6 w-6" />,
    link: "/seguros/pymes",
  },
  {
    title: "Seguro para Mascotas",
    description: "Cuidado veterinario y protección para tu compañero peludo.",
    icon: <Shield className="h-6 w-6" />,
    link: "/seguros/mascotas",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Ana María López",
    position: "Cliente desde 2019",
    content: "Mi experiencia con Proense Seguros ha sido excepcional. Su asesoramiento personalizado me ayudó a encontrar el seguro de salud perfecto para mi familia.",
    insuranceType: "Seguro de Salud",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    position: "Cliente desde 2017",
    content: "Cuando tuve un accidente con mi carro, el equipo de Proense se encargó de todo. El proceso de reclamación fue rápido y sin complicaciones.",
    insuranceType: "Seguro de Auto",
  },
  {
    id: 3,
    name: "Elena Martínez",
    position: "Cliente desde 2020",
    content: "Gracias a la asesoría de Proense Seguros, pude encontrar un seguro de vida que se ajustaba perfectamente a mis necesidades y presupuesto.",
    insuranceType: "Seguro de Vida",
  },
  {
    id: 4,
    name: "Roberto Sánchez",
    position: "Cliente desde 2018",
    content: "Como propietario de una pequeña empresa, valoro mucho el conocimiento especializado que Proense aporta para proteger mi negocio.",
    insuranceType: "Seguro para PYMES",
  },
];

const partnerLogos = [
  {
    name: "SURA",
    image: "/lovable-uploads/83a1a1e2-f157-40ab-811c-9b45269da69d.png",
    alt: "Logo de SURA"
  },
  {
    name: "Allianz",
    image: "/lovable-uploads/c33875ba-6734-435f-bf22-5586c816d1ce.png",
    alt: "Logo de Allianz"
  },
  {
    name: "SBS",
    image: "/lovable-uploads/f5c1b75c-0b14-4963-92b5-994f576c1e14.png",
    alt: "Logo de SBS"
  },
  {
    name: "Assist Card",
    image: "/lovable-uploads/884861ea-65a5-47a4-8f5a-cec4fbbd14da.png",
    alt: "Logo de Assist Card"
  }
];

const Index: React.FC = () => {
  const { data: recentPosts, isLoading } = useQuery({
    queryKey: ["recentPosts"],
    queryFn: () => getRecentBlogPosts(3),
  });

  return (
    <Layout>
      <HeroBanner
        title="Protege lo que más valoras con expertos a tu lado"
        subtitle="Más de 25 años de experiencia ayudando a familias y profesionales colombianos a encontrar la protección adecuada."
        ctaText="Solicitar asesoría gratuita"
        ctaLink="/contacto"
        secondaryCtaText="Conoce todos nuestros seguros"
        secondaryCtaLink="/seguros"
        backgroundImage="https://images.unsplash.com/photo-1595581674242-a202193118f7?q=80&auto=format"
      />

      {/* Insurance Types */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Nuestros Seguros</h2>
            <p className="text-gray-700">
              Ofrecemos una amplia gama de soluciones de seguros para proteger lo que más valoras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insuranceTypes.map((insurance, index) => (
              <InsuranceCard
                key={index}
                title={insurance.title}
                description={insurance.description}
                icon={insurance.icon}
                link={insurance.link}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="secondary">
              <Link to="/seguros">Consulta todos nuestros seguros</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Por qué elegir Proense Seguros?</h2>
            <p className="text-gray-700 mb-8">
              En Proense Seguros nos destacamos por ofrecer un servicio personalizado,
              enfocado en las necesidades específicas de cada cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-primary text-5xl font-bold mb-1">+38</div>
              <div className="uppercase font-bold text-gray-800 mb-3">Años</div>
              <p className="text-gray-600">De experiencia como asesores de seguros.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="text-primary text-5xl font-bold mb-1">+5.000</div>
              <div className="uppercase font-bold text-gray-800 mb-3">Clientes</div>
              <p className="text-gray-600">Han confiado en nuestra asesoría para sus seguros.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="text-primary text-5xl font-bold mb-1">+18</div>
              <div className="uppercase font-bold text-gray-800 mb-3">Aseguradoras</div>
              <p className="text-gray-600">Para ofrecer las mejores tarifas y coberturas.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="text-primary text-5xl font-bold mb-1">+20</div>
              <div className="uppercase font-bold text-gray-800 mb-3">Seguros</div>
              <p className="text-gray-600">Para estar protegido ante todo tipo de riesgo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros Aliados Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Nuestros Aliados</h2>
            <p className="text-gray-700">
              Trabajamos con las compañías aseguradoras más reconocidas para ofrecerte las mejores coberturas.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {partnerLogos.map((partner, index) => (
              <div key={index} className="w-32 md:w-40 lg:w-48 p-2 flex items-center justify-center">
                <img 
                  src={partner.image} 
                  alt={partner.alt} 
                  className="w-full h-auto object-contain max-h-20"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-gray-700">
              Miles de colombianos confían en nosotros para proteger lo que más valoran.
            </p>
          </div>

          <Carousel className="max-w-5xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3 p-2">
                  <TestimonialCard testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-6">
              <CarouselPrevious className="static transform-none mx-2" />
              <CarouselNext className="static transform-none mx-2" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Noticias y Consejos</h2>
            <p className="text-gray-700">
              Mantente informado con nuestros artículos sobre seguros, finanzas personales y protección.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="h-[400px]">
                  <div className="animate-pulse">
                    <div className="bg-gray-200 aspect-video" />
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded my-2" />
                      <div className="h-8 bg-gray-200 rounded my-2" />
                      <div className="h-4 bg-gray-200 rounded my-2" />
                      <div className="h-4 bg-gray-200 rounded my-2" />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              recentPosts?.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline">
              <Link to="/blog">Ver todos los artículos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para proteger lo que más valoras?</h2>
            <p className="mb-8 text-white/90">
              Nuestros asesores están disponibles para ayudarte a encontrar la protección adecuada para ti y tu familia.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild variant="secondary" size="lg">
                <Link to="/contacto">Solicitar asesoría gratuita</Link>
              </Button>
              <Button asChild variant="outline" className="text-white border-white bg-black/30 hover:bg-white/20" size="lg">
                <Link to="/seguros">Conoce todos nuestros seguros</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
