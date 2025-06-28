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
import HowItWorksSection from '../components/insurance/HowItWorksSection';
import FaqSchema from '../components/seo/FaqSchema';
import RelatedArticlesSection from '@/components/insurance/RelatedArticlesSection';

interface InsuranceProductPageProps {
  type?: string;
  handleOpenLeadDialog: () => void;
}

const insuranceTypeToCategoryMap: { [key: string]: string } = {
  vida: 'Seguro de Vida',
  salud: 'Seguro de Salud',
  auto: 'Seguro de Auto',
  hogar: 'Seguro de Hogar',
  empresarial: 'Seguros para PYMES',
  rentas: 'Seguro de Arrendamiento',
  viaje: 'Seguro de Viaje',
  mascotas: 'Seguro para Mascotas',
  motos: 'Seguro para Motos',
};

const InsuranceProductPage: React.FC<InsuranceProductPageProps> = ({ type: propType, handleOpenLeadDialog }) => {
  const params = useParams();
  const routeType = params.type;
  const currentInsuranceType = propType || routeType;

  if (!currentInsuranceType || !insuranceProductsData[currentInsuranceType]) {
    return <Navigate to="/" replace />;
  }

  const data: InsuranceProductData = insuranceProductsData[currentInsuranceType];

  const blogCategory = insuranceTypeToCategoryMap[currentInsuranceType];

  const { data: relatedArticles, isLoading: isLoadingArticles } = useQuery<
    BlogPost[],
    Error
  >({
    queryKey: ["relatedArticles", blogCategory],
    queryFn: () => getBlogPostsByCategory(blogCategory),
    enabled: !!blogCategory, // Only run query if category exists
  });

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
              <h3 className="text-2xl font-bold text-gray-800 mb-4">¿Para Quién es Este Seguro?</h3>
              <ul className="space-y-4">
                {data.whoIsItFor.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-lg font-semibold text-gray-800">{item.persona}</p>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Coverages Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div>
            <div className="mb-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">{data.coveragesTitle}</h2>
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
              <div className="mt-12 text-center">
                <Button size="lg" onClick={handleScrollToForm} variant="secondary">
                  Cotizar mi Seguro
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {data.features && data.features.length > 0 && (
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Más que una Póliza: El Respaldo Personalizado de Proense</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.features.map((feature, index) => {
                const IconComponent = getIcon(feature.icon);
                return (
                  <div key={index} className="flex items-start p-6 bg-gray-50 rounded-lg shadow-sm">
                    {IconComponent && (
                      <div className="flex-shrink-0">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="ml-4">
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

      {/* Related Articles Section */}
      {!isLoadingArticles && relatedArticles && relatedArticles.length > 0 && (
        <RelatedArticlesSection articles={relatedArticles} />
      )}

      {/* Lead Form Section */}
      <section id="lead-form-section" className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-gray-50 p-6 md:p-8 rounded-lg shadow-xl">
            <div className="text-center mb-8">
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
    </Layout>
  );
};

export default InsuranceProductPage;