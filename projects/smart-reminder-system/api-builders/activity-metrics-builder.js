// Activity Metrics Focused API Builder
// Generates optimized API calls for activity and fitness data

class ActivityMetricsBuilder {
    constructor(accountToken) {
        this.baseURL = 'https://sandbox-api.sahha.ai';
        this.accountToken = accountToken;
        this.profileId = 'SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28'; // Default sample
    }

    // Daily Activity Summary - Core metrics for workout recommendations
    buildDailyActivityAPI(profileId = null, startDate = '2025-07-05', endDate = '2025-07-11') {
        const profile = profileId || this.profileId;
        const activityTypes = [
            'steps',
            'active_duration',
            'active_energy_burned',
            'total_energy_burned',
            'activity_sedentary_duration',
            'active_hours'
        ];

        return {
            url: this.buildURL(profile, startDate, endDate, ['activity'], activityTypes),
            curl: this.buildCURL(profile, startDate, endDate, ['activity'], activityTypes),
            fetch: this.buildFetch(profile, startDate, endDate, ['activity'], activityTypes),
            description: 'Daily activity summary for workout recommendations',
            metrics: activityTypes,
            useCase: 'Workout planning, daily activity tracking, readiness scoring'
        };
    }

    // Exercise Intensity Analysis - Detailed workout breakdown
    buildIntensityAnalysisAPI(profileId = null, startDate = '2025-07-05', endDate = '2025-07-11') {
        const profile = profileId || this.profileId;
        const intensityTypes = [
            'activity_low_intensity_duration',
            'activity_medium_intensity_duration', 
            'activity_high_intensity_duration',
            'activity_sedentary_duration',
            'floors_climbed'
        ];

        return {
            url: this.buildURL(profile, startDate, endDate, ['activity'], intensityTypes),
            curl: this.buildCURL(profile, startDate, endDate, ['activity'], intensityTypes),
            fetch: this.buildFetch(profile, startDate, endDate, ['activity'], intensityTypes),
            description: 'Exercise intensity breakdown for personalized training zones',
            metrics: intensityTypes,
            useCase: 'Training zone optimization, recovery planning, intensity balancing'
        };
    }

    // Movement Patterns - For sedentary behavior alerts
    buildMovementPatternsAPI(profileId = null, startDate = '2025-07-05', endDate = '2025-07-11') {
        const profile = profileId || this.profileId;
        const movementTypes = [
            'steps',
            'activity_sedentary_duration',
            'active_hours',
            'floors_climbed'
        ];

        return {
            url: this.buildURL(profile, startDate, endDate, ['activity'], movementTypes),
            curl: this.buildCURL(profile, startDate, endDate, ['activity'], movementTypes),
            fetch: this.buildFetch(profile, startDate, endDate, ['activity'], movementTypes),
            description: 'Movement pattern analysis for sedentary behavior alerts',
            metrics: movementTypes,
            useCase: 'Sitting reminders, movement encouragement, desk worker health'
        };
    }

    // Calorie Tracking - For nutrition planning
    buildCalorieTrackingAPI(profileId = null, startDate = '2025-07-05', endDate = '2025-07-11') {
        const profile = profileId || this.profileId;
        const calorieTypes = [
            'active_energy_burned',
            'total_energy_burned',
            'resting_energy_burned'
        ];

        return {
            url: this.buildURL(profile, startDate, endDate, ['activity', 'body'], calorieTypes),
            curl: this.buildCURL(profile, startDate, endDate, ['activity', 'body'], calorieTypes),
            fetch: this.buildFetch(profile, startDate, endDate, ['activity', 'body'], calorieTypes),
            description: 'Calorie expenditure tracking for nutrition planning',
            metrics: calorieTypes,
            useCase: 'Meal planning, calorie deficit/surplus tracking, metabolic analysis'
        };
    }

    // Fitness Readiness - For workout intensity recommendations
    buildFitnessReadinessAPI(profileId = null, startDate = '2025-07-05', endDate = '2025-07-11') {
        const profile = profileId || this.profileId;
        const readinessTypes = [
            'steps',
            'active_duration',
            'activity_high_intensity_duration',
            'active_energy_burned'
        ];

        return {
            url: this.buildURL(profile, startDate, endDate, ['activity'], readinessTypes),
            curl: this.buildCURL(profile, startDate, endDate, ['activity'], readinessTypes),
            fetch: this.buildFetch(profile, startDate, endDate, ['activity'], readinessTypes),
            description: 'Fitness readiness assessment for workout intensity recommendations',
            metrics: readinessTypes,
            useCase: 'Workout intensity suggestions, overtraining prevention, recovery tracking'
        };
    }

