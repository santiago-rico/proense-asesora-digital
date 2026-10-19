
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import BlogPostCard, { BlogPost } from "@/components/shared/BlogPostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBlogPosts } from "@/services/blogService";
import { ArrowRight } from 'lucide-react';
import LeadForm from "@/components/forms/LeadForm";
import BlogCtaSection from "@/components/layout/BlogCtaSection";
import SanityImage from "@/components/shared/SanityImage";
import { PRODUCT_BLOG_CATEGORIES, getCategorySlug } from "@/constants/blogCategories";
import { formatPostDate } from "@/utils/format-post-date";

interface BlogListPageProps {
  handleOpenLeadDialog: () => void;
}

const BlogListPage: React.FC<BlogListPageProps> = ({ handleOpenLeadDialog }) => {
  const { data: allPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["blogPosts"],
    queryFn: getBlogPosts,
  });

  // ?category=<slug> (e.g. from the "Categorías" links on a post) lists only that category's posts.
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const categorySlug = categoryParam ? getCategorySlug(categoryParam) : "";
  const posts = useMemo(
    () => categorySlug
      ? allPosts?.filter(post => post.category && getCategorySlug(post.category) === categorySlug)
      : allPosts,
    [allPosts, categorySlug],
  );
  // Named after its posts' category, or a known one when it has no posts yet.
  const categoryTitle = categorySlug
    ? posts?.[0]?.category
      ?? Object.values(PRODUCT_BLOG_CATEGORIES).find(category => getCategorySlug(category) === categorySlug)
      ?? categoryParam
    : undefined;

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const latestArticlesRef = useRef<HTMLHeadingElement>(null);

  // The page stays mounted when only the query string changes: a new category starts at page 1.
  const [pageCategory, setPageCategory] = useState(categorySlug);
  if (pageCategory !== categorySlug) {
    setPageCategory(categorySlug);
    setCurrentPage(1);
  }

  const featuredPost = useMemo(() => posts?.[0], [posts]);
  const latestPosts = useMemo(() => posts?.slice(1) || [], [posts]);
  const popularPosts = useMemo(() => allPosts?.slice(1, 4) || [], [allPosts]);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return latestPosts.slice(startIndex, startIndex + postsPerPage);
  }, [latestPosts, currentPage]);

  const totalPages = Math.ceil(latestPosts.length / postsPerPage);

  useEffect(() => {
    if (currentPage > 1) {
      latestArticlesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (currentPage === 1 && latestArticlesRef.current) {
      // Optional: Only scroll if the user is not already near the top
      if (window.scrollY > latestArticlesRef.current.offsetTop) {
        latestArticlesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPage]);

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
      <section className="bg-primary text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Blog</h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto">
            Consejos y guías sobre seguros para que tomes las mejores decisiones al proteger lo que más valoras.
          </p>
        </div>
      </section>
      <div className="bg-gray-50 pt-8">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Main Content (Layout already provides the <main> landmark) */}
            <div className="lg:col-span-2">
              {categorySlug && (
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <span className="text-gray-700">Categoría:</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary-hover">{categoryTitle}</Badge>
                  <Link to="/blog" className="text-primary hover:underline">Ver todos los artículos</Link>
                </div>
              )}
              {isLoading ? (
                renderSkeleton()
              ) : featuredPost ? (
                <section>
                  <h2 className="text-3xl font-bold mb-6">Artículo Destacado</h2>
                  <Card className="overflow-hidden shadow-lg border border-gray-200 rounded-xl">
                    <SanityImage
                      source={featuredPost.featuredImage}
                      alt={featuredPost.title}
                      className="w-full h-auto object-cover"
                      widths={[480, 768, 1024, 1200]}
                      height={600}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 800px"
                      loading="eager"
                    />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                        <Badge variant="secondary">{featuredPost.category}</Badge>
                        <time dateTime={featuredPost.date}>{formatPostDate(featuredPost.date)}</time>
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
                <h2 ref={latestArticlesRef} className="text-3xl font-bold mb-6 scroll-mt-24">Últimos Artículos</h2>
                {latestPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {paginatedPosts.map((post) => (
                      <BlogPostCard key={post._id} post={post} />
                    ))}
                  </div>
                ) : (
                  <p>
                    {categorySlug && !isLoading && !featuredPost
                      ? "Todavía no hay artículos en esta categoría."
                      : "No se encontraron más artículos."}
                  </p>
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
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
                <div className="sticky top-24 space-y-8">
                    {/* Get Your Free Quote */}
                    <LeadForm 
                        title="¡Hablemos de tu Protección!"
                        subtitle="Déjanos tus datos y te contactaremos para brindarte asesoría personalizada."
                    />

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


                </div>
            </aside>
          </div>
        </div>
      </div>
      <BlogCtaSection handleOpenLeadDialog={handleOpenLeadDialog} />
    </Layout>
  );
};

export default BlogListPage;
