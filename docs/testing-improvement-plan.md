# Testing Improvement Plan for Proense Asesora Digital

## Executive Summary

This document outlines a comprehensive plan to improve the testing infrastructure for the Proense Asesora Digital platform. The plan addresses three key areas:
1. Fixing JSDOM configuration issues
2. Implementing E2E tests with Playwright
3. Increasing test coverage to >80%

## Current State Assessment

### Test Infrastructure
- **Framework**: Vitest 3.2.4 with React Testing Library
- **Environment**: JSDOM v26.1.0
- **Current Coverage**: Estimated ~30% overall
- **Key Issues**: JSDOM compatibility problems with modern UI libraries

### Critical Gaps
- No CSRF protection hook tests
- 0% API endpoint coverage
- Missing E2E tests
- No automated security testing
- Limited accessibility testing

## Phase 1: Fix JSDOM Configuration (Week 1)

### 1.1 Immediate Fixes

#### Update test-setup.ts
```typescript
// src/test-setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Existing mocks...

// Add Pointer Events API polyfill
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
}

// Enhanced scrollIntoView mock
Element.prototype.scrollIntoView = vi.fn(function(arg) {
  if (typeof arg === 'object' && arg !== null) {
    // Handle ScrollIntoViewOptions
    return;
  }
  // Handle boolean parameter
});

// Add scroll methods
Element.prototype.scroll = vi.fn();
Element.prototype.scrollTo = vi.fn();

// Mock HTMLElement methods
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  value: 100,
});

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 100,
});
```

### 1.2 Add Testing Utilities

#### Create test utils directory
```typescript
// src/test-utils/render.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### 1.3 Update Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'src/sanity/**',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Phase 2: Implement E2E Tests with Playwright (Weeks 2-3)

### 2.1 Installation and Setup

```bash
# Install Playwright
npm init playwright@latest -- --yes --browser=chromium --browser=webkit --lang=ts

# Additional dependencies
npm i -D axe-playwright @axe-core/playwright
```

### 2.2 Playwright Configuration

Create `playwright.config.ts` (see detailed configuration in research findings).

### 2.3 E2E Test Structure

```
e2e/
├── fixtures/
│   ├── test-data.ts
│   └── page-objects/
│       ├── base-page.ts
│       ├── insurance-form.ts
│       ├── lead-form.ts
│       └── components/
│           ├── navbar.ts
│           └── file-upload.ts
├── tests/
│   ├── critical-paths/
│   │   ├── insurance-application.spec.ts
│   │   ├── lead-generation.spec.ts
│   │   └── contact-form.spec.ts
│   ├── forms/
│   │   ├── modification-request.spec.ts
│   │   └── cancellation-request.spec.ts
│   ├── security/
│   │   ├── csrf-protection.spec.ts
│   │   └── file-upload-security.spec.ts
│   └── accessibility/
│       └── wcag-compliance.spec.ts
└── utils/
    ├── csrf-helper.ts
    ├── file-upload-helper.ts
    └── test-helpers.ts
```

### 2.4 Priority E2E Tests

#### Week 2: Critical User Paths
1. **Insurance Application Flow**
   - Multi-step form navigation
   - File upload functionality
   - Form validation
   - Success confirmation

2. **Lead Generation**
   - Dialog interaction
   - Form submission
   - Email verification

#### Week 3: Secondary Flows
3. **Client Services**
   - Modification requests
   - Cancellation requests
   - File attachments

4. **Content & Navigation**
   - Insurance product pages
   - Blog functionality
   - Contact form

## Phase 3: Increase Test Coverage (Weeks 4-6)

### 3.1 Priority Testing Areas

#### Week 4: Security-Critical Components
1. **CSRF Protection Hook** (`use-csrf.ts`)
   ```typescript
   // src/hooks/__tests__/use-csrf.test.ts
   describe('useCsrf', () => {
     it('fetches CSRF token on mount');
     it('handles token refresh on 403');
     it('retries on network failure');
     it('provides loading states');
   });
   ```

2. **API Endpoints** (all files in `/api/`)
   - Input validation
   - Sanitization
   - Rate limiting
   - Error handling

3. **File Upload Component**
   - Size validation
   - Type validation
   - Security checks

#### Week 5: Business Logic
4. **Form Schemas and Validation**
   - All Zod schemas
   - Conditional validation rules
   - Error messages

5. **Form Step Components**
   - Step navigation
   - Data persistence
   - Conditional rendering

#### Week 6: UI Components & Integration
6. **Shared Components**
   - FormSuccessScreen
   - OptimizedImage
   - Layout components

7. **Integration Tests**
   - Complete form submission flows
   - API integration
   - Email sending

### 3.2 Test Templates

#### API Endpoint Test Template
```typescript
// api/__tests__/send-email.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../send-email';

