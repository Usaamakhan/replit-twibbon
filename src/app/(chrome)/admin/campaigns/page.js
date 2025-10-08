"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import CampaignModerationCard from "@/components/admin/CampaignModerationCard";

export default function AdminCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    moderationStatus: 'all',
    sortBy: 'createdAt',
  });

  const fetchCampaigns = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      const params = new URLSearchParams();
      if (filters.moderationStatus !== 'all') {
        params.append('moderationStatus', filters.moderationStatus);
      }
      params.append('sortBy', filters.sortBy);
      
      const response = await fetch(`/api/admin/campaigns?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      setCampaigns(data.data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user, filters]);

  const handleCampaignUpdate = (updatedCampaign, deleted = false) => {
    if (deleted) {
      setCampaigns(prevCampaigns =>
        prevCampaigns.filter(campaign => campaign.id !== updatedCampaign?.id)
      );
      fetchCampaigns();
    } else {
      setCampaigns(prevCampaigns =>
        prevCampaigns.map(campaign =>
          campaign.id === updatedCampaign.id ? { ...campaign, ...updatedCampaign } : campaign
        )
      );
      fetchCampaigns();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Moderation Status
            </label>
            <select
              id="status-filter"
              value={filters.moderationStatus}
              onChange={(e) => setFilters({ ...filters, moderationStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="under-review">Under Review</option>
              <option value="removed">Removed</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sort-filter"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="createdAt">Most Recent</option>
              <option value="reports">Most Reports</option>
              <option value="supporters">Most Supporters</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-600">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
          <p className="mt-1 text-sm text-gray-500">No campaigns match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignModerationCard
              key={campaign.id}
              campaign={campaign}
              onUpdate={handleCampaignUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
