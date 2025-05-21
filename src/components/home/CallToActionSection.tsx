import React from "react";
// import { Link } from "react-router-dom"; // Link for primary CTA is no longer needed
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom"; // Keep for secondary CTA

// Define props interface
interface CallToActionSectionProps {
  handleOpenLeadDialog: () => void;
}

function CallToActionSection({ handleOpenLeadDialog }: CallToActionSectionProps) {
  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para proteger lo que más valoras?</h2>
          <p className="mb-8 text-white/90">
            Nuestros asesores están disponibles para ayudarte a encontrar la protección adecuada para ti y tu familia.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Modified primary CTA Button */}
            <Button variant="secondary" size="lg" onClick={handleOpenLeadDialog}>
              Solicitar asesoría gratuita
            </Button>
            <Button asChild variant="outline" className="text-white border-white bg-black/30 hover:bg-white/20" size="lg">
              <Link to="/seguros">Conoce todos nuestros seguros</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CallToActionSection;
