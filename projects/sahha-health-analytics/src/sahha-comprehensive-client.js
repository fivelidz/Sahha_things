// Comprehensive Sahha API Client for Health Analytics
// Explores all Sahha API capabilities for GEO research foundation

const axios = require('axios');

class SahhaComprehensiveClient {
    constructor() {
        this.baseURL = 'https://sandbox-api.sahha.ai';
        // Using updated sandbox token
        this.accountToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2FwaS5zYWhoYS5haS9jbGFpbXMvYWNjb3VudElkIjoiZmU3ZTkyMDAtNGEzYS00MmQwLWIxMWEtZjIwYzAxYTZiOTBiIiwiaHR0cHM6Ly9hcGkuc2FoaGEuYWkvY2xhaW1zL2FkbWluIjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9hY2NvdW50IjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9zYWhoYUFwaVNjb3BlIjoic2FuZGJveCIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9yZWdpb24iOiJVUyIsImV4cCI6MTc1NDMyNzc2MywiaXNzIjoiaHR0cHM6Ly9zYWhoYS1wcm9kdWN0aW9uLmF1LmF1dGgwLmNvbS8iLCJhdWQiOiJodHRwczovL3NhaGhhLXByb2R1Y3Rpb24uYXUuYXV0aDAuY29tL2FwaS92Mi8ifQ.TR22_Aclj_3RTyZrz7GL2y4HDv-ePmMc37hcVdplwnQ';
        
        this.profileId = 'SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28';
        this.apiCategories = [
            'demographic',
            'deviceInformation', 
            'biomarker',
            'archetype',
            'insight',
            'score'
        ];
    }

    // Generic API call method with error handling
    async makeApiCall(endpoint, params = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: {
                    'Authorization': `account ${this.accountToken}`,
                    'Content-Type': 'application/json'
                }
            };

            if (Object.keys(params).length > 0) {
                config.params = params;
            }

