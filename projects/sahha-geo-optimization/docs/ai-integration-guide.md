# Sahha API: AI Integration Guide
## Generative Engine Optimization (GEO) Documentation

> **Purpose**: Help AI tools like Claude, ChatGPT, and GitHub Copilot understand and work effectively with Sahha's health data API.

---

## 🚀 Quick Start for AI Tools

### Authentication Pattern (CRITICAL)
```javascript
const headers = {
    'Authorization': `account ${accountToken}`,  // NOT "Bearer"
    'Content-Type': 'application/json'
};
```

### Base Configuration
```javascript
const config = {
    baseURL: 'https://sandbox-api.sahha.ai',  // Sandbox
    // baseURL: 'https://api.sahha.ai',       // Production
    profileId: 'your-profile-id-here'
};
```

---

## 📊 Data Categories Overview

| Category | Purpose | Data Volume | Key Insight |
|----------|---------|-------------|-------------|
| **Biomarkers** | Raw health metrics | 184 items/week | Sleep (94) + Activity (90) |
| **Archetypes** | Behavioral patterns | 9 types | Weekly classifications |
| **Scores** | Calculated insights | 13-15 items | Sleep/Activity scores |
| **Demographics** | Profile info | 1 record | Basic user data |

---

## 🎯 Working API Patterns

### 1. Biomarkers (CATEGORY-SPECIFIC REQUIRED)
```javascript
// ✅ WORKS - Category-specific calls
const sleepUrl = `/api/v1/profile/biomarker/${profileId}?startDateTime=2025-06-01&endDateTime=2025-07-11&categories=sleep`;
const activityUrl = `/api/v1/profile/biomarker/${profileId}?startDateTime=2025-06-01&endDateTime=2025-07-11&categories=activity`;

// ❌ FAILS - Generic "all biomarkers" call
const failUrl = `/api/v1/profile/biomarker/${profileId}?startDateTime=2025-06-01&endDateTime=2025-07-11`;
```

**Available Categories:**
- `sleep` (94 biomarkers) - sleep_duration, sleep_regularity, sleep_debt, etc.
- `activity` (90 biomarkers) - steps, distance, calories, etc.
- `body`, `device`, `heart`, `mental`, `nutrition`, `environment` (0 items each - test before using)

### 2. Archetypes (WEEKLY ONLY)
```javascript
// ✅ WORKS - Weekly periodicity
const archetypeUrl = `/api/v1/profile/archetypes/${profileId}?name=sleep_pattern&periodicity=weekly&startDateTime=2025-06-01&endDateTime=2025-07-11`;

// ✅ WORKS - General discovery (returns all available)
const allArchetypes = `/api/v1/profile/archetypes/${profileId}?startDateTime=2025-06-01&endDateTime=2025-07-11`;

// ❌ NO DATA - Daily or monthly
// Don't use periodicity=daily or periodicity=monthly
```

**Available Archetype Types (9 confirmed):**
1. `overall_wellness` → "good_wellness"
2. `activity_level` → "lightly_active"  
3. `mental_wellness` → "good_mental_wellness"
4. `sleep_duration` → "average_sleeper"
5. `sleep_regularity` → "highly_regular_sleeper"
6. `bed_schedule` → "early_sleeper"
7. `wake_schedule` → "early_riser"
8. `sleep_pattern` → "consistent_early_sleeper"
9. `sleep_quality` → "optimal_sleep_quality"

### 3. Scores (MULTIPLE WORKING ENDPOINTS)
```javascript
// ✅ WORKS - Type-specific scores
const sleepScores = `/api/v1/profile/score/${profileId}?types=sleep`;
const activityScores = `/api/v1/profile/score/${profileId}?types=activity`;
const readinessScores = `/api/v1/profile/score/${profileId}?types=readiness`;
```

---

## 🛠️ Common AI Coding Patterns

### Complete Health Dashboard
```javascript
async function getHealthDashboard(profileId, accountToken) {
    const client = axios.create({
        baseURL: 'https://sandbox-api.sahha.ai',
        headers: { 'Authorization': `account ${accountToken}` }
    });
    
    const dateRange = {
        start: '2025-06-01',
        end: '2025-07-11'
    };
    
    // Parallel data collection for performance
    const [sleepData, activityData, archetypes, scores] = await Promise.all([
        client.get(`/api/v1/profile/biomarker/${profileId}?startDateTime=${dateRange.start}&endDateTime=${dateRange.end}&categories=sleep`),
        client.get(`/api/v1/profile/biomarker/${profileId}?startDateTime=${dateRange.start}&endDateTime=${dateRange.end}&categories=activity`),
        client.get(`/api/v1/profile/archetypes/${profileId}?startDateTime=${dateRange.start}&endDateTime=${dateRange.end}`),
        client.get(`/api/v1/profile/score/${profileId}?types=sleep`)
    ]);
    
    return {
        sleep: sleepData.data,
        activity: activityData.data,
        behavioral: archetypes.data,
        scores: scores.data
    };
}
```

