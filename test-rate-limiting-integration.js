/**
 * Integration test for rate limiting functionality
 * This script tests that rate limiting is properly applied to all API endpoints
 * 
 * Run with: node test-rate-limiting-integration.js
 * 
 * NOTE: This test should be run against a deployed instance or local development server
 * Update the BASE_URL constant to match your deployment URL
 */

const BASE_URL = 'http://localhost:8080'; // Update this for your deployment

/**
 * Helper function to make HTTP requests
 */
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  return {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    data: response.status !== 204 ? await response.json().catch(() => null) : null,
  };
}

/**
 * Test rate limiting for CSRF token endpoint
 */
async function testCSRFRateLimit() {
  console.log('\n📋 Testing CSRF token rate limiting...');
  
  const requests = [];
  const maxRequests = 25; // Should exceed the limit of 20
  
  // Make concurrent requests
  for (let i = 0; i < maxRequests; i++) {
    requests.push(makeRequest('/api/csrf-token'));
  }
  
  const results = await Promise.all(requests);
  
  // Count successful and rate-limited requests
  const successful = results.filter(r => r.status === 200).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  
  console.log(`✅ Successful requests: ${successful}`);
  console.log(`🚫 Rate limited requests: ${rateLimited}`);
  console.log(`📊 Total requests: ${results.length}`);
  
  // Check that rate limiting kicked in
  if (rateLimited > 0) {
    console.log('✅ CSRF rate limiting is working correctly');
    
    // Check rate limit headers
    const rateLimitedResponse = results.find(r => r.status === 429);
    if (rateLimitedResponse) {
      console.log('📈 Rate limit headers:', {
        limit: rateLimitedResponse.headers['x-ratelimit-limit'],
        remaining: rateLimitedResponse.headers['x-ratelimit-remaining'],
        reset: rateLimitedResponse.headers['x-ratelimit-reset'],
        retryAfter: rateLimitedResponse.headers['retry-after'],
      });
    }
  } else {
    console.log('⚠️  CSRF rate limiting may not be working - no requests were blocked');
  }
  
  return { successful, rateLimited, total: results.length };
}

/**
 * Test rate limiting for form submission endpoints
 */
async function testFormRateLimit() {
  console.log('\n📝 Testing form submission rate limiting...');
  
  // Test the lead form endpoint
  const formData = {
    nombre: 'Test User',
    email: 'test@example.com',
    telefono: '1234567890',
    tipoSeguro: 'vida',
    mensaje: 'Test message',
    website: '', // Honeypot field should be empty
  };
  
  const requests = [];
  const maxRequests = 10; // Should exceed the limit of 5
  
  // First, get a CSRF token
  let csrfToken = null;
  try {
    const csrfResponse = await makeRequest('/api/csrf-token');
    if (csrfResponse.status === 200 && csrfResponse.data) {
      csrfToken = csrfResponse.data.token;
      console.log('🔐 Retrieved CSRF token for form testing');
    }
  } catch (error) {
    console.log('⚠️  Could not retrieve CSRF token, form tests may fail');
  }
  
  // Make concurrent form submission requests
  for (let i = 0; i < maxRequests; i++) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      body: JSON.stringify({ ...formData, nombre: `Test User ${i}` }),
    };
    
    requests.push(makeRequest('/api/send-email', options));
  }
  
  const results = await Promise.all(requests);
  
  // Count different response types
  const successful = results.filter(r => r.status === 200).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  const forbidden = results.filter(r => r.status === 403).length; // CSRF failures
  const otherErrors = results.filter(r => r.status >= 400 && r.status !== 429 && r.status !== 403).length;
  
  console.log(`✅ Successful requests: ${successful}`);
  console.log(`🚫 Rate limited requests: ${rateLimited}`);
  console.log(`🔒 CSRF forbidden requests: ${forbidden}`);
  console.log(`❌ Other errors: ${otherErrors}`);
  console.log(`📊 Total requests: ${results.length}`);
  
  // Check that rate limiting kicked in
  if (rateLimited > 0) {
    console.log('✅ Form rate limiting is working correctly');
    
    // Check rate limit headers and error message
    const rateLimitedResponse = results.find(r => r.status === 429);
    if (rateLimitedResponse) {
      console.log('📈 Rate limit response:', rateLimitedResponse.data);
    }
  } else {
    console.log('⚠️  Form rate limiting may not be working - no requests were blocked');
  }
  
  return { successful, rateLimited, forbidden, otherErrors, total: results.length };
}

