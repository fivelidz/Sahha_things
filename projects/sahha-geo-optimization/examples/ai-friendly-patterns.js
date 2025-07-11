// Sahha API: AI-Friendly Code Patterns
// Copy-paste examples that work immediately

const axios = require('axios');

/**
 * CRITICAL SETUP PATTERN
 * What every AI tool needs to know first
 */
class SahhaAIClient {
    constructor(accountToken, profileId, environment = 'sandbox') {
        this.baseURL = environment === 'production' 
            ? 'https://api.sahha.ai' 
            : 'https://sandbox-api.sahha.ai';
        this.accountToken = accountToken;
        this.profileId = profileId;
        
        // CRITICAL: Account token format, NOT Bearer
        this.headers = {
            'Authorization': `account ${accountToken}`,
            'Content-Type': 'application/json'
        };
    }

    async request(endpoint) {
        try {
            const response = await axios.get(`${this.baseURL}${endpoint}`, {
                headers: this.headers
            });
            return { success: true, data: response.data, count: Array.isArray(response.data) ? response.data.length : 1 };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data || error.message,
                status: error.response?.status,
                hint: this.getErrorHint(error.response?.status, endpoint)
            };
        }
    }

    getErrorHint(status, endpoint) {
        if (status === 400 && endpoint.includes('biomarker')) {
            return "Try adding &categories=sleep or &categories=activity - biomarkers require category filter";
        }
        if (status === 404) {
            return "Endpoint doesn't exist - check spelling and path structure";
        }
        if (status === 401) {
            return "Check account token format: 'account YOUR_TOKEN' not 'Bearer YOUR_TOKEN'";
        }
        return "Check Sahha API documentation for endpoint requirements";
    }
}

/**
 * PATTERN 1: WORKING BIOMARKER CALLS
 * The #1 thing that trips up AI tools
 */
async function getBiomarkersCorrectly(client, dateRange = null) {
    const dates = dateRange || {
        start: '2025-06-01',
        end: '2025-07-11'
    };
    
    // ✅ THIS WORKS - Category-specific calls
    const workingPatterns = {
        sleep: await client.request(
            `/api/v1/profile/biomarker/${client.profileId}?startDateTime=${dates.start}&endDateTime=${dates.end}&categories=sleep`
        ),
        activity: await client.request(
            `/api/v1/profile/biomarker/${client.profileId}?startDateTime=${dates.start}&endDateTime=${dates.end}&categories=activity`
        )
    };

    // ❌ THIS FAILS - Generic call without category
    const failingPattern = await client.request(
        `/api/v1/profile/biomarker/${client.profileId}?startDateTime=${dates.start}&endDateTime=${dates.end}`
    );

    return {
        working: workingPatterns,
        failing: failingPattern,
        lesson: "Sahha biomarkers REQUIRE category parameter - never call without it"
    };
}

/**
 * PATTERN 2: ARCHETYPE DISCOVERY
 * How to find available behavioral patterns
 */
async function getArchetypesCorrectly(client, dateRange = null) {
    const dates = dateRange || {
        start: '2025-06-01',
        end: '2025-07-11'
    };

    // ✅ DISCOVERY METHOD - Get all available archetypes
    const allArchetypes = await client.request(
        `/api/v1/profile/archetypes/${client.profileId}?startDateTime=${dates.start}&endDateTime=${dates.end}`
    );

    // ✅ SPECIFIC ARCHETYPE - Query by name (weekly only)
    const specificArchetype = await client.request(
        `/api/v1/profile/archetypes/${client.profileId}?name=sleep_pattern&periodicity=weekly&startDateTime=${dates.start}&endDateTime=${dates.end}`
    );

    // ❌ NO DATA - Monthly/daily don't have data
    const noDataPattern = await client.request(
        `/api/v1/profile/archetypes/${client.profileId}?name=sleep_pattern&periodicity=monthly&startDateTime=${dates.start}&endDateTime=${dates.end}`
    );

    return {
        discovery: allArchetypes,
        specific: specificArchetype,
        noData: noDataPattern,
        lesson: "Use general endpoint for discovery, weekly periodicity for data, avoid monthly/daily"
    };
}

