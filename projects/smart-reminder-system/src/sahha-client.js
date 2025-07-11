const axios = require('axios');
require('dotenv').config();

class SahhaClient {
  constructor() {
    this.baseURL = process.env.SAHHA_PRODUCTION_URL; // OAuth endpoints are on production URL
    this.sandboxURL = process.env.SAHHA_SANDBOX_URL;
    this.applicationId = process.env.SAHHA_APPLICATION_ID;
    this.applicationSecret = process.env.SAHHA_APPLICATION_SECRET;
    this.clientId = process.env.SAHHA_CLIENT_ID;
    this.clientSecret = process.env.SAHHA_CLIENT_SECRET;
    this.profileToken = null;
    this.refreshToken = null;
    this.externalId = null;
  }

  async registerProfile(externalId) {
    try {
      console.log(`🔄 Registering profile with externalId: ${externalId}`);
      console.log(`🔑 Using appId: ${this.applicationId.substring(0, 8)}...`);
      
      // Try different registration payload formats
      const payloads = [
        {
          name: 'Standard payload',
          data: { externalId: externalId },
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.applicationId}:${this.applicationSecret}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        },
        {
          name: 'Payload with app credentials',
          data: { 
            externalId: externalId,
            appId: this.applicationId,
            appSecret: this.applicationSecret
          },
          headers: {
            'Content-Type': 'application/json'
          }
        },
        {
          name: 'Client credentials auth',
          data: { externalId: externalId },
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      ];

      for (const payload of payloads) {
        try {
          console.log(`🔄 Trying ${payload.name}...`);
          
          const response = await axios.post(
            `${this.baseURL}/api/v1/oauth/profile/register/appId`,
            payload.data,
            { headers: payload.headers }
          );
          
          this.profileToken = response.data.profileToken;
          this.refreshToken = response.data.refreshToken;
          this.externalId = externalId;
          
          console.log(`✅ Profile registered successfully with ${payload.name}`);
          return response.data;
        } catch (error) {
          console.log(`❌ ${payload.name} failed: ${error.response?.status} - ${error.response?.data?.title || error.message}`);
          continue;
        }
      }
      
      throw new Error('All registration methods failed');
    } catch (error) {
      console.error('❌ Profile registration failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getProfileToken(externalId, readOnly = false, lifetime = '86400') {
    try {
      console.log(`🔄 Getting profile token for: ${externalId}`);
      
      const response = await axios.post(
        `${this.baseURL}/api/v1/oauth/profile/token`,
        {
          externalId: externalId,
          readOnly: readOnly.toString(),
          lifetime: lifetime
        },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.applicationId}:${this.applicationSecret}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      this.profileToken = response.data.profileToken;
      this.refreshToken = response.data.refreshToken;
      this.externalId = externalId;
      
      console.log('✅ Profile token obtained successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Getting profile token failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async refreshProfileToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('🔄 Refreshing profile token...');
      
      const response = await axios.post(
        `${this.baseURL}/api/v1/oauth/profile/refreshToken`,
        {
          refreshToken: this.refreshToken
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      this.profileToken = response.data.profileToken;
      this.refreshToken = response.data.refreshToken;
      
      console.log('✅ Profile token refreshed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async authenticate(externalId = 'test-user-' + Date.now()) {
    try {
      // Try to get existing profile token first
      await this.getProfileToken(externalId);
      return this.profileToken;
    } catch (error) {
      console.log('🔄 Profile token failed, trying registration...');
      // If that fails, try to register new profile
      try {
        await this.registerProfile(externalId);
        return this.profileToken;
      } catch (regError) {
        console.error('❌ Both token and registration failed');
        throw regError;
      }
    }
  }

  async getHealthScores(profileId, startDate, endDate) {
    if (!this.profileToken) {
      throw new Error('No profile token available. Call authenticate() first.');
    }

    try {
      console.log(`🔄 Getting health scores for profile: ${profileId}`);
      
      // Try sandbox URL first (where the sample data is)
      const response = await axios.get(
        `${this.sandboxURL}/api/v1/profile/score/${profileId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.profileToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            startDateTime: startDate,
            endDateTime: endDate
          }
        }
      );
      
      console.log('✅ Health scores retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get health scores:', error.response?.data || error.message);
      throw error;
    }
  }

  async getBiomarkers(profileId, startDate, endDate) {
    if (!this.profileToken) {
      throw new Error('No profile token available. Call authenticate() first.');
    }

    try {
      console.log(`🔄 Getting biomarkers for profile: ${profileId}`);
      
      const response = await axios.get(
        `${this.sandboxURL}/api/v1/profile/biomarker/${profileId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.profileToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            startDateTime: startDate,
            endDateTime: endDate
          }
        }
      );
      
      console.log('✅ Biomarkers retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get biomarkers:', error.response?.data || error.message);
      throw error;
    }
  }

  async getDeviceInformation(profileId) {
    if (!this.profileToken) {
      throw new Error('No profile token available. Call authenticate() first.');
    }

    try {
      console.log(`🔄 Getting device information for profile: ${profileId}`);
      
      const response = await axios.get(
        `${this.sandboxURL}/api/v1/profile/deviceInformation/${profileId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.profileToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Device information retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get device information:', error.response?.data || error.message);
      throw error;
    }
  }

  // Extract sleep score from health scores
  getSleepScore(healthScores) {
    if (!healthScores || !Array.isArray(healthScores)) {
      return null;
    }

    const latestScore = healthScores
      .filter(score => score.type === 'sleep' || score.category === 'sleep')
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    return latestScore ? latestScore.value : null;
  }

  // Extract activity/readiness score
  getReadinessScore(healthScores) {
    if (!healthScores || !Array.isArray(healthScores)) {
      return null;
    }

    const latestScore = healthScores
      .filter(score => score.type === 'readiness' || score.category === 'readiness')
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    return latestScore ? latestScore.value : null;
  }
}

module.exports = SahhaClient;