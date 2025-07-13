/**
 * Biomarker Optimizer for Sahha MCP Integration
 * 
 * Provides optimized biomarker selections for common health use cases,
 * reducing API calls while maximizing health insights.
 * 
 * Author: Alexei Brown (Fivelidz)
 */

export interface OptimizationPattern {
  id: string;
  name: string;
  description: string;
  biomarkers: string[];
  primaryUseCase: string;
  clinicalRationale: string;
  estimatedReduction: string;
}

/**
 * Biomarker Optimizer
 */
export class BiomMarkerOptimizer {
  private readonly optimizationPatterns: Record<string, OptimizationPattern> = {
    morning_health_check: {
      id: 'morning_health_check',
      name: 'Morning Health Assessment',
      description: 'Essential biomarkers for daily health evaluation and readiness assessment',
      biomarkers: [
        'sleep_duration',
        'sleep_quality',
        'readiness_score',
        'energy_level',
        'stress_level',
      ],
      primaryUseCase: 'Daily wellness check and activity planning',
      clinicalRationale: 'Key indicators of overnight recovery and daily readiness',
      estimatedReduction: 'Significant reduction - focuses on core wellness indicators',
    },

    workout_readiness: {
      id: 'workout_readiness',
      name: 'Exercise Readiness Assessment',
      description: 'Biomarkers to determine optimal workout intensity and recovery needs',
      biomarkers: [
        'recovery_heart_rate',
        'heart_rate_variability',
        'sleep_quality',
        'energy_level',
        'readiness_score',
        'stress_level',
      ],
      primaryUseCase: 'Pre-exercise assessment and intensity planning',
      clinicalRationale: 'Cardiovascular and recovery indicators for safe exercise planning',
      estimatedReduction: 'Substantial reduction - targets exercise-specific metrics',
    },

    sleep_optimization: {
      id: 'sleep_optimization',
      name: 'Sleep Quality Analysis',
      description: 'Comprehensive sleep biomarkers for optimization and improvement',
      biomarkers: [
        'sleep_duration',
        'sleep_quality',
        'sleep_efficiency',
        'deep_sleep_duration',
        'rem_sleep_duration',
        'sleep_latency',
      ],
      primaryUseCase: 'Sleep pattern analysis and improvement recommendations',
      clinicalRationale: 'Sleep architecture components for comprehensive sleep health assessment',
      estimatedReduction: 'Moderate reduction - comprehensive sleep analysis',
    },

    stress_assessment: {
      id: 'stress_assessment',
      name: 'Stress Level Evaluation',
      description: 'Biomarkers for real-time stress monitoring and management',
      biomarkers: [
        'stress_level',
        'heart_rate_variability',
        'heart_rate_average',
        'energy_level',
      ],
      primaryUseCase: 'Current stress evaluation and management planning',
      clinicalRationale: 'Physiological stress indicators for immediate assessment',
      estimatedReduction: 'Maximum reduction - minimal essential stress metrics',
    },

    recovery_analysis: {
      id: 'recovery_analysis',
      name: 'Recovery Status Assessment',
      description: 'Biomarkers to evaluate recovery status and optimization needs',
      biomarkers: [
        'recovery_heart_rate',
        'readiness_score',
        'sleep_quality',
        'energy_level',
        'heart_rate_variability',
      ],
      primaryUseCase: 'Post-activity recovery evaluation and planning',
      clinicalRationale: 'Key recovery indicators for performance optimization',
      estimatedReduction: 'Significant reduction - focuses on recovery essentials',
    },
  };

  /**
   * Get optimized biomarkers for a specific use case
   */
  getOptimizedBiomarkers(useCase: string): string[] {
    const pattern = this.optimizationPatterns[useCase];
    if (!pattern) {
      throw new Error(`Unknown use case: ${useCase}`);
    }
    return pattern.biomarkers;
  }

  /**
   * Get all available optimization patterns
   */
  getOptimizationPatterns(): Record<string, OptimizationPattern> {
    return this.optimizationPatterns;
  }

  /**
   * Get pattern information for a specific use case
   */
  getPattern(useCase: string): OptimizationPattern | null {
    return this.optimizationPatterns[useCase] || null;
  }

  /**
   * Get recommended use case based on biomarker requirements
   */
  recommendUseCase(requiredBiomarkers: string[]): string | null {
    let bestMatch: { useCase: string; score: number } | null = null;

    for (const [useCase, pattern] of Object.entries(this.optimizationPatterns)) {
      const overlap = requiredBiomarkers.filter(b => pattern.biomarkers.includes(b));
      const score = overlap.length / pattern.biomarkers.length;

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { useCase, score };
      }
    }

