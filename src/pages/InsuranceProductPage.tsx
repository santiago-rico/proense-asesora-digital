import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/shared/HeroBanner";
import LeadForm from "@/components/forms/LeadForm";
import LeadGenerationDialog from "@/components/forms/LeadGenerationDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface InsuranceProductPageProps {
  type: string;
}

const InsuranceProductPage: React.FC<InsuranceProductPageProps> = ({ type }) => {
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const handleOpenLeadDialog = () => setIsLeadDialogOpen(true);

  const insuranceData = {
    vida: {
      title: "Seguro de Vida",
      description: "Protege a tus seres queridos y garantiza su futuro financiero.",
      heroImage: "/images/hero-vida.jpg",
      heroImagePosition: 'center 10%',
      benefits: [
        "Protección financiera para tus seres queridos",
        "Cobertura en caso de fallecimiento o invalidez",
        "Indemnización por enfermedades graves",
        "Acumulación de capital a largo plazo",
        "Opciones de cobertura personalizables"
      ],
      features: [
        "Diferentes modalidades adaptadas a tus necesidades",
        "Cobertura desde el primer día",
        "Asistencia y orientación en momentos difíciles",
        "Trámites simplificados para los beneficiarios"
      ]
    },
    salud: {
      title: "Seguro de Salud",
      description: "Accede a la mejor atención médica privada para ti y tu familia.",
      heroImage: "/images/hero-salud.jpg",
      heroImagePosition: 'center 70%',
      benefits: [
        "Acceso a red de clínicas y hospitales privados",
        "Cobertura de consultas, exámenes y tratamientos",
        "Atención médica sin largas esperas",
        "Habitación individual en hospitalización",
        "Cobertura de medicamentos"
      ],
      features: [
        "Planes individuales y familiares",
        "Coberturas nacionales e internacionales",
        "Telemedicina 24/7",
        "Programas de prevención y bienestar"
      ]
    },
    auto: {
      title: "Seguro de Auto",
      description: "Cobertura completa para tu vehículo ante cualquier eventualidad.",
      heroImage: "/images/hero-auto.jpg",
      heroImagePosition: 'left',
      benefits: [
        "Responsabilidad civil ante terceros",
        "Protección contra daños, robo o hurto",
        "Asistencia en carretera 24/7",
        "Vehículo de reemplazo",
        "Cobertura de accidentes personales"
      ],
      features: [
        "Diferentes niveles de cobertura",
        "Servicio de grúa y asistencia vial",
        "Reparación en talleres autorizados",
        "Asesoramiento personal en caso de siniestro"
      ]
    },
    hogar: {
      title: "Seguro de Hogar",
      description: "Protege tu hogar y tus pertenencias contra daños y robos.",
      heroImage: "/images/hero-hogar.jpg",
      heroImagePosition: 'center',
      benefits: [
        "Protección contra incendios, inundaciones y desastres naturales",
        "Cobertura de robo y hurto",
        "Responsabilidad civil familiar",
        "Daños a electrodomésticos y contenido",
        "Asistencia domiciliaria 24/7"
      ],
      features: [
        "Coberturas adaptadas a viviendas propias o arrendadas",
        "Servicios de plomería, cerrajería y electricidad",
        "Indemnización rápida en caso de siniestro",
        "Asesoramiento personalizado"
      ]
    },
    pymes: {
      title: "Seguro para PYMES",
      description: "Soluciones personalizadas para proteger tu negocio.",
      heroImage: "/images/hero-pymes.jpg",
      heroImagePosition: 'center',
      benefits: [
        "Protección de activos e instalaciones",
        "Cobertura de responsabilidad civil empresarial",
        "Protección ante interrupciones de negocio",
        "Cobertura de equipos electrónicos y maquinaria",
        "Asistencia legal y tributaria"
      ],
      features: [
        "Pólizas diseñadas específicamente para pequeñas y medianas empresas",
        "Coberturas modulares según necesidades",
        "Gestión rápida de reclamaciones",
        "Asesoramiento en gestión de riesgos"
      ]
    },
    mascotas: {
      title: "Seguro para Mascotas",
      description: "Cuidado veterinario y protección para tu compañero peludo.",
      heroImage: "/images/hero-mascotas.jpg",
      heroImagePosition: 'center',
      benefits: [
        "Cobertura de consultas veterinarias",
        "Exámenes diagnósticos y tratamientos",
        "Cirugías y hospitalización",
        "Medicamentos recetados",
        "Responsabilidad civil por daños causados por tu mascota"
      ],
      features: [
        "Atención en clínicas veterinarias de la red",
        "Planes para perros y gatos",
        "Línea de orientación veterinaria telefónica",
        "Cobertura de vacunas y desparasitación"
      ]
    },
    motos: {
      title: "Seguro de Motos",
      description: "Coberturas específicas para tu motocicleta y tu seguridad.",
      heroImage: "/images/hero-motos.jpg",
      heroImagePosition: 'center 90%',
      benefits: [
        "Responsabilidad civil obligatoria y voluntaria",
        "Protección contra robo, hurto y daños",
        "Asistencia en carretera especializada",
        "Cobertura de accesorios",
        "Protección para el conductor"
      ],
      features: [
        "Planes específicos según cilindrada y uso",
        "Servicio de grúa especializado",
        "Indemnización por incapacidad temporal",
        "Asesoramiento en caso de siniestro"
      ]
    },
    arrendamiento: {
      title: "Seguro de Arrendamiento",
      description: "Garantiza el pago de tu arriendo y protege tu propiedad.",
      heroImage: "/images/hero-arrendamiento.jpg",
      heroImagePosition: 'center',
      benefits: [
        "Garantía de pago del canon mensual",
        "Cobertura de servicios públicos",
        "Protección contra daños a la propiedad",
        "Asistencia jurídica en procesos de restitución",
        "Tranquilidad para propietarios e inquilinos"
      ],
      features: [
        "Trámite rápido y sencillo",
        "Estudio de arrendatarios",
        "Indemnización oportuna",
        "Asesoramiento legal especializado"
      ]
    },
    viaje: {
      title: "Seguro de Viaje",
      description: "Viaja tranquilo con una cobertura internacional completa.",
      heroImage: "/images/hero-viaje.jpg",
      heroImagePosition: 'center',
      benefits: [
        "Asistencia médica internacional",
        "Cobertura de emergencias y hospitalización",
        "Pérdida de equipaje",
        "Cancelación o interrupción de viaje",
        "Asistencia 24/7 en múltiples idiomas"
      ],
      features: [
        "Planes por días o anuales",
        "Coberturas para viajes nacionales e internacionales",
        "Asistencia telefónica desde cualquier parte del mundo",
        "Servicio de traducción y orientación"
      ]
    }
  };

  const data = insuranceData[type as keyof typeof insuranceData];

  if (!data) {
    return (
      <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Producto no encontrado</h1>
          <p>El tipo de seguro solicitado no existe.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <HeroBanner
        title={data.title}
        subtitle={data.description}
        ctaText={`Solicitar Asesoría ${data.title}`}
        backgroundImage={data.heroImage}
        imagePosition={data.heroImagePosition}
        handleOpenLeadDialog={handleOpenLeadDialog}
      />

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Beneficios del {data.title}</h2>
            <p className="text-gray-700">
              Descubre todas las ventajas que te ofrece nuestro {data.title.toLowerCase()}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="rounded-full bg-green-100 p-1 mr-3 mt-1">
                      <Check className="h-4 w-4 text-secondary" />
                    </div>
                    <p>{benefit}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Características del {data.title}</h2>
            <p className="text-gray-700">
              Nos adaptamos a tus necesidades con soluciones flexibles y personalizadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="rounded-full bg-primary/10 p-2 mr-4">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{feature}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form Section */}
      <section className="py-16 bg-white" id="lead-form">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-4">¿Interesado en {data.title.toLowerCase()}?</h2>
                <p className="text-gray-700 mb-6">
                  Déjanos tus datos y un asesor especializado te contactará para brindarte asesoría personalizada sobre nuestro {data.title.toLowerCase()}.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="rounded-full bg-green-100 p-1 mr-3 mt-1">
                      <Check className="h-4 w-4 text-secondary" />
                    </div>
                    <span>Asesoramiento personalizado</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-green-100 p-1 mr-3 mt-1">
                      <Check className="h-4 w-4 text-secondary" />
                    </div>
                    <span>Comparativa de coberturas y precios</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-green-100 p-1 mr-3 mt-1">
                      <Check className="h-4 w-4 text-secondary" />
                    </div>
                    <span>Sin compromiso</span>
                  </li>
                </ul>
              </div>
              <div>
                <LeadForm initialInsuranceType={type} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">¿Prefieres hablar directamente con un asesor?</h2>
            <p className="mb-6 text-white/90">
              Estamos disponibles para resolver todas tus dudas.
            </p>
            <Button asChild variant="secondary" size="lg">
              <a href="/contacto">Contáctanos Ahora</a>
            </Button>
          </div>
        </div>
      </section>
      <LeadGenerationDialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen} />
    </Layout>
  );
};

export default InsuranceProductPage;
