// Sleep Metrics Focused API Builder
// Generates optimized API calls for sleep-related health data

class SleepMetricsBuilder {
    constructor(accountToken) {
        this.baseURL = 'https://sandbox-api.sahha.ai';
        this.accountToken = accountToken;
        this.profileId = 'SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28'; // Default sample
    }

    // Sleep Quality Analysis - Core metrics for morning checkups
    buildSleepQualityAPI(profileId = null, startDate = '2025-07-05', endDate = '2025-07-11') {
        const profile = profileId || this.profileId;
        const sleepTypes = [
            'sleep_duration',
            'sleep_start_time', 
            'sleep_end_time',
            'sleep_efficiency',
            'sleep_debt',
            'sleep_regularity',
            'sleep_interruptions',
            'sleep_latency'
        ];

        return {
            url: this.buildURL(profile, startDate, endDate, ['sleep'], sleepTypes),
            curl: this.buildCURL(profile, startDate, endDate, ['sleep'], sleepTypes),
            fetch: this.buildFetch(profile, startDate, endDate, ['sleep'], sleepTypes),
            description: 'Comprehensive sleep quality metrics for morning health checkups',
            metrics: sleepTypes,
            useCase: 'Morning notification system, sleep quality scoring'
        };
    }

    // Sleep Stages - Detailed sleep analysis
    buildSleepStagesAPI(profileId = null, startDate = '2025-07-05', endDate = '2025-07-11') {
        const profile = profileId || this.profileId;
        const stageTypes = [
            'sleep_deep_duration',
            'sleep_rem_duration', 
            'sleep_light_duration',
            'sleep_awake_duration',
            'sleep_in_bed_duration'
        ];

        return {
            url: this.buildURL(profile, startDate, endDate, ['sleep'], stageTypes),
            curl: this.buildCURL(profile, startDate, endDate, ['sleep'], stageTypes),
            fetch: this.buildFetch(profile, startDate, endDate, ['sleep'], stageTypes),
            description: 'Detailed sleep stage breakdown for advanced sleep analysis',
            metrics: stageTypes,
            useCase: 'Sleep optimization recommendations, recovery tracking'
        };
    }

    // Sleep Trends - Weekly patterns
    buildSleepTrendsAPI(profileId = null, weeks = 4) {
        const profile = profileId || this.profileId;
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - (weeks * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        
        const trendTypes = [
            'sleep_duration',
            'sleep_regularity',
            'sleep_debt',
            'sleep_efficiency'
        ];

        return {
            url: this.buildURL(profile, startDate, endDate, ['sleep'], trendTypes),
            curl: this.buildCURL(profile, startDate, endDate, ['sleep'], trendTypes),
            fetch: this.buildFetch(profile, startDate, endDate, ['sleep'], trendTypes),
            description: `Sleep pattern analysis over ${weeks} weeks`,
            metrics: trendTypes,
            useCase: 'Long-term sleep improvement tracking, pattern recognition'
        };
    }

    // Quick Sleep Check - Minimal API for simple apps
    buildQuickSleepCheckAPI(profileId = null, days = 1) {
        const profile = profileId || this.profileId;
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        
        const quickTypes = [
            'sleep_duration',
            'sleep_start_time',
            'sleep_end_time'
        ];

        return {
            url: this.buildURL(profile, startDate, endDate, ['sleep'], quickTypes),
            curl: this.buildCURL(profile, startDate, endDate, ['sleep'], quickTypes),
            fetch: this.buildFetch(profile, startDate, endDate, ['sleep'], quickTypes),
            description: 'Essential sleep metrics for simple morning notifications',
            metrics: quickTypes,
            useCase: 'Lightweight apps, quick health checks'
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

    // Generate all sleep APIs
    generateAllSleepAPIs(profileId = null) {
        return {
            sleepQuality: this.buildSleepQualityAPI(profileId),
            sleepStages: this.buildSleepStagesAPI(profileId),
            sleepTrends: this.buildSleepTrendsAPI(profileId),
            quickCheck: this.buildQuickSleepCheckAPI(profileId)
        };
    }

    // Process sleep data for Smart Reminder System
    processSleepData(biomarkerData) {
        const sleepMetrics = {};
        
        biomarkerData.forEach(marker => {
            if (marker.category === 'sleep') {
                switch (marker.type) {
                    case 'sleep_duration':
                        sleepMetrics.duration_minutes = parseInt(marker.value);
                        sleepMetrics.duration_hours = Math.round((parseInt(marker.value) / 60) * 10) / 10;
                        break;
                    case 'sleep_efficiency':
                        sleepMetrics.efficiency_percent = parseFloat(marker.value) * 100;
                        break;
                    case 'sleep_debt':
                        sleepMetrics.debt_hours = parseFloat(marker.value);
                        break;
                    case 'sleep_regularity':
                        sleepMetrics.regularity_percent = parseFloat(marker.value) * 100;
                        break;
                    case 'sleep_start_time':
                        sleepMetrics.bedtime = new Date(marker.value).toLocaleTimeString();
                        break;
                    case 'sleep_end_time':
                        sleepMetrics.wake_time = new Date(marker.value).toLocaleTimeString();
                        break;
                }
            }
        });

        // Calculate sleep quality score (0-100)
        let sleepScore = 70; // Default
        if (sleepMetrics.duration_hours) {
            const duration = sleepMetrics.duration_hours;
            const idealDuration = 8;
            const durationScore = Math.max(0, 100 - Math.abs(duration - idealDuration) * 10);
            sleepScore = Math.round(durationScore);
        }

        if (sleepMetrics.efficiency_percent) {
            sleepScore = Math.round((sleepScore + sleepMetrics.efficiency_percent) / 2);
        }

        sleepMetrics.quality_score = sleepScore;
        sleepMetrics.quality_category = sleepScore > 85 ? 'excellent' : 
                                      sleepScore > 70 ? 'good' : 
                                      sleepScore > 50 ? 'fair' : 'poor';

        return sleepMetrics;
    }
}

// Example usage and testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SleepMetricsBuilder;
} else {
    // Browser environment
    window.SleepMetricsBuilder = SleepMetricsBuilder;
}