### Morning Health Check Pattern
```javascript
async function getMorningHealthCheck(profileId, accountToken) {
    // Focus on key morning metrics
    const sleepBiomarkers = await getSleepBiomarkers(['sleep_duration', 'sleep_quality', 'sleep_debt']);
    const sleepArchetype = await getArchetype('sleep_pattern');
    const readinessScore = await getScore('readiness');
    
    return {
        summary: `${sleepArchetype.value} with ${sleepBiomarkers.duration}h sleep`,
        readiness: readinessScore.value,
        sleepDebt: sleepBiomarkers.debt,
        recommendation: generateMorningRecommendation(sleepArchetype, readinessScore)
    };
}
```

---

## 🚨 Critical AI Guidance

### What Would Have Helped Me Most:

1. **API Discovery Strategy**
   - Always test category-specific biomarker calls first
   - Use general archetype endpoint to discover available types
   - Don't assume "list all" endpoints exist

2. **Error Handling Patterns**
   ```javascript
   // 400 Error = Missing required parameters (usually categories)
   // 404 Error = Endpoint doesn't exist
   // 200 with 0 items = Valid endpoint, no data for parameters
   ```

3. **Data Structure Expectations**
   - Biomarkers: Numeric values with units and aggregation types
   - Archetypes: Categorical classifications (ordinal data)
   - Scores: Calculated metrics (0-100 scale typically)

4. **Performance Optimization**
   - Use parallel requests for different data types
   - Cache archetype discoveries (they're consistent)
   - Category-specific calls are faster than broad queries

---

## 🎯 Use Case Library

### Workout Planning Assistant
```javascript
const workoutReadiness = {
    biomarkers: ['sleep_debt', 'recovery_score', 'activity_readiness'],
    archetypes: ['activity_level', 'sleep_quality'],
    logic: 'High readiness + low sleep debt = optimal workout window'
};
```

### Sleep Optimization Coach
```javascript
const sleepOptimization = {
    biomarkers: ['sleep_regularity', 'sleep_duration', 'sleep_efficiency'],
    archetypes: ['bed_schedule', 'wake_schedule', 'sleep_pattern'],
    logic: 'Track patterns to identify optimal sleep timing'
};
```

### Wellness Monitoring
```javascript
const wellnessMonitoring = {
    biomarkers: ['heart_rate_variability', 'steps', 'active_minutes'],
    archetypes: ['overall_wellness', 'mental_wellness', 'activity_level'],
    logic: 'Holistic view of physical and mental health trends'
};
```

---

## 🔧 AI Tool Configuration

### For Claude/ChatGPT Integration:
```markdown
Context: Working with Sahha health data API
Key Points:
- Use account token authentication (not Bearer)
- Category-specific biomarker calls required
- Weekly archetypes only (9 types available)
- Parallel requests for optimal performance
- Test endpoints systematically, no comprehensive listings exist
```

### For GitHub Copilot:
```javascript
// Sahha API helper - copy this pattern
const sahhaRequest = async (endpoint, accountToken) => {
    return axios.get(`https://sandbox-api.sahha.ai${endpoint}`, {
        headers: { 'Authorization': `account ${accountToken}` }
    });
};
```

---

## 📈 Success Metrics for AI Integration

- **Discovery Speed**: Can AI find working endpoints in <5 attempts?
- **Error Recovery**: Does AI understand 400/404 patterns?
- **Pattern Recognition**: Can AI identify category-specific requirements?
- **Use Case Application**: Can AI build practical health scenarios?

---

## 🚀 Next Steps for AI Optimization

1. **Test with multiple AI tools** using this guide
2. **Measure comprehension speed** - how quickly do they "get it"?
3. **Iterate documentation** based on AI feedback
4. **Create interactive examples** for real-time testing
5. **Build AI training datasets** from successful integrations

---

*This guide transforms our systematic API discovery into AI-consumable patterns. The goal: reduce AI integration time from hours to minutes.*