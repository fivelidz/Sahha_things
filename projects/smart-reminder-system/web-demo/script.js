// Real Sahha data integration with fallback to mock data
async function generateHealthData() {
    try {
        // Try to get real Sahha data first
        if (window.RealSahhaAPI) {
            console.log('🔄 Fetching real Sahha health data...');
            const sahhaAPI = new window.RealSahhaAPI();
            const realData = await sahhaAPI.getHealthData();
            console.log('✅ Real Sahha data loaded:', realData);
            
            // Add data source indicator
            realData.data_source = 'real_sahha_api';
            return realData;
        }
    } catch (error) {
        console.warn('⚠️ Real data fetch failed, using mock data:', error);
    }

    // Fallback to mock data
    console.log('🔄 Using mock health data...');
    return generateMockHealthData();
}

// Mock data generator (fallback)
function generateMockHealthData() {
    const generateRandomScore = (min = 0, max = 100) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const sleepScore = generateRandomScore(40, 95);
    const readinessScore = generateRandomScore(30, 100);
    const activityScore = generateRandomScore(20, 100);
    const hydrationLevel = generateRandomScore(1, 5);

    return {
        today: {
            sleep_quality: sleepScore,
            readiness_score: readinessScore,
            activity_level: activityScore,
            hydration_need: hydrationLevel,
            workout_recommendation: readinessScore > 80 ? 'high_intensity' : 
                                  readinessScore > 60 ? 'moderate' : 'light'
        },
        trends: {
            sleep_trend: Math.random() > 0.5 ? 'improving' : Math.random() > 0.5 ? 'stable' : 'declining',
            readiness_trend: Math.random() > 0.5 ? 'improving' : Math.random() > 0.5 ? 'stable' : 'declining',
            activity_trend: Math.random() > 0.5 ? 'improving' : Math.random() > 0.5 ? 'stable' : 'declining',
            hydration_trend: Math.random() > 0.5 ? 'stable' : 'declining'
        },
        recommendations: {
            sleep: [],
            activity: [],
            nutrition: [],
            hydration: []
        },
        data_source: 'mock_fallback'
    };
}

function generateRecommendations(healthData) {
    const { sleep_quality, readiness_score, activity_level, hydration_need, workout_recommendation } = healthData.today;
    
    // Sleep recommendations
    if (sleep_quality < 60) {
        healthData.recommendations.sleep.push("Consider going to bed 30 minutes earlier tonight");
        healthData.recommendations.sleep.push("Try limiting screen time 1 hour before bed");
        healthData.recommendations.sleep.push("Create a relaxing bedtime routine");
    } else if (sleep_quality > 85) {
        healthData.recommendations.sleep.push("Excellent sleep! Keep up your current routine");
        healthData.recommendations.sleep.push("Your sleep schedule is working well");
    } else {
        healthData.recommendations.sleep.push("Good sleep quality - maintain your current habits");
        healthData.recommendations.sleep.push("Consider optimizing your sleep environment");
    }

    // Activity recommendations
    if (workout_recommendation === 'high_intensity') {
        healthData.recommendations.activity.push("Your body is ready for challenging workouts");
        healthData.recommendations.activity.push("Perfect day for strength training or HIIT");
        healthData.recommendations.activity.push("Consider tracking your performance today");
    } else if (workout_recommendation === 'moderate') {
        healthData.recommendations.activity.push("Great day for moderate exercise");
        healthData.recommendations.activity.push("Try yoga, swimming, or a brisk walk");
        healthData.recommendations.activity.push("Listen to your body and don't overdo it");
    } else {
        healthData.recommendations.activity.push("Focus on light activity and recovery");
        healthData.recommendations.activity.push("Gentle stretching or walking recommended");
        healthData.recommendations.activity.push("Prioritize rest and stress management");
    }

    // Hydration recommendations
    if (hydration_need > 3) {
        healthData.recommendations.hydration.push("Increase water intake - you may be dehydrated");
        healthData.recommendations.hydration.push("Aim for 8-10 glasses of water today");
        healthData.recommendations.hydration.push("Monitor urine color as hydration indicator");
    } else {
        healthData.recommendations.hydration.push("Maintain current hydration levels");
        healthData.recommendations.hydration.push("Keep a water bottle nearby");
    }

    // Nutrition recommendations
    if (activity_level > 70) {
        healthData.recommendations.nutrition.push("Consider a protein-rich post-workout meal");
        healthData.recommendations.nutrition.push("Fuel your active day with complex carbs");
        healthData.recommendations.nutrition.push("Don't forget healthy fats for recovery");
    } else if (activity_level < 40) {
        healthData.recommendations.nutrition.push("Focus on light, balanced meals today");
        healthData.recommendations.nutrition.push("Plenty of vegetables and lean proteins");
        healthData.recommendations.nutrition.push("Avoid heavy or processed foods");
    } else {
        healthData.recommendations.nutrition.push("Maintain balanced nutrition throughout the day");
        healthData.recommendations.nutrition.push("Regular meal timing supports energy levels");
    }

    return healthData;
}

