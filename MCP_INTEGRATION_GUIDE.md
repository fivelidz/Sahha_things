# Sahha MCP Integration Guide for AI Agents

Complete guide for setting up and using the Sahha Model Context Protocol (MCP) server with AI agents and assistants.

**Author**: Alexei Brown (Fivelidz)  
**Repository**: https://github.com/fivelidz/Sahha_things

## 🎯 Overview

This guide shows you how to integrate the clean Sahha MCP wrapper with various AI systems to enable intelligent health data analysis and insights.

## 🏗️ Architecture Overview

```
AI Agent (Claude Code, Custom Client, etc.)
    ↕ MCP Protocol (JSON-RPC over stdio)
Sahha MCP Wrapper Server
    ↕ HTTPS API calls
Sahha Health Platform
```

The MCP wrapper provides:
- **Optimized biomarker patterns** for common health use cases
- **Real-time health analysis** with actionable insights  
- **Type-safe interfaces** with comprehensive validation
- **Production-ready architecture** with error handling

## 🚀 Quick Setup

### 1. Prerequisites

```bash
# Check Node.js version (18+ required)
node --version

# Clone repository
git clone https://github.com/fivelidz/Sahha_things.git
cd Sahha_things/sahha-mcp-wrapper
```

### 2. Installation & Configuration

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env with your Sahha credentials
SAHHA_API_URL=https://sandbox.sahha.health/api
SAHHA_TOKEN=your_account_token_here
DEBUG=true
```

### 3. Build & Test

```bash
# Build TypeScript
npm run build

# Test server startup
npm start
# Should output: "Sahha MCP Server started successfully"
```

## 🤖 AI Agent Integration

### Claude Code Integration

Claude Code automatically detects MCP servers running on stdio:

```bash
# Start the MCP server
cd sahha-mcp-wrapper
npm start

