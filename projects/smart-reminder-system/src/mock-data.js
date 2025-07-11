// Mock data structure based on expected Sahha API responses
// This allows MVP development while authentication issues are resolved

const generateRandomScore = (min = 0, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateDateRange = (days = 7) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const mockHealthScores = {
  profile_id: "SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28",
  scores: generateDateRange(7).map(date => ({
    date: date,
    sleep: {
      score: generateRandomScore(40, 95),
      duration: Math.round((Math.random() * 4 + 6) * 10) / 10, // 6-10 hours
      quality: generateRandomScore(30, 100),
      deep_sleep_minutes: Math.floor(Math.random() * 120 + 60),
      rem_sleep_minutes: Math.floor(Math.random() * 90 + 45),
      light_sleep_minutes: Math.floor(Math.random() * 180 + 120)
    },
    activity: {
      score: generateRandomScore(20, 100),
      steps: Math.floor(Math.random() * 15000 + 3000),
      calories_burned: Math.floor(Math.random() * 1000 + 1500),
      active_minutes: Math.floor(Math.random() * 120 + 30),
      floors_climbed: Math.floor(Math.random() * 20 + 5)
    },
    readiness: {
      score: generateRandomScore(30, 100),
      heart_rate_variability: Math.round((Math.random() * 50 + 25) * 10) / 10,
      resting_heart_rate: Math.floor(Math.random() * 30 + 55),
      recovery_status: generateRandomScore(0, 100) > 70 ? "good" : 
                      generateRandomScore(0, 100) > 40 ? "moderate" : "poor"
    },
    mental_wellbeing: {
      score: generateRandomScore(25, 95),
      stress_level: generateRandomScore(10, 90),
      mood_indicator: generateRandomScore(20, 100)
    }
  })),
  generated_at: new Date().toISOString()
};

const mockBiomarkers = {
  profile_id: "SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28",
  biomarkers: generateDateRange(7).map(date => ({
    date: date,
    heart_rate: {
      average: Math.floor(Math.random() * 30 + 60),
      max: Math.floor(Math.random() * 50 + 150),
      min: Math.floor(Math.random() * 20 + 45),
      resting: Math.floor(Math.random() * 25 + 50)
    },
    sleep_metrics: {
      bedtime: `${Math.floor(Math.random() * 3 + 21)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      wake_time: `${Math.floor(Math.random() * 3 + 6)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      sleep_efficiency: Math.round((Math.random() * 30 + 70) * 10) / 10
    },
    activity_metrics: {
      steps: Math.floor(Math.random() * 15000 + 3000),
      distance_km: Math.round((Math.random() * 10 + 2) * 100) / 100,
      calories_active: Math.floor(Math.random() * 800 + 200),
      calories_total: Math.floor(Math.random() * 1000 + 1800)
    },
    physiological: {
      body_temperature: Math.round((Math.random() * 2 + 36) * 10) / 10,
      oxygen_saturation: Math.round((Math.random() * 5 + 95) * 10) / 10,
      respiratory_rate: Math.floor(Math.random() * 8 + 12)
    }
  })),
  generated_at: new Date().toISOString()
};

// Health insights for reminder system
const mockHealthInsights = {
  profile_id: "SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28",
  today: {
    sleep_quality: mockHealthScores.scores[mockHealthScores.scores.length - 1]?.sleep.score || 75,
    readiness_score: mockHealthScores.scores[mockHealthScores.scores.length - 1]?.readiness.score || 80,
    activity_level: mockHealthScores.scores[mockHealthScores.scores.length - 1]?.activity.score || 65,
    hydration_need: generateRandomScore(1, 5), // 1-5 scale
    workout_recommendation: null, // Will be calculated
    meal_timing_suggestion: null // Will be calculated
  },
  trends: {
    sleep_trend: "improving", // improving, declining, stable
    activity_trend: "stable",
    readiness_trend: "improving"
  },
  recommendations: {
    sleep: [],
    activity: [],
    nutrition: [],
    hydration: []
  },
  generated_at: new Date().toISOString()
};

// Calculate dynamic recommendations
const calculateRecommendations = (insights) => {
  const { sleep_quality, readiness_score, activity_level } = insights.today;
  
  // Sleep-based recommendations
  if (sleep_quality < 60) {
    insights.recommendations.sleep.push("Consider going to bed 30 minutes earlier tonight");
    insights.recommendations.sleep.push("Try limiting screen time 1 hour before bed");
  } else if (sleep_quality > 85) {
    insights.recommendations.sleep.push("Great sleep! Keep up your current routine");
  }
  
  // Readiness-based workout recommendations
  if (readiness_score > 80) {
    insights.today.workout_recommendation = "high_intensity";
    insights.recommendations.activity.push("Your body is ready for a challenging workout");
  } else if (readiness_score > 60) {
    insights.today.workout_recommendation = "moderate";
    insights.recommendations.activity.push("Consider moderate exercise today");
  } else {
    insights.today.workout_recommendation = "light";
    insights.recommendations.activity.push("Take it easy today - light activity or rest");
  }
  
  // Activity-based nutrition
  if (activity_level > 70) {
    insights.today.meal_timing_suggestion = "increased_portions";
    insights.recommendations.nutrition.push("Consider a protein-rich post-workout meal");
  } else if (activity_level < 40) {
    insights.today.meal_timing_suggestion = "lighter_meals";
    insights.recommendations.nutrition.push("Light, balanced meals today");
  }
  
  // Hydration recommendations
  if (insights.today.hydration_need > 3) {
    insights.recommendations.hydration.push("Increase water intake - you may be dehydrated");
  } else if (insights.today.hydration_need < 2) {
    insights.recommendations.hydration.push("Maintain current hydration levels");
  }
  
  return insights;
};

// Generate fresh mock data
const generateMockData = () => {
  const freshInsights = { ...mockHealthInsights };
  return calculateRecommendations(freshInsights);
};

module.exports = {
  mockHealthScores,
  mockBiomarkers,
  mockHealthInsights: generateMockData(),
  generateMockData
};