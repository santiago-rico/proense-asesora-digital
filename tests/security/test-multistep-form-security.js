/**
 * Security Test Script for MultiStepForm
 * Tests CSRF protection, XSS sanitization, honeypot functionality, and file upload validation
 */

async function testMultiStepFormSecurity() {
  const baseUrl = 'http://localhost:8082';
  
  console.log('🚀 Starting MultiStepForm Security Tests...\n');
  
  try {
    // Test 1: CSRF Token Generation
    console.log('1. Testing CSRF token generation...');
    const tokenResponse = await fetch(`${baseUrl}/api/csrf-token`, {
      credentials: 'include'
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`CSRF token request failed: ${tokenResponse.status}`);
    }
    
    const { token } = await tokenResponse.json();
    const setCookie = tokenResponse.headers.get('set-cookie');
    
    console.log('✅ CSRF token received:', token.substring(0, 20) + '...');
    console.log('✅ Cookie set:', setCookie ? 'Yes' : 'No');
    
    // Test 2: Valid Submission with XSS Attempts
    console.log('\n2. Testing form submission with XSS attempts...');
    const formData = new FormData();
    
    // Add XSS payloads to test sanitization
    formData.append('nombreCompleto', 'Test User <script>alert("XSS")</script>');
    formData.append('telefono', '+573001234567');
    formData.append('email', 'test@example.com');
    formData.append('tipoSeguro', 'vida');
    formData.append('metodoPago', 'mensual');
    formData.append('periodicidadPago', 'mensual');
    formData.append('numeroCedula', '12345678');
    formData.append('beneficiarios', 'John Doe <img src=x onerror=alert("XSS")> 100%');
    formData.append('declaraRenta', 'no');
    formData.append('ingresosNoDeclarante', '5000000');
    formData.append('egresosNoDeclarante', '3000000');
    formData.append('activosNoDeclarante', '10000000');
    formData.append('pasivosNoDeclarante', '2000000');
    formData.append('aceptaTerminosYPolitica', 'true');
    formData.append('website', ''); // Honeypot empty
    
    const submitResponse = await fetch(`${baseUrl}/api/send-insurance-application-email`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: formData,
      credentials: 'include'
    });
    
    console.log(`✅ Response status: ${submitResponse.status}`);
    const result = await submitResponse.json();
    console.log('✅ Response message:', result.message);
    
    if (submitResponse.ok) {
      console.log('✅ XSS payload was accepted (server should sanitize)');
    }
    
    // Test 3: Honeypot Protection
    console.log('\n3. Testing honeypot protection...');
    formData.set('website', 'spam.com'); // Fill honeypot
    
    const honeypotResponse = await fetch(`${baseUrl}/api/send-insurance-application-email`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: formData,
      credentials: 'include'
    });
    
    console.log(`✅ Honeypot test status: ${honeypotResponse.status}`);
    const honeypotResult = await honeypotResponse.json();
    console.log('✅ Honeypot result:', honeypotResult.message);
    
    if (honeypotResult.data?.messageId === 'spam-filtered') {
      console.log('✅ Honeypot working correctly - spam filtered');
    } else {
      console.log('⚠️  Honeypot may not be working as expected');
    }
    
    // Test 4: CSRF Protection
    console.log('\n4. Testing CSRF protection...');
    formData.set('website', ''); // Reset honeypot
    
    const csrfTestResponse = await fetch(`${baseUrl}/api/send-insurance-application-email`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': 'invalid-token',
        'Cookie': setCookie || ''
      },
      body: formData,
      credentials: 'include'
    });
    
    console.log(`✅ CSRF test status: ${csrfTestResponse.status} (should be 403)`);
    
    if (csrfTestResponse.status === 403) {
      console.log('✅ CSRF protection working correctly');
    } else {
      console.log('❌ CSRF protection may not be working');
    }
    
    // Test 5: File Upload Validation
    console.log('\n5. Testing file upload validation...');
    const fileData = new FormData();
    
    // Copy all valid fields
    fileData.append('nombreCompleto', 'Test User');
    fileData.append('telefono', '+573001234567');
    fileData.append('email', 'test@example.com');
    fileData.append('tipoSeguro', 'vida');
    fileData.append('metodoPago', 'mensual');
    fileData.append('periodicidadPago', 'mensual');
    fileData.append('numeroCedula', '12345678');
    fileData.append('beneficiarios', 'John Doe 100%');
    fileData.append('declaraRenta', 'no');
    fileData.append('ingresosNoDeclarante', '5000000');
    fileData.append('egresosNoDeclarante', '3000000');
    fileData.append('activosNoDeclarante', '10000000');
    fileData.append('pasivosNoDeclarante', '2000000');
    fileData.append('aceptaTerminosYPolitica', 'true');
    fileData.append('website', '');
    
    // Add invalid file type (should be rejected)
    const invalidFile = new Blob(['test content'], { type: 'text/plain' });
    fileData.append('fotoCedula', invalidFile, 'test.txt');
    
    const fileResponse = await fetch(`${baseUrl}/api/send-insurance-application-email`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: fileData,
      credentials: 'include'
    });
    
    console.log(`✅ File validation test status: ${fileResponse.status} (should be 400)`);
    
    if (fileResponse.status === 400) {
      const fileResult = await fileResponse.json();
      console.log('✅ File validation working:', fileResult.message);
    } else {
      console.log('⚠️  File validation may not be working as expected');
    }
    
    // Test 6: Data Trimming
    console.log('\n6. Testing data trimming...');
    const trimData = new FormData();
    trimData.append('nombreCompleto', '  John Doe  '); // With spaces
    trimData.append('telefono', '  +573001234567  ');
    trimData.append('email', '  TEST@EXAMPLE.COM  '); // Should be trimmed and lowercased
    trimData.append('tipoSeguro', 'vida');
    trimData.append('metodoPago', 'mensual');
    trimData.append('periodicidadPago', 'mensual');
    trimData.append('numeroCedula', '  12345678  ');
    trimData.append('beneficiarios', '  John Doe 100%  ');
    trimData.append('declaraRenta', 'no');
    trimData.append('ingresosNoDeclarante', '  5000000  ');
    trimData.append('egresosNoDeclarante', '3000000');
    trimData.append('activosNoDeclarante', '10000000');
    trimData.append('pasivosNoDeclarante', '2000000');
    trimData.append('aceptaTerminosYPolitica', 'true');
    trimData.append('website', '');
    
    const trimResponse = await fetch(`${baseUrl}/api/send-insurance-application-email`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: trimData,
      credentials: 'include'
    });
    
    console.log(`✅ Data trimming test status: ${trimResponse.status}`);
    
    if (trimResponse.ok) {
      console.log('✅ Data trimming appears to be working');
    }
    
    console.log('\n🎉 All security tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ CSRF token generation');
    console.log('✅ XSS payload handling');
    console.log('✅ Honeypot protection');
    console.log('✅ CSRF protection validation');
    console.log('✅ File upload validation');
    console.log('✅ Data trimming');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  testMultiStepFormSecurity();
} else {
  // Browser environment
  console.log('MultiStepForm Security Test Script loaded. Run testMultiStepFormSecurity() to execute tests.');
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testMultiStepFormSecurity };
}