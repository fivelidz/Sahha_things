// API Builder Demo and Testing
// Demonstrates all focused API builders and generates example URLs

const SleepMetricsBuilder = require('./sleep-metrics-builder');
const ActivityMetricsBuilder = require('./activity-metrics-builder');

class APIBuilderDemo {
    constructor() {
        this.accountToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2FwaS5zYWhoYS5haS9jbGFpbXMvYWNjb3VudElkIjoiZmU3ZTkyMDAtNGEzYS00MmQwLWIxMWEtZjIwYzAxYTZiOTBiIiwiaHR0cHM6Ly9hcGkuc2FoaGEuYWkvY2xhaW1zL2FkbWluIjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9hY2NvdW50IjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9zYWhoYUFwaVNjb3BlIjoic2FuZGJveCIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9yZWdpb24iOiJVUyIsImV4cCI6MTc1NDI1NjAzMiwiaXNzIjoiaHR0cHM6Ly9zYWhoYS1wcm9kdWN0aW9uLmF1LmF1dGgwLmNvbS8iLCJhdWQiOiJodHRwczovL3NhaGhhLXByb2R1Y3Rpb24uYXUuYXV0aDAuY29tL2FwaS92Mi8ifQ.IGsV0msiqUiDz1tnPpbbF7Iqt0MofpACjvOslUT7N-k';
        
        this.sleepBuilder = new SleepMetricsBuilder(this.accountToken);
        this.activityBuilder = new ActivityMetricsBuilder(this.accountToken);
    }

    demonstrateAllBuilders() {
        console.log('🛠️ SAHHA API BUILDERS DEMONSTRATION');
        console.log('='.repeat(60));
        console.log('Generating focused API endpoints for different use cases\n');

        this.demonstrateSleepAPIs();
        console.log('\n');
        this.demonstrateActivityAPIs();
        console.log('\n');
        this.demonstrateUseCaseScenarios();
    }

    demonstrateSleepAPIs() {
        console.log('😴 SLEEP METRICS API BUILDERS');
        console.log('='.repeat(40));
        
        const sleepAPIs = this.sleepBuilder.generateAllSleepAPIs();
        
        Object.entries(sleepAPIs).forEach(([name, api]) => {
            console.log(`\n📊 ${name.toUpperCase()}`);
            console.log(`Purpose: ${api.description}`);
            console.log(`Use Case: ${api.useCase}`);
            console.log(`Metrics: ${api.metrics.join(', ')}`);
            console.log(`\nURL:`);
            console.log(api.url);
            console.log(`\nCURL:`);
            console.log(api.curl);
        });
    }

    demonstrateActivityAPIs() {
        console.log('🏃 ACTIVITY METRICS API BUILDERS');
        console.log('='.repeat(40));
        
        const activityAPIs = this.activityBuilder.generateAllActivityAPIs();
        
        Object.entries(activityAPIs).forEach(([name, api]) => {
            console.log(`\n📊 ${name.toUpperCase()}`);
            console.log(`Purpose: ${api.description}`);
            console.log(`Use Case: ${api.useCase}`);
            console.log(`Metrics: ${api.metrics.join(', ')}`);
            console.log(`\nURL:`);
            console.log(api.url);
            console.log(`\nCURL:`);
            console.log(api.curl);
        });
    }

