const axios = require('axios');
require('dotenv').config();

class SahhaAccountClient {
  constructor() {
    this.baseURL = process.env.SAHHA_SANDBOX_URL || 'https://sandbox-api.sahha.ai';
    // Account token - this would normally be obtained through proper auth flow
    this.accountToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2FwaS5zYWhoYS5haS9jbGFpbXMvYWNjb3VudElkIjoiZmU3ZTkyMDAtNGEzYS00MmQwLWIxMWEtZjIwYzAxYTZiOTBiIiwiaHR0cHM6Ly9hcGkuc2FoaGEuYWkvY2xhaW1zL2FkbWluIjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9hY2NvdW50IjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9zYWhoYUFwaVNjb3BlIjoic2FuZGJveCIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9yZWdpb24iOiJVUyIsImV4cCI6MTc1NDI1NjAzMiwiaXNzIjoiaHR0cHM6Ly9zYWhoYS1wcm9kdWN0aW9uLmF1LmF1dGgwLmNvbS8iLCJhdWQiOiJodHRwczovL3NhaGhhLXByb2R1Y3Rpb24uYXUuYXV0aDAuY29tL2FwaS92Mi8ifQ.IGsV0msiqUiDz1tnPpbbF7Iqt0MofpACjvOslUT7N-k';
  }

