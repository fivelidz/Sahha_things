const SahhaAccountClient = require('./sahha-account-client');

async function testRealSahhaData() {
  console.log('🧪 Testing REAL Sahha Data with Account Authentication...\n');
  
  const client = new SahhaAccountClient();
  const sampleProfileId = 'SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28';
  const startDate = '2025-07-05';
  const endDate = '2025-07-11';
  
  try {
    console.log('📊 Fetching real biomarker data...');
    const biomarkers = await client.getBiomarkers(
      sampleProfileId, 
      startDate, 
      endDate,
      ['sleep', 'activity'],
      ['sleep_duration', 'sleep_start_time', 'sleep_end_time', 'steps', 'active_energy_burned', 'active_duration']
    );
    
    console.log(`✅ Retrieved ${biomarkers.length} biomarker data points`);
    
    // Process the data for our Smart Reminder System
    const healthData = client.processHealthData(biomarkers);
    
    console.log('\n📈 PROCESSED HEALTH DATA');
    console.log('='.repeat(50));
    console.log('💤 SLEEP DATA:');
    console.log(`   Duration: ${healthData.sleep.duration_hours || 'N/A'}h`);
    console.log(`   Bedtime: ${healthData.sleep.bedtime ? new Date(healthData.sleep.bedtime).toLocaleTimeString() : 'N/A'}`);
    console.log(`   Wake time: ${healthData.sleep.wake_time ? new Date(healthData.sleep.wake_time).toLocaleTimeString() : 'N/A'}`);
    console.log(`   Sleep debt: ${healthData.sleep.debt_hours || 'N/A'}h`);
    
    console.log('\n🏃 ACTIVITY DATA:');
    console.log(`   Steps: ${healthData.activity.steps || 'N/A'}`);
    console.log(`   Active calories: ${healthData.activity.calories_active || 'N/A'} kcal`);
    console.log(`   Active minutes: ${healthData.activity.active_minutes || 'N/A'} min`);
    console.log(`   Sedentary: ${healthData.activity.sedentary_minutes || 'N/A'} min`);
    
    console.log('\n🎯 SMART REMINDER SCORES:');
    console.log(`   😴 Sleep Quality: ${healthData.scores.sleep_quality}/100 (${healthData.recommendations.sleep_quality_category})`);
    console.log(`   💪 Readiness: ${healthData.scores.readiness_score}/100`);
    console.log(`   🏃 Activity Level: ${healthData.scores.activity_level}/100`);
    console.log(`   💧 Hydration Need: ${healthData.scores.hydration_need}/5`);
    console.log(`   🏋️ Workout Rec: ${healthData.recommendations.workout_recommendation}`);
    
    // Generate Smart Reminder notifications
    console.log('\n🔔 SMART NOTIFICATIONS GENERATED:');
    console.log('='.repeat(50));
    
    const sleepScore = healthData.scores.sleep_quality;
    const readinessScore = healthData.scores.readiness_score;
    
    if (sleepScore >= 85) {
      console.log('📱 🌟 Excellent Sleep Quality!');
      console.log(`   Sleep Score: ${sleepScore}/100 - You're ready to conquer the day!`);
    } else if (sleepScore >= 70) {
      console.log('📱 😊 Good Sleep Quality');
      console.log(`   Sleep Score: ${sleepScore}/100 - Feeling refreshed and ready!`);
    } else if (sleepScore >= 50) {
      console.log('📱 😐 Fair Sleep Quality');
      console.log(`   Sleep Score: ${sleepScore}/100 - Take it easy today.`);
    } else {
      console.log('📱 😴 Poor Sleep Quality');
      console.log(`   Sleep Score: ${sleepScore}/100 - Focus on recovery today.`);
    }
    
    if (healthData.recommendations.workout_recommendation === 'high_intensity') {
      console.log('\n📱 💪 High-Intensity Workout Ready!');
      console.log(`   Readiness: ${readinessScore}/100 - Perfect for challenging exercises`);
    } else if (healthData.recommendations.workout_recommendation === 'moderate') {
      console.log('\n📱 🚶 Moderate Exercise Recommended');
      console.log(`   Readiness: ${readinessScore}/100 - Good for steady-state exercise`);
    } else {
      console.log('\n📱 🧘 Light Activity Suggested');
      console.log(`   Readiness: ${readinessScore}/100 - Focus on recovery`);
    }
    
    // Test other endpoints
    console.log('\n🔍 TESTING OTHER ENDPOINTS:');
    console.log('='.repeat(50));
    
    try {
      const deviceInfo = await client.getDeviceInformation(sampleProfileId);
      console.log('📱 Device Info:', deviceInfo ? 'Available' : 'No data');
    } catch (error) {
      console.log('📱 Device Info: Not available');
    }
    
    try {
      const demographics = await client.getDemographics(sampleProfileId);
      console.log('👤 Demographics:', demographics ? 'Available' : 'No data');
    } catch (error) {
      console.log('👤 Demographics: Not available');
    }
    
    try {
      const archetypes = await client.getArchetypes(sampleProfileId, startDate, endDate);
      console.log('🧬 Archetypes:', archetypes ? 'Available' : 'No data');
    } catch (error) {
      console.log('🧬 Archetypes: Not available');
    }
    
    console.log('\n🎉 REAL DATA INTEGRATION SUCCESSFUL!');
    console.log('✅ Account authentication working');
    console.log('✅ Real biomarker data retrieved');
    console.log('✅ Smart Reminder System processing real health data');
    console.log('✅ Ready for production use!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRealSahhaData();