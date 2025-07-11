const axios = require('axios');
require('dotenv').config();

async function testSahhaAuthentication() {
  console.log('🧪 Testing Sahha Authentication Step by Step...\n');

  // Step 1: Try to get administrative token with Client credentials
  console.log('🔐 Step 1: Testing Administrative Token (Client Credentials)');
  try {
    const response = await axios.post('https://api.sahha.ai/api/v1/oauth/token', {
      grant_type: 'client_credentials',
      client_id: process.env.SAHHA_CLIENT_ID,
      client_secret: process.env.SAHHA_CLIENT_SECRET
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Administrative token obtained!');
    console.log(`Token type: ${response.data.token_type}`);
    console.log(`Expires in: ${response.data.expires_in} seconds`);
    
    const adminToken = response.data.access_token;
    
    // Step 2: Try to register profile using administrative token
    console.log('\n🔐 Step 2: Testing Profile Registration with Admin Token');
    try {
      const externalId = 'smart-reminder-test-' + Date.now();
      const profileResponse = await axios.post('https://api.sahha.ai/api/v1/oauth/profile/register', {
        externalId: externalId
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Profile registered successfully!');
      console.log(`Profile Token obtained for: ${externalId}`);
      
      const profileToken = profileResponse.data.profileToken;
      
      // Step 3: Test data access with profile token
      console.log('\n📊 Step 3: Testing Sample Data Access');
      try {
        const sampleProfileId = 'SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28';
        const dataResponse = await axios.get(
          `https://sandbox-api.sahha.ai/api/v1/profile/score/${sampleProfileId}`,
          {
            headers: {
              'Authorization': `Bearer ${profileToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              startDateTime: '2025-07-05',
              endDateTime: '2025-07-11'
            }
          }
        );
        
        console.log('✅ Sample data accessed successfully!');
        console.log('Sample health scores:', JSON.stringify(dataResponse.data, null, 2));
        
      } catch (dataError) {
        console.log('❌ Sample data access failed:', dataError.response?.status, dataError.response?.data);
      }
      
    } catch (profileError) {
      console.log('❌ Profile registration failed:', profileError.response?.status, profileError.response?.data);
    }
    
  } catch (adminError) {
    console.log('❌ Administrative token failed:', adminError.response?.status, adminError.response?.data);
    
    // Fallback: Try direct profile registration with Application credentials
    console.log('\n🔄 Fallback: Direct Profile Registration with App Credentials');
    try {
      const externalId = 'smart-reminder-direct-' + Date.now();
      const directResponse = await axios.post('https://api.sahha.ai/api/v1/oauth/profile/register/appId', {
        externalId: externalId
      }, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.SAHHA_APPLICATION_ID}:${process.env.SAHHA_APPLICATION_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Direct profile registration successful!');
      console.log('Profile token obtained via direct method');
      
    } catch (directError) {
      console.log('❌ Direct registration also failed:', directError.response?.status, directError.response?.data);
    }
  }
}

testSahhaAuthentication();