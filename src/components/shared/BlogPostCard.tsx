
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  date: string;
  author: string;
}

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video overflow-hidden">
        <img
          src={post.featuredImage}
          alt={post.title}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {post.category}
          </Badge>
          <span className="text-xs text-gray-500">{post.date}</span>
        </div>
        <CardTitle className="text-lg font-bold line-clamp-2 hover:text-primary transition-colors">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm text-gray-500">
          Por: {post.author}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Link
          to={`/blog/${post.slug}`}
          className="text-primary hover:text-primary/80 font-medium text-sm"
        >
          Leer más →
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BlogPostCard;
