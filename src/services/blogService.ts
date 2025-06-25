
import { client } from '@/sanity/client';
import { BlogPost } from '@/components/shared/BlogPostCard';

const postFields = `
  _id,
  title,
  date,
  excerpt,
  'slug': slug.current,
    featuredImage,
  'author': author->name,
  'category': category->title,
`;

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const query = `*[_type == "post"] | order(date desc) { ${postFields} }`;
  const posts = await client.fetch(query);
  return posts;
};

export const getBlogPostBySlug = async (slug: string): Promise<any> => {
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
  const query = `*[_type == "post" && category->title match $category] | order(date desc) { ${postFields} }`;
  const posts = await client.fetch(query, { category });
  return posts;
};

