import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { insuranceProductsData } from '../../../src/data/insuranceProductsData';
import { blogPost, blogPosts } from '../../fixtures/blog-data';
import { test, expect } from '../../fixtures/network';
import { Site } from '../../fixtures/page-objects/site';

/**
 * axe scans of every route and of the states that reveal new UI (lead dialog,
 * open mobile menu, an open FAQ item).
 *
 * - "sin violaciones nuevas": one scan per page with the WCAG 2.0/2.1 A+AA rules.
 *   Violations listed in KNOWN are filtered out and anything else fails, so a
 *   new violation is caught even on a page that already has known ones.
 * - "errores conocidos": one `test.fail` per known bug. Once it is fixed on
 *   every scan listed for it, that test starts failing: delete its KNOWN entry.
 */

type Violation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];
type AxeNode = Violation['nodes'][number];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'];

const HOME_H1 = 'Protege lo que más valoras con expertos a tu lado';
/** The newest post: a card on /, the featured post on /blog, a related post on /blog/mi-post. */
const NEWEST_POST = 'Artículo 1';
/** RelatedArticlesSection's heading, shown once the product's category query returns posts. */
const RELATED = 'Aprende Más con Nuestros Expertos';

/** One post per product category, so every product page renders its related articles (bar handover bug 15). */
const POSTS = [
  ...blogPosts(8, [
    'Seguro de Vida',
    'Seguro de Salud',
    'Seguro de Auto',
    'Seguro de Hogar',
    'Seguro de Viaje',
    'Seguro para Mascotas',
    'Seguro para Motos',
  ]),
  blogPost({ _id: 'mi-post' }),
];

interface Scan {
  /** Test title, and the key KNOWN refers to. */
  name: string;
  path: string;
  /** Headings that show the page, and its Sanity content, have rendered. */
  headings: string[];
  /** Puts the page in the state to scan. */
  prepare?: (site: Site) => Promise<void>;
  /** Limits axe to what `prepare` revealed; the rest of the page has its own scan. */
  include?: string;
  mobileOnly?: boolean;
}

const route = (path: string, ...headings: string[]): Scan => ({ name: path, path, headings });

const PRODUCT_SCANS: Scan[] = [
  {
    // The open-FAQ state rides on this scan; the other nine product pages cover the closed accordion.
    ...route('/seguros/vida', 'Seguro de Vida', RELATED),
    name: '/seguros/vida con una pregunta frecuente abierta',
    prepare: async site => {
      const question = site.main.getByRole('button', { name: insuranceProductsData.vida.faq![0].question, exact: true });
      await question.click();
      await expect(question).toHaveAttribute('aria-expanded', 'true');
    },
  },
  route('/seguros/vida-deudores', 'Seguro de Vida Deudores', RELATED),
  route('/seguros/salud', 'Seguro de Salud', RELATED),
  route('/seguros/auto', 'Seguro de Auto', RELATED),
  route('/seguros/hogar', 'Seguro de Hogar', RELATED),
  route('/seguros/pymes', 'Seguro para PYMES'),
  route('/seguros/mascotas', 'Seguro de Mascotas', RELATED),
  route('/seguros/motos', 'Seguro de Motos', RELATED),
  route('/seguros/arrendamiento', 'Seguro de Arrendamiento'),
  route('/seguros/viaje', 'Seguro de Viaje', RELATED),
];

const DIALOG = 'diálogo "Solicitar Asesoría" abierto';
const MOBILE_MENU = 'menú móvil abierto';

