// Custom React hook for authentication state management
'use client';

import { useState, useEffect, createContext, useContext } from 'react';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {'teacher' | 'student'} role
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User | null} user
 * @property {boolean} isLoading
 * @property {boolean} isAuthenticated
 * @property {(email: string, password: string) => Promise<void>} login
 * @property {(userData: any) => Promise<void>} register
 * @property {() => void} logout
 */

const AuthContext = createContext(/** @type {AuthContextType | null} */ (null));

/**
 * Auth Provider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (localStorage, cookies, etc.)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // TODO: Implement with Supabase/Firebase
      // const { data } = await supabase.auth.getUser();
      // setUser(data.user);
      // setIsAuthenticated(!!data.user);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      // TODO: Implement with Supabase/Firebase
      // const { data } = await supabase.auth.signInWithPassword({ email, password });
      // setUser(data.user);
      // setIsAuthenticated(true);
      console.log('Login attempt:', email);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      // TODO: Implement with Supabase/Firebase
      // const { data } = await supabase.auth.signUp({ ...userData });
      // setUser(data.user);
      // setIsAuthenticated(true);
      console.log('Register attempt:', userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // TODO: Implement with Supabase/Firebase
      // await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use authentication context
 * @returns {AuthContextType}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
