"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Users, Calendar, Clock, Check, X, MapPin } from "lucide-react";
import { lookupClassByCode } from "@/lib/teacherService";
import { joinClassByCode } from "@/lib/studentService";
import { useAuth } from "@/hooks/useAuth";

/**
 * Student Join Class Page Component
 * @returns {JSX.Element} The join class interface
 */
export default function StudentJoinPage() {
  const router = useRouter();
  const params = useParams();
  const { user, userData, loading: authLoading } = useAuth();
  
  // Handle URL decoding more robustly
  const [classCode] = useState(() => {
    try {
      // Try to decode the URL parameter, but fallback to original if decoding fails
      const rawCode = params.code || '';
      const decodedCode = decodeURIComponent(rawCode);
      console.log('Raw code from URL:', rawCode);
      console.log('Decoded code:', decodedCode);
      return decodedCode;
    } catch (error) {
      console.error('Error decoding URL parameter:', error);
      return params.code || '';
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [classDetails, setClassDetails] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  useEffect(() => {
    // Fetch class details from the backend API
    const fetchClassDetails = async () => {
      setIsLoading(true);
      console.log('Fetching class details for code:', classCode);
      
      try {
        // Use the backend API to lookup class details
        const result = await lookupClassByCode(classCode);
        
        if (result.success) {
          setClassDetails(result.class);
          console.log('Found class:', result.class);
        } else {
          setJoinError(result.error || 'Class not found. Please check the invitation code.');
          console.error('Failed to find class:', result.error);
        }
      } catch (error) {
        setJoinError('Unable to verify class invitation. Please try again.');
        console.error('Error fetching class details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (classCode) {
      fetchClassDetails();
    } else {
      setJoinError('Invalid invitation code.');
      setIsLoading(false);
    }
  }, [classCode]);

  // Handle joining the class
  const handleJoinClass = async () => {
    if (!user || !user.uid) {
      setJoinError('You must be signed in to join a class.');
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      // Use the backend API to join the class
      const result = await joinClassByCode(user.uid, classCode);
      
      if (result.success) {
        setJoinSuccess(true);
        // Redirect to student dashboard after successful join
        setTimeout(() => {
          router.push('/student/dashboard?joined=true');
        }, 2000);
      } else {
        setJoinError(result.error || 'Failed to join class. Please try again.');
      }
    } catch (error) {
      setJoinError('An error occurred while joining the class.');
      console.error('Join class error:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not signed in
  if (!user) {
    router.push('/auth?redirect=' + encodeURIComponent(window.location.pathname));
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <motion.button
          onClick={handleGoBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </motion.button>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8"
        >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Invitation</h2>
              <p className="text-gray-400">Please wait while we verify your class invitation...</p>
            </div>
          ) : joinError ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h2>
              <p className="text-gray-400 mb-6">{joinError}</p>
              <motion.button
                onClick={handleGoBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Go Back
              </motion.button>
            </div>
          ) : joinSuccess ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="text-green-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Successfully Joined!</h2>
              <p className="text-gray-400 mb-6">You have been enrolled in {classDetails?.className}. Redirecting to your dashboard...</p>
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : classDetails ? (
            <div>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="text-orange-400" size={32} />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Join Class</h1>
                <p className="text-gray-400">You&apos;ve been invited to join this class</p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">{classDetails.className}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="text-orange-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Subject</p>
                      <p className="text-white font-medium">{classDetails.subject}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="text-orange-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Section</p>
                      <p className="text-white font-medium">{classDetails.section}</p>
                    </div>
                  </div>
                  
                  {classDetails.room && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="text-orange-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-400">Room</p>
                        <p className="text-white font-medium">{classDetails.room}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <Users className="text-orange-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Students</p>
                      <p className="text-white font-medium">{classDetails.studentCount} enrolled</p>
                    </div>
                  </div>
                </div>

                {classDetails.description && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <p className="text-sm text-gray-400 mb-2">Description</p>
                    <p className="text-gray-300">{classDetails.description}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <motion.button
                  onClick={handleGoBack}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                  disabled={isJoining}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handleJoinClass}
                  whileHover={{ scale: isJoining ? 1 : 1.05 }}
                  whileTap={{ scale: isJoining ? 1 : 0.95 }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Joining...</span>
                    </div>
                  ) : (
                    'Join Class'
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-gray-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-gray-400 mb-6">Unable to load class information.</p>
              <motion.button
                onClick={handleGoBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Go Back
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