describe('send-email API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Security', () => {
    it('validates CSRF token');
    it('sanitizes input data');
    it('enforces rate limiting');
    it('validates honeypot field');
  });

  describe('Functionality', () => {
    it('sends email via Brevo');
    it('sends notification via Resend');
    it('handles API failures gracefully');
  });
});
```

#### Component Test Template
```typescript
// components/forms/__tests__/FormComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';

describe('FormComponent', () => {
  describe('Rendering', () => {
    it('renders all required fields');
    it('shows proper labels and placeholders');
  });

  describe('Validation', () => {
    it('validates required fields');
    it('shows error messages');
    it('prevents submission with invalid data');
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels');
    it('is keyboard navigable');
    it('announces errors to screen readers');
  });

  describe('Submission', () => {
    it('submits with valid data');
    it('handles submission errors');
    it('shows success state');
  });
});
```

## Implementation Timeline

### Week 1: JSDOM Fixes
- [ ] Update test-setup.ts with comprehensive mocks
- [ ] Create custom render utility
- [ ] Fix all failing tests
- [ ] Set up coverage reporting

### Weeks 2-3: Playwright E2E
- [ ] Install and configure Playwright
- [ ] Create page objects for main flows
- [ ] Implement critical path tests
- [ ] Add to CI/CD pipeline

### Weeks 4-6: Coverage Improvement
- [ ] Week 4: Security-critical tests (CSRF, API, uploads)
- [ ] Week 5: Business logic tests (forms, validation)
- [ ] Week 6: UI component tests and integration

### Week 7: Documentation & Review
- [ ] Create testing guidelines
- [ ] Document test patterns
- [ ] Review and refactor tests
- [ ] Ensure 80% coverage threshold

## Success Metrics

1. **JSDOM Issues**: All tests pass without console errors
2. **E2E Coverage**: Critical user paths covered
3. **Unit Test Coverage**: >80% for all categories
4. **CI/CD Integration**: All tests run automatically
5. **Performance**: Test suite runs in <5 minutes

## Required Resources

### Dependencies to Add
```json
{
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "axe-playwright": "^2.0.0",
    "@vitest/coverage-v8": "^3.2.4",
    "msw": "^2.0.0"
  }
}
```

### CI/CD Updates
- Add E2E test job to GitHub Actions
- Configure test result reporting
- Set up coverage badges
- Add performance benchmarks

## Maintenance Plan

1. **Weekly**: Review test failures and flaky tests
2. **Bi-weekly**: Update test data and fixtures
3. **Monthly**: Review coverage reports and identify gaps
4. **Quarterly**: Update test strategy based on new features

## Risk Mitigation

1. **Flaky Tests**: Implement retry logic and better wait strategies
2. **Performance**: Parallelize tests and use test sharding
3. **Maintenance**: Create clear test patterns and documentation
4. **False Positives**: Regular test audit and cleanup

## Conclusion

This comprehensive plan will transform the testing infrastructure from its current limited state to a robust, maintainable system that ensures code quality and prevents regressions. The phased approach allows for incremental improvements while maintaining development velocity.