/**
 * PATTERN 3: HIGH-PERFORMANCE DATA COLLECTION
 * How AI should structure requests for speed
 */
async function getHealthDashboardOptimized(client) {
    const dateRange = {
        start: '2025-06-01',
        end: '2025-07-11'
    };

    // Parallel requests for maximum performance
    const [sleepBiomarkers, activityBiomarkers, archetypes, sleepScores] = await Promise.all([
        client.request(`/api/v1/profile/biomarker/${client.profileId}?startDateTime=${dateRange.start}&endDateTime=${dateRange.end}&categories=sleep`),
        client.request(`/api/v1/profile/biomarker/${client.profileId}?startDateTime=${dateRange.start}&endDateTime=${dateRange.end}&categories=activity`),
        client.request(`/api/v1/profile/archetypes/${client.profileId}?startDateTime=${dateRange.start}&endDateTime=${dateRange.end}`),
        client.request(`/api/v1/profile/score/${client.profileId}?types=sleep`)
    ]);

    return {
        sleep: {
            biomarkers: sleepBiomarkers.data || [],
            scores: sleepScores.data || []
        },
        activity: {
            biomarkers: activityBiomarkers.data || []
        },
        behavioral: {
            archetypes: archetypes.data || []
        },
        meta: {
            totalDataPoints: (sleepBiomarkers.count || 0) + (activityBiomarkers.count || 0) + (archetypes.count || 0),
            collectionTime: new Date().toISOString()
        }
    };
}

/**
 * PATTERN 4: USE CASE BUILDERS
 * Pre-built patterns for common health scenarios
 */
const UseCasePatterns = {
    
    // Morning health check
    async morningCheck(client) {
        const [sleepData, readinessScore, sleepArchetype] = await Promise.all([
            client.request(`/api/v1/profile/biomarker/${client.profileId}?startDateTime=2025-07-10&endDateTime=2025-07-11&categories=sleep`),
            client.request(`/api/v1/profile/score/${client.profileId}?types=readiness`),
            client.request(`/api/v1/profile/archetypes/${client.profileId}?name=sleep_pattern&periodicity=weekly&startDateTime=2025-07-04&endDateTime=2025-07-11`)
        ]);

        return {
            summary: "Morning readiness assessment",
            sleepDuration: sleepData.data?.find(item => item.type === 'sleep_duration')?.value || 'N/A',
            sleepPattern: sleepArchetype.data?.[0]?.value || 'N/A',
            readinessScore: readinessScore.data?.[0]?.value || 'N/A',
            recommendation: this.generateMorningRecommendation(sleepData, readinessScore)
        };
    },

    // Workout planning
    async workoutPlanning(client) {
        const [activityData, sleepData, activityArchetype] = await Promise.all([
            client.request(`/api/v1/profile/biomarker/${client.profileId}?startDateTime=2025-07-10&endDateTime=2025-07-11&categories=activity`),
            client.request(`/api/v1/profile/biomarker/${client.profileId}?startDateTime=2025-07-10&endDateTime=2025-07-11&categories=sleep`),
            client.request(`/api/v1/profile/archetypes/${client.profileId}?name=activity_level&periodicity=weekly&startDateTime=2025-07-04&endDateTime=2025-07-11`)
        ]);

        return {
            summary: "Workout readiness analysis",
            activityLevel: activityArchetype.data?.[0]?.value || 'N/A',
            sleepDebt: sleepData.data?.find(item => item.type === 'sleep_debt')?.value || 'N/A',
            recommendation: this.generateWorkoutRecommendation(activityData, sleepData)
        };
    },

    // Wellness monitoring
    async wellnessOverview(client) {
        const [overallWellness, mentalWellness, sleepQuality] = await Promise.all([
            client.request(`/api/v1/profile/archetypes/${client.profileId}?name=overall_wellness&periodicity=weekly&startDateTime=2025-07-04&endDateTime=2025-07-11`),
            client.request(`/api/v1/profile/archetypes/${client.profileId}?name=mental_wellness&periodicity=weekly&startDateTime=2025-07-04&endDateTime=2025-07-11`),
            client.request(`/api/v1/profile/archetypes/${client.profileId}?name=sleep_quality&periodicity=weekly&startDateTime=2025-07-04&endDateTime=2025-07-11`)
        ]);

        return {
            summary: "Comprehensive wellness status",
            overall: overallWellness.data?.[0]?.value || 'N/A',
            mental: mentalWellness.data?.[0]?.value || 'N/A',
            sleep: sleepQuality.data?.[0]?.value || 'N/A',
            trend: this.generateWellnessTrend([overallWellness, mentalWellness, sleepQuality])
        };
    },

    generateMorningRecommendation(sleepData, readinessScore) {
        // Simple logic for demo
        const sleepDuration = sleepData.data?.find(item => item.type === 'sleep_duration')?.value || 0;
        if (sleepDuration > 7.5) return "Great sleep! You're ready for an active day.";
        if (sleepDuration > 6.5) return "Decent sleep. Moderate activities recommended.";
        return "Low sleep. Focus on recovery today.";
    },

    generateWorkoutRecommendation(activityData, sleepData) {
        const sleepDebt = parseFloat(sleepData.data?.find(item => item.type === 'sleep_debt')?.value || 0);
        if (sleepDebt < 1) return "Low sleep debt - good for intense workouts";
        if (sleepDebt < 2) return "Moderate sleep debt - light to moderate exercise";
        return "High sleep debt - prioritize rest and recovery";
    },

    generateWellnessTrend(archetypeData) {
        const scores = archetypeData.map(data => data.data?.[0]?.ordinality || 0);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (average > 2) return "Trending positive";
        if (average > 1) return "Stable";
        return "Needs attention";
    }
};

