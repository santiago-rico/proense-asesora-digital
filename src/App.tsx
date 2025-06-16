import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/utils/ScrollToTop";
import Index from "./pages/Index";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import BlogListPage from "./pages/BlogListPage";
import BlogPostPage from "./pages/BlogPostPage";
import InsuranceProductPage from "./pages/InsuranceProductPage";
import ClientServicePage from "./pages/ClientServicePage";
import NotFound from "./pages/NotFound";
import PoliticaPrivacidadPage from "./pages/PoliticaPrivacidadPage";
import TerminosCondicionesPage from "./pages/TerminosCondicionesPage";
import LeadGenerationDialog from "@/components/forms/LeadGenerationDialog";

const queryClient = new QueryClient();

const App = () => {
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const handleOpenLeadDialog = () => {
    setShowLeadDialog(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/contacto" element={<ContactPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/nosotros" element={<AboutPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/blog" element={<BlogListPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/blog/:slug" element={<BlogPostPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
            
            {/* Insurance Product Pages */}
            <Route path="/seguros/vida" element={<InsuranceProductPage type="vida" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/seguros/salud" element={<InsuranceProductPage type="salud" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/seguros/auto" element={<InsuranceProductPage type="auto" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/seguros/hogar" element={<InsuranceProductPage type="hogar" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/seguros/pymes" element={<InsuranceProductPage type="pymes" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/seguros/mascotas" element={<InsuranceProductPage type="mascotas" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/seguros/motos" element={<InsuranceProductPage type="motos" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/seguros/arrendamiento" element={<InsuranceProductPage type="arrendamiento" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/seguros/viaje" element={<InsuranceProductPage type="viaje" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            
            {/* Client Service Pages */}
            <Route path="/servicios/emision-polizas" element={<ClientServicePage type="emision" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/servicios/modificaciones" element={<ClientServicePage type="modificacion" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/servicios/cancelaciones" element={<ClientServicePage type="cancelacion" handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/servicios/siniestros" element={<ClientServicePage type="siniestro" handleOpenLeadDialog={handleOpenLeadDialog} />} />

            {/* Legal Pages */}
            <Route path="/politica-de-privacidad" element={<PoliticaPrivacidadPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
            <Route path="/terminos-y-condiciones" element={<TerminosCondicionesPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <LeadGenerationDialog open={showLeadDialog} onOpenChange={setShowLeadDialog} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
