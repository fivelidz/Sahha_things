# Sahha MCP Wrapper

A clean, focused **Model Context Protocol (MCP)** server for Sahha health data integration. This wrapper provides AI agents with optimized access to Sahha's health biomarkers through the official MCP protocol.

## 🎯 Overview

This MCP server enables AI assistants like Claude Code to efficiently access and analyze Sahha health data using optimized biomarker patterns that reduce API calls while maximizing health insights.

**Author**: Alexei Brown (Fivelidz)  
**License**: Custom Research License (see ../LICENSE)

## ✨ Features

- **Official MCP Protocol**: Built with `@modelcontextprotocol/sdk`
- **Optimized Biomarker Selection**: Intelligent patterns reduce API overhead
- **Real-time Health Analysis**: Live biomarker processing and insights
- **TypeScript Support**: Fully typed for development safety
- **Clean Architecture**: Focused, maintainable codebase
- **Production Ready**: Error handling, validation, and logging

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Sahha API account and token
- AI assistant that supports MCP (like Claude Code)

### Installation

```bash
# Clone the repository
git clone https://github.com/fivelidz/Sahha_things.git
cd Sahha_things/sahha-mcp-wrapper

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Sahha token

# Build the project
npm run build

# Start the MCP server
npm start
```

### Development Mode

```bash
# Run in development with auto-reload
npm run dev
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
SAHHA_API_URL=https://sandbox.sahha.health/api
SAHHA_TOKEN=your_sahha_account_token

# Optional
DEBUG=false
NODE_ENV=development
```

### Getting Sahha Token

1. Sign up at [Sahha Developer Portal](https://sahha.health)
2. Create an application
3. Get your account token from the dashboard
4. Add token to `.env` file

## 🤖 AI Assistant Integration

### Claude Code Integration

Claude Code can automatically discover and use this MCP server:

```bash
# Make sure the server is running
npm start

# Claude Code will detect the MCP server via stdio transport
```

### Custom Client Integration

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({
  name: 'my-health-app',
  version: '1.0.0',
});

// Connect to the Sahha MCP server
const transport = new StdioClientTransport({
  command: 'node',
  args: ['path/to/sahha-mcp-wrapper/dist/server.js'],
});

await client.connect(transport);
```

## 📋 Available Resources

### `sahha://biomarkers`
Complete list of available health biomarkers with categories and descriptions.

### `sahha://optimization-patterns`
Pre-defined biomarker combinations for common health use cases.

### `sahha://profile/{profileId}`
Individual health profile data and recent biomarkers.

## 🛠️ Available Tools

### `get_health_score`
Calculate comprehensive health readiness score.

**Input:**
```json
{
  "profileId": "user-123",
  "date": "2025-01-15"
}
```

**Output:**
```json
{
  "healthScore": 85,
  "readinessLevel": "Good",
  "components": { "sleep_quality": 90, "energy_level": 80 },
  "recommendations": ["Maintain current sleep habits"]
}
```

### `get_optimized_biomarkers`
Get biomarkers optimized for specific health use cases.

**Input:**
```json
{
  "profileId": "user-123",
  "useCase": "morning_health_check",
  "timeRange": "today"
}
```

**Use Cases:**
- `morning_health_check` - Daily wellness assessment
- `workout_readiness` - Exercise planning
- `sleep_optimization` - Sleep quality analysis
- `stress_assessment` - Stress level evaluation
- `recovery_analysis` - Recovery status assessment

### `generate_health_insights`
Generate AI-readable health insights and recommendations.

**Input:**
```json
{
  "profileId": "user-123",
  "focus": "sleep",
  "format": "actionable"
}
```

### `get_biomarker_trends`
Analyze biomarker trends over time.

**Input:**
```json
{
  "profileId": "user-123",
  "biomarkers": ["sleep_quality", "energy_level"],
  "period": "30d"
}
```

## 🎯 Optimization Patterns

The wrapper includes intelligent biomarker selection patterns:

| Use Case | Biomarkers | Focus | Reduction |
|----------|------------|--------|-----------|
| Morning Health Check | 5 core metrics | Daily readiness | Significant |
| Workout Readiness | 6 recovery metrics | Exercise planning | Substantial |
| Sleep Optimization | 6 sleep metrics | Sleep quality | Moderate |
| Stress Assessment | 4 stress indicators | Stress management | Maximum |
| Recovery Analysis | 5 recovery metrics | Recovery planning | Significant |

## 📊 Example Usage

### Morning Health Check
```bash
# Get optimized morning health assessment
curl -X POST http://localhost:3000/mcp/tool/get_optimized_biomarkers \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "user-123",
    "useCase": "morning_health_check"
  }'
```

### AI Assistant Prompt
```
Using the Sahha MCP server, get my morning health check and provide 
recommendations for today's activities based on my readiness level.
```

## 🏗️ Architecture

```
sahha-mcp-wrapper/
├── src/
│   ├── server.ts              # Main MCP server
│   └── lib/
│       ├── sahha-api.ts       # Sahha API client
│       ├── health-analyzer.ts # Health data processing
│       └── biomarker-optimizer.ts # Pattern optimization
├── dist/                      # Compiled TypeScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test MCP server connection
node -e "
  import('./dist/server.js').then(async ({ SahhaMCPServer }) => {
    const server = new SahhaMCPServer();
    console.log('✅ MCP server initialized successfully');
  });
"
```

## 🔍 Debugging

Enable debug mode for detailed logging:

```bash
DEBUG=true npm start
```

Debug output will show:
- API requests to Sahha
- MCP protocol messages
- Biomarker optimization decisions
- Error details

## 📝 Development

### Adding New Use Cases

1. Add pattern to `biomarker-optimizer.ts`:
```typescript
new_use_case: {
  id: 'new_use_case',
  name: 'New Use Case',
  biomarkers: ['relevant', 'biomarkers'],
  // ... other properties
}
```

2. Update validation schema in `server.ts`
3. Add handling logic in health analyzer

### Extending Health Analysis

Extend `health-analyzer.ts` to add new analysis methods:

```typescript
async analyzeCustomMetric(biomarkers: BiomArkerData[]): Promise<CustomResult> {
  // Custom analysis logic
}
```

## 🚨 Troubleshooting

### Common Issues

**Server won't start:**
- Check Node.js version (requires 18+)
- Verify SAHHA_TOKEN is set correctly
- Ensure port 3000 is available

**No biomarker data:**
- Verify Sahha token permissions
- Check if profile ID exists
- Ensure data is available for requested time range

**MCP connection issues:**
- Verify AI assistant supports MCP protocol
- Check server is running on stdio transport
- Review debug logs for protocol errors

## 📚 Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Sahha API Documentation](https://docs.sahha.health)
- [TypeScript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## 🤝 Contributing

This is research code under Custom Research License. For commercial use or contributions, contact: alexeitrbrown@gmail.com

## 📄 License

Custom Research License - see [LICENSE](../LICENSE) for details.

---

**Built by Alexei Brown (Fivelidz) for advancing AI-health integration research.**