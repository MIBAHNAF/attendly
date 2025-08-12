"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Calendar, Clock, Users, BookOpen, Hash, Type, MapPin } from "lucide-react";
import { createClass } from "@/lib/teacherService";
import { useAuth } from "@/hooks/useAuth";

/**
 * Add Class Page Component
 * @returns {JSX.Element} The add class form interface
 */
export default function AddClassPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    classNumber: '',
    className: '',
    maxStudents: '',
    classType: 'Lecture',
    subject: '',
    section: '',
    room: '',
    description: '',
    schedule: [], // Array of { day, startTime, endTime }
    days: [],
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const classTypes = ['Lecture', 'Lab', 'Seminar', 'Workshop', 'Tutorial'];
  const daysOfWeek = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDayToggle = (dayId) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(dayId) 
        ? prev.days.filter(d => d !== dayId)
        : [...prev.days, dayId]
    }));
  };

  // Generate schedule array based on selected days and times
  const generateSchedule = () => {
    const schedule = [];
    formData.days.forEach(day => {
      if (formData.startTime && formData.endTime) {
        schedule.push({
          day: day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          time: formData.startTime // For grid display compatibility
        });
      }
    });
    return schedule;
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.className || !formData.classType || !formData.section) {
      setSaveError('Please fill in all required fields: Class Name, Class Type, and Section');
      return;
    }

    if (formData.days.length === 0) {
      setSaveError('Please select at least one day of the week');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setSaveError('Please provide start and end times');
      return;
    }

    if (!user || !user.uid) {
      setSaveError('You must be signed in to create a class');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      // Generate schedule from selected days and times
      const generatedSchedule = generateSchedule();
      
      // Create class data for backend
      const classData = {
        teacherId: user.uid,
        classNumber: formData.classNumber,
        className: formData.className,
        subject: formData.classType, // Map classType to subject for backend compatibility
        section: formData.section,
        room: formData.room,
        description: formData.description || `${formData.classType} class for ${formData.className}`,
        maxStudents: parseInt(formData.maxStudents) || 30,
        schedule: generatedSchedule,
        days: formData.days,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime
      };

      // Call backend API to create the class
      const result = await createClass(classData);
      
      if (result.success) {
        // Redirect to teacher dashboard with success indicator
        router.push('/teacher/dashboard?newClass=true');
      } else {
        setSaveError(result.error || 'Failed to create class. Please try again.');
      }
    } catch (error) {
      setSaveError('An error occurred while creating the class.');
      console.error('Create class error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/teacher/dashboard');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </motion.button>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <X size={16} />
                <span>Cancel</span>
              </motion.button>
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                whileHover={{ scale: isSaving ? 1 : 1.05 }}
                whileTap={{ scale: isSaving ? 1 : 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg"
          >
            <p className="text-red-400 text-sm font-medium">{saveError}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Class</h1>
            <p className="text-gray-400">Fill in the details to create a new class and start tracking attendance</p>
          </div>

          {/* Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Class Number */}
              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <Hash size={16} className="text-orange-400" />
                  <span>Class Number *</span>
                </label>
                <input
                  type="text"
                  value={formData.classNumber}
                  onChange={(e) => handleInputChange('classNumber', e.target.value)}
                  placeholder="e.g., CS101, MATH201"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Class Name */}
              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <Type size={16} className="text-orange-400" />
                  <span>Class Name *</span>
                </label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => handleInputChange('className', e.target.value)}
                  placeholder="e.g., Computer Science 101"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Max Students */}
              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <Users size={16} className="text-orange-400" />
                  <span>Max Students *</span>
                </label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                  placeholder="e.g., 30"
                  min="1"
                  max="200"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Class Type */}
              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <BookOpen size={16} className="text-orange-400" />
                  <span>Class Type *</span>
                </label>
                <select
                  value={formData.classType}
                  onChange={(e) => handleInputChange('classType', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                >
                  {classTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <MapPin size={16} className="text-orange-400" />
                  <span>Section *</span>
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => handleInputChange('section', e.target.value)}
                  placeholder="e.g., A, B, 001, 002"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Room */}
              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <MapPin size={16} className="text-orange-400" />
                  <span>Room/Location</span>
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => handleInputChange('room', e.target.value)}
                  placeholder="e.g., Room 204, Lab 102"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="flex items-center space-x-2 text-white font-medium mb-3">
                <Type size={16} className="text-orange-400" />
                <span>Description (Optional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the class content and objectives..."
                rows="3"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors resize-vertical"
              />
            </div>

            {/* Days of Week */}
            <div className="mt-6">
              <label className="flex items-center space-x-2 text-white font-medium mb-3">
                <Calendar size={16} className="text-orange-400" />
                <span>Days of Week *</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <motion.button
                    key={day.id}
                    onClick={() => handleDayToggle(day.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                      formData.days.includes(day.id)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {day.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Date Range and Time */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <Calendar size={16} className="text-orange-400" />
                  <span>Start Date *</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <Calendar size={16} className="text-orange-400" />
                  <span>End Date *</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <Clock size={16} className="text-orange-400" />
                  <span>Start Time *</span>
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <Clock size={16} className="text-orange-400" />
                  <span>End Time *</span>
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
