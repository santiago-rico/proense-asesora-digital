/**
 * Security test for rate limiting functionality
 * This script simulates various attack scenarios to verify rate limiting protection
 * 
 * Run with: node test-rate-limiting-security.js
 * 
 * This test focuses on security aspects:
 * - DoS attack simulation
 * - Spam attack simulation  
 * - Rate limit bypass attempts
 * - Response time analysis under load
 */

const BASE_URL = 'http://localhost:8080'; // Update for your deployment

/**
 * Simulate a DoS attack on CSRF endpoint
 */
async function simulateDoSAttack() {
  console.log('\n🚨 Simulating DoS attack on CSRF endpoint...');
  
  const attackRequests = 50; // Aggressive request count
  const startTime = Date.now();
  
  console.log(`🎯 Launching ${attackRequests} concurrent requests...`);
  
  const requests = [];
  for (let i = 0; i < attackRequests; i++) {
    requests.push(
      fetch(`${BASE_URL}/api/csrf-token`, {
        method: 'GET',
        headers: {
          'X-Forwarded-For': '203.0.113.1', // Simulate attacker IP
        },
      }).then(response => ({
        status: response.status,
        timestamp: Date.now() - startTime,
      })).catch(error => ({
        status: 'ERROR',
        error: error.message,
        timestamp: Date.now() - startTime,
      }))
    );
  }
  
  const results = await Promise.all(requests);
  const endTime = Date.now();
  
  // Analyze results
  const successful = results.filter(r => r.status === 200).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const totalTime = endTime - startTime;
  
  console.log('📊 DoS Attack Results:');
  console.log(`   Total requests: ${attackRequests}`);
  console.log(`   Successful: ${successful} (${((successful/attackRequests)*100).toFixed(1)}%)`);
  console.log(`   Rate limited: ${rateLimited} (${((rateLimited/attackRequests)*100).toFixed(1)}%)`);
  console.log(`   Errors: ${errors} (${((errors/attackRequests)*100).toFixed(1)}%)`);
  console.log(`   Total time: ${totalTime}ms`);
  console.log(`   Average response time: ${(totalTime/attackRequests).toFixed(1)}ms`);
  
  // Security analysis
  if (rateLimited >= attackRequests * 0.6) { // At least 60% should be blocked
    console.log('✅ DoS protection is effective - majority of requests blocked');
  } else {
    console.log('⚠️  DoS protection may be insufficient - too many requests succeeded');
  }
  
  if (successful <= 25) { // Should allow reasonable number of legitimate requests
    console.log('✅ Rate limiting allows reasonable legitimate traffic');
  } else {
    console.log('⚠️  Rate limiting may be too lenient');
  }
  
  return { successful, rateLimited, errors, totalTime, attackRequests };
}

/**
 * Simulate spam form submission attack
 */
async function simulateSpamAttack() {
  console.log('\n📧 Simulating spam form submission attack...');
  
  // First get a CSRF token
  let csrfToken = null;
  try {
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf-token`);
    const csrfData = await csrfResponse.json();
    csrfToken = csrfData.token;
    console.log('🔐 Retrieved CSRF token for spam test');
  } catch (error) {
    console.log('❌ Could not get CSRF token, test may fail');
  }
  
  const spamData = {
    nombre: 'Spam Bot',
    email: 'spam@malicious.com',
    telefono: '1234567890',
    tipoSeguro: 'vida',
    mensaje: 'This is spam message '.repeat(10), // Long spam message
    website: '', // Honeypot should be empty
  };
  
  const spamRequests = 15; // Should exceed form limit
  const startTime = Date.now();
  
  console.log(`🎯 Launching ${spamRequests} spam form submissions...`);
  
  const requests = [];
  for (let i = 0; i < spamRequests; i++) {
    requests.push(
      fetch(`${BASE_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '198.51.100.1', // Spam bot IP
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        body: JSON.stringify({
          ...spamData,
          mensaje: `${spamData.mensaje} #${i}`,
        }),
      }).then(response => response.json().then(data => ({
        status: response.status,
        data,
        timestamp: Date.now() - startTime,
      }))).catch(error => ({
        status: 'ERROR',
        error: error.message,
        timestamp: Date.now() - startTime,
      }))
    );
  }
  
  const results = await Promise.all(requests);
  const endTime = Date.now();
  
  // Analyze results
  const successful = results.filter(r => r.status === 200).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  const forbidden = results.filter(r => r.status === 403).length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const totalTime = endTime - startTime;
  
  console.log('📊 Spam Attack Results:');
  console.log(`   Total requests: ${spamRequests}`);
  console.log(`   Successful: ${successful} (${((successful/spamRequests)*100).toFixed(1)}%)`);
  console.log(`   Rate limited: ${rateLimited} (${((rateLimited/spamRequests)*100).toFixed(1)}%)`);
  console.log(`   CSRF forbidden: ${forbidden} (${((forbidden/spamRequests)*100).toFixed(1)}%)`);
  console.log(`   Errors: ${errors} (${((errors/spamRequests)*100).toFixed(1)}%)`);
  console.log(`   Total time: ${totalTime}ms`);
  
  // Security analysis
  if (rateLimited >= spamRequests * 0.5) {
    console.log('✅ Spam protection is effective - good rate limiting');
  } else {
    console.log('⚠️  Spam protection may need improvement');
  }
  
  if (successful <= 5) {
    console.log('✅ Form rate limiting effectively prevents spam');
  } else {
    console.log('⚠️  Too many spam submissions succeeded');
  }
  
  return { successful, rateLimited, forbidden, errors, totalTime, spamRequests };
}

