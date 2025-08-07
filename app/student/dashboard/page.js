"use client";
import StudentDashboard from "@/components/s_dashboard";
import { withAuth } from "@/hooks/useAuth";

/**
 * Student Dashboard Page - Protected route for students only
 * @returns {JSX.Element} The student dashboard page
 */
const StudentDashboardPage = () => {
  return <StudentDashboard />;
};

export default withAuth(StudentDashboardPage, "student", "/student/login");
