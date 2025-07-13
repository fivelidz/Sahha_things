/**
 * Sahha API Client for MCP Integration
 * 
 * Clean, focused interface to Sahha health data API optimized for AI agent access.
 * 
 * Author: Alexei Brown (Fivelidz)
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface SahhaConfig {
  apiUrl: string;
  token: string;
  debug?: boolean;
}

export interface BiomArkerData {
  type: string;
  value: number;
  unit: string;
  startDateTime: string;
  endDateTime?: string;
  source?: string;
}

export interface BiomArkerQuery {
  biomarkers?: string[];
  date?: string;
  timeRange?: 'today' | 'week' | 'month';
}

export interface HealthProfile {
  profileId: string;
  biomarkers: BiomArkerData[];
  lastUpdated: string;
  dataQuality: 'excellent' | 'good' | 'limited' | 'poor';
}

/**
 * Sahha API Client
 */
export class SahhaAPI {
  private client: AxiosInstance;
  private config: SahhaConfig;

  constructor(config: SahhaConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Authorization': `account ${config.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Sahha-MCP-Wrapper/1.0.0',
      },
    });

    // Request/Response interceptors for debugging
    if (config.debug) {
      this.client.interceptors.request.use(
        (request) => {
          console.error(`[Sahha API] ${request.method?.toUpperCase()} ${request.url}`);
          return request;
        },
        (error) => {
          console.error('[Sahha API] Request error:', error.message);
          return Promise.reject(error);
        }
      );

      this.client.interceptors.response.use(
        (response) => {
          console.error(`[Sahha API] ${response.status} ${response.config.url}`);
          return response;
        },
        (error) => {
          console.error('[Sahha API] Response error:', error.response?.status, error.message);
          return Promise.reject(error);
        }
      );
    }
  }

  /**
   * Test API connection and token validity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/v1/profile/token/verify');
      return response.status === 200;
    } catch (error) {
      if (this.config.debug) {
        console.error('[Sahha API] Connection test failed:', error);
      }
      return false;
    }
  }

  /**
   * Get available biomarkers from Sahha API
   */
  async getAvailableBiomarkers(): Promise<any> {
    try {
      // Return comprehensive biomarker catalog based on Sahha documentation
      return {
        categories: {
          sleep: {
            biomarkers: [
              'sleep_duration',
              'sleep_quality', 
              'sleep_efficiency',
              'deep_sleep_duration',
              'rem_sleep_duration',
              'light_sleep_duration',
              'sleep_latency',
              'sleep_interruptions',
            ],
            description: 'Sleep quality and duration metrics',
          },
          activity: {
            biomarkers: [
              'steps',
              'distance', 
              'calories_burned',
              'active_duration',
              'sedentary_time',
              'exercise_intensity',
              'movement_consistency',
            ],
            description: 'Physical activity and movement data',
          },
          heart: {
            biomarkers: [
              'heart_rate_average',
              'heart_rate_variability',
              'resting_heart_rate',
              'recovery_heart_rate',
            ],
            description: 'Cardiovascular health indicators',
          },
          mental: {
            biomarkers: [
              'stress_level',
              'cognitive_load',
              'mood_indicators',
              'stress_resilience',
            ],
            description: 'Mental health and stress indicators',
          },
          body: {
            biomarkers: [
              'energy_level',
              'recovery_status',
              'readiness_score',
            ],
            description: 'Overall body condition and readiness',
          },
        },
        total: 25, // Focus on key biomarkers for MCP
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Sahha API] Error fetching biomarkers:', error);
      throw new Error('Failed to fetch available biomarkers');
    }
  }

  /**
   * Get biomarker data for a specific profile
   */
  async getBiomarkers(profileId: string, query: BiomArkerQuery = {}): Promise<BiomArkerData[]> {
    try {
      const params = new URLSearchParams();
      
      if (query.date) {
        params.append('date', query.date);
      }
      
      if (query.biomarkers && query.biomarkers.length > 0) {
        params.append('types', query.biomarkers.join(','));
      }

      // Map timeRange to actual date parameters
      if (query.timeRange) {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (query.timeRange) {
          case 'today':
            params.append('date', endDate.toISOString().split('T')[0]);
            break;
          case 'week':
            startDate.setDate(endDate.getDate() - 7);
            params.append('startDate', startDate.toISOString().split('T')[0]);
            params.append('endDate', endDate.toISOString().split('T')[0]);
            break;
          case 'month':
            startDate.setDate(endDate.getDate() - 30);
            params.append('startDate', startDate.toISOString().split('T')[0]);
            params.append('endDate', endDate.toISOString().split('T')[0]);
            break;
        }
      }

      const url = `/v1/profile/${profileId}/biomarker?${params.toString()}`;
      const response: AxiosResponse<BiomArkerData[]> = await this.client.get(url);
      
      return response.data || [];
    } catch (error) {
      console.error(`[Sahha API] Error fetching biomarkers for profile ${profileId}:`, error);
      throw new Error('Failed to fetch biomarker data');
    }
  }

  /**
   * Get comprehensive profile data
   */
  async getProfileData(profileId: string): Promise<HealthProfile> {
    try {
      const biomarkers = await this.getBiomarkers(profileId, { timeRange: 'week' });
      
      // Assess data quality based on available data
      const dataQuality = this.assessDataQuality(biomarkers);
      
      return {
        profileId,
        biomarkers,
        lastUpdated: new Date().toISOString(),
        dataQuality,
      };
    } catch (error) {
      console.error(`[Sahha API] Error fetching profile data for ${profileId}:`, error);
      throw new Error('Failed to fetch profile data');
    }
  }

  /**
   * Get biomarker trends over time
   */
  async getBiomarkerTrends(profileId: string, options: { biomarkers?: string[], period?: string } = {}): Promise<any> {
    try {
      const { biomarkers, period = '30d' } = options;
      
      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '14d':
          startDate.setDate(endDate.getDate() - 14);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
      }

      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      if (biomarkers && biomarkers.length > 0) {
        params.append('types', biomarkers.join(','));
      }

      const url = `/v1/profile/${profileId}/biomarker?${params.toString()}`;
      const response = await this.client.get(url);
      
      return {
        profileId,
        period,
        biomarkers,
        data: response.data || [],
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
      };
    } catch (error) {
      console.error(`[Sahha API] Error fetching trends for profile ${profileId}:`, error);
      throw new Error('Failed to fetch biomarker trends');
    }
  }

  /**
   * Assess data quality based on available biomarkers
   */
  private assessDataQuality(biomarkers: BiomArkerData[]): 'excellent' | 'good' | 'limited' | 'poor' {
    if (biomarkers.length === 0) return 'poor';
    
    const recentData = biomarkers.filter(b => {
      const dataDate = new Date(b.startDateTime);
      const daysDiff = (Date.now() - dataDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 1; // Data from last 24 hours
    });

    const recentDataRatio = recentData.length / biomarkers.length;
    
    if (recentDataRatio > 0.8) return 'excellent';
    if (recentDataRatio > 0.6) return 'good'; 
    if (recentDataRatio > 0.3) return 'limited';
    return 'poor';
  }
}