"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCampaignSession } from '../../../../../contexts/CampaignSessionContext';
import { requirePhotoUpload } from '../../../../../utils/campaignRouteGuards';
import { updatePreview, calculateFitAdjustments, composeImages } from '../../../../../utils/imageComposition';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

export default function CampaignAdjustPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const campaignSession = useCampaignSession();

  // State
  const [session, setSession] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState({ scale: 1.0, x: 0, y: 0, rotation: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const canvasRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  // Load session and check route guard
  useEffect(() => {
    const loadSession = async () => {
      const currentSession = campaignSession.getSession(slug);
      
      // Route guard: check if photo uploaded
      if (!requirePhotoUpload(currentSession, router, slug)) {
        return; // Will redirect
      }
      
      setSession(currentSession);
      setCampaign(currentSession.campaignData);
      
      // Load adjustments from session or use defaults
      if (currentSession.adjustments) {
        setAdjustments(currentSession.adjustments);
      }
      
      // Recreate File object from stored data
      if (currentSession.userPhotoPreview) {
        try {
          const response = await fetch(currentSession.userPhotoPreview);
          const blob = await response.blob();
          const file = new File([blob], currentSession.userPhoto?.name || 'photo.jpg', {
            type: currentSession.userPhoto?.type || 'image/jpeg'
          });
          setUserPhoto(file);
        } catch (error) {
          console.error('Error loading photo:', error);
          setError('Failed to load photo. Please go back and upload again.');
        }
      }
      
      setLoading(false);
    };
    
    loadSession();
  }, [slug, router]);

  // Initialize canvas with campaign image
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

  // Debounced canvas update to prevent flickering
  const updateCanvas = useCallback(() => {
    if (!userPhoto || !campaign || !canvasRef.current) return;
    
    // Clear any pending updates
    if (updateTimeoutRef.current) {
      cancelAnimationFrame(updateTimeoutRef.current);
    }
    
    // Use requestAnimationFrame for smooth updates
    updateTimeoutRef.current = requestAnimationFrame(async () => {
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
    });
  }, [userPhoto, campaign, adjustments]);

  // Update preview when adjustments change
  useEffect(() => {
    updateCanvas();
    
    // Cleanup
    return () => {
      if (updateTimeoutRef.current) {
        cancelAnimationFrame(updateTimeoutRef.current);
      }
    };
  }, [updateCanvas]);

  // Save adjustments to session whenever they change
  useEffect(() => {
    if (!slug || !session) return;
    campaignSession.setAdjustments(slug, adjustments);
  }, [adjustments, slug, session]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    if (!userPhoto) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setAdjustments(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(10, prev.scale + delta))
    }));
  }, [userPhoto]);

  // Zoom controls
  const handleZoomIn = () => {
    setAdjustments(prev => ({
      ...prev,
      scale: Math.min(10, prev.scale + 0.2)
    }));
  };

  const handleZoomOut = () => {
    setAdjustments(prev => ({
      ...prev,
      scale: Math.max(0.1, prev.scale - 0.2)
    }));
  };

  // Rotation controls
  const handleRotateLeft = () => {
    setAdjustments(prev => ({
      ...prev,
      rotation: (prev.rotation - 15) % 360
    }));
  };

  const handleRotateRight = () => {
    setAdjustments(prev => ({
      ...prev,
      rotation: (prev.rotation + 15) % 360
    }));
  };

  // Zoom control via slider
  const handleZoomChange = (e) => {
    const scale = parseFloat(e.target.value);
    setAdjustments(prev => ({ ...prev, scale }));
  };

  // Rotation control via slider
  const handleRotationChange = (e) => {
    const rotation = parseInt(e.target.value);
    setAdjustments(prev => ({ ...prev, rotation }));
  };

  // Fit photo button
  const handleFitPhoto = async () => {
    if (!userPhoto || !canvasRef.current) return;
    
    try {
      const fitAdjustments = await calculateFitAdjustments(
        userPhoto,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setAdjustments({ ...fitAdjustments, rotation: adjustments.rotation });
    } catch (error) {
      console.error('Error fitting photo:', error);
    }
  };

  // Reset adjustments
  const handleResetAdjustments = () => {
    setAdjustments({ scale: 1.0, x: 0, y: 0, rotation: 0 });
  };

  // Drag handlers (unified pointer events)
  const handlePointerDown = (e) => {
    if (!userPhoto) return;
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.clientX || 0;
    const clientY = e.clientY || 0;
    setDragStart({ x: clientX - adjustments.x, y: clientY - adjustments.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.clientX || 0;
    const clientY = e.clientY || 0;
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

  // Change photo - go back to upload page
  const handleChangePhoto = () => {
    router.push(`/campaign/${slug}`);
  };

  // Download and proceed to result page
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
      
      // Track download via API
      try {
        await fetch('/api/campaigns/track-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: campaign.id })
        });
      } catch (trackError) {
        console.warn('Failed to track download:', trackError);
      }
      
      // Mark as downloaded in session
      campaignSession.markDownloaded(slug);
      
      // Redirect to result page
      router.push(`/campaign/${slug}/result`);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session || !campaign || !userPhoto) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex">
        <div className="flex-1 w-full flex flex-col py-8 px-4 sm:px-6 lg:px-8 pt-20">
          <div className="mx-auto w-full max-w-5xl">
            
            {/* Header */}
            <div className="text-center mb-8 bg-yellow-400 px-6 py-6 rounded-t-xl">
              <div className="mb-2">
                <span className="inline-block bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Step 2 of 3
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Adjust Your Photo</h1>
              <p className="text-sm sm:text-base text-gray-800">
                Drag, zoom, and rotate to fit perfectly
              </p>
            </div>
            
            {/* Content Card */}
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 px-4 sm:px-6 py-6 shadow-sm">
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                
                {/* Canvas Preview with Controls */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Preview</h2>
                  
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto bg-gray-100 rounded-lg border-2 border-gray-300 cursor-move"
                      style={{
                        touchAction: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        msUserSelect: 'none',
                        maxHeight: '500px',
                        objectFit: 'contain'
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                      onWheel={handleWheel}
                    />
                    
                    {/* Overlay Controls */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {/* Zoom Controls */}
                      <button
                        onClick={handleZoomIn}
                        className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
                        title="Zoom In"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <button
                        onClick={handleZoomOut}
                        className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
                        title="Zoom Out"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      
                      {/* Rotation Controls */}
                      <button
                        onClick={handleRotateLeft}
                        className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
                        title="Rotate Left"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                      <button
                        onClick={handleRotateRight}
                        className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
                        title="Rotate Right"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-3 text-center">
                    <strong>Tip:</strong> Drag to move • Scroll to zoom • Use buttons to rotate
                  </p>
                </div>

                {/* Adjustment Sliders */}
                <div className="space-y-4">
                  
                  {/* Zoom Slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zoom: {adjustments.scale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={adjustments.scale}
                      onChange={handleZoomChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Rotation Slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rotation: {adjustments.rotation}°
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={adjustments.rotation}
                      onChange={handleRotationChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleFitPhoto}
                    className="btn-base btn-secondary py-2 text-sm font-medium"
                  >
                    Fit to Frame
                  </button>
                  <button
                    onClick={handleResetAdjustments}
                    className="btn-base bg-gray-500 hover:bg-gray-600 text-white py-2 text-sm font-medium"
                  >
                    Reset All
                  </button>
                </div>

                <button
                  onClick={handleChangePhoto}
                  className="btn-base bg-gray-200 hover:bg-gray-300 text-gray-700 w-full py-2 text-sm font-medium"
                >
                  Change Photo
                </button>

                {/* Download Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className={`btn-base w-full py-4 font-bold text-lg transition-colors ${
                      downloading
                        ? 'btn-primary opacity-70 cursor-wait'
                        : 'btn-primary'
                    }`}
                  >
                    {downloading ? 'Downloading...' : 'Download Image'}
                  </button>
                  
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    High-quality PNG • Preserves transparency
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
