#!/usr/bin/env node

/**
 * Sahha MCP Wrapper - Clean Model Context Protocol Server for Sahha Health Data
 * 
 * This is a focused, production-ready MCP server that provides AI agents with
 * optimized access to Sahha health data through the Model Context Protocol.
 * 
 * Author: Alexei Brown (Fivelidz)
 * License: Custom Research License (see LICENSE)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { SahhaAPI } from './lib/sahha-api.js';
import { HealthAnalyzer } from './lib/health-analyzer.js';
import { BiomMarkerOptimizer } from './lib/biomarker-optimizer.js';

/**
 * Sahha MCP Server Configuration
 */
const SERVER_CONFIG = {
  name: 'sahha-health-mcp',
  version: '1.0.0',
  description: 'Model Context Protocol server for Sahha health data integration',
  author: 'Alexei Brown (Fivelidz)',
  capabilities: {
    resources: true,
    tools: true,
    prompts: false,
  },
};

/**
 * Environment Configuration
 */
const config = {
  sahhaApiUrl: process.env.SAHHA_API_URL || 'https://sandbox.sahha.health/api',
  sahhaToken: process.env.SAHHA_TOKEN || '',
  enableDebug: process.env.DEBUG === 'true',
};

/**
 * Input Validation Schemas
 */
const HealthScoreInputSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  date: z.string().optional(),
});

const BiomArkerQuerySchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  biomarkers: z.array(z.string()).optional(),
  timeRange: z.enum(['today', 'week', 'month']).default('today'),
  useCase: z.enum([
    'morning_health_check',
    'workout_readiness', 
    'sleep_optimization',
    'stress_assessment',
    'recovery_analysis'
  ]).optional(),
});

const HealthInsightsSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  focus: z.enum(['sleep', 'activity', 'stress', 'recovery', 'overall']).default('overall'),
  format: z.enum(['summary', 'detailed', 'actionable']).default('summary'),
});

/**
 * Main Sahha MCP Server Class
 */
class SahhaMCPServer {
  private server: Server;
  private sahhaAPI: SahhaAPI;
  private healthAnalyzer: HealthAnalyzer;
  private biomarkerOptimizer: BiomMarkerOptimizer;

  constructor() {
    // Initialize MCP Server
    this.server = new Server({
      name: SERVER_CONFIG.name,
      version: SERVER_CONFIG.version,
    }, {
      capabilities: SERVER_CONFIG.capabilities,
    });

    // Initialize Sahha services
    this.sahhaAPI = new SahhaAPI({
      apiUrl: config.sahhaApiUrl,
      token: config.sahhaToken,
      debug: config.enableDebug,
    });

    this.healthAnalyzer = new HealthAnalyzer();
    this.biomarkerOptimizer = new BiomMarkerOptimizer();

    this.setupHandlers();
  }