# In another terminal, start Claude Code
# Claude will automatically discover the MCP server
```

**Usage in Claude Code:**
```
Get my morning health check using the Sahha MCP server and 
provide recommendations for today based on my readiness level.
```

### Python Client Integration

```python
import asyncio
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def use_sahha_mcp():
    # Connect to Sahha MCP server
    server_params = StdioServerParameters(
        command="node",
        args=["path/to/sahha-mcp-wrapper/dist/server.js"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the session
            await session.initialize()
            
            # Get health score
            result = await session.call_tool(
                "get_health_score",
                {"profileId": "user-123"}
            )
            
            print("Health Score:", json.dumps(result.content, indent=2))

# Run the example
asyncio.run(use_sahha_mcp())
```

### TypeScript Client Integration

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function useS ahhaMCP() {
  // Create MCP client
  const client = new Client({
    name: 'health-app',
    version: '1.0.0',
  });

  // Connect to Sahha MCP server
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['path/to/sahha-mcp-wrapper/dist/server.js'],
  });

  await client.connect(transport);

  try {
    // Get optimized biomarkers for morning health check
    const result = await client.request({
      method: 'tools/call',
      params: {
        name: 'get_optimized_biomarkers',
        arguments: {
          profileId: 'user-123',
          useCase: 'morning_health_check',
        },
      },
    });

    console.log('Morning Health Check:', result);
  } finally {
    await client.close();
  }
}

useS ahhaMCP().catch(console.error);
```

### Custom Integration with HTTP Bridge

For systems that don't support stdio, create an HTTP bridge:

```typescript
// http-bridge.ts
import express from 'express';
import { SahhaMCPServer } from './sahha-mcp-wrapper/dist/server.js';

const app = express();
app.use(express.json());

const mcpServer = new SahhaMCPServer();

app.post('/mcp/tools/:toolName', async (req, res) => {
  try {
    const result = await mcpServer.callTool(req.params.toolName, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Sahha MCP HTTP bridge running on port 3000');
});
```

## 📋 Available MCP Resources

### Resource: `sahha://biomarkers`

Lists all available biomarkers with categories:

```bash
# CLI example
echo '{"method": "resources/read", "params": {"uri": "sahha://biomarkers"}}' | npm start
```

**Response:**
```json
{
  "categories": {
    "sleep": {
      "biomarkers": ["sleep_duration", "sleep_quality", "sleep_efficiency"],
      "description": "Sleep quality and duration metrics"
    },
    "activity": {
      "biomarkers": ["steps", "distance", "calories_burned"],
      "description": "Physical activity and movement data"
    }
  },
  "total": 25
}
```

### Resource: `sahha://optimization-patterns`

Pre-defined biomarker combinations for common use cases:

```json
{
  "morning_health_check": {
    "biomarkers": ["sleep_duration", "sleep_quality", "readiness_score", "energy_level", "stress_level"],
    "description": "Essential biomarkers for daily health evaluation"
  },
  "workout_readiness": {
    "biomarkers": ["recovery_heart_rate", "heart_rate_variability", "sleep_quality", "energy_level"],
    "description": "Biomarkers to determine optimal workout intensity"
  }
}
```

### Resource: `sahha://profile/{profileId}`

Individual health profile data:

```json
{
  "profileId": "user-123",
  "biomarkers": [
    {
      "type": "sleep_duration",
      "value": 480,
      "unit": "minutes",
      "startDateTime": "2025-01-15T00:00:00Z"
    }
  ],
  "dataQuality": "excellent"
}
```

## 🛠️ Available MCP Tools

### Tool: `get_health_score`

**Purpose**: Calculate comprehensive health readiness score

**Input Schema:**
```json
{
  "profileId": "string (required)",
  "date": "string (optional, YYYY-MM-DD format)"
}
```

**Example Usage:**
```typescript
const healthScore = await client.callTool('get_health_score', {
  profileId: 'user-123',
  date: '2025-01-15'
});
```

**Response:**
```json
{
  "healthScore": 85,
  "readinessLevel": "Good",
  "components": {
    "sleep_quality": 90,
    "energy_level": 80,
    "stress_level": 75
  },
  "recommendations": [
    "Maintain current sleep habits",
    "Consider light stress management techniques"
  ]
}
```

### Tool: `get_optimized_biomarkers`

**Purpose**: Get biomarkers optimized for specific health use cases

**Input Schema:**
```json
{
  "profileId": "string (required)",
  "useCase": "enum (optional): morning_health_check | workout_readiness | sleep_optimization | stress_assessment | recovery_analysis",
  "timeRange": "enum (optional): today | week | month"
}
```

**Use Case Examples:**

#### Morning Health Check
```typescript
const morningCheck = await client.callTool('get_optimized_biomarkers', {
  profileId: 'user-123',
  useCase: 'morning_health_check',
  timeRange: 'today'
});
```

#### Workout Readiness
```typescript
const workoutReady = await client.callTool('get_optimized_biomarkers', {
  profileId: 'user-123',
  useCase: 'workout_readiness'
});
```

#### Sleep Optimization
```typescript
const sleepAnalysis = await client.callTool('get_optimized_biomarkers', {
  profileId: 'user-123',
  useCase: 'sleep_optimization',
  timeRange: 'week'
});
```

### Tool: `generate_health_insights`

**Purpose**: Generate AI-readable health insights and recommendations

**Input Schema:**
```json
{
  "profileId": "string (required)",
  "focus": "enum (optional): sleep | activity | stress | recovery | overall",
  "format": "enum (optional): summary | detailed | actionable"
}
```

**Example Usage:**
```typescript
const insights = await client.callTool('generate_health_insights', {
  profileId: 'user-123',
  focus: 'sleep',
  format: 'actionable'
});
```

### Tool: `get_biomarker_trends`

**Purpose**: Analyze biomarker trends over time

**Input Schema:**
```json
{
  "profileId": "string (required)",
  "biomarkers": "array of strings (optional)",
  "period": "enum (optional): 7d | 14d | 30d"
}
```

**Example Usage:**
```typescript
const trends = await client.callTool('get_biomarker_trends', {
  profileId: 'user-123',
  biomarkers: ['sleep_quality', 'energy_level'],
  period: '30d'
});
```

## 💡 Common Use Cases & Examples

### 1. Daily Health Dashboard

```typescript
async function createDailyDashboard(profileId: string) {
  // Get morning health check
  const healthCheck = await client.callTool('get_optimized_biomarkers', {
    profileId,
    useCase: 'morning_health_check'
  });

  // Get overall health score
  const healthScore = await client.callTool('get_health_score', {
    profileId
  });

  // Generate insights
  const insights = await client.callTool('generate_health_insights', {
    profileId,
    focus: 'overall',
    format: 'summary'
  });

  return {
    healthCheck,
    healthScore,
    insights,
    timestamp: new Date().toISOString()
  };
}
```

### 2. Workout Planning Assistant

```typescript
async function planWorkout(profileId: string) {
  // Check workout readiness
  const readiness = await client.callTool('get_optimized_biomarkers', {
    profileId,
    useCase: 'workout_readiness'
  });

  // Get recovery trends
  const trends = await client.callTool('get_biomarker_trends', {
    profileId,
    biomarkers: ['recovery_heart_rate', 'energy_level'],
    period: '7d'
  });

  // Generate workout recommendations
  const recommendations = await client.callTool('generate_health_insights', {
    profileId,
    focus: 'recovery',
    format: 'actionable'
  });

  return {
    readiness: readiness.analysis,
    trends,
    recommendations,
    workoutAdvice: generateWorkoutAdvice(readiness, trends)
  };
}

function generateWorkoutAdvice(readiness: any, trends: any): string {
  // Custom logic based on readiness and trends
  if (readiness.readinessLevel === 'Excellent') {
    return 'Perfect day for high-intensity training';
  } else if (readiness.readinessLevel === 'Good') {
    return 'Moderate intensity workout recommended';
  } else {
    return 'Consider light activity or rest day';
  }
}
```

### 3. Sleep Optimization Coach

```typescript
async function optimizeSleep(profileId: string) {
  // Get sleep-specific data
  const sleepData = await client.callTool('get_optimized_biomarkers', {
    profileId,
    useCase: 'sleep_optimization',
    timeRange: 'week'
  });

  // Analyze sleep trends
  const sleepTrends = await client.callTool('get_biomarker_trends', {
    profileId,
    biomarkers: ['sleep_duration', 'sleep_quality', 'sleep_efficiency'],
    period: '30d'
  });

  // Generate sleep insights
  const sleepInsights = await client.callTool('generate_health_insights', {
    profileId,
    focus: 'sleep',
    format: 'detailed'
  });

  return {
    currentSleepStatus: sleepData.analysis,
    trends: sleepTrends,
    insights: sleepInsights,
    sleepPlan: generateSleepPlan(sleepData, sleepTrends)
  };
}
```

### 4. Stress Management Assistant

```typescript
async function manageStress(profileId: string) {
  // Real-time stress assessment
  const stressData = await client.callTool('get_optimized_biomarkers', {
    profileId,
    useCase: 'stress_assessment',
    timeRange: 'today'
  });

  // Get stress insights
  const stressInsights = await client.callTool('generate_health_insights', {
    profileId,
    focus: 'stress',
    format: 'actionable'
  });

  return {
    currentStressLevel: stressData.analysis,
    insights: stressInsights,
    immediateActions: generateStressActions(stressData),
    relaxationTechniques: getRelaxationTechniques(stressData.analysis.stressLevel)
  };
}
```

## 🔧 Advanced Configuration

### Custom Biomarker Selection

For specific use cases not covered by predefined patterns:

```typescript
// Get custom biomarker selection
const customData = await client.callTool('get_optimized_biomarkers', {
  profileId: 'user-123',
  // Don't specify useCase to get all available biomarkers
  timeRange: 'today'
});

// Filter to specific biomarkers you need
const filteredBiomarkers = customData.analysis.biomarkers.filter(b => 
  ['sleep_quality', 'stress_level', 'energy_level'].includes(b.type)
);
```

### Error Handling

```typescript
async function robustHealthCheck(profileId: string) {
  try {
    const result = await client.callTool('get_health_score', { profileId });
    return result;
  } catch (error) {
    if (error.message.includes('Profile not found')) {
      return { error: 'Profile not found', profileId };
    } else if (error.message.includes('No recent data')) {
      return { 
        error: 'No recent health data available',
        recommendation: 'Sync health devices and try again'
      };
    } else {
      throw error; // Re-throw unexpected errors
    }
  }
}
```

### Performance Optimization

```typescript
// Batch multiple requests efficiently
async function batchHealthAnalysis(profileId: string) {
  // Run requests in parallel
  const [healthScore, morningCheck, sleepData] = await Promise.all([
    client.callTool('get_health_score', { profileId }),
    client.callTool('get_optimized_biomarkers', { 
      profileId, 
      useCase: 'morning_health_check' 
    }),
    client.callTool('get_optimized_biomarkers', { 
      profileId, 
      useCase: 'sleep_optimization' 
    })
  ]);

  return { healthScore, morningCheck, sleepData };
}
```

## 🚨 Troubleshooting

### Common Issues

#### MCP Server Won't Start
```bash
# Check Node.js version
node --version  # Should be 18+

# Check for TypeScript compilation errors
npm run build

# Enable debug mode
DEBUG=true npm start
```

#### No Biomarker Data Returned
```bash
# Verify Sahha token
curl -H "Authorization: account YOUR_TOKEN" \
  https://sandbox.sahha.health/api/v1/profile/token/verify

# Check profile ID exists
# Ensure health data is synced in Sahha
```

#### MCP Protocol Errors
```typescript
// Add error logging to client
client.onError((error) => {
  console.error('MCP Error:', error);
});

// Check server logs
DEBUG=true npm start 2>&1 | grep ERROR
```

### Debug Mode

Enable comprehensive debugging:

```bash
# Server debug mode
DEBUG=true NODE_ENV=development npm start

# Client debug mode (add to your client code)
const client = new Client({
  name: 'debug-client',
  version: '1.0.0',
}, {
  debug: true
});
```

## 📊 Performance Considerations

### Optimization Tips

1. **Use Specific Use Cases**: Always specify `useCase` when possible
2. **Batch Requests**: Run multiple tools in parallel with `Promise.all()`
3. **Cache Results**: Cache health scores and insights for reasonable periods
4. **Monitor Response Times**: Track MCP call performance

### Biomarker Selection Efficiency

| Use Case | Biomarkers | Efficiency |
|----------|------------|------------|
| Morning Health Check | 5 essential | Excellent |
| Workout Readiness | 6 recovery-focused | Very Good |
| Sleep Optimization | 6 sleep-specific | Good |
| Stress Assessment | 4 stress indicators | Excellent |
| Recovery Analysis | 5 recovery metrics | Very Good |

## 🔒 Security & Privacy

### API Token Security

```typescript
// Never log or expose tokens
const client = new SahhaAPI({
  token: process.env.SAHHA_TOKEN, // Use environment variables
  apiUrl: process.env.SAHHA_API_URL,
  debug: false // Disable debug in production
});
```

### Profile ID Validation

```typescript
function validateProfileId(profileId: string): boolean {
  // Implement your profile ID validation logic
  return /^[a-zA-Z0-9-_]+$/.test(profileId) && profileId.length > 0;
}
```

## 📚 Additional Resources

- **Official MCP Documentation**: https://modelcontextprotocol.io
- **Sahha API Documentation**: https://docs.sahha.health
- **TypeScript MCP SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **Python MCP SDK**: https://github.com/modelcontextprotocol/python-sdk
- **Repository**: https://github.com/fivelidz/Sahha_things

## 🤝 Support & Contributing

For questions, issues, or commercial licensing:

**Contact**: Alexei Brown (Fivelidz) - alexeitrbrown@gmail.com  
**License**: Custom Research License (see LICENSE)  
**Repository**: https://github.com/fivelidz/Sahha_things

---

**This integration guide enables AI agents to intelligently access and analyze Sahha health data through a clean, optimized MCP interface. Built by Alexei Brown (Fivelidz) for advancing AI-health integration research.**