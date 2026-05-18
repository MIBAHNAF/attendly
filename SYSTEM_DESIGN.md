# Attendly System Design

Attendly is a Next.js and Firebase application for NFC-assisted attendance. The system uses programmable NFC tags as physical entry points into a web-based check-in flow. Authentication, class membership, attendance validation, and record storage are handled by the web application and Firestore.

## Design Summary

Attendly separates physical check-in from identity verification. The NFC tag stores a class-specific URL. The student's phone opens the URL, and the application uses the signed-in student account to determine whether attendance should be recorded.

This avoids storing private student credentials on NFC tags and keeps attendance decisions in the server-side API.

```text
NFC tag or direct link
  -> /checkin/[classCode]
  -> authenticated student session
  -> /api/attendance/checkin
  -> Firestore class lookup
  -> enrollment check
  -> duplicate check
  -> attendance record
```

## Architecture

```text
Client Browser
  - Teacher dashboard
  - Student dashboard
  - Check-in page

Next.js App Router
  - Page routes
  - API routes
  - Client and server components

Firebase
  - Authentication
  - Firestore
  - Optional profile image storage through Firestore data URLs

NFC Tags
  - Store class check-in URLs
  - Launch browser check-in flow
```

## Technology Stack

- Next.js 15
- React 19
- JavaScript
- Tailwind CSS
- Framer Motion
- Firebase Authentication
- Firestore
- Firebase Admin SDK
- Vercel

## Main Components

### Teacher Portal

The teacher portal allows teachers to create and manage classes, view enrolled students, copy invitation links, and copy NFC check-in links.

Relevant areas:

```text
app/teacher/dashboard/page.js
app/teacher/add-class/page.js
components/t_dashboard.jsx
lib/teacherService.js
```

### Student Portal

The student portal allows students to join classes, view enrolled classes, and access attendance-related information.

Relevant areas:

```text
app/student/dashboard/page.js
app/student/join/[code]/page.js
components/s_dashboard.jsx
lib/studentService.js
```

### Check-In Flow

The check-in page is opened through an NFC tag or direct link. It loads class data, verifies authentication state, and submits the check-in request.

Relevant areas:

```text
app/checkin/[classCode]/page.js
app/api/attendance/checkin/route.js
```

### Shared Services

Shared service files isolate Firebase and application logic from UI components.

```text
lib/firebase.js
lib/firebase-admin.js
lib/auth.js
lib/userService.js
lib/teacherService.js
lib/studentService.js
lib/profileUtils.js
```

## Data Model

### Users Collection

Stores application user records linked to Firebase Authentication users.

```text
users/{userId}
  email: string
  name: string
  role: "teacher" | "student"
  emailVerified: boolean
  profile fields
  createdAt: timestamp
  updatedAt: timestamp
```

### Classes Collection

Stores teacher-created class data and enrolled student IDs.

```text
classes/{classId}
  teacherId: string
  className: string
  subject: string
  section: string
  room: string
  schedule: object
  classCode: string
  inviteCode: string
  students: string[]
  createdAt: timestamp
  updatedAt: timestamp
```

### Attendance Collection

Stores one attendance record per student, class, and date.

```text
attendance/{studentId_classId_date}
  studentId: string
  classId: string
  teacherId: string
  checkInTime: timestamp
  method: "nfc" | string
  status: "present"
  date: string
  createdAt: timestamp
```

## Route Design

### Page Routes

```text
/                         Home page
/teacher/login            Teacher login
/student/login            Student login
/teacher/dashboard        Teacher dashboard
/teacher/add-class        Class creation
/student/dashboard        Student dashboard
/student/join/[code]      Student class join
/checkin/[classCode]      NFC or direct-link check-in
```

### API Routes

```text
/api/teacher/classes
/api/teacher/classes/[classId]
/api/teacher/classes/[classId]/students
/api/student/classes
/api/student/classes/[classId]
/api/classes/lookup/[code]
/api/attendance/checkin
/api/user/profile/[userId]
/api/user/profiles
/api/user/profile/upload
```

## Check-In Sequence

1. Teacher copies the NFC check-in link for a class.
2. Teacher writes the URL to an NFC tag.
3. Student taps the NFC tag.
4. The phone opens `/checkin/[classCode]`.
5. The check-in page loads class information.
6. The page confirms the student is signed in.
7. The page submits `classCode`, `userId`, and method to `/api/attendance/checkin`.
8. The API route resolves the class by `classCode`.
9. If needed, the API falls back to legacy `inviteCode`.
10. The API verifies that the student is enrolled in the class.
11. The API checks for an existing attendance record for the same student, class, and date.
12. If no record exists, the API writes a new attendance record.
13. The page displays success or duplicate-check-in feedback.

## Duplicate Prevention

Attendance records use a deterministic ID:

```text
studentId_classId_YYYY-MM-DD
```

The API also queries Firestore for an existing record with the same student ID, class ID, and date before writing. This prevents repeated scans from creating multiple attendance records for the same class session.

## Class Code Compatibility

Attendly currently supports multiple class-code field names because the data model evolved during development:

```text
classCode
inviteCode
code
```

New link generation prefers `classCode`. The check-in API searches by `classCode` first and falls back to `inviteCode` for older records.

## Security Model

### Current Protections

- Firebase Authentication for user identity.
- Role-aware student and teacher interfaces.
- Server-side check-in API validates required fields.
- Class lookup occurs server-side.
- Enrollment is checked before attendance is recorded.
- Duplicate attendance is blocked.
- NFC tags store URLs, not private credentials.

### Required Production Hardening

- Review and enforce Firestore security rules.
- Enforce stronger server-side role checks for teacher-only operations.
- Remove debugging console logs from production flows.
- Add rate limiting or abuse protection for check-in endpoints.
- Validate all write operations against the authenticated user, not only client-provided IDs.
- Avoid storing sensitive profile data unless required.

## Reliability Considerations

- NFC tags may fail or be unavailable, so the same check-in URL can be opened directly.
- Class lookup supports legacy field names to avoid breaking older class records.
- Duplicate prevention makes repeated taps safe.
- Firebase and Vercel provide managed infrastructure for the prototype.

## Limitations

- The current NFC model uses URL tags rather than native browser NFC reading.
- Attendance is based on opening the check-in link while authenticated.
- The current prototype does not yet enforce time-window validation for class sessions.
- Reporting and analytics are limited.
- Production security rules require review before deployment in a real institution.

## Future Work

- Add class-session time windows and late/absent logic.
- Add attendance exports and analytics.
- Add automated tests for check-in and class lookup.
- Add stronger server-side authorization checks.
- Add organization-level administration.
- Add configurable NFC tag management tools.
- Improve reporting for teachers and students.

