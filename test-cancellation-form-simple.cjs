#!/usr/bin/env node

/**
 * Simple Security Test for CancellationForm Implementation
 * 
 * This script tests the basic functionality of the API endpoint
 * with proper multipart/form-data encoding.
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Simple fetch implementation
async function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const response = {
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: {
            get: (name) => res.headers[name.toLowerCase()]
          },
          json: async () => {
            try {
              return JSON.parse(data);
            } catch (e) {
              throw new Error('Invalid JSON response');
            }
          }
        };
        resolve(response);
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCancellationForm() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🔒 Simple CancellationForm Security Test');
  console.log('=' .repeat(50));
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('');

  let testsRun = 0;
  let testsPassed = 0;

  function logTest(testName, passed, details = '') {
    testsRun++;
    if (passed) {
      testsPassed++;
      console.log(`✅ ${testName}`);
    } else {
      console.log(`❌ ${testName}`);
    }
    if (details) console.log(`   ${details}`);
  }

  try {
    // Test 1: Get CSRF Token
    console.log('1️⃣  Getting CSRF Token');
    console.log('-'.repeat(30));
    
    const tokenResponse = await fetch(`${baseUrl}/api/csrf-token`);
    
    logTest('CSRF token endpoint accessible', tokenResponse.ok, `Status: ${tokenResponse.status}`);
    
    if (!tokenResponse.ok) {
      console.log('\n❌ Cannot continue without CSRF token');
      return;
    }
    
    const tokenData = await tokenResponse.json();
    const csrfToken = tokenData.token;
    const csrfCookie = tokenResponse.headers.get('set-cookie');
    
    logTest('CSRF token received', !!csrfToken, `Token length: ${csrfToken?.length || 0}`);
    logTest('CSRF cookie set', !!csrfCookie, 'Set-Cookie header present');

    // Test 2: Valid form submission (multipart/form-data)
    console.log('\n2️⃣  Testing Valid Form Submission');
    console.log('-'.repeat(30));
    
    const boundary = `----formdata-${Date.now()}`;
    const formFields = {
      nombreCompleto: 'Juan Pérez',
      numeroCedula: '12345678',
      telefono: '+573001234567',
      email: 'juan@example.com',
      nombreAseguradora: 'Seguros ABC',
      numeroPoliza: 'POL123456',
      tipoSeguro: 'auto',
      cancellationReason: 'Cambio de proveedor',
      aceptaTerminosYPolitica: 'true',
      website: '' // Empty honeypot
    };

    let formData = '';
    for (const [key, value] of Object.entries(formFields)) {
      formData += `--${boundary}\r\n`;
      formData += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      formData += `${value}\r\n`;
    }
    formData += `--${boundary}--\r\n`;

    const submitResponse = await fetch(`${baseUrl}/api/send-cancellation-request`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-CSRF-Token': csrfToken,
        'Cookie': csrfCookie
      },
      body: formData
    });

    logTest('Valid form accepted', submitResponse.ok, `Status: ${submitResponse.status}`);

    // Test 3: Invalid CSRF token
    console.log('\n3️⃣  Testing CSRF Protection');
    console.log('-'.repeat(30));
    
    const csrfTestResponse = await fetch(`${baseUrl}/api/send-cancellation-request`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-CSRF-Token': 'invalid-token',
        'Cookie': csrfCookie
      },
      body: formData
    });

    logTest('Invalid CSRF token rejected', csrfTestResponse.status === 403, `Status: ${csrfTestResponse.status} (expected 403)`);

    // Test 4: Honeypot protection
    console.log('\n4️⃣  Testing Honeypot Protection');
    console.log('-'.repeat(30));
    
    const honeypotFields = { ...formFields, website: 'https://spam-bot.com' };
    let honeypotData = '';
    for (const [key, value] of Object.entries(honeypotFields)) {
      honeypotData += `--${boundary}\r\n`;
      honeypotData += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      honeypotData += `${value}\r\n`;
    }
    honeypotData += `--${boundary}--\r\n`;

    const honeypotResponse = await fetch(`${baseUrl}/api/send-cancellation-request`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-CSRF-Token': csrfToken,
        'Cookie': csrfCookie
      },
      body: honeypotData
    });

    if (honeypotResponse.ok) {
      const result = await honeypotResponse.json();
      const isFiltered = result.data?.messageId === 'spam-filtered';
      logTest('Honeypot protection active', isFiltered, isFiltered ? 'Spam filtered correctly' : 'Spam NOT filtered');
    } else {
      logTest('Honeypot test failed', false, `Status: ${honeypotResponse.status}`);
    }

    // Test 5: Invalid data validation
    console.log('\n5️⃣  Testing Data Validation');
    console.log('-'.repeat(30));
    
    const invalidFields = {
      nombreCompleto: 'A', // Too short
      numeroCedula: '123', // Too short
      telefono: '123', // Invalid
      email: 'invalid-email',
      nombreAseguradora: '',
      tipoSeguro: '',
      aceptaTerminosYPolitica: 'false',
      website: ''
    };

    let invalidData = '';
    for (const [key, value] of Object.entries(invalidFields)) {
      invalidData += `--${boundary}\r\n`;
      invalidData += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      invalidData += `${value}\r\n`;
    }
    invalidData += `--${boundary}--\r\n`;

    const validationResponse = await fetch(`${baseUrl}/api/send-cancellation-request`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-CSRF-Token': csrfToken,
        'Cookie': csrfCookie
      },
      body: invalidData
    });

    logTest('Invalid data rejected', validationResponse.status === 400, `Status: ${validationResponse.status} (expected 400)`);

    // Test 6: Method restrictions
    console.log('\n6️⃣  Testing HTTP Method Restrictions');
    console.log('-'.repeat(30));
    
    const getResponse = await fetch(`${baseUrl}/api/send-cancellation-request`, {
      method: 'GET'
    });
    
    logTest('GET method rejected', getResponse.status === 405, `Status: ${getResponse.status} (expected 405)`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎯 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testsRun}`);
    console.log(`Passed: ${testsPassed} ✅`);
    console.log(`Failed: ${testsRun - testsPassed} ❌`);
    console.log(`Success Rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%`);

    if (testsPassed === testsRun) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('✅ CSRF Protection Working');
      console.log('✅ Input Validation Working');
      console.log('✅ Honeypot Protection Working');
      console.log('✅ HTTP Method Restrictions Working');
    } else {
      console.log(`\n⚠️  ${testsRun - testsPassed} test(s) failed`);
    }

  } catch (error) {
    console.error('\n❌ Test execution error:', error.message);
    return 1;
  }

  return testsPassed === testsRun ? 0 : 1;
}

if (require.main === module) {
  testCancellationForm()
    .then(exitCode => {
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}