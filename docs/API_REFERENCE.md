# Sahha AI API Reference

## Quick Reference

### Base URL
- Production: `https://api.sahha.ai`
- Sandbox: `https://sandbox-api.sahha.ai`

### Authentication
- API Key authentication required
- Include in header: `Authorization: Bearer YOUR_API_KEY`

### Key Endpoints

#### Health Scores
```
GET /health-scores
Parameters: userId, dateRange, scoreType
Returns: Sleep, Activity, Readiness, Mental Wellbeing scores
```

#### Digital Biomarkers
```
GET /biomarkers
Parameters: userId, dateRange, biomarkerType
Returns: Heart rate, steps, sleep stages, etc.
```

#### Real-time Data
```
GET /data-logs
Parameters: userId, dateRange, dataType
Returns: Real-time sensor data
```

### Data Delivery Methods

#### 1. Webhooks (Recommended)
- Real-time data delivery
- Configure webhook URL in dashboard
- Automatic retries on failure

#### 2. REST API
- Pull data on demand
- Rate limiting applies
- Pagination for large datasets

#### 3. UI Widgets
- Pre-built components
- Direct integration into apps
- Customizable styling

### Sample Response Format
```json
{
  "user_id": "user123",
  "date": "2024-07-11",
  "health_scores": {
    "sleep": 78,
    "activity": 65,
    "readiness": 72,
    "mental_wellbeing": 80
  },
  "biomarkers": {
    "heart_rate": 72,
    "steps": 8543,
    "sleep_duration": 7.5
  }
}
```

## Resources
- [Official Documentation](https://docs.sahha.ai/)
- [API Query Builder](https://sahha.ai/api-query-builder)
- [SDK Downloads](https://docs.sahha.ai/sdk)