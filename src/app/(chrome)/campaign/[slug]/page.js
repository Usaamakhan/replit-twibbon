"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCampaignBySlug, createReport } from '../../../../lib/firestore';
import { useCampaignSession } from '../../../../contexts/CampaignSessionContext';
import { useAuth } from '../../../../hooks/useAuth';
import LoadingSpinner from '../../../../components/LoadingSpinner';

export default function CampaignUploadPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug;
  const campaignSession = useCampaignSession();

  // State
  const [campaign, setCampaign] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef();

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const result = await getCampaignBySlug(slug);
        
        if (!result) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        setCampaign(result.campaign);
        setCreator(result.creator);
        
        // Store campaign and creator data in session
        campaignSession.setCampaignData(slug, result.campaign);
        campaignSession.setCreatorData(slug, result.creator);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setNotFound(true);
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [slug, campaignSession]);

  // Handle photo selection
  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setError('');
    setUploading(true);
    
    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Photo must be smaller than 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`);
      setUploading(false);
      return;
    }
    
    // File type validation
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PNG, JPG, or WEBP image');
      setUploading(false);
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      // Store in session
      campaignSession.setUserPhoto(slug, file, event.target.result);
      
      // Initialize adjustments
      campaignSession.setAdjustments(slug, { scale: 1.0, x: 0, y: 0 });
      
      // Redirect to adjust page
      router.push(`/campaign/${slug}/adjust`);
    };
    
    reader.onerror = () => {
      setError('Failed to read image file');
      setUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  // Report campaign
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportReason) {
      setError('Please select a reason for reporting');
      return;
    }
    
    setReportSubmitting(true);
    setError('');
    
    try {
      const reportData = {
        campaignId: campaign.id,
        campaignSlug: campaign.slug,
        reportedBy: user?.uid || 'anonymous',
        reason: reportReason,
        details: reportDetails
      };
      
      const result = await createReport(reportData);
      
      if (result.success) {
        setShowReportModal(false);
        setReportReason('');
        setReportDetails('');
        alert('Thank you for your report. We will review it shortly.');
      } else {
        setError(result.error || 'Failed to submit report');
      }
      
      setReportSubmitting(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
      setReportSubmitting(false);
    }
  };

  // Share functionality
  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = campaign.title + (campaign.description ? ` - ${campaign.description}` : '');
    
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Not found state
  if (notFound || !campaign) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
          <p className="text-gray-600 mb-8">This campaign doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/')}
            className="btn-base btn-primary px-6 py-3 font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex">
        {/* Main Content */}
        <div className="flex-1 w-full flex flex-col py-8 px-4 sm:px-6 lg:px-16 xl:px-20 pt-20">
          <div className="mx-auto w-full max-w-4xl">
            
            {/* Header */}
            <div className="text-center mb-8 bg-yellow-400 px-6 py-8 rounded-t-xl">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
              {campaign.description && (
                <p className="text-base sm:text-lg text-gray-800 mt-2">{campaign.description}</p>
              )}
              
              {/* Creator info */}
              {creator && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  {creator.profileImage && (
                    <img
                      src={creator.profileImage}
                      alt={creator.displayName}
                      className="w-10 h-10 rounded-full border-2 border-gray-900"
                    />
                  )}
                  <div className="text-left">
                    <p className="text-sm text-gray-900">
                      Created by{' '}
                      <button
                        onClick={() => router.push(`/u/${creator.username}`)}
                        className="font-semibold hover:underline"
                      >
                        {creator.displayName || creator.username}
                      </button>
                    </p>
                    <p className="text-xs text-gray-700">
                      {campaign.supportersCount || 0} {campaign.supportersCount === 1 ? 'support' : 'supports'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Content Card */}
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 px-6 py-8 shadow-sm">
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Campaign Preview */}
              <div className="mb-8">
                <div className="relative">
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full h-auto rounded-lg border-2 border-gray-300"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {campaign.type === 'frame' ? 'Frame' : 'Background'}
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Add Your Photo</h2>
                <p className="text-gray-600 text-center mb-6">
                  Upload your photo to create your personalized {campaign.type === 'frame' ? 'frame' : 'background'}
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handlePhotoSelect}
                  disabled={uploading}
                  className="hidden"
                  id="user-photo-input"
                />
                
                <label
                  htmlFor="user-photo-input"
                  className={`btn-base btn-primary w-full text-center py-4 cursor-pointer font-bold text-lg ${
                    uploading ? 'opacity-70 cursor-wait' : ''
                  }`}
                >
                  {uploading ? 'Loading...' : 'Choose Your Photo'}
                </label>
                
                <p className="text-sm text-gray-600 mt-3 text-center">
                  PNG, JPG, or WEBP (max 10MB)
                </p>
              </div>

              {/* Share & Report */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Share Campaign</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="btn-base bg-blue-400 hover:bg-blue-500 text-white py-2 text-sm font-medium"
                  >
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="btn-base bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-medium"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="btn-base bg-green-500 hover:bg-green-600 text-white py-2 text-sm font-medium"
                  >
                    WhatsApp
                  </button>
                </div>
                
                <button
                  onClick={() => setShowReportModal(true)}
                  className="btn-base bg-red-100 hover:bg-red-200 text-red-700 w-full py-2 text-sm font-medium"
                >
                  Report Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Campaign</h2>
            
            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="">Select a reason</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="spam">Spam</option>
                  <option value="copyright">Copyright Violation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                  placeholder="Provide more context about your report..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                    setReportDetails('');
                    setError('');
                  }}
                  className="btn-base btn-secondary flex-1 py-2 font-medium"
                  disabled={reportSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-base bg-red-500 hover:bg-red-600 text-white flex-1 py-2 font-medium"
                  disabled={reportSubmitting || !reportReason}
                >
                  {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