    // Quick Activity Check - Minimal API for simple step tracking
    buildQuickActivityCheckAPI(profileId = null, days = 1) {
        const profile = profileId || this.profileId;
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        
        const quickTypes = [
            'steps',
            'active_duration',
            'active_energy_burned'
        ];

        return {
            url: this.buildURL(profile, startDate, endDate, ['activity'], quickTypes),
            curl: this.buildCURL(profile, startDate, endDate, ['activity'], quickTypes),
            fetch: this.buildFetch(profile, startDate, endDate, ['activity'], quickTypes),
            description: 'Essential activity metrics for simple fitness tracking',
            metrics: quickTypes,
            useCase: 'Lightweight fitness apps, daily step goals, basic activity tracking'
        };
    }

    // Helper methods
    buildURL(profileId, startDate, endDate, categories, types) {
        let url = `${this.baseURL}/api/v1/profile/biomarker/${profileId}?startDateTime=${startDate}&endDateTime=${endDate}`;
        
        categories.forEach(category => {
            url += `&categories=${category}`;
        });

        types.forEach(type => {
            url += `&types=${type}`;
        });

        return url;
    }

    buildCURL(profileId, startDate, endDate, categories, types) {
        const url = this.buildURL(profileId, startDate, endDate, categories, types);
        return `curl -H "Authorization: account ${this.accountToken}" "${url}"`;
    }

    buildFetch(profileId, startDate, endDate, categories, types) {
        const url = this.buildURL(profileId, startDate, endDate, categories, types);
        return `fetch('${url}', {
  method: 'GET',
  headers: {
    'Authorization': 'account ${this.accountToken}'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
    }

    // Generate all activity APIs
    generateAllActivityAPIs(profileId = null) {
        return {
            dailyActivity: this.buildDailyActivityAPI(profileId),
            intensityAnalysis: this.buildIntensityAnalysisAPI(profileId),
            movementPatterns: this.buildMovementPatternsAPI(profileId),
            calorieTracking: this.buildCalorieTrackingAPI(profileId),
            fitnessReadiness: this.buildFitnessReadinessAPI(profileId),
            quickCheck: this.buildQuickActivityCheckAPI(profileId)
        };
    }

    // Process activity data for Smart Reminder System
    processActivityData(biomarkerData) {
        const activityMetrics = {};
        
        biomarkerData.forEach(marker => {
            if (marker.category === 'activity') {
                switch (marker.type) {
                    case 'steps':
                        activityMetrics.steps = parseInt(marker.value);
                        break;
                    case 'active_duration':
                        activityMetrics.active_minutes = parseInt(marker.value);
                        break;
                    case 'active_energy_burned':
                        activityMetrics.calories_active = parseInt(marker.value);
                        break;
                    case 'total_energy_burned':
                        activityMetrics.calories_total = parseInt(marker.value);
                        break;
                    case 'activity_sedentary_duration':
                        activityMetrics.sedentary_minutes = parseInt(marker.value);
                        break;
                    case 'active_hours':
                        activityMetrics.active_hours = parseInt(marker.value);
                        break;
                    case 'activity_high_intensity_duration':
                        activityMetrics.high_intensity_minutes = parseInt(marker.value);
                        break;
                }
            }
        });

        // Calculate activity score (0-100)
        let activityScore = 50; // Default
        if (activityMetrics.steps) {
            const stepScore = Math.min(100, (activityMetrics.steps / 10000) * 100);
            activityScore = Math.round(stepScore);
        }

        // Calculate readiness score based on recent activity
        let readinessScore = activityScore;
        if (activityMetrics.high_intensity_minutes > 60) {
            readinessScore = Math.max(30, readinessScore - 20); // High intensity requires recovery
        }

        activityMetrics.activity_score = activityScore;
        activityMetrics.readiness_score = readinessScore;
        
        // Workout recommendations
        if (readinessScore > 80) {
            activityMetrics.workout_recommendation = 'high_intensity';
            activityMetrics.suggested_activities = ['HIIT', 'Strength training', 'Running'];
        } else if (readinessScore > 60) {
            activityMetrics.workout_recommendation = 'moderate';
            activityMetrics.suggested_activities = ['Brisk walking', 'Swimming', 'Yoga'];
        } else {
            activityMetrics.workout_recommendation = 'light';
            activityMetrics.suggested_activities = ['Gentle walking', 'Stretching', 'Rest day'];
        }

        return activityMetrics;
    }
}

// Example usage and testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivityMetricsBuilder;
} else {
    // Browser environment
    window.ActivityMetricsBuilder = ActivityMetricsBuilder;
}