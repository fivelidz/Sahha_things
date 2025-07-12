# Sahha Health Analytics Project - User Guide
**Complete guide to using the health analytics and API discovery tools**

---

## 🚀 Quick Start

### Installation
```bash
cd projects/sahha-health-analytics
npm install
```

### Basic Usage
```bash
# Run complete discovery analysis
npm run analyze

# Or run specific discovery
node src/run-discovery.js
```

---

## 📊 What This Project Does

The Sahha Health Analytics project provides **comprehensive API discovery and analysis tools** that systematically map all available Sahha health data endpoints, patterns, and capabilities.

### Key Capabilities:
- **Complete API Discovery**: Maps all 184+ biomarkers, 9 archetypes, scores
- **Authentication Testing**: Validates account token patterns  
- **Performance Analysis**: Tests parallel vs sequential requests
- **Error Documentation**: Catalogs common issues with solutions
- **Data Structure Mapping**: Documents response formats and relationships

---

## 🛠️ Available Tools

### 1. Main Discovery Runner
```bash
node src/run-discovery.js
```
**Purpose**: Runs complete systematic discovery of all Sahha API capabilities

**What it does**:
- Tests all biomarker categories (sleep, activity, body, device, etc.)
- Discovers available archetype patterns  
- Tests insight and score endpoints
- Maps authentication requirements
- Generates comprehensive results in `data-analysis/discovery-results-latest.json`

### 2. Comprehensive API Client
```bash
node src/test-comprehensive-analysis.js
```
**Purpose**: Demonstrates full API usage patterns with detailed analysis

**Features**:
- **Complete Health Dashboard**: Collects all data types in parallel
- **Biomarker Structure Analysis**: Maps data types, units, periodicities
- **Archetype Exploration**: Tests different behavioral patterns
- **Performance Benchmarking**: Measures API response times
- **Use Case Generation**: Creates practical health scenarios

### 3. Archetype Deep Dive
```bash
node src/test-discovered-archetypes.js
```
**Purpose**: Detailed exploration of behavioral archetype patterns

**Discoveries**:
- Maps all 9 confirmed archetype types
- Tests different periodicities (daily/weekly/monthly)
- Documents archetype value classifications
- Provides working code examples

### 4. Performance Testing
```bash
node src/test-monthly-archetypes.js
```
**Purpose**: Tests different time ranges and periodicity options

**Validates**:
- Weekly vs monthly vs daily data availability
- Optimal date range parameters
- Data volume analysis across time periods

### 5. Endpoint Exploration
```bash
node src/explore-archetype-endpoints.js
```
**Purpose**: Systematic testing of alternative API endpoints

**Tests**:
- Metadata endpoints
- Alternative URL patterns  
- Parameter combinations
- Undocumented endpoint discovery

### 6. Archetype Rediscovery
```bash
node src/archetype-rediscovery.js
```
**Purpose**: Re-tests archetype availability after API interactions

**Use case**: Run after using Sahha's query system to check for newly available data

---

## 📈 Understanding the Results

### Discovery Results File
Location: `data-analysis/discovery-results-latest.json`

**Structure**:
```json
{
  "timestamp": "2025-07-11T17:42:41.117Z",
  "biomarkers": {
    "categories": {
      "sleep": {
        "available": true,
        "count": 94,
        "types": ["sleep_regularity", "sleep_debt", "sleep_duration", ...]
      }
    }
  },
  "archetypes": {
    "available": {
      "overall_wellness": {"available": true, "data": {...}},
      "activity_level": {"available": true, "data": {...}}
    }
  },
  "summary": {...}
}
```

### Key Findings Summary:

#### Biomarkers (184 total):
- **Sleep**: 94 biomarkers available
- **Activity**: 90 biomarkers available  
- **Other categories**: 0 biomarkers each (body, device, heart, mental, nutrition, environment)

#### Archetypes (9 confirmed):
1. `overall_wellness` → "good_wellness"
2. `activity_level` → "lightly_active"
3. `mental_wellness` → "good_mental_wellness"
4. `sleep_duration` → "average_sleeper"
5. `sleep_regularity` → "highly_regular_sleeper"
6. `bed_schedule` → "early_sleeper"
7. `wake_schedule` → "early_riser"
8. `sleep_pattern` → "consistent_early_sleeper"
9. `sleep_quality` → "optimal_sleep_quality"

#### Critical API Requirements:
- **Authentication**: Must use `account` token format (NOT `Bearer`)
- **Biomarkers**: REQUIRE category-specific calls (`&categories=sleep`)
- **Archetypes**: Only weekly periodicity has data
- **Performance**: Parallel requests significantly faster

---

## 🔧 Configuration

