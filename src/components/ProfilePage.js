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
import { getProfileAvatar, getProfileBanner } from '../utils/imageTransform';
import CampaignGallery from './CampaignGallery';

export default function ProfilePage({ isOwnProfile = false, username = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState({ supportsCount: 0, campaignsCount: 0 });
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
          
          // Load user's campaigns with safe defaults
          try {
            console.log('🔍 [ProfilePage] Loading campaigns for user:', {
              userId: profileUser.id,
              username: profileUser.username,
              isOwnProfile
            });
            
            const userCampaigns = await getUserCampaigns(profileUser.id);
            
            console.log('🔍 [ProfilePage] Campaigns loaded:', {
              count: userCampaigns?.length || 0,
              isArray: Array.isArray(userCampaigns),
              campaigns: userCampaigns
            });
            
            if (Array.isArray(userCampaigns)) {
              setCampaigns(userCampaigns);
              
              // Calculate total supports from all campaigns (guard against undefined/missing values)
              const totalSupports = userCampaigns.reduce((sum, campaign) => {
                const count = Number(campaign.supportersCount) || 0;
                return sum + count;
              }, 0);
              
              console.log('🔍 [ProfilePage] Total supports calculated:', totalSupports);
              
              // Get campaigns count from stats or use campaigns length
              try {
                const stats = await getUserStats(profileUser.id);
                console.log('🔍 [ProfilePage] User stats:', stats);
                
                setUserStats({
                  supportsCount: totalSupports,
                  campaignsCount: stats?.campaignsCount || userCampaigns.length
                });
              } catch (statError) {
                console.error('Error loading user stats:', statError);
                setUserStats({ 
                  supportsCount: totalSupports, 
                  campaignsCount: userCampaigns.length 
                });
              }
            } else {
              console.warn('🔍 [ProfilePage] userCampaigns is not an array:', typeof userCampaigns);
              setCampaigns([]);
              setUserStats({ supportsCount: 0, campaignsCount: 0 });
            }
          } catch (campaignError) {
            console.error('🔍 [ProfilePage] Error loading user campaigns:', campaignError);
            setCampaigns([]);
            setUserStats({ supportsCount: 0, campaignsCount: 0 });
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
            src={getProfileBanner(userData.bannerImage)}
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
        {/* Profile Info Row - No background box */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          {/* Left: Profile Info */}
          <div className="flex items-start gap-4">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {userData.profileImage && userData.profileImage.trim() ? (
                <img
                  src={getProfileAvatar(userData.profileImage)}
                  alt={userData.displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <span className="text-white text-xl sm:text-2xl font-bold">
                    {userData.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Name, Username, Bio, Edit Button */}
            <div className="flex-1 min-w-0">
              <h1 className={`font-bold text-gray-900 ${
                userData.displayName?.length <= 15 ? 'text-2xl sm:text-3xl' :
                userData.displayName?.length <= 25 ? 'text-xl sm:text-2xl' :
                userData.displayName?.length <= 35 ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              } break-words leading-tight`} title={userData.displayName}>
                {userData.displayName}
              </h1>
              <p className={`text-gray-500 font-medium ${
                userData.username?.length <= 20 ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
              } break-words mt-1`}>@{userData.username}</p>
              
              {userData.bio && (
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap mt-3 max-w-md">
                  {userData.bio}
                </p>
              )}
              
              {isOwnProfile && (
                <button 
                  onClick={() => router.push('/profile/edit')}
                  className="btn-base btn-primary mt-4 px-4 py-2 text-sm font-medium inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-3 lg:items-end">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{userStats.supportsCount}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Supporters</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{userStats.campaignsCount}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Campaigns</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-base sm:text-lg font-bold text-emerald-600">
                  {userData.createdAt ? 
                    new Date(userData.createdAt.seconds ? userData.createdAt.seconds * 1000 : userData.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric' 
                    }) : 
                    'Recently'
                  }
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Joined Since</div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Section - Full Width */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Campaigns</h2>
            {isOwnProfile && (
              <button 
                onClick={() => router.push('/create')}
                className="btn-base btn-primary px-4 py-2 text-sm font-medium"
              >
                Create Campaign
              </button>
            )}
          </div>

          <CampaignGallery 
            campaigns={campaigns} 
            loading={profileLoading}
            isOwnProfile={isOwnProfile}
          />
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
        {/* Profile Info Row Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          {/* Left: Profile Info Skeleton */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-7 sm:h-8 bg-gray-300 rounded w-40 sm:w-48 animate-pulse"></div>
              <div className="h-4 sm:h-5 bg-gray-300 rounded w-24 sm:w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-full max-w-md animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 max-w-md animate-pulse"></div>
            </div>
          </div>

          {/* Right: Stats Skeleton */}
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-3 lg:items-end">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-right">
                <div className="h-8 sm:h-9 bg-gray-300 rounded w-12 sm:w-16 ml-auto animate-pulse mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-300 rounded w-16 sm:w-20 ml-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaigns Section Skeleton */}
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
  );
}