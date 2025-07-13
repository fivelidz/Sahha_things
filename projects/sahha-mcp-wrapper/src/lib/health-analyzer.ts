/**
 * Health Data Analyzer for Sahha MCP Integration
 * 
 * Processes and analyzes health biomarker data to generate actionable insights
 * optimized for AI agent consumption.
 * 
 * Author: Alexei Brown (Fivelidz)
 */

import { BiomArkerData } from './sahha-api.js';

export interface HealthScore {
  overall: number;
  components: Record<string, number>;
  readinessLevel: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  recommendations: string[];
}

export interface HealthInsights {
  content: string;
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
  keyFindings: string[];
}

export interface TrendAnalysis {
  biomarker: string;
  direction: 'improving' | 'declining' | 'stable';
  magnitude: 'significant' | 'moderate' | 'minimal';
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Health Data Analyzer
 */
export class HealthAnalyzer {
  private readonly BIOMARKER_RANGES = {
    // Sleep biomarkers (in minutes for duration)
    sleep_duration: { optimal: 480, good: [420, 540], fair: [360, 600] },
    sleep_quality: { optimal: 0.85, good: [0.75, 0.95], fair: [0.65, 1.0] },
    sleep_efficiency: { optimal: 0.9, good: [0.8, 0.95], fair: [0.7, 1.0] },
    
    // Activity biomarkers
    steps: { optimal: 10000, good: [7500, 15000], fair: [5000, 20000] },
    active_duration: { optimal: 60, good: [45, 90], fair: [30, 120] },
    
    // Heart biomarkers
    heart_rate_average: { optimal: 70, good: [60, 80], fair: [50, 100] },
    resting_heart_rate: { optimal: 60, good: [50, 70], fair: [40, 80] },
    heart_rate_variability: { optimal: 50, good: [30, 70], fair: [20, 100] },
    
    // Stress and mental health (0-1 scale, lower is better for stress)
    stress_level: { optimal: 0.3, good: [0.2, 0.4], fair: [0.1, 0.6], inverted: true },
    
    // Energy and readiness (0-1 scale, higher is better)
    energy_level: { optimal: 0.8, good: [0.7, 0.9], fair: [0.6, 1.0] },
    readiness_score: { optimal: 0.85, good: [0.75, 0.95], fair: [0.65, 1.0] },
  };

  /**
   * Calculate comprehensive health score from biomarker data
   */
  async calculateHealthScore(biomarkers: BiomArkerData[]): Promise<HealthScore> {
    if (biomarkers.length === 0) {
      return {
        overall: 0,
        components: {},
        readinessLevel: 'Needs Attention',
        recommendations: ['No recent health data available. Please sync your health devices.'],
      };
    }

    const components: Record<string, number> = {};
    let totalScore = 0;
    let componentCount = 0;

    // Calculate individual biomarker scores
    for (const biomarker of biomarkers) {
      const score = this.scoreBiomarker(biomarker.type, biomarker.value);
      components[biomarker.type] = score;
      totalScore += score;
      componentCount++;
    }

    const overall = componentCount > 0 ? Math.round(totalScore / componentCount) : 0;
    const readinessLevel = this.getReadinessLevel(overall);
    const recommendations = await this.generateRecommendations(components, overall);

    return {
      overall,
      components,
      readinessLevel,
      recommendations,
    };
  }

  /**
   * Analyze biomarker data for specific use case
   */
  async analyzeBiomarkers(biomarkers: BiomArkerData[], useCase?: string): Promise<any> {
    const analysis = {
      summary: this.generateBiomarkerSummary(biomarkers),
      scores: this.calculateBiomarkerScores(biomarkers),
      insights: await this.generateUseCaseInsights(biomarkers, useCase),
      dataQuality: this.assessAnalysisQuality(biomarkers),
    };

    return analysis;
  }

