# E2E tests (Playwright)

End-to-end tests that drive the real app in a browser: every page, its
navigation and accessibility, and the public forms (lead, cotización, emisión,
modificación, cancelación).

## Structure

```
e2e/
├── global-setup.ts                 # Warms up the Vite dev server before any test
├── tsconfig.json                   # Type-checking for the suite (not part of the app build)
├── fixtures/
│   ├── network.ts                  # `test`/`expect` for every spec: third-party + Sanity mocks, console-error guard
│   ├── third-party.ts              # Stubs for gpteng, Google Fonts, Sanity images, /api/csrf-token
│   ├── blog-data.ts                # Sanity blog post builders
│   ├── api-mocks.ts                # Form endpoint mocks + JSON/multipart capture of submissions
│   ├── test-data.ts                # Applicant data and in-memory upload files
│   └── page-objects/
│       ├── site.ts                 # Navbar, mobile menu, footer, lead dialog, toasts
│       ├── insurance-form.ts       # Emisión multi-step form
│       ├── lead-form.ts            # LeadForm (page or dialog)
│       ├── quote-form.ts           # Cotización multi-step form
│       └── service-request-form.ts # Modificación and cancelación forms
└── tests/
    ├── critical-paths/             # Forms: submissions, validation, server responses
    │   ├── insurance-application.spec.ts
    │   ├── lead-form.spec.ts
    │   ├── quote-request.spec.ts
    │   └── service-requests.spec.ts
    └── site/                       # Pages, navigation and accessibility
        ├── smoke.spec.ts           # Every route: h1, title, navbar, footer, no errors
        ├── navigation.spec.ts      # Navbar, mobile menu, dialog entry points, footer, 404
        ├── behaviours.spec.ts      # Skip link, scroll-to-top, lazy-route spinner
        ├── home.spec.ts
        ├── product-pages.spec.ts
        ├── blog.spec.ts
        ├── client-pages.spec.ts
        └── accessibility.spec.ts   # axe scans (WCAG 2.1 AA) of every route and key states
```

## Running

```bash
npx playwright install chromium     # once, downloads the browser
npm run test:e2e                    # starts `npm run dev` on :8080 (or reuses a running one)
npm run test:e2e:ui                 # interactive mode
npm run test:e2e:headed             # watch the browser
npm run test:e2e:report             # open the last HTML report

npx playwright test e2e/tests/site              # one folder
npx playwright test -g "Hogar"                  # filter by test title
npx playwright test --project=chromium          # desktop only
E2E_WEBKIT=1 npx playwright test                # also Desktop/Mobile Safari (needs `npx playwright install webkit`)
npx tsc -p e2e/tsconfig.json                    # type-check the suite
```

Default projects are desktop Chromium and a mobile Chromium viewport (Pixel 5),
so every test also runs at phone width. Desktop- or mobile-only tests skip the
other project with `test.skip(({ isMobile }) => …)`. The timezone is pinned to
`America/Bogota`, because the blog formats dates in local time. In CI mode
(`CI=1`) the suite retries failures twice and always starts its own dev server.

The suite runs in GitHub Actions as the **E2E Tests (Playwright)** job in
`.github/workflows/ci.yml`, split into 4 parallel shards
(`npx playwright test --shard=N/4`), and a failure fails the CI Summary.
Chromium is cached per Playwright version. When a shard fails, its HTML report
and traces are uploaded as the `playwright-report-N` artifact. Locally, video is
off (it costs a lot of CPU); CI keeps it for failed tests.

## No live network

Every spec imports `test` and `expect` from `fixtures/network.ts`, never from
`@playwright/test`. Its auto fixtures run for every test:

- **Third parties are stubbed** (`fixtures/third-party.ts`): the gpteng script,
  Google Fonts, Sanity images and `/api/csrf-token`. Any other external request
  is aborted, and the test fails listing its URL.