    return bestMatch && bestMatch.score > 0.5 ? bestMatch.useCase : null;
  }

  /**
   * Calculate optimization efficiency for a pattern
   */
  calculateOptimizationEfficiency(useCase: string, totalAvailableBiomarkers: number = 25): {
    reduction: number;
    efficiency: string;
    biomarkersUsed: number;
    totalAvailable: number;
  } {
    const pattern = this.optimizationPatterns[useCase];
    if (!pattern) {
      throw new Error(`Unknown use case: ${useCase}`);
    }

    const biomarkersUsed = pattern.biomarkers.length;
    const reduction = ((totalAvailableBiomarkers - biomarkersUsed) / totalAvailableBiomarkers) * 100;
    
    let efficiency: string;
    if (reduction >= 80) efficiency = 'Excellent';
    else if (reduction >= 60) efficiency = 'Very Good';
    else if (reduction >= 40) efficiency = 'Good';
    else if (reduction >= 20) efficiency = 'Moderate';
    else efficiency = 'Limited';

    return {
      reduction: Math.round(reduction),
      efficiency,
      biomarkersUsed,
      totalAvailable: totalAvailableBiomarkers,
    };
  }

  /**
   * Get biomarker importance ranking for a use case
   */
  getBiomarkerImportance(useCase: string): Record<string, 'critical' | 'important' | 'supplementary'> {
    const pattern = this.optimizationPatterns[useCase];
    if (!pattern) {
      throw new Error(`Unknown use case: ${useCase}`);
    }

    const importance: Record<string, 'critical' | 'important' | 'supplementary'> = {};

    // Use case specific importance rankings
    switch (useCase) {
      case 'morning_health_check':
        importance.sleep_quality = 'critical';
        importance.readiness_score = 'critical';
        importance.sleep_duration = 'important';
        importance.energy_level = 'important';
        importance.stress_level = 'supplementary';
        break;

      case 'workout_readiness':
        importance.readiness_score = 'critical';
        importance.recovery_heart_rate = 'critical';
        importance.heart_rate_variability = 'important';
        importance.sleep_quality = 'important';
        importance.energy_level = 'supplementary';
        importance.stress_level = 'supplementary';
        break;

      case 'sleep_optimization':
        importance.sleep_quality = 'critical';
        importance.sleep_duration = 'critical';
        importance.sleep_efficiency = 'important';
        importance.deep_sleep_duration = 'important';
        importance.rem_sleep_duration = 'supplementary';
        importance.sleep_latency = 'supplementary';
        break;

      case 'stress_assessment':
        importance.stress_level = 'critical';
        importance.heart_rate_variability = 'critical';
        importance.heart_rate_average = 'important';
        importance.energy_level = 'supplementary';
        break;

      case 'recovery_analysis':
        importance.readiness_score = 'critical';
        importance.recovery_heart_rate = 'critical';
        importance.sleep_quality = 'important';
        importance.heart_rate_variability = 'important';
        importance.energy_level = 'supplementary';
        break;

      default:
        // Default importance for unknown patterns
        pattern.biomarkers.forEach((biomarker, index) => {
          if (index < 2) importance[biomarker] = 'critical';
          else if (index < 4) importance[biomarker] = 'important';
          else importance[biomarker] = 'supplementary';
        });
    }

    return importance;
  }

  /**
   * Suggest biomarker additions to improve use case coverage
   */
  suggestBiomarkerAdditions(useCase: string, currentBiomarkers: string[]): {
    suggestions: string[];
    reasoning: string[];
  } {
    const pattern = this.optimizationPatterns[useCase];
    if (!pattern) {
      throw new Error(`Unknown use case: ${useCase}`);
    }

    const missing = pattern.biomarkers.filter(b => !currentBiomarkers.includes(b));
    const importance = this.getBiomarkerImportance(useCase);

    // Sort suggestions by importance
    const sortedSuggestions = missing.sort((a, b) => {
      const importanceOrder = { critical: 3, important: 2, supplementary: 1 };
      return importanceOrder[importance[b]] - importanceOrder[importance[a]];
    });

    const reasoning = sortedSuggestions.map(biomarker => {
      const level = importance[biomarker];
      return `${biomarker}: ${level} for ${pattern.name.toLowerCase()}`;
    });

    return {
      suggestions: sortedSuggestions.slice(0, 3), // Top 3 suggestions
      reasoning,
    };
  }

  /**
   * Validate biomarker selection for a use case
   */
  validateSelection(useCase: string, selectedBiomarkers: string[]): {
    isValid: boolean;
    coverage: number;
    missingCritical: string[];
    suggestions: string[];
  } {
    const pattern = this.optimizationPatterns[useCase];
    if (!pattern) {
      throw new Error(`Unknown use case: ${useCase}`);
    }

    const importance = this.getBiomarkerImportance(useCase);
    const criticalBiomarkers = Object.entries(importance)
      .filter(([_, level]) => level === 'critical')
      .map(([biomarker, _]) => biomarker);

    const missingCritical = criticalBiomarkers.filter(b => !selectedBiomarkers.includes(b));
    const coverage = (selectedBiomarkers.filter(b => pattern.biomarkers.includes(b)).length / pattern.biomarkers.length) * 100;
    const isValid = missingCritical.length === 0 && coverage >= 60;

    const suggestions: string[] = [];
    if (missingCritical.length > 0) {
      suggestions.push(`Add critical biomarkers: ${missingCritical.join(', ')}`);
    }
    if (coverage < 60) {
      suggestions.push('Consider adding more biomarkers from the recommended pattern');
    }

    return {
      isValid,
      coverage: Math.round(coverage),
      missingCritical,
      suggestions,
    };
  }
}