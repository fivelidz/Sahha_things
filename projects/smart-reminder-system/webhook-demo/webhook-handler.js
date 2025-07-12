const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Webhook secret from Sahha dashboard
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'J24rxloMnbF+yM5z8lKIJDr/oFgA5P27HrT8m8T5mbE=';

// Store for webhook data (in production, use a database)
let webhookData = [];
let connectedClients = [];

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Webhook endpoint for Sahha
app.post('/api/sahha-webhook', (req, res) => {
    try {
        // Verify webhook signature (optional but recommended)
        const signature = req.headers['x-signature'];
        const externalId = req.headers['x-external-id'];
        const eventType = req.headers['x-event-type'];
        
        console.log('📡 Webhook received:', {
            timestamp: new Date().toISOString(),
            eventType,
            externalId,
            hasSignature: !!signature,
            dataKeys: Object.keys(req.body)
        });

        // Validate webhook signature if present
        if (signature && WEBHOOK_SECRET) {
            const expectedSignature = crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(JSON.stringify(req.body))
                .digest('base64');
                
            if (signature !== expectedSignature) {
                console.warn('⚠️ Invalid webhook signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }

        // Process the webhook data
        const webhookPayload = {
            id: req.body.id || generateId(),
            timestamp: new Date().toISOString(),
            headers: {
                externalId,
                eventType,
                signature: signature ? 'verified' : 'none'
            },
            data: req.body
        };

        // Store webhook data
        webhookData.unshift(webhookPayload);
        
        // Keep only last 50 webhooks
        if (webhookData.length > 50) {
            webhookData = webhookData.slice(0, 50);
        }

        // Process specific webhook types
        if (req.body.name) {
            processArchetypeWebhook(req.body);
        } else if (req.body.type && req.body.score !== undefined) {
            processHealthScoreWebhook(req.body);
        }

        // Broadcast to connected clients (if using WebSockets)
        broadcastWebhookData(webhookPayload);

        // Log webhook for debugging
        console.log('✅ Webhook processed:', {
            name: req.body.name,
            value: req.body.value,
            dataType: req.body.dataType,
            periodicity: req.body.periodicity
        });

        res.status(200).json({ 
            status: 'success',
            message: 'Webhook processed successfully',
            timestamp: webhookPayload.timestamp
        });

    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        res.status(500).json({ 
            error: 'Webhook processing failed',
            message: error.message 
        });
    }
});

// API endpoint to get recent webhook data
app.get('/api/webhooks', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    res.json({
        webhooks: webhookData.slice(0, limit),
        total: webhookData.length,
        lastUpdate: webhookData[0]?.timestamp || null
    });
});

// API endpoint to get webhook statistics
app.get('/api/webhook-stats', (req, res) => {
    const archetypeTypes = {};
    const periodicityCounts = {};
    
    webhookData.forEach(webhook => {
        const data = webhook.data;
        if (data.name) {
            archetypeTypes[data.name] = (archetypeTypes[data.name] || 0) + 1;
        }
        if (data.periodicity) {
            periodicityCounts[data.periodicity] = (periodicityCounts[data.periodicity] || 0) + 1;
        }
    });

    res.json({
        totalWebhooks: webhookData.length,
        archetypeTypes,
        periodicityCounts,
        lastWebhook: webhookData[0]?.timestamp || null
    });
});

// Process health score webhook data  
function processHealthScoreWebhook(data) {
    console.log(`📊 Health Score Update: ${data.type} = ${data.score} (${data.state})`);
    
    const scoreProcessors = {
        'readiness': (scoreData) => {
            return generateReadinessNotification(scoreData);
        },
        'wellness': (scoreData) => {
            return generateWellnessScoreNotification(scoreData);
        },
        'activity': (scoreData) => {
            return generateActivityScoreNotification(scoreData);
        },
        'sleep': (scoreData) => {
            return generateSleepScoreNotification(scoreData);
        }
    };

    const processor = scoreProcessors[data.type];
    if (processor) {
        const notification = processor(data);
        if (notification) {
            console.log('🔔 Generated score notification:', notification);
        }
    }

    // Process individual factors
    if (data.factors && data.factors.length > 0) {
        data.factors.forEach(factor => {
            if (factor.score !== undefined) {
                console.log(`  📈 Factor: ${factor.name} = ${factor.score} (${factor.state || 'unknown'})`);
            }
        });
    }
}

// Process archetype webhook data
function processArchetypeWebhook(data) {
    const archetypeProcessors = {
        'sleep_duration': (value) => {
            console.log(`💤 Sleep Duration Update: ${value}`);
            return generateSleepNotification(value);
        },
        'activity_level': (value) => {
            console.log(`🏃 Activity Level Update: ${value}`);
            return generateActivityNotification(value);
        },
        'overall_wellness': (value) => {
            console.log(`🌟 Wellness Update: ${value}`);
            return generateWellnessNotification(value);
        },
        'mental_wellness': (value) => {
            console.log(`🧠 Mental Wellness Update: ${value}`);
            return generateMentalWellnessNotification(value);
        }
    };

    const processor = archetypeProcessors[data.name];
    if (processor) {
        const notification = processor(data.value);
        if (notification) {
            console.log('🔔 Generated notification:', notification);
        }
    }
}

// Notification generators based on archetype values
function generateSleepNotification(value) {
    const notifications = {
        'short_sleeper': {
            priority: 'high',
            title: '😴 Sleep Duration Alert',
            message: 'Your sleep duration is below optimal. Consider extending bedtime by 30-60 minutes.',
            action: 'Set an earlier bedtime reminder'
        },
        'average_sleeper': {
            priority: 'low',
            title: '😊 Good Sleep Duration',
            message: 'Great job! Your 7-8 hours of sleep are supporting healthy recovery.',
            action: 'Maintain your current sleep schedule'
        },
        'long_sleeper': {
            priority: 'medium',
            title: '🛌 Extended Sleep Detected',
            message: 'You\'re getting plenty of sleep. Monitor for oversleeping patterns.',
            action: 'Consider if you need this much sleep consistently'
        }
    };
    
    return notifications[value];
}

function generateActivityNotification(value) {
    const notifications = {
        'sedentary': {
            priority: 'high',
            title: '🚶 Movement Reminder',
            message: 'Low activity detected. Try a 10-minute walk to boost your energy!',
            action: 'Take a quick walk or do some stretches'
        },
        'lightly_active': {
            priority: 'medium',
            title: '👍 Light Activity Good',
            message: 'Light activity is great! Consider adding more movement throughout the day.',
            action: 'Add a few more walking breaks'
        },
        'moderately_active': {
            priority: 'low',
            title: '💪 Excellent Activity',
            message: 'Excellent activity level! You\'re maintaining healthy movement patterns.',
            action: 'Keep up the great work!'
        },
        'highly_active': {
            priority: 'low',
            title: '🏃 Outstanding Activity',
            message: 'Outstanding activity! Remember to include rest days for recovery.',
            action: 'Schedule recovery time'
        }
    };
    
    return notifications[value];
}

function generateWellnessNotification(value) {
    const notifications = {
        'poor_wellness': {
            priority: 'high',
            title: '⚠️ Wellness Attention Needed',
            message: 'Your wellness score needs attention. Focus on sleep, nutrition, and stress management.',
            action: 'Review your health habits'
        },
        'fair_wellness': {
            priority: 'medium',
            title: '📈 Wellness Improving',
            message: 'Wellness improving! Small consistent changes are making a difference.',
            action: 'Continue your current improvements'
        },
        'good_wellness': {
            priority: 'low',
            title: '✨ Great Wellness Score',
            message: 'Great wellness score! You\'re maintaining healthy habits successfully.',
            action: 'Maintain your current routine'
        },
        'optimal_wellness': {
            priority: 'low',
            title: '🌟 Optimal Wellness',
            message: 'Optimal wellness achieved! You\'re a great example of healthy living.',
            action: 'Share your success with others'
        }
    };
    
    return notifications[value];
}

function generateMentalWellnessNotification(value) {
    const notifications = {
        'poor_mental_wellness': {
            priority: 'high',
            title: '🧠 Mental Health Support',
            message: 'Mental wellness needs attention. Consider stress reduction techniques or professional support.',
            action: 'Practice mindfulness or seek support'
        },
        'fair_mental_wellness': {
            priority: 'medium',
            title: '🧘 Mental Wellness Improving',
            message: 'Mental wellness is improving. Keep focusing on stress management and self-care.',
            action: 'Continue stress management practices'
        },
        'good_mental_wellness': {
            priority: 'low',
            title: '😊 Good Mental Health',
            message: 'Good mental wellness! Your stress management strategies are working.',
            action: 'Maintain your mental health routine'
        },
        'optimal_mental_wellness': {
            priority: 'low',
            title: '🌈 Excellent Mental Health',
            message: 'Excellent mental wellness! You\'re managing stress effectively.',
            action: 'Keep up your mental health practices'
        }
    };
    
    return notifications[value];
}

// Health Score Notification Generators
function generateReadinessNotification(scoreData) {
    const score = scoreData.score;
    const state = scoreData.state;
    
    if (score >= 0.9) {
        return {
            priority: 'low',
            title: '🚀 Exceptional Readiness',
            message: `Outstanding readiness score of ${Math.round(score * 100)}%! Perfect day for high-intensity activities.`,
            action: 'Take advantage of your peak performance state'
        };
    } else if (score >= 0.7) {
        return {
            priority: 'low', 
            title: '💪 Good Readiness',
            message: `Good readiness score of ${Math.round(score * 100)}%. Ready for moderate to high activity.`,
            action: 'Engage in your planned workout'
        };
    } else if (score >= 0.5) {
        return {
            priority: 'medium',
            title: '⚖️ Moderate Readiness', 
            message: `Moderate readiness of ${Math.round(score * 100)}%. Consider lighter activities today.`,
            action: 'Focus on recovery and gentle movement'
        };
    } else {
        return {
            priority: 'high',
            title: '😴 Low Readiness',
            message: `Low readiness score of ${Math.round(score * 100)}%. Your body needs recovery.`,
            action: 'Prioritize rest, sleep, and stress management'
        };
    }
}

function generateWellnessScoreNotification(scoreData) {
    const score = scoreData.score;
    
    if (score >= 0.85) {
        return {
            priority: 'low',
            title: '🌟 Excellent Wellness',
            message: `Exceptional wellness score of ${Math.round(score * 100)}%! You're thriving.`,
            action: 'Maintain your healthy lifestyle habits'
        };
    } else if (score >= 0.7) {
        return {
            priority: 'low',
            title: '✨ Good Wellness',
            message: `Good wellness score of ${Math.round(score * 100)}%. You're on the right track.`,
            action: 'Continue your current health practices'
        };
    } else {
        return {
            priority: 'medium',
            title: '📈 Wellness Opportunity',
            message: `Wellness score of ${Math.round(score * 100)}% indicates room for improvement.`,
            action: 'Review sleep, activity, and stress management'
        };
    }
}

function generateActivityScoreNotification(scoreData) {
    const score = scoreData.score;
    
    if (score >= 0.8) {
        return {
            priority: 'low',
            title: '🏃 Great Activity Level',
            message: `Excellent activity score of ${Math.round(score * 100)}%! Well done.`,
            action: 'Balance activity with adequate recovery'
        };
    } else if (score >= 0.6) {
        return {
            priority: 'medium',
            title: '🚶 Moderate Activity',
            message: `Activity score of ${Math.round(score * 100)}%. Room to increase movement.`,
            action: 'Add more steps or light exercise to your day'
        };
    } else {
        return {
            priority: 'high',
            title: '⚡ Boost Your Activity',
            message: `Low activity score of ${Math.round(score * 100)}%. Time to get moving!`,
            action: 'Start with a 10-minute walk or light exercise'
        };
    }
}

function generateSleepScoreNotification(scoreData) {
    const score = scoreData.score;
    
    if (score >= 0.85) {
        return {
            priority: 'low',
            title: '😴 Perfect Sleep',
            message: `Outstanding sleep score of ${Math.round(score * 100)}%! Excellent recovery.`,
            action: 'Keep up your great sleep routine'
        };
    } else if (score >= 0.7) {
        return {
            priority: 'low',
            title: '🛌 Good Sleep Quality',
            message: `Good sleep score of ${Math.round(score * 100)}%. Well-rested and ready.`,
            action: 'Maintain your current sleep schedule'
        };
    } else {
        return {
            priority: 'high',
            title: '💤 Sleep Needs Attention',
            message: `Sleep score of ${Math.round(score * 100)}% suggests poor sleep quality.`,
            action: 'Focus on sleep hygiene and consistent bedtime'
        };
    }
}

// Broadcast webhook data to connected clients (placeholder for WebSocket implementation)
function broadcastWebhookData(webhookPayload) {
    // In a real implementation, this would use WebSockets to push real-time updates
    // to connected browsers. For now, clients can poll /api/webhooks
    console.log('📤 Broadcasting webhook data to connected clients');
}

// Utility function to generate IDs
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        webhookCount: webhookData.length,
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('💥 Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Smart Reminder Webhook Server running on port ${PORT}`);
    console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/sahha-webhook`);
    console.log(`🌐 Demo UI: http://localhost:${PORT}`);
    console.log(`📊 Webhook data: http://localhost:${PORT}/api/webhooks`);
    console.log(`📈 Statistics: http://localhost:${PORT}/api/webhook-stats`);
});

module.exports = app;