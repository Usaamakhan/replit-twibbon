"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  getUserProfile, 
  getUserProfileByUsername, 
  getUserStats,
  getUserFrames 
} from '../lib/firestore';
import ProfileEditModal from './ProfileEditModal';

export default function ProfilePage({ isOwnProfile = false, username = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState({ supportersCount: 0, campaignsCount: 0 });
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // If viewing own profile, redirect to login if not authenticated
    if (isOwnProfile && !loading && !user) {
      router.push('/');
      return;
    }

    const loadProfileData = async () => {
      setProfileLoading(true);
      setError(null);
      
      try {
        let profileUser = null;
        
        if (isOwnProfile && user) {
          // Load current user's profile
          profileUser = await getUserProfile(user.uid);
          if (!profileUser) {
            // Create fallback profile data for new users
            profileUser = {
              id: user.uid,
              displayName: user.displayName || user.email || 'User',
              username: user.email?.split('@')[0] || 'user',
              email: user.email,
              photoURL: user.photoURL,
              bio: '',
              profileImage: user.photoURL || 'https://via.placeholder.com/120x120/059669/FFFFFF?text=U',
              bannerImage: 'https://via.placeholder.com/1200x300/10B981/FFFFFF?text=Banner',
              supportersCount: 0,
              campaignsCount: 0,
              createdAt: new Date()
            };
          }
        } else if (username) {
          // Load profile by username
          profileUser = await getUserProfileByUsername(username);
          if (!profileUser) {
            setError('User not found');
            setProfileLoading(false);
            return;
          }
        }

        if (profileUser) {
          setUserData(profileUser);
          
          // Load user statistics with safe defaults
          try {
            const stats = await getUserStats(profileUser.id);
            setUserStats({
              supportersCount: stats?.supportersCount || 0,
              campaignsCount: stats?.campaignsCount || 0
            });
          } catch (statError) {
            console.error('Error loading user stats:', statError);
            setUserStats({ supportersCount: 0, campaignsCount: 0 });
          }
          
          // Load user's campaigns/frames with safe defaults
          try {
            const userFrames = await getUserFrames(profileUser.id);
            if (Array.isArray(userFrames)) {
              setCampaigns(userFrames.map(frame => ({
                id: frame.id,
                title: frame.title || 'Untitled Campaign',
                thumbnail: frame.frameImageUrl || 'https://via.placeholder.com/300x200/059669/FFFFFF?text=Frame',
                supportersCount: frame.usageCount || 0
              })));
            } else {
              setCampaigns([]);
            }
          } catch (frameError) {
            console.error('Error loading user frames:', frameError);
            setCampaigns([]);
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        setError('Failed to load profile data');
      } finally {
        setProfileLoading(false);
      }
    };

    if (!loading) {
      loadProfileData();
    }
  }, [user, loading, isOwnProfile, username, router]);

  if (loading || profileLoading) {
    return <ProfileSkeleton />;
  }

  if (isOwnProfile && !user) {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{error}</h3>
          <p className="text-gray-600 mb-6">The profile you're looking for could not be found.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative h-72 bg-gradient-to-r from-emerald-500 to-emerald-600 overflow-hidden">
        {userData.bannerImage && userData.bannerImage.trim() ? (
          <img
            src={userData.bannerImage}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 pb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Side - Profile Info */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {userData.profileImage && userData.profileImage.trim() ? (
                      <img
                        src={userData.profileImage}
                        alt={userData.displayName}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {userData.displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    {isOwnProfile && (
                      <button className="absolute bottom-2 right-2 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Name and Username */}
                  <div className="text-center mt-4">
                    <h1 className="text-2xl font-bold text-gray-900">{userData.displayName}</h1>
                    <p className="text-emerald-600 font-medium">@{userData.username}</p>
                  </div>
                  
                  {/* Bio */}
                  <div className="mt-4 w-full">
                    <p className="text-gray-600 text-center leading-relaxed">
                      {userData.bio}
                    </p>
                  </div>
                  
                  {isOwnProfile && (
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="mt-4 w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Stats and Content */}
            <div className="lg:w-2/3">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-emerald-600">{userStats.supportersCount}</div>
                  <div className="text-gray-600 font-medium">Supporters</div>
                  <div className="text-sm text-gray-500 mt-1">People who used frames</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-emerald-600">{userStats.campaignsCount}</div>
                  <div className="text-gray-600 font-medium">Campaigns</div>
                  <div className="text-sm text-gray-500 mt-1">Frames created</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {userData.createdAt ? new Date(userData.createdAt.seconds ? userData.createdAt.seconds * 1000 : userData.createdAt).getFullYear() : new Date().getFullYear()}
                  </div>
                  <div className="text-gray-600 font-medium">Joined Since</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {userData.createdAt ? 
                      new Date(userData.createdAt.seconds ? userData.createdAt.seconds * 1000 : userData.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      }) : 
                      'Recently'
                    }
                  </div>
                </div>
              </div>

              {/* Campaigns Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
                  {isOwnProfile && (
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                      Create Campaign
                    </button>
                  )}
                </div>

                {/* Campaigns Grid or Empty State */}
                {campaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="group cursor-pointer">
                        <div className="relative overflow-hidden rounded-xl bg-gray-100">
                          <img
                            src={campaign.thumbnail}
                            alt={campaign.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <h3 className="font-bold text-lg">{campaign.title}</h3>
                            <p className="text-sm">{campaign.supportersCount} supporters</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Campaigns Yet</h3>
                    <p className="text-gray-600 mb-6">Create Campaigns, and share to Frame</p>
                    {isOwnProfile && (
                      <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                        Create Your First Campaign
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Edit Modal */}
      {isOwnProfile && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userData={userData}
          onUpdate={(updatedData) => {
            setUserData(updatedData);
            // Navigate to new username URL if username was changed
            if (updatedData.username !== userData.username) {
              router.push(`/${updatedData.username}`);
            }
          }}
        />
      )}
    </div>
  );
}

// Loading skeleton component
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Skeleton */}
      <div className="h-72 bg-gray-300 animate-pulse"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 pb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Side Skeleton */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="mt-4 space-y-2">
                    <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="mt-4 w-full space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Skeleton */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="h-8 bg-gray-300 rounded w-16 mx-auto animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-20 mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="h-8 bg-gray-300 rounded w-32 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-300 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}