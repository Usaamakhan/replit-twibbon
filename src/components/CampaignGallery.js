"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CampaignGallery({ campaigns, loading = false, isOwnProfile = false }) {
  const [imageLoading, setImageLoading] = useState({});

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
      <div className="text-center py-16 px-4">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-6"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isOwnProfile ? "You haven't created any campaigns yet" : "No campaigns yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {isOwnProfile 
              ? "Start creating your first frame or background campaign to share with the world!"
              : "This user hasn't published any campaigns yet."}
          </p>
          {isOwnProfile && (
            <Link
              href="/create"
              className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
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
          className="group relative aspect-square bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="relative w-full h-full">
            {campaign.imageUrl ? (
              <>
                <Image
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  fill
                  className={`object-cover transition-all duration-300 ${
                    imageLoading[campaign.id] !== false ? 'opacity-0' : 'opacity-100 group-hover:scale-105'
                  }`}
                  onLoadingComplete={() => setImageLoading(prev => ({ ...prev, [campaign.id]: false }))}
                  onError={() => setImageLoading(prev => ({ ...prev, [campaign.id]: false }))}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
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
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-12">
            <h3 className="text-white font-semibold text-lg truncate mb-1">
              {campaign.title}
            </h3>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <svg
                className="h-4 w-4"
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

          {campaign.type && (
            <div className="absolute top-2 right-2">
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-white/90 text-gray-800 rounded-md shadow-sm">
                {campaign.type === 'frame' ? 'Frame' : 'Background'}
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
