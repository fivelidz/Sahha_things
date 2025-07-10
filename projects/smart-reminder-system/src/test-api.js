const SahhaClient = require('./sahha-client');

async function testSahhaAPI() {
  console.log('🧪 Testing Sahha API Connection with OAuth Profile Flow...\n');
  
  const client = new SahhaClient();
  
  try {
    // Test OAuth profile authentication
    console.log('🔐 Testing OAuth Profile Authentication...');
    const externalId = 'test-smart-reminder-' + Date.now();
    await client.authenticate(externalId);
    
    console.log(`✅ Authentication successful! Profile token obtained.`);
    console.log(`🆔 External ID: ${externalId}\n`);
    
    // Test with the sample profile you provided
    const sampleProfileId = 'SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28';
    const startDate = '2025-07-05';
    const endDate = '2025-07-11';
    
    console.log(`📊 Fetching health scores for profile: ${sampleProfileId}`);
    console.log(`📅 Date range: ${startDate} to ${endDate}\n`);
    
    // Get health scores
    try {
      const healthScores = await client.getHealthScores(sampleProfileId, startDate, endDate);
      console.log('✅ Health Scores Response:');
      console.log(JSON.stringify(healthScores, null, 2));
      
      // Extract sleep score
      const sleepScore = client.getSleepScore(healthScores);
      console.log(`\n😴 Latest Sleep Score: ${sleepScore || 'Not found'}`);
      
      // Extract readiness score
      const readinessScore = client.getReadinessScore(healthScores);
      console.log(`💪 Latest Readiness Score: ${readinessScore || 'Not found'}`);
    } catch (scoreError) {
      console.log('ℹ️ Health scores may require different profile access');
      console.log(`Error: ${scoreError.message}`);
    }
    
    // Try to get biomarkers
    console.log('\n📋 Testing biomarkers endpoint...');
    try {
      const biomarkers = await client.getBiomarkers(sampleProfileId, startDate, endDate);
      console.log('✅ Biomarkers Response:');
      console.log(JSON.stringify(biomarkers, null, 2));
    } catch (bioError) {
      console.log('ℹ️ Biomarkers endpoint may require different access');
      console.log(`Error: ${bioError.message}`);
    }
    
    // Test device information endpoint
    console.log('\n📱 Testing device information endpoint...');
    try {
      const deviceInfo = await client.getDeviceInformation(sampleProfileId);
      console.log('✅ Device Information Response:');
      console.log(JSON.stringify(deviceInfo, null, 2));
    } catch (deviceError) {
      console.log('ℹ️ Device information may require different access');
      console.log(`Error: ${deviceError.message}`);
    }
    
    console.log('\n🎉 OAuth Profile Authentication Test Complete!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    
    // Fallback to mock data test
    console.log('\n🔄 Falling back to mock data for development...');
    const { generateMockData } = require('./mock-data');
    const mockData = generateMockData();
    console.log('✅ Mock data generated successfully for development!');
    console.log(`😴 Mock Sleep Score: ${mockData.today.sleep_quality}/100`);
    console.log(`💪 Mock Readiness Score: ${mockData.today.readiness_score}/100`);
  }
}

// Run the test
testSahhaAPI();