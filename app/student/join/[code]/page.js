"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Users, Calendar, Clock, Check, X, MapPin } from "lucide-react";

/**
 * Student Join Class Page Component
 * @returns {JSX.Element} The join class interface
 */
export default function StudentJoinPage() {
  const router = useRouter();
  const params = useParams();
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

  useEffect(() => {
    // Fetch class details from the invitation code
    const fetchClassDetails = async () => {
      setIsLoading(true);
      console.log('Fetching class details for code:', classCode);
      console.log('Raw params.code:', params.code);
      
      try {
        // Get invitation data from localStorage
        const invitationData = JSON.parse(localStorage.getItem('classInvitations') || '{}');
        console.log('All invitation data:', invitationData);
        console.log('Available codes:', Object.keys(invitationData));
        
        // Multiple strategies to find the invitation
        let invitation = null;
        let foundCode = null;
        
        // Strategy 1: Direct match with the decoded code
        invitation = invitationData[classCode];
        if (invitation) {
          foundCode = classCode;
          console.log('Found with direct match:', foundCode);
        }
        
        // Strategy 2: Try the raw encoded version
        if (!invitation && params.code !== classCode) {
          invitation = invitationData[params.code];
          if (invitation) {
            foundCode = params.code;
            console.log('Found with raw encoded code:', foundCode);
          }
        }
        
        // Strategy 3: Try with spaces removed (new sanitized format)
        if (!invitation) {
          const sanitizedCode = classCode.replace(/\s+/g, '').replace(/[^a-zA-Z0-9-]/g, '');
          console.log('Trying sanitized code:', sanitizedCode);
          invitation = invitationData[sanitizedCode];
          if (invitation) {
            foundCode = sanitizedCode;
            console.log('Found with sanitized code:', foundCode);
          }
        }
        
        // Strategy 4: Try to match by class prefix (fuzzy matching)
        if (!invitation) {
          const classPrefix = classCode.split('-')[0].replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
          foundCode = Object.keys(invitationData).find(code => {
            const data = invitationData[code];
            const codePrefix = code.split('-')[0].replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
            return data && data.classData && codePrefix === classPrefix;
          });
          
          if (foundCode) {
            invitation = invitationData[foundCode];
            console.log('Found with fuzzy matching:', foundCode);
          }
        }
        
        // Strategy 5: Try to match by original class code in the data
        if (!invitation) {
          foundCode = Object.keys(invitationData).find(code => {
            const data = invitationData[code];
            if (!data || !data.classData) return false;
            
            const originalCode = data.classData.code;
            return originalCode === classCode.split('-')[0] || 
                   originalCode.replace(/\s+/g, '') === classCode.split('-')[0].replace(/\s+/g, '');
          });
          
          if (foundCode) {
            invitation = invitationData[foundCode];
            console.log('Found by matching original class code:', foundCode);
          }
        }
        
        console.log('Final invitation found:', invitation);
        
        if (!invitation) {
          throw new Error(`Invalid or expired invitation code: ${classCode}`);
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Use the actual class data from the invitation
        const classData = invitation.classData;
        
        // Format the class details for display
        const formattedClassDetails = {
          id: classData.id,
          name: classData.name,
          code: classData.code,
          section: classData.section,
          teacherName: "Dr. Teacher", // TODO: Get from actual teacher data
          teacherEmail: "teacher@university.edu", // TODO: Get from actual teacher data
          schedule: classData.schedule,
          room: classData.room || 'TBD',
          startDate: classData.startDate,
          endDate: classData.endDate,
          maxStudents: classData.maxStudents,
          enrolledStudents: classData.enrolledStudents || 0,
          classType: classData.classType,
          description: `${classData.classType} course for ${classData.name}. Duration: ${classData.duration}.`,
          originalData: classData // Keep original data for joining
        };
        
        console.log('Formatted class details:', formattedClassDetails);
        setClassDetails(formattedClassDetails);
      } catch (error) {
        console.error('Error fetching class details:', error);
        setJoinError(error.message || 'Invalid or expired invitation link');
      } finally {
        setIsLoading(false);
      }
    };

    if (classCode) {
      fetchClassDetails();
    } else {
      setJoinError('No class code provided');
      setIsLoading(false);
    }
  }, [classCode, params.code]);

  const handleJoinClass = async () => {
    setIsJoining(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add class to student's enrolled classes
      const studentClass = {
        id: classDetails.id,
        name: classDetails.name,
        code: classDetails.code,
        section: classDetails.section,
        teacherName: classDetails.teacherName,
        schedule: classDetails.schedule,
        room: classDetails.room,
        attendance: {
          present: 0,
          total: 0,
          percentage: 0
        }
      };
      
      // Get existing enrolled classes
      const existingClasses = JSON.parse(localStorage.getItem('studentClasses') || '[]');
      
      // Check if already enrolled
      const alreadyEnrolled = existingClasses.find(cls => cls.id === classDetails.id);
      if (alreadyEnrolled) {
        setJoinError('You are already enrolled in this class');
        setIsJoining(false);
        return;
      }
      
      // Add new class
      existingClasses.push(studentClass);
      localStorage.setItem('studentClasses', JSON.stringify(existingClasses));
      
      // Update teacher's class enrollment count
      const teacherClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const updatedTeacherClasses = teacherClasses.map(cls => 
        cls.id === classDetails.id 
          ? { ...cls, enrolledStudents: (cls.enrolledStudents || 0) + 1 }
          : cls
      );
      localStorage.setItem('teacherClasses', JSON.stringify(updatedTeacherClasses));
      
      console.log('Successfully joined class:', studentClass);
      
      // Navigate to student dashboard
      router.push('/student/dashboard?joined=true');
    } catch (error) {
      console.error('Error joining class:', error);
      setJoinError('Failed to join class. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleGoBack = () => {
    router.push('/student/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <BookOpen className="text-orange-400" size={24} />
            </motion.div>
          </div>
          <h3 className="text-white text-lg font-medium mb-2">Loading Class Details...</h3>
          <p className="text-gray-400">Please wait while we fetch the class information</p>
        </motion.div>
      </div>
    );
  }

  if (joinError || !classDetails) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-red-500/50 rounded-xl p-8 text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-red-400" size={24} />
          </div>
          <h3 className="text-white text-lg font-medium mb-2">Unable to Load Class</h3>
          <p className="text-gray-400 mb-6">{joinError}</p>
          <motion.button
            onClick={handleGoBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 mx-auto"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <motion.button
              onClick={handleGoBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Join Class</h1>
            <p className="text-gray-400">Review the class details and confirm to join</p>
          </div>

          {/* Class Details Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="text-orange-400" size={32} />
              </div>
              
              <div className="flex-1 space-y-6">
                {/* Class Header */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{classDetails.name}</h2>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-orange-400 font-medium">{classDetails.code}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-300">Section {classDetails.section}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-300">{classDetails.classType}</span>
                  </div>
                </div>

                {/* Class Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Users className="text-orange-400" size={16} />
                      <div>
                        <p className="text-white font-medium">Teacher</p>
                        <p className="text-gray-400 text-sm">{classDetails.teacherName}</p>
                        <p className="text-gray-500 text-xs">{classDetails.teacherEmail}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="text-orange-400" size={16} />
                      <div>
                        <p className="text-white font-medium">Schedule</p>
                        <p className="text-gray-400 text-sm">{classDetails.schedule}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="text-orange-400" size={16} />
                      <div>
                        <p className="text-white font-medium">Location</p>
                        <p className="text-gray-400 text-sm">{classDetails.room}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Users className="text-orange-400" size={16} />
                      <div>
                        <p className="text-white font-medium">Enrollment</p>
                        <p className="text-gray-400 text-sm">
                          {classDetails.enrolledStudents}/{classDetails.maxStudents} students
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {classDetails.description && (
                  <div>
                    <h3 className="text-white font-medium mb-2">Course Description</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{classDetails.description}</p>
                  </div>
                )}

                {/* Duration */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="text-orange-400" size={16} />
                    <div>
                      <p className="text-white font-medium">Course Duration</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(classDetails.startDate).toLocaleDateString()} - {new Date(classDetails.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Join Actions */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium mb-1">Ready to Join?</h3>
                <p className="text-gray-400 text-sm">You&apos;ll be able to track attendance and access class materials.</p>
              </div>
              <div className="flex space-x-3">
                <motion.button
                  onClick={handleGoBack}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleJoinClass}
                  disabled={isJoining}
                  whileHover={{ scale: isJoining ? 1 : 1.05 }}
                  whileTap={{ scale: isJoining ? 1 : 0.95 }}
                  className="flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {isJoining ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      <span>Join Class</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
