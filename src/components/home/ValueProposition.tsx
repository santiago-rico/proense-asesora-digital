import React from "react";

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
  );
};

export default ValueProposition;
