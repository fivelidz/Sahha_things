# Smart Reminder System - Real-time Webhook Integration

## 🎯 Overview

The Smart Reminder System now features **real-time webhook integration** with Sahha's health data platform, enabling instant notifications based on live health scores and biomarker updates.

## 🏗️ System Architecture

```
Sahha Health Data → Webhook → Vercel Server → Real-time Notifications → User Interface
```

### **Data Flow:**
1. **Sahha** analyzes your health data (sleep, activity, recovery)
2. **Webhook** sends real-time updates to your Vercel endpoint
3. **Smart Reminder Engine** processes the data and generates intelligent notifications
4. **User Interface** displays live health metrics and actionable recommendations

## 📊 Live Webhook Data Structure

### **Health Scores Webhook**
Your webhook receives rich health score data like this:

```json
{
  "profileId": "457f069d-2673-43c3-b7e5-f569dffe2fd2",
  "accountId": "fe7e9200-4a3a-42d0-b11a-f20c01a6b90b", 
  "externalId": "SampleProfile-f106b5e0-4103-41d0-af6e-384f125dbf28",
  "id": "7e61725c-7be0-5fd7-8545-c4bef4f0dbb0",
  "type": "readiness",
  "state": "high", 
  "score": 0.93,
  "factors": [
    {
      "name": "sleep_duration",
      "value": 480,
      "goal": 480,
      "score": 1,
      "state": "high",
      "unit": "minute"
    },
    {
      "name": "sleep_debt", 
      "value": 0.438,
      "goal": 0,
      "score": 0.97,
      "state": "high",
      "unit": "hour"
    },
    {
      "name": "walking_strain_capacity",
      "value": 0.9,
      "goal": 1,
      "score": 0.9,
      "state": "high", 
      "unit": "index"
    },
    {
      "name": "exercise_strain_capacity",
      "value": 0.87,
      "goal": 1,
      "score": 0.87,
      "state": "high",
      "unit": "index"
    }
  ],
  "dataSources": ["sleep", "activity"],
  "scoreDateTime": "2025-07-09T00:00:00+12:00",
  "createdAtUtc": "2025-07-12T03:01:33Z",
  "version": 1
}
```

## 🚨 Intelligent Notification System

### **Readiness Score Notifications**

Based on your live readiness score (0.93 = 93%):

#### **Exceptional Readiness (90%+)**
```
🚀 Exceptional Readiness
Outstanding readiness score of 93%! Perfect day for high-intensity activities.
Action: Take advantage of your peak performance state
```

#### **Good Readiness (70-89%)**
```
💪 Good Readiness  
Good readiness score of 78%. Ready for moderate to high activity.
Action: Engage in your planned workout
```

#### **Moderate Readiness (50-69%)**
```
⚖️ Moderate Readiness
Moderate readiness of 65%. Consider lighter activities today.
Action: Focus on recovery and gentle movement
```

#### **Low Readiness (<50%)**
```
😴 Low Readiness
Low readiness score of 42%. Your body needs recovery.
Action: Prioritize rest, sleep, and stress management
```

### **Factor-Based Insights**

The system analyzes individual factors from your webhook:

#### **Sleep Duration (8 hours = Perfect)**
- **480 minutes** = 8 hours ✅
- **Score: 1.0** = Optimal sleep duration
- **Notification**: "Perfect sleep duration! Your 8 hours support healthy recovery."

#### **Sleep Debt (Minimal)**
- **0.438 hours** = ~26 minutes deficit ✅
- **Score: 0.97** = Excellent sleep consistency  
- **Notification**: "Minimal sleep debt. Great job maintaining consistent sleep!"

#### **Exercise Capacity (87%)**
- **Score: 0.87** = High exercise readiness ✅
- **Notification**: "Excellent exercise capacity! Ready for challenging workouts."

#### **Walking Capacity (90%)**
- **Score: 0.9** = Optimal movement readiness ✅
- **Notification**: "Outstanding walking capacity! Perfect day for active movement."

