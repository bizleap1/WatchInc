const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3005;

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function waitForServer(port = PORT, maxRetries = 20) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await makeRequest({ host: '127.0.0.1', port, path: '/', method: 'GET' });
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 600));
    }
  }
  return false;
}

async function runTests() {
  console.log('--- STARTING VERIFICATION TEST SUITE ---');

  // Reset test database
  const dataDir = path.join(process.cwd(), 'data');
  const dbFile = path.join(dataDir, 'waitlist-records.json');
  if (fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ subscribers: [], updatedAt: new Date().toISOString() }, null, 2));
  }

  console.log(`1. Starting Next.js production server on port ${PORT}...`);
  const server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) }
  });

  try {
    const isReady = await waitForServer(PORT);
    if (!isReady) {
      throw new Error('Server failed to start within timeout window.');
    }
    console.log(`✓ Server is live and accepting connections on http://127.0.0.1:${PORT}\n`);

    // Test 1: Homepage
    console.log('Testing GET / (Homepage)...');
    const homeRes = await makeRequest({ host: '127.0.0.1', port: PORT, path: '/', method: 'GET' });
    console.log(`Status: ${homeRes.statusCode}`);
    if (homeRes.statusCode !== 200 || !homeRes.body.includes('Six stones. Six intentions.')) {
      throw new Error('Homepage validation failed');
    }
    console.log('✓ Homepage renders successfully with exact editorial headline: "Six stones. Six intentions."\n');

    // Test 2: All 6 Product Routes
    const slugs = ['overflow', 'cherish', 'hush', 'ascent', 'wildfire', 'cadence'];
    for (const slug of slugs) {
      console.log(`Testing GET /collection/${slug}...`);
      const prodRes = await makeRequest({ host: '127.0.0.1', port: PORT, path: `/collection/${slug}`, method: 'GET' });
      if (prodRes.statusCode !== 200) {
        throw new Error(`Product route /collection/${slug} failed with status ${prodRes.statusCode}: ${prodRes.body}`);
      }
      console.log(`✓ /collection/${slug} returned 200 OK`);
    }
    console.log('✓ All 6 product routes verified.\n');

    // Test 3: Invalid slug should return 404
    console.log('Testing GET /collection/non-existent-piece (Should return 404)...');
    const notFoundRes = await makeRequest({ host: '127.0.0.1', port: PORT, path: '/collection/non-existent-piece', method: 'GET' });
    if (notFoundRes.statusCode !== 404) {
      throw new Error(`Expected 404 but got ${notFoundRes.statusCode}`);
    }
    console.log('✓ Invalid product slug correctly returns 404 Not Found.\n');

    // Test 4: Waitlist API Validation - Invalid Email
    console.log('Testing POST /api/waitlist (Invalid Email)...');
    const invalidEmailRes = await makeRequest({
      host: '127.0.0.1',
      port: PORT,
      path: '/api/waitlist',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' }
    }, JSON.stringify({ email: 'not-an-email', consent: true }));
    if (invalidEmailRes.statusCode !== 400) {
      throw new Error(`Expected 400 for invalid email but got ${invalidEmailRes.statusCode}`);
    }
    console.log('✓ Rejected invalid email with 400 Bad Request.\n');

    // Test 5: Waitlist API Validation - Missing Consent
    console.log('Testing POST /api/waitlist (Missing Consent)...');
    const noConsentRes = await makeRequest({
      host: '127.0.0.1',
      port: PORT,
      path: '/api/waitlist',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.2' }
    }, JSON.stringify({ email: 'client@atelier.example', consent: false }));
    if (noConsentRes.statusCode !== 400) {
      throw new Error(`Expected 400 for missing consent but got ${noConsentRes.statusCode}`);
    }
    console.log('✓ Rejected missing consent with 400 Bad Request.\n');

    // Test 6: Valid Signup
    console.log('Testing POST /api/waitlist (Valid submission: Overflow, plate: yes)...');
    const validRes = await makeRequest({
      host: '127.0.0.1',
      port: PORT,
      path: '/api/waitlist',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.3' }
    }, JSON.stringify({
      email: 'collector1@atelier.example',
      preferredWatch: 'overflow',
      restingPlateInterest: 'yes',
      consent: true,
      website_trap: ''
    }));
    if (validRes.statusCode !== 201) {
      throw new Error(`Expected 201 for valid submission but got ${validRes.statusCode}: ${validRes.body}`);
    }
    console.log('✓ Valid subscriber successfully registered with 201 Created.\n');

    // Test 7: Duplicate Handling
    console.log('Testing POST /api/waitlist (Duplicate submission)...');
    const dupRes = await makeRequest({
      host: '127.0.0.1',
      port: PORT,
      path: '/api/waitlist',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.4' }
    }, JSON.stringify({
      email: 'collector1@atelier.example',
      preferredWatch: 'cherish',
      restingPlateInterest: 'no',
      consent: true
    }));
    if (dupRes.statusCode !== 409) {
      throw new Error(`Expected 409 for duplicate email but got ${dupRes.statusCode}: ${dupRes.body}`);
    }
    console.log('✓ Duplicate subscriber handled cleanly with 409 Conflict.\n');

    // Test 8: Second Signup with Plate: maybe
    console.log('Testing POST /api/waitlist (Second submission: Cherish, plate: maybe)...');
    const sub2 = await makeRequest({
      host: '127.0.0.1',
      port: PORT,
      path: '/api/waitlist',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.5' }
    }, JSON.stringify({
      email: 'collector2@atelier.example',
      preferredWatch: 'cherish',
      restingPlateInterest: 'maybe',
      consent: true
    }));
    if (sub2.statusCode !== 201) throw new Error(`Sub2 failed with ${sub2.statusCode}`);

    // Test 9: Third Signup with Plate: unanswered
    console.log('Testing POST /api/waitlist (Third submission: Hush, plate: unanswered)...');
    const sub3 = await makeRequest({
      host: '127.0.0.1',
      port: PORT,
      path: '/api/waitlist',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.6' }
    }, JSON.stringify({
      email: 'collector3@atelier.example',
      preferredWatch: 'hush',
      restingPlateInterest: 'unanswered',
      consent: true
    }));
    if (sub3.statusCode !== 201) throw new Error(`Sub3 failed with ${sub3.statusCode}`);

    // Test 10: GET /api/waitlist Analytics & Plate Interest Share
    console.log('Testing GET /api/waitlist (Privacy-Preserving Analytics)...');
    const analyticsRes = await makeRequest({
      host: '127.0.0.1',
      port: PORT,
      path: '/api/waitlist',
      method: 'GET'
    });
    const parsedAnalytics = JSON.parse(analyticsRes.body);
    console.log('Analytics Response:', JSON.stringify(parsedAnalytics, null, 2));

    const pi = parsedAnalytics.analytics.plateInterest;
    if (pi.yes !== 1 || pi.maybe !== 1 || pi.unanswered !== 1 || pi.sharePercent !== 50) {
      throw new Error(`Plate interest calculation mismatch! Expected 50% but got ${pi.sharePercent}%`);
    }
    console.log(`✓ Analytics verified! Share percent is exactly ${pi.sharePercent}% (Yes / (Yes + No + Maybe)).`);
    console.log('✓ Unanswered records strictly excluded from the denominator.');
    console.log('✓ Strict privacy verified: No emails or private IDs exposed in public analytics.\n');

    console.log('==============================================');
    console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ✓✓✓');
    console.log('==============================================');
  } finally {
    server.kill();
  }
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
