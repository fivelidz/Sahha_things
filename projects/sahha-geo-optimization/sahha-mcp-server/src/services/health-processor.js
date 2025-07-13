import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Health Data Processor - AI-optimized health data analysis
 * Processes Sahha biomarker data for AI consumption and insights
 */
export class HealthDataProcessor {
  constructor() {
    this.clinicalRanges = this.initializeClinicalRanges();
    this.scoringAlgorithms = this.initializeScoringAlgorithms();
    this.recommendationEngine = this.initializeRecommendationEngine();
  }

  /**
   * Initialize clinical ranges for biomarker normalization
   */
  initializeClinicalRanges() {
    return {
      // Sleep biomarkers
      sleep_duration: { 
        unit: 'minutes',
        poor: { min: 0, max: 360 },      // < 6 hours
        fair: { min: 360, max: 420 },    // 6-7 hours
        good: { min: 420, max: 540 },    // 7-9 hours
        excellent: { min: 480, max: 540 }, // 8-9 hours
        optimal: 480 // 8 hours
      },
      sleep_quality: {
        unit: 'percentage',
        poor: { min: 0, max: 0.6 },
        fair: { min: 0.6, max: 0.7 },
        good: { min: 0.7, max: 0.85 },
        excellent: { min: 0.85, max: 1.0 },
        optimal: 0.85
      },
      sleep_efficiency: {
        unit: 'percentage',
        poor: { min: 0, max: 0.7 },
        fair: { min: 0.7, max: 0.8 },
        good: { min: 0.8, max: 0.9 },
        excellent: { min: 0.9, max: 1.0 },
        optimal: 0.9
      },

      // Activity biomarkers
      steps: {
        unit: 'count',
        poor: { min: 0, max: 5000 },
        fair: { min: 5000, max: 7500 },
        good: { min: 7500, max: 12500 },
        excellent: { min: 10000, max: 15000 },
        optimal: 10000
      },
      active_duration: {
        unit: 'minutes',
        poor: { min: 0, max: 30 },
        fair: { min: 30, max: 60 },
        good: { min: 60, max: 120 },
        excellent: { min: 90, max: 180 },
        optimal: 90
      },
      calories_burned: {
        unit: 'kcal',
        poor: { min: 0, max: 200 },
        fair: { min: 200, max: 400 },
        good: { min: 400, max: 800 },
        excellent: { min: 600, max: 1200 },
        optimal: 600
      },

      // Heart biomarkers
      resting_heart_rate: {
        unit: 'bpm',
        poor: { min: 100, max: 120 },
        fair: { min: 80, max: 100 },
        good: { min: 60, max: 80 },
        excellent: { min: 40, max: 60 },
        optimal: 60,
        inverted: true // Lower is better
      },
      heart_rate_variability: {
        unit: 'ms',
        poor: { min: 0, max: 20 },
        fair: { min: 20, max: 30 },
        good: { min: 30, max: 50 },
        excellent: { min: 50, max: 100 },
        optimal: 50
      },
      recovery_heart_rate: {
        unit: 'bpm',
        poor: { min: 80, max: 120 },
        fair: { min: 70, max: 80 },
        good: { min: 60, max: 70 },
        excellent: { min: 40, max: 60 },
        optimal: 60,
        inverted: true
      },

      // Mental/Stress biomarkers
      stress_level: {
        unit: 'percentage',
        excellent: { min: 0, max: 0.3 },
        good: { min: 0.3, max: 0.5 },
        fair: { min: 0.5, max: 0.7 },
        poor: { min: 0.7, max: 1.0 },
        optimal: 0.3,
        inverted: true // Lower is better
      },
      cognitive_load: {
        unit: 'percentage',
        excellent: { min: 0, max: 0.4 },
        good: { min: 0.4, max: 0.6 },
        fair: { min: 0.6, max: 0.8 },
        poor: { min: 0.8, max: 1.0 },
        optimal: 0.4,
        inverted: true
      },

      // Body biomarkers
      energy_level: {
        unit: 'percentage',
        poor: { min: 0, max: 0.4 },
        fair: { min: 0.4, max: 0.6 },
        good: { min: 0.6, max: 0.8 },
        excellent: { min: 0.8, max: 1.0 },
        optimal: 0.8
      },
      hydration_level: {
        unit: 'percentage',
        poor: { min: 0, max: 0.6 },
        fair: { min: 0.6, max: 0.7 },
        good: { min: 0.7, max: 0.9 },
        excellent: { min: 0.9, max: 1.0 },
        optimal: 0.9
      }
    };
  }

