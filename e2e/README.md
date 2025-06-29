# E2E Tests with Playwright

This directory contains end-to-end tests for the Proense Asesora Digital application using Playwright.

## Structure

```
e2e/
├── fixtures/
│   ├── test-data.ts           # Test data and data generators
│   └── page-objects/          # Page Object Model classes
│       ├── base-page.ts       # Base page object with common functionality
│       ├── insurance-form.ts  # Insurance application form page object
│       └── lead-form.ts       # Lead generation form page object
├── tests/
│   └── critical-paths/        # Critical user journey tests
│       └── insurance-application.spec.ts  # Insurance application flow tests
├── utils/                     # Test utilities and helpers
│   ├── csrf-helper.ts         # CSRF token management utilities
│   ├── file-upload-helper.ts  # File upload testing utilities
│   ├── test-helpers.ts        # General test helper functions
│   ├── global-setup.ts        # Global test setup
│   └── global-teardown.ts     # Global test cleanup
└── README.md                  # This file
```

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests (step-by-step)
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Advanced Options

```bash
# Run specific test file
npx playwright test insurance-application.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=webkit

# Run tests with specific grep pattern
npx playwright test --grep "auto insurance"

# Update screenshots
npx playwright test --update-snapshots
```

## Test Categories

### Critical Paths
- **Insurance Application Flow**: Complete multi-step insurance application process
- **Lead Generation**: Contact form and lead capture functionality
- **Client Services**: Modification and cancellation requests

### Test Types
- **Functional Tests**: Core application functionality
- **Security Tests**: CSRF protection, XSS prevention, input sanitization
- **Accessibility Tests**: Keyboard navigation, ARIA labels, screen reader support
- **Performance Tests**: Load times, submission times
- **Mobile Tests**: Responsive design and mobile functionality
- **Error Handling**: Network failures, server errors, validation errors

## Page Objects

### BasePage
Common functionality shared across all pages:
- Navigation helpers
- Form interaction utilities
- Accessibility testing methods
- Performance measurement tools
- Screenshot and debugging utilities

### InsuranceFormPage
Specific to the multi-step insurance application form:
- Step-by-step navigation
- Form field interactions
- File upload functionality
- Validation testing
- Progress tracking

### LeadFormPage
Lead generation dialog functionality:
- Dialog interaction (open/close)
- Form submission
- Validation testing
- Security testing

## Test Data

The `test-data.ts` file contains:
- Valid and invalid form data
- Security test payloads (XSS, SQL injection attempts)
- File upload test data
- Navigation test data
- Performance benchmarks

## Utilities

### CSRF Helper
- Fetches and manages CSRF tokens
- Tests CSRF protection mechanisms
- Simulates CSRF attacks for security testing

### File Upload Helper
- Creates test files (PDF, images, invalid files)
- Tests file validation (size, type, security)
- Manages temporary test files
- Simulates malicious file uploads

### Test Helpers
- Performance measurement utilities
- Accessibility testing helpers
- Network simulation (slow, offline)
- Form interaction utilities
- Screenshot and debugging tools

## Configuration

Tests are configured in `playwright.config.ts`:
- Multiple browser support (Chromium, WebKit)
- Mobile device testing
- Parallel execution
- Report generation
- Timeout settings
- Retry logic

## Best Practices

### Writing Tests
1. Use Page Object Model for maintainability
2. Include both positive and negative test cases
3. Test accessibility and keyboard navigation
4. Verify security measures (CSRF, XSS protection)
5. Test responsive design across devices
6. Include performance assertions

### Test Data
1. Use descriptive test data that reflects real usage
2. Clean up test files after each test
3. Use data generators for unique test data
4. Separate valid and invalid test data clearly

### Error Handling
1. Test network failure scenarios
2. Verify graceful error handling
3. Test form validation edge cases
4. Simulate server errors

### Security Testing
1. Test CSRF protection on all forms
2. Verify input sanitization
3. Test file upload security
4. Check for XSS vulnerabilities

## Debugging

### Common Issues
- **Timeouts**: Increase timeout values or add wait conditions
- **Flaky Tests**: Add proper wait conditions and retry logic
- **Element Not Found**: Verify selectors and page load states
- **File Upload Issues**: Check file paths and cleanup

### Debug Tools
- Use `--debug` flag for step-by-step debugging
- Take screenshots with `takeTimestampedScreenshot()`
- Use `page.pause()` to pause execution
- Check browser console with `captureConsoleErrors()`

## CI/CD Integration

Tests are designed to run in CI/CD environments:
- Headless execution by default
- Configurable base URL
- Proper cleanup and teardown
- Test result reporting
- Screenshot and video capture on failures

## Contributing

When adding new tests:
1. Follow the existing Page Object Model pattern
2. Add test data to `test-data.ts`
3. Include accessibility and security tests
4. Add appropriate documentation
5. Ensure tests are reliable and not flaky