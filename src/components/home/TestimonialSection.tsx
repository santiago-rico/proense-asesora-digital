
import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import TestimonialCard from "@/components/shared/TestimonialCard";
import type { Testimonial } from "@/components/shared/TestimonialCard";

const testimonialsData: Testimonial[] = [
  {
    id: 1,
    name: 'Gabriel Dario Velasquez',
    since: 2019,
    quote: 'Al principio dudaba sobre el seguro de vida, pero la asesoría de Proense fue clave. Cuando me diagnosticaron cáncer, su gestión fue mi mayor apoyo, superando todas mis expectativas. Ha sido una de las mejores inversiones de mi vida.',
    insuranceType: 'Seguro de Vida',
  },
  {
    id: 2,
    name: 'Nelson Franco',
    since: 2018,
    quote: 'Tuve un accidente y me sentí protegido en todo momento. Me asignaron abogado, conciliador y hasta un carro de reemplazo. También respondieron de maravilla con un problema en mi local. ¡Un servicio integral y muy eficiente!',
    insuranceType: 'Seguro de Auto y PYME',
  },
  {
    id: 3,
    name: 'Frutales del Eje SAS',
    since: 2020,
    quote: 'Proense ha sido más que un proveedor, un aliado estratégico. Su agilidad y capacidad de gestión nos han dado soluciones efectivas en los momentos más difíciles. Los recomendamos al 100%.',
    insuranceType: 'Seguro Empresarial',
  },
  {
    id: 4,
    name: 'Luz Estela Muñoz Cardenas',
    since: 2021,
    quote: 'El servicio y la atención son excelentes. Siempre están pendientes de la renovación de mis pólizas y entienden perfectamente mis necesidades. ¡Muy eficientes!',
    insuranceType: 'Seguro de Cumplimiento',
  },
  {
    id: 5,
    name: 'Gloria Lucía López Velasquez',
    since: 2022,
    quote: 'Valoro enormemente su puntualidad y recordatorios. Sentir que tengo un equipo que me apoya constantemente marca toda la diferencia.',
    insuranceType: 'Seguro de Hogar',
  },
  {
    id: 6,
    name: 'Mónica Patricia Mogollon Sarmiento',
    since: 2023,
    quote: 'La puntualidad con la que entregan la información es impecable. Es un servicio en el que realmente se puede confiar.',
    insuranceType: 'Seguro de Arrendamiento',
  },
];

const TestimonialSection: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg text-gray-600">
            Miles de colombianos confían en nosotros para proteger lo que más valoran.
          </p>
        </div>

        <Carousel className="max-w-6xl mx-auto mt-8 sm:mt-12 md:mt-16">
          <CarouselContent className="-ml-4 p-4">
            {testimonialsData.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-4 sm:basis-1/2 md:basis-1/2 lg:basis-1/3">
                <TestimonialCard testimonial={testimonial} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-6 sm:mt-8">
            <CarouselPrevious className="static transform-none mx-2" />
            <CarouselNext className="static transform-none mx-2" />
          </div>
        </Carousel>
        
      </div>
    </section>
  );
};

export default TestimonialSection;
