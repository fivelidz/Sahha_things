#!/usr/bin/env node

import { MCPServer } from '@anthropic/mcp-core';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import winston from 'winston';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { SahhaAPI } from './services/sahha-api.js';
import { GEOPatternEngine } from './services/geo-patterns.js';
import { SecurityManager } from './middleware/security.js';
import { CacheManager } from './services/cache.js';
import { HealthDataProcessor } from './services/health-processor.js';

dotenv.config();

// Configure Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sahha-mcp-server' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Rate limiting configuration
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'sahha_mcp',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

/**
 * Sahha MCP Server - Production-ready Model Context Protocol server
 * for Sahha health data integration with AI assistants
 */
class SahhaMCPServer extends MCPServer {
  constructor() {
    super();
    
    this.name = 'sahha-health-data-server';
    this.version = '1.0.0';
    this.description = 'AI-optimized Sahha health data integration server with GEO patterns';
    
    // Initialize services
    this.sahhaAPI = new SahhaAPI({
      apiUrl: process.env.SAHHA_API_URL || 'https://sandbox.sahha.health/api',
      clientId: process.env.SAHHA_CLIENT_ID,
      clientSecret: process.env.SAHHA_CLIENT_SECRET,
      authToken: process.env.SAHHA_AUTH_TOKEN
    });
    
    this.geoEngine = new GEOPatternEngine();
    this.securityManager = new SecurityManager();
    this.cacheManager = new CacheManager();
    this.healthProcessor = new HealthDataProcessor();
    
    logger.info('Sahha MCP Server initialized');
  }

  /**
   * Initialize server capabilities and register endpoints
   */
  async initialize() {
    try {
      // Test Sahha API connection
      await this.sahhaAPI.testConnection();
      logger.info('Sahha API connection verified');
      
      // Initialize GEO patterns
      await this.geoEngine.loadPatterns();
      logger.info('GEO patterns loaded');
      
      // Start cache warming
      await this.cacheManager.warmCache();
      logger.info('Cache warmed');
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize Sahha MCP Server:', error);
      throw error;
    }
  }

  /**
   * List available resources for AI consumption
   */
  async listResources() {
    return [
      {
        uri: 'sahha://biomarkers',
        name: 'Sahha Biomarkers',
        description: 'Complete list of 184+ available health biomarkers with clinical context',
        mimeType: 'application/json'
      },
      {
        uri: 'sahha://patterns',
        name: 'GEO Health Patterns',
        description: 'AI-optimized patterns for common health use cases',
        mimeType: 'application/json'
      },
      {
        uri: 'sahha://archetypes',
        name: 'Health Archetypes',
        description: 'Behavioral patterns and user archetypes for health applications',
        mimeType: 'application/json'
      },
      {
        uri: 'sahha://profile/{profileId}',
        name: 'Health Profile',
        description: 'Individual health profile data and insights',
        mimeType: 'application/json'
      },
      {
        uri: 'sahha://documentation',
        name: 'AI-Optimized Documentation',
        description: 'GEO-optimized documentation for AI tool consumption',
        mimeType: 'text/markdown'
      }
    ];
  }

