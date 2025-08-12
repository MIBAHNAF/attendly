"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Calendar, BookOpen, HelpCircle, Users, Clock, Settings, LogOut, Link2, Copy, CheckCircle, Edit3, Trash2, X, UserMinus, AlertTriangle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/lib/auth";
import { getTeacherClasses, generateInvitationLink, copyInvitationLink, updateClass, deleteClass, removeStudentFromClass } from "@/lib/teacherService";
import { getUserProfiles, getUserProfile } from "@/lib/userService";
import { getInitials, getDisplayName, getProfilePicture } from "@/lib/profileUtils";
import ProfileSettings from "@/components/ProfileSettings";

/**
 * Teacher Dashboard Component
 * @returns {JSX.Element} The teacher dashboard interface
 */
export default function TeacherDashboard() {
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
  const [classes, setClasses] = useState([]);
  const [copiedLink, setCopiedLink] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(false);
  
  // Class management states
  const [showManageModal, setShowManageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deletingClass, setDeletingClass] = useState(false);
  const [updatingClass, setUpdatingClass] = useState(false);
  
  // Profile settings state
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [studentProfiles, setStudentProfiles] = useState({});

  // Load teacher's classes from Firestore when component mounts
  useEffect(() => {
    const loadTeacherClasses = async () => {
      if (user && user.uid) {
        setLoadingClasses(true);
        
        // Clear localStorage for fresh start
        localStorage.removeItem('teacherClasses');
        
        try {
          const result = await getTeacherClasses(user.uid);
          if (result.success) {
            setClasses(result.classes);
          } else {
            console.error('Failed to load classes:', result.error);
            // Start with empty array for fresh dashboard
            setClasses([]);
          }
        } catch (error) {
          console.error('Error loading classes:', error);
          // Start with empty array for fresh dashboard
          setClasses([]);
        } finally {
          setLoadingClasses(false);
        }
      }
    };

    loadTeacherClasses();

    // Check if we just added a new class and refresh the list
    if (searchParams.get('newClass') === 'true') {
      // Reload classes after adding a new one
      setTimeout(() => {
        if (user && user.uid) {
          loadTeacherClasses();
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
    { id: "classes", label: "Classes", icon: BookOpen },
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

  // Handle navigation to add class page
  const handleAddClass = () => {
    router.push('/teacher/add-class');
  };

  // Handle copying invitation link to clipboard
  const handleCopyInvitationLink = async (classItem) => {
    try {
      const success = await copyInvitationLink(classItem);
      if (success) {
        setCopiedLink(classItem.id);
        setTimeout(() => setCopiedLink(''), 2000);
      } else {
        console.error('Failed to copy invitation link');
      }
    } catch (error) {
      console.error('Error copying invitation link:', error);
    }
  };

  // Class management functions
  const handleManageClass = (classItem) => {
    setSelectedClass(classItem);
    setShowManageModal(true);
  };

  const handleEditClass = () => {
    setEditFormData({
      className: selectedClass.className,
      subject: selectedClass.subject,
      section: selectedClass.section,
      room: selectedClass.room || '',
      description: selectedClass.description || '',
      maxStudents: selectedClass.maxStudents || 30,
      startDate: selectedClass.startDate || '',
      endDate: selectedClass.endDate || '',
      startTime: selectedClass.startTime || '',
      endTime: selectedClass.endTime || ''
    });
    setShowManageModal(false);
    setShowEditModal(true);
  };

  const handleShowStudents = async () => {
    setShowManageModal(false);
    
    // Load student profiles if we have students
    if (selectedClass.students && selectedClass.students.length > 0) {
      try {
        const result = await getUserProfiles(selectedClass.students);
        if (result.success) {
          const profilesMap = {};
          result.profiles.forEach(profile => {
            profilesMap[profile.id] = profile;
          });
          setStudentProfiles(profilesMap);
        }
      } catch (error) {
        console.error('Error loading student profiles:', error);
      }
    }
    
    setShowStudentsModal(true);
  };

  const handleDeleteClass = () => {
    setShowManageModal(false);
    setShowDeleteModal(true);
  };

  const handleUpdateClass = async () => {
    setUpdatingClass(true);
    try {
      const result = await updateClass(selectedClass.id, editFormData);
      if (result.success) {
        // Update local state
        const updatedClasses = classes.map(cls => 
          cls.id === selectedClass.id 
            ? { ...cls, ...editFormData, updatedAt: new Date() }
            : cls
        );
        setClasses(updatedClasses);
        setShowEditModal(false);
        setSelectedClass(null);
        setEditFormData({});
        console.log('Class updated successfully');
      } else {
        console.error('Failed to update class:', result.error);
        alert(`Failed to update class: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating class:', error);
      alert('An unexpected error occurred while updating the class.');
    } finally {
      setUpdatingClass(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeletingClass(true);
    try {
      const result = await deleteClass(selectedClass.id);
      if (result.success) {
        // Remove from local state
        const updatedClasses = classes.filter(cls => cls.id !== selectedClass.id);
        setClasses(updatedClasses);
        setShowDeleteModal(false);
        setSelectedClass(null);
        console.log('Class deleted successfully');
      } else {
        console.error('Failed to delete class:', result.error);
        alert(`Failed to delete class: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('An unexpected error occurred while deleting the class.');
    } finally {
      setDeletingClass(false);
    }
  };

  const closeAllModals = () => {
    setShowManageModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowStudentsModal(false);
    setShowProfileSettings(false);
    setSelectedClass(null);
    setEditFormData({});
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      const result = await removeStudentFromClass(selectedClass.id, studentId);
      if (result.success) {
        // Update local state
        const updatedClasses = classes.map(cls => 
          cls.id === selectedClass.id 
            ? { ...cls, students: cls.students.filter(id => id !== studentId) }
            : cls
        );
        setClasses(updatedClasses);
        setSelectedClass({
          ...selectedClass,
          students: selectedClass.students.filter(id => id !== studentId)
        });
        console.log('Student removed successfully');
      } else {
        console.error('Failed to remove student:', result.error);
        alert(`Failed to remove student: ${result.error}`);
      }
    } catch (error) {
      console.error('Error removing student:', error);
      alert('An unexpected error occurred while removing the student.');
    }
  };

  const renderClasses = () => (
    <div className="space-y-6">
      {/* Header with Add Class Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Classes</h2>
          <p className="text-gray-400">Manage your classes and track attendance</p>
        </div>
        <motion.button
          onClick={handleAddClass}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Add Class</span>
        </motion.button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingClasses ? (
          /* Loading State */
          <div className="col-span-full">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Settings className="text-orange-400" size={32} />
                </motion.div>
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Loading Your Classes</h3>
              <p className="text-gray-400">Please wait while we fetch your classes...</p>
            </div>
          </div>
        ) : classes.length === 0 ? (
          /* Empty State */
          <div className="col-span-full">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-orange-400" size={32} />
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">No Classes Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Get started by creating your first class. You'll be able to track attendance and manage students.
              </p>
              <motion.button
                onClick={handleAddClass}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 mx-auto"
              >
                <Plus size={20} />
                <span>Create Your First Class</span>
              </motion.button>
            </div>
          </div>
        ) : (
          <>
            {classes.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{classItem.className}</h3>
                    <p className="text-orange-400 text-sm font-medium">{classItem.subject} - {classItem.section}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-orange-400" size={20} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300 text-sm">
                    <Users size={16} className="mr-2 text-gray-400" />
                    <span>{classItem.students ? classItem.students.length : 0} Students Enrolled</span>
                  </div>
                  {classItem.room && (
                    <div className="flex items-center text-gray-300 text-sm">
                      <Clock size={16} className="mr-2 text-gray-400" />
                      <span>Room: {classItem.room}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-300 text-sm">
                    <Settings size={16} className="mr-2 text-gray-400" />
                    <span>Code: {classItem.classCode}</span>
                  </div>
                  {classItem.description && (
                    <div className="text-gray-300 text-sm">
                      <span className="text-gray-400">Description: </span>
                      {classItem.description}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                  <motion.button
                    onClick={() => handleManageClass(classItem)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white/10 hover:bg-orange-500/20 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Manage Class
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleCopyInvitationLink(classItem)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    {copiedLink === classItem.id ? (
                      <>
                        <CheckCircle size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Link2 size={16} />
                        <span>Copy Invitation Link</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}

            {/* Add New Class Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: classes.length * 0.1 }}
              onClick={handleAddClass}
              className="bg-gray-800/30 backdrop-blur-sm border-2 border-dashed border-gray-600 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] cursor-pointer group"
            >
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors duration-200">
                <Plus className="text-orange-400" size={24} />
              </div>
              <h3 className="text-white font-medium mb-2">Create New Class</h3>
              <p className="text-gray-400 text-sm text-center">Add a new class to start tracking attendance</p>
            </motion.div>
          </>
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

    // Process classes to fit into the grid
    const scheduleGrid = {};
    daysOfWeek.forEach(day => {
      scheduleGrid[day.id] = {};
      timeSlots.forEach(time => {
        scheduleGrid[day.id][time] = null;
      });
    });

    // Fill the grid with classes
    classes.forEach((classItem, index) => {
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
          <h2 className="text-2xl font-bold text-white mb-2">Class Schedule</h2>
          <p className="text-gray-400">View your weekly class schedule in a grid format</p>
        </div>
        
        {classes.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="text-center py-20">
              <Calendar className="mx-auto text-orange-400 mb-4" size={48} />
              <h3 className="text-white text-lg font-medium mb-2">No Schedule Yet</h3>
              <p className="text-gray-400">Your schedule will appear here once you create classes</p>
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
                              className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-2 h-full flex flex-col justify-center"
                            >
                              <h4 className="text-white text-xs font-medium truncate">{classInSlot.className}</h4>
                              <p className="text-orange-400 text-xs truncate">{classInSlot.subject}</p>
                              <p className="text-gray-400 text-xs truncate">{classInSlot.room || classInSlot.section}</p>
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
        <p className="text-gray-400">Learn how to use Attendly effectively</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: "Setting Up Your First Class",
            description: "Learn how to create and configure your first class",
            steps: 4
          },
          {
            title: "NFC Attendance Tracking",
            description: "Understand how NFC-based attendance works",
            steps: 3
          },
          {
            title: "Managing Students",
            description: "Add, remove, and manage student enrollments",
            steps: 5
          },
          {
            title: "Viewing Reports",
            description: "Generate and export attendance reports",
            steps: 3
          }
        ].map((guide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <HelpCircle className="text-orange-400" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-2">{guide.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{guide.description}</p>
                <div className="flex items-center text-orange-400 text-sm">
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
              <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
              <p className="text-gray-400 mt-1">
                Welcome back{getDisplayName(user, userData, userProfile) ? `, ${getDisplayName(user, userData, userProfile)}` : ''}, manage your classes efficiently
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
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden">
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
                  {getInitials(getDisplayName(user, userData, userProfile), 'T')}
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
                    ? "border-orange-500 text-orange-400"
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
            }
          }}
          userId={user?.uid}
          user={user}
          userRole="teacher"
        />
      )}

      {/* Class Management Modal */}
      {showManageModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-orange-400" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{selectedClass.className}</h3>
                  <p className="text-orange-400 text-sm">{selectedClass.classCode}</p>
                </div>
              </div>
              <motion.button
                onClick={closeAllModals}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={handleEditClass}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 p-3 bg-gray-700/50 hover:bg-blue-500/20 text-white rounded-lg transition-colors duration-200"
              >
                <Edit3 size={18} className="text-blue-400" />
                <span>Edit Class Details</span>
              </motion.button>

              <motion.button
                onClick={handleShowStudents}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 p-3 bg-gray-700/50 hover:bg-green-500/20 text-white rounded-lg transition-colors duration-200"
              >
                <Users size={18} className="text-green-400" />
                <span>Manage Students ({selectedClass.students?.length || 0})</span>
              </motion.button>

              <motion.button
                onClick={handleDeleteClass}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 p-3 bg-gray-700/50 hover:bg-red-500/20 text-white rounded-lg transition-colors duration-200"
              >
                <Trash2 size={18} className="text-red-400" />
                <span>Delete Class</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Edit3 className="text-blue-400" size={20} />
                <h3 className="text-white font-semibold">Edit Class</h3>
              </div>
              <motion.button
                onClick={closeAllModals}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Class Name</label>
                  <input
                    type="text"
                    value={editFormData.className || ''}
                    onChange={(e) => setEditFormData({...editFormData, className: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={editFormData.subject || ''}
                    onChange={(e) => setEditFormData({...editFormData, subject: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
                  <input
                    type="text"
                    value={editFormData.section || ''}
                    onChange={(e) => setEditFormData({...editFormData, section: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Room</label>
                  <input
                    type="text"
                    value={editFormData.room || ''}
                    onChange={(e) => setEditFormData({...editFormData, room: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Students</label>
                  <input
                    type="number"
                    value={editFormData.maxStudents || ''}
                    onChange={(e) => setEditFormData({...editFormData, maxStudents: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={editFormData.startDate || ''}
                    onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={editFormData.endDate || ''}
                    onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={editFormData.startTime || ''}
                    onChange={(e) => setEditFormData({...editFormData, startTime: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                  <input
                    type="time"
                    value={editFormData.endTime || ''}
                    onChange={(e) => setEditFormData({...editFormData, endTime: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Optional class description..."
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <motion.button
                onClick={closeAllModals}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleUpdateClass}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                disabled={updatingClass}
              >
                {updatingClass ? 'Updating...' : 'Update Class'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Class Confirmation Modal */}
      {showDeleteModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-red-400" size={20} />
                <h3 className="text-white font-medium">Delete Class</h3>
              </div>
              <motion.button
                onClick={closeAllModals}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={deletingClass}
              >
                <X size={20} />
              </motion.button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">⚠️ Warning: This action cannot be undone!</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">Class: <span className="text-white font-medium">{selectedClass.className}</span></p>
                  <p className="text-gray-300">Subject: <span className="text-white font-medium">{selectedClass.subject}</span></p>
                  <p className="text-gray-300">Students Enrolled: <span className="text-white font-medium">{selectedClass.students?.length || 0}</span></p>
                  <p className="text-gray-300">Code: <span className="text-orange-400 font-mono">{selectedClass.classCode}</span></p>
                </div>
                <div className="mt-3 p-3 bg-red-500/20 rounded border border-red-500/40">
                  <p className="text-red-400 text-sm font-medium">
                    🗑️ Deleting this class will:
                  </p>
                  <ul className="text-red-300 text-xs mt-2 space-y-1 ml-4">
                    <li>• Remove all student enrollments</li>
                    <li>• Delete all attendance records</li>
                    <li>• Invalidate the invitation code</li>
                    <li>• Remove all class data permanently</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  onClick={closeAllModals}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                  disabled={deletingClass}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleConfirmDelete}
                  whileHover={{ scale: deletingClass ? 1 : 1.05 }}
                  whileTap={{ scale: deletingClass ? 1 : 0.95 }}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                  disabled={deletingClass}
                >
                  {deletingClass ? 'Deleting...' : 'Yes, Delete Class'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Manage Students Modal */}
      {showStudentsModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Users className="text-green-400" size={20} />
                <div>
                  <h3 className="text-white font-semibold">Manage Students</h3>
                  <p className="text-gray-400 text-sm">{selectedClass.className} • {selectedClass.students?.length || 0} students</p>
                </div>
              </div>
              <motion.button
                onClick={closeAllModals}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="space-y-4">
              {selectedClass.students && selectedClass.students.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Enrolled Students</h4>
                  {selectedClass.students.map((studentId, index) => (
                    <div key={studentId} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <span className="text-green-400 text-sm font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {getDisplayName(null, null, studentProfiles[studentId]) || `Student ${index + 1}`}
                          </p>
                          <p className="text-gray-400 text-xs font-mono">
                            {studentProfiles[studentId]?.studentId ? 
                              `ID: ${studentProfiles[studentId].studentId}` : 
                              `${studentId.substring(0, 8)}...`
                            }
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-medium transition-colors duration-200"
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this student from the class?')) {
                            handleRemoveStudent(studentId);
                          }
                        }}
                      >
                        <UserMinus size={14} className="mr-1" />
                        Remove
                      </motion.button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="text-gray-400 mx-auto mb-3" size={32} />
                  <h4 className="text-white font-medium mb-2">No Students Enrolled</h4>
                  <p className="text-gray-400 text-sm">Share the invitation code to get students to join this class.</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-3">
              <motion.button
                onClick={closeAllModals}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Close
              </motion.button>
              <motion.button
                onClick={() => handleCopyInvitationLink(selectedClass)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <Link2 size={14} className="mr-1" />
                Copy Invite Link
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