/**
 * Test rate limit bypass attempts
 */
async function testBypassAttempts() {
  console.log('\n🔓 Testing rate limit bypass attempts...');
  
  const baseIP = '10.0.0.';
  const requestsPerIP = 3;
  const ipCount = 8; // Try to use multiple IPs to bypass
  
  console.log('🎯 Attempting IP rotation bypass...');
  
  const requests = [];
  for (let ip = 1; ip <= ipCount; ip++) {
    for (let req = 0; req < requestsPerIP; req++) {
      requests.push(
        fetch(`${BASE_URL}/api/csrf-token`, {
          method: 'GET',
          headers: {
            'X-Forwarded-For': `${baseIP}${ip}`,
          },
        }).then(response => ({
          ip: `${baseIP}${ip}`,
          status: response.status,
          success: response.status === 200,
        })).catch(error => ({
          ip: `${baseIP}${ip}`,
          status: 'ERROR',
          error: error.message,
          success: false,
        }))
      );
    }
  }
  
  const results = await Promise.all(requests);
  
  // Group by IP
  const resultsByIP = {};
  results.forEach(result => {
    if (!resultsByIP[result.ip]) {
      resultsByIP[result.ip] = [];
    }
    resultsByIP[result.ip].push(result);
  });
  
  console.log('📊 IP Rotation Results:');
  let totalSuccessful = 0;
  let totalRateLimited = 0;
  
  for (const [ip, ipResults] of Object.entries(resultsByIP)) {
    const successful = ipResults.filter(r => r.success).length;
    const rateLimited = ipResults.filter(r => r.status === 429).length;
    totalSuccessful += successful;
    totalRateLimited += rateLimited;
    
    console.log(`   ${ip}: ${successful}/${requestsPerIP} successful, ${rateLimited} rate limited`);
  }
  
  console.log(`   Total: ${totalSuccessful} successful, ${totalRateLimited} rate limited`);
  
  // Security analysis
  if (totalSuccessful <= ipCount * 1.5) { // Allow some legitimate requests per IP
    console.log('✅ IP-based rate limiting prevents simple bypass attempts');
  } else {
    console.log('⚠️  IP rotation may be too effective at bypassing rate limits');
  }
  
  return { totalSuccessful, totalRateLimited, ipCount, requestsPerIP };
}

/**
 * Test response time under rate limiting
 */
