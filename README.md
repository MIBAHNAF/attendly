# Attendly - NFC-Based Attendance Platform

> "Google Classroom + NFC-based Attendance" for the World

Attendly is a comprehensive attendance management platform that combines the ease of classroom management with cutting-edge NFC technology for seamless attendance tracking.

## 🚀 Features

- **Dual Portal System**: Separate dashboards for teachers and students
- **NFC-Based Attendance**: Tap-to-mark attendance using NFC tags
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
