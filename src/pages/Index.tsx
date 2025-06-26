import React from "react";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/shared/HeroBanner";
import InsuranceTypesSection from "@/components/home/InsuranceTypesSection";
import ValueProposition from "@/components/home/ValueProposition";
import PartnersSection from "@/components/home/PartnersSection";
import TestimonialSection from "@/components/home/TestimonialSection";
import RecentBlogSection from "@/components/home/RecentBlogSection";
import CallToActionSection from "@/components/home/CallToActionSection";

// Define props interface
interface IndexProps {
  handleOpenLeadDialog: () => void;
}

function Index({ handleOpenLeadDialog }: IndexProps) {
  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}> 
      <HeroBanner
        title="Protege lo que más valoras con expertos a tu lado"
        description="Asesores en seguros con más de 25 años de experiencia ayudando a familias y profesionales colombianos a encontrar la protección adecuada."
        ctaText="Solicitar asesoría gratuita"
        handleOpenLeadDialog={handleOpenLeadDialog}
        backgroundImage="/images/hero-image.jpg"
      />

      {/* Insurance Types */}
      <InsuranceTypesSection />

      {/* Value Proposition */}
      <ValueProposition />

      {/* Nuestros Aliados Section */}
      <PartnersSection />

      {/* Testimonials */}
      <TestimonialSection />

      {/* Recent Blog Posts */}
      <RecentBlogSection />

      {/* CTA Section */}
      <CallToActionSection handleOpenLeadDialog={handleOpenLeadDialog} /> 
    </Layout>
  );
}

export default Index;
