
import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import TestimonialCard from "@/components/shared/TestimonialCard";

export interface Testimonial {
  id: number;
  name: string;
  position: string;
  image?: string;
  content: string;
  insuranceType: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ana María López",
    position: "Cliente desde 2019",
    content: "Mi experiencia con Proense Seguros ha sido excepcional. Su asesoramiento personalizado me ayudó a encontrar el seguro de salud perfecto para mi familia.",
    insuranceType: "Seguro de Salud",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    position: "Cliente desde 2017",
    content: "Cuando tuve un accidente con mi carro, el equipo de Proense se encargó de todo. El proceso de reclamación fue rápido y sin complicaciones.",
    insuranceType: "Seguro de Auto",
  },
  {
    id: 3,
    name: "Elena Martínez",
    position: "Cliente desde 2020",
    content: "Gracias a la asesoría de Proense Seguros, pude encontrar un seguro de vida que se ajustaba perfectamente a mis necesidades y presupuesto.",
    insuranceType: "Seguro de Vida",
  },
  {
    id: 4,
    name: "Roberto Sánchez",
    position: "Cliente desde 2018",
    content: "Como propietario de una pequeña empresa, valoro mucho el conocimiento especializado que Proense aporta para proteger mi negocio.",
    insuranceType: "Seguro para PYMES",
  },
];

const TestimonialSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Lo que dicen nuestros clientes</h2>
          <p className="text-gray-700">
            Miles de colombianos confían en nosotros para proteger lo que más valoran.
          </p>
        </div>

        <Carousel className="max-w-5xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3 p-2">
                <TestimonialCard testimonial={testimonial} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-6">
            <CarouselPrevious className="static transform-none mx-2" />
            <CarouselNext className="static transform-none mx-2" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialSection;
