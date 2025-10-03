"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCampaignBySlug, createReport } from '../../../../lib/firestore';
import { composeImages, updatePreview, calculateFitAdjustments, downloadCanvas } from '../../../../utils/imageComposition';
import { useAuth } from '../../../../hooks/useAuth';
import LoadingSpinner from '../../../../components/LoadingSpinner';

export default function CampaignViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug;

  // State
  const [campaign, setCampaign] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // User photo state
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState('');
  
  // Canvas state
  const canvasRef = useRef(null);
  const [adjustments, setAdjustments] = useState({ scale: 1.0, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // UI state
  const [downloading, setDownloading] = useState(false);
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setNotFound(true);
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [slug]);

  // Update preview when user photo or adjustments change
  useEffect(() => {
    if (!userPhoto || !campaign || !canvasRef.current) return;
    
    const updateCanvasPreview = async () => {
      try {
        await updatePreview(
          canvasRef.current,
          userPhoto,
          campaign.imageUrl,
          adjustments,
          campaign.type
        );
      } catch (error) {
        console.error('Error updating preview:', error);
      }
    };
    
    updateCanvasPreview();
  }, [userPhoto, adjustments, campaign]);

  // Handle photo upload
  const handlePhotoSelect = async (file) => {
    if (!file) return;
    
    setError('');
    
    // File size validation (10MB limit for user photos)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Photo must be smaller than 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`);
      return;
    }
    
    // File type validation
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PNG, JPG, or WEBP image');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      setUserPhoto(file);
      setUserPhotoPreview(e.target.result);
      
      // Auto-fit the photo
      if (campaign) {
        try {
          const canvas = canvasRef.current;
          if (canvas) {
            const fitAdjustments = await calculateFitAdjustments(
              file,
              canvas.width || 1500,
              canvas.height || 1500
            );
            setAdjustments(fitAdjustments);
          }
        } catch (error) {
          console.error('Error calculating fit:', error);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setUserPhoto(null);
    setUserPhotoPreview('');
    setAdjustments({ scale: 1.0, x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Adjustment controls
  const handleZoomChange = (e) => {
    const scale = parseFloat(e.target.value);
    setAdjustments(prev => ({ ...prev, scale }));
  };

  const handleFitPhoto = async () => {
    if (!userPhoto || !canvasRef.current) return;
    
    try {
      const fitAdjustments = await calculateFitAdjustments(
        userPhoto,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setAdjustments(fitAdjustments);
    } catch (error) {
      console.error('Error fitting photo:', error);
    }
  };

  const handleResetAdjustments = () => {
    setAdjustments({ scale: 1.0, x: 0, y: 0 });
  };

  // Canvas dragging for repositioning
  const handleMouseDown = (e) => {
    if (!userPhoto) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - adjustments.x, y: e.clientY - adjustments.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setAdjustments(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile
  const handleTouchStart = (e) => {
    if (!userPhoto || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - adjustments.x, y: touch.clientY - adjustments.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setAdjustments(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Download composed image
  const handleDownload = async () => {
    if (!userPhoto || !campaign) return;
    
    setDownloading(true);
    setError('');
    
    try {
      // Compose final image
      const { blob } = await composeImages(
        userPhoto,
        campaign.imageUrl,
        adjustments,
        campaign.type
      );
      
      // Create download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${campaign.slug}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Track download/support via server-side API
      try {
        const trackResponse = await fetch('/api/campaigns/track-download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ campaignId: campaign.id })
        });
        
        if (!trackResponse.ok) {
          console.warn('Failed to track download, but download succeeded');
        }
      } catch (trackError) {
        console.warn('Error tracking download:', trackError);
      }
      
      setDownloading(false);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
      setDownloading(false);
    }
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
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({ title: campaign.title, text, url });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        }
        break;
      default:
        break;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-emerald-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Not found state
  if (notFound || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
          <p className="text-gray-600 mb-8">This campaign doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
          {campaign.description && (
            <p className="text-gray-800 text-lg">{campaign.description}</p>
          )}
          
          {/* Creator info */}
          {creator && (
            <div className="mt-4 flex items-center gap-3">
              {creator.photoURL && (
                <img
                  src={creator.photoURL}
                  alt={creator.displayName}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              )}
              <div>
                <p className="text-sm text-gray-800">
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
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Preview Canvas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
            
            {!userPhoto ? (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center p-6">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-600 mb-2">Upload your photo to see the preview</p>
                  <p className="text-sm text-gray-500">Your photo will be composed with the campaign image</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className={`w-full h-auto bg-gray-100 rounded-lg ${userPhoto ? 'cursor-move' : ''}`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg pointer-events-none" />
                )}
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="space-y-6">
            {/* Upload photo */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Photo</h2>
              
              {!userPhoto ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => e.target.files[0] && handlePhotoSelect(e.target.files[0])}
                    className="hidden"
                    id="user-photo-input"
                  />
                  <label
                    htmlFor="user-photo-input"
                    className="block w-full py-4 px-6 bg-emerald-500 text-white text-center rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors font-semibold"
                  >
                    Upload Your Photo
                  </label>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    PNG, JPG, or WEBP (max 10MB)
                  </p>
                </div>
              ) : (
                <div>
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                    <img
                      src={userPhotoPreview}
                      alt="Your photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={handleRemovePhoto}
                    className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
              
              {error && (
                <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
              )}
            </div>

            {/* Adjustment controls */}
            {userPhoto && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Adjust Your Photo</h2>
                
                {/* Zoom slider */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoom: {adjustments.scale.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={adjustments.scale}
                    onChange={handleZoomChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Position info */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Drag on the preview</strong> to reposition your photo
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleFitPhoto}
                    className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Fit to Frame
                  </button>
                  <button
                    onClick={handleResetAdjustments}
                    className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Download button */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <button
                onClick={handleDownload}
                disabled={!userPhoto || downloading}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-colors ${
                  !userPhoto
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : downloading
                    ? 'bg-emerald-400 text-white cursor-wait'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {downloading ? 'Downloading...' : !userPhoto ? 'Upload Photo to Download' : 'Download Image'}
              </button>
              
              {userPhoto && (
                <p className="text-xs text-gray-600 mt-2 text-center">
                  High-quality PNG • Preserves transparency
                </p>
              )}
            </div>

            {/* Share & Report */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Share</h3>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex-1 py-2 px-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex-1 py-2 px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  WhatsApp
                </button>
              </div>
              
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Report Campaign
              </button>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="spam">Spam</option>
                  <option value="copyright">Copyright violation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide more information about why you're reporting this campaign..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                />
              </div>
              
              {error && (
                <p className="text-red-600 text-sm mb-4">{error}</p>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                    setReportDetails('');
                    setError('');
                  }}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={reportSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
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
