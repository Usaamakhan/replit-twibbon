"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCampaignPreview } from '../utils/imageTransform';

export default function CampaignGallery({ campaigns, loading = false, isOwnProfile = false }) {
  const [imageLoading, setImageLoading] = useState({});

  console.log('🔍 [CampaignGallery] Render:', {
    campaignsCount: campaigns?.length || 0,
    loading,
    isOwnProfile,
    campaigns
  });

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {campaigns.map((campaign) => (
        <Link
          key={campaign.id}
          href={`/campaign/${campaign.slug}`}
          className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
        >
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
              <div className="absolute top-2 right-2">
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-white/90 text-gray-800 rounded-md shadow-sm">
                  {campaign.type === 'frame' ? 'Frame' : 'Background'}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 flex-grow">
            <h3 className="text-gray-900 font-semibold text-base truncate mb-2">
              {campaign.title}
            </h3>
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
              <span>{campaign.supportersCount || 0} {campaign.supportersCount === 1 ? 'support' : 'supports'}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
