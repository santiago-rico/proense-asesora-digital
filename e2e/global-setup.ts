import { chromium, type FullConfig } from '@playwright/test';

/**
 * On its first visit to a route, the Vite dev server may discover and
 * re-optimize dependencies, then force a full page reload. A test that is
 * mid-interaction when that happens fails flakily, so load the form pages once
 * here — after the web server is up, before any test runs.
 */
const WARM_UP_PATHS = ['/clientes/emision-polizas'];

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? 'http://localhost:8080';
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
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
