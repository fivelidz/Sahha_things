// Test Advanced Notification System with Real Sahha Data
// Demonstrates enhanced notification features with trend analysis

const AdvancedNotificationSystem = require('./advanced-notifications');

async function testAdvancedNotifications() {
    console.log('🧠 ADVANCED NOTIFICATION SYSTEM TEST');
    console.log('='.repeat(60));

    const accountToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2FwaS5zYWhoYS5haS9jbGFpbXMvYWNjb3VudElkIjoiZmU3ZTkyMDAtNGEzYS00MmQwLWIxMWEtZjIwYzAxYTZiOTBiIiwiaHR0cHM6Ly9hcGkuc2FoaGEuYWkvY2xhaW1zL2FkbWluIjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9hY2NvdW50IjoiVHJ1ZSIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9zYWhoYUFwaVNjb3BlIjoic2FuZGJveCIsImh0dHBzOi8vYXBpLnNhaGhhLmFpL2NsYWltcy9yZWdpb24iOiJVUyIsImV4cCI6MTc1NDI1NjAzMiwiaXNzIjoiaHR0cHM6Ly9zYWhoYS1wcm9kdWN0aW9uLmF1LmF1dGgwLmNvbS8iLCJhdWQiOiJodHRwczovL3NhaGhhLXByb2R1Y3Rpb24uYXUuYXV0aDAuY29tL2FwaS92Mi8ifQ.IGsV0msiqUiDz1tnPpbbF7Iqt0MofpACjvOslUT7N-k';

    const advancedNotifications = new AdvancedNotificationSystem(accountToken);

    try {
        // 1. Generate comprehensive health assessment
        console.log('\n📊 GENERATING ADVANCED HEALTH ASSESSMENT');
        console.log('-'.repeat(50));
        
        const healthAssessment = await advancedNotifications.generateAdvancedHealthAssessment(7);
        
        console.log('\n🎯 CURRENT HEALTH METRICS:');
        console.log(`Sleep Quality: ${healthAssessment.current.scores.sleep_quality}/100`);
        console.log(`Activity Score: ${healthAssessment.current.scores.activity_level}/100`);
        console.log(`Readiness Score: ${healthAssessment.current.scores.readiness_score}/100`);
        
        console.log('\n📈 TREND ANALYSIS:');
        console.log(`Sleep Trend: ${healthAssessment.trends.sleep.pattern} (confidence: ${healthAssessment.trends.sleep.confidence})`);
        console.log(`Activity Trend: ${healthAssessment.trends.activity.pattern} (confidence: ${healthAssessment.trends.activity.confidence})`);
        console.log(`Consistency Score: ${healthAssessment.trends.consistency.score}/100`);

        // 2. Generate contextual notifications
        console.log('\n🔔 GENERATING CONTEXTUAL NOTIFICATIONS');
        console.log('-'.repeat(50));
        
        const notifications = await advancedNotifications.generateContextualNotifications(healthAssessment);
        
        notifications.forEach((notification, index) => {
            console.log(`\n📱 NOTIFICATION ${index + 1}:`);
            console.log(`Type: ${notification.type}`);
            console.log(`Priority: ${notification.priority.toUpperCase()}`);
            console.log(`Title: ${notification.title}`);
            console.log(`Message: ${notification.message}`);
            console.log(`Actionable: ${notification.actionable}`);
            console.log(`Category: ${notification.category}`);
            console.log(`Time: ${new Date(notification.timestamp).toLocaleTimeString()}`);
        });

        // 3. Generate scheduled notifications
        console.log('\n⏰ SCHEDULED NOTIFICATIONS');
        console.log('-'.repeat(50));
        
        const scheduledNotifications = advancedNotifications.generateScheduledNotifications(healthAssessment);
        
        scheduledNotifications.forEach(schedule => {
            console.log(`\n🕐 ${schedule.timeSlot.toUpperCase()} (${schedule.scheduledHour}:00)`);
            console.log(`Notification Types: ${schedule.notificationTypes.join(', ')}`);
        });

        // 4. Show notification history
        console.log('\n📋 NOTIFICATION HISTORY');
        console.log('-'.repeat(50));
        
        const history = advancedNotifications.getNotificationHistory();
        console.log(`Total notification sessions: ${history.length}`);
        
        if (history.length > 0) {
            const latest = history[history.length - 1];
            console.log(`Latest session: ${new Date(latest.timestamp).toLocaleString()}`);
            console.log(`Notifications sent: ${latest.notifications.length}`);
        }

        // 5. Performance metrics
        console.log('\n⚡ PERFORMANCE METRICS');
        console.log('-'.repeat(50));
        
        const priorityBreakdown = notifications.reduce((acc, notification) => {
            acc[notification.priority] = (acc[notification.priority] || 0) + 1;
            return acc;
        }, {});
        
        console.log('Priority Distribution:');
        Object.entries(priorityBreakdown).forEach(([priority, count]) => {
            console.log(`  ${priority}: ${count} notifications`);
        });

        const categoryBreakdown = notifications.reduce((acc, notification) => {
            acc[notification.category] = (acc[notification.category] || 0) + 1;
            return acc;
        }, {});
        
        console.log('\nCategory Distribution:');
        Object.entries(categoryBreakdown).forEach(([category, count]) => {
            console.log(`  ${category}: ${count} notifications`);
        });

        console.log('\n✅ ADVANCED NOTIFICATION SYSTEM TEST COMPLETE!');
        console.log('🎉 Successfully generated contextual, data-driven health notifications');
        console.log('📊 Real Sahha data integrated with trend analysis');
        console.log('🧠 Personalized coaching and recovery insights provided');

    } catch (error) {
        console.error('❌ Error during advanced notifications test:', error);
        throw error;
    }
}

// Run the test
if (require.main === module) {
    testAdvancedNotifications().catch(console.error);
}

module.exports = testAdvancedNotifications;