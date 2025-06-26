
import React from 'react';

// This interface should ideally be in a central types file, but for now, it's updated here.
export interface Testimonial {
  id: number;
  name: string;
  since: number;
  quote: string;
  insuranceType: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col h-full relative overflow-hidden transform hover:scale-105 transition-transform duration-300">
      {/* Decorative Quotation Mark */}
      <div className="absolute top-0 left-0 -translate-x-2 -translate-y-4 text-[120px] font-extrabold text-sky-50 opacity-90 z-0">
        “
      </div>

      {/* Main Content (relative to stay on top) */}
      <div className="relative z-10 flex flex-col h-full">
        <p className="text-gray-700 italic text-lg mb-6">
          "{testimonial.quote}"
        </p>
        
        {/* Spacer to push attribution to the bottom */}
        <div className="mt-auto">
          <p className="font-bold text-gray-900">{testimonial.name}</p>
          <p className="text-sm text-gray-500">Cliente desde {testimonial.since}</p>
          
          <div className="mt-4">
            <span className="inline-block bg-sky-100 text-sky-800 text-xs font-semibold px-3 py-1 rounded-full">
              {testimonial.insuranceType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