    demonstrateUseCaseScenarios() {
        console.log('🎯 USE CASE SCENARIOS');
        console.log('='.repeat(40));

        const scenarios = [
            {
                name: 'Morning Health Checkup',
                description: 'Quick health assessment for daily notifications',
                apis: [
                    this.sleepBuilder.buildQuickSleepCheckAPI(),
                    this.activityBuilder.buildQuickActivityCheckAPI()
                ]
            },
            {
                name: 'Workout Planning Assistant',
                description: 'Determine optimal workout intensity',
                apis: [
                    this.sleepBuilder.buildSleepQualityAPI(),
                    this.activityBuilder.buildFitnessReadinessAPI()
                ]
            },
            {
                name: 'Comprehensive Health Analysis',
                description: 'Deep dive into sleep and activity patterns',
                apis: [
                    this.sleepBuilder.buildSleepStagesAPI(),
                    this.activityBuilder.buildIntensityAnalysisAPI()
                ]
            },
            {
                name: 'Sedentary Behavior Monitor',
                description: 'Track and improve daily movement',
                apis: [
                    this.activityBuilder.buildMovementPatternsAPI()
                ]
            }
        ];

        scenarios.forEach(scenario => {
            console.log(`\n🎯 ${scenario.name.toUpperCase()}`);
            console.log(`Description: ${scenario.description}`);
            console.log(`Required APIs: ${scenario.apis.length}`);
            
            scenario.apis.forEach((api, index) => {
                console.log(`\nAPI ${index + 1}: ${api.description}`);
                console.log(`Metrics: ${api.metrics.join(', ')}`);
                console.log(`URL: ${api.url}`);
            });
        });
    }

    generateCustomAPI(categories, types, days = 7, profileId = null) {
        const profile = profileId || 'SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28';
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        
        let url = `https://sandbox-api.sahha.ai/api/v1/profile/biomarker/${profile}?startDateTime=${startDate}&endDateTime=${endDate}`;
        
        categories.forEach(category => {
            url += `&categories=${category}`;
        });

        types.forEach(type => {
            url += `&types=${type}`;
        });

        const curl = `curl -H "Authorization: account ${this.accountToken}" "${url}"`;
        
        const fetch = `fetch('${url}', {
  method: 'GET',
  headers: {
    'Authorization': 'account ${this.accountToken}'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;

        return {
            url,
            curl,
            fetch,
            categories,
            types,
            description: `Custom API for ${categories.join(', ')} categories with ${types.length} metrics`,
            duration: `${days} days`
        };
    }

    generateSmartReminderAPIs() {
        console.log('\n🧠 SMART REMINDER SYSTEM OPTIMIZED APIS');
        console.log('='.repeat(50));

        const smartAPIs = {
            morningCheckup: this.generateCustomAPI(
                ['sleep', 'activity'], 
                ['sleep_duration', 'sleep_start_time', 'steps', 'active_duration'],
                1
            ),
            workoutRecommendation: this.generateCustomAPI(
                ['sleep', 'activity'],
                ['sleep_debt', 'sleep_efficiency', 'active_energy_burned', 'activity_high_intensity_duration'],
                3
            ),
            hydrationReminder: this.generateCustomAPI(
                ['activity'],
                ['active_duration', 'active_energy_burned', 'steps'],
                1
            ),
            recoveryAssessment: this.generateCustomAPI(
                ['sleep', 'activity'],
                ['sleep_duration', 'sleep_efficiency', 'activity_high_intensity_duration', 'activity_sedentary_duration'],
                7
            )
        };

        Object.entries(smartAPIs).forEach(([name, api]) => {
            console.log(`\n🎯 ${name.toUpperCase()}`);
            console.log(`Purpose: ${api.description}`);
            console.log(`Duration: ${api.duration}`);
            console.log(`Categories: ${api.categories.join(', ')}`);
            console.log(`Types: ${api.types.join(', ')}`);
            console.log(`\nURL:`);
            console.log(api.url);
            console.log(`\nCURL:`);
            console.log(api.curl);
        });

        return smartAPIs;
    }
}

// Run the demonstration
function runDemo() {
    const demo = new APIBuilderDemo();
    demo.demonstrateAllBuilders();
    demo.generateSmartReminderAPIs();
    
    console.log('\n✅ API BUILDER DEMONSTRATION COMPLETE!');
    console.log('🔗 Copy any URL above to test in your browser or application');
    console.log('📋 Use the cURL commands to test from command line');
    console.log('💻 Use the fetch examples in your JavaScript applications');
}

if (require.main === module) {
    runDemo();
}

module.exports = APIBuilderDemo;