const SCANS: Scan[] = [
  route('/', HOME_H1, NEWEST_POST),
  route('/contacto', 'Estamos para Servirte'),
  route('/nosotros', 'Sobre Nosotros'),
  route('/blog', 'Últimos Artículos', NEWEST_POST),
  route('/blog/mi-post', 'Mi post', NEWEST_POST),
  ...PRODUCT_SCANS,
  route('/clientes/cotizacion', 'Cotización de Seguros'),
  route('/clientes/emision-polizas', 'Emisión de Pólizas'),
  route('/clientes/modificaciones', 'Modificaciones de Pólizas'),
  route('/clientes/cancelaciones', 'Cancelación de Pólizas'),
  route('/clientes/siniestros', '¿Qué hacer en caso de un siniestro?'),
  route('/clientes/pagos', 'Paga tu seguro en un solo clic'),
  route('/politica-de-privacidad', 'Política de Privacidad'),
  route('/terminos-y-condiciones', 'Términos y Condiciones'),
  route('/no-existe', '404'),
  {
    name: DIALOG,
    path: '/',
    headings: [HOME_H1],
    include: '[role="dialog"]',
    prepare: async site => {
      await site.main.getByRole('button', { name: 'Solicitar Asesoría' }).first().click();
      await expect(site.leadDialog).toBeVisible();
    },
  },
  {
    name: MOBILE_MENU,
    path: '/',
    headings: [HOME_H1],
    include: '#mobile-navigation-menu',
    mobileOnly: true,
    // Only "Seguros": with both sections open the panel scrolls, and axe skips the contrast of links scrolled out of it.
    prepare: async site => {
      await site.openMobileMenu();
      await site.mobileSectionToggle('Seguros').click();
      await expect(site.mobileSectionToggle('Seguros')).toHaveAttribute('aria-expanded', 'true');
    },
  },
];

const names = (scans: Scan[]) => scans.map(s => s.name);
/** Every page rendered inside Layout (the 404 isn't), scanned whole. */
const LAYOUT_PAGES = names(SCANS.filter(s => !s.include && s.path !== '/no-existe'));
const LEAD_FORM_SCANS = ['/contacto', '/blog', '/blog/mi-post', ...names(PRODUCT_SCANS), DIALOG];

interface KnownBug {
  title: string;
  rules: string[];
  /** What is wrong and where; the `Known bug:` reason of its test. */
  bug: string;
  /** Scans where it fires per viewport, in the order its test checks them. */
  desktop: string[];
  mobile: string[];
  /**
   * Only matching nodes are known, on every scan (color-contrast fails for
   * several reasons). Without it, the whole rule is known on the listed scans.
   */
  node?: (node: AxeNode) => boolean;
}

const both = (scans: string[]) => ({ desktop: scans, mobile: scans });
const mobileOnly = (scans: string[]) => ({ desktop: [], mobile: scans });

interface ContrastData {
  fgColor: string;
  bgColor: string;
  contrastRatio: number;
}

function contrastData(node: AxeNode): ContrastData | undefined {
  return node.any.find(check => check.id === 'color-contrast')?.data as ContrastData | undefined;
}

/** Matches color-contrast nodes by the colors axe measured (after blending opacity). */
const colors = (fg: string, bg: string) => (node: AxeNode) => {
  const data = contrastData(node);
  return data?.fgColor === fg && data.bgColor === bg;
};

