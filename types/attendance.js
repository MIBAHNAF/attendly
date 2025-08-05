// Attendance related types and interfaces (JavaScript format)

/**
 * @typedef {Object} AttendanceLog
 * @property {string} id
 * @property {string} studentId
 * @property {string} classId
 * @property {Date} date
 * @property {'present' | 'absent' | 'late'} status
 * @property {Date} [checkInTime]
 * @property {string} [method] - 'nfc' | 'manual'
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} AttendanceStats
 * @property {string} studentId
 * @property {string} classId
 * @property {number} totalClasses
 * @property {number} presentCount
 * @property {number} absentCount
 * @property {number} lateCount
 * @property {number} attendancePercentage
 */

/**
 * @typedef {Object} NFCTag
 * @property {string} id
 * @property {string} uid
 * @property {string} classId
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {Date} [lastUsed]
 */

// Export empty object to make this a module
export {};
