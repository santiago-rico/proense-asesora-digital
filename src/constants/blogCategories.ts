/**
 * Blog categories (the titles of Sanity `category` documents) and the
 * insurance product pages they belong to. Product pages list the posts of
 * their category; a post links back to its category's product page.
 */

/** Product page type (the `/seguros/:type` routes in src/App.tsx) → the category of its related articles. */
export const PRODUCT_BLOG_CATEGORIES: Record<string, string> = {
  vida: "Seguro de Vida",
  "vida-deudores": "Seguro de Vida",
  salud: "Seguro de Salud",
  auto: "Seguro de Auto",
  hogar: "Seguro de Hogar",
  pymes: "Seguros para PYMES",
  mascotas: "Seguro para Mascotas",
  motos: "Seguro para Motos",
  arrendamiento: "Seguro de Arrendamiento",
  viaje: "Seguro de Viaje",
};

/**
 * The product page a category's posts link to, or undefined if no product
 * covers it. "Seguro de Vida" posts link to /seguros/vida, not vida-deudores.
 */
export function getCategoryProductPath(category: string): string | undefined {
  const type = Object.keys(PRODUCT_BLOG_CATEGORIES).find(key => PRODUCT_BLOG_CATEGORIES[key] === category);
  return type ? `/seguros/${type}` : undefined;
}

/** A category title as a URL slug: "Seguros para PYMES" → "seguros-para-pymes". */
export function getCategorySlug(category: string): string {
  return category
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The blog list filtered to one category, e.g. /blog?category=seguro-de-vida. */
export function getCategoryBlogPath(category: string): string {
  return `/blog?category=${getCategorySlug(category)}`;
}
