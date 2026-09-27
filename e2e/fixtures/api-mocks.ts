import type { Page, Request, Route } from '@playwright/test';

/**
 * API mocks for the e2e suite.
 *
 * `npm run dev` serves only the Vite app — /api/* is not executed (a request to
 * it returns the TypeScript source), and the real functions send emails through
 * Brevo. Every test therefore mocks the endpoints its form calls. Server-side
 * validation, CSRF and sanitization are covered by the Vitest suites.
 *
 * The CSRF token endpoint is already stubbed for every test by the auto fixture
 * in `network.ts`; `mockCsrfToken`/`mockCsrfFailure` override it per page.
 *
 * Always answer with `route.fulfill({ json })`: `src/utils/safe-response.ts`
 * treats a non-JSON body as a failure, even with status 200.
 */

export const CSRF_TOKEN = 'e2e-csrf-token';

/** Form endpoints. LeadForm and cotización post JSON; the others post multipart. */
export const EMISION_ENDPOINT = '**/api/send-insurance-application-email';
export const LEAD_ENDPOINT = '**/api/send-email';
export const QUOTE_ENDPOINT = '**/api/send-quote-request';
export const MODIFICATION_ENDPOINT = '**/api/send-modification-request';
export const CANCELLATION_ENDPOINT = '**/api/send-cancellation-request';

export interface CapturedSubmission {
  headers: Record<string, string>;
  /** Text fields; a key that appears several times keeps every value. */
  fields: Record<string, string[]>;
  /** Uploaded files by field name. */
  files: Record<string, { filename: string; contentType: string; size: number }[]>;
}

/** A captured JSON submission (LeadForm, cotización). */
export interface CapturedJson<T = Record<string, unknown>> {
  headers: Record<string, string>;
  body: T;
}

export type Responder = (route: Route, attempt: number) => Promise<void>;

export const respond = {
  success: (): Responder => route =>
    route.fulfill({ status: 200, json: { message: 'Solicitud enviada con éxito.' } }),
  json: (status: number, body: unknown): Responder => route =>
    route.fulfill({ status, json: body }),
  networkError: (): Responder => route => route.abort('failed'),
  /** Never answers — the client's own timeout has to give up. */
  hang: (): Responder => () => new Promise<void>(() => {}),
};

export async function mockCsrfToken(page: Page): Promise<void> {
  await page.route('**/api/csrf-token', route => route.fulfill({ status: 200, json: { token: CSRF_TOKEN } }));
}

/** Makes the CSRF token endpoint fail (the `useCsrf` error card, "Cargando..." buttons). */
export async function mockCsrfFailure(page: Page, responder: Responder = respond.json(500, { message: 'Error' })): Promise<void> {
  await page.route('**/api/csrf-token', route => responder(route, 0));
}

/**
 * Mocks `endpoint` and captures every request with `capture`. `responders[i]`
 * answers attempt i (the last one repeats; default: success).
 */
async function mockEndpoint<T>(
  page: Page,
  endpoint: string,
  capture: (request: Request) => Promise<T>,
  responders: Responder[],
): Promise<T[]> {
  const captured: T[] = [];
  const handlers = responders.length > 0 ? responders : [respond.success()];
  await page.route(endpoint, async route => {
    const attempt = captured.length;
    captured.push(await capture(route.request()));
    await handlers[Math.min(attempt, handlers.length - 1)](route, attempt);
  });
  return captured;
}

/** Mocks a multipart endpoint (emisión, modificación, cancelación). */
export function mockMultipartSubmission(
  page: Page,
  endpoint: string,
  ...responders: Responder[]
): Promise<CapturedSubmission[]> {
  return mockEndpoint(page, endpoint, captureSubmission, responders);
}

/** Mocks a JSON endpoint (LeadForm, cotización); `body` is the parsed request JSON. */
export function mockJsonSubmission<T = Record<string, unknown>>(
  page: Page,
  endpoint: string,
  ...responders: Responder[]
): Promise<CapturedJson<T>[]> {
  return mockEndpoint(
    page,
    endpoint,
    async request => ({ headers: await request.allHeaders(), body: request.postDataJSON() as T }),
    responders,
  );
}

/** Mocks the emisión endpoint (see `mockMultipartSubmission`). */
export function mockEmisionSubmission(page: Page, ...responders: Responder[]): Promise<CapturedSubmission[]> {
  return mockMultipartSubmission(page, EMISION_ENDPOINT, ...responders);
}

async function captureSubmission(request: Request): Promise<CapturedSubmission> {
  const headers = await request.allHeaders();
  const body = request.postDataBuffer();
  const contentType = headers['content-type'] ?? '';
  return { headers, ...parseMultipart(body, contentType) };
}

function parseMultipart(
  body: Buffer | null,
  contentType: string,
): Pick<CapturedSubmission, 'fields' | 'files'> {
  const fields: CapturedSubmission['fields'] = {};
  const files: CapturedSubmission['files'] = {};
  const boundary = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  if (!body || !boundary) return { fields, files };

  // latin1 maps bytes 1:1, so binary file parts can't corrupt the offsets.
  const raw = body.toString('latin1');
  for (const part of raw.split(`--${boundary[1] ?? boundary[2]}`)) {
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const head = part.slice(0, headerEnd);
    const content = part.slice(headerEnd + 4).replace(/\r\n$/, '');
    const name = /name="([^"]*)"/.exec(head)?.[1];
    if (!name) continue;

    const filename = /filename="([^"]*)"/.exec(head)?.[1];
    if (filename !== undefined) {
      const partType = /content-type:\s*([^\r\n]+)/i.exec(head)?.[1] ?? '';
      (files[name] ??= []).push({
        filename: Buffer.from(filename, 'latin1').toString('utf8'),
        contentType: partType,
        size: content.length,
      });
    } else {
      (fields[name] ??= []).push(Buffer.from(content, 'latin1').toString('utf8'));
    }
  }
  return { fields, files };
}

/** First value of a captured text field. */
export function field(submission: CapturedSubmission, name: string): string | undefined {
  return submission.fields[name]?.[0];
}
