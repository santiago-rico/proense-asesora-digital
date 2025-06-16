
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import BlogPostCard, { BlogPost } from "@/components/shared/BlogPostCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getBlogPosts } from "@/services/blogService";

interface BlogListPageProps {
  handleOpenLeadDialog: () => void;
}

const BlogListPage: React.FC<BlogListPageProps> = ({ handleOpenLeadDialog }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: getBlogPosts,
  });

  const categories = [
    "todos",
    "seguro de vida",
    "seguro de salud",
    "seguro de auto",
    "seguros para pymes",
    "seguro de hogar",
    "seguro para mascotas",
  ];

  const filteredPosts = posts?.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === "todos" || 
                            post.category.toLowerCase() === activeCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout handleOpenLeadDialog={handleOpenLeadDialog}>
      <div className="pt-16">
        {/* Page Header */}
        <div className="bg-primary text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Blog</h1>
            <p className="text-lg text-center max-w-3xl mx-auto">
              Información, consejos y novedades sobre seguros y finanzas personales.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="bg-gray-200 h-48"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
              <p className="text-gray-600">
                Intenta con otros términos de búsqueda o categoría.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts?.map((post: BlogPost) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gray-100 py-16 mt-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Suscríbete a nuestro boletín</h2>
              <p className="text-gray-700 mb-6">
                Recibe las últimas novedades sobre seguros, consejos financieros y promociones directamente en tu correo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Input type="email" placeholder="Tu correo electrónico" className="flex-grow" />
                <Button type="submit">Suscribirme</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogListPage;
