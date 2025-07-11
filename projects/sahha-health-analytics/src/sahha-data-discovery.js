// Comprehensive Sahha Data Discovery System
// Systematically maps all available biomarkers, archetypes, insights, and scores

const axios = require('axios');
const fs = require('fs').promises;

class SahhaDataDiscovery {
    constructor() {
        this.baseURL = 'https://sandbox-api.sahha.ai';
        this.accountToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2FwaS5zYWhoYS5haS9jbGFpbXMvYWNjb3VudElkIjoiZmU3ZTkyMDAtNGEzYS00MmQwLWIxMWEtZjIwYzAxYTZiOTBiIiwiaHR0cHM6Ly9hcGkuc2FoaGEuYWkvY2xhaW1zL2FkbWluIjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9hY2NvdW50IjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9zYWhoYUFwaVNjb3BlIjoic2FuZGJveCIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9yZWdpb24iOiJVUyIsImV4cCI6MTc1NDMyNzc2MywiaXNzIjoiaHR0cHM6Ly9zYWhoYS1wcm9kdWN0aW9uLmF1LmF1dGgwLmNvbS8iLCJhdWQiOiJodHRwczovL3NhaGhhLXByb2R1Y3Rpb24uYXUuYXV0aDAuY29tL2FwaS92Mi8ifQ.TR22_Aclj_3RTyZrz7GL2y4HDv-ePmMc37hcVdplwnQ';
        this.profileId = 'SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28';
        
        // Known categories to explore systematically
        this.knownCategories = [
            'sleep', 'activity', 'body', 'device', 'heart', 'mental', 'nutrition', 'environment'
        ];
        
        // Known archetype names to test
        this.knownArchetypes = [
            'bed_schedule', 'activity_pattern', 'sleep_pattern', 'wellness_pattern',
            'mood_pattern', 'energy_pattern', 'exercise_pattern', 'nutrition_pattern',
            'stress_pattern', 'social_pattern', 'work_pattern', 'travel_pattern',
            'seasonal_pattern', 'weekend_pattern', 'recovery_pattern'
        ];
        
        // Discovery results storage
        this.discoveryResults = {
            timestamp: new Date().toISOString(),
            biomarkers: {
                categories: {},
                types: {},
                periodicities: {},
                successful: [],
                failed: []
            },
            archetypes: {
                available: {},
                successful: [],
                failed: []
            },
            insights: {
                available: false,
                endpoints: [],
                data: null
            },
            scores: {
                available: false,
                types: [],
                data: null
            },
            summary: {}
        };
    }

