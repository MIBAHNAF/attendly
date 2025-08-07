"use client";
import TeacherDashboard from "@/components/t_dashboard";
import { withAuth } from "@/hooks/useAuth";

/**
 * Teacher Dashboard Page - Protected route for teachers only
 * @returns {JSX.Element} The teacher dashboard page
 */
const TeacherDashboardPage = () => {
  return <TeacherDashboard />;
};

export default withAuth(TeacherDashboardPage, "teacher", "/teacher/login");
