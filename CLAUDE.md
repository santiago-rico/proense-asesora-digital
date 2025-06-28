# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **Frontend**: React 18 with TypeScript, built with Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router v6
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
│   └── csrf-token.ts       # CSRF protection endpoint
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
- `RESEND_API_KEY` - Resend email service API key
- `NOTIFICATION_EMAIL` - Email for notifications
- `CSRF_SECRET` - Secret for CSRF token generation

### Testing Approach
- Tests are written using Vitest
- Test files follow `*.test.ts` or `*.test.tsx` pattern
- Run a single test file: `npm test path/to/file.test.ts`

### Important Security Considerations
- All forms implement CSRF protection
- File uploads are validated on both client and server
- API endpoints validate request origins
- Sensitive data is never logged or exposed in client code