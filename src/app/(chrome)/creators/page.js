"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTopCreators } from '../../../lib/firestore';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function CreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    country: null,
    timePeriod: 'all'
  });

  useEffect(() => {
    loadCreators();
  }, [filters]);

  const loadCreators = async () => {
    setLoading(true);
    try {
      const result = await getTopCreators(filters);
      setCreators(result);
    } catch (error) {
      console.error('Error loading creators:', error);
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
            Top Creators
          </h1>
          <p className="text-emerald-50 text-lg">
            Discover creators with the most supported campaigns
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            {/* Placeholder for future filters */}
            <div className="sm:col-span-2"></div>
          </div>
        </div>

        {/* Creators List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : creators.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No creators found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or check back later</p>
            <Link
              href="/create"
              className="btn-base btn-primary inline-block px-6 py-3 font-medium"
            >
              Become a Creator
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-emerald-50 font-semibold text-sm">
                <div className="col-span-1">Rank</div>
                <div className="col-span-8">Creator</div>
                <div className="col-span-3 text-center">Total Supports</div>
              </div>
            </div>

            {/* Creators List */}
            <div className="divide-y divide-gray-200">
              {creators.map((creator, index) => (
                <Link
                  key={creator.id}
                  href={`/u/${creator.username}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Rank */}
                    <div className="col-span-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Creator Info */}
                    <div className="col-span-8 flex items-center gap-3 min-w-0">
                      {/* Profile Image */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        {creator.profileImage ? (
                          <img
                            src={creator.profileImage}
                            alt={creator.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-lg font-bold">
                            {creator.displayName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      
                      {/* Name and Username */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {creator.displayName}
                        </h3>
                        <p className="text-sm text-emerald-600 truncate">
                          @{creator.username}
                        </p>
                      </div>
                    </div>

                    {/* Total Supports */}
                    <div className="col-span-3 text-center">
                      <div className="font-bold text-emerald-600 text-lg">
                        {creator.totalSupports || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        supports
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 mb-1">How are creators ranked?</h3>
              <p className="text-sm text-emerald-800 leading-relaxed">
                Creators are ranked by their total supports (downloads) across all campaigns. The more people use your campaigns, the higher you'll rank. Create amazing frames and backgrounds to climb the leaderboard!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
