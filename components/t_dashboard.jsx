"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Calendar, BookOpen, HelpCircle, Users, Clock, Settings, LogOut, Link2, Copy, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/lib/auth";

/**
 * Teacher Dashboard Component
 * @returns {JSX.Element} The teacher dashboard interface
 */
export default function TeacherDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("classes");
  const [classes, setClasses] = useState([]);
  const [copiedLink, setCopiedLink] = useState('');

  // Load classes from localStorage on component mount
  useEffect(() => {
    const savedClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
    setClasses(savedClasses);

    // Clear old broken invitations on first load
    if (typeof window !== 'undefined') {
      const invitations = JSON.parse(localStorage.getItem('classInvitations') || '{}');
      const hasBrokenCodes = Object.keys(invitations).some(code => code.includes('%') || code.includes(' '));
      
      if (hasBrokenCodes) {
        localStorage.setItem('classInvitations', '{}');
        
        // Also clear invitation links from classes so they get regenerated
        const cleanedClasses = savedClasses.map(cls => ({
          ...cls,
          invitationLink: '',
          classCode: ''
        }));
        setClasses(cleanedClasses);
        localStorage.setItem('teacherClasses', JSON.stringify(cleanedClasses));
      }
    }

    // Check if we just added a new class
    if (searchParams.get('newClass') === 'true') {
      // New class was added successfully
    }
  }, [searchParams]);

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

  const handleAddClass = () => {
    router.push('/teacher/add-class');
  };

  const generateInvitationLink = (classItem) => {
    // Remove spaces and special characters from class code to make it URL-safe
    const sanitizedClassCode = classItem.code.replace(/\s+/g, '').replace(/[^a-zA-Z0-9-]/g, '');
    const classCode = `${sanitizedClassCode}-${classItem.section}-${Date.now()}`.toUpperCase();
    const invitationLink = `${window.location.origin}/student/join/${classCode}`;
    
    // Store the class data with the invitation code for retrieval
    const invitationData = {
      classCode,
      classData: classItem,
      createdAt: new Date().toISOString()
    };
    
    // Store in localStorage for now (later will be database)
    const existingInvitations = JSON.parse(localStorage.getItem('classInvitations') || '{}');
    existingInvitations[classCode] = invitationData;
    localStorage.setItem('classInvitations', JSON.stringify(existingInvitations));
    
    // Update the class with the invitation link
    const updatedClasses = classes.map(cls => 
      cls.id === classItem.id ? { ...cls, invitationLink, classCode } : cls
    );
    setClasses(updatedClasses);
    localStorage.setItem('teacherClasses', JSON.stringify(updatedClasses));
    
    return invitationLink;
  };

  const copyInvitationLink = async (classItem) => {
    let linkToCopy = classItem.invitationLink;
    
    // Generate link if it doesn't exist
    if (!linkToCopy) {
      linkToCopy = generateInvitationLink(classItem);
    }
    
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setCopiedLink(classItem.id);
      setTimeout(() => setCopiedLink(''), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
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
        {classes.length === 0 ? (
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
                    <h3 className="text-lg font-semibold text-white mb-1">{classItem.name}</h3>
                    <p className="text-orange-400 text-sm font-medium">{classItem.code}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-orange-400" size={20} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300 text-sm">
                    <Users size={16} className="mr-2 text-gray-400" />
                    <span>{classItem.enrolledStudents || 0}/{classItem.maxStudents} Students</span>
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    <span>{classItem.schedule}</span>
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Settings size={16} className="mr-2 text-gray-400" />
                    <span>{classItem.section}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white/10 hover:bg-orange-500/20 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Manage Class
                  </motion.button>
                  
                  <motion.button
                    onClick={() => copyInvitationLink(classItem)}
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
                        <span>{classItem.invitationLink ? 'Copy Link' : 'Generate & Copy Link'}</span>
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

  const renderSchedule = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Class Schedule</h2>
        <p className="text-gray-400">View your weekly class schedule</p>
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
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="space-y-4">
            {classes.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <h4 className="text-white font-medium">{classItem.name}</h4>
                      <p className="text-gray-400 text-sm">{classItem.code} • {classItem.section}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">{classItem.schedule}</p>
                    <p className="text-gray-400 text-xs">{classItem.room}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
                Welcome back{userData?.name ? `, ${userData.name}` : ''}, manage your classes efficiently
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </motion.button>
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">T</span>
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
    </div>
  );
}
