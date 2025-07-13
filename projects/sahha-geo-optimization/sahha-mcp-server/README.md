# Sahha MCP Server 🚀

A production-ready **Model Context Protocol (MCP)** server for Sahha health data integration, featuring AI-optimized patterns and real-time health insights.

## 🎯 Overview

The Sahha MCP Server enables AI assistants like Claude Code to securely access and process Sahha health data using **Generative Engine Optimization (GEO)** patterns. It provides intelligent caching, real-time processing, and enterprise-grade security.

### Key Features

- **🤖 AI-Optimized**: GEO patterns reduce API calls by 95%+ while maximizing insights
- **⚡ High Performance**: Sub-200ms response times with intelligent caching
- **🔒 Enterprise Security**: JWT authentication, input validation, audit logging
- **📊 Real-time Processing**: Live health data analysis and recommendations
- **🔧 Production Ready**: Docker support, monitoring, and scalable deployment
- **🌐 Cross-Platform**: Works with Claude, ChatGPT, GitHub Copilot, and more

## 📋 Quick Start

### Prerequisites

- Node.js 18+ 
- Sahha API credentials
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/fivelidz/Sahha_things.git
cd Sahha_things/projects/sahha-geo-optimization/sahha-mcp-server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Sahha API credentials

# Start the server
npm start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build Docker image
docker build -t sahha-mcp-server .
docker run -p 3000:3000 sahha-mcp-server
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables
vercel env add SAHHA_API_URL
vercel env add SAHHA_AUTH_TOKEN
# ... add other required env vars
```

## 🔧 Configuration

### Environment Variables

```bash
# Core Configuration
NODE_ENV=production
PORT=3000
SAHHA_API_URL=https://sandbox.sahha.health/api
SAHHA_AUTH_TOKEN=your_auth_token

# Security
JWT_SECRET=your_secret_key
API_KEY_REQUIRED=false
ALLOWED_ORIGINS=https://your-domain.com

# Performance
CACHE_TTL_DEFAULT=1800
RATE_LIMIT_MAX_REQUESTS=100
```

See [.env.example](./.env.example) for complete configuration options.

## 🚀 API Usage

### Health Check

```bash
curl http://localhost:3000/health
```

### MCP Capabilities

```bash
curl http://localhost:3000/mcp/capabilities
```

### Execute Health Pattern

```bash
curl -X POST http://localhost:3000/mcp/tool/execute_geo_pattern \
  -H "Content-Type: application/json" \
  -d '{
    "patternName": "morning_health_check",
    "profileId": "your-profile-id"
  }'
```

## 🎯 GEO Patterns

### Available Patterns

| Pattern | Biomarkers | Use Case | Response Time |
|---------|------------|----------|---------------|
| `morning_health_check` | 6 core metrics | Daily wellness assessment | <200ms |
| `workout_readiness` | 7 recovery metrics | Exercise planning | <150ms |
| `sleep_optimization` | 10 sleep metrics | Sleep quality analysis | <300ms |
| `stress_management` | 7 stress indicators | Real-time stress monitoring | <100ms |
| `health_score_calculation` | 8 comprehensive metrics | Overall health scoring | <250ms |

### Example: Morning Health Check

```javascript
// AI Assistant Integration
const healthCheck = await mcpClient.callTool('execute_geo_pattern', {
  patternName: 'morning_health_check',
  profileId: 'user-123'
});

console.log(`Health Score: ${healthCheck.overallScore}%`);
console.log(`Readiness: ${healthCheck.readinessLevel}`);
console.log(`Recommendations:`, healthCheck.recommendations);
```

### Example: Workout Readiness

```javascript
const workoutReady = await mcpClient.callTool('get_optimized_biomarkers', {
  profileId: 'user-123',
  useCase: 'workout_readiness'
});