            console.log(`🔄 Calling: ${url}`);
            const response = await axios.get(url, config);
            console.log(`✅ Success: ${response.status}`);
            return {
                success: true,
                data: response.data,
                status: response.status,
                endpoint: endpoint
            };
        } catch (error) {
            console.log(`❌ Error: ${error.response?.status} - ${endpoint}`);
            return {
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status,
                endpoint: endpoint
            };
        }
    }

    // 1. DEMOGRAPHIC DATA
    async getDemographic() {
        return await this.makeApiCall(`/api/v1/profile/demographic/${this.profileId}`);
    }

    // 2. DEVICE INFORMATION
    async getDeviceInformation() {
        return await this.makeApiCall(`/api/v1/profile/deviceInformation/${this.profileId}`);
    }

    // 3. BIOMARKER DATA (comprehensive)
    async getBiomarkers(startDate = null, endDate = null, categories = null, types = null) {
        const today = new Date().toISOString().split('T')[0];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Build URL manually to handle multiple categories/types properly
        let url = `/api/v1/profile/biomarker/${this.profileId}?startDateTime=${startDate || sevenDaysAgo}&endDateTime=${endDate || today}`;
        
        if (categories) {
            if (Array.isArray(categories)) {
                categories.forEach(cat => url += `&categories=${cat}`);
            } else {
                url += `&categories=${categories}`;
            }
        }

        if (types) {
            if (Array.isArray(types)) {
                types.forEach(type => url += `&types=${type}`);
            } else {
                url += `&types=${types}`;
            }
        }

        try {
            console.log(`🔄 Calling: ${this.baseURL}${url}`);
            const response = await axios.get(`${this.baseURL}${url}`, {
                headers: {
                    'Authorization': `account ${this.accountToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`✅ Success: ${response.status}`);
            return {
                success: true,
                data: response.data,
                status: response.status,
                endpoint: url
            };
        } catch (error) {
            console.log(`❌ Error: ${error.response?.status} - ${url}`);
            return {
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status,
                endpoint: url
            };
        }
    }

    // 4. ARCHETYPE DATA
    async getArchetypes(name = null, periodicity = null, startDate = null, endDate = null) {
        const params = {};
        
        if (name) params.name = name;
        if (periodicity) params.periodicity = periodicity;
        if (startDate) params.startDateTime = startDate;
        if (endDate) params.endDateTime = endDate;

        return await this.makeApiCall(`/api/v1/profile/archetypes/${this.profileId}`, params);
    }

    // 5. INSIGHT DATA
    async getInsights(startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.startDateTime = startDate;
        if (endDate) params.endDateTime = endDate;

        return await this.makeApiCall(`/api/v1/profile/insight/${this.profileId}`, params);
    }

    // 6. SCORE DATA
    async getScores(startDate = null, endDate = null, types = null) {
        const params = {};
        if (startDate) params.startDateTime = startDate;
        if (endDate) params.endDateTime = endDate;
        if (types) params.types = types;

        return await this.makeApiCall(`/api/v1/profile/score/${this.profileId}`, params);
    }

    // COMPREHENSIVE DATA COLLECTION
    async getAllHealthData() {
        console.log('🔍 COMPREHENSIVE SAHHA HEALTH DATA COLLECTION');
        console.log('='.repeat(60));

        const results = {
            timestamp: new Date().toISOString(),
            profileId: this.profileId,
            data: {},
            summary: {
                successful: 0,
                failed: 0,
                categories: []
            }
        };

        // 1. Basic Profile Data
        console.log('\n📋 COLLECTING PROFILE DATA');
        results.data.demographic = await this.getDemographic();
        results.data.deviceInformation = await this.getDeviceInformation();

        // 2. Biomarker Data (different categories)
        console.log('\n🧬 COLLECTING BIOMARKER DATA');
        results.data.biomarkers = {
            all: await this.getBiomarkers(),
            sleep: await this.getBiomarkers(null, null, ['sleep']),
            activity: await this.getBiomarkers(null, null, ['activity']),
            body: await this.getBiomarkers(null, null, ['body']),
            device: await this.getBiomarkers(null, null, ['device'])
        };

        // 3. Archetype Data (different types)
        console.log('\n🎯 COLLECTING ARCHETYPE DATA');
        const archetypeTypes = [
            'bed_schedule',
            'activity_pattern', 
            'sleep_pattern',
            'wellness_pattern'
        ];

        results.data.archetypes = {};
        for (const type of archetypeTypes) {
            results.data.archetypes[type] = await this.getArchetypes(type, 'weekly');
        }

        // 4. Insights and Scores
        console.log('\n💡 COLLECTING INSIGHTS AND SCORES');
        results.data.insights = await this.getInsights();
        results.data.scores = await this.getScores();

        // Calculate summary
        const allRequests = this.flattenResults(results.data);
        results.summary.successful = allRequests.filter(r => r.success).length;
        results.summary.failed = allRequests.filter(r => !r.success).length;
        results.summary.categories = Object.keys(results.data);

        console.log('\n📊 COLLECTION SUMMARY');
        console.log(`✅ Successful: ${results.summary.successful}`);
        console.log(`❌ Failed: ${results.summary.failed}`);
        console.log(`📁 Categories: ${results.summary.categories.join(', ')}`);

        return results;
    }

    // Helper method to flatten nested results
    flattenResults(data, results = []) {
        for (const [key, value] of Object.entries(data)) {
            if (value && typeof value === 'object') {
                if (value.success !== undefined) {
                    results.push(value);
                } else {
                    this.flattenResults(value, results);
                }
            }
        }
        return results;
    }

    // BIOMARKER ANALYSIS
    async analyzeBiomarkerStructure() {
        console.log('🔬 BIOMARKER STRUCTURE ANALYSIS');
        console.log('='.repeat(50));

        const biomarkerData = await this.getBiomarkers();
        
        if (!biomarkerData.success) {
            console.log('❌ Failed to get biomarker data');
            return null;
        }

        const analysis = {
            totalBiomarkers: biomarkerData.data.length,
            categories: {},
            types: {},
            periodicities: {},
            aggregations: {},
            units: {},
            valueTypes: {},
            sampleData: biomarkerData.data.slice(0, 5)
        };

        // Analyze structure
        biomarkerData.data.forEach(marker => {
            // Categories
            analysis.categories[marker.category] = (analysis.categories[marker.category] || 0) + 1;
            
            // Types
            analysis.types[marker.type] = (analysis.types[marker.type] || 0) + 1;
            
            // Periodicities
            analysis.periodicities[marker.periodicity] = (analysis.periodicities[marker.periodicity] || 0) + 1;
            
            // Aggregations
            analysis.aggregations[marker.aggregation] = (analysis.aggregations[marker.aggregation] || 0) + 1;
            
            // Units
            analysis.units[marker.unit] = (analysis.units[marker.unit] || 0) + 1;
            
            // Value Types
            analysis.valueTypes[marker.valueType] = (analysis.valueTypes[marker.valueType] || 0) + 1;
        });

        console.log(`📊 Total Biomarkers: ${analysis.totalBiomarkers}`);
        console.log(`📁 Categories: ${Object.keys(analysis.categories).join(', ')}`);
        console.log(`🏷️ Types: ${Object.keys(analysis.types).length} different types`);
        console.log(`⏱️ Periodicities: ${Object.keys(analysis.periodicities).join(', ')}`);

        return analysis;
    }

    // ARCHETYPE EXPLORATION
    async exploreArchetypes() {
        console.log('🎯 ARCHETYPE EXPLORATION');
        console.log('='.repeat(40));

        const commonArchetypes = [
            'bed_schedule',
            'activity_pattern',
            'sleep_pattern', 
            'wellness_pattern',
            'mood_pattern',
            'energy_pattern'
        ];

        const results = {};
        
        for (const archetype of commonArchetypes) {
            console.log(`\n🔍 Testing archetype: ${archetype}`);
            results[archetype] = await this.getArchetypes(archetype, 'weekly');
        }

        return results;
    }

    // API CAPABILITIES DISCOVERY
    async discoverApiCapabilities() {
        console.log('🚀 SAHHA API CAPABILITIES DISCOVERY');
        console.log('='.repeat(60));

        const capabilities = {
            timestamp: new Date().toISOString(),
            endpoints: {
                profile: {},
                biomarkers: {},
                archetypes: {},
                insights: {},
                scores: {}
            },
            dataStructures: {},
            performance: {},
            relationships: {}
        };

        // Test all major endpoints
        console.log('\n1️⃣ TESTING PROFILE ENDPOINTS');
        capabilities.endpoints.profile.demographic = await this.getDemographic();
        capabilities.endpoints.profile.deviceInfo = await this.getDeviceInformation();

        console.log('\n2️⃣ ANALYZING BIOMARKER STRUCTURE');
        capabilities.dataStructures.biomarkers = await this.analyzeBiomarkerStructure();

        console.log('\n3️⃣ EXPLORING ARCHETYPES');
        capabilities.endpoints.archetypes = await this.exploreArchetypes();

        console.log('\n4️⃣ TESTING INSIGHTS AND SCORES');
        capabilities.endpoints.insights = await this.getInsights();
        capabilities.endpoints.scores = await this.getScores();

        return capabilities;
    }
}

module.exports = SahhaComprehensiveClient;