  /**
   * Setup MCP protocol handlers
   */
  private setupHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'sahha://biomarkers',
          name: 'Available Biomarkers',
          description: 'Complete list of health biomarkers available through Sahha API',
          mimeType: 'application/json',
        },
        {
          uri: 'sahha://optimization-patterns', 
          name: 'Biomarker Optimization Patterns',
          description: 'Pre-defined biomarker combinations for common health use cases',
          mimeType: 'application/json',
        },
        {
          uri: 'sahha://profile/{profileId}',
          name: 'Health Profile Data',
          description: 'Individual health profile biomarker data and insights',
          mimeType: 'application/json',
        },
      ],
    }));

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_health_score',
          description: 'Calculate comprehensive health readiness score for a profile',
          inputSchema: {
            type: 'object',
            properties: {
              profileId: {
                type: 'string',
                description: 'Sahha profile identifier',
              },
              date: {
                type: 'string',
                format: 'date',
                description: 'Date for health score calculation (optional, defaults to today)',
              },
            },
            required: ['profileId'],
          },
        },
        {
          name: 'get_optimized_biomarkers',
          description: 'Get optimized biomarker data for specific health use cases',
          inputSchema: {
            type: 'object',
            properties: {
              profileId: {
                type: 'string',
                description: 'Sahha profile identifier',
              },
              useCase: {
                type: 'string',
                enum: ['morning_health_check', 'workout_readiness', 'sleep_optimization', 'stress_assessment', 'recovery_analysis'],
                description: 'Specific health use case for biomarker optimization',
              },
              timeRange: {
                type: 'string',
                enum: ['today', 'week', 'month'],
                description: 'Time range for biomarker data',
                default: 'today',
              },
            },
            required: ['profileId'],
          },
        },
        {
          name: 'generate_health_insights',
          description: 'Generate AI-readable health insights and recommendations',
          inputSchema: {
            type: 'object',
            properties: {
              profileId: {
                type: 'string',
                description: 'Sahha profile identifier',
              },
              focus: {
                type: 'string',
                enum: ['sleep', 'activity', 'stress', 'recovery', 'overall'],
                description: 'Health focus area for insights',
                default: 'overall',
              },
              format: {
                type: 'string',
                enum: ['summary', 'detailed', 'actionable'],
                description: 'Format of insights output',
                default: 'summary',
              },
            },
            required: ['profileId'],
          },
        },
        {
          name: 'get_biomarker_trends',
          description: 'Analyze biomarker trends over time',
          inputSchema: {
            type: 'object',
            properties: {
              profileId: {
                type: 'string',
                description: 'Sahha profile identifier',
              },
              biomarkers: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of specific biomarkers to analyze',
              },
              period: {
                type: 'string',
                enum: ['7d', '14d', '30d'],
                description: 'Time period for trend analysis',
                default: '30d',
              },
            },
            required: ['profileId'],
          },
        },
      ],
    }));

    // Read resource data
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'sahha://biomarkers') {
        const biomarkers = await this.sahhaAPI.getAvailableBiomarkers();
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(biomarkers, null, 2),
          }],
        };
      }

      if (uri === 'sahha://optimization-patterns') {
        const patterns = this.biomarkerOptimizer.getOptimizationPatterns();
        return {
          contents: [{
            uri,
            mimeType: 'application/json', 
            text: JSON.stringify(patterns, null, 2),
          }],
        };
      }

      if (uri.startsWith('sahha://profile/')) {
        const profileId = uri.split('/')[2];
        const profileData = await this.sahhaAPI.getProfileData(profileId);
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(profileData, null, 2),
          }],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'get_health_score':
          return await this.handleHealthScore(args);
          
        case 'get_optimized_biomarkers':
          return await this.handleOptimizedBiomarkers(args);
          
        case 'generate_health_insights':
          return await this.handleHealthInsights(args);
          
        case 'get_biomarker_trends':
          return await this.handleBiomarkerTrends(args);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  /**
   * Handle health score calculation
   */
  private async handleHealthScore(args: any) {
    const { profileId, date } = HealthScoreInputSchema.parse(args);
    
    const biomarkerData = await this.sahhaAPI.getBiomarkers(profileId, { date });
    const healthScore = await this.healthAnalyzer.calculateHealthScore(biomarkerData);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          profileId,
          date: date || new Date().toISOString().split('T')[0],
          healthScore: healthScore.overall,
          components: healthScore.components,
          readinessLevel: healthScore.readinessLevel,
          recommendations: healthScore.recommendations,
          calculatedAt: new Date().toISOString(),
        }, null, 2),
      }],
    };
  }

  /**
   * Handle optimized biomarker queries
   */
  private async handleOptimizedBiomarkers(args: any) {
    const { profileId, biomarkers, timeRange, useCase } = BiomArkerQuerySchema.parse(args);
    
    // Get optimized biomarker selection
    const optimizedBiomarkers = useCase 
      ? this.biomarkerOptimizer.getOptimizedBiomarkers(useCase)
      : biomarkers || [];

    const biomarkerData = await this.sahhaAPI.getBiomarkers(profileId, {
      biomarkers: optimizedBiomarkers,
      timeRange,
    });

    const analysis = await this.healthAnalyzer.analyzeBiomarkers(biomarkerData, useCase);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          profileId,
          useCase,
          timeRange,
          optimizedBiomarkers,
          analysis,
          retrievedAt: new Date().toISOString(),
        }, null, 2),
      }],
    };
  }

  /**
   * Handle health insights generation
   */
  private async handleHealthInsights(args: any) {
    const { profileId, focus, format } = HealthInsightsSchema.parse(args);
    
    const biomarkerData = await this.sahhaAPI.getBiomarkers(profileId);
    const insights = await this.healthAnalyzer.generateInsights(biomarkerData, focus, format);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          profileId,
          focus,
          format,
          insights: insights.content,
          recommendations: insights.recommendations,
          confidence: insights.confidence,
          generatedAt: new Date().toISOString(),
        }, null, 2),
      }],
    };
  }

  /**
   * Handle biomarker trend analysis
   */
  private async handleBiomarkerTrends(args: any) {
    const { profileId, biomarkers, period } = args;
    
    const trendsData = await this.sahhaAPI.getBiomarkerTrends(profileId, { biomarkers, period });
    const trendAnalysis = await this.healthAnalyzer.analyzeTrends(trendsData);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          profileId,
          biomarkers,
          period,
          trends: trendAnalysis,
          analyzedAt: new Date().toISOString(),
        }, null, 2),
      }],
    };
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    if (config.enableDebug) {
      console.error('Sahha MCP Server started successfully');
      console.error(`Server: ${SERVER_CONFIG.name} v${SERVER_CONFIG.version}`);
      console.error(`Author: ${SERVER_CONFIG.author}`);
    }
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    const server = new SahhaMCPServer();
    await server.start();
  } catch (error) {
    console.error('Failed to start Sahha MCP server:', error);
    process.exit(1);
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { SahhaMCPServer };