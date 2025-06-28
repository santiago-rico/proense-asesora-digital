import React from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSchemaProps {
  faqData: FaqItem[];
}

const FaqSchema: React.FC<FaqSchemaProps> = ({ faqData }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default FaqSchema;
