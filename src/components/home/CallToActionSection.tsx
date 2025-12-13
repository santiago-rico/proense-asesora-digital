import React from "react";
import { Button } from "@/components/ui/button";

// Define props interface
interface CallToActionSectionProps {
  handleOpenLeadDialog: () => void;
}

function CallToActionSection({ handleOpenLeadDialog }: CallToActionSectionProps) {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">¿Listo para proteger lo que más valoras?</h2>
          <p className="mb-8 text-white/90">
            Nuestros asesores están disponibles para ayudarte a encontrar la protección adecuada para ti y tu familia.
          </p>
          <div className="flex justify-center">
            <Button variant="secondary" size="lg" onClick={handleOpenLeadDialog}>
              Solicitar Asesoría
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CallToActionSection;
