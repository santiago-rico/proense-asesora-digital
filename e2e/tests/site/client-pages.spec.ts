import type { Locator, Page } from '@playwright/test';
import { test, expect } from '../../fixtures/network';
import { Site } from '../../fixtures/page-objects/site';

/** Client pages whose hero "Ir al Formulario" scrolls to the form (`#quote-form` / `#service-form`). */
const FORM_PAGES = [
  { path: '/clientes/cotizacion', formTitle: 'Solicitud de Cotización', firstField: 'Nombre' },
  { path: '/clientes/emision-polizas', formTitle: 'Solicitud de Emisión de Póliza', firstField: 'Nombre completo' },
  { path: '/clientes/modificaciones', formTitle: 'Solicitud de Modificación de Póliza', firstField: 'Nombre completo' },
  { path: '/clientes/cancelaciones', formTitle: 'Solicitud de Cancelación de Póliza', firstField: 'Nombre completo del tomador' },
];

/** Every link in each insurer's card on /clientes/siniestros, by its text, in order. */
const EMERGENCY_LINES: { logo: string; links: [string, string][] }[] = [
  {
    logo: 'Logo de SURA',
    links: [
      ['#888', 'tel:%23888'],
      ['018000518888', 'tel:018000518888'],
      ['+573152757888', 'https://wa.me/+573152757888'],
    ],
  },
  {
    logo: 'Logo de Allianz',
    links: [
      ['#265', 'tel:%23265'],
      ['018000513500', 'tel:018000513500'],
    ],
  },
  {
    logo: 'Logo de SBS Seguros',
    links: [
      ['#360', 'tel:%23360'],
      ['018000911360', 'tel:018000911360'],
      ['+573183900000', 'https://wa.me/+573183900000'],
    ],
  },
  {
    logo: 'Logo de Assist Card',
    links: [
      ['018000910684', 'tel:018000910684'],
      ['+5491127039665', 'https://wa.me/+5491127039665'],
      ['6016581799', 'tel:6016581799'],
    ],
  },
];

const isStarCode = ([text]: [string, string]) => text.startsWith('#');

const PAYMENT_PORTALS = [
  { logo: 'Logo de SURA', url: 'https://www.segurossura.com.co/paginas/pago-express.aspx/' },
  { logo: 'Logo de Allianz', url: 'https://www.allianz.co/clientes/todos-los-clientes/pagos.html' },
  { logo: 'Logo de SBS Seguros', url: 'https://www.sbseguros.co/servicio-al-cliente/alternativas-pagos' },
];

/** An insurer's card, found through its logo: the cards have no heading or landmark of their own. */
function logoCard(page: Page, logo: string): Locator {
  return page.getByRole('img', { name: logo, exact: true }).locator('xpath=ancestor::div[1]');
}

/** The support section's "Contactar a un Asesor" is a plain `<a>`, so this is a full page load. */
async function contactAdvisor(site: Site): Promise<void> {
  await site.main.getByRole('link', { name: 'Contactar a un Asesor' }).click();
  await expect(site.page).toHaveURL('/contacto');
  await expect(site.h1).toHaveText('Estamos para Servirte');
}

test.describe('Páginas de clientes', () => {
  for (const { path, formTitle, firstField } of FORM_PAGES) {
    test(`${path}: "Ir al Formulario" lleva al formulario y "Contactar a un Asesor" a /contacto`, async ({ page }) => {
      const site = new Site(page);
      await page.goto(path);
      const heading = site.main.getByRole('heading', { level: 2, name: formTitle });
      await expect(heading).not.toBeInViewport();

      await site.main.getByRole('button', { name: 'Ir al Formulario' }).click();
      await expect(heading).toBeInViewport();
      await expect(site.main.getByLabel(firstField)).toBeInViewport();

      await contactAdvisor(site);
    });
  }

  test.describe('Siniestros', () => {
    test('sin botón en el hero, con las líneas de asistencia de cada aseguradora y "Contactar a un Asesor"', async ({ page }) => {
      const site = new Site(page);
      await page.goto('/clientes/siniestros');
      await expect(site.h1).toHaveText('¿Qué hacer en caso de un siniestro?');
      // The hero is rendered with the h1, and nothing else on the page is a button.
      await expect(site.main.getByRole('button')).toHaveCount(0);

      await expect(site.main.getByRole('heading', { level: 2, name: 'Líneas de Asistencia de Aseguradoras' })).toBeVisible();
      for (const { logo, links } of EMERGENCY_LINES) {
        const card = logoCard(page, logo);
        await expect(card.getByRole('link')).toHaveText(links.map(([text]) => text));
        for (const [text, href] of links.filter(line => !isStarCode(line))) {
          await expect(card.getByRole('link', { name: text, exact: true })).toHaveAttribute('href', href);
        }
      }

      await contactAdvisor(site);
    });

    test('los códigos de emergencia con # llevan el # codificado en el tel:', async ({ page }) => {
      test.fail(true, 'Known bug: the star codes render as tel:#888, tel:#265 and tel:#360; an unencoded # starts a URL fragment and must be %23, src/pages/ClientServicePage.tsx:207.');
      await page.goto('/clientes/siniestros');
      for (const { logo, links } of EMERGENCY_LINES) {
        for (const [text, href] of links.filter(isStarCode)) {
          await expect(logoCard(page, logo).getByRole('link', { name: text, exact: true })).toHaveAttribute('href', href);
        }
      }
    });
  });

  test('/clientes/pagos: "Ir a pagar" abre el portal de cada aseguradora en otra pestaña y "Contactar a un Asesor" lleva a /contacto', async ({ page }) => {
    const site = new Site(page);
    await page.goto('/clientes/pagos');
    await expect(site.main.getByRole('link', { name: 'Ir a pagar' })).toHaveCount(PAYMENT_PORTALS.length);

    // Attributes only: clicking would leave the mocked network.
    for (const { logo, url } of PAYMENT_PORTALS) {
      const link = logoCard(page, logo).getByRole('link', { name: 'Ir a pagar' });
      await expect(link).toHaveAttribute('href', url);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    await contactAdvisor(site);
  });
});
