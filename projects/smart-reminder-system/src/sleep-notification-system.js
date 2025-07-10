const { generateMockData } = require('./mock-data');
const notifier = require('node-notifier');

class SleepNotificationSystem {
  constructor() {
    this.userId = 'demo-user';
    this.notificationHistory = [];
  }

  async getHealthData() {
    // In production, this would call the Sahha API
    // For now, using mock data while authentication is resolved
    return generateMockData();
  }

  analyzeSleepQuality(healthData) {
    const sleepScore = healthData.today.sleep_quality;
    const readinessScore = healthData.today.readiness_score;
    
    // Determine sleep quality category
    let category, recommendations = [];
    
    if (sleepScore >= 85) {
      category = 'excellent';
      recommendations = [
        "🌟 Outstanding sleep! Keep up your current routine",
        "💪 Your body is primed for peak performance today",
        "🏃 Perfect day for challenging workouts"
      ];
    } else if (sleepScore >= 70) {
      category = 'good';
      recommendations = [
        "😊 Good sleep quality detected",
        "⚡ You should feel energized today",
        "🎯 Great day to tackle important tasks"
      ];
    } else if (sleepScore >= 50) {
      category = 'fair';
      recommendations = [
        "😐 Moderate sleep quality - be gentle with yourself",
        "☕ Consider limiting caffeine after 2 PM today",
        "🚶 Light exercise might help boost your energy"
      ];
    } else {
      category = 'poor';
      recommendations = [
        "😴 Poor sleep detected - prioritize rest today",
        "🛌 Consider going to bed 30 minutes earlier tonight",
        "🧘 Try relaxation techniques before bed",
        "📱 Limit screen time 1 hour before bedtime"
      ];
    }

    return {
      category,
      score: sleepScore,
      readinessScore,
      recommendations,
      shouldNotify: true
    };
  }

  generateMorningNotification(analysis) {
    const { category, score, recommendations } = analysis;
    
    const messages = {
      excellent: {
        title: "🌟 Excellent Sleep Quality!",
        message: `Sleep Score: ${score}/100 - You're ready to conquer the day!`
      },
      good: {
        title: "😊 Good Sleep Quality",
        message: `Sleep Score: ${score}/100 - Feeling refreshed and ready!`
      },
      fair: {
        title: "😐 Fair Sleep Quality",
        message: `Sleep Score: ${score}/100 - Take it easy today.`
      },
      poor: {
        title: "😴 Poor Sleep Quality",
        message: `Sleep Score: ${score}/100 - Focus on recovery today.`
      }
    };

    return {
      ...messages[category],
      recommendations: recommendations.slice(0, 2), // Show top 2 recommendations
      timestamp: new Date().toISOString()
    };
  }

  generateWorkoutRecommendation(healthData) {
    const { readiness_score, workout_recommendation } = healthData.today;
    
    const workoutMessages = {
      high_intensity: {
        title: "💪 High-Intensity Workout Ready!",
        message: `Readiness: ${readiness_score}/100 - Perfect for challenging exercises`,
        suggestions: ["🏋️ Strength training", "🏃 HIIT workout", "🚴 Intense cardio"]
      },
      moderate: {
        title: "🚶 Moderate Exercise Recommended",
        message: `Readiness: ${readiness_score}/100 - Good for steady-state exercise`,
        suggestions: ["🚶 Brisk walk", "🧘 Yoga session", "🏊 Swimming"]
      },
      light: {
        title: "🧘 Light Activity Suggested",
        message: `Readiness: ${readiness_score}/100 - Focus on recovery`,
        suggestions: ["🚶 Gentle walk", "🧘 Stretching", "📚 Rest day"]
      }
    };

    return workoutMessages[workout_recommendation] || workoutMessages.moderate;
  }

  async sendNotification(notification) {
    console.log('\n🔔 SENDING NOTIFICATION');
    console.log('='.repeat(50));
    console.log(`📱 ${notification.title}`);
    console.log(`💬 ${notification.message}`);
    
    if (notification.recommendations) {
      console.log('\n💡 Recommendations:');
      notification.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    if (notification.suggestions) {
      console.log('\n🎯 Suggested Activities:');
      notification.suggestions.forEach(sug => console.log(`   ${sug}`));
    }
    
    console.log('='.repeat(50));

    // Show system notification (desktop)
    try {
      notifier.notify({
        title: notification.title,
        message: notification.message,
        icon: './assets/icon.png', // You can add an icon file
        sound: true,
        timeout: 10
      });
    } catch (error) {
      console.log('Note: Desktop notifications not available in this environment');
    }

    // Log to history
    this.notificationHistory.push({
      ...notification,
      sentAt: new Date().toISOString()
    });
  }

  async runMorningCheckup() {
    console.log('🌅 Running Morning Health Checkup...\n');
    
    try {
      // Get current health data
      const healthData = await this.getHealthData();
      
      // Analyze sleep quality
      const sleepAnalysis = this.analyzeSleepQuality(healthData);
      
      // Generate and send morning notification
      const morningNotification = this.generateMorningNotification(sleepAnalysis);
      await this.sendNotification(morningNotification);
      
      // Wait a moment, then send workout recommendation
      setTimeout(async () => {
        const workoutRecommendation = this.generateWorkoutRecommendation(healthData);
        await this.sendNotification(workoutRecommendation);
      }, 2000);
      
      // Show health summary
      this.showHealthSummary(healthData);
      
      return {
        success: true,
        sleepScore: sleepAnalysis.score,
        readinessScore: healthData.today.readiness_score,
        recommendations: sleepAnalysis.recommendations
      };
      
    } catch (error) {
      console.error('❌ Morning checkup failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  showHealthSummary(healthData) {
    console.log('\n📊 HEALTH SUMMARY');
    console.log('='.repeat(50));
    console.log(`😴 Sleep Quality: ${healthData.today.sleep_quality}/100`);
    console.log(`💪 Readiness Score: ${healthData.today.readiness_score}/100`);
    console.log(`🏃 Activity Level: ${healthData.today.activity_level}/100`);
    console.log(`💧 Hydration Need: ${healthData.today.hydration_need}/5`);
    console.log(`🏋️ Workout Type: ${healthData.today.workout_recommendation || 'TBD'}`);
    console.log('='.repeat(50));
  }

  getNotificationHistory() {
    return this.notificationHistory;
  }
}

module.exports = SleepNotificationSystem;