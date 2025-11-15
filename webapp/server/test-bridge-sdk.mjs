import { BridgeClient } from '../../thebridge/sdk/client.js';

const client = new BridgeClient('http://localhost:3001');

async function testAnalytics() {
  try {
    console.log('Testing bridge analytics...');
    
    // Test funnel data
    const funnelData = await client.getFunnelData('test-token');
    console.log('Funnel Data:', JSON.stringify(funnelData, null, 2));
    
    // Test supplier performance
    const supplierData = await client.getSupplierPerformance('SUP-1', 'test-token');
    console.log('Supplier Performance:', JSON.stringify(supplierData, null, 2));
    
    // Test cohort data
    const cohortData = await client.getCohortData('test-token');
    console.log('Cohort Data:', JSON.stringify(cohortData, null, 2));
    
    // Test anomalies
    const anomalies = await client.getAnomalies('test-token');
    console.log('Anomalies:', JSON.stringify(anomalies, null, 2));
    
    // Test forecast
    const forecast = await client.getForecast('test-token');
    console.log('Forecast:', JSON.stringify(forecast, null, 2));
    
    console.log('All analytics tests passed!');
  } catch (error) {
    console.error('Analytics test failed:', error);
  }
}

testAnalytics();