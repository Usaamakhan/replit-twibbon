"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  getUserProfile, 
  getUserProfileByUsername, 
  getUserStats,
  getUserCampaigns 
} from '../lib/firestore';

export default function ProfilePage({ isOwnProfile = false, username = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState({ supportersCount: 0, campaignsCount: 0 });
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);

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
          
          // Load user's campaigns with safe defaults
          try {
            const userCampaigns = await getUserCampaigns(profileUser.id);
            if (Array.isArray(userCampaigns)) {
              setCampaigns(userCampaigns.map(campaign => ({
                id: campaign.id,
                title: campaign.title || 'Untitled Campaign',
                thumbnail: campaign.frameImageUrl || 'https://via.placeholder.com/300x200/059669/FFFFFF?text=Campaign',
                supportersCount: campaign.usageCount || 0
              })));
            } else {
              setCampaigns([]);
            }
          } catch (campaignError) {
            console.error('Error loading user campaigns:', campaignError);
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
            className="btn-base btn-primary px-6 py-3 font-medium"
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
      <div className="relative w-full aspect-[3/1] bg-gradient-to-r from-emerald-500 to-emerald-600 overflow-hidden">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
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
                  </div>
                  
                  {/* Name and Username */}
                  <div className="text-center mt-4">
                    <h1 className={`font-bold text-gray-900 ${
                      userData.displayName?.length <= 15 ? 'text-2xl' :
                      userData.displayName?.length <= 25 ? 'text-xl' :
                      userData.displayName?.length <= 35 ? 'text-lg' : 'text-base'
                    } break-words max-w-full leading-tight`} title={userData.displayName}>
                      {userData.displayName}
                    </h1>
                    <p className={`text-emerald-600 font-medium ${
                      userData.username?.length <= 20 ? 'text-base' : 'text-sm'
                    } break-words`}>@{userData.username}</p>
                  </div>
                  
                  {/* Bio */}
                  <div className="mt-4 w-full">
                    <p className="text-gray-600 text-center leading-relaxed whitespace-pre-wrap">
                      {userData.bio}
                    </p>
                  </div>
                  
                  {isOwnProfile && (
                    <button 
                      onClick={() => router.push('/profile/edit')}
                      className="btn-base btn-primary mt-4 w-full py-2 px-4 font-medium"
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
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600">{userStats.supportersCount}</div>
                  <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">Supporters</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600">{userStats.campaignsCount}</div>
                  <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">Campaigns</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 text-center">
                  <div className="text-sm sm:text-lg lg:text-xl font-bold text-emerald-600">
                    {userData.createdAt ? 
                      new Date(userData.createdAt.seconds ? userData.createdAt.seconds * 1000 : userData.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric' 
                      }) : 
                      'Recently'
                    }
                  </div>
                  <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">Joined since</div>
                </div>
              </div>

              {/* Campaigns Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Campaigns</h2>
                  {isOwnProfile && (
                    <button className="btn-base btn-primary px-3 py-1.5 text-sm font-medium">
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
                      <button className="btn-base btn-primary px-4 py-2 text-sm font-medium">
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
      
    </div>
  );
}

// Loading skeleton component
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Skeleton */}
      <div className="h-48 sm:h-56 md:h-64 lg:h-80 bg-gray-300 animate-pulse"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
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
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
                    <div className="h-6 sm:h-8 bg-gray-300 rounded w-12 sm:w-16 mx-auto animate-pulse mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-16 sm:w-20 mx-auto animate-pulse"></div>
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