function updateMetrics(healthData) {
    const { sleep_quality, readiness_score, activity_level, hydration_need } = healthData.today;
    const { sleep_trend, readiness_trend, activity_trend, hydration_trend } = healthData.trends;

    // Update metric values
    document.getElementById('sleepScore').textContent = `${sleep_quality}/100`;
    document.getElementById('readinessScore').textContent = `${readiness_score}/100`;
    document.getElementById('activityScore').textContent = `${activity_level}/100`;
    document.getElementById('hydrationLevel').textContent = `${hydration_need}/5`;

    // Update trends
    const updateTrend = (elementId, trend) => {
        const element = document.getElementById(elementId);
        element.textContent = trend.charAt(0).toUpperCase() + trend.slice(1);
        element.className = `metric-trend trend-${trend}`;
    };

    updateTrend('sleepTrend', sleep_trend);
    updateTrend('readinessTrend', readiness_trend);
    updateTrend('activityTrend', activity_trend);
    updateTrend('hydrationTrend', hydration_trend);
}

function generateNotifications(healthData) {
    const { sleep_quality, readiness_score, workout_recommendation } = healthData.today;
    const notifications = [];

    // Morning notification based on sleep
    let sleepNotification = {
        title: "",
        message: "",
        time: new Date().toLocaleTimeString()
    };

    if (sleep_quality >= 85) {
        sleepNotification.title = "🌟 Excellent Sleep Quality!";
        sleepNotification.message = `Sleep Score: ${sleep_quality}/100 - You're ready to conquer the day!`;
    } else if (sleep_quality >= 70) {
        sleepNotification.title = "😊 Good Sleep Quality";
        sleepNotification.message = `Sleep Score: ${sleep_quality}/100 - Feeling refreshed and ready!`;
    } else if (sleep_quality >= 50) {
        sleepNotification.title = "😐 Fair Sleep Quality";
        sleepNotification.message = `Sleep Score: ${sleep_quality}/100 - Take it easy today.`;
    } else {
        sleepNotification.title = "😴 Poor Sleep Quality";
        sleepNotification.message = `Sleep Score: ${sleep_quality}/100 - Focus on recovery today.`;
    }

    notifications.push(sleepNotification);

    // Workout recommendation notification
    let workoutNotification = {
        time: new Date(Date.now() + 2000).toLocaleTimeString()
    };

    if (workout_recommendation === 'high_intensity') {
        workoutNotification.title = "💪 High-Intensity Workout Ready!";
        workoutNotification.message = `Readiness: ${readiness_score}/100 - Perfect for challenging exercises`;
    } else if (workout_recommendation === 'moderate') {
        workoutNotification.title = "🚶 Moderate Exercise Recommended";
        workoutNotification.message = `Readiness: ${readiness_score}/100 - Good for steady-state exercise`;
    } else {
        workoutNotification.title = "🧘 Light Activity Suggested";
        workoutNotification.message = `Readiness: ${readiness_score}/100 - Focus on recovery`;
    }

    notifications.push(workoutNotification);

    return notifications;
}

function displayNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    container.innerHTML = '';

    notifications.forEach((notification, index) => {
        setTimeout(() => {
            const notificationEl = document.createElement('div');
            notificationEl.className = 'notification';
            notificationEl.innerHTML = `
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">Sent at ${notification.time}</div>
            `;
            container.appendChild(notificationEl);
        }, index * 1000);
    });
}

function displayRecommendations(healthData) {
    const categories = ['sleep', 'activity', 'hydration', 'nutrition'];
    
    categories.forEach(category => {
        const listEl = document.getElementById(`${category}Recommendations`);
        listEl.innerHTML = '';
        
        healthData.recommendations[category].forEach(recommendation => {
            const li = document.createElement('li');
            li.textContent = recommendation;
            listEl.appendChild(li);
        });
    });
}

function updateDataSourceIndicator(dataSource) {
    const indicator = document.getElementById('dataSourceIndicator');
    if (dataSource === 'real_sahha_api') {
        indicator.innerHTML = '<span style="background: #4CAF50; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem;">🎉 Using REAL Sahha Health Data</span>';
    } else {
        indicator.innerHTML = '<span style="background: #2196F3; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem;">📝 Demo Mode (Mock Data)</span>';
    }
}

function showSection(sectionId) {
    document.getElementById(sectionId).style.display = 'block';
}

async function runDemo() {
    const runButton = document.getElementById('runDemo');
    runButton.textContent = 'Loading Real Data...';
    runButton.disabled = true;

    // Generate health data (real or mock)
    let healthData = await generateHealthData();
    healthData = generateRecommendations(healthData);

    // Show data source indicator
    if (healthData.data_source === 'real_sahha_api') {
        console.log('🎉 Using REAL Sahha health data!');
    } else {
        console.log('📝 Using mock data (real API not available)');
    }

    // Show and update dashboard
    setTimeout(() => {
        showSection('healthDashboard');
        updateMetrics(healthData);
        updateDataSourceIndicator(healthData.data_source);
    }, 500);

    // Show notifications
    setTimeout(() => {
        showSection('notifications');
        const notifications = generateNotifications(healthData);
        displayNotifications(notifications);
    }, 1000);

    // Show recommendations
    setTimeout(() => {
        showSection('recommendations');
        displayRecommendations(healthData);
    }, 3000);

    // Reset button
    setTimeout(() => {
        runButton.textContent = 'Run Another Demo';
        runButton.disabled = false;
    }, 4000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('runDemo').addEventListener('click', runDemo);
});

// Auto-run demo on load for demonstration
setTimeout(() => {
    if (window.location.hash !== '#no-auto') {
        runDemo();
    }
}, 1000);