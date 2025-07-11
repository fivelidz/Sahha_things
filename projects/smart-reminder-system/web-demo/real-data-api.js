// Real Sahha Data API Integration for Web Demo
// This creates a simple API endpoint that can be called from the web demo

class RealSahhaAPI {
    constructor() {
        this.baseURL = 'https://sandbox-api.sahha.ai';
        this.accountToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2FwaS5zYWhoYS5haS9jbGFpbXMvYWNjb3VudElkIjoiZmU3ZTkyMDAtNGEzYS00MmQwLWIxMWEtZjIwYzAxYTZiOTBiIiwiaHR0cHM6Ly9hcGkuc2FoaGEuYWkvY2xhaW1zL2FkbWluIjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9hY2NvdW50IjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9zYWhoYUFwaVNjb3BlIjoic2FuZGJveCIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9yZWdpb24iOiJVUyIsImV4cCI6MTc1NDI1NjAzMiwiaXNzIjoiaHR0cHM6Ly9zYWhoYS1wcm9kdWN0aW9uLmF1LmF1dGgwLmNvbS8iLCJhdWQiOiJodHRwczovL3NhaGhhLXByb2R1Y3Rpb24uYXUuYXV0aDAuY29tL2FwaS92Mi8ifQ.IGsV0msiqUiDz1tnPpbbF7Iqt0MofpACjvOslUT7N-k';
        this.sampleProfileId = 'SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28';
    }

    async getBiomarkers(startDate = '2025-07-05', endDate = '2025-07-11') {
        try {
            const url = `${this.baseURL}/api/v1/profile/biomarker/${this.sampleProfileId}?startDateTime=${startDate}&endDateTime=${endDate}&categories=sleep&categories=activity&types=sleep_duration&types=sleep_start_time&types=sleep_end_time&types=steps&types=active_energy_burned&types=active_duration&types=activity_sedentary_duration`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `account ${this.accountToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching real biomarkers:', error);
            // Fallback to mock data if API fails
            return this.getMockData();
        }
    }

    processHealthData(biomarkers) {
        const healthData = {
            sleep: {},
            activity: {},
            trends: {}
        };

        if (!biomarkers || biomarkers.length === 0) {
            return this.getMockData();
        }

        // Get the most recent data for each metric
        const latestData = {};
        biomarkers.forEach(marker => {
            const { category, type, value, startDateTime } = marker;
            const key = `${category}_${type}`;
            
            if (!latestData[key] || new Date(startDateTime) > new Date(latestData[key].startDateTime)) {
                latestData[key] = marker;
            }
        });

        // Process sleep data
        Object.values(latestData).forEach(marker => {
            const { category, type, value } = marker;
            
            if (category === 'sleep') {
                switch (type) {
                    case 'sleep_duration':
                        healthData.sleep.duration_minutes = parseInt(value);
                        healthData.sleep.duration_hours = Math.round((parseInt(value) / 60) * 10) / 10;
                        break;
                    case 'sleep_start_time':
                        healthData.sleep.bedtime = value;
                        break;
                    case 'sleep_end_time':
                        healthData.sleep.wake_time = value;
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
                }
            }
        });

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

        // Calculate activity score (0-100)
        let activityScore = 50; // Default
        if (healthData.activity.steps) {
            const steps = healthData.activity.steps;
            const stepScore = Math.min(100, (steps / 10000) * 100);
            activityScore = Math.round(stepScore);
        }

        // Calculate readiness score
        const readinessScore = Math.round((sleepScore + activityScore) / 2);

        // Determine workout recommendation
        let workoutRecommendation = 'moderate';
        if (readinessScore > 80) {
            workoutRecommendation = 'high_intensity';
        } else if (readinessScore < 60) {
            workoutRecommendation = 'light';
        }

        // Calculate hydration need
        let hydrationNeed = 3;
        if (healthData.activity.active_minutes > 120) {
            hydrationNeed = 5;
        } else if (healthData.activity.active_minutes > 60) {
            hydrationNeed = 4;
        } else if (healthData.activity.active_minutes < 30) {
            hydrationNeed = 2;
        }

        // Generate trends (simplified for demo)
        const trends = {
            sleep_trend: sleepScore > 75 ? 'improving' : sleepScore > 60 ? 'stable' : 'declining',
            readiness_trend: readinessScore > 75 ? 'improving' : readinessScore > 60 ? 'stable' : 'declining',
            activity_trend: activityScore > 75 ? 'improving' : activityScore > 60 ? 'stable' : 'declining',
            hydration_trend: hydrationNeed > 3 ? 'needs_attention' : 'stable'
        };

        return {
            today: {
                sleep_quality: sleepScore,
                readiness_score: readinessScore,
                activity_level: activityScore,
                hydration_need: hydrationNeed,
                workout_recommendation: workoutRecommendation
            },
            trends,
            raw_data: healthData,
            data_source: 'real_sahha_api',
            timestamp: new Date().toISOString()
        };
    }

    getMockData() {
        // Fallback mock data if API fails
        return {
            today: {
                sleep_quality: 75,
                readiness_score: 68,
                activity_level: 45,
                hydration_need: 3,
                workout_recommendation: 'moderate'
            },
            trends: {
                sleep_trend: 'stable',
                readiness_trend: 'improving',
                activity_trend: 'stable',
                hydration_trend: 'stable'
            },
            raw_data: {
                sleep: { duration_hours: 7.5 },
                activity: { steps: 4500, active_minutes: 45 }
            },
            data_source: 'mock_fallback',
            timestamp: new Date().toISOString()
        };
    }

    async getHealthData() {
        const biomarkers = await this.getBiomarkers();
        return this.processHealthData(biomarkers);
    }
}

// Make it available globally for the web demo
window.RealSahhaAPI = RealSahhaAPI;