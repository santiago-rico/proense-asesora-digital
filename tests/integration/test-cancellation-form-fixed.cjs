const fetch = require('node-fetch');

async function testCancellationForm() {
  const baseUrl = 'http://localhost:8080';
  
  console.log('🔧 Testing Fixed CancellationForm\n');
  
  try {
    // Step 1: Get CSRF token
    console.log('1. Fetching CSRF token...');
    const tokenResponse = await fetch(`${baseUrl}/api/csrf-token`, {
      credentials: 'include'
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`CSRF token fetch failed: ${tokenResponse.status}`);
    }
    
    const { token } = await tokenResponse.json();
    const cookies = tokenResponse.headers.get('set-cookie');
    console.log('✅ CSRF token received');
    
    // Step 2: Test valid form submission
    console.log('\n2. Testing form submission...');
    const formData = new FormData();
    formData.append('nombreCompleto', 'Juan Pérez');
    formData.append('numeroCedula', '12345678');
    formData.append('email', 'juan@example.com');
    formData.append('telefono', '+573001234567');
    formData.append('tipoSeguro', 'auto');
    formData.append('nombreAseguradora', 'Seguros ABC');
    formData.append('numeroPoliza', 'POL-123456');
    formData.append('cancellationReason', 'Cambio de proveedor de seguros');
    formData.append('aceptaTerminosYPolitica', 'true');
    formData.append('website', ''); // Honeypot field
    
    const submitResponse = await fetch(`${baseUrl}/api/send-cancellation-request`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token,
        'Cookie': cookies || ''
      },
      body: formData,
      credentials: 'include'
    });
    
    const result = await submitResponse.json();
    
    if (submitResponse.ok) {
      console.log('✅ Form submission successful!');
      console.log('Response:', result);
    } else {
      console.log(`❌ Form submission failed: ${submitResponse.status}`);
      console.log('Error:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCancellationForm();