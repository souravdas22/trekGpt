# TrekGPT 🏔️

> Your intelligent companion for planning, discovering and experiencing trekking adventures.

TrekGPT is a cross-platform trekking application built with React Native that combines trekking discovery, personalized planning, maps, community features and AI-powered assistance into a single mobile experience.

The goal is to make trekking more accessible by helping users discover suitable treks, understand requirements, plan their journey and get contextual assistance along the way.

---

## ✨ Features

### 🏔️ Trek Discovery

- Explore trekking destinations
- Browse popular and recommended treks
- View detailed trek information
- Explore trek difficulty, duration and requirements
- View trekking images and information

### 🤖 AI Trek Assistant

Get AI-powered assistance for trekking-related questions and planning.

The assistant can help users with:

- Trek planning
- Trek-related questions
- Preparation guidance
- Personalized suggestions
- Context-aware trekking assistance

### 🗺️ Maps & Location

- Location-aware trekking experience
- Map integration
- Geolocation support
- Trek location visualization

### 🎒 Trek Planning

Plan your trek around important requirements such as:

- Trek duration
- Difficulty
- Equipment
- Budget
- Preparation

### 👥 Community

A dedicated community experience where trekkers can discover and share trekking-related content.

### 🔐 Authentication

- Email/password authentication
- Google Sign-In
- Firebase Authentication
- Persistent authentication state

### 🖼️ Media

- Trek images
- Image selection
- Image viewing
- Image optimization/compression
- Remote media storage

---

# 🏗️ Application Architecture

```text
                         TrekGPT
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
        Trek Discovery   AI Assistant   Community
             │              │              │
             └──────────────┼──────────────┘
                            │
                            ▼
                    React Native App
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
         Firebase        Gemini AI       Maps
             │
       ┌─────┼─────┐
       ▼     ▼     ▼
      Auth  Firestore Storage
```

---

# 🛠️ Technology Stack

## Mobile

- React Native
- TypeScript
- React Navigation
- React Native Paper
- React Native Reanimated
- React Native Gesture Handler
- React Native Maps

## State Management

- Redux Toolkit
- React Redux
- Redux Persist
- TanStack React Query

## Backend / Cloud

- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- Firebase Admin

## AI

- Google Generative AI / Gemini

## Device & Location

- React Native Geolocation
- React Native Device Info
- React Native Permissions

## Media

- React Native Image Picker
- React Native Fast Image
- React Native Compressor
- React Native Image Viewing

## Developer Experience

- TypeScript
- ESLint
- Prettier
- Jest
- Husky
- Commitlint

---

# 📱 Application Structure

```text
trekGpt/
│
├── android/
├── ios/
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   ├── utils/
│   └── ...
│
├── __tests__/
├── App.tsx
├── package.json
└── README.md
```

---

# 🤖 AI Architecture

TrekGPT integrates Google's Generative AI capabilities to provide an AI-assisted trekking experience.

```text
User
 │
 ▼
TrekGPT AI Assistant
 │
 ▼
Prompt / Context
 │
 ▼
Gemini
 │
 ▼
AI Response
 │
 ▼
Mobile UI
```

The AI layer is designed around trekking-specific use cases rather than functioning as a generic chatbot.

---

# 🔥 Key Engineering Concepts

The project explores several real-world mobile engineering concepts:

- Cross-platform application development
- Cloud-backed mobile architecture
- Authentication
- Persistent application state
- Server-state management
- Real-time/cloud database integration
- Media storage
- Geolocation
- Maps
- AI integration
- API/service abstraction
- Form validation
- Localization
- Performance-oriented list rendering
- Image optimization

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

- Node.js >= 22.11
- React Native development environment
- Android Studio for Android development
- Xcode for iOS development
- Firebase project configuration
- Google Generative AI configuration

---

## Installation

Clone the repository:

```bash
git clone https://github.com/souravdas22/trekGpt.git

cd trekGpt
```

Install dependencies:

```bash
npm install
```

---

## Android

Start Metro:

```bash
npm start
```

Then in another terminal:

```bash
npm run android
```

---

## iOS

Install dependencies:

```bash
bundle install
```

Install CocoaPods:

```bash
bundle exec pod install
```

Run:

```bash
npm run ios
```

---

# 🔐 Environment Configuration

Create the required environment configuration locally.

Never commit:

```text
.env
API keys
Firebase credentials
Google AI credentials
private configuration
```

Use environment variables for sensitive configuration.

---

# 🧪 Testing

Run tests:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

---

# 📸 Screenshots

> Add application screenshots here.

Recommended screenshots:

1. Home
2. Explore
3. Trek Details
4. AI Assistant
5. Community
6. Trek Planning
7. Map experience

---

# 🗺️ Roadmap

- [ ] Improve trek recommendation engine
- [ ] Personalized trek recommendations
- [ ] Advanced AI trekking assistant
- [ ] Trek itinerary generation
- [ ] Gear recommendation system
- [ ] Trek budget planning
- [ ] Offline trek information
- [ ] Enhanced community features
- [ ] Trek progress tracking
- [ ] Push notifications
- [ ] Improved map experience
- [ ] Performance optimization

---

# 🎯 Project Vision

TrekGPT aims to become more than a trekking directory.

The long-term vision is to create a personal trekking companion that helps users move through the entire trekking journey:

```text
Discover
   ↓
Explore
   ↓
Plan
   ↓
Prepare
   ↓
Travel
   ↓
Trek
   ↓
Share
```

AI is used as an assistance layer throughout the experience rather than being the entire product.

---

# 👨‍💻 Author

## Sourav Das

Backend Developer | Node.js | Express.js | MongoDB | PostgreSQL

GitHub:
https://github.com/souravdas22

LinkedIn:
https://www.linkedin.com/in/sourav-das-201596215/

---

## ⭐ Project Status

🚧 **Active Development**

TrekGPT is an ongoing personal project focused on exploring mobile development, cloud services, AI integration and product-oriented application architecture.
