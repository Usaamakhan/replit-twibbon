"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCampaignSession } from '../../../../../contexts/CampaignSessionContext';
import { requireDownloadComplete } from '../../../../../utils/campaignRouteGuards';
import { composeImages } from '../../../../../utils/imageComposition';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

export default function CampaignResultPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const campaignSession = useCampaignSession();

  // State
  const [session, setSession] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [creator, setCreator] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [composedImageUrl, setComposedImageUrl] = useState('');
  const [redownloading, setRedownloading] = useState(false);

  const canvasRef = useRef(null);

  // Load session and check route guard
  useEffect(() => {
    const loadSession = async () => {
      const currentSession = campaignSession.getSession(slug);
      
      // Route guard: check if downloaded
      if (!requireDownloadComplete(currentSession, router, slug)) {
        return; // Will redirect
      }
      
      setSession(currentSession);
      setCampaign(currentSession.campaignData);
      setCreator(currentSession.creatorData);
      
      // Recreate File object from stored data
      if (currentSession.userPhotoPreview) {
        try {
          const response = await fetch(currentSession.userPhotoPreview);
          const blob = await response.blob();
          const file = new File([blob], currentSession.userPhoto?.name || 'photo.jpg', {
            type: currentSession.userPhoto?.type || 'image/jpeg'
          });
          setUserPhoto(file);
          
          // Compose image for display
          const { blob: composedBlob } = await composeImages(
            file,
            currentSession.campaignData.imageUrl,
            currentSession.adjustments || { scale: 1.0, x: 0, y: 0 },
            currentSession.campaignData.type
          );
          
          const url = URL.createObjectURL(composedBlob);
          setComposedImageUrl(url);
        } catch (error) {
          console.error('Error loading result:', error);
        }
      }
      
      setLoading(false);
    };
    
    loadSession();
    
    // Cleanup composed image URL on unmount
    return () => {
      if (composedImageUrl) {
        URL.revokeObjectURL(composedImageUrl);
      }
    };
  }, [slug, router]);

  // Start Over - clear session and go to page 1
  const handleStartOver = () => {
    campaignSession.clearSession(slug);
    router.push(`/campaign/${slug}`);
  };

  // Re-download
  const handleRedownload = async () => {
    if (!userPhoto || !campaign || !session) return;
    
    setRedownloading(true);
    
    try {
      const { blob } = await composeImages(
        userPhoto,
        campaign.imageUrl,
        session.adjustments || { scale: 1.0, x: 0, y: 0 },
        campaign.type
      );
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${campaign.slug}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error re-downloading:', error);
    } finally {
      setRedownloading(false);
    }
  };

  // Share functionality
  const handleShare = async (platform) => {
    const url = window.location.origin + `/campaign/${slug}`;
    const text = campaign ? `Check out ${campaign.title} on Frame Your Voice!` : 'Check out this campaign!';
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session || !campaign) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex">
        <div className="flex-1 w-full flex flex-col py-8 px-4 sm:px-6 lg:px-16 xl:px-20 pt-20">
          <div className="mx-auto w-full max-w-4xl">
            
            {/* Header */}
            <div className="text-center mb-8 bg-yellow-400 px-6 py-8 rounded-t-xl">
              <div className="mb-2">
                <span className="inline-block bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  ✓ Complete
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
                Your {campaign.type === 'frame' ? 'Frame' : 'Background'} is Ready!
              </h1>
              <p className="text-base sm:text-lg text-gray-800 mt-2">
                Download complete! Share your creation with the world.
              </p>
            </div>
            
            {/* Content Card */}
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 px-6 py-8 shadow-sm">
              
              {/* Result Image */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Your Final Image</h2>
                {composedImageUrl && (
                  <div className="relative">
                    <img
                      src={composedImageUrl}
                      alt="Your final result"
                      className="w-full h-auto rounded-lg border-2 border-gray-300"
                    />
                  </div>
                )}
              </div>

              {/* Download Again Button */}
              <div className="mb-8">
                <button
                  onClick={handleRedownload}
                  disabled={redownloading}
                  className={`btn-base btn-secondary w-full py-3 font-medium ${
                    redownloading ? 'opacity-70 cursor-wait' : ''
                  }`}
                >
                  {redownloading ? 'Downloading...' : 'Download Again'}
                </button>
              </div>

              {/* Share Section */}
              <div className="mb-8 border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Share Your Creation</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="btn-base bg-blue-400 hover:bg-blue-500 text-white py-3 text-sm font-medium"
                  >
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="btn-base bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-medium"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="btn-base bg-green-500 hover:bg-green-600 text-white py-3 text-sm font-medium"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Campaign Info */}
              {creator && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 text-center mb-2">Campaign by</p>
                  <div className="flex items-center justify-center gap-3">
                    {creator.profileImage && (
                      <img
                        src={creator.profileImage}
                        alt={creator.displayName}
                        className="w-10 h-10 rounded-full border-2 border-gray-300"
                      />
                    )}
                    <div className="text-left">
                      <button
                        onClick={() => router.push(`/u/${creator.username}`)}
                        className="font-semibold text-gray-900 hover:underline text-sm"
                      >
                        {creator.displayName || creator.username}
                      </button>
                      <p className="text-xs text-gray-600">
                        {campaign.supportersCount || 0} {campaign.supportersCount === 1 ? 'support' : 'supports'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Start Over Button */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={handleStartOver}
                  className="btn-base bg-gray-600 hover:bg-gray-700 text-white w-full py-3 font-medium"
                >
                  Create Another One
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Start over with a new photo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
