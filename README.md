# Attendly

Attendly is a web-based attendance platform for classes that use NFC tags or direct check-in links. Teachers create classes, generate join and check-in links, and monitor attendance. Students join classes, check in through a class-specific link, and view their attendance history.

The project is built with Next.js, Firebase Authentication, Firestore, and Vercel-oriented deployment.

## Features

- Teacher and student sign-in flows
- Teacher dashboard for creating and managing classes
- Student dashboard for joining classes and viewing attendance
- Class invitation links
- NFC check-in links for programmable NFC tags
- Attendance records stored in Firestore
- Duplicate check-in prevention for the same student, class, and day
- Firebase-backed profile and class management

## How NFC Check-In Works

Attendly uses NFC tags as entry points into the web application. A teacher generates a class check-in URL, writes that URL to an NFC tag, and places the tag in the classroom. When a student taps the tag, the phone opens the check-in route for that class.

The check-in API verifies the student, resolves the class by `classCode` or legacy `inviteCode`, checks enrollment, prevents duplicate daily attendance records, and writes a new attendance record to Firestore.

```text
NFC tag tap -> Check-in URL -> Authenticated student -> API route -> Firestore attendance record
```

Students can also use the check-in link directly if NFC is not available.

## Tech Stack

- Next.js 15 with App Router
- React 19
- Firebase Authentication
- Firestore
- Firebase Admin SDK
- Tailwind CSS
- Framer Motion
- Vercel deployment

## Requirements

- Node.js 18 or newer
- npm
- Firebase project
- Firestore enabled
- Firebase Authentication enabled
- Google OAuth provider configured in Firebase

## Local Setup

1. Clone the repository.

```bash
git clone https://github.com/MIBAHNAF/attendly.git
cd attendly
```

2. Install dependencies.

```bash
npm install
```

3. Create the local environment file.

```bash
cp .env.example .env.local
```

4. Fill in the Firebase values in `.env.local`.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

5. Start the development server.

```bash
npm run dev
```

6. Open the app.

```text
http://localhost:3000
```

## Firebase Setup

Create a Firebase project and enable:

- Authentication
- Google sign-in provider
- Firestore Database

For server-side API routes, generate a Firebase Admin SDK service account key and copy the following values into `.env.local`:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

When setting `FIREBASE_PRIVATE_KEY`, preserve newline characters using `\n`.

## NFC Tag Setup

1. Create or open a class from the teacher dashboard.
2. Generate the NFC check-in link.
3. Write the link to an NFC tag using an NFC writer app.
4. Place the tag where students should check in.
5. Students tap the tag and complete check-in through the web app.

Recommended tags:

- NTAG213
- NTAG215
- NTAG216

Any NFC tag that supports a URL record can work.

## Main Routes

```text
/                         Home page
/teacher/login            Teacher login
/student/login            Student login
/teacher/dashboard        Teacher dashboard
/student/dashboard        Student dashboard
/student/join/[code]      Student class join flow
/checkin/[classCode]      NFC or direct-link check-in flow
```

## API Routes

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

## Project Structure

```text
attendly/
  app/
    api/                  Next.js API routes
    checkin/              NFC check-in pages
    student/              Student pages
    teacher/              Teacher pages
    globals.css           Global styles
    layout.js             Root layout
    page.js               Home page
  components/             Shared UI and page components
  contexts/               React context providers
  hooks/                  Custom hooks
  lib/                    Firebase and service utilities
  public/                 Static assets
  types/                  Shared type definitions
```

## Deployment

The project is intended to deploy on Vercel.

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add all variables from `.env.example` to the Vercel project settings.
4. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
5. Deploy.

Build command:

```bash
npm run build
```

Start command:

```bash
npm run start
```

## Development Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Security Notes

- Do not commit `.env.local` or service account JSON files.
- Keep Firebase Admin SDK credentials server-side only.
- Review Firestore security rules before production use.
- Treat attendance records as sensitive student data.
- NFC tags should contain class check-in URLs only, not private credentials.
- Production deployments should use HTTPS and authenticated check-in flows.

## Current Scope

Attendly is a working prototype for NFC-assisted classroom attendance. The current system focuses on class creation, enrollment, check-in, and attendance recording. Future work may include attendance analytics, exports, stronger role-based authorization, email notifications, and administrative reporting.