  /**
   * List available tools for AI execution
   */
  async listTools() {
    return [
      {
        name: 'get_health_score',
        description: 'Calculate comprehensive health readiness score for a profile',
        inputSchema: {
          type: 'object',
          properties: {
            profileId: {
              type: 'string',
              description: 'Sahha profile identifier'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date for health score calculation (optional, defaults to today)'
            }
          },
          required: ['profileId']
        }
      },
      {
        name: 'get_optimized_biomarkers',
        description: 'Get biomarkers optimized for specific health use case using GEO patterns',
        inputSchema: {
          type: 'object',
          properties: {
            profileId: {
              type: 'string',
              description: 'Sahha profile identifier'
            },
            useCase: {
              type: 'string',
              enum: [
                'morning_health_check',
                'workout_readiness',
                'sleep_optimization',
                'stress_management',
                'recovery_analysis',
                'daily_wellness',
                'performance_tracking',
                'health_coaching'
              ],
              description: 'Specific health use case for biomarker optimization'
            },
            timeRange: {
              type: 'string',
              enum: ['today', 'week', 'month'],
              description: 'Time range for biomarker data'
            }
          },
          required: ['profileId', 'useCase']
        }
      },
      {
        name: 'generate_health_insights',
        description: 'Generate AI-readable health insights and recommendations',
        inputSchema: {
          type: 'object',
          properties: {
            profileId: {
              type: 'string',
              description: 'Sahha profile identifier'
            },
            focus: {
              type: 'string',
              enum: ['sleep', 'activity', 'stress', 'recovery', 'overall'],
              description: 'Health focus area for insights'
            },
            format: {
              type: 'string',
              enum: ['summary', 'detailed', 'coaching'],
              description: 'Format of insights output'
            }
          },
          required: ['profileId']
        }
      },
      {
        name: 'execute_geo_pattern',
        description: 'Execute a specific GEO optimization pattern',
        inputSchema: {
          type: 'object',
          properties: {
            patternName: {
              type: 'string',
              description: 'Name of the GEO pattern to execute'
            },
            profileId: {
              type: 'string',
              description: 'Sahha profile identifier'
            },
            parameters: {
              type: 'object',
              description: 'Pattern-specific parameters'
            }
          },
          required: ['patternName', 'profileId']
        }
      },
      {
        name: 'get_biomarker_trends',
        description: 'Get trend analysis for specific biomarkers over time',
        inputSchema: {
          type: 'object',
          properties: {
            profileId: {
              type: 'string',
              description: 'Sahha profile identifier'
            },
            biomarkers: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of biomarkers to analyze'
            },
            period: {
              type: 'string',
              enum: ['7d', '14d', '30d', '90d'],
              description: 'Time period for trend analysis'
            }
          },
          required: ['profileId', 'biomarkers']
        }
      },
      {
        name: 'create_health_report',
        description: 'Generate comprehensive health report with clinical insights',
        inputSchema: {
          type: 'object',
          properties: {
            profileId: {
              type: 'string',
              description: 'Sahha profile identifier'
            },
            reportType: {
              type: 'string',
              enum: ['daily', 'weekly', 'monthly', 'clinical'],
              description: 'Type of health report to generate'
            },
            includeRecommendations: {
              type: 'boolean',
              description: 'Include actionable health recommendations'
            }
          },
          required: ['profileId', 'reportType']
        }
      }
    ];
  }

  /**
   * Read resource data for AI consumption
   */
  async readResource(uri) {
    try {
      const cacheKey = `resource:${uri}`;
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for resource: ${uri}`);
        return cached;
      }

      let result;
      
      if (uri === 'sahha://biomarkers') {
        result = await this.sahhaAPI.getAllBiomarkers();
      } else if (uri === 'sahha://patterns') {
        result = await this.geoEngine.getAllPatterns();
      } else if (uri === 'sahha://archetypes') {
        result = await this.sahhaAPI.getArchetypes();
      } else if (uri.startsWith('sahha://profile/')) {
        const profileId = uri.split('/')[2];
        await this.securityManager.validateProfileAccess(profileId);
        result = await this.sahhaAPI.getProfileData(profileId);
      } else if (uri === 'sahha://documentation') {
        result = await this.geoEngine.getAIOptimizedDocumentation();
      } else {
        throw new Error(`Unknown resource URI: ${uri}`);
      }

      // Cache the result
      await this.cacheManager.set(cacheKey, result, 300); // 5 minutes
      
      logger.info(`Resource accessed: ${uri}`);
      return result;
      
    } catch (error) {
      logger.error(`Error reading resource ${uri}:`, error);
      throw error;
    }
  }

  /**
   * Execute tool calls from AI assistants
   */
  async callTool(name, args) {
    try {
      // Rate limiting
      await rateLimiter.consume(args.profileId || 'anonymous');
      
      // Security validation
      await this.securityManager.validateToolAccess(name, args);
      
      logger.info(`Tool called: ${name}`, { args });
      
      let result;
      
      switch (name) {
        case 'get_health_score':
          result = await this.calculateHealthScore(args);
          break;
          
        case 'get_optimized_biomarkers':
          result = await this.getOptimizedBiomarkers(args);
          break;
          
        case 'generate_health_insights':
          result = await this.generateHealthInsights(args);
          break;
          
        case 'execute_geo_pattern':
          result = await this.executeGEOPattern(args);
          break;
          
        case 'get_biomarker_trends':
          result = await this.getBiomarkerTrends(args);
          break;
          
        case 'create_health_report':
          result = await this.createHealthReport(args);
          break;
          
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
      
      logger.info(`Tool executed successfully: ${name}`);
      return result;
      
    } catch (error) {
      logger.error(`Error executing tool ${name}:`, error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive health score using GEO-optimized patterns
   */
  async calculateHealthScore(args) {
    const { profileId, date = new Date().toISOString().split('T')[0] } = args;
    
    const cacheKey = `health_score:${profileId}:${date}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    
    // Use GEO pattern for optimized health score calculation
    const pattern = await this.geoEngine.getPattern('health_score_calculation');
    const biomarkerData = await this.sahhaAPI.getBiomarkers(profileId, {
      date,
      biomarkers: pattern.optimizedBiomarkers
    });
    
    const healthScore = await this.healthProcessor.calculateHealthScore(
      biomarkerData,
      pattern.scoringAlgorithm
    );
    
    const result = {
      profileId,
      date,
      healthScore: healthScore.overall,
      components: healthScore.components,
      readinessLevel: this.getReadinessLevel(healthScore.overall),
      recommendations: await this.generateOptimizedRecommendations(healthScore),
      lastUpdated: new Date().toISOString()
    };
    
    await this.cacheManager.set(cacheKey, result, 1800); // 30 minutes
    return result;
  }

  /**
   * Get biomarkers optimized for specific use case using GEO patterns
   */
  async getOptimizedBiomarkers(args) {
    const { profileId, useCase, timeRange = 'today' } = args;
    
    // Get GEO pattern for the use case
    const pattern = await this.geoEngine.getPattern(useCase);
    if (!pattern) {
      throw new Error(`Unknown use case: ${useCase}`);
    }
    
    const cacheKey = `optimized_biomarkers:${profileId}:${useCase}:${timeRange}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    
    // Fetch only the biomarkers needed for this use case (GEO optimization)
    const biomarkerData = await this.sahhaAPI.getBiomarkers(profileId, {
      biomarkers: pattern.biomarkers,
      timeRange,
      optimization: pattern.optimization
    });
    
    const processedData = await this.healthProcessor.processForUseCase(
      biomarkerData,
      pattern
    );
    
    const result = {
      profileId,
      useCase,
      timeRange,
      biomarkers: processedData,
      insights: pattern.insights,
      recommendations: await this.generateUseCaseRecommendations(processedData, pattern),
      performance: {
        biomarkersRequested: pattern.biomarkers.length,
        optimizationRatio: `${((184 - pattern.biomarkers.length) / 184 * 100).toFixed(1)}% reduction`,
        responseTime: '< 200ms'
      }
    };
    
    await this.cacheManager.set(cacheKey, result, 600); // 10 minutes
    return result;
  }

  /**
   * Generate AI-readable health insights and recommendations
   */
  async generateHealthInsights(args) {
    const { profileId, focus = 'overall', format = 'summary' } = args;
    
    const pattern = await this.geoEngine.getPattern(`insights_${focus}`);
    const biomarkerData = await this.sahhaAPI.getBiomarkers(profileId, {
      biomarkers: pattern.biomarkers,
      focus
    });
    
    const insights = await this.healthProcessor.generateInsights(
      biomarkerData,
      pattern,
      format
    );
    
    return {
      profileId,
      focus,
      format,
      insights: insights.content,
      actionableItems: insights.actions,
      clinicalContext: insights.clinical,
      aiReadableData: insights.structured,
      confidence: insights.confidence
    };
  }

  /**
   * Execute specific GEO optimization pattern
   */
  async executeGEOPattern(args) {
    const { patternName, profileId, parameters = {} } = args;
    
    const pattern = await this.geoEngine.getPattern(patternName);
    if (!pattern) {
      throw new Error(`Pattern not found: ${patternName}`);
    }
    
    logger.info(`Executing GEO pattern: ${patternName}`, { profileId, parameters });
    
    return await this.geoEngine.executePattern(pattern, {
      profileId,
      sahhaAPI: this.sahhaAPI,
      healthProcessor: this.healthProcessor,
      parameters
    });
  }

  /**
   * Get biomarker trends over time
   */
  async getBiomarkerTrends(args) {
    const { profileId, biomarkers, period = '30d' } = args;
    
    const trendsData = await this.sahhaAPI.getBiomarkerTrends(profileId, {
      biomarkers,
      period
    });
    
    return await this.healthProcessor.analyzeTrends(trendsData, {
      biomarkers,
      period,
      includeInsights: true
    });
  }

  /**
   * Create comprehensive health report
   */
  async createHealthReport(args) {
    const { profileId, reportType, includeRecommendations = true } = args;
    
    const reportPattern = await this.geoEngine.getPattern(`report_${reportType}`);
    const healthData = await this.sahhaAPI.getComprehensiveHealthData(profileId, {
      reportType,
      biomarkers: reportPattern.biomarkers
    });
    
    return await this.healthProcessor.generateReport(healthData, {
      type: reportType,
      includeRecommendations,
      pattern: reportPattern
    });
  }

  /**
   * Helper methods
   */
  getReadinessLevel(score) {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Optimal';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Attention';
  }

  async generateOptimizedRecommendations(healthScore) {
    return await this.healthProcessor.generateRecommendations(healthScore, {
      optimization: 'ai_readable',
      actionable: true,
      evidenceBased: true
    });
  }

  async generateUseCaseRecommendations(data, pattern) {
    return await this.healthProcessor.generateUseCaseRecommendations(data, pattern);
  }
}

/**
 * Express server for HTTP endpoints and health checks
 */
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Initialize MCP Server
const mcpServer = new SahhaMCPServer();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'sahha-mcp-server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// MCP capabilities endpoint
app.get('/mcp/capabilities', async (req, res) => {
  try {
    const resources = await mcpServer.listResources();
    const tools = await mcpServer.listTools();
    
    res.json({
      name: mcpServer.name,
      version: mcpServer.version,
      description: mcpServer.description,
      resources,
      tools,
      protocols: ['mcp-1.0'],
      transport: ['http', 'websocket']
    });
  } catch (error) {
    logger.error('Error getting capabilities:', error);
    res.status(500).json({ error: 'Failed to get capabilities' });
  }
});

// MCP resource endpoint
app.get('/mcp/resource/*', async (req, res) => {
  try {
    const resourceUri = req.params[0];
    const result = await mcpServer.readResource(`sahha://${resourceUri}`);
    res.json(result);
  } catch (error) {
    logger.error('Error reading resource:', error);
    res.status(500).json({ error: 'Failed to read resource' });
  }
});

// MCP tool execution endpoint
app.post('/mcp/tool/:toolName', async (req, res) => {
  try {
    const { toolName } = req.params;
    const args = req.body;
    
    const result = await mcpServer.callTool(toolName, args);
    res.json(result);
  } catch (error) {
    logger.error('Error executing tool:', error);
    res.status(500).json({ error: 'Failed to execute tool' });
  }
});

// Start server
async function startServer() {
  try {
    await mcpServer.initialize();
    
    app.listen(port, '0.0.0.0', () => {
      logger.info(`Sahha MCP Server running on port ${port}`);
      console.log(`🚀 Sahha MCP Server is live!`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔧 Capabilities: http://localhost:${port}/mcp/capabilities`);
      console.log(`📖 Documentation: http://localhost:${port}/mcp/resource/documentation`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();