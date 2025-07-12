// Test monthly archetype data and different time ranges
const SahhaDataDiscovery = require('./sahha-data-discovery');

async function testMonthlyArchetypes() {
    console.log('📅 TESTING MONTHLY ARCHETYPE DATA');
    console.log('Exploring different periodicities and time ranges');
    console.log('='.repeat(60));

    const discovery = new SahhaDataDiscovery();
    
    // Known working archetypes from previous discovery
    const workingArchetypes = [
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
    
    const periodicities = ['daily', 'weekly', 'monthly'];
    const results = {};
    
    // Test different date ranges for monthly data
    const dateRanges = [
        {
            name: 'Last 30 days',
            start: '2025-06-11',
            end: '2025-07-11'
        },
        {
            name: 'Last 60 days', 
            start: '2025-05-11',
            end: '2025-07-11'
        },
        {
            name: 'Last 90 days',
            start: '2025-04-11', 
            end: '2025-07-11'
        }
    ];
    
    console.log('\n🔍 TESTING DIFFERENT PERIODICITIES');
    console.log('-'.repeat(50));
    
    // Test each archetype with different periodicities
    for (const archetype of workingArchetypes) {
        console.log(`\n📊 Testing ${archetype}:`);
        results[archetype] = {};
        
        for (const periodicity of periodicities) {
            const url = `/api/v1/profile/archetypes/${discovery.profileId}?name=${archetype}&periodicity=${periodicity}&startDateTime=2025-05-01&endDateTime=2025-07-11`;
            const result = await discovery.makeApiCall(url, `${archetype} (${periodicity})`);
            
            results[archetype][periodicity] = result;
            
            if (result.success && result.dataCount > 0) {
                console.log(`   ✅ ${periodicity}: ${result.dataCount} items`);
                
                // Show sample data for monthly if available
                if (periodicity === 'monthly' && result.data && result.data.length > 0) {
                    const sample = result.data[0];
                    console.log(`      📊 Value: ${sample.value || 'N/A'}`);
                    console.log(`      📅 Period: ${sample.startDateTime || 'N/A'} to ${sample.endDateTime || 'N/A'}`);
                }
            } else {
                console.log(`   ❌ ${periodicity}: No data`);
            }
        }
    }
    
    console.log('\n📅 TESTING MONTHLY DATA WITH DIFFERENT DATE RANGES');
    console.log('-'.repeat(60));
    
    // Test monthly data with different date ranges
    for (const range of dateRanges) {
        console.log(`\n🔍 Testing ${range.name} (${range.start} to ${range.end}):`);
        
        let monthlyDataFound = 0;
        
        for (const archetype of workingArchetypes.slice(0, 3)) { // Test first 3 to avoid too much output
            const url = `/api/v1/profile/archetypes/${discovery.profileId}?name=${archetype}&periodicity=monthly&startDateTime=${range.start}&endDateTime=${range.end}`;
            const result = await discovery.makeApiCall(url, `${archetype} monthly (${range.name})`);
            
            if (result.success && result.dataCount > 0) {
                monthlyDataFound++;
                console.log(`   ✅ ${archetype}: ${result.dataCount} monthly items`);
            }
        }
        
        console.log(`   📊 Monthly data found for ${monthlyDataFound}/3 tested archetypes`);
    }
    
    console.log('\n🕰️ TESTING DAILY DATA AVAILABILITY');
    console.log('-'.repeat(40));
    
    // Test daily data for recent dates
    const recentStart = '2025-07-08';
    const recentEnd = '2025-07-11';
    
    let dailyDataFound = 0;
    
    for (const archetype of workingArchetypes.slice(0, 4)) {
        const url = `/api/v1/profile/archetypes/${discovery.profileId}?name=${archetype}&periodicity=daily&startDateTime=${recentStart}&endDateTime=${recentEnd}`;
        const result = await discovery.makeApiCall(url, `${archetype} daily (recent)`);
        
        if (result.success && result.dataCount > 0) {
            dailyDataFound++;
            console.log(`✅ ${archetype}: ${result.dataCount} daily items`);
            
            // Show daily data structure
            if (result.data && result.data.length > 0) {
                const sample = result.data[0];
                console.log(`   📊 Daily value: ${sample.value || 'N/A'} (${sample.startDateTime || 'N/A'})`);
            }
        } else {
            console.log(`❌ ${archetype}: No daily data`);
        }
    }
    
    // Summary analysis
    console.log('\n📊 PERIODICITY ANALYSIS SUMMARY');
    console.log('='.repeat(50));
    
    const periodicityStats = {
        daily: 0,
        weekly: 0, 
        monthly: 0
    };
    
    for (const archetype of workingArchetypes) {
        for (const periodicity of periodicities) {
            if (results[archetype] && results[archetype][periodicity] && 
                results[archetype][periodicity].success && 
                results[archetype][periodicity].dataCount > 0) {
                periodicityStats[periodicity]++;
            }
        }
    }
    
    console.log(`📅 Daily data available: ${periodicityStats.daily}/${workingArchetypes.length} archetypes`);
    console.log(`📅 Weekly data available: ${periodicityStats.weekly}/${workingArchetypes.length} archetypes`);
    console.log(`📅 Monthly data available: ${periodicityStats.monthly}/${workingArchetypes.length} archetypes`);
    
    // Recommendations for API patterns
    console.log('\n🎯 API PATTERN RECOMMENDATIONS');
    console.log('-'.repeat(40));
    
    if (periodicityStats.weekly > periodicityStats.monthly && periodicityStats.weekly > periodicityStats.daily) {
        console.log('✅ WEEKLY is the primary periodicity for archetype data');
        console.log('   🔧 GEO Pattern: Use weekly archetypes for behavioral insights');
    }
    
    if (periodicityStats.monthly > 0) {
        console.log('✅ MONTHLY data available for trend analysis');
        console.log('   🔧 GEO Pattern: Use monthly for long-term behavioral trends');
    }
    
    if (periodicityStats.daily > 0) {
        console.log('✅ DAILY data available for real-time insights');
        console.log('   🔧 GEO Pattern: Use daily for immediate behavioral feedback');
    }
    
    return {
        results,
        stats: periodicityStats,
        recommendations: {
            primary: periodicityStats.weekly >= periodicityStats.monthly ? 'weekly' : 'monthly',
            available: Object.keys(periodicityStats).filter(p => periodicityStats[p] > 0)
        }
    };
}

// Run the test
if (require.main === module) {
    testMonthlyArchetypes()
        .then(results => {
            console.log(`\n🎉 PERIODICITY TESTING COMPLETE!`);
            console.log(`📈 Primary periodicity: ${results.recommendations.primary}`);
            console.log(`📊 Available periodicities: ${results.recommendations.available.join(', ')}`);
        })
        .catch(console.error);
}

module.exports = testMonthlyArchetypes;