  /**
   * Initialize scoring algorithms for different health calculations
   */
  initializeScoringAlgorithms() {
    return {
      weighted_average_with_penalties: (components, weights) => {
        let totalScore = 0;
        let totalWeight = 0;
        let penalties = 0;

        for (const [biomarker, weight] of Object.entries(weights)) {
          if (components[biomarker] !== undefined) {
            const score = components[biomarker];
            totalScore += score * weight;
            totalWeight += weight;
            
            // Apply penalties for critical low scores
            if (score < 40) penalties += (40 - score) * 0.5;
          }
        }

        const baseScore = totalWeight > 0 ? totalScore / totalWeight : 50;
        return Math.max(0, Math.round(baseScore - penalties));
      },

      recovery_focused_scoring: (components, weights) => {
        // Emphasize recovery indicators more heavily
        const recoveryBiomarkers = ['recovery_heart_rate', 'heart_rate_variability', 'sleep_quality'];
        let recoveryScore = 0;
        let otherScore = 0;
        let recoveryWeight = 0;
        let otherWeight = 0;

        for (const [biomarker, weight] of Object.entries(weights)) {
          if (components[biomarker] !== undefined) {
            if (recoveryBiomarkers.includes(biomarker)) {
              recoveryScore += components[biomarker] * weight * 1.2; // Boost recovery factors
              recoveryWeight += weight * 1.2;
            } else {
              otherScore += components[biomarker] * weight;
              otherWeight += weight;
            }
          }
        }

        const totalScore = (recoveryScore + otherScore);
        const totalWeight = (recoveryWeight + otherWeight);
        
        return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
      },

      sleep_architecture_scoring: (components, weights) => {
        // Special scoring for sleep optimization
        const sleepEfficiency = components.sleep_efficiency || 75;
        const sleepDuration = components.sleep_duration || 75;
        const deepSleep = components.deep_sleep_duration || 75;
        
        // Base score from weighted average
        let baseScore = 0;
        let totalWeight = 0;
        
        for (const [biomarker, weight] of Object.entries(weights)) {
          if (components[biomarker] !== undefined) {
            baseScore += components[biomarker] * weight;
            totalWeight += weight;
          }
        }
        
        const avgScore = totalWeight > 0 ? baseScore / totalWeight : 50;
        
        // Apply sleep-specific bonuses/penalties
        let modifier = 0;
        if (sleepEfficiency > 85 && sleepDuration > 75) modifier += 5;
        if (deepSleep > 80) modifier += 3;
        if (sleepDuration < 50) modifier -= 10; // Severe penalty for insufficient sleep
        
        return Math.max(0, Math.min(100, Math.round(avgScore + modifier)));
      },

      multi_factor_health_scoring: (components, weights) => {
        // Comprehensive health scoring with category balancing
        const categories = {
          sleep: ['sleep_quality', 'sleep_duration'],
          activity: ['activity_level', 'steps'],
          recovery: ['recovery_status', 'heart_rate_variability'],
          stress: ['stress_level'],
          energy: ['energy_level']
        };

        const categoryScores = {};
        
        for (const [category, biomarkers] of Object.entries(categories)) {
          let categoryScore = 0;
          let categoryWeight = 0;
          
          for (const biomarker of biomarkers) {
            if (components[biomarker] !== undefined && weights[biomarker]) {
              categoryScore += components[biomarker] * weights[biomarker];
              categoryWeight += weights[biomarker];
            }
          }
          
          categoryScores[category] = categoryWeight > 0 ? categoryScore / categoryWeight : 75;
        }

        // Overall score is average of category scores
        const categories_values = Object.values(categoryScores);
        return categories_values.length > 0 ? 
          Math.round(categories_values.reduce((a, b) => a + b, 0) / categories_values.length) : 50;
      }
    };
  }

