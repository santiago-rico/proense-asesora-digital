import type { Page } from '@playwright/test';
import { blogPost } from '../../fixtures/blog-data';
import { test, expect, type SanityMock } from '../../fixtures/network';
import { Site } from '../../fixtures/page-objects/site';
import { insuranceProductsData } from '../../../src/data/insuranceProductsData';

/**
 * The 10 routed product types (`src/App.tsx`) and the Sanity category title each
 * one should query for related articles (the titles `BlogPostPage` maps back to
 * product pages).
 */
const PRODUCTS: { type: string; category: string }[] = [
  { type: 'vida', category: 'Seguro de Vida' },
  { type: 'vida-deudores', category: 'Seguro de Vida' },
  { type: 'salud', category: 'Seguro de Salud' },
  { type: 'auto', category: 'Seguro de Auto' },
  { type: 'hogar', category: 'Seguro de Hogar' },
  { type: 'pymes', category: 'Seguros para PYMES' },
  { type: 'mascotas', category: 'Seguro para Mascotas' },
  { type: 'motos', category: 'Seguro para Motos' },
  { type: 'arrendamiento', category: 'Seguro de Arrendamiento' },
  { type: 'viaje', category: 'Seguro de Viaje' },
];

/** Types whose category map key is wrong (`empresarial`/`rentas`), so no query is made. */
const NO_RELATED_ARTICLES_BUG = ['pymes', 'arrendamiento'];

const QUOTE_CTA = '¡Quiero cotizar mi seguro ahora!';
const QUOTE_CTA_TYPES = ['vida', 'mascotas'];

interface FaqSchema {
  '@type': string;
  mainEntity: { name: string }[];
}

/** The page's JSON-LD blocks, parsed. There is no accessible way to read them. */
async function jsonLd(page: Page): Promise<FaqSchema[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map(text => JSON.parse(text) as FaqSchema);
}

test.describe('Páginas de producto', () => {
  for (const { type } of PRODUCTS) {
    const data = insuranceProductsData[type];
    const questions = (data.faq ?? []).map(item => item.question);

    test(`/seguros/${type}: coberturas, FAQ de un ítem abierto a la vez y JSON-LD`, async ({ page }) => {
      const site = new Site(page);
      await page.goto(`/seguros/${type}`);
      await expect(site.h1).toHaveText(data.title);

      // The coverage cards are the only h4s, right below the coveragesTitle h2.
      const coverages = site.main.getByRole('heading', { level: 4 });
      await expect(coverages).toHaveCount(6);
      await expect(coverages).toHaveText(data.coverages.map(c => c.title));
      await expect(site.main).toMatchAriaSnapshot(
        [
          `- heading ${JSON.stringify(data.coveragesTitle)} [level=2]`,
          ...data.coverages.map(c => `- heading ${JSON.stringify(c.title)} [level=4]`),
        ].join('\n'),
      );

      await expect(site.main.getByRole('button', { name: QUOTE_CTA })).toHaveCount(
        QUOTE_CTA_TYPES.includes(type) ? 1 : 0,
      );

      // Radix wraps each accordion trigger in an h3; the LeadForm's country picker is another collapsed button.
      const faqButtons = site.main.getByRole('heading', { level: 3 }).getByRole('button', { expanded: false });
      await expect(faqButtons).toHaveText(questions);
      const faqCount = await faqButtons.count();

      const [first, second] = questions.map(q => site.main.getByRole('button', { name: q, exact: true }));
      await first.click();
      await expect(first).toHaveAttribute('aria-expanded', 'true');
      await expect(site.main.getByText(data.faq![0].answer)).toBeVisible();
      await second.click();
      await expect(second).toHaveAttribute('aria-expanded', 'true');
      await expect(first).toHaveAttribute('aria-expanded', 'false');
      await expect(site.main.getByText(data.faq![0].answer)).toBeHidden();
      await expect(site.main.getByRole('heading', { level: 3 }).getByRole('button', { expanded: true })).toHaveCount(1);

      const faqSchemas = (await jsonLd(page)).filter(s => s['@type'] === 'FAQPage');
      expect(faqSchemas).toHaveLength(1);
      expect(faqSchemas[0].mainEntity).toHaveLength(faqCount);
      expect(faqSchemas[0].mainEntity.map(q => q.name)).toEqual(questions);
    });
  }

  for (const type of QUOTE_CTA_TYPES) {
    test(`/seguros/${type}: "${QUOTE_CTA}" lleva al formulario`, async ({ page }) => {
      await page.goto(`/seguros/${type}`);
      const formHeading = page.getByRole('heading', { level: 3, name: insuranceProductsData[type].leadFormTitle });
      await expect(formHeading).not.toBeInViewport();

      await page.getByRole('button', { name: QUOTE_CTA }).click();
      await expect(formHeading).toBeInViewport();
      await expect(page.getByLabel('Nombre Completo')).toBeInViewport();
    });
  }
});

test.describe('Páginas de producto: artículos relacionados', () => {
  const related = blogPost({ _id: 'rel', title: 'Artículo relacionado', slug: 'articulo-relacionado' });
  const unrelated = blogPost({ _id: 'otro', title: 'Artículo de otra categoría', slug: 'otro', category: 'Otra' });

  async function expectRelatedArticles(page: Page, sanity: SanityMock, type: string, category: string) {
    sanity.posts = [{ ...related, category }, unrelated];
    await page.goto(`/seguros/${type}`);

    await expect(page.getByRole('heading', { level: 2, name: 'Aprende Más con Nuestros Expertos' })).toBeVisible();
    await expect(page.getByRole('link', { name: related.title })).toHaveAttribute('href', `/blog/${related.slug}`);
    await expect(page.getByRole('link', { name: unrelated.title })).toHaveCount(0);
    expect(sanity.queries.map(q => q.params.category)).toContain(category);
  }

  for (const { type, category } of PRODUCTS.filter(p => !NO_RELATED_ARTICLES_BUG.includes(p.type))) {
    test(`/seguros/${type} muestra los artículos de "${category}"`, async ({ page, sanity }) => {
      await expectRelatedArticles(page, sanity, type, category);
    });
  }

  for (const { type, category } of PRODUCTS.filter(p => NO_RELATED_ARTICLES_BUG.includes(p.type))) {
    test(`/seguros/${type} muestra los artículos de "${category}"`, async ({ page, sanity }) => {
      test.fail(true, `Known bug: /seguros/${type} never queries its related articles because the category map uses the keys empresarial/rentas, src/pages/InsuranceProductPage.tsx:29-30.`);
      await expectRelatedArticles(page, sanity, type, category);
    });
  }
});