async function testResponseTimeUnderLoad() {
  console.log('\n⏱️  Testing response time under rate limiting...');
  
  const normalRequests = 5; // Under limit
  const excessRequests = 15; // Over limit
  
  // Test normal load
  console.log('📊 Testing normal load response times...');
  const normalStart = Date.now();
  const normalPromises = [];
  
  for (let i = 0; i < normalRequests; i++) {
    normalPromises.push(
      fetch(`${BASE_URL}/api/csrf-token`).then(response => ({
        status: response.status,
        responseTime: Date.now() - normalStart,
      }))
    );
  }
  
  const normalResults = await Promise.all(normalPromises);
  const normalAvgTime = normalResults.reduce((sum, r) => sum + r.responseTime, 0) / normalResults.length;
  
  // Test excess load
  console.log('📊 Testing excess load response times...');
  const excessStart = Date.now();
  const excessPromises = [];
  
  for (let i = 0; i < excessRequests; i++) {
    excessPromises.push(
      fetch(`${BASE_URL}/api/csrf-token`, {
        headers: {
          'X-Forwarded-For': '172.16.0.1', // Different IP for excess test
        },
      }).then(response => ({
        status: response.status,
        responseTime: Date.now() - excessStart,
      }))
    );
  }
  
  const excessResults = await Promise.all(excessPromises);
  const rateLimitedResults = excessResults.filter(r => r.status === 429);
  const rateLimitedAvgTime = rateLimitedResults.length > 0 
    ? rateLimitedResults.reduce((sum, r) => sum + r.responseTime, 0) / rateLimitedResults.length
    : 0;
  
  console.log('📊 Response Time Analysis:');
  console.log(`   Normal load avg: ${normalAvgTime.toFixed(1)}ms`);
  console.log(`   Rate limited avg: ${rateLimitedAvgTime.toFixed(1)}ms`);
  console.log(`   Rate limited responses: ${rateLimitedResults.length}/${excessRequests}`);
  
  // Performance analysis
  if (rateLimitedAvgTime < normalAvgTime * 2) {
    console.log('✅ Rate limiting responses are fast (good for UX)');
  } else {
    console.log('⚠️  Rate limiting responses are slow (may impact UX)');
  }
  
  if (rateLimitedResults.length >= excessRequests * 0.6) {
    console.log('✅ Rate limiting effectively blocks excess requests');
  } else {
    console.log('⚠️  Rate limiting may not be strict enough');
  }
  
  return { normalAvgTime, rateLimitedAvgTime, rateLimitedCount: rateLimitedResults.length };
}

/**
 * Main security test function
 */
async function runSecurityTests() {
  console.log('🔒 Starting Rate Limiting Security Tests');
  console.log(`🔗 Testing against: ${BASE_URL}`);
  console.log('⚠️  These tests simulate attack scenarios - use responsibly!');
  console.log('⏱️  This will take several minutes...');
  
  try {
    // Run security tests
    const dosResults = await simulateDoSAttack();
    const spamResults = await simulateSpamAttack();
    const bypassResults = await testBypassAttempts();
    const performanceResults = await testResponseTimeUnderLoad();
    
    // Security summary
    console.log('\n🔒 Security Test Summary:');
    console.log('========================');
    
    // DoS protection
    const dosProtection = dosResults.rateLimited >= dosResults.attackRequests * 0.6;
    console.log(`🚨 DoS Protection: ${dosProtection ? '✅ Strong' : '⚠️  Weak'}`);
    
    // Spam protection  
    const spamProtection = spamResults.rateLimited >= spamResults.spamRequests * 0.5;
    console.log(`📧 Spam Protection: ${spamProtection ? '✅ Effective' : '⚠️  Insufficient'}`);
    
    // Bypass resistance
    const bypassResistance = bypassResults.totalSuccessful <= bypassResults.ipCount * 1.5;
    console.log(`🔓 Bypass Resistance: ${bypassResistance ? '✅ Good' : '⚠️  Vulnerable'}`);
    
    // Performance under attack
    const performanceGood = performanceResults.rateLimitedAvgTime < performanceResults.normalAvgTime * 2;
    console.log(`⏱️  Performance: ${performanceGood ? '✅ Maintained' : '⚠️  Degraded'}`);
    
    // Overall security score
    const securityScore = [dosProtection, spamProtection, bypassResistance, performanceGood]
      .filter(Boolean).length;
    
    console.log(`\n🏆 Overall Security Score: ${securityScore}/4`);
    
    if (securityScore >= 3) {
      console.log('✅ Rate limiting provides strong security protection!');
    } else if (securityScore >= 2) {
      console.log('⚠️  Rate limiting provides moderate security - consider improvements');
    } else {
      console.log('❌ Rate limiting security is insufficient - immediate improvements needed');
    }
    
    console.log('\n🔒 Security testing completed!');
    
  } catch (error) {
    console.error('❌ Security test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (typeof require !== 'undefined' && require.main === module) {
  runSecurityTests().catch(console.error);
}

module.exports = {
  simulateDoSAttack,
  simulateSpamAttack,
  testBypassAttempts,
  testResponseTimeUnderLoad,
  runSecurityTests,
};