# Sahha Webhook Integration Guide
**Smart Reminder System - Real-time Data Updates**

## 🎯 Overview

Webhooks provide real-time health data updates from Sahha, enabling immediate notification triggers and live health insights without polling the API.

## 🔗 Webhook Configuration

### **1. Setting Up Sahha Webhooks**

```javascript
// Webhook endpoint configuration
const webhookConfig = {
  url: 'https://your-domain.com/api/sahha-webhook',
  events: [
    'biomarker.created',
    'biomarker.updated', 
    'insight.generated',
    'archetype.updated'
  ],
  headers: {
    'Authorization': 'account YOUR_ACCOUNT_TOKEN',
    'Content-Type': 'application/json'
  }
};
```

### **2. Webhook Endpoint Implementation**

```javascript
// Express.js webhook handler
app.post('/api/sahha-webhook', (req, res) => {
  const { event_type, profile_id, data } = req.body;
  
  try {
    switch (event_type) {
      case 'biomarker.created':
        handleNewBiomarker(profile_id, data);
        break;
        
      case 'biomarker.updated':
        handleBiomarkerUpdate(profile_id, data);
        break;
        
      case 'insight.generated':
        handleNewInsight(profile_id, data);
        break;
        
      case 'archetype.updated':
        handleArchetypeChange(profile_id, data);
        break;
        
      default:
        console.log(`Unhandled event: ${event_type}`);
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
```

## 🚨 Real-time Notification Triggers

### **Sleep Quality Alert**
```javascript
function handleNewBiomarker(profileId, data) {
  if (data.type === 'sleep_quality' && data.value < 0.6) {
    sendNotification(profileId, {
      title: '😴 Sleep Quality Alert',
      message: `Your sleep quality dropped to ${Math.round(data.value * 100)}%. Consider adjusting your bedtime routine.`,
      priority: 'high',
      category: 'sleep_optimization'
    });
  }
}
```

### **Activity Milestone**
```javascript
function handleBiomarkerUpdate(profileId, data) {
  if (data.type === 'steps' && data.value >= 10000) {
    sendNotification(profileId, {
      title: '🎉 Daily Step Goal Achieved!',
      message: `Congratulations! You've reached ${data.value} steps today.`,
      priority: 'medium',
      category: 'achievement'
    });
  }
}
```

### **Health Insight Alert**
```javascript
function handleNewInsight(profileId, data) {
  sendNotification(profileId, {
    title: '🧠 New Health Insight',
    message: data.insight_text,
    priority: 'medium',
    category: 'insight',
    actionUrl: `/insights/${data.id}`
  });
}
```

## 📊 Webhook Data Structures

### **Biomarker Webhook Payload**
```json
{
  "event_type": "biomarker.created",
  "timestamp": "2025-07-12T10:30:00Z",
  "profile_id": "user-12345",
  "data": {
    "id": "biomarker-abc123",
    "type": "sleep_duration",
    "value": 480,
    "unit": "minutes",
    "category": "sleep",
    "periodicity": "daily",
    "startDateTime": "2025-07-11T22:00:00Z",
    "endDateTime": "2025-07-12T06:00:00Z"
  }
}
```

### **Archetype Webhook Payload**
```json
{
  "event_type": "archetype.updated",
  "timestamp": "2025-07-12T10:30:00Z",
  "profile_id": "user-12345", 
  "data": {
    "name": "sleep_quality",
    "previous_value": "fair_sleep_quality",
    "new_value": "optimal_sleep_quality",
    "improvement_trend": true,
    "periodicity": "weekly"
  }
}
```

## 🔐 Security Implementation

### **Webhook Signature Verification**
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

app.post('/api/sahha-webhook', (req, res) => {
  const signature = req.headers['x-sahha-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook...
});
```

## 🔄 Retry Logic & Error Handling

### **Exponential Backoff for Failed Webhooks**
```javascript
const retryQueue = [];

function handleFailedWebhook(webhookData, attempt = 1) {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  if (attempt > maxRetries) {
    console.error('Webhook failed after max retries:', webhookData);
    // Store in dead letter queue or alert administrators
    return;
  }
  
  const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
  
  setTimeout(() => {
    try {
      processWebhook(webhookData);
    } catch (error) {
      handleFailedWebhook(webhookData, attempt + 1);
    }
  }, delay);
}
```

## 📱 Integration with Smart Reminder System

