"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Calendar, BookOpen, HelpCircle, Users, Clock, Settings, LogOut, CheckCircle, XCircle, TrendingUp, Link2, X, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/lib/auth";
import { getStudentClasses, joinClassByCode, leaveClass } from "@/lib/studentService";
import { getInitials, getDisplayName, getProfilePicture } from "@/lib/profileUtils";
import { getUserProfile } from "@/lib/userService";
import ProfileSettings from "./ProfileSettings";

/**
 * Student Dashboard Component
 * @returns {JSX.Element} The student dashboard interface
 */
export default function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading } = useAuth();
  
  // Helper function to get profile picture with priority system
  const getFullProfilePicture = () => {
    // Priority: 1. Custom uploaded picture, 2. Google photo, 3. None (shows initials)
    if (userProfile?.profilePicture && userProfile.profilePicture.trim() !== '') {
      return userProfile.profilePicture;
    }
    if (user?.photoURL && user.photoURL.trim() !== '') {
      return user.photoURL;
    }
    return null;
  };
  
  const [activeTab, setActiveTab] = useState("classes");
  const [userProfile, setUserProfile] = useState(null);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinLink, setJoinLink] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [joiningClass, setJoiningClass] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [classToLeave, setClassToLeave] = useState(null);
  const [leavingClass, setLeavingClass] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Function to load enrolled classes from Firestore
  const loadStudentClasses = async () => {
    if (user && user.uid) {
      setLoadingClasses(true);
      
      // Clear localStorage for fresh start
      localStorage.removeItem('studentClasses');
      
      try {
        const result = await getStudentClasses(user.uid);
        if (result.success) {
          console.log('Student classes loaded:', result.classes);
          setEnrolledClasses(result.classes);
        } else {
          console.error('Failed to load classes:', result.error);
          // Start with empty array for fresh dashboard
          setEnrolledClasses([]);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
        // Start with empty array for fresh dashboard
        setEnrolledClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    }
  };

  // Load enrolled classes when component mounts
  useEffect(() => {
    loadStudentClasses();

    // Check if we just joined a new class
    if (searchParams.get('joined') === 'true') {
      setJoinSuccess('Successfully joined the class!');
      // Reload classes after joining
      setTimeout(() => {
        if (user && user.uid) {
          loadStudentClasses();
        }
      }, 1000);
    }
  }, [user, searchParams]);

  // Load user profile for profile picture
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user && user.uid) {
        try {
          const result = await getUserProfile(user.uid);
          if (result.success) {
            setUserProfile(result.profile);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  const tabs = [
    { id: "classes", label: "My Classes", icon: BookOpen },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "howto", label: "How To", icon: HelpCircle }
  ];

  const handleSignOut = async () => {
    try {
      const result = await signOutUser();
      if (result.success) {
        router.push('/?from=dashboard');
      } else {
        console.error("Sign out failed:", result.error);
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Handle join class button click - opens modal
    // Handle leaving a class with confirmation
  const handleLeaveClass = async () => {
    if (!classToLeave) return;

    setLeavingClass(true);
    try {
      const result = await leaveClass(user.uid, classToLeave.id);
      if (result.success) {
        // Remove class from state immediately
        setEnrolledClasses(prev => prev.filter(c => c.id !== classToLeave.id));
        setShowLeaveModal(false);
        setClassToLeave(null);
        alert('Successfully left the class!');
      } else {
        alert(`Failed to leave class: ${result.error}`);
      }
    } catch (error) {
      console.error('Error leaving class:', error);
      alert('An unexpected error occurred while leaving the class.');
    } finally {
      setLeavingClass(false);
    }
  };

  // Handle cancel leave
  const handleCancelLeave = () => {
    setShowLeaveModal(false);
    setClassToLeave(null);
  };

  // Show leave confirmation modal
  const showLeaveConfirmation = (classData) => {
    setClassToLeave(classData);
    setShowLeaveModal(true);
  };

  // Show class details modal
  const showClassDetailsModal = (classData) => {
    setSelectedClass(classData);
    setShowClassDetails(true);
  };

  // Close class details modal
  const closeClassDetails = () => {
    setShowClassDetails(false);
    setSelectedClass(null);
  };

  const handleJoinClass = async () => {
    setShowJoinModal(true);
    setJoinError(''); // Clear any previous errors
    setJoinSuccess(''); // Clear any previous success messages
  };

  // Handle joining a class via invitation code or link
  const handleJoinSubmit = async () => {
    if (!joinLink.trim()) {
      setJoinError('Please enter a valid invitation code or link');
      return;
    }

    setJoiningClass(true);
    setJoinError('');

    try {
      // Extract invitation code from URL if a full link is provided
      let invitationCode = joinLink.trim();
      
      // If it's a full URL, extract the code from the path
      if (invitationCode.includes('/join/')) {
        try {
          const url = new URL(invitationCode);
          const pathParts = url.pathname.split('/');
          const codeIndex = pathParts.indexOf('join') + 1;
          
          if (codeIndex > 0 && codeIndex < pathParts.length) {
            invitationCode = pathParts[codeIndex];
          }
        } catch (error) {
          // If URL parsing fails, try to extract from the end
          const parts = invitationCode.split('/');
          const lastPart = parts[parts.length - 1];
          if (lastPart && lastPart.trim()) {
            invitationCode = lastPart.trim();
          }
        }
      }

      // Call backend service to join the class
      const result = await joinClassByCode(user.uid, invitationCode);
      
      if (result.success) {
        setJoinSuccess('Successfully joined the class!');
        setShowJoinModal(false);
        setJoinLink('');
        
        // Refresh the enrolled classes list to show the new class
        setTimeout(async () => {
          const updatedClasses = await getStudentClasses(user.uid);
          if (updatedClasses.success) {
            setEnrolledClasses(updatedClasses.classes);
          }
        }, 1000);

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setJoinSuccess('');
        }, 5000);
      } else {
        setJoinError(result.error || 'Failed to join class. Please check the invitation code.');
      }
    } catch (error) {
      setJoinError('An error occurred while joining the class');
      console.error('Join class error:', error);
    } finally {
      setJoiningClass(false);
    }
  };

  const renderClasses = () => (
    <div className="space-y-6">
      {/* Header with Join Class Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">My Classes</h2>
          <p className="text-gray-400">Track your attendance and manage enrolled classes</p>
        </div>
        <motion.button
          onClick={handleJoinClass}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Join Class</span>
        </motion.button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingClasses ? (
          /* Loading State */
          <div className="col-span-full">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Settings className="text-blue-400" size={32} />
                </motion.div>
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Loading Your Classes</h3>
              <p className="text-gray-400">Please wait while we fetch your enrolled classes...</p>
            </div>
          </div>
        ) : enrolledClasses.length === 0 ? (
          /* Empty State */
          <div className="col-span-full">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-blue-400" size={32} />
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">No Classes Joined Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Get started by joining your first class using an invitation link from your teacher.
              </p>
              <motion.button
                onClick={handleJoinClass}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 mx-auto"
              >
                <Plus size={20} />
                <span>Join Your First Class</span>
              </motion.button>
            </div>
          </div>
        ) : (
          enrolledClasses.map((classItem, index) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{classItem.className || classItem.name}</h3>
                  <p className="text-blue-400 text-sm font-medium">{classItem.classCode || classItem.code}</p>
                  <p className="text-gray-400 text-xs mt-1">{classItem.teacherName}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-blue-400" size={20} />
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-300 text-sm">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>{classItem.subject || 'Subject not specified'}</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <Settings size={16} className="mr-2 text-gray-400" />
                  <span>Joined: {classItem.createdAt ? new Date(classItem.createdAt).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700 flex space-x-3">
                <motion.button
                  onClick={() => showClassDetailsModal(classItem)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-white/10 hover:bg-blue-500/20 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  View Details
                </motion.button>
                <motion.button
                  onClick={() => showLeaveConfirmation(classItem)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Leave Class
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const renderSchedule = () => {
    // Create a time grid structure
    const timeSlots = [
      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
    ];
    
    const daysOfWeek = [
      { id: 'monday', label: 'Monday' },
      { id: 'tuesday', label: 'Tuesday' },
      { id: 'wednesday', label: 'Wednesday' },
      { id: 'thursday', label: 'Thursday' },
      { id: 'friday', label: 'Friday' },
      { id: 'saturday', label: 'Saturday' },
      { id: 'sunday', label: 'Sunday' }
    ];

    // Process enrolled classes to fit into the grid
    const scheduleGrid = {};
    daysOfWeek.forEach(day => {
      scheduleGrid[day.id] = {};
      timeSlots.forEach(time => {
        scheduleGrid[day.id][time] = null;
      });
    });

    // Fill the grid with classes
    enrolledClasses.forEach((classItem, index) => {
      if (classItem.schedule && Array.isArray(classItem.schedule)) {
        classItem.schedule.forEach(scheduleItem => {
          const day = scheduleItem.day;
          
          // Convert start time to hour for grid placement
          let gridTime = scheduleItem.startTime;
          if (scheduleItem.startTime) {
            // Convert 24-hour time to 12-hour format for grid
            const [hours, minutes] = scheduleItem.startTime.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            gridTime = `${displayHour}:00 ${ampm}`;
          }
          
          if (scheduleGrid[day] && scheduleGrid[day][gridTime] !== undefined) {
            scheduleGrid[day][gridTime] = {
              ...classItem,
              timeSlot: `${scheduleItem.startTime} - ${scheduleItem.endTime}`
            };
          }
        });
      } else {
        // Fallback: distribute classes across different days and times for demo
        const dayIndex = index % daysOfWeek.length;
        const timeIndex = (index * 2) % timeSlots.length;
        const day = daysOfWeek[dayIndex].id;
        const time = timeSlots[timeIndex];
        scheduleGrid[day][time] = classItem;
      }
    });

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">My Schedule</h2>
          <p className="text-gray-400">View your weekly class schedule and upcoming sessions</p>
        </div>
        
        {enrolledClasses.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="text-center py-20">
              <Calendar className="mx-auto text-blue-400 mb-4" size={48} />
              <h3 className="text-white text-lg font-medium mb-2">No Schedule Yet</h3>
              <p className="text-gray-400">Your schedule will appear here once you join classes</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Schedule Grid */}
              <div className="grid grid-cols-8 gap-1">
                {/* Header Row */}
                <div className="p-3 text-center text-gray-400 text-sm font-medium">Time</div>
                {daysOfWeek.map(day => (
                  <div key={day.id} className="p-3 text-center text-white text-sm font-medium bg-gray-700/50 rounded-lg">
                    {day.label}
                  </div>
                ))}
                
                {/* Time Rows */}
                {timeSlots.map(time => (
                  <React.Fragment key={time}>
                    <div className="p-3 text-center text-gray-400 text-sm font-medium bg-gray-700/30 rounded-lg">
                      {time}
                    </div>
                    {daysOfWeek.map(day => {
                      const classInSlot = scheduleGrid[day.id][time];
                      return (
                        <div key={`${day.id}-${time}`} className="p-2 min-h-[60px] border border-gray-600 rounded-lg">
                          {classInSlot ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2 h-full flex flex-col justify-center"
                            >
                              <h4 className="text-white text-xs font-medium truncate">{classInSlot.className || classInSlot.name}</h4>
                              <p className="text-blue-400 text-xs truncate">{classInSlot.subject || 'Subject TBD'}</p>
                              <p className="text-gray-400 text-xs truncate">{classInSlot.teacherName}</p>
                              {classInSlot.timeSlot && (
                                <p className="text-gray-300 text-xs truncate">{classInSlot.timeSlot}</p>
                              )}
                            </motion.div>
                          ) : (
                            <div className="h-full bg-gray-800/30 rounded-lg border-dashed border border-gray-600"></div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHowTo = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">How To Guide</h2>
        <p className="text-gray-400">Learn how to use Attendly as a student</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: "Joining Your First Class",
            description: "Learn how to join a class using the class code",
            steps: 3
          },
          {
            title: "NFC Check-in Process",
            description: "Understand how to check-in using NFC technology",
            steps: 2
          },
          {
            title: "Tracking Your Attendance",
            description: "Monitor your attendance and view detailed reports",
            steps: 4
          },
          {
            title: "Managing Your Profile",
            description: "Update your profile and notification preferences",
            steps: 3
          }
        ].map((guide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <HelpCircle className="text-blue-400" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-2">{guide.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{guide.description}</p>
                <div className="flex items-center text-blue-400 text-sm">
                  <span>{guide.steps} steps</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
              <p className="text-gray-400 mt-1">
                Welcome back{getDisplayName(user, userData) ? `, ${getDisplayName(user, userData)}` : ''}, track your attendance and manage your classes
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => setShowProfileSettings(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg text-sm font-medium border border-gray-700 transition-colors duration-200"
              >
                <User size={16} />
                <span>Profile</span>
              </motion.button>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </motion.button>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                {getFullProfilePicture() ? (
                  <img 
                    src={getFullProfilePicture()} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className="text-white font-medium"
                  style={{ display: getFullProfilePicture() ? 'none' : 'flex' }}
                >
                  {getInitials(getDisplayName(user, userData, userProfile), 'S')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900/30 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-white hover:border-gray-600"
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "classes" && renderClasses()}
          {activeTab === "schedule" && renderSchedule()}
          {activeTab === "howto" && renderHowTo()}
        </motion.div>
      </div>

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <ProfileSettings
          isOpen={showProfileSettings}
          onClose={() => setShowProfileSettings(false)}
          onProfileUpdate={() => {
            // Refresh user profile data
            if (user?.uid) {
              getUserProfile(user.uid).then((result) => {
                if (result.success) {
                  setUserProfile(result.profile);
                }
              });
              // Also refresh classes to get updated teacher names
              loadStudentClasses();
            }
          }}
          userId={user?.uid}
          user={user}
          userRole="student"
        />
      )}

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Link2 className="text-blue-400" size={20} />
                <h3 className="text-white font-medium">Join Class</h3>
              </div>
              <motion.button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinError('');
                  setJoinLink('');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={joiningClass}
              >
                <X size={20} />
              </motion.button>
            </div>
            
            <div className="space-y-4">
              {/* Error Message */}
              {joinError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <XCircle className="text-red-400" size={16} />
                    <p className="text-red-400 text-sm">{joinError}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white font-medium mb-2">
                  Class Invitation Link or Code
                </label>
                <input
                  type="text"
                  value={joinLink}
                  onChange={(e) => setJoinLink(e.target.value)}
                  placeholder="Paste invitation link or enter class code"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors disabled:opacity-50"
                  disabled={joiningClass}
                />
                <p className="text-gray-400 text-sm mt-2">
                  Get the invitation link or code from your teacher.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinError('');
                    setJoinLink('');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                  disabled={joiningClass}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleJoinSubmit}
                  whileHover={{ scale: joiningClass ? 1 : 1.05 }}
                  whileTap={{ scale: joiningClass ? 1 : 0.95 }}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                  disabled={joiningClass}
                >
                  {joiningClass ? 'Joining...' : 'Join Class'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Leave Class Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <XCircle className="text-red-400" size={20} />
                <h3 className="text-white font-medium">Leave Class</h3>
              </div>
              <motion.button
                onClick={handleCancelLeave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={leavingClass}
              >
                <X size={20} />
              </motion.button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Are you sure you want to leave this class?</h4>
                {classToLeave && (
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300">Class: <span className="text-white font-medium">{classToLeave.className}</span></p>
                    <p className="text-gray-300">Teacher: <span className="text-white font-medium">{classToLeave.teacherName}</span></p>
                    <p className="text-gray-300">Code: <span className="text-blue-400 font-mono">{classToLeave.classCode}</span></p>
                  </div>
                )}
                <p className="text-red-400 text-sm mt-3">
                  ⚠️ This action cannot be undone. You'll need a new invitation to rejoin.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  onClick={handleCancelLeave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                  disabled={leavingClass}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleLeaveClass}
                  whileHover={{ scale: leavingClass ? 1 : 1.05 }}
                  whileTap={{ scale: leavingClass ? 1 : 0.95 }}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                  disabled={leavingClass}
                >
                  {leavingClass ? 'Leaving...' : 'Yes, Leave Class'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Class Details Modal */}
      {showClassDetails && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{selectedClass.className}</h3>
                  <p className="text-blue-400 font-mono text-sm">{selectedClass.classCode}</p>
                </div>
              </div>
              <motion.button
                onClick={closeClassDetails}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <BookOpen size={16} className="mr-2 text-blue-400" />
                  Class Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Subject:</span>
                    <span className="text-white ml-2">{selectedClass.subject || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Section:</span>
                    <span className="text-white ml-2">{selectedClass.section || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Room:</span>
                    <span className="text-white ml-2">{selectedClass.room || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Max Students:</span>
                    <span className="text-white ml-2">{selectedClass.maxStudents || 'Unlimited'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Start Date:</span>
                    <span className="text-white ml-2">{selectedClass.startDate || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">End Date:</span>
                    <span className="text-white ml-2">{selectedClass.endDate || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              {selectedClass.days && selectedClass.days.length > 0 && (
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center">
                    <Calendar size={16} className="mr-2 text-blue-400" />
                    Schedule
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Days:</span>
                      <span className="text-white ml-2 capitalize">{selectedClass.days.join(', ')}</span>
                    </div>
                    {selectedClass.startTime && (
                      <div>
                        <span className="text-gray-400">Time:</span>
                        <span className="text-white ml-2">{selectedClass.startTime} - {selectedClass.endTime || 'End time not specified'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedClass.description && (
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Description</h4>
                  <p className="text-gray-300 text-sm">{selectedClass.description}</p>
                </div>
              )}

              {/* Enrollment Information */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <Users size={16} className="mr-2 text-blue-400" />
                  Enrollment
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Students Enrolled:</span>
                    <span className="text-white ml-2">{selectedClass.students?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">You Joined:</span>
                    <span className="text-white ml-2">{selectedClass.createdAt ? new Date(selectedClass.createdAt).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <motion.button
                onClick={closeClassDetails}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Close
              </motion.button>
              <motion.button
                onClick={() => {
                  closeClassDetails();
                  showLeaveConfirmation(selectedClass);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Leave Class
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Message */}
      {joinSuccess && (
        <div className="fixed bottom-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-400" size={20} />
              <p className="text-green-400 font-medium">{joinSuccess}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
