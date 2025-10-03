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

  // Initialize canvas with campaign image when component loads
  useEffect(() => {
    if (!campaign || !canvasRef.current) return;
    
    const initializeCanvas = async () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
      };
      img.src = campaign.imageUrl;
    };
    
    initializeCanvas();
  }, [campaign]);

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
    
    // Redraw campaign image only
    if (campaign && canvasRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = campaign.imageUrl;
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

  // Unified pointer events for mouse and touch
  const handlePointerDown = (e) => {
    if (!userPhoto) return;
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setDragStart({ x: clientX - adjustments.x, y: clientY - adjustments.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;
    setAdjustments(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      e.preventDefault();
    }
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
          <div className="mx-auto w-full max-w-6xl">
            
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left: Preview Canvas */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
                  
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className={`w-full h-auto bg-gray-100 rounded-lg border-2 border-gray-300 ${
                        userPhoto ? 'cursor-move' : ''
                      }`}
                      style={{
                        touchAction: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        msUserSelect: 'none'
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                    />
                    {!userPhoto && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center p-6 bg-black/60 rounded-lg backdrop-blur-sm">
                          <svg
                            className="mx-auto h-12 w-12 text-white mb-3"
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
                          <p className="text-white font-medium text-sm">Upload your photo to see it here</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {userPhoto && (
                    <p className="text-xs text-gray-600 mt-3 text-center">
                      <strong>Tip:</strong> Drag on the preview to reposition your photo
                    </p>
                  )}
                </div>

                {/* Right: Controls */}
                <div className="space-y-6">
                  
                  {/* Upload Section */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {userPhoto ? 'Change Photo' : 'Choose Your Photo'}
                    </h2>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => e.target.files[0] && handlePhotoSelect(e.target.files[0])}
                      className="hidden"
                      id="user-photo-input"
                    />
                    
                    {!userPhoto ? (
                      <div>
                        <label
                          htmlFor="user-photo-input"
                          className="btn-base btn-primary w-full text-center py-4 cursor-pointer font-semibold text-lg"
                        >
                          Upload Your Photo
                        </label>
                        <p className="text-sm text-gray-600 mt-3 text-center">
                          PNG, JPG, or WEBP (max 10MB)
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <label
                          htmlFor="user-photo-input"
                          className="btn-base btn-secondary flex-1 text-center py-3 cursor-pointer font-medium"
                        >
                          Change Photo
                        </label>
                        <button
                          onClick={handleRemovePhoto}
                          className="btn-base bg-red-500 hover:bg-red-600 text-white flex-1 py-3 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Adjustment controls */}
                  {userPhoto && (
                    <div>
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

                      {/* Action buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleFitPhoto}
                          className="btn-base btn-secondary flex-1 py-2 text-sm font-medium"
                        >
                          Fit to Frame
                        </button>
                        <button
                          onClick={handleResetAdjustments}
                          className="btn-base bg-gray-500 hover:bg-gray-600 text-white flex-1 py-2 text-sm font-medium"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Download button */}
                  <div>
                    <button
                      onClick={handleDownload}
                      disabled={!userPhoto || downloading}
                      className={`btn-base w-full py-4 font-bold text-lg transition-colors ${
                        !userPhoto
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : downloading
                          ? 'btn-primary opacity-70 cursor-wait'
                          : 'btn-primary'
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
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Share Campaign</h3>
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
                  placeholder="Provide more information..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                />
              </div>
              
              {error && (
                <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
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
                  className="btn-base btn-secondary flex-1 py-2 font-medium"
                  disabled={reportSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-base bg-red-500 hover:bg-red-600 text-white flex-1 py-2 font-medium"
                  disabled={reportSubmitting}
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
