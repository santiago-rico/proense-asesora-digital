import React from "react";
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
    description: 'Te ayudamos a entender tus opciones y a elegir la cobertura que realmente necesitas, sin enredos.',
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

const ValueProposition: React.FC = () => {
  return (
    <section className="pt-12 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">¿Por qué elegir Proense Seguros?</h2>
          <p className="text-gray-700 mb-8">
            En Proense Seguros nos destacamos por ofrecer un servicio personalizado,
            enfocado en las necesidades específicas de cada cliente.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {valueItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4 h-full">
              <div className="flex items-center justify-center h-20 w-20 mb-4">
                {
                  item.stat ? (
                    <div className="text-primary text-5xl font-bold">{item.stat}</div>
                  ) : (
                    item.icon && <item.icon className="text-primary h-14 w-14" strokeWidth={1.5} />
                  )
                }
              </div>
              <h3 className="uppercase font-bold text-gray-800 text-md mb-3 tracking-wider">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