  /**
   * Initialize recommendation engine
   */
  initializeRecommendationEngine() {
    return {
      sleep: {
        poor: [
          'Establish consistent bedtime routine',
          'Limit screen time 1 hour before bed',
          'Keep bedroom cool (65-68°F) and dark',
          'Consider relaxation techniques like meditation'
        ],
        fair: [
          'Optimize sleep environment (darkness, temperature)',
          'Maintain consistent sleep schedule',
          'Limit caffeine after 2 PM'
        ],
        good: [
          'Continue current sleep habits',
          'Monitor sleep quality trends',
          'Consider sleep tracking for optimization'
        ]
      },
      activity: {
        poor: [
          'Start with 10-minute walks daily',
          'Take stairs instead of elevators',
          'Set hourly movement reminders',
          'Find enjoyable physical activities'
        ],
        fair: [
          'Increase daily steps by 1000',
          'Add 2-3 structured exercise sessions weekly',
          'Include strength training exercises'
        ],
        good: [
          'Maintain current activity levels',
          'Vary exercise types for balance',
          'Track progress and set new goals'
        ]
      },
      stress: {
        high: [
          'Practice deep breathing exercises',
          'Take regular breaks during work',
          'Consider meditation or mindfulness apps',
          'Engage in stress-reducing activities',
          'Ensure adequate sleep and nutrition'
        ],
        moderate: [
          'Implement stress management techniques',
          'Maintain work-life balance',
          'Regular physical activity for stress relief'
        ],
        low: [
          'Continue effective stress management',
          'Monitor stress levels during busy periods',
          'Maintain healthy coping strategies'
        ]
      }
    };
  }

  /**
   * Calculate comprehensive health score from biomarker data
   */
  async calculateHealthScore(biomarkerData, algorithm = 'weighted_average_with_penalties') {
    try {
      const data = biomarkerData.data || biomarkerData;
      
      // Normalize biomarker values to 0-100 scale
      const normalizedScores = {};
      const componentDetails = {};
      
      for (const biomarker of data) {
        const score = this.normalizeBiomarkerValue(biomarker.type, biomarker.value);
        normalizedScores[biomarker.type] = score;
        componentDetails[biomarker.type] = {
          value: biomarker.value,
          unit: biomarker.unit || this.clinicalRanges[biomarker.type]?.unit || 'unknown',
          normalizedScore: score,
          category: this.getBiomarkerCategory(biomarker.type),
          clinicalRange: this.getClinicalRange(biomarker.type, biomarker.value)
        };
      }
      
      // Define default weights if not provided
      const defaultWeights = {
        sleep_quality: 0.25,
        activity_level: 0.20,
        recovery_status: 0.15,
        stress_level: 0.15,
        heart_rate_variability: 0.10,
        energy_level: 0.10,
        steps: 0.05
      };
      
      // Use scoring algorithm
      const scoringFunction = this.scoringAlgorithms[algorithm] || this.scoringAlgorithms.weighted_average_with_penalties;
      const overallScore = scoringFunction(normalizedScores, defaultWeights);
      
      return {
        overall: overallScore,
        components: componentDetails,
        algorithm: algorithm,
        calculatedAt: new Date().toISOString(),
        dataQuality: this.assessDataQuality(data)
      };
      
    } catch (error) {
      logger.error('Error calculating health score:', error);
      throw new Error('Failed to calculate health score');
    }
  }

  /**
   * Process biomarker data for specific use case
   */
  async processForUseCase(biomarkerData, pattern) {
    try {
      const data = biomarkerData.data || biomarkerData;
      const processedData = {};
      
      for (const biomarkerType of pattern.biomarkers) {
        const biomarker = data.find(d => d.type === biomarkerType);
        
        if (biomarker) {
          processedData[biomarkerType] = {
            value: biomarker.value,
            unit: biomarker.unit,
            timestamp: biomarker.startDateTime,
            normalizedScore: this.normalizeBiomarkerValue(biomarkerType, biomarker.value),
            clinicalRange: this.getClinicalRange(biomarkerType, biomarker.value),
            significance: this.getBiomarkerSignificance(biomarkerType, pattern.intent)
          };
        } else {
          // Handle missing biomarker data
          processedData[biomarkerType] = {
            value: null,
            status: 'no_data',
            normalizedScore: 50, // Default neutral score
            note: 'No recent data available for this biomarker'
          };
        }
      }
      
      return processedData;
      
    } catch (error) {
      logger.error('Error processing data for use case:', error);
      throw error;
    }
  }

