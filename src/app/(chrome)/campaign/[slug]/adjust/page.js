"use client";

import { useState, useRef, useEffect } from 'react';
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
  const [adjustments, setAdjustments] = useState({ scale: 1.0, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const canvasRef = useRef(null);

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
  }, [slug, router, campaignSession]);

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

  // Update preview when photo or adjustments change
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

  // Save adjustments to session whenever they change
  useEffect(() => {
    if (!slug || !session) return;
    campaignSession.setAdjustments(slug, adjustments);
  }, [adjustments, slug, session, campaignSession]);

  // Zoom control
  const handleZoomChange = (e) => {
    const scale = parseFloat(e.target.value);
    setAdjustments(prev => ({ ...prev, scale }));
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
      setAdjustments(fitAdjustments);
    } catch (error) {
      console.error('Error fitting photo:', error);
    }
  };

  // Reset adjustments
  const handleResetAdjustments = () => {
    setAdjustments({ scale: 1.0, x: 0, y: 0 });
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
        <div className="flex-1 w-full flex flex-col py-8 px-4 sm:px-6 lg:px-16 xl:px-20 pt-20">
          <div className="mx-auto w-full max-w-6xl">
            
            {/* Header */}
            <div className="text-center mb-8 bg-yellow-400 px-6 py-8 rounded-t-xl">
              <div className="mb-2">
                <span className="inline-block bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Step 2 of 3
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Adjust Your Photo</h1>
              <p className="text-base sm:text-lg text-gray-800 mt-2">
                Position and resize your photo to fit perfectly
              </p>
            </div>
            
            {/* Content Card */}
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 px-6 py-8 shadow-sm">
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left: Canvas Preview */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
                  
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto bg-gray-100 rounded-lg border-2 border-gray-300 cursor-move"
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
                  </div>

                  <p className="text-xs text-gray-600 mt-3 text-center">
                    <strong>Tip:</strong> Drag on the preview to reposition your photo
                  </p>
                </div>

                {/* Right: Controls */}
                <div className="space-y-6">
                  
                  {/* Zoom Control */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Zoom</h2>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scale: {adjustments.scale.toFixed(2)}x
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

                  {/* Action Buttons */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="flex gap-3 mb-3">
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
                    <button
                      onClick={handleChangePhoto}
                      className="btn-base bg-gray-200 hover:bg-gray-300 text-gray-700 w-full py-2 text-sm font-medium"
                    >
                      Change Photo
                    </button>
                  </div>

                  {/* Download Button */}
                  <div>
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
    </div>
  );
}