### API Credentials
The tools use sandbox credentials by default. Update these in the source files:
```javascript
// In src/sahha-data-discovery.js
this.accountToken = 'your-account-token-here';
this.profileId = 'your-profile-id-here';
```

### Customizing Discovery
Edit `src/sahha-data-discovery.js` to modify:
- **Date ranges**: Change `startDate` and `endDate` 
- **Categories to test**: Modify `this.knownCategories` array
- **Archetype names**: Update `this.knownArchetypes` array
- **Endpoint variations**: Add new URLs to test

---

## 📊 Practical Use Cases

### 1. API Integration Planning
**Use**: `run-discovery.js` to understand complete API capabilities before building

**Benefits**:
- Know exactly which biomarkers are available
- Understand authentication requirements
- Plan optimal API call patterns

### 2. Performance Optimization
**Use**: `test-comprehensive-analysis.js` to benchmark different request strategies

**Benefits**:
- Compare parallel vs sequential requests
- Identify optimal data collection patterns
- Measure API response characteristics

### 3. New Feature Development  
**Use**: `archetype-rediscovery.js` after interacting with Sahha's systems

**Benefits**:
- Discover newly available data types
- Validate API changes and updates
- Adapt to evolving capabilities

### 4. Error Troubleshooting
**Use**: Any tool provides detailed error reporting with actionable hints

**Benefits**:
- Understand common API failure patterns
- Get specific guidance for fixing issues
- Learn optimal implementation approaches

---

## 🎯 Working with Results

### Using Discovery Data in Your Apps
```javascript
// Load discovery results
const discoveryData = require('./data-analysis/discovery-results-latest.json');

// Get available biomarker types for sleep
const sleepBiomarkers = discoveryData.biomarkers.categories.sleep.types;
console.log('Available sleep metrics:', sleepBiomarkers);

// Get confirmed archetype names
const archetypes = Object.keys(discoveryData.archetypes.available)
  .filter(name => discoveryData.archetypes.available[name].available);
console.log('Available behavioral patterns:', archetypes);
```

### Building Optimized API Calls
```javascript
// Use discovered patterns for optimal performance
const optimalBiomarkerCall = async () => {
  // Use category-specific calls (discovered requirement)
  const [sleep, activity] = await Promise.all([
    api.get('/biomarker/profile?categories=sleep&startDateTime=...'),
    api.get('/biomarker/profile?categories=activity&startDateTime=...')
  ]);
  
  // Use weekly archetypes (discovered limitation)
  const archetypes = await api.get('/archetypes/profile?periodicity=weekly&startDateTime=...');
  
  return { sleep: sleep.data, activity: activity.data, patterns: archetypes.data };
};
```

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module 'axios'"
**Solution**: 
```bash
cd projects/sahha-health-analytics
npm install
```

### Issue: "400 Bad Request" for biomarkers
**Solution**: Always include category parameter:
```javascript
// ❌ Wrong
'/biomarker/profile?startDateTime=...'

// ✅ Correct  
'/biomarker/profile?categories=sleep&startDateTime=...'
```

### Issue: Empty archetype results
**Solution**: Use weekly periodicity only:
```javascript
// ❌ Wrong
'?periodicity=daily'

// ✅ Correct
'?periodicity=weekly'
```

### Issue: Authentication failures
**Solution**: Use account token format:
```javascript
// ❌ Wrong
headers: { 'Authorization': 'Bearer YOUR_TOKEN' }

// ✅ Correct
headers: { 'Authorization': 'account YOUR_TOKEN' }
```

---

## 📚 Integration with Other Projects

### With GEO Optimization:
- Use discovery results to validate GEO documentation
- Provide real data for AI optimization patterns
- Test AI-friendly code examples

### With Smart Reminder System:
- Use discovered biomarkers for notification triggers
- Leverage archetype patterns for personalization
- Apply performance optimizations for real-time features

---

## 🔄 Keeping Data Current

### Re-running Discovery
```bash
# Full rediscovery (recommended monthly)
npm run analyze

# Quick archetype check (after using Sahha query system)
node src/archetype-rediscovery.js

# Endpoint validation (when API updates)
node src/explore-archetype-endpoints.js
```

### Monitoring Changes
- Watch for new biomarker categories
- Test new archetype types as they become available
- Validate authentication patterns remain consistent
- Monitor performance characteristics over time

---

## 🎯 Next Steps

1. **Run Initial Discovery**: `npm run analyze` to understand current capabilities
2. **Review Results**: Check `data-analysis/discovery-results-latest.json`
3. **Integrate Findings**: Use discoveries in your health applications
4. **Monitor Updates**: Re-run discovery when Sahha releases updates
5. **Contribute Improvements**: Add new test patterns as needed

---

**This analytics project provides the foundation for all Sahha API integration work, ensuring you understand exactly what's available and how to use it optimally.**