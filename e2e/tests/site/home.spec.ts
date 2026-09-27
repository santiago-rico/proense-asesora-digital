import type { Page } from '@playwright/test';
import { blogPosts } from '../../fixtures/blog-data';
import { test, expect } from '../../fixtures/network';
import { Site } from '../../fixtures/page-objects/site';

/** The cards in `src/components/home/InsuranceTypesSection.tsx`, in DOM order; each title is also its page's h1. */
const INSURANCE_CARDS = [
  { title: 'Seguro de Vida', path: '/seguros/vida' },
  { title: 'Seguro de Vida Deudores', path: '/seguros/vida-deudores' },
  { title: 'Seguro de Salud', path: '/seguros/salud' },
  { title: 'Seguro de Auto', path: '/seguros/auto' },
  { title: 'Seguro de Hogar', path: '/seguros/hogar' },
  { title: 'Seguro para PYMES', path: '/seguros/pymes' },
];

/** A card's front heading; the card itself is an unnamed focusable `<div>`. */
const cardHeading = (page: Page, title: string) => page.getByRole('heading', { level: 3, name: title, exact: true });

/**
 * Every card's "Ver más información" link, in card order. They sit in an overlay
 * that stays `visibility: hidden` until the card is hovered or focused, and
 * fading overlays can briefly overlap, hence `includeHidden` + `nth`.
 */
const moreInfoLinks = (page: Page) => page.getByRole('link', { name: 'Ver más información', includeHidden: true });

/** The recent-post card titles (BlogPostCard's CardTitle is an h3 around the link). */
const recentPostHeadings = (page: Page) => page.getByRole('heading', { level: 3, name: /^Artículo \d+$/ });

const EMPTY_RECENT_POSTS = 'No hay artículos recientes disponibles en este momento.';

test.describe('Inicio', () => {
  test.describe('Tarjetas de seguros', () => {
    test('las 6 tarjetas revelan "Ver más información" al interactuar, y el enlace abre su página', async ({ page, isMobile }) => {
      const site = new Site(page);
      await site.goto('/');
      const links = moreInfoLinks(page);
      await expect(links).toHaveCount(INSURANCE_CARDS.length);

      for (const [i, { title, path }] of INSURANCE_CARDS.entries()) {
        const heading = cardHeading(page, title);
        await expect(links.nth(i)).toBeHidden();
        // Tailwind 4 wraps `hover:` in `@media (hover: hover)`, so on a touch
        // device hovering does nothing; the tap focuses the card instead.
        if (isMobile) await heading.tap();
        else await heading.hover();
        await expect(links.nth(i)).toBeVisible();
        await expect(links.nth(i)).toHaveAttribute('href', path);
        // The front title turns hidden when the 300 ms transition ends. Clicking
        // while the card still moves makes Playwright retry with a scroll that
        // tucks the link under the fixed navbar, and the hover is lost.
        await expect(heading).toBeHidden();
      }

      const last = INSURANCE_CARDS[INSURANCE_CARDS.length - 1];
      if (isMobile) await links.last().tap();
      else await links.last().click();
      await expect(page).toHaveURL(last.path);
      await expect(site.h1).toHaveText(last.title);
    });

    test('con el teclado, Tab enfoca cada tarjeta y luego su enlace, y Enter lo abre', async ({ page }) => {
      const site = new Site(page);
      await site.goto('/');
      // The hero CTA is the last focusable element before the cards.
      await site.main.getByRole('button', { name: 'Solicitar Asesoría' }).first().focus();
      const links = moreInfoLinks(page);

      for (const [i, { path }] of INSURANCE_CARDS.entries()) {
        await page.keyboard.press('Tab'); // the card
        await expect(links.nth(i), 'focus-within reveals the overlay').toBeVisible();
        await page.keyboard.press('Tab'); // its link
        await expect(links.nth(i)).toBeFocused();
        await expect(links.nth(i)).toHaveAttribute('href', path);
      }

      const last = INSURANCE_CARDS[INSURANCE_CARDS.length - 1];
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(last.path);
      await expect(site.h1).toHaveText(last.title);
    });
  });

  test('el carrusel de testimonios habilita "Previous slide" tras avanzar', async ({ page }) => {
    await page.goto('/');
    const previous = page.getByRole('button', { name: 'Previous slide' });
    const next = page.getByRole('button', { name: 'Next slide' });

    await expect(next).toBeEnabled();
    await expect(previous).toBeDisabled();
    await next.click();
    await expect(previous).toBeEnabled();
    await previous.click();
    await expect(previous).toBeDisabled();
  });

  test.describe('Noticias y Consejos', () => {
    test.beforeEach(({ sanity }) => {
      sanity.posts = blogPosts(5);
    });

    test('muestra los 3 artículos más recientes, enlazados a su página', async ({ page, sanity }) => {
      const site = new Site(page);
      await site.goto('/');

      await expect(recentPostHeadings(page)).toHaveText(['Artículo 1', 'Artículo 2', 'Artículo 3']);
      expect(sanity.queries.map(q => q.params.limit)).toEqual([3]);
      const readMore = page.getByRole('link', { name: 'Leer más →' });
      await expect(readMore).toHaveCount(3);
      for (const n of [1, 2, 3]) {
        await expect(readMore.nth(n - 1)).toHaveAttribute('href', `/blog/articulo-${n}`);
        await expect(page.getByRole('link', { name: `Artículo ${n}`, exact: true })).toHaveAttribute('href', `/blog/articulo-${n}`);
      }
      await expect(page.getByText(EMPTY_RECENT_POSTS)).toHaveCount(0);

      await page.getByRole('link', { name: 'Artículo 2', exact: true }).click();
      await expect(page).toHaveURL('/blog/articulo-2');
      await expect(site.h1).toHaveText('Artículo 2');
    });

    test('no muestra tarjetas ni el estado vacío mientras Sanity responde', async ({ page, sanity }) => {
      const release = sanity.hold();
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 2, name: 'Noticias y Consejos' })).toBeVisible();
      await expect.poll(() => sanity.queries.length, 'recent posts query in flight').toBe(1);

      // The skeleton cards have no text or role; while loading, neither outcome renders.
      await expect(recentPostHeadings(page)).toHaveCount(0);
      await expect(page.getByText(EMPTY_RECENT_POSTS)).toHaveCount(0);

      release();
      await expect(recentPostHeadings(page)).toHaveCount(3);
    });

    test('sin artículos muestra el estado vacío', async ({ page, sanity }) => {
      sanity.posts = [];
      await page.goto('/');
      await expect(page.getByText(EMPTY_RECENT_POSTS)).toBeVisible();
      await expect(recentPostHeadings(page)).toHaveCount(0);
    });

    test('"Ver todos los artículos" lleva al blog', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('link', { name: 'Ver todos los artículos' }).click();
      await expect(page).toHaveURL('/blog');
      await expect(page.getByRole('heading', { level: 2, name: 'Últimos Artículos' })).toBeVisible();
    });
  });
});
