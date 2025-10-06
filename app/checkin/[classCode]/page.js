"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Clock, User, AlertTriangle, BookOpen, Loader } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * NFC Check-in Page Component
 * This page is accessed when students tap their device to an NFC tag
 * It automatically marks them present if they're logged in as a student
 */
export default function NFCCheckIn() {
  const params = useParams();
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null); // 'success', 'already_present', 'error', 'not_enrolled'
  const [classInfo, setClassInfo] = useState(null);
  const [loadingClass, setLoadingClass] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const classCode = params.classCode;

  // Load class information
  useEffect(() => {
    const loadClassInfo = async () => {
      if (!classCode) return;
      
      try {
        setLoadingClass(true);
        const response = await fetch(`/api/classes/lookup/${classCode}`);
        const result = await response.json();
        
        if (result.success) {
          setClassInfo(result.class);
        } else {
          setErrorMessage(result.error || 'Class not found');
        }
      } catch (error) {
        console.error('Error loading class:', error);
        setErrorMessage('Failed to load class information');
      } finally {
        setLoadingClass(false);
      }
    };

    loadClassInfo();
  }, [classCode]);

  // Auto check-in when user is authenticated and class is loaded
  useEffect(() => {
    const attemptAutoCheckIn = async () => {
      // Only proceed if we have user, class info, and user is a student
      if (!user || !classInfo || !userData || userData.role !== 'student' || checkingIn || checkInStatus) {
        return;
      }

      // Check if student is enrolled in this class
      if (!classInfo.students?.includes(user.uid)) {
        setCheckInStatus('not_enrolled');
        return;
      }

      try {
        setCheckingIn(true);
        
        const response = await fetch('/api/attendance/checkin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classId: classInfo.id,
            classCode: classCode,
            userId: user.uid,
            method: 'nfc'
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          if (result.alreadyPresent) {
            setCheckInStatus('already_present');
          } else {
            setCheckInStatus('success');
          }
        } else {
          setCheckInStatus('error');
          setErrorMessage(result.error || 'Failed to check in');
        }
      } catch (error) {
        console.error('Check-in error:', error);
        setCheckInStatus('error');
        setErrorMessage('Network error during check-in');
      } finally {
        setCheckingIn(false);
      }
    };

    // Small delay to ensure all data is loaded
    if (!authLoading && !loadingClass) {
      setTimeout(attemptAutoCheckIn, 500);
    }
  }, [user, userData, classInfo, authLoading, loadingClass, checkingIn, checkInStatus, classCode]);

  // Loading state
  if (authLoading || loadingClass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader className="text-blue-400" size={32} />
            </motion.div>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-400">Preparing your check-in</p>
        </motion.div>
      </div>
    );
  }

  // Error state - class not found
  if (errorMessage && !classInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/30 backdrop-blur-sm border border-red-700 rounded-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-red-400" size={32} />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Class Not Found</h2>
          <p className="text-gray-400 mb-6">{errorMessage}</p>
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Go to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="text-blue-400" size={32} />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">Please log in to your student account to mark attendance</p>
          {classInfo && (
            <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
              <p className="text-white text-sm font-medium">{classInfo.className}</p>
              <p className="text-gray-400 text-xs">{classInfo.subject} • Section {classInfo.section}</p>
            </div>
          )}
          <motion.button
            onClick={() => router.push('/student/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Login as Student
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Not a student
  if (userData && userData.role !== 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/30 backdrop-blur-sm border border-orange-700 rounded-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-orange-400" size={32} />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Teacher Account</h2>
          <p className="text-gray-400 mb-6">This check-in link is for students only. You are logged in as a teacher.</p>
          <motion.button
            onClick={() => router.push('/teacher/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Go to Teacher Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Checking in state
  if (checkingIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="text-blue-400" size={32} />
            </motion.div>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">Checking You In...</h2>
          <p className="text-gray-400">Marking your attendance</p>
          {classInfo && (
            <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
              <p className="text-white text-sm font-medium">{classInfo.className}</p>
              <p className="text-gray-400 text-xs">{classInfo.subject} • Section {classInfo.section}</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Check-in complete states
  const renderCheckInResult = () => {
    switch (checkInStatus) {
      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/30 backdrop-blur-sm border border-green-700 rounded-xl p-8 max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="text-green-400" size={32} />
            </motion.div>
            <h2 className="text-white text-xl font-semibold mb-2">Attendance Marked!</h2>
            <p className="text-gray-400 mb-6">You have been marked present for today</p>
            {classInfo && (
              <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
                <p className="text-white text-sm font-medium">{classInfo.className}</p>
                <p className="text-gray-400 text-xs">{classInfo.subject} • Section {classInfo.section}</p>
                <p className="text-green-400 text-xs mt-2">
                  Checked in at {new Date().toLocaleTimeString()}
                </p>
              </div>
            )}
            <motion.button
              onClick={() => router.push('/student/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        );

      case 'already_present':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/30 backdrop-blur-sm border border-blue-700 rounded-xl p-8 max-w-md w-full text-center"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-blue-400" size={32} />
            </div>
            <h2 className="text-white text-xl font-semibold mb-2">Already Present</h2>
            <p className="text-gray-400 mb-6">Your attendance has already been recorded for today</p>
            {classInfo && (
              <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
                <p className="text-white text-sm font-medium">{classInfo.className}</p>
                <p className="text-gray-400 text-xs">{classInfo.subject} • Section {classInfo.section}</p>
              </div>
            )}
            <motion.button
              onClick={() => router.push('/student/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        );

      case 'not_enrolled':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/30 backdrop-blur-sm border border-red-700 rounded-xl p-8 max-w-md w-full text-center"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-400" size={32} />
            </div>
            <h2 className="text-white text-xl font-semibold mb-2">Not Enrolled</h2>
            <p className="text-gray-400 mb-6">You are not enrolled in this class</p>
            {classInfo && (
              <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
                <p className="text-white text-sm font-medium">{classInfo.className}</p>
                <p className="text-gray-400 text-xs">{classInfo.subject} • Section {classInfo.section}</p>
              </div>
            )}
            <motion.button
              onClick={() => router.push('/student/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/30 backdrop-blur-sm border border-red-700 rounded-xl p-8 max-w-md w-full text-center"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-400" size={32} />
            </div>
            <h2 className="text-white text-xl font-semibold mb-2">Check-in Failed</h2>
            <p className="text-gray-400 mb-6">{errorMessage || 'Something went wrong during check-in'}</p>
            <motion.button
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 mr-3"
            >
              Try Again
            </motion.button>
            <motion.button
              onClick={() => router.push('/student/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      {renderCheckInResult()}
    </div>
  );
}