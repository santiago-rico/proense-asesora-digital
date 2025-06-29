const http = require('http');

async function testFormsBasic() {
  console.log('🧪 Testing Form Error Communication Improvements\n');
  console.log('⚠️  NOTE: This test requires the Vercel dev server to be running on port 3002\n');
  
  const tests = {
    cancellation: {
      name: 'CancellationForm',
      endpoint: '/api/send-cancellation-request',
      validData: {
        nombreCompleto: 'Juan Pérez Test',
        numeroCedula: '12345678', // Valid - 8 characters
        email: 'juan@example.com',
        telefono: '+57 300 123 4567',
        tipoSeguro: 'auto',
        nombreAseguradora: 'Seguros ABC',
        numeroPoliza: 'POL-123456',
        cancellationReason: 'Cambio de proveedor de seguros por mejores condiciones',
        aceptaTerminosYPolitica: 'true',
        website: '' // Honeypot
      },
      invalidData: {
        nombreCompleto: 'J', // Too short
        numeroCedula: '123', // Too short - less than 6 characters
        email: 'invalid-email', // Invalid email
        telefono: '123', // Invalid phone
        tipoSeguro: '', // Required
        nombreAseguradora: 'A', // Too short
        numeroPoliza: '',
        cancellationReason: 'Short', // Too short
        aceptaTerminosYPolitica: 'false', // Must be true
        website: ''
      }
    },
    modification: {
      name: 'ModificationForm',
      endpoint: '/api/send-modification-request',
      validData: {
        nombreCompleto: 'María García Test',
        numeroCedula: '87654321',
        telefono: '+57 310 987 6543',
        email: 'maria@example.com',
        nombreAseguradora: 'Seguros XYZ',
        numeroPoliza: 'POL-987654',
        tipoSeguro: 'vida',
        modificaciones: 'Necesito cambiar el beneficiario de mi póliza de seguro de vida',
        aceptaTerminosYPolitica: 'true',
        website: ''
      },
      invalidData: {
        nombreCompleto: '', // Required
        numeroCedula: '', // Required
        telefono: 'invalid', // Invalid format
        email: 'not-an-email', // Invalid email
        nombreAseguradora: '', // Required
        numeroPoliza: '',
        tipoSeguro: '', // Required
        modificaciones: '', // Required
        aceptaTerminosYPolitica: 'false', // Must be true
        website: ''
      }
    }
  };

  // Test function
  async function testForm(formName, endpoint, data, expectSuccess) {
    console.log(`\n📝 Testing ${formName} - ${expectSuccess ? 'Valid' : 'Invalid'} Data`);
    console.log('Endpoint:', endpoint);
    
    try {
      // Step 1: Get CSRF token
      const tokenData = await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3002/api/csrf-token', (res) => {
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
      
      // Step 2: Create form data
      const boundary = '----FormBoundary' + Math.random().toString(36);
      const formDataParts = [];
      
      for (const [key, value] of Object.entries(data)) {
        formDataParts.push(
          `------${boundary}`,
          `Content-Disposition: form-data; name="${key}"`,
          '',
          value
        );
      }
      formDataParts.push(`------${boundary}--`);
      const formData = formDataParts.join('\r\n');
      
      // Step 3: Submit form
      const result = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 3002,
          path: endpoint,
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
            resolve({ 
              status: res.statusCode, 
              data: data ? JSON.parse(data) : null 
            });
          });
        });
        
        req.on('error', reject);
        req.write(formData);
        req.end();
      });
      
      console.log('Response Status:', result.status);
      
      if (expectSuccess) {
        if (result.status === 200) {
          console.log('✅ Success: Form submitted successfully');
        } else {
          console.log('❌ Failed: Expected success but got error');
          console.log('Error details:', JSON.stringify(result.data, null, 2));
        }
      } else {
        if (result.status === 400) {
          console.log('✅ Success: Validation errors caught correctly');
          if (result.data.errors) {
            console.log('Validation errors:');
            Object.entries(result.data.errors).forEach(([field, messages]) => {
              console.log(`  - ${field}: ${messages}`);
            });
          }
        } else {
          console.log('❌ Failed: Expected validation errors but got different response');
          console.log('Response:', JSON.stringify(result.data, null, 2));
        }
      }
      
    } catch (error) {
      console.error('❌ Test error:', error.message);
    }
  }

  // Run tests
  for (const [key, config] of Object.entries(tests)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Testing ${config.name}`);
    console.log(`${'='.repeat(60)}`);
    
    // Test with valid data
    await testForm(config.name, config.endpoint, config.validData, true);
    
    // Test with invalid data
    await testForm(config.name, config.endpoint, config.invalidData, false);
  }
  
  console.log('\n✨ All tests completed!\n');
}

// Run the tests
testFormsBasic().catch(console.error);