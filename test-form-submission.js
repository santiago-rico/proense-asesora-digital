// Test script for form submission with CSRF protection and sanitization

async function testFormSubmission() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Step 1: Get CSRF token
    console.log('1. Fetching CSRF token...');
    const tokenResponse = await fetch(`${baseUrl}/api/csrf-token`, {
      credentials: 'include'
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to get CSRF token: ${tokenResponse.status}`);
    }
    
    const { token } = await tokenResponse.json();
    console.log('✓ CSRF token received:', token);
    
    // Get the cookie from the response
    const setCookie = tokenResponse.headers.get('set-cookie');
    console.log('✓ Cookie set:', setCookie ? 'Yes' : 'No');
    
    // Step 2: Submit form with CSRF token and test data including XSS attempts
    console.log('\n2. Submitting form with test data (including XSS attempts)...');
    const formData = {
      nombre: 'Test User <script>alert("XSS")</script>',
      email: 'test@example.com',
      telefono: '+573001234567',
      tipoSeguro: 'vida',
      mensaje: 'Test message with <img src=x onerror=alert("XSS")> and <b>bold</b> text',
      website: '' // Honeypot field should be empty
    };
    
    const submitResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: JSON.stringify(formData),
      credentials: 'include'
    });
    
    const result = await submitResponse.text();
    console.log(`✓ Response status: ${submitResponse.status}`);
    console.log(`✓ Response body: ${result}`);
    
    // Step 3: Test honeypot protection
    console.log('\n3. Testing honeypot protection...');
    const honeypotData = { ...formData, website: 'http://spam.com' };
    
    const honeypotResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
        'Cookie': setCookie || ''
      },
      body: JSON.stringify(honeypotData),
      credentials: 'include'
    });
    
    console.log(`✓ Honeypot test status: ${honeypotResponse.status} (should be 200 with success message)`);
    
    // Step 4: Test CSRF protection
    console.log('\n4. Testing CSRF protection (invalid token)...');
    const csrfTestResponse = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'invalid-token',
        'Cookie': setCookie || ''
      },
      body: JSON.stringify(formData),
      credentials: 'include'
    });
    
    console.log(`✓ CSRF test status: ${csrfTestResponse.status} (should be 403)`);
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFormSubmission();
