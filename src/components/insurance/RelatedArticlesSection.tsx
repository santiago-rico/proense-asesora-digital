import React from 'react';
import BlogPostCard, { BlogPost } from '@/components/shared/BlogPostCard';

interface RelatedArticlesSectionProps {
  articles: BlogPost[];
}

const RelatedArticlesSection: React.FC<RelatedArticlesSectionProps> = ({ articles }) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Aprende Más con Nuestros Expertos</h2>
          <p className="text-gray-700">
            Amplía tu conocimiento con nuestros análisis y consejos sobre este seguro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(post => <BlogPostCard key={post._id} post={post} />)}
        </div>
      </div>
    </section>
  );
};

export default RelatedArticlesSection;
