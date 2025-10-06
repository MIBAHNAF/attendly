# 🚀 Deployment Guide - Attendly NFC Attendance System

## 📋 Pre-Deployment Checklist

- [ ] Firebase project set up with Authentication and Firestore enabled
- [ ] Environment variables configured (see `.env.example`)
- [ ] Google OAuth configured in Firebase Console
- [ ] Code tested locally with `npm run dev`
- [ ] Production build successful with `npm run build`

## 🔧 Environment Setup

### 1. Firebase Configuration
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Google provider
3. Enable Firestore Database
4. Get your configuration keys and add to `.env.local`

### 2. Service Account Setup
1. Go to Project Settings > Service Accounts
2. Generate a new private key (downloads JSON file)
3. Extract the required fields for your environment variables

## 🌐 Deploy to Vercel (Recommended)

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MIBAHNAF/attendly)

### Manual Deployment
1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Ready for deployment: NFC attendance system complete"
   git push origin main
   ```

2. **Configure Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.example`
   - Deploy!

3. **Environment Variables in Vercel**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
   FIREBASE_PROJECT_ID
   FIREBASE_CLIENT_EMAIL
   FIREBASE_PRIVATE_KEY
   ```

## 🏗 Alternative Deployment Options

### Deploy to Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Netlify dashboard

### Deploy to Railway
1. Connect GitHub repository
2. Railway auto-detects Next.js
3. Add environment variables
4. Deploy with automatic CI/CD

### Self-Hosted Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "attendly" -- start
```

## 📱 Post-Deployment Setup

### 1. Configure OAuth Redirect URLs
Add your deployed URL to Firebase Auth settings:
- `https://your-domain.com`
- `https://your-domain.com/teacher/login`
- `https://your-domain.com/student/login`

### 2. Test NFC Functionality
1. Create a test class as teacher
2. Copy NFC check-in link from attendance dashboard
3. Test link on mobile devices
4. Program physical NFC tags with the links

### 3. Security Configuration
- Update Firebase Security Rules
- Configure CORS settings if needed
- Set up monitoring and analytics

## 🏷️ NFC Tag Programming

### For Production Use:
1. **Purchase NFC Tags**: NTAG213/215/216 recommended
2. **Programming Apps**:
   - Android: NFC Tools, TagInfo
   - iPhone: NFC TagInfo, Shortcuts
3. **Write URL Records**: Use the check-in links from teacher dashboard
4. **Placement**: Position tags at classroom entrances or teacher desks

## 📊 Monitoring & Analytics

### Firebase Analytics
- Set up Firebase Analytics for usage tracking
- Monitor attendance patterns and system performance
- Track user engagement and feature adoption

### Error Monitoring
- Configure error logging with services like Sentry
- Set up uptime monitoring with Pingdom or similar
- Monitor API performance and response times

## 🔒 Security Best Practices

### Production Security
- Enable Firestore Security Rules
- Configure proper CORS settings
- Use HTTPS only (automatic with Vercel/Netlify)
- Regular security audits

### Data Privacy
- Implement data retention policies
- Ensure GDPR/privacy compliance
- Secure student data handling
- Regular backup procedures

## 🆘 Troubleshooting

### Common Issues
1. **Build Errors**: Check environment variables are set correctly
2. **Authentication Issues**: Verify Firebase OAuth configuration
3. **NFC Not Working**: Ensure URLs are correctly programmed to tags
4. **Database Errors**: Check Firestore security rules and permissions

### Debug Mode
```bash
# Enable debug logs
NODE_ENV=development npm run dev

# Check build locally
npm run build && npm run start
```

## 📞 Support

- **Documentation**: Check project README and code comments
- **Issues**: Report bugs on GitHub repository
- **Community**: Join project discussions for help and features

---

## 🎉 Your NFC Attendance System is Ready!

The system is now deployed and ready for educational institutions to use. Students can simply tap their phones to NFC tags for instant attendance marking, while teachers get real-time monitoring and management capabilities.

**Key URLs after deployment:**
- **Main App**: `https://your-domain.com`
- **Teacher Dashboard**: `https://your-domain.com/teacher/dashboard`
- **Student Dashboard**: `https://your-domain.com/student/dashboard`
- **NFC Check-in**: `https://your-domain.com/checkin/[classCode]`