  /**
   * Generate health insights based on focus area and format
   */
  async generateInsights(
    biomarkers: BiomArkerData[], 
    focus: string = 'overall',
    format: string = 'summary'
  ): Promise<HealthInsights> {
    const relevantBiomarkers = this.filterBiomarkersByFocus(biomarkers, focus);
    const scores = this.calculateBiomarkerScores(relevantBiomarkers);
    
    let content = '';
    let keyFindings: string[] = [];
    let recommendations: string[] = [];
    
    switch (focus) {
      case 'sleep':
        content = this.generateSleepInsights(relevantBiomarkers, scores);
        keyFindings = this.extractSleepFindings(scores);
        recommendations = this.generateSleepRecommendations(scores);
        break;
        
      case 'activity':
        content = this.generateActivityInsights(relevantBiomarkers, scores);
        keyFindings = this.extractActivityFindings(scores);
        recommendations = this.generateActivityRecommendations(scores);
        break;
        
      case 'stress':
        content = this.generateStressInsights(relevantBiomarkers, scores);
        keyFindings = this.extractStressFindings(scores);
        recommendations = this.generateStressRecommendations(scores);
        break;
        
      case 'recovery':
        content = this.generateRecoveryInsights(relevantBiomarkers, scores);
        keyFindings = this.extractRecoveryFindings(scores);
        recommendations = this.generateRecoveryRecommendations(scores);
        break;
        
      default: // overall
        content = this.generateOverallInsights(biomarkers, scores);
        keyFindings = this.extractOverallFindings(scores);
        recommendations = await this.generateRecommendations(scores, this.calculateOverallScore(scores));
    }

    const confidence = this.calculateInsightConfidence(relevantBiomarkers);

    return {
      content,
      recommendations,
      confidence,
      keyFindings,
    };
  }

  /**
   * Analyze biomarker trends over time
   */
  async analyzeTrends(trendsData: any): Promise<TrendAnalysis[]> {
    const { data } = trendsData;
    
    if (!data || data.length < 2) {
      return [];
    }

    // Group data by biomarker type
    const biomarkerGroups = this.groupBiomarkersByType(data);
    const trends: TrendAnalysis[] = [];

    for (const [biomarkerType, dataPoints] of Object.entries(biomarkerGroups)) {
      if (dataPoints.length < 2) continue;

      const trend = this.calculateTrend(dataPoints);
      trends.push({
        biomarker: biomarkerType,
        direction: trend.direction,
        magnitude: trend.magnitude,
        confidence: trend.confidence,
      });
    }

    return trends;
  }

