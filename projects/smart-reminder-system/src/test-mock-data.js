const { mockHealthScores, mockBiomarkers, mockHealthInsights } = require('./mock-data');

console.log('🧪 Testing Mock Data Structure for Smart Reminder System\n');

// Test Health Scores
console.log('📊 HEALTH SCORES (Last 7 Days)');
console.log('='.repeat(50));
mockHealthScores.scores.forEach((day, index) => {
  console.log(`Day ${index + 1} (${day.date}):`);
  console.log(`  😴 Sleep: ${day.sleep.score}/100 (${day.sleep.duration}h)`);
  console.log(`  🏃 Activity: ${day.activity.score}/100 (${day.activity.steps} steps)`);
  console.log(`  💪 Readiness: ${day.readiness.score}/100 (${day.readiness.recovery_status})`);
  console.log(`  🧠 Mental: ${day.mental_wellbeing.score}/100`);
  console.log('');
});

// Test Today's Insights
console.log('🎯 TODAY\'S INSIGHTS');
console.log('='.repeat(50));
console.log(`😴 Sleep Quality: ${mockHealthInsights.today.sleep_quality}/100`);
console.log(`💪 Readiness Score: ${mockHealthInsights.today.readiness_score}/100`);
console.log(`🏃 Activity Level: ${mockHealthInsights.today.activity_level}/100`);
console.log(`💧 Hydration Need: ${mockHealthInsights.today.hydration_need}/5`);
console.log(`🏋️ Workout Rec: ${mockHealthInsights.today.workout_recommendation || 'TBD'}`);
console.log(`🍽️ Meal Timing: ${mockHealthInsights.today.meal_timing_suggestion || 'TBD'}\n`);

// Test Recommendations
console.log('💡 PERSONALIZED RECOMMENDATIONS');
console.log('='.repeat(50));

if (mockHealthInsights.recommendations.sleep.length > 0) {
  console.log('😴 Sleep Recommendations:');
  mockHealthInsights.recommendations.sleep.forEach(rec => 
    console.log(`  • ${rec}`)
  );
}

if (mockHealthInsights.recommendations.activity.length > 0) {
  console.log('🏃 Activity Recommendations:');
  mockHealthInsights.recommendations.activity.forEach(rec => 
    console.log(`  • ${rec}`)
  );
}

if (mockHealthInsights.recommendations.nutrition.length > 0) {
  console.log('🍽️ Nutrition Recommendations:');
  mockHealthInsights.recommendations.nutrition.forEach(rec => 
    console.log(`  • ${rec}`)
  );
}

if (mockHealthInsights.recommendations.hydration.length > 0) {
  console.log('💧 Hydration Recommendations:');
  mockHealthInsights.recommendations.hydration.forEach(rec => 
    console.log(`  • ${rec}`)
  );
}

// Test Biomarkers Sample
console.log('\n📋 BIOMARKERS SAMPLE (Today)');
console.log('='.repeat(50));
const todayBiomarkers = mockBiomarkers.biomarkers[mockBiomarkers.biomarkers.length - 1];
console.log(`💓 Heart Rate: ${todayBiomarkers.heart_rate.average} bpm (avg)`);
console.log(`😴 Sleep: ${todayBiomarkers.sleep_metrics.bedtime} - ${todayBiomarkers.sleep_metrics.wake_time}`);
console.log(`🚶 Steps: ${todayBiomarkers.activity_metrics.steps}`);
console.log(`🔥 Calories: ${todayBiomarkers.activity_metrics.calories_active} active`);
console.log(`🌡️ Body Temp: ${todayBiomarkers.physiological.body_temperature}°C`);
console.log(`🫁 O2 Sat: ${todayBiomarkers.physiological.oxygen_saturation}%`);

console.log('\n✅ Mock data structure is ready for Smart Reminder System MVP!');
console.log('🔄 This data refreshes on each run to simulate real health variations.');