# Attendly Project Plan

Attendly is a web-based attendance platform that uses class-specific links and NFC tags to simplify classroom check-in. The system currently supports teacher and student portals, Firebase authentication, class management, student enrollment, NFC/direct-link check-in, and Firestore-backed attendance records.

## Goals

- Provide a simple teacher workflow for creating classes and generating attendance links.
- Provide a student workflow for joining classes and marking attendance.
- Support NFC tags by writing class check-in URLs to programmable tags.
- Store class, enrollment, profile, and attendance data in Firestore.
- Prevent duplicate attendance records for the same student, class, and date.
- Keep the system deployable on Vercel with Firebase-backed services.

## Current Scope

Attendly is a working prototype. It focuses on the core attendance loop:

```text
Teacher creates class -> Student joins class -> Teacher writes NFC link -> Student taps tag -> Attendance is recorded
```

The current implementation uses NFC tags as URL launch points. The tag does not store private credentials. It stores or opens a class-specific check-in URL, and the web application handles authentication, class lookup, enrollment verification, duplicate prevention, and attendance creation.

## Implemented Features

- Next.js application with App Router
- Teacher and student login flows
- Firebase Authentication integration
- Firestore-backed user profile storage
- Teacher class creation and class management
- Student class join flow by class code
- NFC check-in page at `/checkin/[classCode]`
- Attendance API route at `/api/attendance/checkin`
- Class lookup by `classCode` with `inviteCode` fallback
- Invitation link generation
- NFC check-in link generation
- Duplicate daily check-in prevention
- Teacher attendance dashboard
- Student dashboard with enrolled classes
- Profile management and profile image upload

## Core User Flows

### Teacher Flow

1. Teacher signs in.
2. Teacher creates a class.
3. System generates a class code.
4. Teacher shares the join link with students.
5. Teacher copies the NFC check-in link.
6. Teacher writes the check-in link to an NFC tag.
7. Teacher monitors attendance from the dashboard.

### Student Flow

1. Student signs in.
2. Student joins a class using a class code or join link.
3. Student taps the class NFC tag or opens the check-in link.
4. The app verifies enrollment.
5. The app records attendance if the student has not already checked in that day.
6. The student sees success or duplicate-check-in feedback.

## Technical Milestones

### Completed

- Project setup with Next.js, React, Tailwind CSS, and Firebase.
- Firebase authentication and profile data flow.
- Teacher and student dashboards.
- Class creation and enrollment.
- NFC/direct-link check-in flow.
- Firestore attendance records.
- Duplicate attendance protection.
- Deployment-oriented environment configuration.

### In Progress

- Documentation cleanup.
- Link generation consistency across `classCode`, `inviteCode`, and legacy code fields.
- Production deployment hardening.
- Firestore rule review.

### Planned

- Attendance analytics and summaries.
- CSV export or report generation.
- More complete role-based authorization on server routes.
- Better teacher-facing attendance views by date and class.
- Email notifications for absences or class activity.
- Admin or organization-level management.
- Automated tests for check-in and class lookup flows.

## Data Model Summary

### Users

Stores user profile and role information.

```text
users/{userId}
  email
  name
  role
  profile fields
  createdAt
  updatedAt
```

### Classes

Stores teacher-created class records.

```text
classes/{classId}
  teacherId
  className
  subject
  section
  room
  schedule
  classCode
  inviteCode
  students[]
  createdAt
  updatedAt
```

### Attendance

Stores daily check-in records.

```text
attendance/{studentId_classId_date}
  studentId
  classId
  teacherId
  checkInTime
  method
  status
  date
  createdAt
```

## Development Priorities

1. Stabilize Firebase security rules for production use.
2. Remove debugging logs from production-facing helper functions.
3. Add tests for class lookup, check-in, and duplicate prevention.
4. Add attendance reporting by date range.
5. Improve deployment documentation and environment validation.

## Risks and Constraints

- NFC behavior varies by phone, browser, and operating system.
- iOS and Android handle NFC URL tags differently, so the URL-based approach is intentionally simpler than browser-based NFC reading.
- Attendance data is sensitive student information and must be protected.
- Firestore security rules must be reviewed before production deployment.
- NFC tags should only contain public check-in URLs, not secret credentials.

## Success Criteria

- A teacher can create a class and generate an NFC check-in link.
- A student can join a class and check in through the link.
- The system prevents duplicate same-day attendance.
- The teacher dashboard reflects attendance records.
- The project can be deployed with documented Firebase and Vercel configuration.

