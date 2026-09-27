/**
 * Blog posts as the Sanity query API returns them after the `postFields`
 * projection in `src/services/blogService.ts`. Served by the `sanity` fixture
 * in `network.ts`.
 */

export interface SanityPost {
  _id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  author: string;
  /** `categories[0]->title`, e.g. 'Seguro de Hogar'. */
  category: string;
  featuredImage: {
    _type: 'image';
    asset: { _type: 'reference'; _ref: string };
    alt?: string;
  } | null;
  body?: unknown[];
  tags?: string[];
}

/** A Portable Text paragraph. */
export function paragraph(text: string, key = 'b1'): unknown {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${key}-s1`, text, marks: [] }],
  };
}

/**
 * One post. The image `_ref` must be `image-<id>-<W>x<H>-<ext>`, or
 * `@sanity/image-url` throws "Malformed asset _ref".
 */
export function blogPost(overrides: Partial<SanityPost> = {}): SanityPost {
  return {
    _id: 'p1',
    title: 'Mi post',
    slug: 'mi-post',
    date: '2025-06-01T12:00:00Z',
    excerpt: 'Un resumen corto del artículo.',
    author: 'Ana',
    category: 'Seguro de Hogar',
    featuredImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: 'image-abc123-800x450-jpg' },
    },
    body: [paragraph('Hola')],
    ...overrides,
  };
}

/**
 * `count` posts, newest first (post 1 is the newest), dated one day apart.
 * Titles/slugs are "Artículo N" / "articulo-N"; categories rotate through `categories`.
 */
export function blogPosts(
  count: number,
  categories: string[] = ['Seguro de Hogar', 'Seguro de Vida', 'Seguro de Auto'],
): SanityPost[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const date = new Date(Date.UTC(2025, 5, 30, 12) - i * 24 * 60 * 60 * 1000);
    return blogPost({
      _id: `p${n}`,
      title: `Artículo ${n}`,
      slug: `articulo-${n}`,
      date: date.toISOString(),
      excerpt: `Resumen del artículo ${n}.`,
      category: categories[i % categories.length],
      featuredImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: `image-img${n}-800x450-jpg` },
      },
      body: [paragraph(`Contenido del artículo ${n}.`)],
    });
  });
}
