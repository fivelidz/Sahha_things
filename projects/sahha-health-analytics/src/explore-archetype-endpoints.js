// Explore alternative archetype endpoints and possible listing methods
const SahhaDataDiscovery = require('./sahha-data-discovery');

async function exploreArchetypeEndpoints() {
    console.log('🔍 EXPLORING ALTERNATIVE ARCHETYPE ENDPOINTS');
    console.log('Searching for comprehensive archetype listing methods');
    console.log('='.repeat(70));

    const discovery = new SahhaDataDiscovery();
    
    // Test various potential archetype listing endpoints
    const potentialEndpoints = [
        '/api/v1/archetype/types',
        '/api/v1/archetype/list', 
        '/api/v1/profile/archetype/types',
        '/api/v1/profile/archetype/list',
        '/api/v1/profile/archetypes/types',
        '/api/v1/profile/archetypes/list',
        '/api/v1/archetype/available',
        '/api/v1/profile/archetype/available',
        '/api/v1/meta/archetypes',
        '/api/v1/metadata/archetypes',
        '/api/v1/profile/archetypes/metadata',
        `/api/v1/profile/archetypes/${discovery.profileId}/types`,
        `/api/v1/profile/archetypes/${discovery.profileId}/list`,
        `/api/v1/profile/archetypes/${discovery.profileId}/available`
    ];

    console.log('\n🎯 TESTING POTENTIAL ARCHETYPE LISTING ENDPOINTS');
    console.log('-'.repeat(60));
    
    const workingEndpoints = [];
    
    for (const endpoint of potentialEndpoints) {
        const result = await discovery.makeApiCall(endpoint, `Archetype listing test`);
        
        if (result.success) {
            console.log(`✅ ${endpoint}: SUCCESS`);
            console.log(`   📊 Data type: ${Array.isArray(result.data) ? 'Array' : typeof result.data}`);
            console.log(`   📏 Size: ${Array.isArray(result.data) ? result.data.length : 'N/A'} items`);
            
            if (result.data && (Array.isArray(result.data) || typeof result.data === 'object')) {
                console.log(`   🔍 Sample: ${JSON.stringify(result.data).substring(0, 200)}...`);
            }
            
            workingEndpoints.push({
                endpoint,
                data: result.data,
                dataCount: result.dataCount
            });
            console.log('');
        } else {
            console.log(`❌ ${endpoint}: ${result.status || 'Failed'}`);
        }
    }
    
    // Test the general archetype endpoint with different parameters
    console.log('\n🧪 TESTING GENERAL ENDPOINT WITH DIFFERENT PARAMETERS');
    console.log('-'.repeat(60));
    
    const parameterTests = [
        {},  // No parameters
        { startDateTime: '2025-06-01', endDateTime: '2025-07-11' },
        { periodicity: 'weekly' },
        { periodicity: 'monthly' },
        { periodicity: 'daily' },
        { limit: 100 },
        { all: true },
        { types: true },
        { metadata: true }
    ];
    
    for (const params of parameterTests) {
        const queryString = Object.keys(params).length > 0 ? 
            '?' + Object.entries(params).map(([k,v]) => `${k}=${v}`).join('&') : '';
        
        const endpoint = `/api/v1/profile/archetypes/${discovery.profileId}${queryString}`;
        const result = await discovery.makeApiCall(endpoint, `General endpoint with params`);
        
        if (result.success && result.dataCount > 0) {
            console.log(`✅ Parameters ${JSON.stringify(params)}: ${result.dataCount} items`);
            
            // Check if this reveals different archetype types
            if (Array.isArray(result.data)) {
                const archetypeNames = result.data.map(item => item.name).filter(Boolean);
                const uniqueNames = [...new Set(archetypeNames)];
                console.log(`   🏷️ Archetype types found: ${uniqueNames.join(', ')}`);
            }
        } else {
            console.log(`❌ Parameters ${JSON.stringify(params)}: No data`);
        }
    }
    
    // Test if we can discover archetype names by looking at data structure
    console.log('\n🔬 ANALYZING ARCHETYPE DATA STRUCTURE FOR CLUES');
    console.log('-'.repeat(50));
    
    const generalUrl = `/api/v1/profile/archetypes/${discovery.profileId}?startDateTime=2025-06-01&endDateTime=2025-07-11`;
    const generalResult = await discovery.makeApiCall(generalUrl, 'General archetype analysis');
    
    if (generalResult.success && generalResult.data) {
        console.log('📊 ARCHETYPE DATA STRUCTURE ANALYSIS:');
        
        if (Array.isArray(generalResult.data) && generalResult.data.length > 0) {
            const sample = generalResult.data[0];
            console.log('   🔍 Sample archetype structure:');
            console.log(`   ${JSON.stringify(sample, null, 6)}`);
            
            // Look for any fields that might indicate more archetype types
            const allFields = new Set();
            generalResult.data.forEach(item => {
                Object.keys(item).forEach(key => allFields.add(key));
            });
            
            console.log(`\n   🏷️ Available fields: ${Array.from(allFields).join(', ')}`);
            
            // Extract all unique archetype names from the data
            const allNames = generalResult.data.map(item => item.name).filter(Boolean);
            const uniqueNames = [...new Set(allNames)];
            console.log(`   📋 All archetype names in data: ${uniqueNames.join(', ')}`);
        }
    }
    
    console.log('\n📊 EXPLORATION SUMMARY');
    console.log('='.repeat(40));
    console.log(`✅ Working listing endpoints: ${workingEndpoints.length}`);
    console.log(`🎯 Primary approach: Query general endpoint without specific name filter`);
    console.log(`📋 Discovered approach: General endpoint returns available archetypes`);
    
    if (workingEndpoints.length === 0) {
        console.log(`\n💡 RECOMMENDATION:`);
        console.log(`   Since no dedicated listing endpoint exists, the best approach is:`);
        console.log(`   1. Use general archetype endpoint to see what's available`);
        console.log(`   2. Test known archetype names individually`);
        console.log(`   3. Build comprehensive mapping through systematic testing`);
    }
    
    return {
        workingEndpoints,
        discoveredArchetypes: generalResult?.data || [],
        recommendation: 'Use general endpoint + systematic name testing'
    };
}

// Run the exploration
if (require.main === module) {
    exploreArchetypeEndpoints()
        .then(results => {
            console.log(`\n🎉 ARCHETYPE ENDPOINT EXPLORATION COMPLETE!`);
            console.log(`📈 Found ${results.workingEndpoints.length} alternative endpoints`);
        })
        .catch(console.error);
}

module.exports = exploreArchetypeEndpoints;