import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

interface NotFoundProps {
  handleOpenLeadDialog: () => void;
}

const NotFound = ({ handleOpenLeadDialog }: NotFoundProps) => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <p className="text-5xl md:text-6xl font-bold text-primary mb-4">404</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Página no encontrada</h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
          La página que buscas no existe o ya no está disponible. Te invitamos a volver al inicio para conocer nuestros seguros.
        </p>
        <Button asChild>
          <Link to="/">Volver al inicio</Link>
        </Button>
      </section>
    </Layout>
  );
};

export default NotFound;