    async makeApiCall(url, description = '') {
        try {
            console.log(`🔄 Testing: ${description || url}`);
            const response = await axios.get(`${this.baseURL}${url}`, {
                headers: {
                    'Authorization': `account ${this.accountToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = {
                success: true,
                url: url,
                status: response.status,
                dataCount: Array.isArray(response.data) ? response.data.length : (response.data ? 1 : 0),
                data: response.data,
                timestamp: new Date().toISOString()
            };
            
            console.log(`✅ Success: ${response.status} (${result.dataCount} items)`);
            return result;
            
        } catch (error) {
            const result = {
                success: false,
                url: url,
                status: error.response?.status,
                error: error.response?.data || error.message,
                timestamp: new Date().toISOString()
            };
            
            console.log(`❌ Failed: ${error.response?.status || 'Network Error'}`);
            return result;
        }
    }

    // BIOMARKER DISCOVERY
    async discoverBiomarkers() {
        console.log('\n🧬 COMPREHENSIVE BIOMARKER DISCOVERY');
        console.log('='.repeat(60));

        const startDate = '2025-06-01';
        const endDate = '2025-07-11';

        // Test each category individually
        for (const category of this.knownCategories) {
            const url = `/api/v1/profile/biomarker/${this.profileId}?startDateTime=${startDate}&endDateTime=${endDate}&categories=${category}`;
            const result = await this.makeApiCall(url, `${category} biomarkers`);
            
            if (result.success && result.data && result.data.length > 0) {
                this.discoveryResults.biomarkers.categories[category] = {
                    available: true,
                    count: result.data.length,
                    types: [...new Set(result.data.map(item => item.type))],
                    periodicities: [...new Set(result.data.map(item => item.periodicity))],
                    sampleData: result.data.slice(0, 3)
                };
                
                // Collect all unique types
                result.data.forEach(item => {
                    if (!this.discoveryResults.biomarkers.types[item.type]) {
                        this.discoveryResults.biomarkers.types[item.type] = {
                            category: item.category,
                            unit: item.unit,
                            valueType: item.valueType,
                            aggregation: item.aggregation,
                            examples: []
                        };
                    }
                    if (this.discoveryResults.biomarkers.types[item.type].examples.length < 2) {
                        this.discoveryResults.biomarkers.types[item.type].examples.push({
                            value: item.value,
                            periodicity: item.periodicity
                        });
                    }
                });
                
                this.discoveryResults.biomarkers.successful.push(result);
            } else {
                this.discoveryResults.biomarkers.categories[category] = {
                    available: false,
                    error: result.error
                };
                this.discoveryResults.biomarkers.failed.push(result);
            }
        }

        // Test biomarkers without category filter
        const allUrl = `/api/v1/profile/biomarker/${this.profileId}?startDateTime=${startDate}&endDateTime=${endDate}`;
        const allResult = await this.makeApiCall(allUrl, 'All biomarkers (no category filter)');
        
        if (allResult.success) {
            this.discoveryResults.biomarkers.allEndpointWorks = true;
            console.log(`🎯 All biomarkers endpoint: ${allResult.dataCount} total biomarkers available`);
        } else {
            this.discoveryResults.biomarkers.allEndpointWorks = false;
            console.log(`❌ All biomarkers endpoint requires category filter`);
        }
    }

    // ARCHETYPE DISCOVERY
    async discoverArchetypes() {
        console.log('\n🎯 COMPREHENSIVE ARCHETYPE DISCOVERY');
        console.log('='.repeat(60));

        const startDate = '2025-06-01';
        const endDate = '2025-07-11';

        // Test general archetype endpoint
        const generalUrl = `/api/v1/profile/archetypes/${this.profileId}?startDateTime=${startDate}&endDateTime=${endDate}`;
        const generalResult = await this.makeApiCall(generalUrl, 'All archetypes (general)');
        
        if (generalResult.success && generalResult.data) {
            console.log(`🎯 General archetype endpoint works: ${generalResult.dataCount} archetypes`);
            this.discoveryResults.archetypes.generalEndpoint = {
                available: true,
                data: generalResult.data,
                count: generalResult.dataCount
            };
        }

        // Test specific archetype names
        for (const archetype of this.knownArchetypes) {
            const url = `/api/v1/profile/archetypes/${this.profileId}?name=${archetype}&periodicity=weekly&startDateTime=${startDate}&endDateTime=${endDate}`;
            const result = await this.makeApiCall(url, `${archetype} archetype`);
            
            if (result.success && result.data) {
                this.discoveryResults.archetypes.available[archetype] = {
                    available: true,
                    data: result.data,
                    count: result.dataCount
                };
                this.discoveryResults.archetypes.successful.push(result);
            } else {
                this.discoveryResults.archetypes.available[archetype] = {
                    available: false,
                    error: result.error
                };
                this.discoveryResults.archetypes.failed.push(result);
            }
        }
    }

    // INSIGHT DISCOVERY
    async discoverInsights() {
        console.log('\n💡 INSIGHT ENDPOINT DISCOVERY');
        console.log('='.repeat(50));

        const insightEndpoints = [
            `/api/v1/profile/insight/${this.profileId}`,
            `/api/v1/profile/insights/${this.profileId}`,
            `/api/v1/insight/${this.profileId}`,
            `/api/v1/insights/${this.profileId}`,
            `/api/v1/profile/insight/${this.profileId}?startDateTime=2025-06-01&endDateTime=2025-07-11`,
            `/api/v1/profile/recommendation/${this.profileId}`,
            `/api/v1/profile/analysis/${this.profileId}`
        ];

        for (const endpoint of insightEndpoints) {
            const result = await this.makeApiCall(endpoint, `Insight endpoint test`);
            if (result.success) {
                this.discoveryResults.insights.available = true;
                this.discoveryResults.insights.endpoints.push(endpoint);
                this.discoveryResults.insights.data = result.data;
            }
        }
    }

    // SCORE DISCOVERY
    async discoverScores() {
        console.log('\n📊 SCORE ENDPOINT DISCOVERY');
        console.log('='.repeat(50));

        const scoreEndpoints = [
            `/api/v1/profile/score/${this.profileId}`,
            `/api/v1/profile/scores/${this.profileId}`,
            `/api/v1/score/${this.profileId}`,
            `/api/v1/scores/${this.profileId}`,
            `/api/v1/profile/score/${this.profileId}?startDateTime=2025-06-01&endDateTime=2025-07-11`,
            `/api/v1/profile/score/${this.profileId}?types=sleep`,
            `/api/v1/profile/score/${this.profileId}?types=activity`,
            `/api/v1/profile/score/${this.profileId}?types=wellness`,
            `/api/v1/profile/score/${this.profileId}?types=readiness`
        ];

        for (const endpoint of scoreEndpoints) {
            const result = await this.makeApiCall(endpoint, `Score endpoint test`);
            if (result.success) {
                this.discoveryResults.scores.available = true;
                this.discoveryResults.scores.types.push(endpoint);
                if (!this.discoveryResults.scores.data) {
                    this.discoveryResults.scores.data = result.data;
                }
            }
        }
    }

    // COMPREHENSIVE DISCOVERY
    async runComprehensiveDiscovery() {
        console.log('🔍 SAHHA COMPREHENSIVE DATA DISCOVERY');
        console.log('='.repeat(70));
        console.log('Systematically mapping ALL available Sahha data types\n');

        await this.discoverBiomarkers();
        await this.discoverArchetypes();
        await this.discoverInsights();
        await this.discoverScores();

        // Generate summary
        this.generateDiscoverySummary();
        
        // Save results
        await this.saveDiscoveryResults();
        
        return this.discoveryResults;
    }

    generateDiscoverySummary() {
        console.log('\n📋 COMPREHENSIVE DISCOVERY SUMMARY');
        console.log('='.repeat(70));

        // Biomarkers summary
        const biomarkerCategories = Object.keys(this.discoveryResults.biomarkers.categories);
        const availableCategories = biomarkerCategories.filter(cat => 
            this.discoveryResults.biomarkers.categories[cat].available
        );
        const totalBiomarkerTypes = Object.keys(this.discoveryResults.biomarkers.types).length;

        console.log('\n🧬 BIOMARKERS:');
        console.log(`   📁 Categories tested: ${biomarkerCategories.length}`);
        console.log(`   ✅ Available categories: ${availableCategories.length} (${availableCategories.join(', ')})`);
        console.log(`   🏷️ Unique biomarker types: ${totalBiomarkerTypes}`);
        console.log(`   📊 Total successful calls: ${this.discoveryResults.biomarkers.successful.length}`);

        // Archetypes summary
        const archetypeNames = Object.keys(this.discoveryResults.archetypes.available);
        const availableArchetypes = archetypeNames.filter(name => 
            this.discoveryResults.archetypes.available[name].available
        );

        console.log('\n🎯 ARCHETYPES:');
        console.log(`   📝 Archetype names tested: ${archetypeNames.length}`);
        console.log(`   ✅ Available archetypes: ${availableArchetypes.length}`);
        console.log(`   📊 Successful calls: ${this.discoveryResults.archetypes.successful.length}`);

        // Insights & Scores
        console.log('\n💡 INSIGHTS:');
        console.log(`   🔍 Available: ${this.discoveryResults.insights.available ? 'Yes' : 'No'}`);
        console.log(`   📊 Working endpoints: ${this.discoveryResults.insights.endpoints.length}`);

        console.log('\n📊 SCORES:');
        console.log(`   🔍 Available: ${this.discoveryResults.scores.available ? 'Yes' : 'No'}`);
        console.log(`   📊 Working endpoints: ${this.discoveryResults.scores.types.length}`);

        // Store summary
        this.discoveryResults.summary = {
            biomarkers: {
                categoriesTested: biomarkerCategories.length,
                categoriesAvailable: availableCategories.length,
                availableCategories: availableCategories,
                uniqueTypes: totalBiomarkerTypes,
                successfulCalls: this.discoveryResults.biomarkers.successful.length
            },
            archetypes: {
                namesTested: archetypeNames.length,
                available: availableArchetypes.length,
                availableArchetypes: availableArchetypes,
                successfulCalls: this.discoveryResults.archetypes.successful.length
            },
            insights: {
                available: this.discoveryResults.insights.available,
                workingEndpoints: this.discoveryResults.insights.endpoints.length
            },
            scores: {
                available: this.discoveryResults.scores.available,
                workingEndpoints: this.discoveryResults.scores.types.length
            }
        };

        console.log('\n🎯 DISCOVERY COMPLETE!');
        console.log(`📁 Results saved to data-analysis/discovery-results.json`);
    }

    async saveDiscoveryResults() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `data-analysis/discovery-results-${timestamp}.json`;
            
            await fs.mkdir('data-analysis', { recursive: true });
            await fs.writeFile(filename, JSON.stringify(this.discoveryResults, null, 2));
            
            // Also save a latest version
            await fs.writeFile('data-analysis/discovery-results-latest.json', JSON.stringify(this.discoveryResults, null, 2));
            
            console.log(`💾 Discovery results saved to: ${filename}`);
        } catch (error) {
            console.error('❌ Error saving discovery results:', error.message);
        }
    }

    // Generate GEO optimization report based on discoveries
    generateGEOReport() {
        const { biomarkers, archetypes } = this.discoveryResults.summary;
        
        return `
🎯 GEO OPTIMIZATION OPPORTUNITIES REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DATA AVAILABILITY ANALYSIS:
   🧬 Biomarker Categories: ${biomarkers.categoriesAvailable}/${biomarkers.categoriesTested} available
   🎯 Archetype Patterns: ${archetypes.available}/${archetypes.namesTested} available
   🏷️ Unique Data Types: ${biomarkers.uniqueTypes} biomarker types discovered

🚀 OPTIMIZATION OPPORTUNITIES:
   ⚡ Category-based API calls work best (avoid 'all' biomarkers)
   🎯 Archetype patterns provide rich behavioral insights
   📊 ${biomarkers.uniqueTypes} biomarker types available for focused APIs

🔧 RECOMMENDED GEO PATTERNS:
   1. Morning Health Check: sleep + activity biomarkers
   2. Workout Planning: activity + recovery archetypes  
   3. Wellness Insights: mood + energy patterns
   4. Recovery Analysis: sleep patterns + HRV biomarkers

📈 MARKETING RESEARCH READY:
   ✅ ${biomarkers.uniqueTypes} biomarkers mapped for market analysis
   ✅ ${archetypes.available} behavioral patterns identified
   ✅ Complete data structure documentation available
   ✅ API optimization patterns established

🎯 NEXT STEPS:
   1. Build focused API pattern library
   2. Create biomarker marketing profiles  
   3. Develop AI-optimized documentation
   4. Test GEO patterns with AI tools
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }
}

module.exports = SahhaDataDiscovery;