## 🌐 Live Demo Components

### **1. Static Demo** (`web-demo/`)
- **Purpose**: Always-working demonstration with mock data
- **URL**: [GitHub Pages Live Demo](https://fivelidz.github.io/Sahha_things/projects/smart-reminder-system/web-demo/)
- **Use Case**: Presentations, portfolio showcasing, offline demonstrations

### **2. Real-time Webhook Demo** (`webhook-demo/`)
- **Purpose**: Live webhook integration with real Sahha data
- **URL**: Deployed on Vercel (your custom domain)
- **Use Case**: Real-world testing, live health monitoring, actual usage

## 🔧 Technical Implementation

### **Webhook Endpoint**
```javascript
// POST /api/sahha-webhook
// Receives live health data from Sahha

app.post('/api/sahha-webhook', (req, res) => {
  // Verify webhook signature
  const signature = req.headers['x-signature'];
  
  // Process health score data
  if (req.body.type && req.body.score !== undefined) {
    processHealthScoreWebhook(req.body);
  }
  
  // Generate smart notifications
  const notification = generateReadinessNotification(req.body);
  
  res.status(200).json({ status: 'success' });
});
```

### **Real-time Processing**
```javascript
function processHealthScoreWebhook(data) {
  console.log(`📊 Health Score Update: ${data.type} = ${data.score} (${data.state})`);
  
  // Generate notifications based on score thresholds
  if (data.type === 'readiness') {
    if (data.score >= 0.9) {
      // Exceptional readiness - suggest high-intensity activities
    } else if (data.score >= 0.7) {
      // Good readiness - normal workout recommendations  
    } else {
      // Lower readiness - focus on recovery
    }
  }
  
  // Analyze individual factors
  data.factors?.forEach(factor => {
    console.log(`  📈 ${factor.name}: ${factor.score} (${factor.state})`);
  });
}
```

### **Security Implementation**
```javascript
// Webhook signature verification
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('base64');

if (signature !== expectedSignature) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

## 📈 Live Health Metrics Dashboard

### **Real-time Metrics Display**
- **Readiness Score**: Live updates from webhook (93% → "Exceptional")
- **Sleep Quality**: Based on sleep_duration and sleep_debt factors
- **Activity Capacity**: From walking_strain_capacity and exercise_strain_capacity  
- **Recovery Status**: Derived from overall readiness and individual factors

### **Trend Analysis**
- **7-day readiness trends**: Track performance patterns
- **Factor correlation**: See how sleep affects readiness
- **Optimal timing**: Identify peak performance windows

## 🎯 Use Cases & Applications

### **Morning Health Check**
**Webhook triggers at 7 AM with readiness score:**
- **Score 93%** → "🚀 Perfect day for intense workout!"
- **Score 65%** → "⚖️ Consider yoga or light cardio today"
- **Score 40%** → "😴 Focus on recovery and rest"

### **Workout Planning**
**Real-time exercise capacity monitoring:**
- **Walking capacity 90%** → "Perfect for long walks or hiking"
- **Exercise capacity 87%** → "Ready for strength training"
- **Both high** → "Ideal day for challenging workouts"

### **Recovery Optimization**
**Sleep debt and recovery tracking:**
- **Sleep debt 0.4 hours** → "Minimal deficit, great consistency!"
- **Sleep debt 2+ hours** → "Prioritize sleep extension tonight"
- **Perfect sleep duration** → "Maintain your current schedule"

## 🛠️ Setup Instructions

### **For Developers:**

1. **Clone the repository**
   ```bash
   git clone https://github.com/fivelidz/Sahha_things.git
   cd Sahha_things/projects/smart-reminder-system/webhook-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env file
   WEBHOOK_SECRET=your-sahha-webhook-secret
   PORT=3000
   ```

4. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

5. **Configure Sahha webhook**
   - **Destination URL**: `https://your-app.vercel.app/api/sahha-webhook`
   - **Events**: ✅ Health Scores, ✅ Digital Biomarker Logs
   - **Secret**: Your webhook secret key

### **For End Users:**

1. **Access the live demo**: Visit your deployed Vercel URL
2. **View real-time updates**: Health metrics update automatically via webhooks
3. **Monitor notifications**: Smart recommendations appear based on your actual health data
4. **Track trends**: See how your health metrics change throughout the day

## 📊 API Endpoints

### **Webhook Receiver**
```
POST /api/sahha-webhook
Content-Type: application/json
X-Signature: your-webhook-signature

Receives real-time health data from Sahha
```

### **Recent Webhooks**
```
GET /api/webhooks?limit=10

Returns recent webhook data for dashboard display
```

### **Webhook Statistics**
```
GET /api/webhook-stats

Provides analytics on received webhook data:
- Total webhooks received
- Score type distribution  
- Average scores by type
- Factor performance trends
```

### **Health Check**
```
GET /health

Server status and webhook processing statistics
```

## 🔍 Monitoring & Analytics

### **Real-time Metrics**
- **Webhook success rate**: Monitor delivery reliability
- **Processing time**: Track notification generation speed
- **Score distribution**: Analyze health score patterns
- **Factor correlations**: Understand health relationships

### **Health Insights**
- **Peak performance times**: When readiness scores are highest
- **Recovery patterns**: How sleep affects next-day readiness
- **Activity optimization**: Best times for different exercise types
- **Long-term trends**: Weekly and monthly health progression

## 🚀 Advanced Features

### **Smart Notification Timing**
- **Morning readiness**: 7 AM readiness score notifications
- **Pre-workout alerts**: Exercise capacity updates before planned workouts
- **Sleep optimization**: Evening sleep debt and duration recommendations
- **Recovery monitoring**: Real-time recovery status during rest days

### **Personalized Recommendations**
- **High readiness** → Suggest challenging activities and workouts
- **Moderate readiness** → Recommend balanced activities and recovery
- **Low readiness** → Focus on rest, sleep, and stress management
- **Factor-specific advice** → Target improvements for individual health factors

### **Integration Possibilities**
- **Calendar integration**: Schedule workouts based on readiness predictions
- **Fitness app connectivity**: Share readiness data with training platforms
- **Smart home integration**: Adjust environment based on sleep and recovery needs
- **Wearable device sync**: Correlate webhook data with device measurements

## 📚 Technical Documentation

### **Webhook Data Processing Flow**
```
1. Sahha Health Analysis → Generates health scores and biomarkers
2. Webhook Delivery → POST request to /api/sahha-webhook
3. Signature Verification → Validate request authenticity  
4. Data Processing → Extract scores, factors, and metadata
5. Notification Generation → Create intelligent recommendations
6. Real-time Display → Update dashboard and trigger alerts
7. Historical Storage → Store data for trend analysis
```

### **Error Handling & Reliability**
- **Webhook retry logic**: Sahha automatically retries failed deliveries
- **Graceful degradation**: Falls back to polling if webhooks fail
- **Data validation**: Validates all incoming webhook data
- **Logging & monitoring**: Comprehensive error tracking and alerting

## 🎯 Success Metrics

### **System Performance**
- **Webhook delivery success**: >99% delivery rate
- **Processing latency**: <100ms notification generation
- **Uptime**: >99.9% system availability
- **User engagement**: Daily active usage of real-time features

### **Health Impact**
- **Notification relevance**: User rating of recommendation accuracy
- **Behavior change**: Correlation between notifications and health improvements
- **Predictive accuracy**: How well readiness scores predict actual performance
- **User satisfaction**: Overall system usefulness and reliability

---

## 🌟 **The Smart Reminder System with real-time webhook integration transforms passive health tracking into active, intelligent health optimization through instant, personalized recommendations based on live health data analysis.**