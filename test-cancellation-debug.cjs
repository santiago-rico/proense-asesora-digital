const http = require('http');

async function testCancellationForm() {
  console.log('🔍 Testing CancellationForm with Debug Info\n');
  
  try {
    // Step 1: Get CSRF token
    console.log('1. Fetching CSRF token...');
    const tokenData = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:8080/api/csrf-token', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            const cookies = res.headers['set-cookie'];
            resolve({ token: JSON.parse(data).token, cookies });
          } else {
            reject(new Error(`CSRF token fetch failed: ${res.statusCode}`));
          }
        });
      });
      req.on('error', reject);
    });
    
    console.log('✅ CSRF token received:', tokenData.token.substring(0, 20) + '...');
    
    // Step 2: Create form data
    const boundary = '----FormBoundary' + Math.random().toString(36);
    const formData = [
      `------${boundary}`,
      'Content-Disposition: form-data; name="nombreCompleto"',
      '',
      'Juan Pérez Test',
      `------${boundary}`,
      'Content-Disposition: form-data; name="numeroCedula"',
      '',
      '12345678',
      `------${boundary}`,
      'Content-Disposition: form-data; name="email"',
      '',
      'juan@example.com',
      `------${boundary}`,
      'Content-Disposition: form-data; name="telefono"',
      '',
      '+57 300 123 4567',
      `------${boundary}`,
      'Content-Disposition: form-data; name="tipoSeguro"',
      '',
      'auto',
      `------${boundary}`,
      'Content-Disposition: form-data; name="nombreAseguradora"',
      '',
      'Seguros ABC',
      `------${boundary}`,
      'Content-Disposition: form-data; name="numeroPoliza"',
      '',
      'POL-123456',
      `------${boundary}`,
      'Content-Disposition: form-data; name="cancellationReason"',
      '',
      'Cambio de proveedor de seguros por mejores condiciones',
      `------${boundary}`,
      'Content-Disposition: form-data; name="aceptaTerminosYPolitica"',
      '',
      'true',
      `------${boundary}`,
      'Content-Disposition: form-data; name="website"',
      '',
      '',
      `------${boundary}--`
    ].join('\r\n');
    
    // Step 3: Send form submission
    console.log('\n2. Sending form submission...');
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/send-cancellation-request',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(formData),
          'X-CSRF-Token': tokenData.token,
          'Cookie': tokenData.cookies ? tokenData.cookies.join('; ') : ''
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        });
      });
      
      req.on('error', reject);
      req.write(formData);
      req.end();
    });
    
    console.log('Response status:', result.status);
    console.log('Response data:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 200) {
      console.log('\n✅ Form submission successful!');
    } else {
      console.log(`\n❌ Form submission failed with status ${result.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCancellationForm();