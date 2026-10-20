import { Button } from "@/components/ui/button";
import React from "react";

interface BlogCtaSectionProps {
  handleOpenLeadDialog: () => void;
}

const BlogCtaSection: React.FC<BlogCtaSectionProps> = ({ handleOpenLeadDialog }) => {
  return (
    <section className="py-12 md:py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Listo para Proteger lo que Más Quieres?
          </h2>
          <p className="mb-6 text-lg text-white">
            Nuestros asesores están listos para ayudarte a encontrar la protección
            adecuada para ti, tu familia o tu negocio.
          </p>
          <Button
            onClick={handleOpenLeadDialog}
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Solicitar Asesoría
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogCtaSection;
