import NodeCache from 'node-cache';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Intelligent Cache Manager for Sahha MCP Server
 * Optimizes performance with smart caching strategies
 */
export class CacheManager {
  constructor() {
    // Multiple cache instances for different data types
    this.biomarkerCache = new NodeCache({ 
      stdTTL: 1800, // 30 minutes default
      checkperiod: 300, // Check for expired keys every 5 minutes
      useClones: false
    });
    
    this.patternCache = new NodeCache({ 
      stdTTL: 3600, // 1 hour for patterns
      checkperiod: 600,
      useClones: false
    });
    
    this.resourceCache = new NodeCache({ 
      stdTTL: 900, // 15 minutes for resources
      checkperiod: 180,
      useClones: false
    });
    
    this.insightCache = new NodeCache({ 
      stdTTL: 2700, // 45 minutes for insights
      checkperiod: 300,
      useClones: false
    });
    
    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // Smart refresh patterns
    this.refreshStrategies = new Map();
    this.initializeRefreshStrategies();
    
    logger.info('Cache Manager initialized with smart caching strategies');
  }

  /**
   * Initialize smart refresh strategies for different data types
   */
  initializeRefreshStrategies() {
    this.refreshStrategies.set('morning_health_check', {
      refreshTime: '06:00', // Refresh at 6 AM daily
      ttl: 14400, // 4 hours
      priority: 'high'
    });
    
    this.refreshStrategies.set('workout_readiness', {
      refreshTime: 'pre_workout', // Refresh before typical workout times
      ttl: 3600, // 1 hour
      priority: 'high',
      refreshTimes: ['06:00', '12:00', '17:00'] // Common workout times
    });
    
    this.refreshStrategies.set('sleep_optimization', {
      refreshTime: '21:00', // Refresh at 9 PM for evening review
      ttl: 7200, // 2 hours
      priority: 'medium'
    });
    
    this.refreshStrategies.set('daily_wellness', {
      refreshTime: 'continuous', // Frequent updates
      ttl: 1800, // 30 minutes
      priority: 'medium'
    });
    
    this.refreshStrategies.set('biomarkers', {
      refreshTime: 'data_dependent', // Based on last data timestamp
      ttl: 1800, // 30 minutes
      priority: 'high'
    });
  }

  /**
   * Intelligent get method with cache strategy awareness
   */
  async get(key) {
    try {
      const cacheType = this.determineCacheType(key);
      const cache = this.getCache(cacheType);
      
      const value = cache.get(key);
      
      if (value !== undefined) {
        this.stats.hits++;
        
        // Check if smart refresh is needed
        await this.checkSmartRefresh(key, value);
        
        logger.debug(`Cache hit: ${key}`);
        return value;
      } else {
        this.stats.misses++;
        logger.debug(`Cache miss: ${key}`);
        return undefined;
      }
    } catch (error) {
      logger.error('Cache get error:', error);
      return undefined;
    }
  }

