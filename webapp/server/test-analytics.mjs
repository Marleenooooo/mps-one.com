// Simple test script for bridge analytics endpoints
const bridgeUrl = 'http://localhost:3001';
const endpoints = [
  '/bridge/analytics/funnel',
  '/bridge/analytics/suppliers/SUP-1', 
  '/bridge/analytics/cohorts',
  '/bridge/analytics/anomalies',
  '/bridge/analytics/forecast'
];

console.log('Testing Bridge Analytics Endpoints...\n');

for (const endpoint of endpoints) {
  try {
    const res = await fetch(bridgeUrl + endpoint);
    const data = await res.json();
    console.log(`✓ ${endpoint}: ${res.status} - ${JSON.stringify(data).substring(0, 100)}...`);
  } catch (err) {
    console.log(`✗ ${endpoint}: ${err.message}`);
  }
}

console.log('\n✅ Bridge analytics integration test completed!');