  /**
   * Generate health insights based on processed data
   */
  async generateInsights(biomarkerData, pattern, format = 'summary') {
    try {
      const data = biomarkerData.data || biomarkerData;
      const insights = {
        summary: '',
        details: [],
        recommendations: [],
        trends: [],
        clinicalContext: '',
        confidence: 'high'
      };
      
      // Analyze each biomarker for insights
      for (const biomarker of data) {
        const analysis = await this.analyzeBiomarker(biomarker);
        
        if (analysis.insight) {
          insights.details.push({
            biomarker: biomarker.type,
            category: this.getBiomarkerCategory(biomarker.type),
            insight: analysis.insight,
            recommendation: analysis.recommendation,
            priority: analysis.priority
          });
        }
      }
      
      // Generate summary based on format
      if (format === 'summary') {
        insights.summary = this.generateSummaryInsight(insights.details);
      } else if (format === 'detailed') {
        insights.summary = this.generateDetailedInsight(insights.details, pattern);
      } else if (format === 'coaching') {
        insights.summary = this.generateCoachingInsight(insights.details);
      }
      
      // Generate actionable recommendations
      insights.recommendations = await this.generateActionableRecommendations(insights.details);
      
      // Add clinical context
      insights.clinicalContext = this.generateClinicalContext(pattern, insights.details);
      
      // Structure for AI consumption
      insights.structured = {
        healthStatus: this.categorizeOverallHealth(insights.details),
        priorityActions: insights.recommendations.slice(0, 3),
        keyMetrics: this.extractKeyMetrics(insights.details),
        riskFactors: this.identifyRiskFactors(insights.details)
      };
      
      return insights;
      
    } catch (error) {
      logger.error('Error generating insights:', error);
      throw error;
    }
  }

