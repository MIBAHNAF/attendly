/**
 * Profile Utils
 * Shared utilities for profile management and display
 */

/**
 * Get initials from a name
 * @param {string} name - The full name
 * @param {string} defaultChar - Default character if no name (S for student, T for teacher)
 * @returns {string} Initials (max 2 characters)
 */
export function getInitials(name, defaultChar = 'U') {
  if (!name || typeof name !== 'string') return defaultChar;
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get user display name with fallbacks
 * @param {Object} user - Firebase user object
 * @param {Object} userData - Firestore user data
 * @param {Object} profile - User profile data
 * @returns {string} Display name or fallback
 */
export function getDisplayName(user, userData, profile) {
  return profile?.displayName || 
         userData?.name || 
         user?.displayName || 
         user?.email?.split('@')[0] || 
         'Unknown User';
}

/**
 * Get profile picture URL with fallbacks
 * @param {Object} user - Firebase user object
 * @param {Object} profile - User profile data
 * @returns {string|null} Profile picture URL or null if none
 */
export function getProfilePicture(user, profile) {
  return profile?.profilePicture || user?.photoURL || null;
}

/**
 * Create default profile from Google data
 * @param {Object} user - Firebase user object
 * @param {string} role - User role (student/teacher)
 * @returns {Object} Default profile object
 */
export function createGoogleProfile(user, role) {
  return {
    displayName: user?.displayName || '',
    studentId: role === 'student' ? '' : undefined,
    teacherId: role === 'teacher' ? '' : undefined,
    profilePicture: user?.photoURL || '',
    email: user?.email || '',
    role: role || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
