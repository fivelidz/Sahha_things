// Run the comprehensive Sahha data discovery
const SahhaDataDiscovery = require('./sahha-data-discovery');

async function main() {
    const discovery = new SahhaDataDiscovery();
    const results = await discovery.runComprehensiveDiscovery();
    
    // Display GEO report
    console.log(discovery.generateGEOReport());
    
    return results;
}

main().catch(console.error);