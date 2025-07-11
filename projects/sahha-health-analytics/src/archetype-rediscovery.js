// Re-run archetype discovery after user API interactions
const SahhaDataDiscovery = require('./sahha-data-discovery');

async function rediscoverArchetypes() {
    console.log('🔄 RE-RUNNING ARCHETYPE DISCOVERY');
    console.log('After user API interactions - checking for new data');
    console.log('='.repeat(60));

    const discovery = new SahhaDataDiscovery();
    
    // Test the general archetype endpoint first
    console.log('\n🎯 TESTING GENERAL ARCHETYPE ENDPOINT');
    const startDate = '2025-06-01';
    const endDate = '2025-07-11';
    
    const generalUrl = `/api/v1/profile/archetypes/${discovery.profileId}?startDateTime=${startDate}&endDateTime=${endDate}`;
    const generalResult = await discovery.makeApiCall(generalUrl, 'All archetypes (updated check)');
    
    if (generalResult.success && generalResult.data) {
        console.log(`\n✅ General archetype endpoint: ${generalResult.dataCount} archetypes found`);
        console.log('📋 Available archetype data:');
        
        if (Array.isArray(generalResult.data)) {
            generalResult.data.forEach((archetype, index) => {
                console.log(`   ${index + 1}. ${archetype.name || 'Unknown'} - ${archetype.periodicity || 'N/A'} (${archetype.startDateTime || 'N/A'})`);
            });
        }
    }
    
    // Now test specific archetype names
    console.log('\n🔍 TESTING SPECIFIC ARCHETYPE NAMES');
    console.log('-'.repeat(50));
    
    const archetypeResults = {};
    
    for (const archetype of discovery.knownArchetypes) {
        const url = `/api/v1/profile/archetypes/${discovery.profileId}?name=${archetype}&periodicity=weekly&startDateTime=${startDate}&endDateTime=${endDate}`;
        const result = await discovery.makeApiCall(url, `${archetype} archetype (updated)`);
        
        archetypeResults[archetype] = result;
        
        if (result.success && result.data && result.dataCount > 0) {
            console.log(`   ✅ ${archetype}: ${result.dataCount} items found`);
            
            // Show sample data structure
            if (Array.isArray(result.data) && result.data.length > 0) {
                const sample = result.data[0];
                console.log(`      📊 Sample: ${sample.value || 'N/A'} ${sample.unit || ''} (${sample.periodicity || 'N/A'})`);
            }
        } else {
            console.log(`   ❌ ${archetype}: No data available`);
        }
    }
    
    // Test additional periodicity options
    console.log('\n⏱️ TESTING DIFFERENT PERIODICITIES');
    console.log('-'.repeat(40));
    
    const periodicities = ['daily', 'weekly', 'monthly'];
    const testArchetypes = ['bed_schedule', 'sleep_pattern', 'activity_pattern'];
    
    for (const archetype of testArchetypes) {
        console.log(`\n🔍 Testing ${archetype}:`);
        for (const periodicity of periodicities) {
            const url = `/api/v1/profile/archetypes/${discovery.profileId}?name=${archetype}&periodicity=${periodicity}&startDateTime=${startDate}&endDateTime=${endDate}`;
            const result = await discovery.makeApiCall(url, `${archetype} (${periodicity})`);
            
            if (result.success && result.dataCount > 0) {
                console.log(`   ✅ ${periodicity}: ${result.dataCount} items`);
            } else {
                console.log(`   ❌ ${periodicity}: No data`);
            }
        }
    }
    
    // Summary
    console.log('\n📊 UPDATED ARCHETYPE DISCOVERY SUMMARY');
    console.log('='.repeat(50));
    
    const availableArchetypes = Object.keys(archetypeResults).filter(
        name => archetypeResults[name].success && archetypeResults[name].dataCount > 0
    );
    
    console.log(`✅ Archetypes with data: ${availableArchetypes.length}/${discovery.knownArchetypes.length}`);
    console.log(`📋 Available: ${availableArchetypes.join(', ')}`);
    
    const noDataArchetypes = Object.keys(archetypeResults).filter(
        name => !archetypeResults[name].success || archetypeResults[name].dataCount === 0
    );
    
    console.log(`❌ No data: ${noDataArchetypes.join(', ')}`);
    
    return {
        general: generalResult,
        specific: archetypeResults,
        summary: {
            available: availableArchetypes,
            noData: noDataArchetypes,
            totalTested: discovery.knownArchetypes.length
        }
    };
}

// Run the rediscovery
if (require.main === module) {
    rediscoverArchetypes()
        .then(results => {
            console.log('\n🎉 ARCHETYPE REDISCOVERY COMPLETE!');
            console.log(`📈 Found data for ${results.summary.available.length} archetype types`);
        })
        .catch(console.error);
}

module.exports = rediscoverArchetypes;