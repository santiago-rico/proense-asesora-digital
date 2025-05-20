
import React from "react";
import { Link } from "react-router-dom";
import { Heart, User, Car, Home, Briefcase, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import InsuranceCard from "@/components/shared/InsuranceCard";

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

const InsuranceTypesSection: React.FC = () => {
  return (
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
  );
};

export default InsuranceTypesSection;