  /**
   * Generate recommendations based on biomarker data
   */
  async generateRecommendations(healthScore, options = {}) {
    try {
      const recommendations = [];
      const { optimization = 'ai_readable', actionable = true, evidenceBased = true } = options;
      
      // Analyze components for specific recommendations
      for (const [biomarker, component] of Object.entries(healthScore.components)) {
        const category = this.getBiomarkerCategory(biomarker);
        const clinicalRange = component.clinicalRange;
        
        if (clinicalRange === 'poor' || clinicalRange === 'fair') {
          const biomarkerRecommendations = await this.getBiomarkerRecommendations(
            biomarker, 
            component.normalizedScore,
            { actionable, evidenceBased }
          );
          
          recommendations.push(...biomarkerRecommendations);
        }
      }
      
      // Sort by priority and limit to most important
      const prioritizedRecommendations = recommendations
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 5); // Top 5 recommendations
      
      // Format for AI optimization
      if (optimization === 'ai_readable') {
        return prioritizedRecommendations.map(rec => ({
          action: rec.action,
          category: rec.category,
          priority: rec.priority,
          reasoning: rec.reasoning,
          timeframe: rec.timeframe || '1-2 weeks',
          measurable: rec.measurable || true
        }));
      }
      
      return prioritizedRecommendations;
      
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Analyze trends in biomarker data
   */
  async analyzeTrends(trendsData, options = {}) {
    try {
      const { biomarkers, period, includeInsights = true } = options;
      const analysis = {
        period,
        biomarkers: {},
        overallTrend: 'stable',
        insights: [],
        recommendations: []
      };
      
      for (const biomarker of biomarkers) {
        const biomarkerData = trendsData.data.filter(d => d.type === biomarker);
        
        if (biomarkerData.length >= 2) {
          const trend = this.calculateTrendAnalysis(biomarkerData);
          analysis.biomarkers[biomarker] = {
            trend: trend.direction,
            magnitude: trend.magnitude,
            confidence: trend.confidence,
            dataPoints: biomarkerData.length,
            startValue: biomarkerData[0].value,
            endValue: biomarkerData[biomarkerData.length - 1].value,
            percentChange: trend.percentChange
          };
          
          if (includeInsights) {
            const trendInsight = await this.generateTrendInsight(biomarker, trend);
            if (trendInsight) {
              analysis.insights.push(trendInsight);
            }
          }
        }
      }
      
      // Determine overall trend
      analysis.overallTrend = this.determineOverallTrend(analysis.biomarkers);
      
      // Generate trend-based recommendations
      if (includeInsights) {
        analysis.recommendations = await this.generateTrendRecommendations(analysis.biomarkers);
      }
      
      return analysis;
      
    } catch (error) {
      logger.error('Error analyzing trends:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive health report
   */
  async generateReport(healthData, options = {}) {
    try {
      const { type, includeRecommendations = true, pattern } = options;
      
      const report = {
        type,
        generatedAt: new Date().toISOString(),
        profileId: healthData.profileId,
        summary: {},
        analysis: {},
        recommendations: [],
        trends: {},
        riskAssessment: {},
        goals: {}
      };
      
      // Generate summary based on report type
      switch (type) {
        case 'daily':
          report.summary = await this.generateDailySummary(healthData);
          break;
        case 'weekly':
          report.summary = await this.generateWeeklySummary(healthData);
          break;
        case 'monthly':
          report.summary = await this.generateMonthlySummary(healthData);
          break;
        case 'clinical':
          report.summary = await this.generateClinicalSummary(healthData);
          break;
      }
      
      // Detailed analysis
      report.analysis = await this.generateDetailedAnalysis(healthData, pattern);
      
      // Risk assessment
      report.riskAssessment = await this.generateRiskAssessment(healthData);
      
      // Recommendations
      if (includeRecommendations) {
        report.recommendations = await this.generateReportRecommendations(healthData, type);
      }
      
      // Trends analysis
      if (healthData.trends) {
        report.trends = await this.analyzeTrends(healthData.trends, {
          biomarkers: pattern.biomarkers,
          period: healthData.timeRange,
          includeInsights: true
        });
      }
      
      return report;
      
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Helper method to normalize biomarker values
   */
  normalizeBiomarkerValue(biomarkerType, value) {
    const range = this.clinicalRanges[biomarkerType];
    if (!range) {
      // Default scoring for unknown biomarkers
      return 75;
    }
    
    // Determine which range the value falls into
    if (range.inverted) {
      // Lower values are better (e.g., stress, resting heart rate)
      if (value <= range.excellent.max) return 95;
      if (value <= range.good.max) return 80;
      if (value <= range.fair.max) return 65;
      return 40;
    } else {
      // Higher values are better (e.g., sleep quality, activity)
      if (value >= range.excellent.min) return 95;
      if (value >= range.good.min) return 80;
      if (value >= range.fair.min) return 65;
      return 40;
    }
  }

  /**
   * Get clinical range category for a biomarker value
   */
  getClinicalRange(biomarkerType, value) {
    const range = this.clinicalRanges[biomarkerType];
    if (!range) return 'unknown';
    
    if (range.inverted) {
      if (value <= range.excellent.max) return 'excellent';
      if (value <= range.good.max) return 'good';
      if (value <= range.fair.max) return 'fair';
      return 'poor';
    } else {
      if (value >= range.excellent.min) return 'excellent';
      if (value >= range.good.min) return 'good';
      if (value >= range.fair.min) return 'fair';
      return 'poor';
    }
  }

  /**
   * Get biomarker category for organization
   */
  getBiomarkerCategory(biomarkerType) {
    const categoryMap = {
      sleep: ['sleep_duration', 'sleep_quality', 'sleep_efficiency', 'deep_sleep_duration', 'rem_sleep_duration'],
      activity: ['steps', 'active_duration', 'calories_burned', 'exercise_intensity', 'distance'],
      heart: ['heart_rate_average', 'heart_rate_variability', 'resting_heart_rate', 'recovery_heart_rate'],
      mental: ['stress_level', 'cognitive_load', 'focus_score', 'mental_fatigue', 'mood_indicators'],
      body: ['energy_level', 'hydration_level', 'body_temperature', 'recovery_status'],
      environment: ['ambient_temperature', 'humidity', 'air_quality', 'noise_level']
    };
    
    for (const [category, biomarkers] of Object.entries(categoryMap)) {
      if (biomarkers.some(b => biomarkerType.toLowerCase().includes(b))) {
        return category;
      }
    }
    
    return 'other';
  }

  /**
   * Additional helper methods for comprehensive health processing
   */
  async analyzeBiomarker(biomarker) {
    const category = this.getBiomarkerCategory(biomarker.type);
    const clinicalRange = this.getClinicalRange(biomarker.type, biomarker.value);
    const normalizedScore = this.normalizeBiomarkerValue(biomarker.type, biomarker.value);
    
    let insight = '';
    let recommendation = '';
    let priority = 'low';
    
    if (clinicalRange === 'poor') {
      priority = 'high';
      insight = `${biomarker.type} is in the poor range and needs immediate attention`;
      recommendation = await this.getBiomarkerRecommendations(biomarker.type, normalizedScore);
    } else if (clinicalRange === 'fair') {
      priority = 'medium';
      insight = `${biomarker.type} has room for improvement`;
      recommendation = await this.getBiomarkerRecommendations(biomarker.type, normalizedScore);
    } else if (clinicalRange === 'excellent') {
      insight = `${biomarker.type} is in excellent range - maintain current habits`;
    }
    
    return { insight, recommendation: recommendation[0]?.action || '', priority };
  }

  async getBiomarkerRecommendations(biomarkerType, score, options = {}) {
    const category = this.getBiomarkerCategory(biomarkerType);
    const recommendations = [];
    
    if (score < 50) {
      const categoryRecs = this.recommendationEngine[category]?.poor || [];
      recommendations.push(...categoryRecs.map(action => ({
        action,
        category,
        priority: 'high',
        reasoning: `${biomarkerType} is below optimal range`,
        measurable: true
      })));
    } else if (score < 70) {
      const categoryRecs = this.recommendationEngine[category]?.fair || [];
      recommendations.push(...categoryRecs.map(action => ({
        action,
        category,
        priority: 'medium',
        reasoning: `${biomarkerType} has room for improvement`,
        measurable: true
      })));
    }
    
    return recommendations;
  }

  calculateTrendAnalysis(biomarkerData) {
    // Sort by date
    const sortedData = biomarkerData.sort((a, b) => 
      new Date(a.startDateTime) - new Date(b.startDateTime)
    );
    
    const values = sortedData.map(d => d.value);
    const n = values.length;
    
    if (n < 2) {
      return { direction: 'insufficient_data', magnitude: 0, confidence: 'low' };
    }
    
    // Simple linear regression
    const x = Array.from({length: n}, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const percentChange = ((values[n-1] - values[0]) / values[0]) * 100;
    
    const direction = slope > 0.1 ? 'increasing' : 
                     slope < -0.1 ? 'decreasing' : 'stable';
    
    const magnitude = Math.abs(slope);
    const confidence = n > 10 ? 'high' : n > 5 ? 'medium' : 'low';
    
    return { direction, magnitude, confidence, percentChange };
  }

  assessDataQuality(data) {
    if (!data || data.length === 0) {
      return { overall: 'poor', completeness: 0, recency: 'no_data' };
    }
    
    const latestDate = new Date(Math.max(...data.map(d => new Date(d.startDateTime || d.timestamp))));
    const hoursSinceLatest = (Date.now() - latestDate.getTime()) / (1000 * 60 * 60);
    
    const recency = hoursSinceLatest < 24 ? 'excellent' : 
                   hoursSinceLatest < 72 ? 'good' : 'outdated';
    
    const completeness = Math.min(100, (data.length / 10) * 100); // Assume 10 is ideal
    
    const overall = recency === 'excellent' && completeness > 80 ? 'excellent' :
                   recency === 'good' && completeness > 60 ? 'good' : 'fair';
    
    return { overall, completeness, recency };
  }
}