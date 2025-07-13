import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import winston from 'winston';
import Joi from 'joi';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Security Manager for Sahha MCP Server
 * Handles authentication, authorization, and data validation
 */
export class SecurityManager {
  constructor() {
    this.allowedProfileIds = new Set();
    this.apiKeyHashes = new Map();
    this.auditLog = [];
    this.securityConfig = this.initializeSecurityConfig();
    this.validationSchemas = this.initializeValidationSchemas();
    
    logger.info('Security Manager initialized with comprehensive protection');
  }

  /**
   * Initialize security configuration
   */
  initializeSecurityConfig() {
    return {
      jwt: {
        secret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
        expiresIn: '1h',
        algorithm: 'HS256'
      },
      apiKey: {
        headerName: 'X-Sahha-API-Key',
        required: process.env.NODE_ENV === 'production'
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100, // per window
        skipSuccessfulRequests: false
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ivLength: 16,
        tagLength: 16
      },
      audit: {
        enabled: true,
        retentionDays: 30,
        sensitiveFields: ['password', 'token', 'secret', 'key']
      },
      dataValidation: {
        strictMode: true,
        sanitizeInput: true,
        maxStringLength: 1000,
        maxArrayLength: 100
      }
    };
  }

  /**
   * Initialize validation schemas for input sanitization
   */
  initializeValidationSchemas() {
    return {
      profileId: Joi.string().alphanum().min(3).max(50).required(),
      biomarkerType: Joi.string().pattern(/^[a-z_]+$/).max(50),
      useCase: Joi.string().valid(
        'morning_health_check',
        'workout_readiness',
        'sleep_optimization',
        'stress_management',
        'daily_wellness',
        'performance_tracking',
        'health_coaching'
      ),
      timeRange: Joi.string().valid('today', 'week', 'month', '7d', '14d', '30d', '90d'),
      date: Joi.date().iso().max('now'),
      reportType: Joi.string().valid('daily', 'weekly', 'monthly', 'clinical'),
      patternName: Joi.string().pattern(/^[a-z_]+$/).max(50),
      biomarkers: Joi.array().items(Joi.string().pattern(/^[a-z_]+$/)).max(20),
      parameters: Joi.object().unknown(true).max(10)
    };
  }

