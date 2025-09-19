'use client';

import { useState, useRef, useEffect } from 'react';
import { countries } from '../data/countries';
import { updateUserProfile, checkUsernameExists } from '../lib/firestore';

export default function ProfileEditModal({ isOpen, onClose, userData, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState(null); // 'checking', 'available', 'taken', 'unchanged'
  const [originalUsername, setOriginalUsername] = useState('');
  const usernameCheckTimeoutRef = useRef(null);
  const usernameRequestIdRef = useRef(0);
  
  // Form data state
  const [formData, setFormData] = useState({
    username: userData?.username || '',
    displayName: userData?.displayName || '',
    country: userData?.country || '',
    profilePic: null,
    profilePicPreview: userData?.profileImage || '',
    profileBanner: null,
    profileBannerPreview: userData?.bannerImage || '',
    bio: userData?.bio || ''
  });

  const profilePicRef = useRef();
  const profileBannerRef = useRef();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, []);

  // Set original username when userData changes
  useEffect(() => {
    if (userData?.username) {
      setOriginalUsername(userData.username);
      setUsernameStatus('unchanged');
    }
  }, [userData]);

  // Function to check username availability with debouncing
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    // If username is unchanged, mark as unchanged
    if (username === originalUsername) {
      setUsernameStatus('unchanged');
      return;
    }

    // Clear existing timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    setUsernameStatus('checking');
    
    // Increment request ID to handle race conditions
    const currentRequestId = ++usernameRequestIdRef.current;

    // Set new timeout for debouncing
    usernameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const exists = await checkUsernameExists(username);
        // Only update if this is still the latest request and username hasn't changed
        if (currentRequestId === usernameRequestIdRef.current && formData.username === username) {
          setUsernameStatus(exists ? 'taken' : 'available');
        }
      } catch (error) {
        console.error('Error checking username:', error);
        if (currentRequestId === usernameRequestIdRef.current && formData.username === username) {
          setUsernameStatus(null); // Show neutral state on error
        }
      }
    }, 500); // 500ms debounce
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Check username availability in real-time
    if (field === 'username') {
      checkUsernameAvailability(value);
    }
  };

  const handleFileChange = (field, file, previewField) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [field]: file,
          [previewField]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-z0-9]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain lowercase letters and numbers';
    } else if (usernameStatus === 'taken') {
      newErrors.username = 'This username is already taken';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.country) {
      newErrors.country = 'Please select your country';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updates = {
        username: formData.username,
        displayName: formData.displayName,
        country: formData.country,
        bio: formData.bio,
      };

      // Handle image uploads (in a real app, you'd upload to storage first)
      if (formData.profilePicPreview && formData.profilePicPreview !== userData?.profileImage) {
        updates.profileImage = formData.profilePicPreview;
      }
      
      if (formData.profileBannerPreview && formData.profileBannerPreview !== userData?.bannerImage) {
        updates.bannerImage = formData.profileBannerPreview;
      }

      const result = await updateUserProfile(userData.id, updates);
      
      if (result.success) {
        // Use the potentially normalized username from the backend result
        const finalUpdates = { ...updates };
        if (result.username && updates.username) {
          finalUpdates.username = result.username;
        }
        onUpdate({ ...userData, ...finalUpdates });
        onClose();
      } else {
        setErrors({ general: result.error || 'Failed to update profile. Please try again.' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-6">
            {/* Profile Banner - moved to top */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Profile Banner
              </label>
              <div className="space-y-3">
                <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                  {formData.profileBannerPreview ? (
                    <img
                      src={formData.profileBannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <svg className="w-12 h-12 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={profileBannerRef}
                  onChange={(e) => handleFileChange('profileBanner', e.target.files[0], 'profileBannerPreview')}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => profileBannerRef.current?.click()}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Change Banner
                </button>
              </div>
            </div>

            {/* Profile Picture - moved to top */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                  {formData.profilePicPreview ? (
                    <img
                      src={formData.profilePicPreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={profilePicRef}
                    onChange={(e) => handleFileChange('profilePic', e.target.files[0], 'profilePicPreview')}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => profilePicRef.current?.click()}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 ${
                    errors.username ? 'border-red-300 bg-red-50' : 
                    usernameStatus === 'taken' ? 'border-red-300 bg-red-50' :
                    usernameStatus === 'available' ? 'border-emerald-300 bg-emerald-50' :
                    usernameStatus === 'unchanged' ? 'border-gray-300' :
                    'border-gray-300'
                  }`}
                  placeholder="johndoe123"
                />
                {/* Username status indicator */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {usernameStatus === 'checking' && (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
                  )}
                  {usernameStatus === 'available' && (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {usernameStatus === 'taken' && (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {usernameStatus === 'unchanged' && (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                Your profile URL: frame.com/u/{formData.username || 'username'}
              </p>
              {/* Username status message */}
              {usernameStatus === 'taken' && (
                <p className="text-red-600 text-sm mt-1">This username is already taken</p>
              )}
              {usernameStatus === 'available' && formData.username.length >= 3 && (
                <p className="text-emerald-600 text-sm mt-1">Username is available</p>
              )}
              {usernameStatus === 'unchanged' && (
                <p className="text-gray-600 text-sm mt-1">Current username</p>
              )}
              {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 ${
                  errors.displayName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              <p className="text-sm text-gray-700 mt-1">
                This appears as your profile name
              </p>
              {errors.displayName && <p className="text-red-600 text-sm mt-1">{errors.displayName}</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Country *
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 ${
                  errors.country ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select your country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
                rows="4"
                placeholder="Tell others about yourself..."
                maxLength="500"
              />
              <div className="flex justify-end mt-1">
                <span className="text-sm text-gray-400">{formData.bio.length}/500</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || usernameStatus === 'checking'}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : usernameStatus === 'checking' ? 'Checking username...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}