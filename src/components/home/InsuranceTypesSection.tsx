import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InsuranceCard from "@/components/shared/InsuranceCard";
import { Heart, Landmark, Stethoscope, Car, Home, Briefcase } from 'lucide-react';

const insuranceTypes = [
  {
    title: "Seguro de Vida",
    description: "Protege tu futuro y el de tus seres queridos con cobertura integral que garantiza estabilidad financiera ante fallecimiento o incapacidad.",
    icon: <Heart className="w-10 h-10 text-primary" />,
    link: "/seguros/vida",
  },
  {
    title: "Seguro de Vida Deudores",
    description: "Protege a tu familia de heredar deudas en caso de fallecimiento o incapacidad, garantizando su estabilidad financiera.",
    icon: <Landmark className="w-10 h-10 text-primary" />,
    link: "/seguros/vida-deudores",
  },
  {
    title: "Seguro de Salud",
    description: "Te brinda acceso a una amplia red de clínicas y especialistas, cubriendo consultas, hospitalización, cirugías y tratamientos.",
    icon: <Stethoscope className="w-10 h-10 text-primary" />,
    link: "/seguros/salud",
  },
  {
    title: "Seguro de Auto",
    description: "Protección total para tu vehículo contra accidentes, robo, daños a terceros y asistencia en carretera para tu tranquilidad al conducir.",
    icon: <Car className="w-10 h-10 text-primary" />,
    link: "/seguros/auto",
  },
  {
    title: "Seguro de Hogar",
    description: "Asegura tu vivienda y contenidos ante incendios, robos, daños por agua y otros imprevistos, cuidando tu patrimonio más importante.",
    icon: <Home className="w-10 h-10 text-primary" />,
    link: "/seguros/hogar",
  },
  {
    title: "Seguro para PYMES",
    description: "Ofrecemos coberturas adaptadas a las necesidades de tu pequeña o mediana empresa, protegiendo tus activos y continuidad operativa.",
    icon: <Briefcase className="w-10 h-10 text-primary" />,
    link: "/seguros/pymes",
  },
];

const InsuranceTypesSection: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nuestros Seguros</h2>
          <p className="text-base sm:text-lg text-gray-600">
            Te acompañamos a encontrar soluciones de seguros para cada aspecto de tu vida, familia y negocio para que vivas con la tranquilidad de estar protegido
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {insuranceTypes.map((insurance, index) => (
            <InsuranceCard
              key={index}
              title={insurance.title}
              description={insurance.description}
              icon={insurance.icon}
              link={insurance.link}
              className="h-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsuranceTypesSection;
