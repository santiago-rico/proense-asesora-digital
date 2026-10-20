import { useState, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/utils/ScrollToTop";
import PageLoadingSpinner from "./components/shared/PageLoadingSpinner";
import Index from "./pages/Index";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import LeadGenerationDialog from "@/components/forms/LeadGenerationDialog";

// Lazy load heavy pages to reduce initial bundle size
const AboutPage = lazy(() => import("./pages/AboutPage"));
const BlogListPage = lazy(() => import("./pages/BlogListPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const InsuranceProductPage = lazy(() => import("./pages/InsuranceProductPage"));
const ClientServicePage = lazy(() => import("./pages/ClientServicePage"));
const QuotePage = lazy(() => import("./pages/QuotePage"));
const PaymentsPage = lazy(() => import("./pages/PaymentsPage"));
const PoliticaPrivacidadPage = lazy(() => import("./pages/PoliticaPrivacidadPage"));
const TerminosCondicionesPage = lazy(() => import("./pages/TerminosCondicionesPage"));

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
          <Suspense fallback={<PageLoadingSpinner />}>
            <Routes>
              {/* Keep core pages loaded immediately for better UX */}
              <Route path="/" element={<Index handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/contacto" element={<ContactPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="*" element={<NotFound handleOpenLeadDialog={handleOpenLeadDialog} />} />
              
              {/* Lazy load secondary pages */}
              <Route path="/nosotros" element={<AboutPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
              
              {/* Lazy load blog pages (saves ~200KB from Sanity dependencies) */}
              <Route path="/blog" element={<BlogListPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/blog/:slug" element={<BlogPostPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
              
              {/* Lazy load insurance product pages (saves ~300KB from insurance data) */}
              <Route path="/seguros/vida" element={<InsuranceProductPage type="vida" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/seguros/vida-deudores" element={<InsuranceProductPage type="vida-deudores" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/seguros/salud" element={<InsuranceProductPage type="salud" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/seguros/auto" element={<InsuranceProductPage type="auto" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/seguros/hogar" element={<InsuranceProductPage type="hogar" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/seguros/pymes" element={<InsuranceProductPage type="pymes" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/seguros/mascotas" element={<InsuranceProductPage type="mascotas" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/seguros/motos" element={<InsuranceProductPage type="motos" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/seguros/arrendamiento" element={<InsuranceProductPage type="arrendamiento" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/seguros/viaje" element={<InsuranceProductPage type="viaje" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              
              {/* Lazy load client service pages (saves ~400KB from form components) */}
              <Route path="/clientes/cotizacion" element={<QuotePage handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/clientes/emision-polizas" element={<ClientServicePage type="emision" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/clientes/modificaciones" element={<ClientServicePage type="modificacion" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/clientes/cancelaciones" element={<ClientServicePage type="cancelacion" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/clientes/siniestros" element={<ClientServicePage type="siniestro" handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/clientes/pagos" element={<PaymentsPage handleOpenLeadDialog={handleOpenLeadDialog} />} />

              {/* Lazy load legal pages */}
              <Route path="/politica-de-privacidad" element={<PoliticaPrivacidadPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
              <Route path="/terminos-y-condiciones" element={<TerminosCondicionesPage handleOpenLeadDialog={handleOpenLeadDialog} />} />
            </Routes>
          </Suspense>
          <LeadGenerationDialog open={showLeadDialog} onOpenChange={setShowLeadDialog} />
          {/* <CookieConsent /> */}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
