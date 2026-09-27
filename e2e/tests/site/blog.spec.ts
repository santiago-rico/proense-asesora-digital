import type { Page } from '@playwright/test';
import { blogPost, blogPosts } from '../../fixtures/blog-data';
import { test, expect } from '../../fixtures/network';
import { Site } from '../../fixtures/page-objects/site';

const titles = (...numbers: number[]) => numbers.map(n => `Artículo ${n}`);
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Post titles on /blog, in order: the featured post's h3 first, then the grid cards' h3s. */
const listedPostTitles = (page: Page) => page.getByRole('heading', { level: 3, name: /^Artículo \d+$/ });

const pageButton = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

test.describe('Blog: listado', () => {
  test.beforeEach(({ sanity }) => {
    sanity.posts = blogPosts(14);
  });

  test('el artículo más reciente es el destacado, con su fecha en hora de Bogotá', async ({ page, sanity }) => {
    // 02:00 UTC on July 1st is still June 30th in Bogotá (UTC-5).
    sanity.posts[0] = { ...sanity.posts[0], date: '2025-07-01T02:00:00Z' };
    const site = new Site(page);
    await page.goto('/blog');

    await expect(page.getByRole('heading', { level: 2, name: 'Artículo Destacado' })).toBeVisible();
    await expect(listedPostTitles(page).first()).toHaveText('Artículo 1');
    await expect(page.getByText('30 de junio de 2025', { exact: true })).toBeVisible();
    await expect(page.getByText('1 de julio de 2025')).toHaveCount(0);

    await page.getByRole('link', { name: 'Leer Artículo Completo' }).click();
    await expect(page).toHaveURL('/blog/articulo-1');
    await expect(site.h1).toHaveText('Artículo 1');
  });

  test('muestra 6 artículos por página y pagina con "<", números y ">"', async ({ page }) => {
    await page.goto('/blog');
    const previous = pageButton(page, '<');
    const next = pageButton(page, '>');

    // 14 posts: 1 featured + 13 in the grid, so 3 pages.
    await expect(listedPostTitles(page)).toHaveText(titles(1, ...range(2, 7)));
    await expect(page.getByRole('link', { name: 'Leer más →' })).toHaveCount(6);
    for (const name of ['1', '2', '3']) await expect(pageButton(page, name)).toBeVisible();
    await expect(pageButton(page, '4')).toHaveCount(0);
    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();

    await pageButton(page, '2').click();
    await expect(listedPostTitles(page)).toHaveText(titles(1, ...range(8, 13)));
    await expect(previous).toBeEnabled();

    await next.click();
    await expect(listedPostTitles(page)).toHaveText(titles(1, 14));
    await expect(next).toBeDisabled();

    await previous.click();
    await expect(listedPostTitles(page)).toHaveText(titles(1, ...range(8, 13)));
  });

  test('la paginación solo aparece con más de 7 artículos', async ({ page, sanity }) => {
    sanity.posts = blogPosts(7);
    await page.goto('/blog');
    await expect(listedPostTitles(page)).toHaveText(titles(...range(1, 7)));
    await expect(pageButton(page, '<')).toHaveCount(0);
    await expect(pageButton(page, '1')).toHaveCount(0);

    sanity.posts = blogPosts(8);
    await page.reload();
    await expect(listedPostTitles(page)).toHaveText(titles(...range(1, 7)));
    await expect(pageButton(page, '1')).toBeVisible();
    await expect(pageButton(page, '2')).toBeVisible();
    await expect(pageButton(page, '3')).toHaveCount(0);
  });

  test('"Artículos Populares" lista los artículos 2 a 4', async ({ page }) => {
    await page.goto('/blog');
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('heading', { name: 'Artículos Populares' })).toBeVisible();

    const popular = sidebar.getByRole('link', { name: /^Artículo \d+$/ });
    await expect(popular).toHaveText(titles(2, 3, 4));
    for (const [i, n] of [2, 3, 4].entries()) {
      await expect(popular.nth(i)).toHaveAttribute('href', `/blog/articulo-${n}`);
    }
  });

  for (const count of [0, 1]) {
    test(`con ${count} artículo(s) muestra "No se encontraron más artículos."`, async ({ page, sanity }) => {
      sanity.posts = blogPosts(count);
      await page.goto('/blog');
      await expect(page.getByText('No se encontraron más artículos.')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Leer más →' })).toHaveCount(0);
      await expect(pageButton(page, '<')).toHaveCount(0);
      await expect(page.getByRole('heading', { name: 'Artículo Destacado' })).toHaveCount(count);
    });
  }

  test('un enlace /blog?category=… filtra el listado por categoría', async ({ page }) => {
    test.fail(true, 'Known bug: /blog ignores the ?category= query string, so the "Categorías" links on a post show every post, src/pages/BlogListPage.tsx:23-26 (links at src/pages/BlogPostPage.tsx:196-217).');
    // blogPosts() rotates Hogar, Vida, Auto: posts 3, 6, 9 and 12 are "Seguro de Auto".
    await page.goto('/blog?category=seguro-de-auto');
    await expect(listedPostTitles(page).first()).toBeVisible();
    await expect(listedPostTitles(page)).toHaveText(titles(3, 6, 9, 12));
  });
});