const KNOWN: KnownBug[] = [
  {
    title: 'Contraste: texto blanco sobre el verde secundario',
    rules: ['color-contrast'],
    bug: 'white on the secondary green #3b8c59 is 4.13:1 (needs 4.5:1) on every bg-secondary button and badge, e.g. the "Solicitar Asesoría" buttons and the form submit buttons, src/index.css:36-37',
    ...both(['/']),
    node: colors('#ffffff', '#3b8c59'),
  },
  {
    title: 'Contraste: etiqueta de categoría de las tarjetas del blog',
    rules: ['color-contrast'],
    bug: 'the blog card category badge, text-primary on bg-primary/10 (#0073d1 on #e6f1fa), is 4.19:1 at 12px, src/components/shared/BlogPostCard.tsx:79',
    ...both(['/']),
    node: colors('#0073d1', '#e6f1fa'),
  },
  {
    title: 'Contraste: texto blanco/90 sobre el azul primario de las secciones CTA',
    rules: ['color-contrast'],
    bug: 'text-white/90 on bg-primary (#e5f1fa on #0073d1) is 4.18:1 in the blue CTA sections, src/components/home/CallToActionSection.tsx:15, src/components/layout/BlogCtaSection.tsx:16, src/pages/InsuranceProductPage.tsx:175 and the same <p> in AboutPage, QuotePage, PaymentsPage and ClientServicePage',
    ...both(['/']),
    // axe 4.14 blends white/90 over #0073d1 to #e5f1fa; 4.11 measured #e6f1fa
    node: colors('#e5f1fa', '#0073d1'),
  },
  {
    title: 'Contraste: enlace del 404',
    rules: ['color-contrast'],
    bug: 'the 404 "Return to Home" link, text-blue-500 on bg-gray-100 (#2b7fff on #f3f4f6), is 3.41:1, src/pages/NotFound.tsx:19',
    ...both(['/no-existe']),
    node: colors('#2b7fff', '#f3f4f6'),
  },
  {
    title: 'Contraste: enlace activo del menú móvil',
    rules: ['color-contrast'],
    bug: 'the active link in the open mobile menu, text-primary on bg-blue-50 (#0073d1 on #eff6ff), is 4.41:1, src/components/layout/Navbar.tsx:350',
    ...mobileOnly([MOBILE_MENU]),
    node: colors('#0073d1', '#eff6ff'),
  },
  {
    title: 'El selector "Tipo de Seguro de Interés" del LeadForm tiene nombre accesible',
    rules: ['button-name'],
    bug: 'the LeadForm insurance-type select (a Radix combobox button) has no accessible name: FormControl gives the label\'s target id to <Select>, which renders no element, src/components/forms/LeadForm.tsx:257-260',
    ...both(LEAD_FORM_SCANS),
  },
  {
    title: 'El campo de archivos de modificación y cancelación tiene etiqueta',
    rules: ['label'],
    bug: 'the dropzone\'s <input type="file"> has no label; FileUpload\'s <label> is not associated with it, src/components/forms/emision/FileUpload.tsx:184,197',
    ...both(['/clientes/modificaciones', '/clientes/cancelaciones']),
  },
  {
    title: 'El menú móvil cerrado no deja elementos enfocables ocultos',
    rules: ['aria-hidden-focus'],
    bug: 'the collapsed mobile menu is aria-hidden but its links and buttons stay focusable, so Tab reaches invisible controls, src/components/layout/Navbar.tsx:304',
    ...mobileOnly(LAYOUT_PAGES),
  },
  {
    title: 'El menú móvil abierto usa roles de menú válidos',
    rules: ['aria-required-children'],
    bug: 'the mobile menu panel has role="menu" but holds plain links and buttons, no menuitems, src/components/layout/Navbar.tsx:302',
    ...mobileOnly([MOBILE_MENU]),
  },
  // The rest are axe best-practice rules, outside WCAG_TAGS, so the regression
  // scans never run them. The handover predicted them; each test runs only its rules.
  {
    title: 'Las páginas de producto no saltan niveles de encabezado',
    rules: ['heading-order'],
    bug: 'the coverage titles are h4s right under the h2, skipping h3, src/pages/InsuranceProductPage.tsx:96',
    ...both(names(PRODUCT_SCANS)),
  },
  {
    title: 'El artículo del blog no salta niveles de encabezado',
    rules: ['heading-order'],
    bug: 'the first heading after the post\'s h1 is the h3 "Conoce más sobre…", skipping h2, src/pages/BlogPostPage.tsx:124',
    ...both(['/blog/mi-post']),
  },
  {
    title: '/blog tiene un solo main, de nivel superior',
    rules: ['landmark-main-is-top-level', 'landmark-no-duplicate-main', 'landmark-unique'],
    bug: '/blog nests a second <main> inside Layout\'s <main id="main-content">, src/pages/BlogListPage.tsx:72',
    ...both(['/blog']),
  },
  {
    title: '/blog tiene un h1',
    rules: ['page-has-heading-one'],
    bug: '/blog has no h1; its top headings are the h2s "Artículo Destacado" and "Últimos Artículos", src/pages/BlogListPage.tsx:77,106',
    ...both(['/blog']),
  },
  {
    title: 'El 404 tiene landmarks',
    rules: ['landmark-one-main', 'region'],
    bug: 'the 404 renders without Layout, so it has no main landmark and its content is outside every landmark, src/pages/NotFound.tsx:15',
    ...both(['/no-existe']),
  },
];

