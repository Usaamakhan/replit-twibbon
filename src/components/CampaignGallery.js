"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCampaignPreview, getProfileAvatar } from '../utils/imageTransform';
import { abbreviateNumber } from '../utils/validation';
import { useAuth } from '@/hooks/useAuth';
import ShareModal from './ShareModal';
import ReportModal from './ReportModal';
import ConfirmationModal from './ConfirmationModal';

export default function CampaignGallery({ 
  campaigns, 
  loading = false, 
  isOwnProfile = false, 
  showReportOption = false,
  showCreatorInfo = false,
  onCampaignDeleted
}) {
  const { user } = useAuth();
  const [imageLoading, setImageLoading] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [shareModalData, setShareModalData] = useState(null);
  const [reportModalData, setReportModalData] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [CampaignGallery] Render:', {
      campaignsCount: campaigns?.length || 0,
      loading,
      isOwnProfile,
      showCreatorInfo,
      campaigns
    });
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-base font-semibold text-gray-900 mb-1.5">
            {isOwnProfile ? "You haven't created any campaigns yet" : "No campaigns yet"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isOwnProfile 
              ? "Start creating your first frame or background campaign to share with the world!"
              : "This user hasn't published any campaigns yet."}
          </p>
          {isOwnProfile && (
            <Link
              href="/create"
              className="btn-base btn-primary inline-block px-4 py-2 text-sm font-medium"
            >
              Create Campaign
            </Link>
          )}
        </div>
      </div>
    );
  }

  const handleShareClick = (e, campaign) => {
    e.preventDefault();
    e.stopPropagation();
    const campaignUrl = `${window.location.origin}/campaign/${campaign.slug}`;
    setShareModalData({
      type: 'campaign',
      url: campaignUrl,
      title: campaign.title,
      subtitle: campaign.type === 'frame' ? 'Frame' : 'Background',
      image: campaign.imageUrl,
    });
    setOpenMenuId(null);
  };

  const handleReportClick = (e, campaign) => {
    e.preventDefault();
    e.stopPropagation();
    setReportModalData({
      campaignId: campaign.id,
      campaignSlug: campaign.slug,
    });
    setOpenMenuId(null);
  };

  const handleDeleteClick = (e, campaign) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmation(campaign);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation || !user) return;

    setIsDeleting(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/campaigns/${deleteConfirmation.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete campaign');
      }

      // Show success state
      setDeleteSuccess(true);

      if (onCampaignDeleted) {
        onCampaignDeleted(deleteConfirmation.id);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccessClose = () => {
    setDeleteSuccess(false);
    setDeleteConfirmation(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative"
          >
            <Link href={`/campaign/${campaign.slug}`} className="contents">
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {campaign.imageUrl ? (
                  <>
                    <Image
                      src={getCampaignPreview(campaign.imageUrl)}
                      alt={campaign.title}
                      fill
                      className={`object-cover transition-all duration-300 ${
                        imageLoading[campaign.id] !== false ? 'opacity-0' : 'opacity-100 group-hover:scale-105'
                      }`}
                      onLoadingComplete={() => setImageLoading(prev => ({ ...prev, [campaign.id]: false }))}
                      onError={() => setImageLoading(prev => ({ ...prev, [campaign.id]: false }))}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      unoptimized
                    />
                    {imageLoading[campaign.id] !== false && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <svg
                      className="h-12 w-12 text-gray-400"
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
                  </div>
                )}
                
                {campaign.type && (
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-white/90 text-gray-800 rounded-md shadow-sm backdrop-blur-sm">
                      {campaign.type === 'frame' ? 'Frame' : 'Background'}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-grow">
                <h3 className="text-gray-900 font-semibold text-base truncate mb-2">
                  {campaign.title}
                </h3>
                
                {/* Creator Info - Show based on showCreatorInfo prop */}
                {showCreatorInfo && campaign.creator && campaign.creator.username && (
                  <Link
                    href={`/u/${campaign.creator.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 mb-2 hover:bg-gray-50 -mx-1 px-1 py-1 rounded-md transition-colors duration-150"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                      {campaign.creator.profileImage ? (
                        <img
                          src={getProfileAvatar(campaign.creator.profileImage)}
                          alt={campaign.creator.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs font-bold">
                          {campaign.creator.displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 truncate hover:text-emerald-600 transition-colors duration-150">
                      {campaign.creator.displayName}
                    </span>
                  </Link>
                )}
                
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <svg
                    className="h-4 w-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{abbreviateNumber(campaign.supportersCount || 0)} {campaign.supportersCount === 1 ? 'support' : 'supports'}</span>
                </div>
              </div>
            </Link>

            {/* 3-Dot Menu Button */}
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === campaign.id ? null : campaign.id);
                }}
                className="p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors cursor-pointer shadow-sm backdrop-blur-sm"
                aria-label="Campaign options"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {openMenuId === campaign.id && (
                <>
                  {/* Backdrop to close menu when clicking outside */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenuId(null);
                    }}
                  />

                  {/* Menu Items */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={(e) => handleShareClick(e, campaign)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2 cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share Campaign
                    </button>
                    
                    {isOwnProfile && (
                      <button
                        onClick={(e) => handleDeleteClick(e, campaign)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-2 cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete Campaign
                      </button>
                    )}
                    
                    {showReportOption && (
                      <button
                        onClick={(e) => handleReportClick(e, campaign)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-2 cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Report Campaign
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={!!shareModalData}
        onClose={() => setShareModalData(null)}
        type={shareModalData?.type}
        url={shareModalData?.url}
        title={shareModalData?.title}
        subtitle={shareModalData?.subtitle}
        image={shareModalData?.image}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={!!reportModalData}
        onClose={() => setReportModalData(null)}
        type="campaign"
        campaignId={reportModalData?.campaignId}
        campaignSlug={reportModalData?.campaignSlug}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation && !deleteSuccess}
        onClose={() => !isDeleting && setDeleteConfirmation(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${deleteConfirmation?.title}"? This action cannot be undone. All related images and data will be permanently removed.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Campaign"}
        cancelText="Cancel"
        type="danger"
      />

      {/* Delete Success Modal */}
      {deleteSuccess && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
            onClick={handleSuccessClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white rounded-lg max-w-md w-full p-6 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Campaign Deleted</h3>
                <p className="text-gray-600 mb-6">
                  Your campaign has been successfully deleted.
                </p>
                <button
                  onClick={handleSuccessClose}
                  className="btn-base btn-primary px-8 py-2 font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
