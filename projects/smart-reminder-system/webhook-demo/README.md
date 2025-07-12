# Smart Reminder System - Real-time Webhook Demo

## 🎯 Overview

This is the **real-time webhook version** of the Smart Reminder System, designed to receive live health data from Sahha webhooks and generate intelligent notifications instantly.

**Based on your actual webhook payload:**
```json
{
  "name": "sleep_duration",
  "value": "short_sleeper", 
  "dataType": "ordinal",
  "ordinality": 1,
  "periodicity": "monthly"
}
```

## 🚀 Quick Start

### **Option 1: View Static Demo**
Open `index.html` directly in your browser to see the webhook simulation.

### **Option 2: Run Local Server**
```bash
cd projects/smart-reminder-system/webhook-demo
npm install
npm start
```
Visit: http://localhost:3000

### **Option 3: Deploy to Vercel (Real Webhooks)**
```bash
npm install -g vercel
vercel --prod
```
This gives you a public URL like: `https://smart-reminders-abc123.vercel.app`

## 📡 Webhook Configuration

### **Current Setup (Testing)**
- **Webhook URL**: `https://webhook.site/1e4c1122-0f5f-4227-9e36-1cff5bab5ef7`
- **Secret**: `J24rxloMnbF+yM5z8lKIJDr/oFgA5P27HrT8m8T5mbE=`
- **Events**: Digital Biomarker Logs, Health Scores

### **For Real Deployment**
Update your Sahha webhook configuration to:
- **Webhook URL**: `https://your-project.vercel.app/api/sahha-webhook`
- **Same secret and events**

## 🎨 Features

### **Real-time Updates**
- Live webhook feed showing incoming Sahha data
- Instant notification generation based on archetype changes
- Health metrics dashboard with live updates

### **Smart Notifications**
Based on your webhook data structure:

#### **Sleep Duration Archetype**
- `short_sleeper` → High priority sleep extension reminder
- `average_sleeper` → Positive reinforcement 
- `long_sleeper` → Oversleep monitoring alert

#### **Activity Level Archetype**
- `sedentary` → Movement encouragement
- `lightly_active` → Activity boost suggestions
- `moderately_active` → Positive reinforcement
- `highly_active` → Recovery reminders

#### **Wellness Archetypes**
- `poor_wellness` → Comprehensive health review
- `fair_wellness` → Improvement encouragement
- `good_wellness` → Maintenance support
- `optimal_wellness` → Success celebration

### **Webhook Data Processing**
- Signature verification using your webhook secret
- Archetype value interpretation and scoring
- Historical data storage and trending
- Real-time broadcast to connected clients

## 📊 API Endpoints

### **Webhook Receiver**
```
POST /api/sahha-webhook
```
Receives Sahha webhook data and processes archetype updates.

### **Get Recent Webhooks**
```
GET /api/webhooks?limit=10
```
Returns recent webhook data for the dashboard.

### **Webhook Statistics**
```
GET /api/webhook-stats
```
Provides analytics on received webhook data.

### **Health Check**
```
GET /health
```
Server status and webhook count.

## 🔧 Customization

### **Adding New Archetype Handlers**
Edit `webhook-handler.js`:

```javascript
const archetypeProcessors = {
  'your_new_archetype': (value) => {
    console.log(`New archetype: ${value}`);
    return generateCustomNotification(value);
  }
};
```

### **Notification Templates**
Customize notification messages in the generator functions:

```javascript
function generateCustomNotification(value) {
  return {
    priority: 'medium',
    title: '🎯 Custom Alert',
    message: `Your ${value} needs attention`,
    action: 'Take specific action'
  };
}
```

## 🌐 Deployment Options

### **Vercel (Recommended)**
- Free hosting with automatic HTTPS
- Built-in webhook endpoint scaling
- Zero configuration deployment

### **Netlify Functions**
- Alternative serverless option
- Similar ease of deployment

### **Railway/Render**
- Traditional server hosting
- Good for more complex backend needs

## 🔍 Testing Your Webhooks

### **Webhook.site Testing**
1. Your current setup already sends to webhook.site
2. View real-time webhook data at your URL
3. Copy interesting payloads for testing

### **Local Testing with ngrok**
```bash
# Terminal 1: Start local server
npm start

# Terminal 2: Expose to internet
npx ngrok http 3000

# Use ngrok URL in Sahha webhook config
```

### **Vercel Testing**
```bash
# Deploy to Vercel
vercel --prod

# Update Sahha webhook URL to:
# https://your-project.vercel.app/api/sahha-webhook
```

## 📚 Integration with Static Demo

This webhook demo **complements** your existing static demo:

- **Static Demo** (`web-demo/`): Always works, perfect for presentations
- **Webhook Demo** (`webhook-demo/`): Live data, impressive for real-world testing

Both use the same Smart Reminder logic but different data sources.

## 🎯 Next Steps

1. **Test webhook.site** to see real Sahha data
2. **Deploy to Vercel** for public webhook endpoint  
3. **Update Sahha webhook URL** to point to your Vercel deployment
4. **Monitor real-time notifications** as your health data changes

## 📝 Notes

- Webhook data is stored in memory (use database for production)
- Signature verification is implemented for security
- Real-time updates use polling (WebSocket upgrade available)
- Compatible with your existing Smart Reminder System architecture

**This demo shows the power of real-time health data integration with intelligent notification systems!**