"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { countries } from '../../data/countries';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, checkUsernameExists, updateUserProfile } from '../../lib/firestore';
import { useOptionalUserProfile } from '../../components/UserProfileProvider';
import { Caveat } from "next/font/google";
import Link from "next/link";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const profileContext = useOptionalUserProfile();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState(null); // 'checking', 'available', 'taken', 'unchanged'
  const [originalUsername, setOriginalUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const usernameCheckTimeoutRef = useRef(null);
  const usernameRequestIdRef = useRef(0);
  
  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    country: '',
    profilePic: null,
    profilePicPreview: '',
    profileBanner: null,
    profileBannerPreview: '',
    bio: ''
  });

  const profilePicRef = useRef();
  const profileBannerRef = useRef();
  
  // Refs for form validation scrolling
  const usernameRef = useRef();
  const displayNameRef = useRef();
  const countryRef = useRef();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, []);

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setUserData(userProfile);
          setFormData({
            username: userProfile.username || '',
            displayName: userProfile.displayName || '',
            country: userProfile.country || '',
            profilePic: null,
            profilePicPreview: userProfile.profileImage || '',
            profileBanner: null,
            profileBannerPreview: userProfile.bannerImage || '',
            bio: userProfile.bio || ''
          });
          setOriginalUsername(userProfile.username || '');
          setUsernameStatus('unchanged');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setErrors({ general: 'Failed to load profile data. Please try again.' });
      }
    };

    loadUserData();
  }, [user]);

  // Function to check username availability with debouncing
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    // If username is unchanged from original, mark as unchanged
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
        
        // Only update if this is still the latest request
        if (currentRequestId === usernameRequestIdRef.current) {
          const newStatus = exists ? 'taken' : 'available';
          setUsernameStatus(newStatus);
        }
      } catch (error) {
        console.error('Error checking username:', error);
        if (currentRequestId === usernameRequestIdRef.current) {
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
    if (!file) return;
    
    // Clear any previous file-related errors
    const fileErrorKey = field === 'profilePic' ? 'profilePic' : 'profileBanner';
    if (errors[fileErrorKey]) {
      setErrors(prev => ({ ...prev, [fileErrorKey]: '' }));
    }
    
    // File size validation (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      const fileName = field === 'profilePic' ? 'Profile picture' : 'Banner image';
      setErrors(prev => ({
        ...prev,
        [fileErrorKey]: `${fileName} must be smaller than 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`
      }));
      return;
    }
    
    // File type validation
    if (!file.type.startsWith('image/')) {
      const fileName = field === 'profilePic' ? 'Profile picture' : 'Banner image';
      setErrors(prev => ({
        ...prev,
        [fileErrorKey]: `${fileName} must be an image file (JPG, PNG, GIF, etc.)`
      }));
      return;
    }
    
    // File is valid, proceed with reading
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        [field]: file,
        [previewField]: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const scrollToField = (fieldName) => {
    const fieldRefs = {
      username: usernameRef,
      displayName: displayNameRef,
      country: countryRef
    };
    
    const fieldRef = fieldRefs[fieldName];
    if (fieldRef?.current) {
      fieldRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      // Focus the field after scrolling
      setTimeout(() => {
        fieldRef.current.focus();
      }, 300);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let firstErrorField = null;

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      if (!firstErrorField) firstErrorField = 'username';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      if (!firstErrorField) firstErrorField = 'username';
    } else if (!/^[a-z0-9]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain lowercase letters and numbers';
      if (!firstErrorField) firstErrorField = 'username';
    } else if (usernameStatus === 'taken') {
      newErrors.username = 'This username is already taken';
      if (!firstErrorField) firstErrorField = 'username';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
      if (!firstErrorField) firstErrorField = 'displayName';
    }

    if (!formData.country) {
      newErrors.country = 'Please select your country';
      if (!firstErrorField) firstErrorField = 'country';
    }

    setErrors(newErrors);
    
    // If there are errors, scroll to the first error field
    if (firstErrorField) {
      setTimeout(() => scrollToField(firstErrorField), 100);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare profile data
      const profileData = {
        username: formData.username,
        displayName: formData.displayName,
        country: formData.country,
        bio: formData.bio,
      };

      // Handle profile image (in a real app, you'd upload to storage service)
      if (formData.profilePicPreview && formData.profilePicPreview !== userData?.profileImage) {
        profileData.profileImage = formData.profilePicPreview;
      }

      // Handle banner image
      if (formData.profileBannerPreview && formData.profileBannerPreview !== userData?.bannerImage) {
        profileData.bannerImage = formData.profileBannerPreview;
      }

      const result = await updateUserProfile(userData.id, profileData);
      
      if (result.success) {
        // Refresh the user profile context to update sidebar
        if (profileContext?.refreshUserProfile) {
          await profileContext.refreshUserProfile();
        }
        // Navigate back to profile page
        router.push('/profile');
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (redirect will handle this)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Frame Logo */}
      <div className="absolute top-6 left-6 z-50 mb-8">
        <Link 
          href="/" 
          className={`${caveat.className} text-2xl md:text-3xl font-bold text-emerald-700 hover:text-emerald-800 transition-all duration-300 hover:scale-110`}
        >
          Frame
        </Link>
      </div>
      
      <div className="min-h-screen flex">
        {/* Main Content */}
        <div className="flex-1 w-full flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-16 xl:px-20 pt-20">
          <div className="mx-auto w-full max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8 bg-yellow-400 px-6 py-6 rounded-t-xl">
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700">Profile Settings</h1>
              <p className="text-base sm:text-lg text-gray-700 mt-2">Update your profile information</p>
            </div>
            
            {/* Content Card with Shadow Border */}
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 px-6 py-8 shadow-sm">
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {errors.general}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Banner - moved to top */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Profile Banner
                  </label>
                  <div className="space-y-3">
                    <div className="w-full h-72 rounded-lg overflow-hidden border-2 border-gray-200">
                      {formData.profileBannerPreview ? (
                        <img
                          src={formData.profileBannerPreview}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 text-white/70 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-white/70 text-sm font-medium">Recommended: 1200x320px</p>
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
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Change Banner Photo
                    </button>
                    {errors.profileBanner && (
                      <p className="text-red-600 text-sm mt-1">{errors.profileBanner}</p>
                    )}
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="md:col-span-1">
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
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                  {errors.profilePic && (
                    <p className="text-red-600 text-sm mt-1">{errors.profilePic}</p>
                  )}
                </div>

                {/* Display Name */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Display Name *
                  </label>
                  <input
                    ref={displayNameRef}
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 ${
                      errors.displayName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your name"
                  />
                  <p className="text-sm text-gray-700 mt-1">
                    This appears as your profile name
                  </p>
                  {errors.displayName && <p className="text-red-600 text-sm mt-1">{errors.displayName}</p>}
                </div>

                {/* Username */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <input
                      ref={usernameRef}
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 ${
                        errors.username ? 'border-red-300 bg-red-50' : 
                        usernameStatus === 'taken' ? 'border-red-300 bg-red-50' :
                        usernameStatus === 'available' ? 'border-emerald-300 bg-emerald-50' :
                        'border-gray-300'
                      }`}
                      placeholder="username"
                    />
                    {/* Username status indicator */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {usernameStatus === 'checking' && (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
                      )}
                      {(usernameStatus === 'available' || usernameStatus === 'unchanged') && (
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {usernameStatus === 'taken' && (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

                {/* Country */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Country *
                  </label>
                  <select
                    ref={countryRef}
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 cursor-pointer ${
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
                <div className="md:col-span-2">
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
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || usernameStatus === 'checking'}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 hover-zoom font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Saving...' : usernameStatus === 'checking' ? 'Checking username...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}