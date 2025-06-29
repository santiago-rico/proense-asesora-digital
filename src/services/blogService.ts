
import { client } from '@/sanity/client';
import { BlogPost } from '@/components/shared/BlogPostCard';

// Extended blog post type with additional fields for detailed view
interface BlogPostDetailed extends BlogPost {
  body?: Array<{
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
  }>; // Portable Text blocks
  tags?: string[];
}

const postFields = `
  _id,
  title,
  date,
  excerpt,
  'slug': slug.current,
    featuredImage,
  'author': author->name,
  'category': categories[0]->title,
`;

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const query = `*[_type == "post"] | order(date desc) { ${postFields} }`;
  const posts = await client.fetch(query);
  return posts;
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPostDetailed | null> => {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    ${postFields}
    body,
    'tags': tags[]->title
  }`;
  const post = await client.fetch(query, { slug });
  return post;
};

export const getRecentBlogPosts = async (limit: number = 3): Promise<BlogPost[]> => {
  const query = `*[_type == "post"] | order(date desc) [0...$limit] { ${postFields} }`;
  const posts = await client.fetch(query, { limit });
  return posts;
};

export const getBlogPostsByCategory = async (category: string): Promise<BlogPost[]> => {
  const query = `*[_type == "post" && $category in categories[]->title] | order(date desc) { ${postFields} }`;
  const posts = await client.fetch(query, { category });
  return posts;
};