- **Sanity** (`sanity` fixture): the query API serves `sanity.posts` and answers
  each GROQ query from `src/services/blogService.ts` (by slug, by category,
  recent, all). Posts default to `[]`; set `sanity.posts = blogPosts(14)` in a
  `beforeEach` or in the test, before navigating. (Not through a `test.use()`
  option: Playwright reads an array whose 2nd item is an object as a
  `[value, options]` tuple.) `sanity.failWith(500)` makes queries
  fail, `sanity.hold()` delays them until released, and `sanity.queries` records
  what the page asked for. Build posts with `fixtures/blog-data.ts`.
- **Console guard** (`consoleErrors` fixture): any uncaught page error, or any
  `console.error` not on the allowlist, fails the test when it ends. `NotFound`'s
  `404 Error:` log is always allowed. A test that triggers an error on purpose
  allows exactly what it expects:
  `consoleErrors.allow(FAILED_REQUEST, /^API Error:/)`.

## Form endpoints

`npm run dev` serves only the Vite app. Requests to `/api/*` are not executed
(they return the TypeScript source), and the real functions send emails through
Brevo. Every form test therefore mocks its endpoint (`fixtures/api-mocks.ts`):

- `mockJsonSubmission(page, LEAD_ENDPOINT | QUOTE_ENDPOINT, ...responders)`
  captures `{ headers, body }`, with the parsed JSON body.
- `mockMultipartSubmission(page, EMISION_ENDPOINT | MODIFICATION_ENDPOINT |
  CANCELLATION_ENDPOINT, ...responders)` captures headers, text fields and
  uploaded file names. `mockEmisionSubmission(page, ...)` is its emisión shorthand.
- Responders: `respond.success()`, `respond.json(status, body)`,
  `respond.networkError()`, `respond.hang()`. Responder *i* answers attempt *i*
  (the last one repeats), which is how retries are tested. Always answer with
  JSON: `src/utils/safe-response.ts` treats a non-JSON body as a failure, even
  with status 200.
- `mockCsrfFailure(page)` makes the CSRF token endpoint fail.

Tests assert exactly what each form sends, e.g. the CSRF header, the E.164
phone and the empty honeypot. Server-side behaviour (validation, CSRF
verification, sanitization, emails) is covered by the Vitest suites in
`tests/api/` and `src/utils/email-templates/`.

## Conventions

- Locate elements the way users and assistive tech do: `getByRole`,
  `getByLabel`, `getByPlaceholder`, `getByText`. The app has no `data-testid`s.
- Upload files are built in memory (`fixtures/test-data.ts`); nothing is written to disk.
- Expectations come from the app's own data where practical (product data, the
  hogar declaration questions), so copy changes don't break the tests.
- Known app bugs are recorded as `test.fail(true, 'Known bug: …')` in a test
  that asserts the correct behaviour. Such a test passes while the bug exists;
  once the bug is fixed it starts failing, and then you remove the `test.fail`
  line. Known accessibility violations are listed per route in
  `accessibility.spec.ts`: they're disabled in the regression scan and asserted
  in their own `test.fail` tests.
- Long timers (the emisión 63 s request timeout, the blog's React Query
  retries) are fast-forwarded with Playwright's fake clock (`page.clock`).
- `global-setup.ts` loads every page type once before the run: on a cold cache
  Vite re-optimizes dependencies on the first visit and reloads the page, which
  would otherwise break whichever test hit it first.

## Locator traps

- Several "Solicitar Asesoría" buttons exist per page: scope to `site.main` or `site.nav`.
- An open Radix dialog hides the rest of the page from `getByRole`. `getByLabel`
  does not filter aria-hidden elements, so scope to `site.leadDialog`.
- Labels often end in `" *"`: match with a regex or substring.
- Checkbox labels contain links: click the checkbox role, never the label text.
- Only one toast shows at a time and it closes after ~5 s. On mobile it covers
  the hamburger button while shown.
- The collapsed mobile menu (`max-h-0 opacity-0`) still counts as visible:
  assert `aria-expanded`/`aria-hidden`, not `toBeHidden()`.
- Radix NavigationMenu dropdowns open on hover and toggle on click: use one or
  the other, because hover then click closes the menu again.