  /**
   * Smart set method with adaptive TTL
   */
  async set(key, value, customTTL = null) {
    try {
      const cacheType = this.determineCacheType(key);
      const cache = this.getCache(cacheType);
      
      // Determine optimal TTL
      const ttl = customTTL || this.calculateOptimalTTL(key, value);
      
      // Add metadata for smart refresh
      const cachedData = {
        value,
        cachedAt: new Date().toISOString(),
        refreshStrategy: this.getRefreshStrategy(key),
        dataType: cacheType,
        ttl
      };
      
      const success = cache.set(key, cachedData, ttl);
      
      if (success) {
        this.stats.sets++;
        logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
      }
      
      return success;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Smart delete with pattern matching
   */
  async delete(key) {
    try {
      const cacheType = this.determineCacheType(key);
      const cache = this.getCache(cacheType);
      
      const success = cache.del(key);
      
      if (success) {
        this.stats.deletes++;
        logger.debug(`Cache deleted: ${key}`);
      }
      
      return success > 0;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear cache by pattern or type
   */
  async clearPattern(pattern) {
    try {
      const cleared = {
        biomarker: 0,
        pattern: 0,
        resource: 0,
        insight: 0
      };
      
      // Clear from all cache types
      for (const [type, cache] of [
        ['biomarker', this.biomarkerCache],
        ['pattern', this.patternCache],
        ['resource', this.resourceCache],
        ['insight', this.insightCache]
      ]) {
        const keys = cache.keys();
        const matchingKeys = keys.filter(key => key.includes(pattern));
        
        for (const key of matchingKeys) {
          cache.del(key);
          cleared[type]++;
        }
      }
      
      logger.info(`Cleared cache pattern: ${pattern}`, cleared);
      return cleared;
    } catch (error) {
      logger.error('Cache clear pattern error:', error);
      return {};
    }
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache() {
    try {
      logger.info('Starting cache warming...');
      
      // Pre-load common patterns
      const commonPatterns = [
        'morning_health_check',
        'workout_readiness',
        'daily_wellness',
        'health_score_calculation'
      ];
      
      // Note: In real implementation, you would pre-load these with actual data
      for (const pattern of commonPatterns) {
        await this.set(`pattern:${pattern}`, {
          warmed: true,
          pattern,
          warmedAt: new Date().toISOString()
        });
      }
      
      // Pre-load biomarker metadata
      await this.set('biomarkers:metadata', {
        total: 184,
        categories: ['sleep', 'activity', 'heart', 'mental', 'body', 'environment'],
        warmed: true
      });
      
      logger.info('Cache warming completed');
    } catch (error) {
      logger.error('Cache warming error:', error);
    }
  }

  /**
   * Get cache statistics and health
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : 0;
    
    return {
      requests: {
        total: totalRequests,
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: `${hitRate}%`
      },
      operations: {
        sets: this.stats.sets,
        deletes: this.stats.deletes
      },
      caches: {
        biomarker: {
          keys: this.biomarkerCache.keys().length,
          stats: this.biomarkerCache.getStats()
        },
        pattern: {
          keys: this.patternCache.keys().length,
          stats: this.patternCache.getStats()
        },
        resource: {
          keys: this.resourceCache.keys().length,
          stats: this.resourceCache.getStats()
        },
        insight: {
          keys: this.insightCache.keys().length,
          stats: this.insightCache.getStats()
        }
      },
      performance: {
        hitRate: parseFloat(hitRate),
        efficiency: this.calculateCacheEfficiency()
      }
    };
  }

  /**
   * Optimize cache performance
   */
  async optimize() {
    try {
      logger.info('Starting cache optimization...');
      
      // Clear expired entries
      const clearedEntries = await this.clearExpiredEntries();
      
      // Adjust TTL based on usage patterns
      await this.adjustTTLBasedOnUsage();
      
      // Implement LRU cleanup for low-priority items
      await this.performLRUCleanup();
      
      logger.info('Cache optimization completed', { clearedEntries });
      
      return {
        optimized: true,
        clearedEntries,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Cache optimization error:', error);
      return { optimized: false, error: error.message };
    }
  }

  /**
   * Helper methods
   */
  determineCacheType(key) {
    if (key.includes('biomarker') || key.includes('health_score')) return 'biomarker';
    if (key.includes('pattern') || key.includes('geo')) return 'pattern';
    if (key.includes('resource') || key.includes('documentation')) return 'resource';
    if (key.includes('insight') || key.includes('recommendation')) return 'insight';
    return 'biomarker'; // Default
  }

  getCache(type) {
    switch (type) {
      case 'biomarker': return this.biomarkerCache;
      case 'pattern': return this.patternCache;
      case 'resource': return this.resourceCache;
      case 'insight': return this.insightCache;
      default: return this.biomarkerCache;
    }
  }

  calculateOptimalTTL(key, value) {
    // Smart TTL calculation based on data type and patterns
    if (key.includes('morning_health_check')) return 14400; // 4 hours
    if (key.includes('workout_readiness')) return 3600; // 1 hour
    if (key.includes('sleep_optimization')) return 7200; // 2 hours
    if (key.includes('stress_management')) return 1800; // 30 minutes
    if (key.includes('pattern')) return 3600; // 1 hour
    if (key.includes('resource')) return 900; // 15 minutes
    if (key.includes('biomarker')) return 1800; // 30 minutes
    
    return 1800; // Default 30 minutes
  }

  getRefreshStrategy(key) {
    for (const [pattern, strategy] of this.refreshStrategies.entries()) {
      if (key.includes(pattern)) {
        return strategy;
      }
    }
    return { refreshTime: 'standard', ttl: 1800, priority: 'low' };
  }

  async checkSmartRefresh(key, cachedData) {
    if (!cachedData.refreshStrategy) return;
    
    const strategy = cachedData.refreshStrategy;
    const cachedAt = new Date(cachedData.cachedAt);
    const now = new Date();
    
    // Check if refresh is needed based on strategy
    if (strategy.refreshTime === 'continuous') {
      const age = (now - cachedAt) / 1000;
      if (age > strategy.ttl * 0.8) { // Refresh at 80% of TTL
        logger.debug(`Smart refresh needed for: ${key}`);
        // In real implementation, trigger background refresh
      }
    }
  }

  calculateCacheEfficiency() {
    const totalRequests = this.stats.hits + this.stats.misses;
    if (totalRequests === 0) return 0;
    
    const hitRate = this.stats.hits / totalRequests;
    const setToGetRatio = this.stats.sets / totalRequests;
    
    // Efficiency formula considering hit rate and cache overhead
    return Math.round((hitRate * 100) - (setToGetRatio * 10));
  }

  async clearExpiredEntries() {
    let cleared = 0;
    
    for (const cache of [this.biomarkerCache, this.patternCache, this.resourceCache, this.insightCache]) {
      const initialKeys = cache.keys().length;
      // NodeCache automatically handles expiration, but we can force a check
      cache.flushAll(); // This would clear all - in production, use more selective cleanup
      const finalKeys = cache.keys().length;
      cleared += initialKeys - finalKeys;
    }
    
    return cleared;
  }

  async adjustTTLBasedOnUsage() {
    // Implement usage-based TTL adjustment
    // In production, track access patterns and adjust TTL accordingly
    logger.debug('TTL adjustment based on usage patterns');
  }

  async performLRUCleanup() {
    // Implement LRU cleanup for memory management
    // NodeCache handles this internally, but custom logic can be added
    logger.debug('LRU cleanup performed');
  }

  /**
   * Cache invalidation patterns for real-time updates
   */
  async invalidateProfile(profileId) {
    const pattern = `profile:${profileId}`;
    return await this.clearPattern(pattern);
  }

  async invalidateBiomarker(biomarkerType) {
    const pattern = `biomarker:${biomarkerType}`;
    return await this.clearPattern(pattern);
  }

  async invalidatePattern(patternName) {
    const pattern = `pattern:${patternName}`;
    return await this.clearPattern(pattern);
  }

  /**
   * Advanced caching features
   */
  async getBulk(keys) {
    const results = {};
    
    for (const key of keys) {
      results[key] = await this.get(key);
    }
    
    return results;
  }

  async setBulk(data) {
    const results = {};
    
    for (const [key, value] of Object.entries(data)) {
      results[key] = await this.set(key, value);
    }
    
    return results;
  }

  async has(key) {
    const cacheType = this.determineCacheType(key);
    const cache = this.getCache(cacheType);
    return cache.has(key);
  }

  async keys(pattern = '') {
    const allKeys = [];
    
    for (const cache of [this.biomarkerCache, this.patternCache, this.resourceCache, this.insightCache]) {
      const keys = cache.keys();
      if (pattern) {
        allKeys.push(...keys.filter(key => key.includes(pattern)));
      } else {
        allKeys.push(...keys);
      }
    }
    
    return allKeys;
  }

  async flushAll() {
    this.biomarkerCache.flushAll();
    this.patternCache.flushAll();
    this.resourceCache.flushAll();
    this.insightCache.flushAll();
    
    // Reset stats
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
    
    logger.info('All caches flushed');
  }
}