/** Finishes finite animations (fade-ins, the dialog's zoom, the menu's slide) so axe never measures a half-faded color. */
async function finishAnimations(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) animation.finish();
    }
  });
}

/** Loads the scan's page and state, then runs axe configured by `configure`. */
async function runAxe(page: Page, scan: Scan, configure: (axe: AxeBuilder) => AxeBuilder): Promise<Violation[]> {
  const site = new Site(page);
  await page.goto(scan.path);
  for (const name of scan.headings) {
    await expect(page.getByRole('heading', { name, exact: true }).first()).toBeVisible();
  }
  await scan.prepare?.(site);
  await finishAnimations(page);
  let axe = configure(new AxeBuilder({ page }));
  if (scan.include) axe = axe.include(scan.include);
  return (await axe.analyze()).violations;
}

function describeNode(node: AxeNode): string {
  const target = node.target.join(' ');
  const contrast = contrastData(node);
  return contrast ? `${target} [${contrast.fgColor} on ${contrast.bgColor}, ${contrast.contrastRatio}:1]` : target;
}

/** One line per violation: rule, help text and the first few offending nodes. */
function report(violations: Violation[]): string[] {
  return violations.map(({ id, help, nodes }) => {
    const more = nodes.length > 3 ? ` (+${nodes.length - 3} more)` : '';
    return `${id}: ${help} → ${nodes.slice(0, 3).map(describeNode).join(' | ')}${more}`;
  });
}

function keepNodes(violations: Violation[], keep: (rule: string, node: AxeNode) => boolean): Violation[] {
  return violations
    .map(v => ({ ...v, nodes: v.nodes.filter(node => keep(v.id, node)) }))
    .filter(v => v.nodes.length > 0);
}

const scansOf = (known: KnownBug, isMobile: boolean) => (isMobile ? known.mobile : known.desktop);

function isKnown(rule: string, node: AxeNode, scan: string, isMobile: boolean): boolean {
  return KNOWN.some(
    known => known.rules.includes(rule) && (known.node ? known.node(node) : scansOf(known, isMobile).includes(scan)),
  );
}

test.beforeEach(({ sanity }) => {
  sanity.posts = POSTS;
});

test.describe('Accesibilidad (axe): sin violaciones nuevas', () => {
  for (const scan of SCANS) {
    test(scan.name, async ({ page, isMobile }) => {
      test.skip(!!scan.mobileOnly && !isMobile, 'El menú móvil solo existe en móvil');
      const violations = await runAxe(page, scan, axe => axe.withTags(WCAG_TAGS));
      const unknown = keepNodes(violations, (rule, node) => !isKnown(rule, node, scan.name, isMobile));
      expect(report(unknown), `Violaciones nuevas en ${scan.name}`).toEqual([]);
    });
  }
});

test.describe('Accesibilidad (axe): errores conocidos', () => {
  for (const known of KNOWN) {
    test(known.title, async ({ page, isMobile }) => {
      test.fail(true, `Known bug: ${known.rules.join(', ')}: ${known.bug}.`);
      const scanNames = scansOf(known, isMobile);
      test.skip(scanNames.length === 0, `Solo ocurre en ${isMobile ? 'escritorio' : 'móvil'}`);
      // Stops at the first scan that still fails; only a full fix walks them all.
      test.setTimeout(Math.max(30_000, scanNames.length * 8_000));
      for (const name of scanNames) {
        const scan = SCANS.find(s => s.name === name)!;
        const violations = await runAxe(page, scan, axe => axe.withRules(known.rules));
        const matching = known.node ? keepNodes(violations, (_, node) => known.node!(node)) : violations;
        expect(report(matching), `${known.rules.join(', ')} en ${name}`).toEqual([]);
      }
    });
  }
});
