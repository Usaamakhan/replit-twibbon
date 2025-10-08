import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';

export async function GET(request) {
  try {
    await requireAdmin(request);
    
    const db = adminFirestore();
    
    // Fetch all campaigns
    const campaignsSnapshot = await db.collection('campaigns').get();
    const campaigns = campaignsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Fetch all users
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Fetch all reports
    const reportsSnapshot = await db.collection('reports').get();
    const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate campaign stats
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.moderationStatus === 'active').length;
    const underReviewCampaigns = campaigns.filter(c => c.moderationStatus === 'under-review').length;
    const removedCampaigns = campaigns.filter(c => c.moderationStatus === 'removed').length;
    
    // Calculate campaign type breakdown
    const frameCampaigns = campaigns.filter(c => c.type === 'frame').length;
    const backgroundCampaigns = campaigns.filter(c => c.type === 'background').length;
    
    // Calculate user stats
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role !== 'admin').length;
    const bannedUsers = users.filter(u => u.banned === true).length;
    
    // Calculate report stats
    const totalReports = reports.length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const reviewedReports = reports.filter(r => r.status === 'reviewed').length;
    const resolvedReports = reports.filter(r => r.status === 'resolved').length;
    const dismissedReports = reports.filter(r => r.status === 'dismissed').length;
    
    // Calculate resolution rate
    const resolvedOrDismissed = resolvedReports + dismissedReports;
    const resolutionRate = totalReports > 0 ? Math.round((resolvedOrDismissed / totalReports) * 100) : 0;
    
    // Calculate total supports across all campaigns
    const totalSupports = campaigns.reduce((sum, campaign) => sum + (campaign.supportersCount || 0), 0);
    
    // Calculate average supports per campaign
    const avgSupportsPerCampaign = totalCampaigns > 0 ? Math.round(totalSupports / totalCampaigns) : 0;
    
    // Get top reported campaigns
    const topReportedCampaigns = campaigns
      .filter(c => c.reportsCount > 0)
      .sort((a, b) => (b.reportsCount || 0) - (a.reportsCount || 0))
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        title: c.title,
        reportsCount: c.reportsCount || 0,
        moderationStatus: c.moderationStatus
      }));
    
    const stats = {
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        underReview: underReviewCampaigns,
        removed: removedCampaigns,
        frames: frameCampaigns,
        backgrounds: backgroundCampaigns,
      },
      users: {
        total: totalUsers,
        admins: adminUsers,
        regular: regularUsers,
        banned: bannedUsers,
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
        reviewed: reviewedReports,
        resolved: resolvedReports,
        dismissed: dismissedReports,
        resolutionRate: resolutionRate,
      },
      engagement: {
        totalSupports: totalSupports,
        avgSupportsPerCampaign: avgSupportsPerCampaign,
      },
      insights: {
        topReportedCampaigns: topReportedCampaigns,
      },
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
