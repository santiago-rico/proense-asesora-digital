
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRecentBlogPosts } from "@/services/blogService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BlogPostCard from "@/components/shared/BlogPostCard";

const RecentBlogSection: React.FC = () => {
  const { data: recentPosts, isLoading } = useQuery({
    queryKey: ["recentPosts"],
    queryFn: () => getRecentBlogPosts(3),
  });

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Noticias y Consejos</h2>
          <p className="text-gray-700">
            Mantente informado con nuestros artículos sobre seguros, finanzas personales y protección.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="h-[400px]">
                  <div className="animate-pulse">
                    <div className="bg-gray-200 aspect-video" />
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded my-2" />
                      <div className="h-8 bg-gray-200 rounded my-2" />
                      <div className="h-4 bg-gray-200 rounded my-2" />
                      <div className="h-4 bg-gray-200 rounded my-2" />
                    </div>
                  </div>
                </Card>
              ))
          ) : !recentPosts || recentPosts.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500">
              <p>No hay artículos recientes disponibles en este momento.</p>
            </div>
          ) : (
            recentPosts.map(post => <BlogPostCard key={post._id} post={post} />)
          )}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline">
            <Link to="/blog">Ver todos los artículos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecentBlogSection;
