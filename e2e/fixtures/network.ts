import { test as base, expect } from '@playwright/test';
import type { SanityPost } from './blog-data';
import { fulfillSanity, mockThirdParties, parseSanityQuery, SANITY_QUERY_URL, type SanityQuery } from './third-party';

/**
 * The `test` every spec imports. Its auto fixtures keep the suite off the live
 * network and fail a test on unexpected errors:
 *
 * - gpteng, Google Fonts, Sanity images and /api/csrf-token are stubbed
 *   (`third-party.ts`); any other external request is aborted and fails the test.
 * - The Sanity query API serves `sanity.posts` (default `[]`), answering each
 *   query the way `blogService.ts` expects.
 * - Any `pageerror`, and any `console.error` not allowed by `consoleErrors.allow()`,
 *   fails the test when it ends.
 *
 * ```ts
 * import { test, expect } from '../../fixtures/network';
 * test.beforeEach(({ sanity }) => { sanity.posts = blogPosts(14); });
 * test('…', async ({ page, sanity, consoleErrors }) => { … });
 * ```
 */

/** Console errors every test tolerates. `NotFound` logs this on purpose. */
const ALWAYS_ALLOWED: RegExp[] = [/^404 Error:/];

/**
 * Chromium logs a failed request (mocked 4xx/5xx or an aborted request) as a
 * console error. Allow it in tests that mock a failing response on purpose.
 */
export const FAILED_REQUEST = /^Failed to load resource/;

export class ConsoleErrors {
  private readonly allowed = [...ALWAYS_ALLOWED];
  /** Every unexpected error, as "console.error: …" or "pageerror: …". */
  readonly unexpected: string[] = [];

  /** Tolerate console errors matching any of `patterns` for the rest of the test. */
  allow(...patterns: RegExp[]): void {
    this.allowed.push(...patterns);
  }

  recordConsole(text: string, url?: string): void {
    if (this.allowed.some(p => p.test(text))) return;
    this.unexpected.push(`console.error: ${text}${url ? ` (${url})` : ''}`);
  }

  recordPageError(error: Error): void {
    this.unexpected.push(`pageerror: ${error.message}`);
  }
}

export interface SanityMock {
  /** Posts served to every query; read when each request arrives, so set it before navigating. */
  posts: SanityPost[];
  /** Every GROQ query the page made, with its decoded params. */
  readonly queries: SanityQuery[];
  /** Answer every query with this HTTP status instead (e.g. 500). Also allows the resulting console errors. */
  failWith(status: number): void;
  /** Hold every query until the returned `release()` is called (loading states). */
  hold(): () => void;
}

// Posts are set on `sanity.posts`, not through a `test.use()` option: Playwright
// reads an array whose 2nd item is an object as a `[value, options]` tuple.
interface Fixtures {
  consoleErrors: ConsoleErrors;
  sanity: SanityMock;
}

export const test = base.extend<Fixtures>({
  consoleErrors: [
    async ({ page, context }, use) => {
      const guard = new ConsoleErrors();
      const unexpectedRequests: string[] = [];
      await mockThirdParties(context, url => unexpectedRequests.push(url));
      page.on('pageerror', error => guard.recordPageError(error));
      page.on('console', msg => {
        if (msg.type() === 'error') guard.recordConsole(msg.text(), msg.location().url);
      });

      await use(guard);

      expect(unexpectedRequests, 'Unmocked external requests').toEqual([]);
      expect(guard.unexpected, 'Unexpected page or console errors').toEqual([]);
    },
    { auto: true },
  ],

  sanity: [
    async ({ context, consoleErrors }, use) => {
      let failStatus: number | null = null;
      let gate: Promise<void> = Promise.resolve();
      const mock: SanityMock = {
        posts: [],
        queries: [],
        failWith(status) {
          failStatus = status;
          consoleErrors.allow(FAILED_REQUEST);
        },
        hold() {
          let release!: () => void;
          gate = new Promise<void>(resolve => (release = resolve));
          return release;
        },
      };

      await context.route(SANITY_QUERY_URL, async route => {
        const request = parseSanityQuery(route.request().url());
        mock.queries.push(request);
        await gate;
        if (failStatus !== null) return fulfillSanity(route, null, failStatus);
        return fulfillSanity(route, answerQuery(request, mock.posts));
      });

      await use(mock);
    },
    { auto: true },
  ],
});

export { expect };

const byDateDesc = (a: SanityPost, b: SanityPost) => b.date.localeCompare(a.date);

/** Mirrors the four queries in `src/services/blogService.ts`. */
function answerQuery({ query, params }: SanityQuery, posts: SanityPost[]): unknown {
  const sorted = [...posts].sort(byDateDesc);
  if (query.includes('slug.current == $slug')) {
    return sorted.find(p => p.slug === params.slug) ?? null;
  }
  if (query.includes('$category in categories[]->title')) {
    return sorted.filter(p => p.category === params.category);
  }
  if (query.includes('[0...$limit]')) {
    return sorted.slice(0, Number(params.limit));
  }
  return sorted;
}
