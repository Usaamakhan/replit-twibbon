import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';

export async function GET(request) {
  try {
    await requireAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType') || 'all';
    const status = searchParams.get('status') || 'pending';
    const sortBy = searchParams.get('sortBy') || 'lastReportedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limitParam = searchParams.get('limit') || '10';
    const limitValue = parseInt(limitParam, 10);
    
    const db = adminFirestore();
    let summariesQuery = db.collection('reportSummary');
    
    // Filter by target type (campaign, user, or all)
    if (targetType !== 'all') {
      summariesQuery = summariesQuery.where('targetType', '==', targetType);
    }
    
    // Filter by status (pending, resolved, dismissed)
    if (status !== 'all') {
      summariesQuery = summariesQuery.where('status', '==', status);
    }
    
    // Add sorting
    summariesQuery = summariesQuery.orderBy(sortBy, sortOrder).limit(limitValue);
    
    const summariesSnapshot = await summariesQuery.get();
    
    const summaries = [];
    
    for (const doc of summariesSnapshot.docs) {
      const summaryData = { id: doc.id, ...doc.data() };
      
      // Fetch LIVE status from actual target document (campaign or user)
      if (summaryData.targetId) {
        const targetCollection = summaryData.targetType === 'campaign' ? 'campaigns' : 'users';
        const targetDoc = await db.collection(targetCollection).doc(summaryData.targetId).get();
        
        if (targetDoc.exists) {
          const targetData = targetDoc.data();
          
          // Update with LIVE moderation status
          if (summaryData.targetType === 'campaign') {
            summaryData.moderationStatus = targetData.moderationStatus || 'active';
            // Also update cached display data if changed
            summaryData.campaignTitle = targetData.title || summaryData.campaignTitle;
            summaryData.campaignImage = targetData.imageUrl || summaryData.campaignImage;
          } else {
            // For users, show both moderationStatus and accountStatus
            summaryData.moderationStatus = targetData.moderationStatus || 'active';
            summaryData.accountStatus = targetData.accountStatus || 'active';
            // Update cached display data
            summaryData.displayName = targetData.displayName || summaryData.displayName;
            summaryData.username = targetData.username || summaryData.username;
            summaryData.profileImage = targetData.profileImage || summaryData.profileImage;
          }
        }
      }
      
      // Add creator info for campaign reports
      if (summaryData.targetType === 'campaign' && summaryData.creatorId) {
        const creatorDoc = await db.collection('users').doc(summaryData.creatorId).get();
        if (creatorDoc.exists) {
          const creatorData = creatorDoc.data();
          summaryData.creator = {
            uid: creatorDoc.id,
            displayName: creatorData.displayName,
            username: creatorData.username,
            profileImage: creatorData.profileImage,
          };
        } else {
          summaryData.creator = {
            uid: summaryData.creatorId,
            displayName: '[Deleted User]',
            username: null,
            profileImage: null,
          };
        }
      }
      
      // Convert Firestore timestamps to ISO strings
      if (summaryData.firstReportedAt && summaryData.firstReportedAt.toDate) {
        summaryData.firstReportedAt = summaryData.firstReportedAt.toDate().toISOString();
      }
      if (summaryData.lastReportedAt && summaryData.lastReportedAt.toDate) {
        summaryData.lastReportedAt = summaryData.lastReportedAt.toDate().toISOString();
      }
      if (summaryData.createdAt && summaryData.createdAt.toDate) {
        summaryData.createdAt = summaryData.createdAt.toDate().toISOString();
      }
      if (summaryData.updatedAt && summaryData.updatedAt.toDate) {
        summaryData.updatedAt = summaryData.updatedAt.toDate().toISOString();
      }
      if (summaryData.resolvedAt && summaryData.resolvedAt.toDate) {
        summaryData.resolvedAt = summaryData.resolvedAt.toDate().toISOString();
      }
      
      summaries.push(summaryData);
    }
    
    return NextResponse.json({
      success: true,
      data: summaries,
      count: summaries.length,
    });
  } catch (error) {
    console.error('Error fetching grouped reports:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grouped reports' },
      { status: 500 }
    );
  }
}
