"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Calendar, BookOpen, HelpCircle, Users, Clock, Settings, LogOut, CheckCircle, XCircle, TrendingUp, Link2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/lib/auth";

/**
 * Student Dashboard Component
 * @returns {JSX.Element} The student dashboard interface
 */
export default function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("classes");
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinLink, setJoinLink] = useState('');

  // Load enrolled classes from localStorage on component mount
  useEffect(() => {
    const savedClasses = JSON.parse(localStorage.getItem('studentClasses') || '[]');
    setEnrolledClasses(savedClasses);

    // Check if we just joined a new class
    if (searchParams.get('joined') === 'true') {
      // Successfully joined a new class
    }
  }, [searchParams]);

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

  const handleJoinClass = () => {
    setShowJoinModal(true);
  };

  const handleJoinSubmit = () => {
    if (!joinLink.trim()) {
      alert('Please enter a valid invitation link');
      return;
    }
    
    // Extract class code from URL
    try {
      const url = new URL(joinLink);
      const pathParts = url.pathname.split('/');
      const codeIndex = pathParts.indexOf('join') + 1;
      
      if (codeIndex > 0 && codeIndex < pathParts.length) {
        const classCode = pathParts[codeIndex];
        console.log('Extracted class code from URL:', classCode);
        
        // Reset and close modal
        setJoinLink('');
        setShowJoinModal(false);
        
        // Navigate to join page - don't double encode since the code is already URL-safe
        router.push(`/student/join/${classCode}`);
      } else {
        alert('Invalid invitation link format');
      }
    } catch (error) {
      // If URL parsing fails, try to extract code from the end of the string
      const parts = joinLink.split('/');
      const lastPart = parts[parts.length - 1];
      
      if (lastPart && lastPart.trim()) {
        console.log('Extracted class code from string:', lastPart.trim());
        
        // Reset and close modal
        setJoinLink('');
        setShowJoinModal(false);
        
        // Navigate to join page - don't encode since it might already be encoded
        router.push(`/student/join/${lastPart.trim()}`);
      } else {
        alert('Invalid invitation link. Please check the URL and try again.');
      }
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
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Join Class</span>
        </motion.button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledClasses.length === 0 ? (
          /* Empty State */
          <div className="col-span-full">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-orange-400" size={32} />
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">No Classes Joined Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Get started by joining your first class using an invitation link from your teacher.
              </p>
              <motion.button
                onClick={handleJoinClass}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 mx-auto"
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
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{classItem.name}</h3>
                  <p className="text-orange-400 text-sm font-medium">{classItem.code}</p>
                  <p className="text-gray-400 text-xs mt-1">{classItem.teacherName}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-orange-400" size={20} />
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-300 text-sm">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>{classItem.schedule}</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <Settings size={16} className="mr-2 text-gray-400" />
                  <span>{classItem.room}</span>
                </div>
              </div>

              {/* Attendance Stats */}
              <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Attendance</span>
                  <span className={`text-sm font-medium ${
                    classItem.attendance.percentage >= 90 ? 'text-green-400' :
                    classItem.attendance.percentage >= 75 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {classItem.attendance.percentage}%
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-400 mb-2">
                  <CheckCircle size={12} className="mr-1 text-green-400" />
                  <span>{classItem.attendance.present}/{classItem.attendance.total} classes attended</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      classItem.attendance.percentage >= 90 ? 'bg-green-400' :
                      classItem.attendance.percentage >= 75 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${classItem.attendance.percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white/10 hover:bg-orange-500/20 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">My Schedule</h2>
        <p className="text-gray-400">View your weekly class schedule and upcoming sessions</p>
      </div>
      
      {enrolledClasses.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="text-center py-20">
            <Calendar className="mx-auto text-orange-400 mb-4" size={48} />
            <h3 className="text-white text-lg font-medium mb-2">No Schedule Yet</h3>
            <p className="text-gray-400">Your schedule will appear here once you join classes</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="space-y-4">
            {enrolledClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      classItem.attendance?.percentage >= 90 ? 'bg-green-400' :
                      classItem.attendance?.percentage >= 75 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <h4 className="text-white font-medium">{classItem.name}</h4>
                      <p className="text-gray-400 text-sm">{classItem.code} • {classItem.teacherName}</p>
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
              <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
              <p className="text-gray-400 mt-1">
                Welcome back{userData?.name ? `, ${userData.name}` : ''}, track your attendance and manage your classes
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
                <span className="text-white font-medium">S</span>
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
                <Link2 className="text-orange-400" size={20} />
                <h3 className="text-white font-medium">Join Class</h3>
              </div>
              <motion.button
                onClick={() => setShowJoinModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Class Invitation Link
                </label>
                <input
                  type="text"
                  value={joinLink}
                  onChange={(e) => setJoinLink(e.target.value)}
                  placeholder="Paste the invitation link from your teacher"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Ask your teacher for the class invitation link and paste it here.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => setShowJoinModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleJoinSubmit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Join Class
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
