# CancellationForm Security Test Script Documentation

## Overview

The `test-cancellation-form-security.cjs` script is a comprehensive security testing tool designed to validate all security features implemented in the CancellationForm component. It tests the security mechanisms against common attack vectors and ensures proper implementation of defensive measures.

## What It Tests

### 🔐 CSRF Protection
- **Token Generation**: Validates that CSRF tokens are properly generated and returned
- **Token Validation**: Ensures invalid tokens are rejected with 403 status
- **Cookie Management**: Verifies CSRF secrets are stored in httpOnly cookies
- **Missing Token Protection**: Confirms requests without tokens are blocked

### 🛡️ XSS Prevention
- **Input Sanitization**: Tests server-side sanitization of malicious scripts
- **HTML Tag Filtering**: Validates removal/neutralization of dangerous HTML
- **JavaScript Injection**: Tests protection against script injection attempts
- **Attribute-based XSS**: Checks for attribute-based attack prevention

### 🤖 Bot Protection
- **Honeypot Field Detection**: Tests that filled honeypot fields trigger spam filtering
- **Silent Filtering**: Validates that bot submissions return success but are not processed
- **Field Visibility**: Ensures honeypot fields remain hidden from legitimate users

### ✅ Server-side Validation
- **Required Fields**: Tests rejection of empty required fields
- **Field Length Limits**: Validates minimum and maximum length constraints
- **Format Validation**: Tests email, phone number, and other format validations
- **Conditional Logic**: Tests conditional field requirements (e.g., "otro" insurance type)
- **Type Validation**: Ensures proper data type validation

### 🌐 Edge Cases
- **Unicode Characters**: Tests handling of international characters and symbols
- **Special Characters**: Validates processing of special characters and accents
- **HTTP Method Restrictions**: Ensures only POST requests are accepted
- **Large Payload Handling**: Tests behavior with oversized input data

## Prerequisites

Before running the security tests, ensure:

1. **Development Server Running**
   ```bash
   npm run dev
   ```
   Server should be accessible at `http://localhost:8080`

2. **Dependencies Installed**
   All required security dependencies should be installed:
   - `csrf` - CSRF token generation and validation
   - `dompurify` - XSS sanitization
   - `jsdom` - DOM environment for server-side sanitization
   - `zod` - Schema validation
   - `cookie` - Cookie parsing and serialization

3. **Security Implementation Complete**
   The following components should be implemented:
   - CSRF token endpoint (`/api/csrf-token`)
   - Secure cancellation endpoint (`/api/send-cancellation-request`)
   - CancellationForm component with security features
   - Server-side validation and sanitization

## How to Run

### Command Line Execution
```bash
# Navigate to project root
cd /path/to/proense-asesora-digital

# Run the security test
node test-cancellation-form-security.cjs
```

### Expected Output

#### Successful Test Result
```
🔒 Testing CancellationForm Security Implementation
============================================================
Base URL: http://localhost:8080
Test timestamp: 2025-06-29T00:00:00.000Z

📋 PREREQUISITES:
• Development server running on port 8080 (npm run dev)
• CancellationForm component implemented with security features
• API endpoints configured and accessible

1️⃣  Testing CSRF Token Generation
----------------------------------------
✅ CSRF token endpoint accessible
✅ CSRF cookie set correctly
✅ CSRF token format valid

2️⃣  Testing Form Submission with XSS Sanitization
----------------------------------------
✅ Form submission with XSS content accepted

[... more test results ...]

============================================================
🎯 SECURITY TEST SUMMARY
============================================================
Total Tests Run: 15
Tests Passed: 15 ✅
Tests Failed: 0 ❌
Success Rate: 100.0%

🎉 ALL SECURITY TESTS PASSED!
The CancellationForm implementation appears to be secure.
```

#### Failed Test Result
```
🔒 Testing CancellationForm Security Implementation
============================================================
[... test output ...]

============================================================
🎯 SECURITY TEST SUMMARY
============================================================
Total Tests Run: 15
Tests Passed: 12 ✅
Tests Failed: 3 ❌
Success Rate: 80.0%

⚠️  3 TESTS FAILED
Please review the failed tests and fix the security issues.
```

## Test Scenarios

### 1. CSRF Token Generation
- **Purpose**: Validate CSRF protection infrastructure
- **Tests**: Token endpoint accessibility, cookie setting, token format
- **Expected**: 200 status, valid token, httpOnly cookie set

