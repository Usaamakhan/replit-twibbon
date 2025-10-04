"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllCampaigns } from '../../../lib/firestore';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({});
  
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Discover Campaigns
          </h1>
          <p className="text-emerald-50 text-lg">
            Browse and use thousands of frames and backgrounds created by the community
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="all">All Types</option>
                <option value="frame">Frames Only</option>
                <option value="background">Backgrounds Only</option>
              </select>
            </div>

            {/* Time Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={filters.timePeriod}
                onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="createdAt">Most Recent</option>
                <option value="supportersCount">Most Popular</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-emerald-600 text-lg">{campaigns.length}</span>
                <span className="ml-1">campaigns found</span>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
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
              <Link
                key={campaign.id}
                href={`/campaign/${campaign.slug}`}
                className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Campaign Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {campaign.imageUrl ? (
                    <>
                      <Image
                        src={campaign.imageUrl}
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
                  <div className="absolute top-2 right-2">
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
                  {campaign.creator && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        {campaign.creator.profileImage ? (
                          <img
                            src={campaign.creator.profileImage}
                            alt={campaign.creator.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {campaign.creator.displayName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 truncate">
                        {campaign.creator.displayName}
                      </span>
                    </div>
                  )}
                  
                  {/* Supporters Count */}
                  <div className="flex items-center gap-1 text-emerald-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {campaign.supportersCount || 0} supports
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
