import React from "react";
import { clsx } from 'clsx';
import { Award, UserCheck, ShieldCheck, Smile } from 'lucide-react';

const valueItems = [
  {
    stat: '+25',
    title: 'Años de Experiencia',
    description: 'Protegiendo a familias y empresas en Colombia. Nuestro conocimiento es tu mejor respaldo.',
  },
  {
    icon: UserCheck,
    title: 'Asesoría Experta y Personalizada',
    description: 'Te ayudamos a entender tus opciones y a elegir la cobertura que realmente necesitas.',
  },
  {
    icon: ShieldCheck,
    title: 'Apoyo Total en Caso de Siniestro',
    description: 'No estás solo en los momentos difíciles. Te acompañamos y representamos para agilizar tus reclamaciones.',
  },
  {
    stat: '+1000',
    title: 'Clientes Satisfechos',
    description: 'La confianza de más de mil clientes es nuestro mayor orgullo y tu mejor garantía.',
  },
];

interface ValuePropositionSectionProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const ValuePropositionSection: React.FC<ValuePropositionSectionProps> = ({ title, subtitle, className }) => {
  return (
    <section className={clsx("py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-primary">{title}</h2>
          {subtitle && <p className="text-base sm:text-lg text-gray-700">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {valueItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4 h-full">
              <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 mb-4">
                {
                  item.stat ? (
                    <div className="text-primary text-4xl sm:text-5xl font-bold">{item.stat}</div>
                  ) : (
                    item.icon && <item.icon className="text-primary h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.5} />
                  )
                }
              </div>
              <h3 className="uppercase font-bold text-gray-800 text-sm sm:text-md mb-3 tracking-wider">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;
