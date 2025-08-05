// Authentication related types and interfaces (JavaScript format)

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {'teacher' | 'student'} role
 * @property {Date} createdAt
 */

/**
 * @typedef {User} Student
 * @property {string} studentId
 * @property {string[]} enrolledClasses
 */

/**
 * @typedef {User} Teacher
 * @property {string} [school]
 * @property {string} [organizationName]
 * @property {string[]} createdClasses
 */

/**
 * @typedef {Object} AuthState
 * @property {User | null} user
 * @property {boolean} isLoading
 * @property {boolean} isAuthenticated
 */

// Export empty object to make this a module
export {};
