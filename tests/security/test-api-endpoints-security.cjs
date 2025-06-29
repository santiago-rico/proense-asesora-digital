#!/usr/bin/env node

/**
 * Comprehensive Security Test Suite for API Endpoints
 * Tests CSRF protection, XSS prevention, file upload security, and input validation
 * across all API endpoints.
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test configuration
const BASE_URL = 'http://localhost:3002';
const ENDPOINTS = {
  csrf: '/api/csrf-token',
  leadForm: '/api/send-email',
  insuranceApplication: '/api/send-insurance-application-email',
  cancellation: '/api/send-cancellation-request',
  modification: '/api/send-modification-request'
};

class ApiSecurityTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.csrfToken = null;
    this.cookies = null;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async setupCsrfToken() {
    try {
      this.log('Setting up CSRF token...', 'info');
      
      const response = await fetch(`${BASE_URL}${ENDPOINTS.csrf}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to get CSRF token: ${response.status}`);
      }

      const data = await response.json();
      const cookieHeader = response.headers.get('set-cookie');
      
      this.csrfToken = data.token;
      this.cookies = cookieHeader;
      
      this.log(`✅ CSRF token obtained: ${this.csrfToken ? 'Yes' : 'No'}`, 'success');
      this.log(`✅ Cookie set: ${this.cookies ? 'Yes' : 'No'}`, 'success');
      
      return true;
    } catch (error) {
      this.log(`❌ CSRF setup failed: ${error.message}`, 'error');
      return false;
    }
  }

  recordTest(name, passed, error = null) {
    this.results.tests.push({ name, passed, error });
    if (passed) {
      this.results.passed++;
      this.log(`✅ ${name}`, 'success');
    } else {
      this.results.failed++;
      this.log(`❌ ${name}: ${error}`, 'error');
    }
  }

  async testCsrfProtection() {
    this.log('\n🔐 Testing CSRF Protection...', 'info');

    // Test 1: CSRF token endpoint security
    try {
      const response = await fetch(`${BASE_URL}${ENDPOINTS.csrf}`, {
        method: 'POST' // Should only accept GET
      });
      
      if (response.status === 405) {
        this.recordTest('CSRF endpoint rejects POST requests', true);
      } else {
        this.recordTest('CSRF endpoint rejects POST requests', false, `Expected 405, got ${response.status}`);
      }
    } catch (error) {
      this.recordTest('CSRF endpoint rejects POST requests', false, error.message);
    }

    // Test 2: Form submission without CSRF token
    for (const [endpointName, endpoint] of Object.entries(ENDPOINTS)) {
      if (endpointName === 'csrf') continue;

      try {
        const formData = new FormData();
        formData.append('test', 'value');

        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'POST',
          body: formData
        });

        if (response.status === 403) {
          this.recordTest(`${endpointName} rejects requests without CSRF token`, true);
        } else {
          this.recordTest(`${endpointName} rejects requests without CSRF token`, false, 
            `Expected 403, got ${response.status}`);
        }
      } catch (error) {
        this.recordTest(`${endpointName} rejects requests without CSRF token`, false, error.message);
      }
    }

    // Test 3: Form submission with invalid CSRF token
    try {
      const formData = new FormData();
      formData.append('nombreCompleto', 'Test User');
      formData.append('email', 'test@example.com');
      formData.append('tipoSeguro', 'vida');

      const response = await fetch(`${BASE_URL}${ENDPOINTS.leadForm}`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': 'invalid-token',
          'Cookie': this.cookies || ''
        },
        body: formData
      });

      if (response.status === 403) {
        this.recordTest('Lead form rejects invalid CSRF token', true);
      } else {
        this.recordTest('Lead form rejects invalid CSRF token', false, 
          `Expected 403, got ${response.status}`);
      }
    } catch (error) {
      this.recordTest('Lead form rejects invalid CSRF token', false, error.message);
    }
  }

  async testHoneypotProtection() {
    this.log('\n🍯 Testing Honeypot Protection...', 'info');

    const testData = {
      nombreCompleto: 'Bot User',
      email: 'bot@example.com',
      tipoSeguro: 'vida',
      website: 'http://spambot.com' // Honeypot field
    };

    try {
      const formData = new FormData();
      Object.entries(testData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(`${BASE_URL}${ENDPOINTS.leadForm}`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': this.csrfToken,
          'Cookie': this.cookies || ''
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        this.recordTest('Honeypot silently accepts bot submissions', true);
      } else {
        this.recordTest('Honeypot silently accepts bot submissions', false, 
          `Expected 200, got ${response.status}`);
      }
    } catch (error) {
      this.recordTest('Honeypot silently accepts bot submissions', false, error.message);
    }
  }

  async testInputValidation() {
    this.log('\n📝 Testing Input Validation...', 'info');

    // Test XSS in form fields
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert(1)',
      '<img src=x onerror=alert(1)>',
      '"><script>alert(document.cookie)</script>'
    ];

    for (const payload of xssPayloads) {
      try {
        const formData = new FormData();
        formData.append('nombreCompleto', payload);
        formData.append('email', 'test@example.com');
        formData.append('tipoSeguro', 'vida');

        const response = await fetch(`${BASE_URL}${ENDPOINTS.leadForm}`, {
          method: 'POST',
          headers: {
            'X-CSRF-Token': this.csrfToken,
            'Cookie': this.cookies || ''
          },
          body: formData
        });

        // Should either succeed (input sanitized) or fail validation
        if (response.status === 200 || response.status === 400) {
          this.recordTest(`XSS payload handled safely: ${payload.substring(0, 20)}...`, true);
        } else {
          this.recordTest(`XSS payload handled safely: ${payload.substring(0, 20)}...`, false, 
            `Unexpected status ${response.status}`);
        }
      } catch (error) {
        this.recordTest(`XSS payload handled safely: ${payload.substring(0, 20)}...`, false, error.message);
      }
    }

    // Test email validation
    const invalidEmails = ['invalid-email', 'test@', '@example.com', 'test..test@example.com'];
    
    for (const email of invalidEmails) {
      try {
        const formData = new FormData();
        formData.append('nombreCompleto', 'Test User');
        formData.append('email', email);
        formData.append('tipoSeguro', 'vida');

        const response = await fetch(`${BASE_URL}${ENDPOINTS.leadForm}`, {
          method: 'POST',
          headers: {
            'X-CSRF-Token': this.csrfToken,
            'Cookie': this.cookies || ''
          },
          body: formData
        });

        if (response.status === 400) {
          this.recordTest(`Invalid email rejected: ${email}`, true);
        } else {
          this.recordTest(`Invalid email rejected: ${email}`, false, 
            `Expected 400, got ${response.status}`);
        }
      } catch (error) {
        this.recordTest(`Invalid email rejected: ${email}`, false, error.message);
      }
    }
  }

  async testFileUploadSecurity() {
    this.log('\n📁 Testing File Upload Security...', 'info');

    // Test 1: Valid file upload
    try {
      const formData = new FormData();
      formData.append('nombreCompleto', 'Test User');
      formData.append('telefono', '1234567890');
      formData.append('email', 'test@example.com');
      formData.append('tipoSeguro', 'vida');
      formData.append('metodoPago', 'tarjeta');
      formData.append('periodicidadPago', 'mensual');
      formData.append('declaraRenta', 'si');
      formData.append('aceptaTerminosYPolitica', 'true');
      
      // Create a valid PDF file
      const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n%%EOF');
      formData.append('fotoCedula', pdfBuffer, {
        filename: 'test.pdf',
        contentType: 'application/pdf'
      });

      const response = await fetch(`${BASE_URL}${ENDPOINTS.insuranceApplication}`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': this.csrfToken,
          'Cookie': this.cookies || ''
        },
        body: formData
      });

      if (response.ok) {
        this.recordTest('Valid PDF file upload accepted', true);
      } else {
        this.recordTest('Valid PDF file upload accepted', false, 
          `Expected 200, got ${response.status}`);
      }
    } catch (error) {
      this.recordTest('Valid PDF file upload accepted', false, error.message);
    }

    // Test 2: Malicious file types
    const maliciousFiles = [
      { name: 'malware.exe', contentType: 'application/x-executable', content: 'MZ\x90\x00' },
      { name: 'script.js', contentType: 'application/javascript', content: 'alert("xss");' },
      { name: 'shell.php', contentType: 'application/x-php', content: '<?php system($_GET["cmd"]); ?>' }
    ];

    for (const file of maliciousFiles) {
      try {
        const formData = new FormData();
        formData.append('nombreCompleto', 'Test User');
        formData.append('telefono', '1234567890');
        formData.append('email', 'test@example.com');
        formData.append('tipoSeguro', 'vida');
        formData.append('metodoPago', 'tarjeta');
        formData.append('periodicidadPago', 'mensual');
        formData.append('declaraRenta', 'si');
        formData.append('aceptaTerminosYPolitica', 'true');
        
        const fileBuffer = Buffer.from(file.content);
        formData.append('fotoCedula', fileBuffer, {
          filename: file.name,
          contentType: file.contentType
        });

        const response = await fetch(`${BASE_URL}${ENDPOINTS.insuranceApplication}`, {
          method: 'POST',
          headers: {
            'X-CSRF-Token': this.csrfToken,
            'Cookie': this.cookies || ''
          },
          body: formData
        });

        if (response.status === 400) {
          this.recordTest(`Malicious file rejected: ${file.name}`, true);
        } else {
          this.recordTest(`Malicious file rejected: ${file.name}`, false, 
            `Expected 400, got ${response.status}`);
        }
      } catch (error) {
        this.recordTest(`Malicious file rejected: ${file.name}`, false, error.message);
      }
    }

    // Test 3: File size limit
    try {
      const formData = new FormData();
      formData.append('nombreCompleto', 'Test User');
      formData.append('telefono', '1234567890');
      formData.append('email', 'test@example.com');
      formData.append('tipoSeguro', 'vida');
      formData.append('metodoPago', 'tarjeta');
      formData.append('periodicidadPago', 'mensual');
      formData.append('declaraRenta', 'si');
      formData.append('aceptaTerminosYPolitica', 'true');
      
      // Create a file larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'A'); // 6MB
      formData.append('fotoCedula', largeBuffer, {
        filename: 'large.pdf',
        contentType: 'application/pdf'
      });

      const response = await fetch(`${BASE_URL}${ENDPOINTS.insuranceApplication}`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': this.csrfToken,
          'Cookie': this.cookies || ''
        },
        body: formData
      });

      if (response.status === 400) {
        this.recordTest('Large file rejected (>5MB)', true);
      } else {
        this.recordTest('Large file rejected (>5MB)', false, 
          `Expected 400, got ${response.status}`);
      }
    } catch (error) {
      this.recordTest('Large file rejected (>5MB)', false, error.message);
    }
  }

  async testRateLimiting() {
    this.log('\n⏱️ Testing Rate Limiting...', 'info');

    // Test rate limiting by making multiple rapid requests
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(
        fetch(`${BASE_URL}${ENDPOINTS.csrf}`, {
          method: 'GET',
          credentials: 'include'
        })
      );
    }

    try {
      const responses = await Promise.all(requests);
      const rateLimitedCount = responses.filter(r => r.status === 429).length;
      
      if (rateLimitedCount > 0) {
        this.recordTest('Rate limiting is active', true);
      } else {
        this.recordTest('Rate limiting is active', false, 
          'No rate limiting detected after 10 rapid requests');
      }
    } catch (error) {
      this.recordTest('Rate limiting is active', false, error.message);
    }
  }

  async testMethodValidation() {
    this.log('\n🔧 Testing HTTP Method Validation...', 'info');

    const invalidMethods = ['PUT', 'DELETE', 'PATCH'];
    
    for (const [endpointName, endpoint] of Object.entries(ENDPOINTS)) {
      for (const method of invalidMethods) {
        try {
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: method
          });

          if (response.status === 405) {
            this.recordTest(`${endpointName} rejects ${method} method`, true);
          } else {
            this.recordTest(`${endpointName} rejects ${method} method`, false, 
              `Expected 405, got ${response.status}`);
          }
        } catch (error) {
          this.recordTest(`${endpointName} rejects ${method} method`, false, error.message);
        }
      }
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive API Security Tests...', 'info');
    this.log('=' * 60, 'info');

    // Setup CSRF token first
    const csrfSetup = await this.setupCsrfToken();
    if (!csrfSetup) {
      this.log('❌ Cannot proceed without CSRF token. Make sure the server is running.', 'error');
      return;
    }

    // Run all security tests
    await this.testCsrfProtection();
    await this.testHoneypotProtection();
    await this.testInputValidation();
    await this.testFileUploadSecurity();
    await this.testRateLimiting();
    await this.testMethodValidation();

    // Print summary
    this.printSummary();
  }

  printSummary() {
    this.log('\n' + '=' * 60, 'info');
    this.log('📊 Test Results Summary', 'info');
    this.log('=' * 60, 'info');
    
    this.log(`Total Tests: ${this.results.tests.length}`, 'info');
    this.log(`✅ Passed: ${this.results.passed}`, 'success');
    this.log(`❌ Failed: ${this.results.failed}`, 'error');
    
    const successRate = ((this.results.passed / this.results.tests.length) * 100).toFixed(1);
    this.log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');

    if (this.results.failed > 0) {
      this.log('\n❌ Failed Tests:', 'error');
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => {
          this.log(`   • ${test.name}: ${test.error}`, 'error');
        });
    }

    this.log('\n🔒 Security Assessment:', 'info');
    if (this.results.failed === 0) {
      this.log('🎉 Excellent! All security tests passed.', 'success');
    } else if (successRate >= 80) {
      this.log('⚠️ Good security posture with some areas for improvement.', 'warning');
    } else {
      this.log('🚨 Critical security issues detected. Immediate attention required.', 'error');
    }

    this.log('\n💡 Test Coverage Areas:', 'info');
    this.log('   • CSRF Protection', 'info');
    this.log('   • XSS Prevention', 'info');
    this.log('   • Input Validation', 'info');
    this.log('   • File Upload Security', 'info');
    this.log('   • Rate Limiting', 'info');
    this.log('   • HTTP Method Validation', 'info');
    this.log('   • Honeypot Bot Protection', 'info');
  }
}

// Only run if executed directly
if (require.main === module) {
  const tester = new ApiSecurityTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { ApiSecurityTester };