# Attendly - Scalable Attendance Management System

> "Google Classroom meets Modern Attendance Tracking" for Everyone

Attendly is a comprehensive attendance management platform that provides seamless classroom management with modern web technologies, designed to be scalable and deployable for anyone to use.

## 🚀 Features

- **Dual Portal System**: Separate dashboards for teachers and students
- **Google Authentication**: Secure login with Google accounts
- **Real-time Updates**: Live attendance tracking with Firestore
- **Profile Management**: Complete user profiles with Google integration
- **Class Management**: Create, edit, and delete classes with ease
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Scalable Architecture**: Ready for deployment on Vercel with multi-user support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router, React, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Admin SDK
- **Database**: Firestore (NoSQL)
- **Authentication**: Firebase Auth with Google Provider
- **Hosting**: Vercel (recommended)
- **Deployment**: GitHub + Vercel integration

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled
- Google OAuth configured in Firebase
- GitHub account (for deployment)
- Vercel account (for hosting)

## 🔧 Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd attendly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase configuration values (see Firebase Configuration section)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`

## 🔐 Firebase Configuration

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database
4. Enable Authentication with Google provider

### Step 2: Get Client Configuration
1. Go to Project Settings > General
2. Copy the following values to your `.env.local`:
   - API Key → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Project ID → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - Auth Domain → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - Storage Bucket → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - Messaging Sender ID → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - App ID → `NEXT_PUBLIC_FIREBASE_APP_ID`
   - Measurement ID → `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Step 3: Get Admin SDK Configuration
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract these values to your `.env.local`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL` 
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and newlines)

## 🚀 Deployment to Vercel (Recommended)

### Option 1: Deploy from GitHub (Easiest)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the project and click "Deploy"

3. **Add Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add all variables from your `.env.local` file
   - **Important**: Add these for all environments (Development, Preview, Production)
   - Make sure to properly escape the `FIREBASE_PRIVATE_KEY` with quotes

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add environment variables during setup or later**
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add FIREBASE_PRIVATE_KEY
   # ... add all other variables
   ```

## 🔒 Security & Production Setup

### Environment Variables Checklist
- [ ] All `NEXT_PUBLIC_*` variables are set correctly
- [ ] All `FIREBASE_*` admin variables are set correctly  
- [ ] Private key is properly escaped with quotes and newlines
- [ ] Variables are added to all Vercel environments

### Firebase Security Rules
Make sure to configure proper Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Classes can be read by authenticated users
    match /classes/{classId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.teacherId;
    }
  }
}
```

## 📁 Project Structure

```
attendly/
├── app/
│   ├── api/              # API routes (student, teacher, profile)
│   ├── components/       # React components (dashboards, profile)
│   ├── contexts/         # React contexts (auth, user)
│   ├── hooks/           # Custom hooks
│   └── globals.css      # Global styles
├── lib/
│   ├── firebase.js      # Firebase client config
│   ├── firebase-admin.js # Firebase admin config
│   └── utils.js         # Utility functions
├── assets/              # Static assets and icons
├── public/              # Public static files
├── .env.example         # Environment template
├── next.config.mjs      # Next.js configuration
└── README.md           # This file
```

## 🎯 Usage Guide

### For Teachers:
1. Sign in with Google account
2. Create classes with unique class codes
3. Share codes with students
4. Manage student attendance
5. View class analytics

### For Students:
1. Sign in with Google account  
2. Join classes using teacher-provided codes
3. Mark attendance when available
4. View attendance history

## 🔧 Customization

### Theming
- Student interface uses blue color scheme
- Teacher interface uses orange color scheme
- Colors can be customized in Tailwind CSS configuration

### Adding Features
- API routes are in `/app/api/`
- Components are in `/app/components/`
- Database operations use Firebase Admin SDK

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly in development
5. Update documentation if needed
6. Submit a pull request

## 🐛 Troubleshooting

### Common Issues:
1. **Firebase connection errors**: Check environment variables
2. **Authentication issues**: Verify Google OAuth setup
3. **Deployment failures**: Check Vercel environment variables
4. **Database permissions**: Review Firestore security rules

### Debug Steps:
1. Check browser console for client errors
2. Check Vercel function logs for server errors
3. Verify Firebase project permissions
4. Test environment variables locally first

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review environment variable configuration
3. Ensure Firebase project has proper permissions
4. Check Vercel deployment logs for production issues
5. Open an issue on GitHub with detailed error information

## 🌟 Deployment Checklist

Before deploying:
- [ ] All environment variables configured
- [ ] Firebase project properly set up
- [ ] Google OAuth configured
- [ ] Firestore security rules updated
- [ ] Code pushed to GitHub
- [ ] Vercel project connected
- [ ] Environment variables added to Vercel
- [ ] Test deployment successful

---

**Made with ❤️ for seamless attendance management - Deploy anywhere, use everywhere!**
- **Class Management**: Create, manage, and schedule classes
- **Real-time Notifications**: Email alerts for absent students
- **Attendance Analytics**: Comprehensive reporting and analytics
- **Invite System**: Easy class joining via invite links

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Email**: Resend/SendGrid
- **Deployment**: Vercel

## 📁 Project Structure

```
/app
  /auth          # Authentication pages
  /dashboard     # Role-based dashboards
    /teacher     # Teacher portal
    /student     # Student portal
  /nfc           # NFC integration
/lib             # Utility functions
/types           # Type definitions
```

## 🏃‍♂️ Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Development Roadmap

- [x] Project initialization
- [ ] Authentication system
- [ ] Teacher dashboard
- [ ] Student dashboard
- [ ] NFC integration
- [ ] Email notifications
- [ ] Attendance analytics

## 📚 Documentation

For detailed project planning and feature specifications, see [PROJECT_PLAN.md](./PROJECT_PLAN.md).

## 🤝 Contributing

This is a learning project. Feel free to suggest improvements and enhancements.

---

Built with ❤️ using Next.js and modern web technologies.
