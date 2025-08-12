"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Camera, Save, X, AlertCircle, CheckCircle, Upload, Trash2 } from "lucide-react";
import { getUserProfile, updateUserProfile, uploadProfilePicture, removeProfilePicture } from "@/lib/userService";
import { getInitials, createGoogleProfile } from "@/lib/profileUtils";

/**
 * Profile Settings Component
 * Reusable component for both student and teacher profile management
 */
export default function ProfileSettings({ userId, userRole, user, isOpen, onClose, onProfileUpdate }) {
  const [profile, setProfile] = useState({
    displayName: '',
    studentId: '',
    teacherId: '',
    profilePicture: '',
    email: '',
    role: userRole || ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Load user profile when component opens
  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile();
    }
  }, [isOpen, userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    setError('');
    
    console.log('Loading profile for user:', userId);
    console.log('User object:', user);
    console.log('Google photo URL:', user?.photoURL);
    
    try {
      const result = await getUserProfile(userId);
      if (result.success && result.profile && result.profile.displayName) {
        // Profile exists and has data
        console.log('Existing profile found:', result.profile);
        setProfile({
          ...result.profile,
          role: userRole || result.profile.role || ''
        });
        const profilePic = result.profile.profilePicture || user?.photoURL || '';
        console.log('Setting image preview to:', profilePic);
        setImagePreview(profilePic);
      } else {
        // No profile exists or profile is empty, use Google data as defaults
        console.log('No profile found, using Google data');
        const defaultProfile = createGoogleProfile(user, userRole);
        console.log('Default profile created:', defaultProfile);
        setProfile(defaultProfile);
        const googlePhoto = user?.photoURL || '';
        console.log('Setting Google photo as preview:', googlePhoto);
        setImagePreview(googlePhoto);
        
        // Auto-save the Google data as initial profile if user has displayName
        if (user?.displayName || user?.email) {
          try {
            await updateUserProfile(userId, defaultProfile);
            console.log('Auto-saved Google profile data');
          } catch (error) {
            console.error('Failed to auto-save Google profile:', error);
          }
        }
      }
    } catch (err) {
      // If error loading profile, use Google data as fallback
      console.log('Error loading profile, using fallback');
      const defaultProfile = createGoogleProfile(user, userRole);
      setProfile(defaultProfile);
      setImagePreview(user?.photoURL || '');
      setError('');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      // Upload image
      const result = await uploadProfilePicture(userId, file);
      if (result.success) {
        setProfile(prev => ({
          ...prev,
          profilePicture: result.imageUrl
        }));
        setSuccess('Profile picture uploaded successfully!');
        
        // Notify parent component to refresh profile data
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        setError(result.error || 'Failed to upload image');
        setImagePreview(profile.profilePicture || '');
      }
    } catch (err) {
      setError('An error occurred while uploading the image');
      setImagePreview(profile.profilePicture || '');
      console.error('Image upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const result = await removeProfilePicture(userId);
      if (result.success) {
        setProfile(prev => ({
          ...prev,
          profilePicture: ''
        }));
        setImagePreview('');
        setSuccess('Profile picture removed successfully!');
        
        // Notify parent component to refresh profile data
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        setError(result.error || 'Failed to remove profile picture');
      }
    } catch (err) {
      setError('An error occurred while removing the profile picture');
      console.error('Remove profile picture error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!profile.displayName.trim()) {
      setError('Display name is required');
      setSaving(false);
      return;
    }

    if (userRole === 'student' && !profile.studentId.trim()) {
      setError('Student ID is required');
      setSaving(false);
      return;
    }

    if (userRole === 'teacher' && !profile.teacherId.trim()) {
      setError('Teacher ID is required');
      setSaving(false);
      return;
    }

    try {
      const result = await updateUserProfile(userId, profile);
      if (result.success) {
        setSuccess('Profile updated successfully!');
        
        // Notify parent component to refresh profile data
        if (onProfileUpdate) {
          onProfileUpdate();
        }
        
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating your profile');
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <User className="text-orange-400" size={24} />
            <div>
              <h3 className="text-white font-semibold text-lg">Profile Settings</h3>
              <p className="text-gray-400 text-sm">Manage your personal information</p>
            </div>
          </div>
          <motion.button
            onClick={handleClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </motion.button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden mx-auto mb-4">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={() => {
                        console.log('Image failed to load, falling back to Google photo or initials');
                        // Try Google photo as fallback if current image is not Google photo
                        const googlePhoto = user?.photoURL;
                        if (googlePhoto && googlePhoto !== imagePreview) {
                          setImagePreview(googlePhoto);
                          // Update profile to use Google photo
                          setProfile(prev => ({
                            ...prev,
                            profilePicture: googlePhoto
                          }));
                        } else {
                          // No Google photo or Google photo also failed, show initials
                          setImagePreview('');
                          setProfile(prev => ({
                            ...prev,
                            profilePicture: ''
                          }));
                        }
                      }}
                    />
                  ) : (
                    <span className="text-white text-xl font-medium">
                      {getInitials(profile.displayName || user?.displayName, userRole === 'student' ? 'S' : 'T')}
                    </span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                {/* Camera Icon for Upload */}
                <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <Camera size={16} />
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                
                {/* Remove Icon (only show if there's a custom uploaded picture) */}
                {imagePreview && !imagePreview.includes('googleusercontent.com') && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    disabled={uploading}
                    className="absolute bottom-0 left-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer transition-colors"
                    title="Remove profile picture"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                Click the camera icon to change your profile picture
                {user?.photoURL && !imagePreview && <span className="text-green-400"> (using Google photo)</span>}
                {imagePreview && imagePreview.includes('googleusercontent.com') && <span className="text-green-400"> (Google photo)</span>}
                {imagePreview && !imagePreview.includes('googleusercontent.com') && <span className="text-blue-400"> (custom upload)</span>}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name * {user?.displayName && <span className="text-gray-500 text-xs">(from Google account)</span>}
                </label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Student ID or Teacher ID */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {userRole === 'student' ? 'Student ID *' : 'Teacher ID *'}
                </label>
                <input
                  type="text"
                  value={userRole === 'student' ? profile.studentId : profile.teacherId}
                  onChange={(e) => handleInputChange(
                    userRole === 'student' ? 'studentId' : 'teacherId', 
                    e.target.value
                  )}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={`Enter your ${userRole === 'student' ? 'student' : 'teacher'} ID`}
                />
              </div>

              {/* Email (auto-filled from Google account) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-gray-500 text-xs">(from Google account)</span>
                </label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                  placeholder="Email from your Google account"
                />
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="text-red-400" size={16} />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center space-x-2">
                <CheckCircle className="text-green-400" size={16} />
                <span className="text-green-400 text-sm">{success}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                disabled={saving || uploading}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Profile</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
