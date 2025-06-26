import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InsuranceCard from "@/components/shared/InsuranceCard";

const insuranceTypes = [
  // First row
  {
    title: "Seguro de Vida",
    description: "Protege a tus seres queridos y garantiza su futuro financiero ante cualquier eventualidad, asegurando su bienestar y tranquilidad.",
    icon: <span>❤️</span>,
    link: "/seguros/vida",
  },
  {
    title: "Seguro de Vida Deudores",
    description: "Protege a tu familia de las deudas en caso de fallecimiento o incapacidad, asegurando que no hereden obligaciones financieras y mantengan su estabilidad económica.",
    icon: <span>🏦</span>,
    link: "/seguros/vida-deudores",
  },
  {
    title: "Seguro de Salud",
    description: "Te brinda acceso a una amplia red de clínicas y especialistas, cubriendo consultas, hospitalización, cirugías y tratamientos.",
    icon: <span>⚕️</span>,
    link: "/seguros/salud",
  },
  // Second row
  {
    title: "Seguro de Auto",
    description: "Protección total para tu vehículo contra accidentes, robo, daños a terceros y asistencia en carretera para tu tranquilidad al conducir.",
    icon: <span>🚗</span>,
    link: "/seguros/auto",
  },
  {
    title: "Seguro de Hogar",
    description: "Asegura tu vivienda y contenidos ante incendios, robos, daños por agua y otros imprevistos, cuidando tu patrimonio más importante.",
    icon: <span>🏠</span>,
    link: "/seguros/hogar",
  },
  {
    title: "Seguro para PYMES",
    description: "Ofrecemos coberturas adaptadas a las necesidades de tu pequeña o mediana empresa, protegiendo tus activos y continuidad operativa.",
    icon: <span>💼</span>,
    link: "/seguros/pymes",
  },
];

const InsuranceTypesSection: React.FC = () => {
  return (
    <section className="py-14 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Seguros</h2>
          <p className="text-lg text-gray-600">
            Te acompañamos a encontrar soluciones de seguros para cada aspecto de tu vida, familia y negocio para que vivas con la tranquilidad de estar protegido
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