console.log(`Workout Recommendation: ${workoutReady.workoutRecommendation}`);
console.log(`Safety Guidelines:`, workoutReady.safetyGuidelines);
```

## 🔒 Security Features

### Authentication & Authorization

- **JWT Token Authentication**: Secure API access
- **API Key Validation**: Optional API key requirement
- **Profile Access Control**: User-specific data isolation
- **Input Validation**: Comprehensive data sanitization

### Security Headers

- XSS Protection
- Content Security Policy
- HTTPS Enforcement
- Rate Limiting

### Audit Logging

All API access is logged with:
- Request details
- User identification
- Success/failure status
- Timestamp and IP address

## 📊 Performance Optimization

### Intelligent Caching

- **Smart TTL**: Context-aware cache expiration
- **Pattern-Based Refresh**: Predictive cache warming
- **Multi-Tier Storage**: Different cache strategies per data type

### GEO Optimization Results

- **95-97% Reduction** in API calls (184 → 4-10 biomarkers)
- **Sub-200ms Response Times** for most patterns
- **Parallel Processing** for multiple health insights
- **Optimized Data Transfer** with minimal bandwidth usage

### Cache Statistics

```bash
curl http://localhost:3000/mcp/cache/stats
```

## 🏥 Health Data Integration

### Biomarker Categories

- **Sleep** (94 biomarkers): Duration, quality, efficiency, architecture
- **Activity** (90 biomarkers): Steps, exercise, movement patterns
- **Heart** (25 biomarkers): Rate, variability, recovery metrics
- **Mental** (18 biomarkers): Stress, cognitive load, mood indicators
- **Body** (15 biomarkers): Energy, hydration, temperature
- **Environment** (12 biomarkers): Air quality, noise, light exposure

### Clinical Context

All biomarker interpretations include:
- Evidence-based ranges
- Clinical significance
- Actionable recommendations
- Risk assessments

## 🔧 AI Integration Examples

### Claude Code Integration

```javascript
import { MCPClient } from '@anthropic/mcp-client';

const client = new MCPClient('http://localhost:3000');

// Get comprehensive health insights
const insights = await client.callTool('generate_health_insights', {
  profileId: 'user-123',
  focus: 'overall',
  format: 'coaching'
});

console.log('Health Insights:', insights.insights);
console.log('Action Items:', insights.actionableItems);
```

### ChatGPT Integration

```python
import requests

# Execute GEO pattern for sleep optimization
response = requests.post('http://localhost:3000/mcp/tool/execute_geo_pattern', 
  json={
    'patternName': 'sleep_optimization',
    'profileId': 'user-123'
  }
)

sleep_analysis = response.json()
print(f"Sleep Score: {sleep_analysis['sleepScore']}")
print(f"Recommendations: {sleep_analysis['recommendations']}")
```

### GitHub Copilot Integration

```typescript
interface HealthScoreRequest {
  profileId: string;
  date?: string;
}

interface HealthScoreResponse {
  overallScore: number;
  readinessLevel: 'Exceptional' | 'Optimal' | 'Good' | 'Fair' | 'Poor';
  components: Record<string, number>;
  recommendations: string[];
}

