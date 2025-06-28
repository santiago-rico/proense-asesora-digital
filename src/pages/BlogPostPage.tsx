
import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getBlogPostBySlug, getRecentBlogPosts } from "@/services/blogService";
import { BlogPost } from "@/components/shared/BlogPostCard";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/imageUrl";
import BlogCtaSection from "@/components/layout/BlogCtaSection";
import LeadForm from "@/components/forms/LeadForm";

interface BlogPostPageProps {
  handleOpenLeadDialog: () => void;
}

const categoryToProductPage: { [key: string]: string } = {
  'Seguro de Vida': '/seguros/vida',
  'Seguro de Salud': '/seguros/salud',
  'Seguro de Auto': '/seguros/auto',
  'Seguro de Hogar': '/seguros/hogar',
  'Seguros para PYMES': '/seguros/empresarial',
  'Seguro de Arrendamiento': '/seguros/rentas',
  'Seguro de Viaje': '/seguros/viaje',
  'Seguro para Mascotas': '/seguros/mascotas',
  'Seguro para Motos': '/seguros/motos',
};

const BlogPostPage: React.FC<BlogPostPageProps> = ({ handleOpenLeadDialog }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: () => getBlogPostBySlug(slug as string),
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ["recentPosts"],
    queryFn: () => getRecentBlogPosts(3),
    enabled: !isLoading && !isError,
  });

  useEffect(() => {
    if (isError) {
      navigate("/blog", { replace: true });
    }
  }, [isError, navigate]);

  if (isLoading) {
    return (
      <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
        <div className="container mx-auto px-4 py-16 mt-16">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-12 w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return null;
  }

  const productPageUrl = categoryToProductPage[post.category];

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <div className="pt-16">
        {/* Article Header */}
        <div className="bg-primary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-3 mb-4">
                <Badge className="bg-white text-primary hover:bg-white/90">
                  {post.category}
                </Badge>
                <span className="text-sm">{post.date}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center">
                <span>Por: {post.author}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <article className="prose prose-lg max-w-none">
                <div className="mb-8">
                  <img
                    src={urlFor(post.featuredImage).width(1200).url()}
                    alt={post.title}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                
                                {post.body && <PortableText value={post.body} />}

                {productPageUrl && (
                  <div className="mt-12 p-6 bg-blue-50 border-l-4 border-primary rounded-r-lg not-prose">
                    <h3 className="text-xl font-bold text-primary">
                      Conoce más sobre el {post.category}
                    </h3>
                    <p className="mt-2 text-gray-700">
                      En Proense, te ofrecemos asesoría experta para que encuentres el plan que mejor se adapta a tus necesidades.
                    </p>
                    <Button asChild className="mt-4">
                      <Link to={productPageUrl}>Ver detalles del seguro</Link>
                    </Button>
                  </div>
                )}

                {post.tags && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="capitalize">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-12">
                  <Separator className="my-8" />
                  <div className="flex justify-start items-center">
                    <Link to="/blog" className="text-primary hover:underline">
                      ← Volver al Blog
                    </Link>
                  </div>
                </div>
              </article>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <LeadForm 
                  title="¡Hablemos de tu Protección!"
                  subtitle="Déjanos tus datos y te contactaremos para brindarte asesoría personalizada y gratuita."
                />
                <div>
                  <h3 className="text-xl font-bold mb-4">Artículos Relacionados</h3>
                  <div className="space-y-4">
                    {relatedPosts?.filter((p: BlogPost) => p.slug !== slug).map((relatedPost: BlogPost) => (
                      <Card key={relatedPost._id} className="overflow-hidden">
                        <div className="h-32 overflow-hidden">
                          <img
                            src={urlFor(relatedPost.featuredImage).width(400).url()}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold line-clamp-2 hover:text-primary">
                            <Link to={`/blog/${relatedPost.slug}`}>{relatedPost.title}</Link>
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">{relatedPost.date}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Categorías</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/blog?category=seguro-de-vida" className="text-gray-700 hover:text-primary">
                        Seguro de Vida
                      </Link>
                    </li>
                    <li>
                      <Link to="/blog?category=seguro-de-salud" className="text-gray-700 hover:text-primary">
                        Seguro de Salud
                      </Link>
                    </li>
                    <li>
                      <Link to="/blog?category=seguro-de-auto" className="text-gray-700 hover:text-primary">
                        Seguro de Auto
                      </Link>
                    </li>
                    <li>
                      <Link to="/blog?category=seguro-de-hogar" className="text-gray-700 hover:text-primary">
                        Seguro de Hogar
                      </Link>
                    </li>
                    <li>
                      <Link to="/blog?category=seguros-para-pymes" className="text-gray-700 hover:text-primary">
                        Seguros para PYMES
                      </Link>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </div>
        <BlogCtaSection handleOpenLeadDialog={handleOpenLeadDialog} />
      </div>
    </Layout>
  );
};

export default BlogPostPage;
