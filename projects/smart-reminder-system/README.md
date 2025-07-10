# Smart Reminder System - Sahha AI Integration

A context-aware health notification system that provides personalized reminders based on real-time health data from the Sahha AI platform.

## 🌟 Features

- **Sleep Quality Analysis**: Personalized morning routines based on sleep scores
- **Workout Recommendations**: Exercise suggestions based on readiness and recovery
- **Hydration Reminders**: Dynamic water intake goals based on activity levels  
- **Meal Timing Optimization**: Nutrition suggestions around activity patterns
- **Real-time Notifications**: Desktop and mobile notifications
- **Health Dashboard**: Complete daily health summary and trends

## 🚀 Live Demo

**[View Interactive Web Demo](https://fivelidz.github.io/Sahha_things/projects/smart-reminder-system/web-demo/)**

The web demo showcases how the system works with realistic mock data while the Sahha API integration is being finalized.

## 🏃‍♂️ Quick Start

```bash
# Clone the repository
git clone https://github.com/fivelidz/Sahha_things.git
cd Sahha_things/projects/smart-reminder-system

# Install dependencies
npm install

# Run the demo
node src/demo-sleep-notifications.js

# Test API connection (when ready)
npm run test:api
```

## 📊 Sample Output

```
🌅 Running Morning Health Checkup...

🔔 SENDING NOTIFICATION
==================================================
📱 😊 Good Sleep Quality
💬 Sleep Score: 75/100 - Feeling refreshed and ready!

💡 Recommendations:
   😊 Good sleep quality detected
   ⚡ You should feel energized today
==================================================

📊 HEALTH SUMMARY
==================================================
😴 Sleep Quality: 75/100
💪 Readiness Score: 85/100
🏃 Activity Level: 60/100
💧 Hydration Need: 3/5
🏋️ Workout Type: high_intensity
==================================================
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