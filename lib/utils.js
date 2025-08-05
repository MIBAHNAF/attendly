// Utility functions for the Attendly application
'use client';

/**
 * Generate a random invite code for classes
 * @param {number} length - Length of the invite code
 * @returns {string} Random invite code
 */
export function generateInviteCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format time to readable string
 * @param {string} time - Time in HH:MM format
 * @returns {string} Formatted time string
 */
export function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Get day name from day number
 * @param {number} dayNumber - Day number (0-6, Sunday-Saturday)
 * @returns {string} Day name
 */
export function getDayName(dayNumber) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
}

/**
 * Calculate attendance percentage
 * @param {number} present - Number of present days
 * @param {number} total - Total number of days
 * @returns {number} Percentage rounded to 2 decimal places
 */
export function calculateAttendancePercentage(present, total) {
  if (total === 0) return 0;
  return Math.round((present / total) * 100 * 100) / 100;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate student ID format (customizable)
 * @param {string} studentId - Student ID to validate
 * @returns {boolean} Whether student ID is valid
 */
export function isValidStudentId(studentId) {
  // Customize this based on your institution's student ID format
  // Example: 8-digit number
  const studentIdRegex = /^\d{8}$/;
  return studentIdRegex.test(studentId);
}

/**
 * Create class invite URL
 * @param {string} classId - Class ID
 * @param {string} inviteCode - Invite code
 * @returns {string} Full invite URL
 */
export function createInviteUrl(classId, inviteCode) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/join/${classId}?code=${inviteCode}`;
}

/**
 * Check if current time is within class schedule
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @param {number} dayOfWeek - Day of week (0-6)
 * @returns {boolean} Whether current time is within schedule
 */
export function isWithinClassTime(startTime, endTime, dayOfWeek) {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  if (currentDay !== dayOfWeek) return false;
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return currentTime >= startMinutes && currentTime <= endMinutes;
}
