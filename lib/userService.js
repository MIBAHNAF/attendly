/**
 * User Profile Service
 * Handles user profile operations for both students and teachers
 */

/**
 * Get user profile by user ID
 * @param {string} userId - The user's Firebase Auth UID
 * @returns {Promise<Object>} Response object with success status and profile data
 */
export async function getUserProfile(userId) {
  try {
    console.log('Fetching profile for user:', userId);
    
    const response = await fetch(`/api/user/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      const text = await response.text();
      console.error('Profile fetch failed with status:', response.status, text);
      throw new Error(`Profile fetch failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch profile');
    }
    
    console.log('Successfully fetched user profile');
    return data;
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update user profile
 * @param {string} userId - The user's Firebase Auth UID
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<Object>} Response object with success status
 */
export async function updateUserProfile(userId, profileData) {
  try {
    console.log('Updating profile for user:', userId);
    
    const response = await fetch(`/api/user/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      const text = await response.text();
      console.error('Profile update failed with status:', response.status, text);
      throw new Error(`Profile update failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update profile');
    }
    
    console.log('Successfully updated user profile');
    return data;
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get multiple user profiles by user IDs (for displaying student names in classes)
 * @param {Array} userIds - Array of user Firebase Auth UIDs
 * @returns {Promise<Object>} Response object with success status and profiles array
 */
export async function getUserProfiles(userIds) {
  try {
    console.log('Fetching profiles for users:', userIds);
    
    const response = await fetch('/api/user/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userIds }),
    });
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      const text = await response.text();
      console.error('Profiles fetch failed with status:', response.status, text);
      throw new Error(`Profiles fetch failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch profiles');
    }
    
    console.log('Successfully fetched user profiles');
    return data;
    
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return {
      success: false,
      error: error.message,
      profiles: []
    };
  }
}

/**
 * Upload profile picture
 * @param {string} userId - The user's Firebase Auth UID
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} Response object with success status and image URL
 */
export async function uploadProfilePicture(userId, file) {
  try {
    console.log('Uploading profile picture for user:', userId);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    const response = await fetch('/api/user/profile/upload', {
      method: 'POST',
      body: formData,
    });
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      const text = await response.text();
      console.error('Upload failed with status:', response.status, text);
      throw new Error(`Upload failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to upload profile picture');
    }
    
    console.log('Successfully uploaded profile picture');
    return data;
    
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Remove profile picture
 * @param {string} userId - The user's Firebase Auth UID
 * @returns {Promise<Object>} Response object with success status
 */
export async function removeProfilePicture(userId) {
  try {
    console.log('Removing profile picture for user:', userId);
    
    const response = await fetch(`/api/user/profile/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'remove_profile_picture' }),
    });
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      const text = await response.text();
      console.error('Remove profile picture failed with status:', response.status, text);
      throw new Error(`Remove profile picture failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to remove profile picture');
    }
    
    console.log('Successfully removed profile picture');
    return data;
    
  } catch (error) {
    console.error('Error removing profile picture:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
