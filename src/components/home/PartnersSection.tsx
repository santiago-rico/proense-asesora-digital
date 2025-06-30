
import React from "react";
import OptimizedImage from "@/components/shared/OptimizedImage";

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

const PartnersSection: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Nuestros Aliados</h2>
          <p className="text-sm sm:text-base text-gray-700">
            Trabajamos con las compañías aseguradoras más reconocidas para ofrecerte las mejores coberturas.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          {partnerLogos.map((partner, index) => (
            <div key={index} className="w-24 sm:w-32 md:w-40 lg:w-48 p-2 flex items-center justify-center">
              <OptimizedImage 
                src={partner.image} 
                alt={partner.alt} 
                className="w-full h-auto object-contain max-h-16 sm:max-h-20"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
