# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General Instructions
- ALWAYS use subagents to speed up the implementation where possible. 

## Common Development Commands

### Development
```bash
npm run dev          # Start development server on port 8080
npm run build        # Build for production
npm run build:dev    # Build with development mode
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint checks
npm test             # Run tests with Vitest
```

### Database Operations (Sanity CMS)
```bash
npm run db:seed      # Seed Sanity database with initial data
npm run db:clear     # Clear Sanity database
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 with TypeScript, built with Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **Forms**: React Hook Form with Zod 4 validation
- **Routing**: React Router v7 (`react-router-dom`)
- **CMS**: Sanity.io for blog and dynamic content
- **API**: Vercel serverless functions in `/api` directory
- **Email**: Brevo (formerly Sendinblue) for transactional emails

### Project Structure
```
/
├── api/                    # Vercel serverless functions
│   ├── send-email.ts       # Lead generation email handler
│   ├── send-insurance-application-email.ts
│   ├── send-cancellation-request.ts
│   ├── send-modification-request.ts
│   ├── send-quote-request.ts
│   ├── csrf-token.ts       # CSRF protection endpoint
│   ├── _utils/             # Shared helpers (rate limiter, notification routing)
│   └── _schemas/           # Shared Zod schemas
├── tests/api/              # Vitest tests for the api/ functions
├── src/
│   ├── components/
│   │   ├── forms/          # All form components
│   │   ├── home/           # Homepage sections
│   │   ├── insurance/      # Insurance product components
│   │   ├── layout/         # Layout components (Navbar, Footer)
│   │   ├── shared/         # Reusable components
│   │   └── ui/             # shadcn/ui components
│   ├── pages/              # Page components (route-based)
│   ├── data/               # Static data (insurance products)
│   ├── services/           # API services
│   ├── sanity/             # Sanity CMS configuration
│   └── utils/              # Utility functions
└── proense-asesora-digital/  # Sanity Studio project
```

### Key Patterns

#### Form Architecture
The project uses a sophisticated multi-step form system for insurance applications:
- **Multi-step form** with conditional logic based on insurance type
- **File uploads** handled through React Dropzone
- **Validation** using Zod schemas with React Hook Form
- **CSRF protection** on all form submissions
- **XSS protection** through server-side input sanitization
- **Bot protection** using honeypot fields
- **Accessibility** with proper autocomplete and ARIA attributes

#### API Communication
All API endpoints follow this pattern:
1. Forms submit to Vercel serverless functions in `/api`
2. Functions validate CSRF tokens
3. Data is sent to Brevo CRM for lead management
4. Email notifications are sent via Resend

#### Component Organization
- UI components use shadcn/ui pattern (copy-paste components)
- Complex forms are broken into step components
- Shared components handle common UI patterns
- Type-safe props using TypeScript

#### State Management
- No global state management library
- Form state managed by React Hook Form
- Server state handled with React Query
- Local state with React hooks

### Path Aliases
The project uses `@/` as an alias for `./src/`:
```typescript
import { Button } from "@/components/ui/button"
```

### Environment Variables
Required environment variables:
- `VITE_SANITY_PROJECT_ID` - Sanity project ID
- `VITE_SANITY_DATASET` - Sanity dataset name
- `SANITY_API_TOKEN` - Sanity API token
- `BREVO_API_KEY` - Brevo email service API key
- `BREVO_SENDER_EMAIL` - Sender email address for transactional emails
- `BREVO_SENDER_NAME` - Sender name for transactional emails
- `NOTIFICATION_EMAILS` - Comma-separated list of emails that receive **every** form submission (e.g., `agent1@company.com,agent2@company.com`)
- `CSRF_SECRET` - Secret for CSRF token generation

#### Per-form email routing
Each form's agent notification is sent to `NOTIFICATION_EMAILS` **plus** the form's own list, merged and de-duplicated (case-insensitive). All lists are comma-separated and optional. See `.env.example` for a worked example.

- `NOTIFY_ASESORIA` - Extra recipients for advisory/lead requests (`send-email.ts`)
- `NOTIFY_COTIZACION` - Extra recipients for quote requests (`send-quote-request.ts`)
- `NOTIFY_EMISION` - Extra recipients for insurance applications/issuance (`send-insurance-application-email.ts`)
- `NOTIFY_MODIFICACION` - Extra recipients for modification requests (`send-modification-request.ts`)
- `NOTIFY_CANCELACION` - Extra recipients for cancellation requests (`send-cancellation-request.ts`)

Routing is resolved centrally in `api/_utils/notification-emails.ts` via `getNotificationEmails(formType)`. If a form has no recipients configured anywhere, it falls back to `comercial@proense.co` so submissions are never lost.

### Testing Approach
- Tests are written using Vitest
- Test files follow `*.test.ts` or `*.test.tsx` pattern
- Run a single test file: `npm test path/to/file.test.ts`
- CI runs `npm run test -- --run --coverage`; a failing test or coverage below the thresholds in `vitest.config.ts` fails CI
- E2E tests use Playwright (`npm run test:e2e`), live in `e2e/` and mock all network access; see `e2e/README.md`
- Security tests available in `tests/security/` directory

### Vercel Function Limit
The project is on Vercel's Hobby plan, which fails any deployment with more than **12 Serverless Functions** (`exceeded_serverless_functions_per_deployment`). Vercel turns every file under `api/` into a function unless it or its folder starts with `_`, test files included. To stay within the limit:
- Only real endpoints live directly in `api/`; shared code goes in `api/_utils/` or `api/_schemas/`
- Tests for API code live in `tests/api/`, never under `api/`

### Security Implementation

#### CSRF Protection
All forms implement CSRF (Cross-Site Request Forgery) protection:
- **Client Side**: `useCsrf` hook fetches token from `/api/csrf-token`
- **Server Side**: Token validation using `csrf` library with httpOnly cookies
- **Headers**: Token sent in `X-CSRF-Token` header
- **Error Handling**: Graceful fallback with token refresh on 403 errors

```typescript
// Example usage in forms
const { token: csrfToken, loading, error } = useCsrf();

// Form submission with CSRF token
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken },
  credentials: 'include',
  body: formData,
});
```

#### XSS Protection
Server-side input sanitization prevents Cross-Site Scripting:
- **DOMPurify**: All user inputs sanitized using DOMPurify with JSDOM
- **File Names**: File upload names are sanitized
- **Email Content**: HTML content is sanitized before email generation

#### Bot Protection
Honeypot fields catch automated submissions:
- **Hidden Fields**: Invisible to users but detectable by bots
- **Server Validation**: Submissions with filled honeypot fields are silently filtered
- **No Indication**: Bots receive success response to avoid detection

#### File Upload Security
Comprehensive file validation:
- **Size Limits**: Maximum 5MB per file
- **Type Validation**: Only allowed MIME types (PDF, images, documents)
- **Count Limits**: Maximum number of files per submission
- **Temporary Cleanup**: Files deleted after processing

### Important Security Considerations
- All forms implement CSRF protection
- File uploads are validated on both client and server
- API endpoints validate request origins
- Sensitive data is never logged or exposed in client code