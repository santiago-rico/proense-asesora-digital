# E2E tests (Playwright)

End-to-end tests that drive the real app in a browser. They cover the emisión
(policy issuance) form at `/clientes/emision-polizas`.

## Structure

```
e2e/
├── global-setup.ts                 # Warms up the Vite dev server before any test
├── tsconfig.json                   # Type-checking for the suite (not part of the app build)
├── fixtures/
│   ├── api-mocks.ts                # page.route mocks + multipart capture of submissions
│   ├── test-data.ts                # Applicant data and in-memory upload files
│   └── page-objects/
│       └── insurance-form.ts       # Page object for the emisión multi-step form
└── tests/
    └── critical-paths/
        └── insurance-application.spec.ts
```

## Running

```bash
npx playwright install chromium     # once, downloads the browser
npm run test:e2e                    # starts `npm run dev` on :8080 (or reuses a running one)
npm run test:e2e:ui                 # interactive mode
npm run test:e2e:headed             # watch the browser
npm run test:e2e:report             # open the last HTML report

npx playwright test -g "Hogar"                  # filter by test title
npx playwright test --project=chromium          # desktop only
E2E_WEBKIT=1 npx playwright test                # also Desktop/Mobile Safari (needs `npx playwright install webkit`)
npx tsc -p e2e/tsconfig.json                    # type-check the suite
```

Default projects are desktop Chromium and a mobile Chromium viewport (Pixel 5),
so every test also runs at phone width. In CI mode (`CI=1`) the suite uses one
worker, retries failures twice and always starts its own dev server.

## How the API is handled

`npm run dev` serves only the Vite app — requests to `/api/*` are not executed
(they return the TypeScript source), and the real functions send emails through
Brevo. Every test therefore mocks the endpoints with `page.route`
(`fixtures/api-mocks.ts`):

- `/api/csrf-token` returns a fixed token (`InsuranceFormPage.open()` sets this up).
- `/api/send-insurance-application-email` answers per test via
  `mockEmisionSubmission(page, ...responders)`: `respond.success()`,
  `respond.json(status, body)`, `respond.networkError()` or `respond.hang()`.
  Responder *i* answers attempt *i* (the last one repeats), which is how the
  automatic retry is tested.
- Every submission is captured (headers, text fields, uploaded file names) so
  tests assert exactly what the form sends — e.g. the CSRF header and the hogar
  declaration answers.

Server-side behaviour (validation, CSRF verification, sanitization, emails) is
covered by the Vitest suites in `tests/api/` and `src/utils/email-templates/`.

## Conventions

- Locate elements the way users and assistive tech do: `getByRole`,
  `getByLabel`, `getByPlaceholder`, `getByText`. The app has no `data-testid`s.
- Upload files are built in memory (`fixtures/test-data.ts`); nothing is written to disk.
- The hogar declaration questions come from `src/data/hogarAsegurabilidad.ts`,
  the same source the app uses, so wording changes don't break the tests.
- Known app bugs are recorded as `test.fail(...)` with the reason. Such a test
  passes while the bug exists; once the bug is fixed it starts failing — remove
  the `test.fail` line then.
- The timeout test installs Playwright's fake clock (`page.clock`) to
  fast-forward the form's 63s request timeout.
- `global-setup.ts` loads the form once before the run: on a cold cache Vite
  re-optimizes dependencies on the first visit and reloads the page, which
  would otherwise break whichever test hit it first.
