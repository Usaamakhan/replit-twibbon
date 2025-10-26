import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';

export async function GET(request) {
  try {
    await requireAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const targetType = searchParams.get('type');
    const campaignId = searchParams.get('campaignId');
    const limitParam = searchParams.get('limit') || '50';
    const limitValue = parseInt(limitParam, 10);
    
    const db = adminFirestore();
    let summariesQuery = db.collection('reportSummary');
    
    if (status && status !== 'all') {
      summariesQuery = summariesQuery.where('status', '==', status);
    }
    
    if (targetType && targetType !== 'all') {
      summariesQuery = summariesQuery.where('targetType', '==', targetType);
    }
    
    if (campaignId) {
      const summaryId = `campaign-${campaignId}`;
      summariesQuery = summariesQuery.where('__name__', '==', summaryId);
    }
    
    summariesQuery = summariesQuery.orderBy('lastReportedAt', 'desc').limit(limitValue);
    
    const summariesSnapshot = await summariesQuery.get();
    
    const summaries = [];
    
    for (const doc of summariesSnapshot.docs) {
      const summaryData = { id: doc.id, ...doc.data() };
      
      if (summaryData.targetId) {
        const targetCollection = summaryData.targetType === 'campaign' ? 'campaigns' : 'users';
        const targetDoc = await db.collection(targetCollection).doc(summaryData.targetId).get();
        
        if (targetDoc.exists) {
          const targetData = targetDoc.data();
          
          if (summaryData.targetType === 'campaign') {
            summaryData.moderationStatus = targetData.moderationStatus || 'active';
            summaryData.campaignTitle = targetData.title || summaryData.campaignTitle;
            summaryData.campaignImage = targetData.imageUrl || summaryData.campaignImage;
            summaryData.campaignSlug = targetData.slug || summaryData.campaignSlug;
            
            if (summaryData.creatorId) {
              const creatorDoc = await db.collection('users').doc(summaryData.creatorId).get();
              if (creatorDoc.exists) {
                const creatorData = creatorDoc.data();
                summaryData.creator = {
                  uid: creatorDoc.id,
                  displayName: creatorData.displayName,
                  username: creatorData.username,
                  profileImage: creatorData.profileImage,
                };
              }
            }
          } else {
            summaryData.accountStatus = targetData.accountStatus || 'active';
            summaryData.displayName = targetData.displayName || summaryData.displayName;
            summaryData.username = targetData.username || summaryData.username;
            summaryData.profileImage = targetData.profileImage || summaryData.profileImage;
          }
        } else {
          summaryData.targetDeleted = true;
          if (summaryData.targetType === 'campaign') {
            summaryData.moderationStatus = 'deleted';
          } else {
            summaryData.accountStatus = 'deleted';
          }
        }
      }
      
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
      
      summaries.push(summaryData);
    }
    
    return NextResponse.json({
      success: true,
      data: summaries,
      count: summaries.length,
    });
  } catch (error) {
    console.error('Error fetching report summaries:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    // Handle Firestore index errors (FAILED_PRECONDITION)
    if (error.code === 9 || error.message.includes('index') || error.message.includes('FAILED_PRECONDITION')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Firestore indexes are still building. Please wait a few minutes and try again. If the issue persists, check Firebase Console for index status.',
          indexError: true
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report summaries' },
      { status: 500 }
    );
  }
}
