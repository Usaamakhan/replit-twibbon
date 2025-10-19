import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';

export async function GET(request) {
  try {
    await requireAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    const type = searchParams.get('type');
    const campaignId = searchParams.get('campaignId');
    const limitParam = searchParams.get('limit') || '50';
    const limitValue = parseInt(limitParam, 10);
    
    const db = adminFirestore();
    let reportsQuery = db.collection('reports');
    
    if (status && status !== 'all') {
      reportsQuery = reportsQuery.where('status', '==', status);
    }
    
    if (reason && reason !== 'all') {
      reportsQuery = reportsQuery.where('reason', '==', reason);
    }
    
    if (type && type !== 'all') {
      reportsQuery = reportsQuery.where('type', '==', type);
    }
    
    if (campaignId) {
      reportsQuery = reportsQuery.where('campaignId', '==', campaignId);
    }
    
    reportsQuery = reportsQuery.orderBy('createdAt', 'desc').limit(limitValue);
    
    const reportsSnapshot = await reportsQuery.get();
    
    const reports = [];
    
    for (const doc of reportsSnapshot.docs) {
      const reportData = { id: doc.id, ...doc.data() };
      
      if (reportData.campaignId) {
        const campaignDoc = await db.collection('campaigns').doc(reportData.campaignId).get();
        if (campaignDoc.exists) {
          const campaignData = campaignDoc.data();
          reportData.campaign = {
            id: campaignDoc.id,
            title: campaignData.title,
            imageUrl: campaignData.imageUrl,
            type: campaignData.type,
            moderationStatus: campaignData.moderationStatus,
            slug: campaignData.slug,
          };
          
          if (campaignData.creatorId) {
            const creatorDoc = await db.collection('users').doc(campaignData.creatorId).get();
            if (creatorDoc.exists) {
              const creatorData = creatorDoc.data();
              reportData.campaign.creator = {
                uid: creatorDoc.id,
                displayName: creatorData.displayName,
                username: creatorData.username,
                profileImage: creatorData.profileImage,
              };
            }
          }
        } else {
          reportData.campaignDeleted = true;
        }
      }
      
      if (reportData.reportedUserId) {
        const userDoc = await db.collection('users').doc(reportData.reportedUserId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          reportData.reportedUser = {
            uid: userDoc.id,
            displayName: userData.displayName,
            username: userData.username,
            profileImage: userData.profileImage,
            moderationStatus: userData.moderationStatus || 'active',
            reportsCount: userData.reportsCount || 0,
          };
        }
      }
      
      if (reportData.reportedBy && reportData.reportedBy !== 'anonymous') {
        const reporterDoc = await db.collection('users').doc(reportData.reportedBy).get();
        if (reporterDoc.exists) {
          const reporterData = reporterDoc.data();
          reportData.reporter = {
            uid: reporterDoc.id,
            displayName: reporterData.displayName,
            username: reporterData.username,
          };
        }
      }
      
      if (reportData.createdAt && reportData.createdAt.toDate) {
        reportData.createdAt = reportData.createdAt.toDate().toISOString();
      }
      if (reportData.reviewedAt && reportData.reviewedAt.toDate) {
        reportData.reviewedAt = reportData.reviewedAt.toDate().toISOString();
      }
      
      reports.push(reportData);
    }
    
    return NextResponse.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