test.describe('Blog: artículo', () => {
  test.beforeEach(({ sanity }) => {
    sanity.posts = blogPosts(4);
  });

  test('muestra título, autor, contenido y relacionados sin el artículo actual', async ({ page, sanity }) => {
    const site = new Site(page);
    await page.goto('/blog/articulo-2');

    await expect(site.h1).toHaveText('Artículo 2');
    await expect(page.getByText('Por: Ana', { exact: true })).toBeVisible();
    await expect(page.getByText('Contenido del artículo 2.')).toBeVisible();
    expect(sanity.queries.find(q => 'slug' in q.params)?.params.slug).toBe('articulo-2');

    // Related posts are the 3 most recent (1-3) minus the current one.
    await expect(page.getByRole('heading', { level: 3, name: 'Artículos Relacionados' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 4, name: /^Artículo \d+$/ })).toHaveText(titles(1, 3));
    await expect(page.getByRole('link', { name: 'Artículo 3', exact: true })).toHaveAttribute('href', '/blog/articulo-3');
  });

  test('"Ver detalles del seguro" abre el producto de la categoría y "← Volver al Blog" vuelve al listado', async ({ page }) => {
    const site = new Site(page);
    await page.goto('/blog/articulo-2'); // "Seguro de Vida"

    await page.getByRole('link', { name: 'Ver detalles del seguro' }).click();
    await expect(page).toHaveURL('/seguros/vida');
    await expect(site.h1).toHaveText('Seguro de Vida');

    await page.goBack();
    await expect(site.h1).toHaveText('Artículo 2');
    await page.getByRole('link', { name: '← Volver al Blog' }).click();
    await expect(page).toHaveURL('/blog');
    await expect(listedPostTitles(page).first()).toHaveText('Artículo 1');
  });

  for (const { category, path, h1 } of [
    { category: 'Seguros para PYMES', path: '/seguros/pymes', h1: 'Seguro para PYMES' },
    { category: 'Seguro de Arrendamiento', path: '/seguros/arrendamiento', h1: 'Seguro de Arrendamiento' },
  ]) {
    test(`"Ver detalles del seguro" de "${category}" abre ${path}`, async ({ page, sanity }) => {
      test.fail(true, 'Known bug: the category map sends "Seguros para PYMES" to /seguros/empresarial and "Seguro de Arrendamiento" to /seguros/rentas, which 404, src/pages/BlogPostPage.tsx:27-28.');
      sanity.posts = [blogPost({ category })];
      const site = new Site(page);
      await page.goto('/blog/mi-post');
      await page.getByRole('link', { name: 'Ver detalles del seguro' }).click();
      await expect(page).toHaveURL(path);
      await expect(site.h1).toHaveText(h1);
    });
  }

  test('si Sanity falla, redirige al listado tras los 3 reintentos de React Query', async ({ page, sanity }) => {
    sanity.failWith(500);
    await page.clock.install();
    await page.goto('/blog/articulo-1');
    const attempts = () => sanity.queries.filter(q => q.params.slug === 'articulo-1').length;

    // React Query retries 3 times, after 1 s, 2 s and 4 s.
    for (const [attempt, delay] of [[1, 1000], [2, 2000], [3, 4000]]) {
      await expect.poll(attempts).toBe(attempt);
      await expect(page).toHaveURL('/blog/articulo-1');
      await page.clock.runFor(delay);
    }
    await expect.poll(attempts).toBe(4);
    await expect(page).toHaveURL('/blog');
    await expect(page.getByRole('heading', { level: 2, name: 'Últimos Artículos' })).toBeVisible();
  });

  test('un slug inexistente muestra un "no encontrado" dentro del sitio', async ({ page }) => {
    test.fail(true, 'Known bug: when Sanity returns no post the page renders nothing at all (no navbar, footer or 404), src/pages/BlogPostPage.tsx:77-79.');
    const site = new Site(page);
    await page.goto('/blog/no-existe');
    await expect(page.getByText(/404|no encontrad|no existe/i).first()).toBeVisible();
    await expect(site.nav).toBeVisible();
    await expect(site.footer).toBeVisible();
  });

  test('un artículo sin imagen destacada se muestra sin imagen', async ({ page, sanity }) => {
    test.fail(true, 'Known bug: a post whose featuredImage is null throws "Unable to resolve image URL from source (null)" and, with no ErrorBoundary, blanks the whole app, src/components/shared/SanityImage.tsx:124-128.');
    sanity.posts = [blogPost({ featuredImage: null })];
    const site = new Site(page);
    await page.goto('/blog/mi-post');
    await expect(site.h1).toHaveText('Mi post');
    await expect(page.getByText('Hola', { exact: true })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Mi post' })).toHaveCount(0);
  });

  test('la fecha del artículo no se muestra en formato ISO', async ({ page }) => {
    test.fail(true, 'Known bug: the post header and its related posts print the raw Sanity datetime (e.g. "2025-06-30T12:00:00.000Z"), src/pages/BlogPostPage.tsx:94,185.');
    const site = new Site(page);
    await page.goto('/blog/articulo-2');
    await expect(site.h1).toHaveText('Artículo 2');
    await expect(page.getByRole('heading', { level: 4, name: 'Artículo 1' })).toBeVisible();
    await expect(page.getByText(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)).toHaveCount(0);
  });
});