### **Enhanced Notification Engine**
```javascript
class WebhookNotificationEngine {
  constructor() {
    this.notificationRules = new Map();
    this.userPreferences = new Map();
  }
  
  addRule(ruleId, condition, action) {
    this.notificationRules.set(ruleId, { condition, action });
  }
  
  processWebhook(webhookData) {
    for (const [ruleId, rule] of this.notificationRules) {
      if (rule.condition(webhookData)) {
        rule.action(webhookData);
      }
    }
  }
}

// Example usage
const engine = new WebhookNotificationEngine();

engine.addRule('sleep_quality_drop', 
  (data) => data.type === 'sleep_quality' && data.value < 0.5,
  (data) => sendUrgentSleepAlert(data.profile_id, data)
);

engine.addRule('step_milestone',
  (data) => data.type === 'steps' && data.value % 5000 === 0,
  (data) => sendMilestoneNotification(data.profile_id, data)
);
```

## 🚀 Deployment Configuration

### **Environment Variables**
```bash
# .env file
SAHHA_WEBHOOK_SECRET=your-webhook-secret-key
WEBHOOK_ENDPOINT_URL=https://your-domain.com/api/sahha-webhook
NOTIFICATION_SERVICE_URL=https://your-notification-service.com
```

### **Docker Configuration**
```dockerfile
# Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/webhook-server.js"]
```

### **nginx Configuration**
```nginx
# nginx.conf
location /api/sahha-webhook {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 📊 Monitoring & Analytics

### **Webhook Performance Tracking**
```javascript
const webhookMetrics = {
  received: 0,
  processed: 0,
  failed: 0,
  averageProcessingTime: 0
};

function trackWebhookPerformance(startTime, success) {
  const processingTime = Date.now() - startTime;
  
  webhookMetrics.received++;
  if (success) {
    webhookMetrics.processed++;
  } else {
    webhookMetrics.failed++;
  }
  
  webhookMetrics.averageProcessingTime = 
    (webhookMetrics.averageProcessingTime + processingTime) / 2;
}
```

## 🧪 Testing Webhooks

### **Local Development with ngrok**
```bash
# Install ngrok
npm install -g ngrok

# Start your local server
node src/webhook-server.js

# Expose local server
ngrok http 3000

# Use ngrok URL in Sahha webhook configuration
# https://abc123.ngrok.io/api/sahha-webhook
```

### **Webhook Testing Script**
```javascript
// test-webhook.js
const axios = require('axios');

async function testWebhook() {
  const testPayload = {
    event_type: 'biomarker.created',
    timestamp: new Date().toISOString(),
    profile_id: 'test-user-123',
    data: {
      type: 'sleep_quality',
      value: 0.45,
      unit: 'percentage'
    }
  };
  
  try {
    const response = await axios.post(
      'http://localhost:3000/api/sahha-webhook',
      testPayload
    );
    console.log('Webhook test success:', response.status);
  } catch (error) {
    console.error('Webhook test failed:', error.message);
  }
}

testWebhook();
```

## 📚 Best Practices

### **1. Idempotency**
- Use unique webhook IDs to prevent duplicate processing
- Store processed webhook IDs in cache/database

### **2. Rate Limiting**
- Implement rate limiting to prevent webhook spam
- Use Redis or in-memory store for tracking requests

### **3. Graceful Degradation**
- Fall back to polling if webhooks fail
- Implement circuit breaker pattern

### **4. Data Validation**
- Validate all incoming webhook data
- Sanitize user input before processing

### **5. Logging & Monitoring**
- Log all webhook events for debugging
- Monitor webhook success/failure rates
- Set up alerts for webhook failures

---

## 🔗 Integration Examples

### **Smart Reminder Integration**
```javascript
// src/webhook-handlers/smart-reminders.js
function handleBiomarkerUpdate(profileId, biomarkerData) {
  const reminderEngine = new SmartReminderEngine(profileId);
  
  // Update user health profile
  reminderEngine.updateHealthProfile(biomarkerData);
  
  // Check for notification triggers
  const notifications = reminderEngine.evaluateNotificationRules(biomarkerData);
  
  // Send notifications
  notifications.forEach(notification => {
    sendNotification(profileId, notification);
  });
}
```

This webhook integration enables real-time health insights and immediate notification triggers, making the Smart Reminder System truly responsive to health data changes.