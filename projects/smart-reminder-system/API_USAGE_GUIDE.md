# Sahha API Usage Guide & Recommendations

## Overview
This guide provides comprehensive insights into Sahha API usage based on our Smart Reminder System implementation, including best practices, optimization strategies, and recommendations for production deployment.

## Current Implementation Status

### ✅ Successfully Implemented
- **Account-level Authentication**: Working with provided token
- **Biomarker Data Retrieval**: 104+ data points processed
- **Real-time Data Integration**: Live API calls with error handling
- **Data Processing Pipeline**: Biomarker analysis and health scoring
- **Focused API Builders**: Specialized endpoints for different use cases

### 📊 Current Data Usage
```
Total Biomarkers Retrieved: 104 data points
Categories: sleep, activity
Time Range: 7 days
Profile: SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28
Authentication: Account-level token
```

## API Usage Patterns

### 1. Authentication Strategy
**Current**: Account-level authentication
```javascript
headers: {
  'Authorization': `account ${accountToken}`,
  'Content-Type': 'application/json'
}
```

**Recommendation**: Consider implementing OAuth2.0 profile-based authentication for production users.

### 2. Data Retrieval Patterns
**Current Implementation**:
```javascript
// Generic biomarker retrieval
const biomarkers = await getBiomarkers(profileId, startDate, endDate, ['sleep', 'activity']);
```

**Optimized Approach**:
```javascript
// Focused API calls for specific use cases
const morningCheckup = await buildMorningCheckupAPI(); // 4 key metrics
const workoutPlanning = await buildWorkoutPlanningAPI(); // 4 targeted metrics
const hydrationMonitoring = await buildHydrationAPI(); // 3 activity metrics
```

### 3. Data Processing Efficiency
**Current**: Processing 104 biomarker data points
**Recommendation**: Implement data caching and incremental updates

```javascript
// Suggested caching strategy
const cacheKey = `biomarkers_${profileId}_${dateRange}`;
const cachedData = await cache.get(cacheKey);
if (!cachedData || isExpired(cachedData)) {
  const freshData = await fetchBiomarkers();
  await cache.set(cacheKey, freshData, TTL_15_MINUTES);
}
```

## API Optimization Recommendations

### 1. Endpoint Specialization
Instead of broad biomarker queries, use focused endpoints:

**Morning Health Checkup API**:
```
GET /api/v1/profile/biomarker/{profileId}
?startDateTime=2025-07-10&endDateTime=2025-07-11
&categories=sleep&categories=activity
&types=sleep_duration&types=sleep_start_time&types=steps&types=active_duration
```

**Workout Planning API**:
```
GET /api/v1/profile/biomarker/{profileId}
?startDateTime=2025-07-08&endDateTime=2025-07-11
&categories=sleep&categories=activity
&types=sleep_debt&types=sleep_efficiency&types=active_energy_burned&types=activity_high_intensity_duration
```

**Benefits**:
- Reduced payload size (4 metrics vs 104 data points)
- Faster response times
- Lower bandwidth usage
- Targeted data processing

### 2. Batch Processing Strategy
**Current**: Individual API calls for each use case
**Recommended**: Batch similar requests

```javascript
// Batch multiple biomarker types in single request
const comprehensiveHealthData = await getBiomarkers(
  profileId, 
  startDate, 
  endDate,
  ['sleep', 'activity', 'body'], // Multiple categories
  ['sleep_duration', 'sleep_efficiency', 'steps', 'active_energy_burned', 'heart_rate_variability'] // Comprehensive metrics
);
```

### 3. Real-time vs Scheduled Updates
**Current**: On-demand API calls
**Recommended**: Hybrid approach

```javascript
// Immediate response with cached data + background refresh
async function getHealthData(profileId) {
  const cached = await getFromCache(profileId);
  
  // Return cached data immediately
  if (cached && !isStale(cached)) {
    scheduleBackgroundRefresh(profileId); // Async update
    return cached;
  }
  
  // Fetch fresh data if cache is stale
  return await fetchFreshData(profileId);
}
```

## Advanced API Usage Patterns

### 1. Trend Analysis Optimization
**Current**: Retrieving 7 days of data for trend analysis
**Recommendation**: Implement sliding window approach

```javascript
// Sliding window for trend analysis
const trendData = await getBiomarkers(
  profileId,
  last30Days,
  today,
  ['sleep'],
  ['sleep_duration', 'sleep_efficiency', 'sleep_regularity']
);

// Process in time windows
const weeklyTrends = processTimeWindows(trendData, 'weekly');
const monthlyPatterns = processTimeWindows(trendData, 'monthly');
```

### 2. Predictive Health Scoring
**Current**: Reactive health scoring based on current data
**Recommendation**: Implement predictive analytics

```javascript
// Predictive health scoring
const healthPrediction = await calculatePredictiveScore({
  historical: last30DaysData,
  current: todaysData,
  patterns: userPatterns,
  goals: userGoals
});
```