  /**
   * Score individual biomarker value
   */
  private scoreBiomarker(type: string, value: number): number {
    const range = this.BIOMARKER_RANGES[type as keyof typeof this.BIOMARKER_RANGES];
    if (!range) return 75; // Default score for unknown biomarkers

    const { optimal, good, fair, inverted = false } = range;

    let score: number;
    
    if (inverted) {
      // Lower values are better (e.g., stress_level)
      if (value <= optimal) score = 100;
      else if (value >= good[0] && value <= good[1]) score = 85;
      else if (value >= fair[0] && value <= fair[1]) score = 70;
      else score = 50;
    } else {
      // Higher values are better or within optimal range
      if (typeof optimal === 'number') {
        const distance = Math.abs(value - optimal) / optimal;
        if (distance <= 0.1) score = 100;
        else if (distance <= 0.25) score = 85;
        else if (distance <= 0.5) score = 70;
        else score = 50;
      } else {
        // Range-based scoring
        if (value >= good[0] && value <= good[1]) score = 90;
        else if (value >= fair[0] && value <= fair[1]) score = 70;
        else score = 50;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get readiness level from overall score
   */
  private getReadinessLevel(score: number): HealthScore['readinessLevel'] {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    return 'Needs Attention';
  }

  /**
   * Generate recommendations based on scores
   */
  private async generateRecommendations(components: Record<string, number>, overall: number): Promise<string[]> {
    const recommendations: string[] = [];

    // Sleep recommendations
    if (components.sleep_duration && components.sleep_duration < 70) {
      recommendations.push('Aim for 7-9 hours of sleep per night to improve recovery and performance');
    }
    if (components.sleep_quality && components.sleep_quality < 70) {
      recommendations.push('Focus on sleep hygiene: consistent bedtime, cool room, and limiting screen time before bed');
    }

    // Activity recommendations
    if (components.steps && components.steps < 70) {
      recommendations.push('Increase daily movement with a goal of taking more steps throughout the day');
    }
    if (components.active_duration && components.active_duration < 70) {
      recommendations.push('Add 30-60 minutes of structured physical activity to your daily routine');
    }

    // Stress recommendations
    if (components.stress_level && components.stress_level < 70) {
      recommendations.push('Consider stress management techniques such as deep breathing, meditation, or regular breaks');
    }

    // Heart health recommendations
    if (components.resting_heart_rate && components.resting_heart_rate < 70) {
      recommendations.push('Monitor cardiovascular health and consider consulting with a healthcare provider');
    }

    // Overall recommendations
    if (overall < 60) {
      recommendations.push('Focus on foundational health habits: consistent sleep, regular movement, and stress management');
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  /**
   * Helper methods for specific insights generation
   */
  private filterBiomarkersByFocus(biomarkers: BiomArkerData[], focus: string): BiomArkerData[] {
    const focusMap: Record<string, string[]> = {
      sleep: ['sleep_duration', 'sleep_quality', 'sleep_efficiency', 'deep_sleep_duration', 'rem_sleep_duration'],
      activity: ['steps', 'distance', 'calories_burned', 'active_duration', 'exercise_intensity'],
      stress: ['stress_level', 'heart_rate_variability', 'cognitive_load'],
      recovery: ['recovery_heart_rate', 'readiness_score', 'energy_level'],
    };

    const relevantTypes = focusMap[focus] || [];
    return biomarkers.filter(b => relevantTypes.includes(b.type));
  }

  private calculateBiomarkerScores(biomarkers: BiomArkerData[]): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const biomarker of biomarkers) {
      scores[biomarker.type] = this.scoreBiomarker(biomarker.type, biomarker.value);
    }
    return scores;
  }

  private calculateOverallScore(scores: Record<string, number>): number {
    const values = Object.values(scores);
    return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  }

  private generateBiomarkerSummary(biomarkers: BiomArkerData[]): string {
    const categories = this.categorizeBiomarkers(biomarkers);
    return `Health data summary: ${biomarkers.length} biomarkers across ${Object.keys(categories).length} categories`;
  }

  private categorizeBiomarkers(biomarkers: BiomArkerData[]): Record<string, BiomArkerData[]> {
    const categories: Record<string, BiomArkerData[]> = {};
    
    for (const biomarker of biomarkers) {
      const category = this.getBiomarkerCategory(biomarker.type);
      if (!categories[category]) categories[category] = [];
      categories[category].push(biomarker);
    }
    
    return categories;
  }

  private getBiomarkerCategory(type: string): string {
    if (type.includes('sleep')) return 'sleep';
    if (['steps', 'distance', 'active_duration', 'calories_burned'].includes(type)) return 'activity';
    if (type.includes('heart')) return 'heart';
    if (['stress_level', 'cognitive_load'].includes(type)) return 'mental';
    return 'other';
  }

  private assessAnalysisQuality(biomarkers: BiomArkerData[]): 'high' | 'medium' | 'low' {
    if (biomarkers.length >= 10) return 'high';
    if (biomarkers.length >= 5) return 'medium';
    return 'low';
  }

  private calculateInsightConfidence(biomarkers: BiomArkerData[]): 'high' | 'medium' | 'low' {
    const recentData = biomarkers.filter(b => {
      const dataAge = Date.now() - new Date(b.startDateTime).getTime();
      return dataAge < 24 * 60 * 60 * 1000; // Less than 24 hours old
    });

    const recencyRatio = recentData.length / biomarkers.length;
    
    if (recencyRatio > 0.8 && biomarkers.length >= 10) return 'high';
    if (recencyRatio > 0.6 && biomarkers.length >= 5) return 'medium';
    return 'low';
  }

  // Placeholder methods for specific insight generation
  private generateSleepInsights(biomarkers: BiomArkerData[], scores: Record<string, number>): string {
    return 'Sleep analysis based on duration, quality, and efficiency metrics';
  }

  private generateActivityInsights(biomarkers: BiomArkerData[], scores: Record<string, number>): string {
    return 'Activity analysis based on steps, duration, and intensity metrics';
  }

  private generateStressInsights(biomarkers: BiomArkerData[], scores: Record<string, number>): string {
    return 'Stress analysis based on physiological and behavioral indicators';
  }

  private generateRecoveryInsights(biomarkers: BiomArkerData[], scores: Record<string, number>): string {
    return 'Recovery analysis based on readiness and restoration metrics';
  }

  private generateOverallInsights(biomarkers: BiomArkerData[], scores: Record<string, number>): string {
    return `Comprehensive health analysis across ${biomarkers.length} biomarkers`;
  }

  private extractSleepFindings(scores: Record<string, number>): string[] {
    return ['Sleep quality analysis complete'];
  }

  private extractActivityFindings(scores: Record<string, number>): string[] {
    return ['Activity level analysis complete'];
  }

  private extractStressFindings(scores: Record<string, number>): string[] {
    return ['Stress level analysis complete'];
  }

  private extractRecoveryFindings(scores: Record<string, number>): string[] {
    return ['Recovery status analysis complete'];
  }

  private extractOverallFindings(scores: Record<string, number>): string[] {
    return ['Overall health analysis complete'];
  }

  private generateSleepRecommendations(scores: Record<string, number>): string[] {
    return ['Maintain consistent sleep schedule'];
  }

  private generateActivityRecommendations(scores: Record<string, number>): string[] {
    return ['Continue regular physical activity'];
  }

  private generateStressRecommendations(scores: Record<string, number>): string[] {
    return ['Practice stress management techniques'];
  }

  private generateRecoveryRecommendations(scores: Record<string, number>): string[] {
    return ['Allow adequate recovery time'];
  }

  private async generateUseCaseInsights(biomarkers: BiomArkerData[], useCase?: string): Promise<string> {
    if (!useCase) return 'General health data analysis';
    
    switch (useCase) {
      case 'morning_health_check':
        return 'Morning readiness assessment based on sleep and recovery metrics';
      case 'workout_readiness':
        return 'Exercise readiness evaluation based on recovery and energy indicators';
      case 'sleep_optimization':
        return 'Sleep quality analysis with optimization recommendations';
      case 'stress_assessment':
        return 'Current stress level evaluation with management strategies';
      case 'recovery_analysis':
        return 'Recovery status assessment for optimal performance planning';
      default:
        return 'Specialized health analysis complete';
    }
  }

  private groupBiomarkersByType(data: BiomArkerData[]): Record<string, BiomArkerData[]> {
    const groups: Record<string, BiomArkerData[]> = {};
    
    for (const item of data) {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    }
    
    return groups;
  }

  private calculateTrend(dataPoints: BiomArkerData[]): {
    direction: 'improving' | 'declining' | 'stable';
    magnitude: 'significant' | 'moderate' | 'minimal';
    confidence: 'high' | 'medium' | 'low';
  } {
    if (dataPoints.length < 2) {
      return { direction: 'stable', magnitude: 'minimal', confidence: 'low' };
    }

    // Sort by date
    const sorted = dataPoints.sort((a, b) => 
      new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );

    const firstValue = sorted[0].value;
    const lastValue = sorted[sorted.length - 1].value;
    const change = (lastValue - firstValue) / firstValue;

    let direction: 'improving' | 'declining' | 'stable';
    let magnitude: 'significant' | 'moderate' | 'minimal';
    
    if (Math.abs(change) < 0.05) {
      direction = 'stable';
      magnitude = 'minimal';
    } else if (change > 0) {
      direction = 'improving';
      magnitude = Math.abs(change) > 0.2 ? 'significant' : 'moderate';
    } else {
      direction = 'declining';
      magnitude = Math.abs(change) > 0.2 ? 'significant' : 'moderate';
    }

    const confidence = dataPoints.length > 10 ? 'high' : dataPoints.length > 5 ? 'medium' : 'low';

    return { direction, magnitude, confidence };
  }
}