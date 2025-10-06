# Attendly - NFC Attendance System Design

## Table of Contents
- [System Overview](#system-overview)
- [Requirements](#requirements)
- [High-Level Architecture](#high-level-architecture)
- [Current Implementation Status](#current-implementation-status)
- [Database Design](#database-design)
- [API Design](#api-design)
- [Security Considerations](#security-considerations)
- [Scalability & Performance](#scalability--performance)
- [Technology Stack](#technology-stack)
- [Development Phases](#development-phases)

## System Overview

**Attendly** is an NFC-powered attendance tracking system designed to modernize classroom management. The system allows teachers to create classes, manage students, and track attendance through simple NFC tap interactions.

### Key Features
- 📱 NFC-based attendance check-in
- 👨‍🏫 Teacher dashboard for class management
- 👨‍🎓 Student portal for attendance history
- 📊 Real-time attendance reporting
- 🔐 Secure authentication system

## Requirements

### Functional Requirements
1. **User Management**
   - Teacher registration and authentication
   - Student registration and authentication
   - Role-based access control

2. **Class Management**
   - Create, read, update, delete classes
   - Add/remove students from classes
   - Class scheduling

3. **Attendance Tracking**
   - NFC-based check-in system
   - Real-time attendance recording
   - Attendance history and reports

4. **Dashboard & Analytics**
   - Teacher dashboard with class overview
   - Student dashboard with attendance history
   - Attendance analytics and insights

### Non-Functional Requirements
1. **Performance**
   - Page load time < 2 seconds
   - NFC check-in response time < 1 second
   - Support 1000+ concurrent users

2. **Reliability**
   - 99.9% uptime
   - Data backup and recovery
   - Graceful error handling

3. **Security**
   - Encrypted data transmission
   - Secure authentication (Firebase Auth)
   - Input validation and sanitization

4. **Scalability**
   - Horizontal scaling capability
   - Database optimization for large datasets
   - CDN for static assets

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client (Web)  │────│   Load Balancer │────│   Next.js App  │
│                 │    │                 │    │    (Frontend)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NFC Reader    │────│   API Gateway   │────│   API Routes    │
│                 │    │                 │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Firebase Auth │────│   Middleware    │────│   Database      │
│                 │    │                 │    │   (Firebase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Current Implementation Status

### ✅ Phase 1: Frontend Foundation (COMPLETED)
- [x] **Project Setup**
  - Next.js 15 with App Router
  - Tailwind CSS configuration
  - Framer Motion for animations
  - ESLint and development tools

- [x] **Homepage Design**
  - Aurora background with CSS animations
  - Cycling typewriter effect with erase functionality
  - Responsive design with mobile support
  - Navigation buttons (Student/Teacher)

- [x] **Teacher Dashboard**
  - Dark theme with OnePlus orange accents
  - Three main sections: Classes, Schedule, How To
  - Class management interface with sample data
  - Responsive grid layout for class cards

- [x] **Student Dashboard**
  - Blue-themed interface matching student role
  - Class joining functionality with invitation links
  - Responsive design consistent with teacher portal
  - Class overview and management interface

- [x] **Navigation & Routing**
  - Set up App Router structure
  - Teacher dashboard routing (`/teacher/dashboard`)
  - Student dashboard routing (`/student/dashboard`)
  - Component-based architecture

### ✅ Phase 2: Authentication System (COMPLETED)
- [x] **Firebase Setup**
  - Firebase project configuration with environment variables
  - Authentication service setup
  - Firestore database configuration
  - Security rules implementation

- [x] **Auth Components**
  - Teacher login/register forms with role-based routing
  - Student login/register forms with blue theme
  - Password confirmation validation
  - Email verification system (with spam filter handling)
  - Google OAuth integration
  - Error handling with user-friendly messages

- [x] **User Management**
  - Complete teacher registration flow
  - Complete student registration flow
  - Role-based authentication with `useAuth` hook
  - Protected routes with `withAuth` HOC
  - User data storage in Firestore
  - Sign-out functionality

- [x] **Security Features**
  - Password strength validation (6+ characters)
  - Email verification on registration
  - Role-based access control
  - Protected dashboard routes
  - Secure session management

### � Phase 3: Backend & Database (IN PROGRESS)
- [x] **Database Schema Implementation**
  - Users collection with role-based structure
  - User data storage in Firestore
  - Email verification tracking
  - Proper indexing for user queries

- [x] **Class Management Foundation**
  - Local storage implementation for development
  - Class creation and management interface
  - Invitation link generation system
  - Class code sanitization and URL safety

- [ ] **Migration to Firestore**
  - Move class data from localStorage to Firestore
  - Real-time class synchronization
  - Teacher-student relationship management
  - Class enrollment system backend

- [ ] **API Routes Development**
  - RESTful API design
  - CRUD operations for classes
  - Student enrollment endpoints
  - Data validation middleware

### ✅ Phase 4: NFC Integration & Attendance (COMPLETED)
- [x] **NFC Tag Management**
  - NFC check-in link generation system
  - Tag-to-class association via invite codes
  - Unique identifier management
  - Copy NFC link functionality for teachers

- [x] **Web NFC API Integration**
  - Browser-based check-in via URL links
  - Cross-platform compatibility (works on any device)
  - Automatic attendance marking on link access
  - Fallback method for non-NFC devices (direct URL access)

- [x] **Attendance System**
  - Real-time check-in flow via `/checkin/[classCode]`
  - Attendance status tracking (present/absent)
  - Timestamp recording and validation
  - Duplicate check-in prevention (one check-in per day)

- [x] **Attendance Dashboard**
  - Live attendance view for teachers
  - Student list with attendance status
  - NFC link management interface
  - Student profile integration

### 📋 Phase 5: Core Features Enhancement (PLANNED)
- [ ] **Class Management**
  - Add/Edit/Delete classes
  - Student enrollment system
  - Class scheduling

- [ ] **NFC Integration**
  - NFC reader integration
  - Attendance check-in flow
  - Real-time attendance updates

### 📋 Phase 5: Advanced Features (PLANNED)
- [ ] **Analytics & Reporting**
  - Attendance statistics
  - Export functionality
  - Data visualization

- [ ] **Notifications**
  - Email notifications
  - Push notifications
  - Attendance alerts

## Database Design

### Collections Schema (Firestore)

#### Users Collection
```javascript
{
  uid: string,           // Firebase Auth UID
  email: string,
  role: 'teacher' | 'student',
  profile: {
    firstName: string,
    lastName: string,
    avatar?: string,
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Classes Collection
```javascript
{
  id: string,
  teacherId: string,     // Reference to teacher
  name: string,
  code: string,          // Unique class code
  description?: string,
  schedule: {
    days: string[],      // ['monday', 'wednesday', 'friday']
    time: string,        // '09:00'
    duration: number,    // in minutes
  },
  room: string,
  students: string[],    // Array of student UIDs
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Attendance Collection
```javascript
{
  id: string,
  classId: string,
  studentId: string,
  teacherId: string,
  checkInTime: timestamp,
  nfcId?: string,        // NFC tag identifier
  status: 'present' | 'late' | 'absent',
  date: string,          // YYYY-MM-DD format
  createdAt: timestamp
}
```

## API Design

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Class Management Endpoints
- `GET /api/classes` - Get user's classes
- `POST /api/classes` - Create new class
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `POST /api/classes/:id/students` - Add student to class

### Attendance Endpoints
- `POST /api/attendance/checkin` - NFC check-in
- `GET /api/attendance/class/:classId` - Get class attendance
- `GET /api/attendance/student/:studentId` - Get student attendance history
- `GET /api/attendance/reports` - Generate attendance reports

## Security Considerations

### Authentication & Authorization
- Firebase Authentication for secure user management
- JWT tokens for API authentication
- Role-based access control (RBAC)
- Protected routes middleware

### Data Security
- HTTPS encryption for all communications
- Input validation and sanitization
- SQL injection prevention (NoSQL injection for Firestore)
- XSS protection with Content Security Policy

### NFC Security
- Encrypted NFC communication
- Unique NFC tag identifiers
- Time-based attendance validation
- Anti-replay attack measures

## Scalability & Performance

### Frontend Optimization
- Next.js SSR for faster initial load
- Code splitting and lazy loading
- Image optimization
- CDN for static assets

### Backend Optimization
- Database indexing for common queries
- Caching with Redis (future)
- Connection pooling
- Horizontal scaling with load balancers

### Database Optimization
- Firestore compound indexes
- Pagination for large datasets
- Data denormalization where appropriate
- Real-time listeners optimization

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: JavaScript (ES6+) with JSDoc

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **File Storage**: Firebase Storage

### DevOps & Tools
- **Version Control**: Git + GitHub
- **Deployment**: Vercel (planned)
- **Monitoring**: Firebase Analytics (planned)
- **Testing**: Jest + React Testing Library (planned)

## Development Phases

### Current Phase: Authentication System ✅
**Status**: COMPLETED
**Duration**: Week 2
**Deliverables**:
- Firebase Authentication integration
- Teacher and Student login/register systems
- Role-based access control with protected routes
- Email verification system
- User data management in Firestore
- Password confirmation validation
- Google OAuth integration

### Next Phase: Backend & Database Migration 🚧
**Status**: STARTING
**Duration**: Week 3
**Deliverables**:
- Migrate class management from localStorage to Firestore
- Implement real-time class synchronization
- Create student enrollment system
- Develop RESTful API routes

### Upcoming Phases:
1. **Backend & Database Migration** (Week 3)
   - Move from localStorage to Firestore
   - Real-time data synchronization
   - Student enrollment backend

2. **NFC Integration & Experimentation** (Week 3-4) ⚡ ACCELERATED
   - NFC tag experimentation and testing
   - Web NFC API integration
   - Attendance check-in flow development
   - Real-time attendance updates

3. **Core Features & Attendance System** (Week 4-5)
   - Complete class management system
   - Advanced NFC attendance tracking
   - Attendance history and reporting

4. **Advanced Features** (Week 6)
   - Analytics and reporting system
   - Email notifications
   - Export functionality

5. **Testing & Optimization** (Week 7)
   - Comprehensive testing suite
   - Performance optimization
   - Security audit

6. **Deployment & Monitoring** (Week 8)
   - Production deployment
   - Monitoring and analytics setup
   - Documentation completion

---

## Progress Tracking

### Week 1 Achievements ✅
- [x] Project initialization and setup
- [x] Homepage with cycling typewriter effects
- [x] Teacher dashboard with dark theme
- [x] Responsive design implementation
- [x] Git repository setup and documentation

### Week 2 Achievements ✅
- [x] Firebase project configuration and setup
- [x] Complete authentication system (teacher + student)
- [x] Role-based access control with protected routes
- [x] Email verification system implementation
- [x] Password confirmation validation
- [x] Google OAuth integration
- [x] User data management in Firestore
- [x] Class management UI with invitation links
- [x] Code cleanup and optimization
- [x] Console.log cleanup and production readiness

### Week 3 Achievements ✅ 
- [x] **NFC Integration System Complete**
  - NFC check-in page (`/checkin/[classCode]`) with automatic attendance marking
  - Attendance API endpoint for real-time check-in processing
  - Teacher attendance dashboard with student list and NFC link management
  - Student profile integration for proper name display

- [x] **Core NFC Features**
  - Copy NFC check-in link functionality
  - Automatic attendance marking when students access NFC links
  - Duplicate check-in prevention (one attendance per day)
  - Cross-device compatibility (works on any smartphone)

- [x] **Attendance Management**
  - Real-time attendance tracking dashboard
  - Student enrollment verification
  - Check-in timestamp recording
  - Attendance status display (Present/Absent)

### Week 3 Opportunities 🚀
- **NFC Tags Available**: Physical NFC tags delivered for testing
- **Web NFC API**: Modern browsers support NFC reading
- **Real-world Testing**: Can test actual tap-to-attend functionality
- **Early Prototype**: Opportunity to create working attendance demo

---

*This document will be updated as the project progresses. Each phase completion will be marked and new phases will be detailed.*