### 3. Contextual Data Enrichment
**Current**: Basic biomarker data
**Recommendation**: Enrich with contextual information

```javascript
// Contextual data enrichment
const enrichedData = await enrichBiomarkerData(biomarkers, {
  weather: await getWeatherData(userLocation),
  calendar: await getCalendarEvents(userId),
  sleep_environment: await getSleepEnvironmentData(userId)
});
```

## Production Deployment Recommendations

### 1. API Key Management
**Current**: Single account token
**Recommendations**:
- Implement user-specific API keys
- Use environment-based key rotation
- Implement API key scoping (read-only vs read-write)

```javascript
// Environment-based API key management
const apiKeys = {
  development: process.env.SAHHA_DEV_KEY,
  staging: process.env.SAHHA_STAGING_KEY,
  production: process.env.SAHHA_PROD_KEY
};
```

### 2. Rate Limiting & Throttling
**Current**: No rate limiting implemented
**Recommendations**:
```javascript
// Implement rate limiting
const rateLimiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'hour',
  fireImmediately: true
});

// Exponential backoff for retries
const retryOptions = {
  retries: 3,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 60000
};
```

### 3. Error Handling & Resilience
**Current**: Basic error handling
**Recommendations**:
```javascript
// Circuit breaker pattern
const circuitBreaker = new CircuitBreaker(sahhaApiCall, {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});

// Graceful degradation
async function getHealthDataWithFallback(profileId) {
  try {
    return await sahhaApi.getBiomarkers(profileId);
  } catch (error) {
    logger.warn('Sahha API unavailable, using cached data');
    return await getCachedHealthData(profileId);
  }
}
```

## Recommended API Keys & Access Levels

### 1. Development Environment
- **Current**: Account-level token (full access)
- **Recommended**: Sandbox-specific keys with limited scope

### 2. Production Environment
**Required API Keys**:
1. **User Profile Management**: For creating/managing user profiles
2. **Biomarker Data Access**: Read-only access to health data
3. **Device Information**: Access to device/sensor data
4. **Analytics & Insights**: Access to processed health insights
5. **Webhook Notifications**: For real-time data updates

### 3. Suggested Key Scopes
```javascript
// Proposed API key scopes
const apiKeyScopes = {
  'profile:read': 'Read user profile information',
  'profile:write': 'Create and update user profiles',
  'biomarker:read': 'Read biomarker data',
  'insights:read': 'Access processed health insights',
  'webhooks:manage': 'Manage webhook subscriptions'
};
```

## Performance Optimization Strategies

### 1. Data Compression
**Recommendation**: Implement gzip compression for large datasets
```javascript
// Enable compression for API responses
const compression = require('compression');
app.use(compression());
```

### 2. Pagination for Large Datasets
**Current**: Retrieving all data at once
**Recommended**: Implement pagination
```javascript
// Paginated biomarker retrieval
const paginatedData = await getBiomarkers(profileId, {
  startDate,
  endDate,
  limit: 100,
  offset: 0,
  categories: ['sleep', 'activity']
});
```

### 3. Intelligent Caching Strategy
```javascript
// Multi-layer caching
const cacheStrategy = {
  L1: 'Memory cache (1 minute)', // Immediate responses
  L2: 'Redis cache (15 minutes)', // Shared across instances
  L3: 'Database cache (1 hour)'   // Persistent storage
};
```

## Next Steps & Recommendations

### 1. Immediate Actions
1. **Set up user-specific API keys** for production deployment
2. **Implement rate limiting** to prevent API abuse
3. **Add webhook subscriptions** for real-time data updates
4. **Create API key rotation strategy** for security

### 2. Medium-term Improvements
1. **Implement predictive analytics** using historical data
2. **Add geolocation context** for environmental health factors
3. **Create custom health scores** based on user goals
4. **Implement machine learning** for pattern recognition

### 3. Long-term Vision
1. **Real-time health monitoring** with streaming data
2. **Personalized AI health coaching** based on individual patterns
3. **Integration with wearable devices** for continuous monitoring
4. **Social health features** for community support

## API Key Requirements Summary

For production deployment, please provide:

1. **User Profile API Keys**: For managing individual user accounts
2. **Biomarker Read Access**: For retrieving health data
3. **Webhook Access**: For real-time data updates
4. **Analytics API Keys**: For accessing processed insights
5. **Device Management Keys**: For sensor/device integration

This will enable us to implement a robust, scalable health monitoring system with real-time notifications, predictive analytics, and personalized health coaching capabilities.

## Technical Contact & Support

For API key provisioning and technical questions, please coordinate with the Sahha team regarding:
- Production API key allocation
- Webhook endpoint configuration
- Rate limiting adjustments
- Custom metric development

The Smart Reminder System is ready for production deployment with the recommended API enhancements.