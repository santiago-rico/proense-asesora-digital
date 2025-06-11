import React from 'react';

interface StepProps {
  number: string;
  title: string;
  description: string;
}

const StepCard: React.FC<StepProps> = ({ number, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-4 md:p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

const HowItWorksSection: React.FC = () => {
  const steps: StepProps[] = [
    {
      number: '1',
      title: 'Déjanos tus datos',
      description: 'Completa el formulario con tu información básica. Es rápido y seguro.',
    },
    {
      number: '2',
      title: 'Recibe tu asesoría',
      description: 'Uno de nuestros expertos te contactará para entender tus necesidades y presentarte las mejores opciones.',
    },
    {
      number: '3',
      title: 'Elige y protégete',
      description: 'Selecciona el plan que más te convenga y ¡listo! Tu póliza se activa y ya estás protegido.',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-sky-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Obtener tu seguro es así de fácil
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            En solo 3 pasos, estarás protegido. Nuestro objetivo es que el proceso sea rápido y transparente.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
