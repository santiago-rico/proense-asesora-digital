import type { BrowserContext, Route } from '@playwright/test';
import { CSRF_TOKEN } from './api-mocks';

/**
 * Stand-ins for every third-party host the site talks to, so no test touches the
 * live network. Used by the auto fixture in `network.ts` and by `global-setup.ts`.
 *
 * Routes are installed on the browser context. Routes a test adds with
 * `page.route()` take precedence, so a test can still override any of these.
 */

/** Sanity query API (`src/sanity/client.ts`: projectId aofp3ugi, dataset production). */
export const SANITY_QUERY_URL = /aofp3ugi\.api(cdn)?\.sanity\.io\/v[\d-]+\/data\/query\/production/;

/** 1×1 transparent PNG. */
export const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const CORS = { 'access-control-allow-origin': '*' };

export interface SanityQuery {
  query: string;
  /** GROQ params, decoded (`$slug="mi-post"` → `{ slug: 'mi-post' }`). */
  params: Record<string, unknown>;
}

export function parseSanityQuery(url: string): SanityQuery {
  const { searchParams } = new URL(url);
  const params: Record<string, unknown> = {};
  for (const [key, value] of searchParams) {
    if (!key.startsWith('$')) continue;
    try {
      params[key.slice(1)] = JSON.parse(value);
    } catch {
      params[key.slice(1)] = value;
    }
  }
  return { query: searchParams.get('query') ?? '', params };
}

export async function fulfillSanity(route: Route, result: unknown, status = 200): Promise<void> {
  await route.fulfill({
    status,
    headers: CORS,
    json: status < 400 ? { ms: 1, result } : { error: { description: 'Mocked Sanity error' } },
  });
}

/**
 * The static third-party mocks: gpteng script, Google Fonts, Sanity images and
 * the CSRF token endpoint. `onUnexpected` receives any other external request,
 * which is aborted.
 */
export async function mockThirdParties(
  context: BrowserContext,
  onUnexpected: (url: string) => void = () => {},
): Promise<void> {
  // Lowest priority (registered first): anything external that isn't mocked below.
  await context.route(
    url => url.hostname !== 'localhost' && url.hostname !== '127.0.0.1',
    route => {
      onUnexpected(route.request().url());
      return route.abort('blockedbyclient');
    },
  );
  // index.html loads it as a cross-origin module script, which needs CORS.
  await context.route('https://cdn.gpteng.co/**', route =>
    route.fulfill({ contentType: 'application/javascript', headers: CORS, body: '' }),
  );
  // Aborting instead would log console errors.
  await context.route('https://fonts.googleapis.com/**', route =>
    route.fulfill({ contentType: 'text/css', headers: CORS, body: '' }),
  );
  await context.route('https://fonts.gstatic.com/**', route => route.fulfill({ status: 204, headers: CORS }));
  await context.route('https://cdn.sanity.io/**', route =>
    route.fulfill({ contentType: 'image/png', headers: CORS, body: PNG_1PX }),
  );
  await context.route('**/api/csrf-token', route => route.fulfill({ status: 200, json: { token: CSRF_TOKEN } }));
}