  /**
   * Validate and authenticate API access
   */
  async validateAPIAccess(request) {
    try {
      // Check API key if required
      if (this.securityConfig.apiKey.required) {
        const apiKey = request.headers[this.securityConfig.apiKey.headerName.toLowerCase()];
        if (!apiKey) {
          throw new Error('API key required');
        }
        
        if (!await this.validateAPIKey(apiKey)) {
          throw new Error('Invalid API key');
        }
      }

      // Validate JWT token if present
      const authHeader = request.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const decoded = await this.validateJWT(token);
        request.user = decoded;
      }

      // Log successful authentication
      this.auditLog.push({
        type: 'authentication',
        success: true,
        timestamp: new Date().toISOString(),
        ip: request.ip || 'unknown',
        userAgent: request.headers['user-agent'] || 'unknown'
      });

      return true;
    } catch (error) {
      // Log failed authentication
      this.auditLog.push({
        type: 'authentication',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        ip: request.ip || 'unknown',
        userAgent: request.headers['user-agent'] || 'unknown'
      });

      throw error;
    }
  }

  /**
   * Validate profile access permissions
   */
  async validateProfileAccess(profileId, userContext = null) {
    try {
      // Validate profile ID format
      const { error } = this.validationSchemas.profileId.validate(profileId);
      if (error) {
        throw new Error(`Invalid profile ID format: ${error.message}`);
      }

      // Check if profile is in allowed list (if configured)
      if (this.allowedProfileIds.size > 0 && !this.allowedProfileIds.has(profileId)) {
        throw new Error('Profile access not authorized');
      }

      // Additional authorization checks based on user context
      if (userContext) {
        await this.validateUserProfileAccess(userContext, profileId);
      }

      // Log successful profile access validation
      this.auditLog.push({
        type: 'profile_access',
        profileId,
        success: true,
        user: userContext?.userId || 'anonymous',
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      // Log failed profile access
      this.auditLog.push({
        type: 'profile_access',
        profileId,
        success: false,
        error: error.message,
        user: userContext?.userId || 'anonymous',
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Validate tool access permissions
   */
  async validateToolAccess(toolName, args, userContext = null) {
    try {
      // Validate tool name
      const allowedTools = [
        'get_health_score',
        'get_optimized_biomarkers',
        'generate_health_insights',
        'execute_geo_pattern',
        'get_biomarker_trends',
        'create_health_report'
      ];

      if (!allowedTools.includes(toolName)) {
        throw new Error(`Tool not authorized: ${toolName}`);
      }

      // Validate and sanitize arguments
      const sanitizedArgs = await this.validateAndSanitizeArgs(toolName, args);

      // Profile access validation
      if (args.profileId) {
        await this.validateProfileAccess(args.profileId, userContext);
      }

      // Role-based access control
      if (userContext) {
        await this.validateToolPermissions(userContext, toolName);
      }

      // Log successful tool access
      this.auditLog.push({
        type: 'tool_access',
        tool: toolName,
        profileId: args.profileId,
        success: true,
        user: userContext?.userId || 'anonymous',
        timestamp: new Date().toISOString()
      });

      return sanitizedArgs;
    } catch (error) {
      // Log failed tool access
      this.auditLog.push({
        type: 'tool_access',
        tool: toolName,
        profileId: args.profileId,
        success: false,
        error: error.message,
        user: userContext?.userId || 'anonymous',
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Validate and sanitize input arguments
   */
  async validateAndSanitizeArgs(toolName, args) {
    try {
      const sanitized = {};

      // Tool-specific validation
      switch (toolName) {
        case 'get_health_score':
          sanitized.profileId = await this.validateField('profileId', args.profileId);
          if (args.date) {
            sanitized.date = await this.validateField('date', args.date);
          }
          break;

        case 'get_optimized_biomarkers':
          sanitized.profileId = await this.validateField('profileId', args.profileId);
          sanitized.useCase = await this.validateField('useCase', args.useCase);
          if (args.timeRange) {
            sanitized.timeRange = await this.validateField('timeRange', args.timeRange);
          }
          break;

        case 'generate_health_insights':
          sanitized.profileId = await this.validateField('profileId', args.profileId);
          if (args.focus) {
            sanitized.focus = this.sanitizeString(args.focus);
          }
          if (args.format) {
            sanitized.format = this.sanitizeString(args.format);
          }
          break;

        case 'execute_geo_pattern':
          sanitized.profileId = await this.validateField('profileId', args.profileId);
          sanitized.patternName = await this.validateField('patternName', args.patternName);
          if (args.parameters) {
            sanitized.parameters = await this.validateField('parameters', args.parameters);
          }
          break;

        case 'get_biomarker_trends':
          sanitized.profileId = await this.validateField('profileId', args.profileId);
          if (args.biomarkers) {
            sanitized.biomarkers = await this.validateField('biomarkers', args.biomarkers);
          }
          if (args.period) {
            sanitized.period = await this.validateField('timeRange', args.period);
          }
          break;

        case 'create_health_report':
          sanitized.profileId = await this.validateField('profileId', args.profileId);
          sanitized.reportType = await this.validateField('reportType', args.reportType);
          if (args.includeRecommendations !== undefined) {
            sanitized.includeRecommendations = Boolean(args.includeRecommendations);
          }
          break;

        default:
          throw new Error(`Unknown tool for validation: ${toolName}`);
      }

      return sanitized;
    } catch (error) {
      logger.error('Argument validation failed:', error);
      throw new Error(`Invalid arguments: ${error.message}`);
    }
  }

  /**
   * Validate individual field
   */
  async validateField(fieldName, value) {
    const schema = this.validationSchemas[fieldName];
    if (!schema) {
      // If no specific schema, apply general sanitization
      return this.sanitizeInput(value);
    }

    const { error, value: validatedValue } = schema.validate(value);
    if (error) {
      throw new Error(`${fieldName}: ${error.message}`);
    }

    return validatedValue;
  }

  /**
   * Sanitize input to prevent injection attacks
   */
  sanitizeInput(input) {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    } else if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item)).slice(0, this.securityConfig.dataValidation.maxArrayLength);
    } else if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(input)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Sanitize string input
   */
  sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    return str
      .trim()
      .slice(0, this.securityConfig.dataValidation.maxStringLength)
      .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
      .replace(/\x00/g, ''); // Remove null bytes
  }

  /**
   * Validate API key
   */
  async validateAPIKey(apiKey) {
    try {
      // Hash the provided API key
      const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
      
      // Check against stored hashes (in production, this would be from database)
      return this.apiKeyHashes.has(hashedKey);
    } catch (error) {
      logger.error('API key validation error:', error);
      return false;
    }
  }

  /**
   * Validate JWT token
   */
  async validateJWT(token) {
    try {
      const decoded = jwt.verify(token, this.securityConfig.jwt.secret);
      
      // Additional validation checks
      if (decoded.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }

      return decoded;
    } catch (error) {
      logger.error('JWT validation error:', error);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate JWT token
   */
  async generateJWT(payload) {
    try {
      return jwt.sign(
        payload,
        this.securityConfig.jwt.secret,
        {
          expiresIn: this.securityConfig.jwt.expiresIn,
          algorithm: this.securityConfig.jwt.algorithm
        }
      );
    } catch (error) {
      logger.error('JWT generation error:', error);
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(data) {
    try {
      const key = crypto.randomBytes(this.securityConfig.encryption.keyLength);
      const iv = crypto.randomBytes(this.securityConfig.encryption.ivLength);
      
      const cipher = crypto.createCipher(this.securityConfig.encryption.algorithm, key);
      cipher.setAAD(Buffer.from('sahha-mcp-server'));
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        key: key.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData) {
    try {
      const { encrypted, key, iv, tag } = encryptedData;
      
      const decipher = crypto.createDecipher(
        this.securityConfig.encryption.algorithm,
        Buffer.from(key, 'hex')
      );
      
      decipher.setAAD(Buffer.from('sahha-mcp-server'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Additional security validation methods
   */
  async validateUserProfileAccess(userContext, profileId) {
    // In production, implement user-specific profile access validation
    // For now, allow access if user is authenticated
    return userContext && userContext.userId;
  }

  async validateToolPermissions(userContext, toolName) {
    // In production, implement role-based access control
    // For now, allow all tools for authenticated users
    return userContext && userContext.userId;
  }

  /**
   * Add API key hash (for setup/configuration)
   */
  addAPIKey(apiKey) {
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    this.apiKeyHashes.set(hashedKey, {
      created: new Date().toISOString(),
      lastUsed: null
    });
    
    logger.info('API key added to security manager');
  }

  /**
   * Add allowed profile ID
   */
  addAllowedProfile(profileId) {
    this.allowedProfileIds.add(profileId);
    logger.info(`Profile added to allowed list: ${profileId}`);
  }

  /**
   * Get security audit log
   */
  getAuditLog(limit = 100) {
    return this.auditLog
      .slice(-limit)
      .map(entry => this.sanitizeAuditEntry(entry));
  }

  /**
   * Sanitize audit log entry to remove sensitive information
   */
  sanitizeAuditEntry(entry) {
    const sanitized = { ...entry };
    
    // Remove or mask sensitive fields
    for (const field of this.securityConfig.audit.sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    const totalEvents = this.auditLog.length;
    const recentEvents = this.auditLog.filter(
      entry => new Date(entry.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    const failedAuth = this.auditLog.filter(
      entry => entry.type === 'authentication' && !entry.success
    ).length;
    
    return {
      totalSecurityEvents: totalEvents,
      recentEvents: recentEvents.length,
      failedAuthentications: failedAuth,
      registeredAPIKeys: this.apiKeyHashes.size,
      allowedProfiles: this.allowedProfileIds.size,
      securityLevel: failedAuth < 10 ? 'secure' : 'alert'
    };
  }

  /**
   * Clean up old audit logs
   */
  cleanupAuditLog() {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - this.securityConfig.audit.retentionDays);
    
    const originalLength = this.auditLog.length;
    this.auditLog = this.auditLog.filter(
      entry => new Date(entry.timestamp) > retentionDate
    );
    
    const cleaned = originalLength - this.auditLog.length;
    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} old audit log entries`);
    }
    
    return cleaned;
  }
}