### 2. XSS Sanitization
- **Purpose**: Test server-side input sanitization
- **Payloads**: `<script>alert("XSS")</script>`, `<img src=x onerror=alert("XSS")>`
- **Expected**: 200 status (sanitized input processed), no XSS execution

### 3. Honeypot Protection
- **Purpose**: Validate bot detection and filtering
- **Test**: Submit with filled `website` field
- **Expected**: 200 status with `spam-filtered` response

### 4. CSRF Validation
- **Purpose**: Ensure invalid tokens are rejected
- **Tests**: Invalid token, missing token
- **Expected**: 403 status with security error message

### 5. Server-side Validation
- **Purpose**: Test input validation and error handling
- **Payloads**: Too short/long fields, invalid formats, missing required fields
- **Expected**: 400 status with validation error details

### 6. Conditional Validation
- **Purpose**: Test conditional field requirements
- **Scenario**: Select "otro" insurance type without specifying details
- **Expected**: 400 status requiring `otroSeguro` field

### 7. HTTP Method Restrictions
- **Purpose**: Ensure endpoint only accepts POST requests
- **Tests**: GET, PUT requests to cancellation endpoint
- **Expected**: 405 Method Not Allowed

### 8. Unicode Handling
- **Purpose**: Test international character support
- **Payloads**: Names with accents, special characters, Unicode symbols
- **Expected**: 200 status (proper character encoding)

## Troubleshooting

### Common Issues

#### Connection Refused
```
Error: connect ECONNREFUSED ::1:8080
```
**Solution**: Start the development server with `npm run dev`

#### CSRF Token Errors
```
❌ CSRF token generation
   Error: Invalid JSON response
```
**Possible Causes**:
- Development server not running
- CSRF endpoint not implemented
- Network connectivity issues

#### Validation Failures
```
❌ Server-side validation rejects invalid data
   Status: 200 (expected 400)
```
**Possible Causes**:
- Server-side validation not implemented
- Zod schema not properly configured
- Error handling not returning correct status codes

#### Honeypot Not Working
```
❌ Honeypot protection working
   Bot submission NOT filtered
```
**Possible Causes**:
- Honeypot field logic not implemented
- `website` field not being checked
- Spam filtering logic missing

## Security Implementation Checklist

Use this checklist to ensure all security features are properly implemented:

### Backend Security (API Endpoints)
- [ ] CSRF token generation endpoint (`/api/csrf-token`)
- [ ] CSRF token validation in form submission endpoint
- [ ] Server-side input sanitization using DOMPurify
- [ ] Honeypot field detection and filtering
- [ ] Comprehensive Zod validation schema
- [ ] Proper error handling and status codes
- [ ] Input trimming and normalization
- [ ] File upload security (if applicable)

### Frontend Security (React Component)
- [ ] CSRF token fetching and inclusion in requests
- [ ] Honeypot field implementation (hidden from users)
- [ ] Proper autocomplete attributes for accessibility
- [ ] Error handling for security failures
- [ ] Loading states for CSRF token fetching
- [ ] Graceful degradation when security features fail

### General Security
- [ ] HTTPS enforcement in production
- [ ] Secure cookie configuration
- [ ] Content Security Policy headers
- [ ] Rate limiting (recommended)
- [ ] Security monitoring and logging

## Maintenance and Updates

### Regular Testing
- Run security tests after any form-related changes
- Include tests in CI/CD pipeline
- Monitor for new attack vectors and update tests accordingly

### Security Monitoring
- Monitor server logs for blocked CSRF attempts
- Track honeypot submissions to identify bot activity
- Review error rates and form submission patterns

### Updates and Patches
- Keep security dependencies updated
- Review and update validation rules as needed
- Test new browser features and compatibility

## Related Files

- `src/components/forms/cancelacion/CancellationForm.tsx` - Main form component
- `api/send-cancellation-request.ts` - Form submission API endpoint
- `api/csrf-token.ts` - CSRF token generation endpoint
- `src/hooks/use-csrf.ts` - CSRF token management hook
- `tasks_CancellationForm_SecurityImplementation.md` - Implementation plan

## Support

If you encounter issues with the security tests:

1. Verify all prerequisites are met
2. Check the implementation plan for missing features
3. Review the specific test failure messages
4. Ensure the development server is properly configured
5. Validate that all required dependencies are installed

For questions about specific security implementations, refer to the implementation plan document or the existing security patterns in other form components.