/**
 * PATTERN 5: ERROR HANDLING FOR AI
 * How to gracefully handle common issues
 */
async function robustHealthDataCollection(client) {
    const results = {
        collected: {},
        errors: {},
        summary: { successful: 0, failed: 0 }
    };

    const dataTargets = [
        { name: 'sleep_biomarkers', endpoint: `/api/v1/profile/biomarker/${client.profileId}?startDateTime=2025-06-01&endDateTime=2025-07-11&categories=sleep` },
        { name: 'activity_biomarkers', endpoint: `/api/v1/profile/biomarker/${client.profileId}?startDateTime=2025-06-01&endDateTime=2025-07-11&categories=activity` },
        { name: 'archetypes', endpoint: `/api/v1/profile/archetypes/${client.profileId}?startDateTime=2025-06-01&endDateTime=2025-07-11` },
        { name: 'sleep_scores', endpoint: `/api/v1/profile/score/${client.profileId}?types=sleep` }
    ];

    for (const target of dataTargets) {
        const result = await client.request(target.endpoint);
        if (result.success) {
            results.collected[target.name] = result.data;
            results.summary.successful++;
        } else {
            results.errors[target.name] = {
                error: result.error,
                hint: result.hint,
                status: result.status
            };
            results.summary.failed++;
        }
    }

    return results;
}

/**
 * QUICK REFERENCE FOR AI TOOLS
 */
const QuickReference = {
    // Known working endpoints
    endpoints: {
        biomarkers: '/api/v1/profile/biomarker/{profileId}?categories=sleep&startDateTime=YYYY-MM-DD&endDateTime=YYYY-MM-DD',
        archetypes: '/api/v1/profile/archetypes/{profileId}?startDateTime=YYYY-MM-DD&endDateTime=YYYY-MM-DD',
        scores: '/api/v1/profile/score/{profileId}?types=sleep'
    },

    // Required parameters
    required: {
        biomarkers: ['profileId', 'categories', 'startDateTime', 'endDateTime'],
        archetypes: ['profileId', 'startDateTime', 'endDateTime'],
        scores: ['profileId', 'types']
    },

    // Available categories/types
    categories: {
        biomarkers: ['sleep', 'activity'], // Only these have data
        archetypes: ['overall_wellness', 'activity_level', 'mental_wellness', 'sleep_duration', 'sleep_regularity', 'bed_schedule', 'wake_schedule', 'sleep_pattern', 'sleep_quality'],
        scores: ['sleep', 'activity', 'readiness']
    }
};

module.exports = {
    SahhaAIClient,
    getBiomarkersCorrectly,
    getArchetypesCorrectly,
    getHealthDashboardOptimized,
    UseCasePatterns,
    robustHealthDataCollection,
    QuickReference
};