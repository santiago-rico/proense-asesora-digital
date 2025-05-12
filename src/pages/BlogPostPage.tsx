
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

const BlogPostPage: React.FC = () => {
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
      <Layout>
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

  return (
    <Layout>
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
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                
                <div dangerouslySetInnerHTML={{ __html: post.content }} />

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
                  <div className="flex justify-between items-center">
                    <Link to="/blog" className="text-primary hover:underline">
                      ← Volver al Blog
                    </Link>
                    <Button asChild>
                      <Link to="/contacto">Solicitar Información</Link>
                    </Button>
                  </div>
                </div>
              </article>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">¿Necesitas asesoría?</h3>
                  <p className="text-gray-700 mb-4">
                    Contáctanos para recibir información personalizada sobre tus opciones de seguros.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/contacto">Solicitar Información</Link>
                  </Button>
                </Card>

                <div>
                  <h3 className="text-xl font-bold mb-4">Artículos Relacionados</h3>
                  <div className="space-y-4">
                    {relatedPosts?.filter((p: BlogPost) => p.slug !== slug).map((relatedPost: BlogPost) => (
                      <Card key={relatedPost.id} className="overflow-hidden">
                        <div className="h-32 overflow-hidden">
                          <img
                            src={relatedPost.featuredImage}
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
      </div>
    </Layout>
  );
};

export default BlogPostPage;
