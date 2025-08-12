/**
 * Teacher Service - Frontend API service functions for teacher operations
 * Handles communication between teacher components and backend APIs
 */

/**
 * Fetches all classes created by a teacher
 * @param {string} teacherId - The teacher's user ID
 * @returns {Promise<Object>} Response object with success status and classes array
 */
export async function getTeacherClasses(teacherId) {
  try {
    const response = await fetch(`/api/teacher/classes?teacherId=${teacherId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch classes');
    }

    return {
      success: true,
      classes: data.classes || []
    };
  } catch (error) {
    console.error('Error in getTeacherClasses:', error);
    return {
      success: false,
      error: error.message,
      classes: []
    };
  }
}

/**
 * Creates a new class for a teacher
 * @param {Object} classData - The class information
 * @param {string} classData.teacherId - Teacher's user ID
 * @param {string} classData.className - Name of the class
 * @param {string} classData.subject - Subject being taught
 * @param {string} classData.section - Class section
 * @param {Array} classData.schedule - Class schedule array
 * @param {string} classData.room - Room number/location
 * @param {string} classData.description - Class description
 * @returns {Promise<Object>} Response object with success status and created class
 */
export async function createClass(classData) {
  try {
    const response = await fetch('/api/teacher/classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create class');
    }

    return {
      success: true,
      class: data.class
    };
  } catch (error) {
    console.error('Error in createClass:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generates an invitation link for a class
 * @param {Object} classData - The class information
 * @returns {string} The complete invitation URL
 */
export function generateInvitationLink(classData) {
  if (typeof window === 'undefined') {
    return ''; // Return empty string on server side
  }
  
  // Use the classCode from the backend-created class
  const invitationUrl = `${window.location.origin}/student/join/${classData.classCode}`;
  return invitationUrl;
}

/**
 * Copies invitation link to clipboard
 * @param {Object} classData - The class information
 * @returns {Promise<boolean>} Success status of copy operation
 */
export async function copyInvitationLink(classData) {
  try {
    const invitationLink = generateInvitationLink(classData);
    await navigator.clipboard.writeText(invitationLink);
    return true;
  } catch (error) {
    console.error('Failed to copy invitation link:', error);
    return false;
  }
}

/**
 * Looks up a class by its invitation code
 * @param {string} classCode - The invitation code to lookup
 * @returns {Promise<Object>} Response object with success status and class details
 */
export async function lookupClassByCode(classCode) {
  try {
    const response = await fetch(`/api/classes/lookup/${encodeURIComponent(classCode)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to lookup class');
    }

    return {
      success: true,
      class: data.class
    };
  } catch (error) {
    console.error('Error in lookupClassByCode:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Updates an existing class
 * @param {string} classId - The class ID to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} Response object with success status
 */
export async function updateClass(classId, updateData) {
  try {
    const response = await fetch(`/api/teacher/classes/${classId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update class');
    }

    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    console.error('Error in updateClass:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Deletes a class
 * @param {string} classId - The class ID to delete
 * @returns {Promise<Object>} Response object with success status
 */
export async function deleteClass(classId) {
  try {
    const response = await fetch(`/api/teacher/classes/${classId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete class');
    }

    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    console.error('Error in deleteClass:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Removes a student from a class
 * @param {string} classId - The class ID
 * @param {string} studentId - The student ID to remove
 * @returns {Promise<Object>} Response object with success status
 */
export async function removeStudentFromClass(classId, studentId) {
  try {
    const response = await fetch(`/api/teacher/classes/${classId}/students`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to remove student');
    }

    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    console.error('Error in removeStudentFromClass:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