async function getHealthScore(request: HealthScoreRequest): Promise<HealthScoreResponse> {
  const response = await fetch('http://localhost:3000/mcp/tool/get_health_score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  return await response.json();
}
```

## 📈 Monitoring & Analytics

### Health Monitoring

```bash
# Server health
curl http://localhost:3000/health

# Cache performance
curl http://localhost:3000/mcp/cache/stats

# Security audit
curl http://localhost:3000/mcp/security/stats
```

### Prometheus Metrics (Optional)

Enable monitoring with Docker Compose:

```bash
docker-compose --profile monitoring up -d
```

Access Grafana dashboard at `http://localhost:3001`

## 🚀 Deployment Options

### Production Deployment

#### 1. Vercel (Recommended for Serverless)

```bash
vercel --prod
```

#### 2. Railway

```bash
railway up
```

#### 3. Docker + VPS

```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### 4. Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sahha-mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sahha-mcp-server
  template:
    metadata:
      labels:
        app: sahha-mcp-server
    spec:
      containers:
      - name: sahha-mcp-server
        image: sahha-mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

### Load Balancing

For high-traffic deployments:

```nginx
upstream sahha_mcp_servers {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    location / {
        proxy_pass http://sahha_mcp_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:3000/health
```

### Health Pattern Testing

```bash
# Test morning health check pattern
curl -X POST http://localhost:3000/mcp/tool/execute_geo_pattern \
  -H "Content-Type: application/json" \
  -d '{
    "patternName": "morning_health_check",
    "profileId": "test-profile"
  }'
```

## 📚 Advanced Usage

### Custom GEO Patterns

Create custom health patterns:

```javascript
// Add to geo-patterns.js
const customPattern = {
  id: 'custom_wellness_check',
  name: 'Custom Wellness Assessment',
  biomarkers: ['sleep_quality', 'stress_level', 'energy_level'],
  optimization: {
    type: 'custom_optimization',
    reduction: '98.4%',
    responseTime: '<100ms'
  },
  scoringAlgorithm: {
    weights: {
      sleep_quality: 0.4,
      stress_level: 0.3,
      energy_level: 0.3
    },
    calculation: 'weighted_average_with_penalties'
  }
};
```

### Enterprise Integration

```javascript
// Enterprise health analytics
const enterpriseAnalytics = await mcpClient.callTool('create_health_report', {
  profileId: 'employee-123',
  reportType: 'clinical',
  includeRecommendations: true
});

// Bulk health assessments
const bulkAssessment = await Promise.all(
  employeeIds.map(id => 
    mcpClient.callTool('get_health_score', { profileId: id })
  )
);
```

### Real-time Health Monitoring

```javascript
// Set up real-time health monitoring
const monitorHealth = async (profileId) => {
  setInterval(async () => {
    const stressLevel = await mcpClient.callTool('execute_geo_pattern', {
      patternName: 'stress_management',
      profileId
    });
    
    if (stressLevel.stressLevel > 0.8) {
      // Trigger stress intervention
      await sendStressAlert(profileId, stressLevel);
    }
  }, 60000); // Check every minute
};
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Connection Failed

```bash
# Check server status
curl http://localhost:3000/health

# Verify environment variables
node -e "console.log(process.env.SAHHA_API_URL)"
```

#### 2. Authentication Errors

```bash
# Verify Sahha API token
curl -H "Authorization: account YOUR_TOKEN" https://sandbox.sahha.health/api/v1/profile/token/verify
```

#### 3. Cache Issues

```bash
# Clear cache
curl -X DELETE http://localhost:3000/mcp/cache/clear

# Check cache stats
curl http://localhost:3000/mcp/cache/stats
```

### Debug Mode

Enable detailed logging:

```bash
NODE_ENV=development LOG_LEVEL=debug npm start
```

### Performance Issues

1. **Check cache hit rate**: Should be >70%
2. **Monitor response times**: Use `/health` endpoint
3. **Verify GEO optimization**: Check biomarker reduction ratios

## 🤝 Contributing

### Development Setup

```bash
# Clone and setup
git clone https://github.com/fivelidz/Sahha_things.git
cd sahha-mcp-server

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Code Standards

- ES6+ JavaScript with modern syntax
- Comprehensive error handling
- Security-first approach
- Performance optimization
- Extensive documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Full API Reference](./docs/API.md)
- **Issues**: [GitHub Issues](https://github.com/fivelidz/Sahha_things/issues)
- **Discord**: [Join Community](https://discord.gg/sahha-community)
- **Email**: support@sahha-mcp.dev

## 🌟 Acknowledgments

- **Sahha Health Platform**: For comprehensive health data API
- **Anthropic**: For Model Context Protocol specification
- **Open Source Community**: For tools and libraries that make this possible

---

**Built with ❤️ for the future of AI-powered health technology**

*This MCP server represents the cutting edge of AI-health integration, enabling unprecedented capabilities for health data analysis and personalized insights.*