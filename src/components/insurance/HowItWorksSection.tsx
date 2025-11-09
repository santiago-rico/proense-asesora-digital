import React from 'react';
import { FileText, Lightbulb, ShieldCheck } from 'lucide-react';

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const StepCard: React.FC<StepProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-4 md:p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

const HowItWorksSection: React.FC = () => {
  const steps: StepProps[] = [
    {
      icon: <FileText size={32} />,
      title: 'Comparte tus necesidades',
      description: 'Cuéntanos qué necesitas proteger y bríndanos información básica para empezar a buscar tu seguro ideal.',
    },
    {
      icon: <Lightbulb size={32} />,
      title: 'Recibe asesoría experta y gratuita',
      description: 'Un asesor experto de Proense analizará tu caso y te presentará opciones que se adapten a tus necesidades.',
    },
    {
      icon: <ShieldCheck size={32} />,
      title: 'Elige el plan perfecto para ti',
      description: 'Elige con confianza la opción que mejor se adapta a tu vida y presupuesto. Te acompañamos en el proceso para activar tu plan de protección.',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Tu Tranquilidad en 3 Pasos Sencillos
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            En Proense, simplificamos el proceso para que proteger lo que más quieres sea claro, rápido y personalizado.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step) => (
            <StepCard key={step.title} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
