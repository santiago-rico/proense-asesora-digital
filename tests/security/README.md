# API Endpoints Security Test Suite

This directory contains comprehensive security tests for all API endpoints in the application.

## Overview

The security test suite validates critical security measures across all API endpoints:

- **CSRF Protection**: Ensures all form submissions require valid CSRF tokens
- **XSS Prevention**: Tests input sanitization against cross-site scripting attacks
- **Input Validation**: Validates email formats, required fields, and data constraints
- **File Upload Security**: Tests file type restrictions, size limits, and malicious file handling
- **Rate Limiting**: Verifies rate limiting is active to prevent abuse
- **HTTP Method Validation**: Ensures endpoints only accept appropriate HTTP methods
- **Honeypot Protection**: Tests bot detection and silent filtering

## Test Files

### `test-api-endpoints-security.cjs`
Comprehensive security test suite that covers all endpoints:
- `/api/csrf-token` - CSRF token generation
- `/api/send-email` - Lead generation form
- `/api/send-insurance-application-email` - Insurance application form
- `/api/send-cancellation-request` - Policy cancellation form
- `/api/send-modification-request` - Policy modification form

### Individual Endpoint Tests
- `test-csrf-implementation.js` - Focused CSRF implementation tests
- `test-rate-limiting-security.js` - Rate limiting validation
- `test-multistep-form-security.js` - Multi-step form security
- `test-cancellation-form-security.cjs` - Cancellation form security
- `test-modification-form-security.js` - Modification form security

## Running the Tests

### Prerequisites
1. Start the Vercel development server:
   ```bash
   vercel dev --listen 3002
   ```

2. Ensure the server is running on `http://localhost:3002`
   
   **Note**: The tests require the Vercel dev server, not the Vite dev server, as they need access to the serverless API functions.

### Run All Security Tests
```bash
# Run comprehensive security test suite
node tests/security/test-api-endpoints-security.cjs

# Run individual tests
node tests/security/test-csrf-implementation.js
node tests/security/test-rate-limiting-security.js
```

### Expected Output
The test suite provides detailed output including:
- Real-time test progress with color-coded results
- Summary of passed/failed tests
- Success rate percentage
- Detailed failure reasons
- Security assessment and recommendations

Example output:
```
🚀 Starting Comprehensive API Security Tests...
============================================================

Setting up CSRF token...
✅ CSRF token obtained: Yes
✅ Cookie set: Yes

🔐 Testing CSRF Protection...
✅ CSRF endpoint rejects POST requests
✅ leadForm rejects requests without CSRF token
✅ insuranceApplication rejects requests without CSRF token
...

📊 Test Results Summary
============================================================
Total Tests: 45
✅ Passed: 44
❌ Failed: 1
Success Rate: 97.8%

🔒 Security Assessment:
⚠️ Good security posture with some areas for improvement.
```

## Test Coverage

### CSRF Protection Tests
- Validates CSRF token generation endpoint
- Tests form submission rejection without CSRF token
- Verifies invalid CSRF token rejection
- Checks proper cookie-based secret storage

### Input Validation Tests
- XSS payload injection attempts
- Invalid email format validation
- Required field validation
- SQL injection prevention
- HTML/JavaScript sanitization

### File Upload Security Tests
- Valid file type acceptance (PDF, images)
- Malicious file type rejection (executables, scripts)
- File size limit enforcement (5MB limit)
- Filename sanitization
- MIME type validation

### Rate Limiting Tests
- Rapid request handling
- Rate limit enforcement
- Proper HTTP 429 responses
- Different rate limits per endpoint type

### Method Validation Tests
- HTTP method restrictions
- Proper 405 Method Not Allowed responses
- GET/POST method handling

### Honeypot Protection Tests
- Bot detection via hidden fields
- Silent acceptance of bot submissions
- Legitimate user experience preservation

## Security Standards

The tests validate compliance with:

### OWASP Top 10 Security Risks
- **A01 Broken Access Control**: CSRF protection
- **A03 Injection**: XSS and SQL injection prevention
- **A04 Insecure Design**: Honeypot and rate limiting
- **A05 Security Misconfiguration**: Proper HTTP methods
- **A08 Software and Data Integrity Failures**: File upload validation

### Implementation Standards
- All forms require CSRF tokens
- Input sanitization using DOMPurify
- File upload restrictions (type, size, count)
- Rate limiting (5 requests/minute for forms)
- HTTP method validation
- Honeypot bot protection

## Interpreting Results

### Success Criteria
- **100% Pass Rate**: Excellent security posture
- **≥90% Pass Rate**: Good security with minor issues
- **≥80% Pass Rate**: Acceptable with improvements needed
- **<80% Pass Rate**: Critical security issues requiring immediate attention

### Common Failure Scenarios
1. **CSRF Token Issues**: Server not running or CSRF implementation broken
2. **Rate Limiting Failures**: Rate limiter not configured or too permissive
3. **File Upload Issues**: File validation not working properly
4. **Input Validation Failures**: XSS protection not implemented

### Troubleshooting
- Ensure Vercel development server is running on port 3002 (`vercel dev --listen 3002`)
- Check that all environment variables are set correctly in `.env.local`
- Verify CSRF implementation in API endpoints
- Confirm rate limiting configuration in `api/utils/rate-limiter.ts`
- Make sure you have the Vercel CLI installed (`npm i -g vercel`)

## Adding New Tests

To add tests for new endpoints:

1. Add the endpoint to the `ENDPOINTS` object
2. Create specific test methods following existing patterns
3. Include all security test categories (CSRF, validation, etc.)
4. Update this documentation

### Test Template
```javascript
async testNewEndpoint() {
  this.log('\n🔧 Testing New Endpoint...', 'info');
  
  try {
    // Test implementation
    this.recordTest('Test description', success, errorMessage);
  } catch (error) {
    this.recordTest('Test description', false, error.message);
  }
}
```

## Integration with CI/CD

These security tests can be integrated into CI/CD pipelines:

```yaml
- name: Run Security Tests
  run: |
    vercel dev --listen 3002 &
    sleep 10
    node tests/security/test-api-endpoints-security.cjs
    kill %1
```

## Security Monitoring

Regular execution of these tests helps:
- Detect security regressions
- Validate new endpoint security
- Monitor rate limiting effectiveness
- Ensure consistent security standards
- Identify potential vulnerabilities early

For production monitoring, consider implementing:
- Automated security testing in CI/CD
- Regular penetration testing
- Security code reviews
- Dependency vulnerability scanning
- Runtime security monitoring