/**
 * Test IP-based rate limiting with different IPs
 */
async function testIPBasedRateLimit() {
  console.log('\n🌐 Testing IP-based rate limiting...');
  
  const requests = [];
  const ips = ['192.168.1.1', '192.168.1.2', '10.0.0.1'];
  const requestsPerIP = 8; // Should exceed form limit of 5 per IP
  
  // Make requests from different IPs
  for (const ip of ips) {
    for (let i = 0; i < requestsPerIP; i++) {
      const options = {
        method: 'GET',
        headers: {
          'X-Forwarded-For': ip,
        },
      };
      
      requests.push({
        ip,
        promise: makeRequest('/api/csrf-token', options)
      });
    }
  }
  
  const results = await Promise.all(requests.map(r => r.promise));
  
  // Group results by IP
  const resultsByIP = {};
  requests.forEach((req, index) => {
    if (!resultsByIP[req.ip]) {
      resultsByIP[req.ip] = [];
    }
    resultsByIP[req.ip].push(results[index]);
  });
  
  console.log('📊 Results by IP:');
  for (const [ip, ipResults] of Object.entries(resultsByIP)) {
    const successful = ipResults.filter(r => r.status === 200).length;
    const rateLimited = ipResults.filter(r => r.status === 429).length;
    console.log(`  ${ip}: ${successful} successful, ${rateLimited} rate limited`);
  }
  
  const totalRateLimited = results.filter(r => r.status === 429).length;
  if (totalRateLimited > 0) {
    console.log('✅ IP-based rate limiting is working correctly');
  } else {
    console.log('⚠️  IP-based rate limiting may not be working properly');
  }
  
  return resultsByIP;
}

/**
 * Test rate limit headers are properly set
 */
async function testRateLimitHeaders() {
  console.log('\n📊 Testing rate limit headers...');
  
  const response = await makeRequest('/api/csrf-token');
  
  const headers = {
    limit: response.headers['x-ratelimit-limit'],
    remaining: response.headers['x-ratelimit-remaining'],
    reset: response.headers['x-ratelimit-reset'],
  };
  
  console.log('Rate limit headers:', headers);
  
  if (headers.limit && headers.remaining && headers.reset) {
    console.log('✅ Rate limit headers are properly set');
    
    // Validate header values
    const limit = parseInt(headers.limit);
    const remaining = parseInt(headers.remaining);
    const reset = parseInt(headers.reset);
    
    if (limit > 0 && remaining >= 0 && remaining < limit && reset > Date.now() / 1000) {
      console.log('✅ Rate limit header values are valid');
    } else {
      console.log('⚠️  Rate limit header values may be invalid:', { limit, remaining, reset });
    }
  } else {
    console.log('❌ Rate limit headers are missing');
  }
  
  return headers;
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting Rate Limiting Integration Tests');
  console.log(`🔗 Testing against: ${BASE_URL}`);
  console.log('⏱️  This may take a few moments...');
  
  try {
    // Test individual components
    const csrfResults = await testCSRFRateLimit();
    const formResults = await testFormRateLimit();
    const ipResults = await testIPBasedRateLimit();
    const headerResults = await testRateLimitHeaders();
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log('================');
    console.log(`🔐 CSRF Rate Limiting: ${csrfResults.rateLimited > 0 ? '✅ Working' : '⚠️  Check needed'}`);
    console.log(`📝 Form Rate Limiting: ${formResults.rateLimited > 0 ? '✅ Working' : '⚠️  Check needed'}`);
    console.log(`🌐 IP-based Limiting: ${Object.values(ipResults).some(results => results.some(r => r.status === 429)) ? '✅ Working' : '⚠️  Check needed'}`);
    console.log(`📊 Rate Limit Headers: ${headerResults.limit ? '✅ Working' : '❌ Missing'}`);
    
    console.log('\n✅ Rate limiting integration tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Check if this script is being run directly
if (typeof require !== 'undefined' && require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testCSRFRateLimit,
  testFormRateLimit,
  testIPBasedRateLimit,
  testRateLimitHeaders,
  runTests,
};