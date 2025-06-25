
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import BlogPostCard, { BlogPost } from "@/components/shared/BlogPostCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBlogPosts } from "@/services/blogService";
import { urlFor } from "@/sanity/imageUrl";
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface BlogListPageProps {
  handleOpenLeadDialog: () => void;
}

const BlogListPage: React.FC<BlogListPageProps> = ({ handleOpenLeadDialog }) => {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["blogPosts"],
    queryFn: getBlogPosts,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const featuredPost = useMemo(() => posts?.[0], [posts]);
  const latestPosts = useMemo(() => posts?.slice(1) || [], [posts]);
  const popularPosts = useMemo(() => posts?.slice(1, 4) || [], [posts]);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return latestPosts.slice(startIndex, startIndex + postsPerPage);
  }, [latestPosts, currentPage]);

  const totalPages = Math.ceil(latestPosts.length / postsPerPage);

  const renderSkeleton = () => (
    <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-gray-200 rounded-lg h-96 w-full mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
    </div>
  );

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <div className="bg-gray-50 pt-8">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Main Content */}
            <main className="lg:col-span-2">
              {isLoading ? (
                renderSkeleton()
              ) : featuredPost ? (
                <section>
                  <h2 className="text-3xl font-bold mb-6">Artículo Destacado</h2>
                  <Card className="overflow-hidden shadow-lg border border-gray-200 rounded-xl">
                    <img 
                      src={urlFor(featuredPost.featuredImage).width(1200).height(600).url()} 
                      alt={featuredPost.title} 
                      className="w-full h-auto object-cover"
                    />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                        <Badge variant="secondary">{featuredPost.category}</Badge>
                        <span>{new Date(featuredPost.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-3 hover:text-primary transition-colors">
                        <Link to={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                      <Button asChild>
                        <Link to={`/blog/${featuredPost.slug}`}>Leer Artículo Completo <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                </section>
              ) : null}

              <section className="mt-12">
                <h2 className="text-3xl font-bold mb-6">Últimos Artículos</h2>
                {latestPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {paginatedPosts.map((post) => (
                      <BlogPostCard key={post._id} post={post} />
                    ))}
                  </div>
                ) : (
                  <p>No se encontraron más artículos.</p>
                )}
              </section>

              {totalPages > 1 && (
                 <div className="flex justify-center items-center space-x-2 mt-12">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>&lt;</Button>
                    {[...Array(totalPages)].map((_, i) => (
                        <Button key={i} variant={currentPage === i + 1 ? 'default' : 'outline'} size="icon" onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
                    ))}
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>&gt;</Button>
                </div>
              )}
            </main>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
                <div className="sticky top-24 space-y-8">
                    {/* Get Your Free Quote */}
                    <Card className="shadow-lg border-gray-200 rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-xl">Cotiza Tu Seguro Gratis</CardTitle>
                            <p className="text-sm text-gray-500 pt-1">Protege lo que más importa. Obtén una cotización personalizada en minutos.</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="Nombre Completo" />
                            <Input type="email" placeholder="Correo Electrónico" />
                            <Input type="tel" placeholder="Número de Celular" />
                            <Input placeholder="Tipo de Seguro" />
                            <Button className="w-full" onClick={handleOpenLeadDialog}>Cotizar Gratis</Button>
                            <p className="text-xs text-center text-gray-500 flex items-center justify-center"><ShieldCheck className="h-4 w-4 mr-1 text-green-600"/> Seguro y Confidencial</p>
                        </CardContent>
                    </Card>

                    {/* Popular Articles */}
                    <Card className="shadow-lg border-gray-200 rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-xl">Artículos Populares</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {popularPosts.map(post => (
                                <div key={post._id}>
                                    <Link to={`/blog/${post.slug}`} className="font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-2">{post.title}</Link>
                                    <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Stay Updated */}
                    <Card className="shadow-lg bg-blue-600 text-white rounded-xl p-6">
                        <h3 className="text-xl font-bold">Mantente Actualizado</h3>
                        <p className="text-sm text-blue-100 mt-1 mb-4">Recibe los últimos consejos de seguros y noticias del sector en tu correo.</p>
                        <div className="space-y-3">
                            <Input type="email" placeholder="Tu correo electrónico" className="bg-white text-gray-900"/>
                            <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-gray-100">Suscríbete Ahora</Button>
                        </div>
                    </Card>
                </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogListPage;
