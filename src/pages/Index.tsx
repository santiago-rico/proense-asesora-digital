import React from "react";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/shared/HeroBanner";
import InsuranceTypesSection from "@/components/home/InsuranceTypesSection";
import ValueProposition from "@/components/home/ValueProposition";
import PartnersSection from "@/components/home/PartnersSection";
import TestimonialSection from "@/components/home/TestimonialSection";
import RecentBlogSection from "@/components/home/RecentBlogSection";
import CallToActionSection from "@/components/home/CallToActionSection";

const Index: React.FC = () => {
  return (
    <Layout>
      <HeroBanner
        title="Protege lo que más valoras con expertos a tu lado"
        subtitle="Más de 25 años de experiencia ayudando a familias y profesionales colombianos a encontrar la protección adecuada."
        ctaText="Solicitar asesoría gratuita"
        ctaLink="/contacto"
        secondaryCtaText="Conoce todos nuestros seguros"
        secondaryCtaLink="/seguros"
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
      <CallToActionSection />
    </Layout>
  );
};

export default Index;
