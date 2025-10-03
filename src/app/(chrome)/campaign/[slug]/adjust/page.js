"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCampaignSession } from '../../../../../contexts/CampaignSessionContext';
import { requirePhotoUpload } from '../../../../../utils/campaignRouteGuards';
import { loadImage, composeImages } from '../../../../../utils/imageComposition';
import LoadingSpinner from '../../../../../components/LoadingSpinner';

export default function CampaignAdjustPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const campaignSession = useCampaignSession();

  const [session, setSession] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState({ scale: 1.0, x: 0, y: 0, rotation: 0 });
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const userPhotoImgRef = useRef(null);
  const campaignImgRef = useRef(null);
  const rafRef = useRef(null);
  
  const pointersRef = useRef(new Map());
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastPinchDistanceRef = useRef(null);
  const lastRotationAngleRef = useRef(null);
  const isRotatingRef = useRef(false);
  const rotationStartRef = useRef(0);

  useEffect(() => {
    const loadSession = async () => {
      const currentSession = campaignSession.getSession(slug);
      
      if (!requirePhotoUpload(currentSession, router, slug)) {
        return;
      }
      
      setSession(currentSession);
      setCampaign(currentSession.campaignData);
      
      if (currentSession.adjustments) {
        setAdjustments(currentSession.adjustments);
      }
      
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

  useEffect(() => {
    if (!campaign || !canvasRef.current) return;
    
    const initCanvas = async () => {
      try {
        const img = await loadImage(campaign.imageUrl);
        campaignImgRef.current = img;
        
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        
        const offscreen = document.createElement('canvas');
        offscreen.width = img.width;
        offscreen.height = img.height;
        offscreenCanvasRef.current = offscreen;
      } catch (error) {
        console.error('Error initializing canvas:', error);
      }
    };
    
    initCanvas();
  }, [campaign]);

  useEffect(() => {
    if (!userPhoto) return;
    
    const loadUserImage = async () => {
      try {
        const img = await loadImage(userPhoto);
        userPhotoImgRef.current = img;
      } catch (error) {
        console.error('Error loading user photo:', error);
      }
    };
    
    loadUserImage();
  }, [userPhoto]);

  const renderPreview = useCallback(() => {
    if (!offscreenCanvasRef.current || !canvasRef.current || !userPhotoImgRef.current || !campaignImgRef.current) {
      return;
    }

    const offscreen = offscreenCanvasRef.current;
    const display = canvasRef.current;
    const ctx = offscreen.getContext('2d', { alpha: true });
    
    if (!ctx) return;

    ctx.clearRect(0, 0, offscreen.width, offscreen.height);

    const { scale, x, y, rotation } = adjustments;
    const userImg = userPhotoImgRef.current;
    const campaignImg = campaignImgRef.current;

    ctx.save();
    const centerX = offscreen.width / 2;
    const centerY = offscreen.height / 2;
    
    ctx.translate(centerX + x, centerY + y);
    ctx.rotate((rotation * Math.PI) / 180);
    
    const scaledWidth = userImg.width * scale;
    const scaledHeight = userImg.height * scale;
    
    if (campaign.type === 'frame') {
      ctx.drawImage(userImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
      ctx.restore();
      ctx.drawImage(campaignImg, 0, 0, offscreen.width, offscreen.height);
    } else {
      ctx.restore();
      ctx.drawImage(campaignImg, 0, 0, offscreen.width, offscreen.height);
      ctx.save();
      ctx.translate(centerX + x, centerY + y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(userImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
      ctx.restore();
    }

    const displayCtx = display.getContext('2d', { alpha: true });
    if (displayCtx) {
      displayCtx.clearRect(0, 0, display.width, display.height);
      displayCtx.drawImage(offscreen, 0, 0);
    }
  }, [adjustments, campaign]);

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      renderPreview();
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [renderPreview]);

  useEffect(() => {
    if (!slug || !session) return;
    campaignSession.setAdjustments(slug, adjustments);
  }, [adjustments, slug, session]);

  const handleWheel = useCallback((e) => {
    if (!userPhoto) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setAdjustments(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(10, prev.scale + delta))
    }));
  }, [userPhoto]);

  const getPointerDistance = (p1, p2) => {
    const dx = p2.clientX - p1.clientX;
    const dy = p2.clientY - p1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getPointerAngle = (p1, p2) => {
    const dx = p2.clientX - p1.clientX;
    const dy = p2.clientY - p1.clientY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const handlePointerDown = (e) => {
    if (!userPhoto) return;
    e.preventDefault();
    
    pointersRef.current.set(e.pointerId, {
      clientX: e.clientX,
      clientY: e.clientY,
      button: e.button
    });

    if (pointersRef.current.size === 2) {
      const pointers = Array.from(pointersRef.current.values());
      lastPinchDistanceRef.current = getPointerDistance(pointers[0], pointers[1]);
      lastRotationAngleRef.current = getPointerAngle(pointers[0], pointers[1]);
      isDraggingRef.current = false;
    } else if (pointersRef.current.size === 1) {
      if (e.button === 2 || e.shiftKey) {
        isRotatingRef.current = true;
        rotationStartRef.current = e.clientX;
      } else {
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX - adjustments.x, y: e.clientY - adjustments.y };
      }
    }
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    
    if (!pointersRef.current.has(e.pointerId)) return;
    
    pointersRef.current.set(e.pointerId, {
      clientX: e.clientX,
      clientY: e.clientY,
      button: e.button
    });

    if (pointersRef.current.size === 2) {
      const pointers = Array.from(pointersRef.current.values());
      const currentDistance = getPointerDistance(pointers[0], pointers[1]);
      const currentAngle = getPointerAngle(pointers[0], pointers[1]);

      if (lastPinchDistanceRef.current !== null) {
        const scaleDelta = (currentDistance - lastPinchDistanceRef.current) * 0.01;
        setAdjustments(prev => ({
          ...prev,
          scale: Math.max(0.1, Math.min(10, prev.scale + scaleDelta))
        }));
      }

      if (lastRotationAngleRef.current !== null) {
        const angleDelta = currentAngle - lastRotationAngleRef.current;
        setAdjustments(prev => ({
          ...prev,
          rotation: (prev.rotation + angleDelta) % 360
        }));
      }

      lastPinchDistanceRef.current = currentDistance;
      lastRotationAngleRef.current = currentAngle;
      
    } else if (pointersRef.current.size === 1) {
      if (isRotatingRef.current) {
        const deltaX = e.clientX - rotationStartRef.current;
        const rotationDelta = deltaX * 0.5;
        setAdjustments(prev => ({
          ...prev,
          rotation: (prev.rotation + rotationDelta) % 360
        }));
        rotationStartRef.current = e.clientX;
      } else if (isDraggingRef.current) {
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        setAdjustments(prev => ({ ...prev, x: newX, y: newY }));
      }
    }
  };

  const handlePointerUp = (e) => {
    pointersRef.current.delete(e.pointerId);
    
    if (pointersRef.current.size < 2) {
      lastPinchDistanceRef.current = null;
      lastRotationAngleRef.current = null;
    }
    
    if (pointersRef.current.size === 0) {
      isDraggingRef.current = false;
      isRotatingRef.current = false;
    }
  };

  const handleZoomChange = (e) => {
    const scale = parseFloat(e.target.value);
    setAdjustments(prev => ({ ...prev, scale }));
  };

  const handleRotationChange = (e) => {
    const rotation = parseInt(e.target.value);
    setAdjustments(prev => ({ ...prev, rotation }));
  };

  const handleFitPhoto = async () => {
    if (!userPhotoImgRef.current || !canvasRef.current) return;
    
    const img = userPhotoImgRef.current;
    const canvas = canvasRef.current;
    const scaleX = canvas.width / img.width;
    const scaleY = canvas.height / img.height;
    const scale = Math.min(scaleX, scaleY);
    
    setAdjustments({ scale, x: 0, y: 0, rotation: adjustments.rotation });
  };

  const handleResetAdjustments = () => {
    setAdjustments({ scale: 1.0, x: 0, y: 0, rotation: 0 });
  };

  const handleChangePhoto = () => {
    router.push(`/campaign/${slug}`);
  };

  const handleDownload = async () => {
    if (!userPhoto || !campaign) return;
    
    setDownloading(true);
    setError('');
    
    try {
      const { blob } = await composeImages(
        userPhoto,
        campaign.imageUrl,
        adjustments,
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
      
      try {
        await fetch('/api/campaigns/track-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: campaign.id })
        });
      } catch (trackError) {
        console.warn('Failed to track download:', trackError);
      }
      
      campaignSession.markDownloaded(slug);
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
            
            <div className="text-center mb-6 bg-yellow-400 px-6 py-5 rounded-t-xl">
              <div className="mb-2">
                <span className="inline-block bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Step 2 of 3
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Adjust Your Photo</h1>
              <p className="text-sm text-gray-800">
                Drag to move • Scroll to zoom • Two fingers to rotate
              </p>
            </div>
            
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 shadow-sm">
              
              {error && (
                <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] gap-6 p-4 sm:p-6">
                
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-gray-900">Preview</h2>
                  
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto bg-gray-100 rounded-lg border-2 border-gray-300 cursor-move"
                      style={{
                        touchAction: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        maxHeight: '500px',
                        objectFit: 'contain'
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                      onWheel={handleWheel}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>

                  <p className="text-xs text-gray-600 text-center">
                    <strong>Desktop:</strong> Drag to move • Scroll to zoom • Right-click drag to rotate<br />
                    <strong>Touch:</strong> Drag to move • Pinch to zoom • Two fingers to rotate
                  </p>
                </div>

                <div className="space-y-5">
                  
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Transform</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Zoom
                          </label>
                          <span className="text-sm text-gray-600">{adjustments.scale.toFixed(1)}x</span>
                        </div>
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

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Rotation
                          </label>
                          <span className="text-sm text-gray-600">{adjustments.rotation}°</span>
                        </div>
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
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
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
                  </div>

                  <button
                    onClick={handleChangePhoto}
                    className="btn-base bg-gray-200 hover:bg-gray-300 text-gray-700 w-full py-2 text-sm font-medium"
                  >
                    Change Photo
                  </button>

                  <div className="pt-3 border-t border-gray-200">
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
