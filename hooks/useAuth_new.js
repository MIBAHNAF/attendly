"use client";
import { useState, useEffect } from "react";
import { onAuthStateChange, getUserData } from "@/lib/auth";
import { useRouter } from "next/navigation";

/**
 * Custom hook for authentication state management
 * @param {string} requiredRole - Required role for route protection ("teacher" | "student")
 * @param {string} redirectTo - Where to redirect if not authenticated
 * @returns {Object} Authentication state and user data
 */
export function useAuth(requiredRole = null, redirectTo = "/") {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setAuthenticated(true);
        
        // Get additional user data from Firestore
        const result = await getUserData(firebaseUser.uid);
        if (result.success) {
          setUserData(result.data);
          
          // Check role-based access
          if (requiredRole && result.data.role !== requiredRole) {
            console.log(`Access denied. Required: ${requiredRole}, User has: ${result.data.role}`);
            router.push(redirectTo);
          }
        } else {
          console.error("Failed to get user data:", result.error);
        }
      } else {
        setUser(null);
        setUserData(null);
        setAuthenticated(false);
        
        // Redirect if route requires authentication
        if (requiredRole) {
          router.push(redirectTo);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [requiredRole, redirectTo, router]);

  return {
    user,
    userData,
    loading,
    authenticated,
    isTeacher: userData?.role === "teacher",
    isStudent: userData?.role === "student"
  };
}

/**
 * HOC for protecting routes with authentication
 * @param {React.Component} Component - Component to protect
 * @param {string} requiredRole - Required role for access
 * @param {string} redirectTo - Redirect destination if not authenticated
 */
export function withAuth(Component, requiredRole = null, redirectTo = "/") {
  return function AuthenticatedComponent(props) {
    const { loading, authenticated, userData } = useAuth(requiredRole, redirectTo);

    if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      );
    }

    if (!authenticated || (requiredRole && userData?.role !== requiredRole)) {
      return null; // Redirect is handled in useAuth hook
    }

    return <Component {...props} />;
  };
}
