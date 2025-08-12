/**
 * Student Class Management Service
 * Purpose: Frontend functions to interact with student class APIs
 * What it does: Provides clean interface between React components and backend APIs
 */

/**
 * Fetch all classes for a student
 * @param {string} studentId - The student's Firebase Auth UID
 * @returns {Promise} - Promise resolving to student's classes
 */
export const getStudentClasses = async (studentId) => {
  try {
    console.log('Fetching classes for student:', studentId);
    
    // Make API call to our backend endpoint
    const response = await fetch(`/api/student/classes?studentId=${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch classes');
    }
    
    console.log('Successfully fetched student classes:', data.classes);
    return data;
    
  } catch (error) {
    console.error('Error fetching student classes:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Join a class using invitation code
 * @param {string} studentId - The student's Firebase Auth UID  
 * @param {string} invitationCode - The class invitation code
 * @returns {Promise} - Promise resolving to join result
 */
export const joinClassByCode = async (studentId, invitationCode) => {
  try {
    console.log('Joining class with code:', invitationCode);
    
    // Make API call to join the class
    const response = await fetch('/api/student/classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        invitationCode
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to join class');
    }
    
    console.log('Successfully joined class:', data.classData);
    return data;
    
  } catch (error) {
    console.error('Error joining class:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Leave a class (remove student from class)
 * @param {string} studentId - The student's Firebase Auth UID
 * @param {string} classId - The class document ID
 * @returns {Promise} - Promise resolving to leave result
 */
export const leaveClass = async (studentId, classId) => {
  try {
    console.log('Leaving class:', classId);
    
    // We'll implement this endpoint next
    const response = await fetch(`/api/student/classes/${classId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to leave class');
    }
    
    console.log('Successfully left class');
    return data;
    
  } catch (error) {
    console.error('Error leaving class:', error);
    return { success: false, error: error.message };
  }
};
