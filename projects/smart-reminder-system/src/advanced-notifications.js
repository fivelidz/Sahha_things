// Advanced Notification System with Real Sahha Data Integration
// Builds on existing notification features with sophisticated health analysis

const SahhaAccountClient = require('./sahha-account-client');
const SleepMetricsBuilder = require('../api-builders/sleep-metrics-builder');
const ActivityMetricsBuilder = require('../api-builders/activity-metrics-builder');

class AdvancedNotificationSystem {
    constructor(accountToken) {
        this.sahhaClient = new SahhaAccountClient(accountToken);
        this.sleepBuilder = new SleepMetricsBuilder(accountToken);
        this.activityBuilder = new ActivityMetricsBuilder(accountToken);
        this.notificationHistory = [];
    }

    // Enhanced health assessment with trend analysis
    async generateAdvancedHealthAssessment(days = 7) {
        try {
            // Calculate date range
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
            const profileId = 'SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28';
            
            const biomarkers = await this.sahhaClient.getBiomarkers(profileId, startDate, endDate);
            console.log('📊 Biomarkers retrieved:', biomarkers.length, 'data points');
            
            const healthData = this.sahhaClient.processHealthData(biomarkers);
            
            // Analyze trends across multiple days
            const trendAnalysis = this.analyzeTrends(biomarkers);
            
            return {
                current: healthData,
                trends: trendAnalysis,
                biomarkers: biomarkers,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating advanced health assessment:', error);
            throw error;
        }
    }

    // Analyze patterns and trends over time
    analyzeTrends(biomarkers) {
        const trends = {
            sleep: { pattern: 'stable', confidence: 0.5 },
            activity: { pattern: 'stable', confidence: 0.5 },
            consistency: { score: 50, areas: [] }
        };

        // Group biomarkers by day
        const dailyData = {};
        biomarkers.forEach(marker => {
            const date = marker.startDateTime.split('T')[0];
            if (!dailyData[date]) dailyData[date] = [];
            dailyData[date].push(marker);
        });

        const dates = Object.keys(dailyData).sort();
        
        if (dates.length >= 3) {
            // Analyze sleep duration trend
            const sleepDurations = dates.map(date => {
                const sleepMarker = dailyData[date].find(m => m.type === 'sleep_duration');
                return sleepMarker ? parseInt(sleepMarker.value) : null;
            }).filter(v => v !== null);

            if (sleepDurations.length >= 3) {
                const avgEarly = sleepDurations.slice(0, Math.floor(sleepDurations.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(sleepDurations.length / 2);
                const avgRecent = sleepDurations.slice(-Math.floor(sleepDurations.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(sleepDurations.length / 2);
                
                const change = (avgRecent - avgEarly) / avgEarly * 100;
                
                if (change > 10) {
                    trends.sleep.pattern = 'improving';
                    trends.sleep.confidence = 0.8;
                } else if (change < -10) {
                    trends.sleep.pattern = 'declining';
                    trends.sleep.confidence = 0.8;
                }
            }

            // Analyze activity consistency
            const stepCounts = dates.map(date => {
                const stepsMarker = dailyData[date].find(m => m.type === 'steps');
                return stepsMarker ? parseInt(stepsMarker.value) : null;
            }).filter(v => v !== null);

            if (stepCounts.length >= 3) {
                const variance = this.calculateVariance(stepCounts);
                const mean = stepCounts.reduce((a, b) => a + b, 0) / stepCounts.length;
                const cv = Math.sqrt(variance) / mean; // Coefficient of variation
                
                if (cv < 0.3) {
                    trends.consistency.score = 85;
                    trends.consistency.areas.push('Activity levels are very consistent');
                } else if (cv < 0.5) {
                    trends.consistency.score = 70;
                    trends.consistency.areas.push('Activity levels are moderately consistent');
                } else {
                    trends.consistency.score = 40;
                    trends.consistency.areas.push('Activity levels vary significantly day to day');
                }
            }
        }

        return trends;
    }

    // Enhanced notification generation with contextual intelligence
    async generateContextualNotifications(healthAssessment) {
        const notifications = [];
        const { current, trends, biomarkers } = healthAssessment;
        const now = new Date();

        // 1. Sleep Quality Notification with Trend Context
        const sleepNotification = this.createSleepNotification(current, trends.sleep);
        notifications.push(sleepNotification);

        // 2. Activity Recommendation with Recovery Context
        const activityNotification = this.createActivityNotification(current, current, trends.activity);
        notifications.push(activityNotification);

        // 3. Hydration Reminder with Environmental Context
        const hydrationNotification = this.createHydrationNotification(current, now);
        notifications.push(hydrationNotification);

        // 4. Recovery Assessment Notification
        const recoveryNotification = this.createRecoveryNotification(current, trends);
        notifications.push(recoveryNotification);

        // 5. Personalized Coaching Notification
        const coachingNotification = this.createCoachingNotification(trends);
        notifications.push(coachingNotification);

        // Store notifications in history
        this.notificationHistory.push({
            timestamp: now.toISOString(),
            notifications: notifications,
            healthData: current
        });

        return notifications;
    }

    createSleepNotification(sleepData, sleepTrend) {
        const quality = sleepData.scores.sleep_quality;
        const duration = sleepData.sleep.duration_hours;
        
        let title, message, priority, actionable;

        if (quality >= 85) {
            title = "🌟 Excellent Sleep Quality!";
            message = `${duration}h sleep with ${quality}/100 quality. Your body is fully recovered and ready for peak performance.`;
            priority = "low";
            actionable = "Consider maintaining this sleep schedule - it's working perfectly!";
        } else if (quality >= 70) {
            title = "😊 Good Sleep Quality";
            message = `${duration}h sleep with ${quality}/100 quality. Solid recovery with room for optimization.`;
            priority = "low";
            actionable = sleepTrend.pattern === 'improving' ? 
                "Great progress! Your sleep is improving." : 
                "Consider fine-tuning your bedtime routine for even better sleep.";
        } else if (quality >= 50) {
            title = "😐 Moderate Sleep Quality";
            message = `${duration}h sleep with ${quality}/100 quality. Your body needs more recovery time.`;
            priority = "medium";
            actionable = sleepTrend.pattern === 'declining' ? 
                "Sleep quality is declining. Consider addressing sleep hygiene." : 
                "Focus on improving sleep environment and routine.";
        } else {
            title = "⚠️ Poor Sleep Quality";
            message = `${duration}h sleep with ${quality}/100 quality. Significant recovery needed.`;
            priority = "high";
            actionable = "Prioritize sleep improvement - consider consulting a sleep specialist if this continues.";
        }

        return {
            id: `sleep-${Date.now()}`,
            type: 'sleep_quality',
            title,
            message,
            priority,
            actionable,
            category: 'sleep',
            timestamp: new Date().toISOString(),
            data: { quality, duration }
        };
    }

    createActivityNotification(activityData, sleepData, activityTrend) {
        const readiness = activityData.scores.readiness_score;
        const sleepQuality = sleepData.scores.sleep_quality;
        const recommendation = activityData.recommendations.workout_recommendation;

        let title, message, priority, actionable;

        if (readiness >= 85 && sleepQuality >= 70) {
            title = "💪 Peak Performance Ready!";
            message = `Readiness: ${readiness}/100. Your body is primed for challenging workouts.`;
            priority = "medium";
            actionable = `Perfect day for: high-intensity workouts, strength training, HIIT`;
        } else if (readiness >= 65) {
            title = "🚶 Moderate Exercise Recommended";
            message = `Readiness: ${readiness}/100. Good energy for steady-state activities.`;
            priority = "low";
            actionable = `Consider: brisk walking, swimming, yoga, cycling`;
        } else {
            title = "🧘 Recovery Focus Today";
            message = `Readiness: ${readiness}/100. Your body needs recovery time.`;
            priority = "medium";
            actionable = sleepQuality < 60 ? 
                "Poor sleep + low readiness = prioritize rest and gentle movement." :
                "Light activity and stress management recommended.";
        }

        return {
            id: `activity-${Date.now()}`,
            type: 'activity_recommendation',
            title,
            message,
            priority,
            actionable,
            category: 'activity',
            timestamp: new Date().toISOString(),
            data: { readiness, recommendation }
        };
    }

    createHydrationNotification(activityData, currentTime) {
        const hour = currentTime.getHours();
        const activeMinutes = activityData.activity.active_minutes || 0;
        const caloriesBurned = activityData.activity.calories_active || 0;
        
        let title, message, priority, actionable;

        // Calculate hydration needs based on activity and time
        const baseHydration = 8; // glasses per day
        const activityMultiplier = Math.floor(activeMinutes / 30) * 0.5; // Extra for activity
        const timeMultiplier = hour < 12 ? 0.3 : hour < 18 ? 0.5 : 0.2; // Time of day factor
        
        const recommendedGlasses = Math.round((baseHydration + activityMultiplier) * timeMultiplier);

        if (caloriesBurned > 400) {
            title = "💧 High Activity Hydration Alert";
            message = `You've burned ${caloriesBurned} calories today. Increased hydration needed.`;
            priority = "high";
            actionable = `Drink ${recommendedGlasses} glasses of water in the next 2 hours.`;
        } else if (hour >= 14 && hour <= 16) {
            title = "💧 Afternoon Hydration Reminder";
            message = "Mid-day hydration check - staying hydrated supports energy levels.";
            priority = "low";
            actionable = `Aim for ${recommendedGlasses} glasses of water by evening.`;
        } else {
            title = "💧 Stay Hydrated";
            message = "Regular hydration supports optimal health and performance.";
            priority = "low";
            actionable = "Keep a water bottle nearby and sip regularly.";
        }

        return {
            id: `hydration-${Date.now()}`,
            type: 'hydration_reminder',
            title,
            message,
            priority,
            actionable,
            category: 'hydration',
            timestamp: new Date().toISOString(),
            data: { recommendedGlasses, activeMinutes, caloriesBurned }
        };
    }

    createRecoveryNotification(currentHealth, trends) {
        const sleepScore = currentHealth.scores.sleep_quality;
        const activityScore = currentHealth.scores.activity_level;
        const overallRecovery = Math.round((sleepScore + activityScore) / 2);

        let title, message, priority, actionable;

        if (overallRecovery >= 80) {
            title = "🎯 Excellent Recovery Status";
            message = `Recovery Score: ${overallRecovery}/100. Your body is performing optimally.`;
            priority = "low";
            actionable = "Great job! Maintain your current health routines.";
        } else if (overallRecovery >= 60) {
            title = "⚖️ Balanced Recovery";
            message = `Recovery Score: ${overallRecovery}/100. Good balance with room for improvement.`;
            priority = "medium";
            actionable = trends.sleep.pattern === 'declining' ? 
                "Focus on sleep quality to boost recovery." : 
                "Consider optimizing both sleep and activity patterns.";
        } else {
            title = "🔄 Recovery Needed";
            message = `Recovery Score: ${overallRecovery}/100. Your body needs focused recovery time.`;
            priority = "high";
            actionable = "Prioritize sleep, reduce intense activity, and manage stress levels.";
        }

        return {
            id: `recovery-${Date.now()}`,
            type: 'recovery_assessment',
            title,
            message,
            priority,
            actionable,
            category: 'recovery',
            timestamp: new Date().toISOString(),
            data: { overallRecovery, sleepScore, activityScore }
        };
    }

    createCoachingNotification(trends) {
        const consistency = trends.consistency.score;
        const sleepTrend = trends.sleep.pattern;
        
        let title, message, priority, actionable;

        if (consistency >= 80) {
            title = "🏆 Consistency Champion";
            message = `Consistency Score: ${consistency}/100. Your health habits are remarkably steady.`;
            priority = "low";
            actionable = "Excellent consistency! This is the foundation of long-term health success.";
        } else if (consistency >= 60) {
            title = "📈 Building Good Habits";
            message = `Consistency Score: ${consistency}/100. Good patterns with opportunities to stabilize.`;
            priority = "medium";
            actionable = sleepTrend === 'improving' ? 
                "Your sleep is improving! Focus on maintaining this progress." :
                "Work on creating more consistent daily routines.";
        } else {
            title = "🎯 Focus on Consistency";
            message = `Consistency Score: ${consistency}/100. Variable patterns detected.`;
            priority = "medium";
            actionable = "Small, consistent changes lead to big improvements. Start with one habit at a time.";
        }

        return {
            id: `coaching-${Date.now()}`,
            type: 'personalized_coaching',
            title,
            message,
            priority,
            actionable,
            category: 'coaching',
            timestamp: new Date().toISOString(),
            data: { consistency, trends }
        };
    }

    // Utility function for variance calculation
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
    }

    // Generate scheduled notifications for different times of day
    generateScheduledNotifications(healthAssessment) {
        const schedules = {
            morning: { hour: 8, notifications: ['sleep_quality', 'activity_recommendation'] },
            afternoon: { hour: 14, notifications: ['hydration_reminder'] },
            evening: { hour: 19, notifications: ['recovery_assessment', 'personalized_coaching'] }
        };

        return Object.entries(schedules).map(([timeSlot, config]) => ({
            timeSlot,
            scheduledHour: config.hour,
            notificationTypes: config.notifications,
            healthData: healthAssessment
        }));
    }

    // Get notification history for analysis
    getNotificationHistory() {
        return this.notificationHistory;
    }

    // Clear old notifications (older than 7 days)
    cleanupNotificationHistory() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        this.notificationHistory = this.notificationHistory.filter(
            entry => new Date(entry.timestamp) > sevenDaysAgo
        );
    }
}

module.exports = AdvancedNotificationSystem;