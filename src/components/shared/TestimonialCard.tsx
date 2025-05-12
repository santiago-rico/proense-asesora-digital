
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Testimonial {
  id: number;
  name: string;
  position: string;
  image?: string;
  content: string;
  insuranceType: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={testimonial.image} alt={testimonial.name} />
            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold">{testimonial.name}</h4>
            <p className="text-sm text-gray-500">{testimonial.position}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-gray-700">"{testimonial.content}"</div>
        <p className="text-sm text-primary mt-3">Seguro: {testimonial.insuranceType}</p>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
