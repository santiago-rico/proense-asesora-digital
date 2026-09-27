import { chromium, type FullConfig } from '@playwright/test';
import { fulfillSanity, mockThirdParties, SANITY_QUERY_URL } from './fixtures/third-party';

/**
 * On its first visit to a route, the Vite dev server may discover and
 * re-optimize dependencies, then force a full page reload. A test that is
 * mid-interaction when that happens fails flakily, so load every page type
 * once here — after the web server is up, before any test runs. Third parties
 * are mocked as in the tests, so the warm-up never hits the live CMS.
 */
const WARM_UP_PATHS = [
  '/',
  '/nosotros',
  '/contacto',
  '/blog',
  '/blog/mi-post',
  '/seguros/hogar',
  '/clientes/cotizacion',
  '/clientes/emision-polizas',
  '/clientes/modificaciones',
  '/clientes/cancelaciones',
  '/clientes/siniestros',
  '/clientes/pagos',
  '/politica-de-privacidad',
  '/terminos-y-condiciones',
];

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? 'http://localhost:8080';
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    await mockThirdParties(context);
    await context.route(SANITY_QUERY_URL, route => fulfillSanity(route, []));
    const page = await context.newPage();
    for (const path of WARM_UP_PATHS) {
      // Twice: the first load may be interrupted by the optimizer's reload.
      for (let i = 0; i < 2; i++) {
        await page.goto(new URL(path, baseURL).toString(), { waitUntil: 'networkidle', timeout: 60000 });
      }
    }
  } finally {
    await browser.close();
  }
}
