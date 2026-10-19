import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import HeroBanner from "@/components/shared/HeroBanner";
import LeadForm from "@/components/forms/LeadForm";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { insuranceProductsData, InsuranceProductData } from "@/data/insuranceProductsData";
import { getBlogPostsByCategory } from "@/services/blogService";
import { BlogPost } from "@/components/shared/BlogPostCard";
import { getIcon } from "@/lib/utils";
import { PRODUCT_BLOG_CATEGORIES } from "@/constants/blogCategories";
import HowItWorksSection from '../components/insurance/HowItWorksSection';
import FaqSchema from '../components/seo/FaqSchema';
import RelatedArticlesSection from '@/components/insurance/RelatedArticlesSection';
import ValuePropositionSection from '../components/shared/ValuePropositionSection';

interface InsuranceProductPageProps {
  type?: string;
  handleOpenLeadDialog: () => void;
}

const InsuranceProductPage: React.FC<InsuranceProductPageProps> = ({ type: propType, handleOpenLeadDialog }) => {
  const params = useParams();
  const routeType = params.type;
  const currentInsuranceType = propType || routeType;

  const blogCategory = currentInsuranceType ? PRODUCT_BLOG_CATEGORIES[currentInsuranceType] : undefined;

  const { data: relatedArticles, isLoading: isLoadingArticles } = useQuery<
    BlogPost[],
    Error
  >({
    queryKey: ["relatedArticles", blogCategory],
    queryFn: () => getBlogPostsByCategory(blogCategory!),
    enabled: !!blogCategory && !!currentInsuranceType && !!insuranceProductsData[currentInsuranceType], // Only run query if category exists and insurance type is valid
  });

  if (!currentInsuranceType || !insuranceProductsData[currentInsuranceType]) {
    return <Navigate to="/" replace />;
  }

  const data: InsuranceProductData = insuranceProductsData[currentInsuranceType];

  const handleScrollToForm = () => {
    document.getElementById('lead-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      {data.faq && data.faq.length > 0 && <FaqSchema faqData={data.faq} />}
      <HeroBanner
        title={data.title}
        description={data.heroDescription}
        ctaText={data.heroCtaText}
        backgroundImage={data.heroImage}
        imagePosition={data.heroImagePosition}
        handleOpenLeadDialog={handleOpenLeadDialog}
        useOptimizedImage={true}
      />



      {/* Coverages Section */}
      <section className="pt-8 sm:pt-12 md:pt-20 pb-8 sm:pb-12 md:pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div>
            <div className="mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-primary">{data.coveragesTitle}</h2>
              {data.shortDescription && (
                <p className="text-lg text-gray-700 mb-8">{data.shortDescription}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.coverages.map((coverage, index) => {
                const IconComponent = getIcon(coverage.icon);
                return (
                  <div key={index} className="flex items-start p-4 bg-white rounded-lg shadow-md">
                    <div className="flex-shrink-0">
                      {IconComponent && <IconComponent className="h-8 w-8 text-primary" />}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-800">{coverage.title}</h4>
                      <p className="text-gray-600">{coverage.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {data.coveragesCtaText && (
              <div className="mt-8 sm:mt-12 md:mt-16 text-center">
                <Button
                  onClick={handleScrollToForm}
                  className="bg-secondary text-secondary-foreground font-bold py-4 px-8 rounded-lg text-xl hover:bg-secondary/80 transition-colors"
                >
                   ¡Quiero cotizar mi seguro ahora!
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <ValuePropositionSection title="Más que una Póliza: El Respaldo Personalizado de Proense" className="bg-white" />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* FAQ Section */}
      {data.faq && data.faq.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-primary">
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

      {/* Related Articles Section */}
      {!isLoadingArticles && relatedArticles && relatedArticles.length > 0 && (
        <RelatedArticlesSection articles={relatedArticles} />
      )}

      {/* Lead Form Section */}
      <section id="lead-form-section" className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-gray-50 p-4 sm:p-6 md:p-8 rounded-lg shadow-xl">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-primary">{data.leadFormTitle}</h3>
              <p className="text-md text-gray-700">
                {data.leadFormSubtitle}
              </p>
            </div>
            <LeadForm initialInsuranceType={currentInsuranceType || ""} />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      {data.contactSectionTitle && (
        <section className="py-8 sm:py-12 md:py-16 bg-primary text-white">
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
    </Layout>
  );
};

export default InsuranceProductPage;