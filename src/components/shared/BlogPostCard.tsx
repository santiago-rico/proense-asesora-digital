
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { urlFor } from "@/sanity/imageUrl";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import OptimizedImage from "@/components/shared/OptimizedImage";

interface SanityImageAsset {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

interface PortableTextBlock {
  _type: string;
  _key: string;
  children?: Array<{
    _type: string;
    _key: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _type: string;
    _key: string;
    [key: string]: unknown;
  }>;
  style?: string;
  level?: number;
}

export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: SanityImageSource;
  category: string;
  date: string;
  author: string;
  body?: PortableTextBlock[];
}

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
  };
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video overflow-hidden">
        <OptimizedImage
          src={urlFor(post.featuredImage).width(800).url()}
          alt={post.title}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {post.category}
          </Badge>
          <span className="text-xs text-gray-500">{formatDate(post.date)}</span>
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
