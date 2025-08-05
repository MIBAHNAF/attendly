# Attendly - NFC-Based Attendance Platform
## "Google Classroom + NFC-based Attendance" for the World

### 🔧 1. Project Structure Overview
You'll have two main portals:
- **Student Portal**
- **Teacher Portal**

These will branch from a shared login/registration page and route users based on role.

### 🛠 2. Core Features Breakdown

#### 🔐 Authentication System:
✅ Flexible sign-up for students and teachers.

**Fields:**
- **Students:** Name, Email, Student ID, Password
- **Teachers:** Name, Email, School/Org Name (optional), Password
- **Backend:** Use Supabase Auth or Firebase Auth (for scalability)

#### 🧑‍🏫 Teacher Dashboard:
- Create multiple classes
- Each class has:
  - Class Name
  - Schedule (days/times)
  - Generated Invite Link (e.g., /join/class-id)
  - View list of students enrolled
- **NFC Setup:** Register NFC tag to class (write tag UID + classID to DB)

#### 🎓 Student Dashboard:
- Join class using invite link
- View:
  - List of enrolled classes
  - Class schedule
  - Attendance history

#### 📆 Schedule System:
- Viewable for both teachers & students
- Teachers can edit, students can view only

#### 📲 NFC-Based Attendance:
- NFC tag linked to a class (class_id)
- Students tap → System logs:
  - StudentID, class_id, timestamp
- Backend checks class timing, marks them present
- Absent students (after time ends) get email notification

#### 📊 Attendance Tracker:
- Database table:
```sql
attendance_logs (id, student_id, class_id, date, status)
```
- Teacher can export/download reports
- Auto-calculate Present/Absent %

#### 📧 Email Notification System:
- Use SMTP or an API like SendGrid/Resend
- Triggered after class ends for absent students

### 📁 Folder Structure Proposal
```bash
/app
  /auth
    login.jsx                 # React component with 'use client'
    register.jsx              # React component with 'use client'
  /dashboard
    /teacher
      create-class.jsx         # React component for class creation
      class/[id].jsx          # Dynamic route for class details
      schedule.jsx            # Schedule management component
    /student
      join-class.jsx          # React component to join classes
      my-classes.jsx          # Student's enrolled classes
      attendance-history.jsx  # Attendance tracking view
  /nfc
    tag-reader.jsx           # NFC integration component
/lib
  supabaseClient.js          # Database connection
  email.js                   # Email service (SendGrid or SMTP)
  utils.js                   # Utility functions
/types
  user.js                    # User type definitions (JSDoc)
  class.js                   # Class type definitions (JSDoc)
  attendance.js              # Attendance type definitions (JSDoc)
/components                  # Reusable React components
  /ui                        # UI components (buttons, modals, etc.)
  /forms                     # Form components
/hooks                       # Custom React hooks
/contexts                    # React Context providers
```

### ⚙️ Technologies Recommendation
| Feature | Tool / Framework |
|---------|------------------|
| Frontend Framework | **React 19** with Next.js 15 (App Router) |
| Language | **JavaScript** (ES6+) |
| Styling | Tailwind CSS |
| Animation | Framer Motion (optional) |
| Auth | Supabase / Firebase |
| DB | Supabase PostgreSQL |
| NFC Integration | External app + NFC API |
| Email Notifications | Resend / Nodemailer |
| Deployment | Vercel |

### 🚀 Step-by-Step Roadmap (MVP v1)

#### Week 1: Auth System + Role-based Routing
- [ ] Set up Supabase / Firebase
- [ ] Registration & login for both roles
- [ ] Role-based dashboard routing

#### Week 2: Teacher Dashboard + Class Creation
- [ ] Class creation form
- [ ] Auto-generate invite link
- [ ] Class list & delete/edit support

#### Week 3: Student Dashboard + Join Class
- [ ] Join class via invite
- [ ] See list of enrolled classes
- [ ] Show class schedule

#### Week 4: NFC Integration & Attendance Logging
- [ ] Build simple tag-reader.jsx to interface with external NFC reader
- [ ] Match UID → classID → studentID
- [ ] Store attendance in DB

#### Week 5: Email Notifications + Attendance Summary
- [ ] Send email to absentees
- [ ] Add attendance report for teachers

### 🔄 Long-Term Scaling Ideas
| Scaling Feature | Implementation Suggestion |
|----------------|---------------------------|
| Multi-language Support | i18n / next-intl |
| Org-level Management | Add "Organization" as entity |
| Payment for Premium Features | Stripe integration |
| NFC Web App / Native App | Build mobile wrapper with NFC read/write |
| Auto SMS Integration | Reuse logic from SMS_System |

### 📋 Current Status
- [x] Project plan documented
- [x] Next.js project initialized with **React + JavaScript**
- [x] Folder structure created
- [x] React components & utilities scaffolded
- [x] Authentication context setup
- [ ] Supabase setup
- [ ] Auth system implementation
- [ ] Teacher dashboard
- [ ] Student dashboard
- [ ] NFC integration
- [ ] Email notifications
- [ ] Deployment

---
*Created: August 4, 2025*
*Vision: Building the global standard for NFC-based attendance tracking*
