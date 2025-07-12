# Smart Reminder System - Webhook Deployment Guide

## 🚀 Quick Deployment

### **Prerequisites**
- Node.js (v16+)
- Vercel account (free)
- Sahha dashboard access for webhook configuration

### **1-Minute Deploy**
```bash
# Clone and navigate
git clone https://github.com/fivelidz/Sahha_things.git
cd Sahha_things/projects/smart-reminder-system/webhook-demo

# Install and deploy
npm install
npm install -g vercel
vercel --prod

# You'll get: https://your-app.vercel.app
```

## 🔧 Sahha Webhook Configuration

### **Webhook Settings**
```
Name: Smart Reminder Real-time Integration
Destination URL: https://your-app.vercel.app/api/sahha-webhook
```

### **Event Selection**
✅ **Health Scores** - Primary data source (readiness, wellness, activity, sleep)  
✅ **Digital Biomarker Logs** - Individual biomarker updates  
❌ **Behavioral Archetypes** - Optional (less frequent updates)  
❌ **Raw Data Logs** - Skip (high volume, unprocessed)

### **Security**
```
Secret: [Generate strong webhook secret in Sahha dashboard]
```

## 📊 Live Data Flow

### **What Your Webhook Receives**
```json
{
  "type": "readiness",
  "score": 0.93,
  "state": "high",
  "factors": [
    {
      "name": "sleep_duration",
      "value": 480,
      "score": 1,
      "state": "high"
    },
    {
      "name": "exercise_strain_capacity", 
      "value": 0.87,
      "score": 0.87,
      "state": "high"
    }
  ]
}
```

### **Generated Notifications**
- **Score 93%** → "🚀 Exceptional Readiness! Perfect day for high-intensity activities."
- **Sleep 8hrs** → "😴 Perfect sleep duration! Your 8 hours support healthy recovery."
- **Exercise 87%** → "💪 Excellent exercise capacity! Ready for challenging workouts."

## 🛠️ Local Development

### **Start Local Server**
```bash
cd webhook-demo
npm install
npm start

# Server runs on: http://localhost:3000
# Webhook endpoint: http://localhost:3000/api/sahha-webhook
```

### **Test with ngrok (Optional)**
```bash
# Terminal 1: Start local server
npm start

# Terminal 2: Expose to internet
npx ngrok http 3000

# Use ngrok URL in Sahha webhook: https://abc123.ngrok.io/api/sahha-webhook
```

## 🔍 Testing & Monitoring

### **Webhook Endpoints**
- **Main App**: `https://your-app.vercel.app`
- **Webhook Receiver**: `https://your-app.vercel.app/api/sahha-webhook`
- **Recent Data**: `https://your-app.vercel.app/api/webhooks`
- **Statistics**: `https://your-app.vercel.app/api/webhook-stats`
- **Health Check**: `https://your-app.vercel.app/health`

### **Monitor Webhook Delivery**
```bash
# Check recent webhooks
curl https://your-app.vercel.app/api/webhooks

# Check statistics
curl https://your-app.vercel.app/api/webhook-stats

# Health check
curl https://your-app.vercel.app/health
```

## 📱 Live Demo Features

### **Real-time Dashboard**
- Live health metrics updated via webhooks
- Readiness score with intelligent recommendations
- Factor analysis (sleep, activity, recovery)
- Webhook feed showing incoming data

### **Smart Notifications**
Based on actual health data:
- **High readiness** → Suggest intense workouts
- **Perfect sleep** → Positive reinforcement
- **Low activity** → Movement encouragement
- **Recovery needed** → Rest recommendations

### **Historical Analysis**
- Webhook data storage and trends
- Score progression over time
- Factor correlation analysis
- Performance pattern identification

## 🔐 Security & Best Practices

### **Environment Variables**
```bash
# .env
WEBHOOK_SECRET=your-sahha-webhook-secret
NODE_ENV=production
```

### **Webhook Verification**
```javascript
// Automatic signature verification
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('base64');

if (signature !== expectedSignature) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### **Rate Limiting & Error Handling**
- Automatic webhook retry (Sahha handles)
- Graceful error handling and logging
- Data validation and sanitization
- Performance monitoring and alerting

## 🚀 Production Optimization

### **Vercel Configuration** (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    { "src": "webhook-handler.js", "use": "@vercel/node" },
    { "src": "index.html", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/sahha-webhook", "dest": "/webhook-handler.js" },
    { "src": "/", "dest": "/index.html" }
  ]
}
```

### **Performance Features**
- Serverless webhook processing
- Automatic scaling with traffic
- Global CDN for static assets  
- Zero-downtime deployments
- Real-time data processing

## 📈 Scaling & Extensions

### **Database Integration**
For production usage, consider adding persistent storage:

```javascript
// Example: PostgreSQL integration
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.post('/api/sahha-webhook', async (req, res) => {
  // Store webhook data
  await pool.query(
    'INSERT INTO webhooks (profile_id, score_type, score_value, factors, timestamp) VALUES ($1, $2, $3, $4, $5)',
    [req.body.profileId, req.body.type, req.body.score, JSON.stringify(req.body.factors), new Date()]
  );
});
```

### **WebSocket Real-time Updates**
Add live updates to connected browsers:

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Broadcast webhook data to all connected clients
function broadcastWebhookData(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
```

### **Advanced Analytics**
- Machine learning for personalized recommendations
- Predictive health scoring based on patterns  
- Integration with calendar and fitness apps
- Multi-user support and team health tracking

## 🎯 Success Metrics

### **Technical KPIs**
- Webhook delivery success rate: >99%
- Processing latency: <100ms
- System uptime: >99.9%
- Error rate: <0.1%

### **User Experience KPIs**
- Notification relevance rating
- Real-time update responsiveness
- Health recommendation accuracy
- Overall system satisfaction

## 📚 Additional Resources

### **Documentation**
- [Complete Webhook System Guide](../WEBHOOK_SYSTEM_GUIDE.md)
- [API Integration Examples](../docs/webhook-integration-guide.md)
- [Smart Reminder Logic Documentation](../API_USAGE_GUIDE.md)

### **Support**
- [GitHub Issues](https://github.com/fivelidz/Sahha_things/issues)
- [Sahha Documentation](https://docs.sahha.ai)
- [Vercel Deployment Docs](https://vercel.com/docs)

---

## 🌟 **Your Smart Reminder System is now live with real-time health data integration! Test it by doing some physical activity and watching the webhook notifications arrive in real-time.**