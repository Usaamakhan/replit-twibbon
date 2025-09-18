'use client';

import { useState, useRef } from 'react';
import { countries } from '../data/countries';
import { useAuth } from '../hooks/useAuth';

export default function WelcomePopup({ isOpen, onClose, onComplete }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form data state
  const [formData, setFormData] = useState({
    username: user?.displayName?.toLowerCase().replace(/[^a-z0-9]/g, '') || user?.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user123',
    displayName: user?.displayName || '',
    country: '',
    profilePic: null,
    profilePicPreview: user?.photoURL || '',
    profileBanner: null,
    profileBannerPreview: '',
    bio: ''
  });

  const profilePicRef = useRef();
  const profileBannerRef = useRef();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-z0-9]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain lowercase letters and numbers';
      }

      if (!formData.displayName.trim()) {
        newErrors.displayName = 'Display name is required';
      }

      if (!formData.country) {
        newErrors.country = 'Please select your country';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    }
  };

  const handleComplete = async () => {
    if (!validateStep(1)) return;

    setLoading(true);
    try {
      // Pass the form data to the parent component
      await onComplete(formData);
    } catch (error) {
      console.error('Error completing profile setup:', error);
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Twibbonize!</h2>
              <p className="text-gray-600 mt-1">Let's set up your profile to get started</p>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep} of 2
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Required Information */}
        {currentStep === 1 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Information</h3>
            
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <div className="space-y-6">
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
                      onClick={() => profilePicRef.current?.click()}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Choose Photo
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  A nice profile photo helps others recognize you and builds trust
                </p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                    errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="johndoe123"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be used for your profile URL: frame.com/u/{formData.username || 'username'}
                </p>
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                    errors.displayName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will appear as your profile name and be visible to other users
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
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
                <p className="text-sm text-gray-500 mt-1">
                  This helps us show relevant content and connect you with users from your region
                </p>
                {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleNext}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Optional Information */}
        {currentStep === 2 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Information</h3>
            <p className="text-gray-600 mb-6">You can skip these or add them later from your profile settings</p>

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
                    onClick={() => profileBannerRef.current?.click()}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Choose Banner Image
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  A banner image appears at the top of your profile and makes it more attractive
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                  rows="4"
                  placeholder="Tell others about yourself, your interests, or what you do..."
                />
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-500">
                    Share a bit about yourself - this appears on your profile page
                  </p>
                  <span className="text-sm text-gray-400">{formData.bio.length}/500</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Back
              </button>
              <div className="space-x-3">
                <button
                  onClick={onClose}
                  className="text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}