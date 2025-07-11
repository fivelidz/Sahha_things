// Test the archetype names discovered from the general endpoint
const SahhaDataDiscovery = require('./sahha-data-discovery');

async function testDiscoveredArchetypes() {
    console.log('🎯 TESTING DISCOVERED ARCHETYPE NAMES');
    console.log('Based on general endpoint response');
    console.log('='.repeat(60));

    const discovery = new SahhaDataDiscovery();
    const startDate = '2025-06-01';
    const endDate = '2025-07-11';
    
    // These are the actual archetype names found in the general endpoint
    const discoveredArchetypes = [
        'overall_wellness',
        'activity_level', 
        'mental_wellness',
        'sleep_duration',
        'sleep_regularity',
        'bed_schedule',
        'wake_schedule',
        'sleep_pattern',
        'sleep_quality'
    ];
    
    const results = {};
    
    console.log('\n🔍 TESTING EACH DISCOVERED ARCHETYPE');
    console.log('-'.repeat(50));
    
    for (const archetype of discoveredArchetypes) {
        const url = `/api/v1/profile/archetypes/${discovery.profileId}?name=${archetype}&periodicity=weekly&startDateTime=${startDate}&endDateTime=${endDate}`;
        const result = await discovery.makeApiCall(url, `${archetype} archetype`);
        
        results[archetype] = result;
        
        if (result.success && result.data && result.dataCount > 0) {
            console.log(`✅ ${archetype}: ${result.dataCount} items found`);
            
            // Show detailed data structure
            if (Array.isArray(result.data) && result.data.length > 0) {
                const sample = result.data[0];
                console.log(`   📊 Value: ${sample.value || 'N/A'}`);
                console.log(`   📏 Unit: ${sample.unit || 'N/A'}`);
                console.log(`   ⏱️ Periodicity: ${sample.periodicity || 'N/A'}`);
                console.log(`   📅 Date Range: ${sample.startDateTime || 'N/A'} to ${sample.endDateTime || 'N/A'}`);
                if (sample.metadata) {
                    console.log(`   🔧 Metadata: ${JSON.stringify(sample.metadata)}`);
                }
                console.log('');
            }
        } else {
            console.log(`❌ ${archetype}: No data available`);
        }
    }
    
    // Test additional archetype patterns that might exist
    console.log('\n🧪 TESTING ADDITIONAL ARCHETYPE PATTERNS');
    console.log('-'.repeat(50));
    
    const additionalArchetypes = [
        'activity_pattern',
        'workout_pattern', 
        'recovery_pattern',
        'daily_rhythm',
        'circadian_pattern',
        'exercise_frequency',
        'step_pattern',
        'heart_rate_pattern'
    ];
    
    for (const archetype of additionalArchetypes) {
        const url = `/api/v1/profile/archetypes/${discovery.profileId}?name=${archetype}&periodicity=weekly&startDateTime=${startDate}&endDateTime=${endDate}`;
        const result = await discovery.makeApiCall(url, `${archetype} (additional test)`);
        
        if (result.success && result.dataCount > 0) {
            console.log(`✅ ${archetype}: ${result.dataCount} items found`);
            results[archetype] = result;
        } else {
            console.log(`❌ ${archetype}: No data`);
        }
    }
    
    // Summary
    console.log('\n📊 COMPREHENSIVE ARCHETYPE MAPPING');
    console.log('='.repeat(60));
    
    const availableArchetypes = Object.keys(results).filter(
        name => results[name].success && results[name].dataCount > 0
    );
    
    console.log(`✅ Total archetypes with data: ${availableArchetypes.length}`);
    console.log(`📋 Available archetypes:`);
    
    availableArchetypes.forEach((archetype, index) => {
        const data = results[archetype].data[0];
        console.log(`   ${index + 1}. ${archetype}: ${data?.value || 'N/A'} (${data?.periodicity || 'weekly'})`);
    });
    
    return {
        results,
        availableArchetypes,
        totalTested: discoveredArchetypes.length + additionalArchetypes.length
    };
}

// Run the test
if (require.main === module) {
    testDiscoveredArchetypes()
        .then(results => {
            console.log(`\n🎉 ARCHETYPE MAPPING COMPLETE!`);
            console.log(`📈 Successfully mapped ${results.availableArchetypes.length} archetype types`);
        })
        .catch(console.error);
}

module.exports = testDiscoveredArchetypes;