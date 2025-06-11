import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/shared/HeroBanner";
import LeadForm from "@/components/forms/LeadForm";
import LeadGenerationDialog from "@/components/forms/LeadGenerationDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { insuranceProductsData, InsuranceProductData } from "@/data/insuranceProductsData";
import * as LucideIcons from "lucide-react";
import HowItWorksSection from "../components/insurance/HowItWorksSection";

// Helper to get a Lucide icon component by name
const getIcon = (iconName?: string): React.ElementType | null => {
  if (!iconName) return null;
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.CheckCircle; // Default icon if not found
};

interface InsuranceProductPageProps {
  // The 'type' prop might not be strictly needed if we derive it from useParams
  // but keeping it for potential direct usage or testing.
  type?: string; 
}

const InsuranceProductPage: React.FC<InsuranceProductPageProps> = ({ type: propType }) => {
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const handleOpenLeadDialog = () => setIsLeadDialogOpen(true);

  const params = useParams();
  const routeType = params.type;
  const currentInsuranceType = propType || routeType;

  if (!currentInsuranceType || !insuranceProductsData[currentInsuranceType]) {
    // Or redirect to a 404 page
    return <Navigate to="/" replace />; 
  }

  const data: InsuranceProductData = insuranceProductsData[currentInsuranceType];

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <HeroBanner
        title={data.title}
        description={data.heroDescription}
        ctaText={data.heroCtaText}
        backgroundImage={data.heroImage}
        imagePosition={data.heroImagePosition}
        handleOpenLeadDialog={handleOpenLeadDialog}
      />

      {/* Explanation Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
                {data.explanationTitle}
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                {data.explanationText}
              </p>
            </div>
            <div className="bg-gray-50 p-6 md:p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-secondary">¿Para Quién es Este Seguro?</h3>
              <p className="text-gray-600">
                {data.whoIsItForText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coverages Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
    <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
      {/* Coverages Column (takes 2/3 width on md+) */}
      <div className="md:col-span-2">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">{data.coveragesTitle}</h2>
          {data.shortDescription && (
            <p className="text-lg text-gray-700">{data.shortDescription}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {data.coverages.slice(0, 4).map((coverage, index) => {
            const IconComponent = getIcon(coverage.icon);
            return (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center mb-3">
                    {IconComponent && (
                      <IconComponent className="h-8 w-8 text-secondary mr-4" />
                    )}
                    <CardTitle className="text-xl">{coverage.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  {coverage.description && (
                    <CardDescription>{coverage.description}</CardDescription>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {/* Secondary Benefits Section */}
        {data.secondaryBenefitsTitle && data.secondaryBenefits && data.secondaryBenefits.length > 0 && (
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-semibold mb-3 text-secondary">{data.secondaryBenefitsTitle}</h3>
            {data.secondaryBenefitsSubtitle && (
              <p className="text-gray-600 mb-6">{data.secondaryBenefitsSubtitle}</p>
            )}
            <ul className="space-y-3">
              {data.secondaryBenefits.map((benefit, idx) => {
                const BenefitIcon = getIcon(benefit.icon || "CheckCircle"); // Default to CheckCircle
                return (
                  <li key={idx} className="flex items-start">
                    {BenefitIcon && (
                      <BenefitIcon className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    )}
                    <span className="text-gray-700">{benefit.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {data.coverages.length > 4 && data.coveragesCtaText && (
          <div className="text-center mt-12">
            <Button size="lg" onClick={handleOpenLeadDialog} variant="secondary">
              {data.coveragesCtaText}
            </Button>
          </div>
        )}
      </div>

      {/* Lead Form Column (takes 1/3 width on md+) */}
      <div className="md:col-span-1 bg-white p-6 md:p-8 rounded-lg shadow-xl mt-10 md:mt-0">
        <div className="text-center md:text-left mb-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 text-primary">{data.leadFormTitle}</h3>
          <p className="text-md text-gray-700">
            {data.leadFormSubtitle}
          </p>
        </div>
        <LeadForm initialInsuranceType={currentInsuranceType || ""} />
      </div>
    </div>
        </div>
      </section>
      
      {/* Optional Features Section (if you want to keep it or repurpose) */}
      {data.features && data.features.length > 0 && (
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Características Adicionales</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.features.map((feature, index) => {
                const IconComponent = getIcon(feature.icon);
                return (
                  <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                    {IconComponent && (
                      <IconComponent className="h-6 w-6 text-primary mr-3 mt-1" />
                    )}
                    <div>
                      <h4 className="font-semibold text-lg mb-1">{feature.title}</h4>
                      {feature.description && <p className="text-gray-600">{feature.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* FAQ Section */}
      {data.faq && data.faq.length > 0 && (
        <section className="py-12 md:py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
                Preguntas Frecuentes
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {data.faq.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index} className="bg-white mb-3 p-2 rounded-lg shadow">
                    <AccordionTrigger className="text-lg font-medium hover:no-underline px-4 py-3 text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3 pt-1 text-gray-700">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}


      {/* Final CTA Section */}
      {data.contactSectionTitle && (
        <section className="py-12 md:py-16 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{data.contactSectionTitle}</h2>
              {data.contactSectionSubtitle && (
                <p className="mb-6 text-lg text-white/90">
                  {data.contactSectionSubtitle}
                </p>
              )}
              {data.contactSectionCtaText && (
                 <Button variant="secondary" size="lg" onClick={handleOpenLeadDialog}>
                    {data.contactSectionCtaText}
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
      
      <LeadGenerationDialog 
        open={isLeadDialogOpen} 
        onOpenChange={setIsLeadDialogOpen}
        initialInsuranceType={currentInsuranceType || ""}
      />
    </Layout>
  );
};

export default InsuranceProductPage;