  async getBiomarkers(profileId, startDate, endDate, categories = ['sleep', 'activity'], types = null) {
    try {
      console.log(`🔄 Getting biomarkers for profile: ${profileId}`);
      
      // Build URL with query parameters manually to ensure correct format
      let url = `${this.baseURL}/api/v1/profile/biomarker/${profileId}?startDateTime=${startDate}&endDateTime=${endDate}`;
      
      // Add categories as separate parameters
      categories.forEach(category => {
        url += `&categories=${category}`;
      });

      // Add specific types if provided
      if (types && types.length > 0) {
        types.forEach(type => {
          url += `&types=${type}`;
        });
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `account ${this.accountToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Biomarkers retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get biomarkers:', error.response?.data || error.message);
      throw error;
    }
  }

  async getDeviceInformation(profileId) {
    try {
      console.log(`🔄 Getting device information for profile: ${profileId}`);
      
      const response = await axios.get(
        `${this.baseURL}/api/v1/profile/deviceInformation/${profileId}`,
        {
          headers: {
            'Authorization': `account ${this.accountToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Device information retrieved successfully');
      return response.data;
    } catch (error) {
      if (error.response?.status === 204) {
        console.log('ℹ️ No device information available for this profile');
        return null;
      }
      console.error('❌ Failed to get device information:', error.response?.data || error.message);
      throw error;
    }
  }

  async getDemographics(profileId) {
    try {
      console.log(`🔄 Getting demographics for profile: ${profileId}`);
      
      const response = await axios.get(
        `${this.baseURL}/api/v1/profile/demographic/${profileId}`,
        {
          headers: {
            'Authorization': `account ${this.accountToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Demographics retrieved successfully');
      return response.data;
    } catch (error) {
      if (error.response?.status === 204) {
        console.log('ℹ️ No demographic information available for this profile');
        return null;
      }
      console.error('❌ Failed to get demographics:', error.response?.data || error.message);
      throw error;
    }
  }

  async getArchetypes(profileId, startDate, endDate, name = 'overall_wellness', periodicity = 'weekly') {
    try {
      console.log(`🔄 Getting archetypes for profile: ${profileId}`);
      
      const response = await axios.get(
        `${this.baseURL}/api/v1/profile/archetypes/${profileId}`,
        {
          headers: {
            'Authorization': `account ${this.accountToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            startDateTime: startDate,
            endDateTime: endDate,
            name,
            periodicity
          }
        }
      );
      
      console.log('✅ Archetypes retrieved successfully');
      return response.data;
    } catch (error) {
      if (error.response?.status === 204) {
        console.log('ℹ️ No archetype information available for this profile');
        return null;
      }
      console.error('❌ Failed to get archetypes:', error.response?.data || error.message);
      throw error;
    }
  }

  // Process biomarker data for Smart Reminder System
  processHealthData(biomarkers) {
    const healthData = {
      sleep: {},
      activity: {},
      trends: {}
    };

    if (!biomarkers || biomarkers.length === 0) {
      return healthData;
    }

    // Group by category and get latest values
    biomarkers.forEach(marker => {
      const { category, type, value, unit, startDateTime } = marker;
      
      if (category === 'sleep') {
        switch (type) {
          case 'sleep_duration':
            healthData.sleep.duration_minutes = parseInt(value);
            healthData.sleep.duration_hours = Math.round((parseInt(value) / 60) * 10) / 10;
            break;
          case 'sleep_efficiency':
            healthData.sleep.efficiency = parseFloat(value);
            break;
          case 'sleep_start_time':
            healthData.sleep.bedtime = value;
            break;
          case 'sleep_end_time':
            healthData.sleep.wake_time = value;
            break;
          case 'sleep_regularity':
            healthData.sleep.regularity = parseFloat(value);
            break;
          case 'sleep_debt':
            healthData.sleep.debt_hours = parseFloat(value);
            break;
        }
      } else if (category === 'activity') {
        switch (type) {
          case 'steps':
            healthData.activity.steps = parseInt(value);
            break;
          case 'active_energy_burned':
            healthData.activity.calories_active = parseInt(value);
            break;
          case 'active_duration':
            healthData.activity.active_minutes = parseInt(value);
            break;
          case 'activity_sedentary_duration':
            healthData.activity.sedentary_minutes = parseInt(value);
            break;
          case 'active_hours':
            healthData.activity.active_hours = parseInt(value);
            break;
        }
      }
    });

    // Calculate derived metrics for Smart Reminder System
    return this.calculateSmartMetrics(healthData);
  }

  calculateSmartMetrics(healthData) {
    // Calculate sleep quality score (0-100)
    let sleepScore = 70; // Default
    if (healthData.sleep.duration_hours) {
      const duration = healthData.sleep.duration_hours;
      const idealDuration = 8;
      const durationScore = Math.max(0, 100 - Math.abs(duration - idealDuration) * 10);
      sleepScore = Math.round(durationScore);
    }
    
    if (healthData.sleep.efficiency) {
      sleepScore = Math.round((sleepScore + healthData.sleep.efficiency * 100) / 2);
    }

    // Calculate activity score (0-100)
    let activityScore = 50; // Default
    if (healthData.activity.steps) {
      const steps = healthData.activity.steps;
      const stepScore = Math.min(100, (steps / 10000) * 100);
      activityScore = Math.round(stepScore);
    }

    // Calculate readiness score based on sleep and activity balance
    const readinessScore = Math.round((sleepScore + activityScore) / 2);

    // Determine workout recommendation
    let workoutRecommendation = 'moderate';
    if (readinessScore > 80) {
      workoutRecommendation = 'high_intensity';
    } else if (readinessScore < 60) {
      workoutRecommendation = 'light';
    }

    // Calculate hydration need (1-5 scale)
    let hydrationNeed = 3;
    if (healthData.activity.active_minutes > 120) {
      hydrationNeed = 5;
    } else if (healthData.activity.active_minutes > 60) {
      hydrationNeed = 4;
    } else if (healthData.activity.active_minutes < 30) {
      hydrationNeed = 2;
    }

    const result = {
      ...healthData,
      scores: {
        sleep_quality: sleepScore,
        readiness_score: readinessScore,
        activity_level: activityScore,
        hydration_need: hydrationNeed
      },
      recommendations: {
        workout_recommendation: workoutRecommendation,
        sleep_quality_category: sleepScore > 85 ? 'excellent' : 
                                sleepScore > 70 ? 'good' : 
                                sleepScore > 50 ? 'fair' : 'poor'
      }
    };

    return result;
  }
}

module.exports = SahhaAccountClient;