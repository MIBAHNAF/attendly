// Class related types and interfaces (JavaScript format)

/**
 * @typedef {Object} Class
 * @property {string} id
 * @property {string} name
 * @property {string} teacherId
 * @property {string} teacherName
 * @property {ClassSchedule[]} schedule
 * @property {string} inviteCode
 * @property {string} [nfcTagId]
 * @property {string[]} students
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} ClassSchedule
 * @property {string} id
 * @property {number} dayOfWeek - 0-6 (Sunday-Saturday)
 * @property {string} startTime - HH:MM format
 * @property {string} endTime - HH:MM format
 * @property {number} duration - in minutes
 */

/**
 * @typedef {Object} ClassInvite
 * @property {string} classId
 * @property {string} inviteCode
 * @property {Date} [expiresAt]
 * @property {boolean} isActive
 */

// Export empty object to make this a module
export {};
