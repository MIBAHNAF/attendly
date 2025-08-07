"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Calendar, Clock, Users, BookOpen, Hash, Type, MapPin } from "lucide-react";

/**
 * Add Class Page Component
 * @returns {JSX.Element} The add class form interface
 */
export default function AddClassPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    classNumber: '',
    className: '',
    maxStudents: '',
    classType: 'Lecture',
    section: '',
    days: [],
    startDate: '',
    endDate: '',
    startTime: '',
    duration: '',
    room: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = () => {
    // Validate required fields
    const requiredFields = ['classNumber', 'className', 'maxStudents', 'section', 'startDate', 'endDate', 'startTime'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    if (formData.days.length === 0) {
      alert('Please select at least one day of the week');
      return;
    }

    setIsSaving(true);

    // Format the days for display
    const dayNames = {
      monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', 
      thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
    };
    const selectedDays = formData.days.map(day => dayNames[day]).join(', ');
    
    // Create the new class object
    const newClass = {
      id: Date.now(),
      name: formData.className,
      code: formData.classNumber,
      section: formData.section,
      classType: formData.classType,
      maxStudents: parseInt(formData.maxStudents),
      enrolledStudents: 0,
      schedule: `${selectedDays} - ${formData.startTime}`,
      room: formData.room || 'TBD',
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: formData.duration,
      days: formData.days,
      invitationLink: ''
    };

    // Save to localStorage for now (later will be replaced with API call)
    const existingClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
    existingClasses.push(newClass);
    localStorage.setItem('teacherClasses', JSON.stringify(existingClasses));

    // TODO: Replace with actual API call
    console.log('Saving class:', newClass);
    
    // Simulate saving delay
    setTimeout(() => {
      setIsSaving(false);
      // Navigate back to dashboard
      router.push('/teacher/dashboard?newClass=true');
    }, 1500);
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
                  <span>Duration</span>
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 90 minutes, 1.5 hours"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
