# Smart Reminder System

A context-aware health notification system powered by Sahha AI that provides personalized health insights and recommendations based on real-time biomarker data.

## 🎯 Overview

The Smart Reminder System analyzes your sleep, activity, and health patterns to deliver timely, contextual notifications that help optimize your daily health decisions. Built with real Sahha API integration, it processes 100+ biomarker data points to generate intelligent health recommendations.

## ✨ Features

### 🔴 **Real Data Integration** ✅
- Live Sahha API connection with 104+ biomarker data points
- Real-time health metrics processing (Sleep: 100/100, Activity: 30/100, Readiness: 65/100)
- Graceful fallback to mock data for demonstrations

### 🛠️ **Focused API Builders** ✅
- Specialized health metric APIs for different use cases
- Morning checkup, workout planning, hydration monitoring
- Optimized data retrieval (4-6 metrics vs 104 data points)

### 🧠 **Advanced Notification System** ✅
- Context-aware health notifications with priority levels
- 7-day trend analysis and pattern recognition
- Personalized coaching with consistency scoring (70/100)
- Scheduled notifications (morning/afternoon/evening)

## 🚀 Live Demos

### 🌐 **Interactive Web Demo**
**[View Live Demo](https://fivelidz.github.io/Sahha_things/projects/smart-reminder-system/web-demo/)**
- Real-time health metrics display
- Interactive notification system
- Data source indicators (real vs mock data)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Git

### Installation
```bash
git clone https://github.com/fivelidz/Sahha_things.git
cd Sahha_things/projects/smart-reminder-system
npm install
```

## 🎮 Demo Instructions

### 1. **Comprehensive System Demo** (Recommended)
```bash
node src/comprehensive-demo.js
```
**Shows:** All three features working together with real data analysis

### 2. **Advanced Notifications Demo**
```bash
node src/test-advanced-notifications.js
```
**Shows:** Intelligent notification system with trend analysis

### 3. **API Builders Demo**
```bash
node api-builders/api-builder-demo.js
```
**Shows:** Focused API generation for different health use cases

### 4. **Web Demo** (Interactive)
```bash
cd web-demo
python3 -m http.server 8000
# Visit: http://localhost:8000
```
**Shows:** Interactive web interface with real-time metrics

## 📊 Sample Output

### Real Health Data Analysis
```
🎯 CURRENT HEALTH METRICS:
Sleep Quality: 100/100
Activity Score: 30/100
Readiness Score: 65/100

📈 TREND ANALYSIS:
Sleep Trend: stable (confidence: 0.5)
Activity Trend: stable (confidence: 0.5)
Consistency Score: 70/100
```

### Generated Notifications
```
🌟 Excellent Sleep Quality!
   Priority: LOW
   Message: 8h sleep with 100/100 quality. Your body is fully recovered.
   Action: Consider maintaining this sleep schedule - it's working perfectly!

🚶 Moderate Exercise Recommended
   Priority: LOW
   Message: Readiness: 65/100. Good energy for steady-state activities.
   Action: Consider: brisk walking, swimming, yoga, cycling
```

### API Builder Output
```
🎯 MORNINGCHECKUP API
URL: https://sandbox-api.sahha.ai/api/v1/profile/biomarker/[profile]
     ?categories=sleep&categories=activity
     &types=sleep_duration&types=steps&types=active_duration
Optimized: 4 metrics (vs 104 full dataset)
```

## 🔧 Technical Implementation

### Architecture
- **Backend**: Node.js with Express
- **Authentication**: OAuth 2.0 profile flow
- **Data Source**: Sahha AI Health Platform
- **Notifications**: node-notifier for desktop alerts
- **Scheduling**: node-cron for automated reminders

### Sahha API Integration
The system uses Sahha's comprehensive health data including:
- Health Scores (Sleep, Activity, Readiness, Mental Wellbeing)
- Digital Biomarkers (Heart rate, steps, sleep stages)
- Real-time sensor data
- Historical trend analysis

### Mock Data System
While API authentication is being finalized, the system includes a sophisticated mock data generator that:
- Simulates realistic health variations
- Provides 7-day historical data
- Generates dynamic recommendations
- Ready to switch to real Sahha data

## 📋 API Requirements

### Required Sahha Data Endpoints
```javascript
// Health Scores
GET /api/v1/profile/score/{profileId}

// Biomarkers  
GET /api/v1/profile/biomarker/{profileId}

// Device Information
GET /api/v1/profile/deviceInformation/{profileId}
```

### Authentication Flow
1. Register profile with Application credentials
2. Obtain profile token via OAuth
3. Use Bearer token for API calls
4. Refresh token as needed

## 🎯 Use Cases

### Morning Routine Optimization
- **Poor Sleep (< 60)**: Gentle wake-up, extra hydration, rest day
- **Good Sleep (> 80)**: Energetic routine, challenging workouts
- **Fair Sleep (60-80)**: Moderate activities, sleep hygiene tips

### Workout Personalization
- **High Readiness (> 80)**: High-intensity training, strength work
- **Medium Readiness (60-80)**: Moderate cardio, yoga, swimming
- **Low Readiness (< 60)**: Light walking, stretching, recovery

### Dynamic Hydration
- **High Activity**: Increased frequency, electrolyte reminders
- **Low Activity**: Baseline maintenance, habit reinforcement
- **Hot Weather**: Extra alerts, cooling strategies

## 📚 Documentation

- **[API Usage Guide](API_USAGE_GUIDE.md)** - Complete API integration documentation
- **[Demo Guide](DEMO_GUIDE.md)** - How to run and customize the demos
- **[Webhook Integration Guide](docs/webhook-integration-guide.md)** - Real-time webhook setup and usage
- **[GitHub Hosting Guide](docs/github-hosting-guide.md)** - Deploy to GitHub Pages

## 📈 Future Enhancements

- [ ] Machine learning for personalized patterns
- [ ] Calendar integration for optimal scheduling
- [ ] Social features (sharing goals with friends)
- [ ] Wearable device integration
- [ ] Advanced analytics and reporting
- [ ] Custom notification preferences

## 🔐 Authentication Status

- ✅ OAuth flow implemented
- ✅ Mock data system ready
- ✅ Notification system working
- 🔄 Sahha API connection (in progress)
- ✅ Email verification completed

See [AUTH_ISSUES_REPORT.md](AUTH_ISSUES_REPORT.md) for detailed authentication analysis.

## 🌐 Web Demo

The project includes a beautiful web demonstration that can be hosted on GitHub Pages or any static hosting service. The web demo features:

- Interactive morning checkup simulation
- Real-time health metrics display
- Animated notifications
- Personalized recommendations
- Technology stack overview
- Installation instructions

## 📁 Project Structure

```
smart-reminder-system/
├── src/
│   ├── sahha-client.js           # Sahha API integration
│   ├── sleep-notification-system.js  # Core notification logic
│   ├── mock-data.js              # Realistic health data simulation
│   ├── demo-sleep-notifications.js   # Demo runner
│   └── test-api.js               # API testing
├── web-demo/
│   ├── index.html                # Web demonstration
│   ├── style.css                 # Styling
│   └── script.js                 # Interactive demo logic
├── AUTH_ISSUES_REPORT.md         # Authentication analysis
├── REQUIREMENTS.md               # Technical specifications
└── package.json                  # Dependencies and scripts
```

## 🤝 Contributing

This project demonstrates the potential of Sahha AI's health data platform. Once API authentication is resolved, the system is ready to switch from mock data to real health insights.

## 📞 Support

For Sahha API authentication support or questions about health data integration, please refer to [Sahha's documentation](https://docs.sahha.ai/) or contact their support team.

## 📄 License

MIT License - Feel free to use this as a foundation for your own health applications!

---

Built with ❤️ using [Sahha AI](https://sahha.ai) • Experience the future of personalized health