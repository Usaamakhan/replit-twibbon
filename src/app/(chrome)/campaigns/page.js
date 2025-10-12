"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllCampaigns } from '../../../lib/firestore';
import { getCampaignPreview, getProfileAvatar } from '../../../utils/imageTransform';
import { abbreviateNumber } from '../../../utils/validation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import FilterModal from '../../../components/FilterModal';
import ShareModal from '../../../components/ShareModal';
import ReportModal from '../../../components/ReportModal';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [shareModalData, setShareModalData] = useState(null);
  const [reportModalData, setReportModalData] = useState(null);
  
  const [filters, setFilters] = useState({
    type: 'all',
    country: null,
    timePeriod: 'all',
    sortBy: 'createdAt'
  });

  useEffect(() => {
    loadCampaigns();
  }, [filters]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const result = await getAllCampaigns(filters);
      setCampaigns(result);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

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

  const filterFields = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'frame', label: 'Frames Only' },
        { value: 'background', label: 'Backgrounds Only' }
      ]
    },
    {
      key: 'timePeriod',
      label: 'Time Period',
      options: [
        { value: 'all', label: 'All Time' },
        { value: '24h', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' }
      ]
    },
    {
      key: 'sortBy',
      label: 'Sort By',
      options: [
        { value: 'createdAt', label: 'Most Recent' },
        { value: 'supportersCount', label: 'Most Popular' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex">
        <div className="flex-1 w-full flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-16 xl:px-20 pt-20">
          <div className="mx-auto w-full max-w-6xl">
            {/* Header */}
            <div className="text-center mb-8 bg-yellow-400 px-6 py-6 rounded-t-xl">
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700">Discover Campaigns</h1>
              <p className="text-base sm:text-lg text-gray-700 mt-2">Browse and use thousands of frames and backgrounds created by the community</p>
            </div>
            
            {/* Content Card with Shadow Border */}
            <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 px-6 py-8 shadow-sm">
              {/* Filter Button */}
              <div className="mb-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-emerald-600 text-lg">{campaigns.length}</span>
                  <span className="ml-1">campaigns found</span>
                </div>
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="btn-base btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
              </div>

              {/* Campaigns Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <LoadingSpinner size="lg" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or check back later</p>
                  <Link
                    href="/create"
                    className="btn-base btn-primary inline-block px-6 py-3 font-medium"
                  >
                    Create First Campaign
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="group bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col relative"
                    >
                      <Link href={`/campaign/${campaign.slug}`} className="contents">
                        {/* Campaign Image */}
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
                                onLoad={() => setImageLoading(prev => ({ ...prev, [campaign.id]: false }))}
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
                          
                          {/* Type Badge */}
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-white/90 text-gray-800 rounded-md shadow-sm">
                              {campaign.type === 'frame' ? 'Frame' : 'Background'}
                            </span>
                          </div>
                        </div>

                        {/* Campaign Info */}
                        <div className="p-4 flex-grow">
                          <h3 className="text-gray-900 font-semibold text-base truncate mb-2">
                            {campaign.title}
                          </h3>
                          
                          {/* Creator Info */}
                          {campaign.creator && campaign.creator.username && (
                            <Link
                              href={`/u/${campaign.creator.username}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 mb-3 hover:bg-gray-50 -mx-1 px-1 py-1 rounded-md transition-colors duration-150"
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
                          
                          {/* Supports Count */}
                          <div className="flex items-center gap-1 text-emerald-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <span className="text-sm font-medium">
                              {abbreviateNumber(campaign.supportersCount || 0)} supports
                            </span>
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
                          className="p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors cursor-pointer shadow-sm"
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
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
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

                              <button
                                onClick={(e) => handleReportClick(e, campaign)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
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
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
        filterFields={filterFields}
      />

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
    </div>
  );
}
