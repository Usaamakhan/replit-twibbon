import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { sendFCMNotificationServer } from '@/utils/notifications/sendFCMNotificationServer';
import { getNotificationTemplate } from '@/utils/notifications/notificationTemplates';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { campaignId, campaignSlug, reportedBy, reason, details } = body;
    
    // Validate required fields
    if (!campaignId || !reason) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID and reason are required' },
        { status: 400 }
      );
    }
    
    // Validate reason is one of the allowed values
    const validReasons = ['inappropriate', 'spam', 'copyright', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report reason' },
        { status: 400 }
      );
    }
    
    // Get Firestore instance
    const db = adminFirestore();
    
    // Use Firestore transaction for atomic operations
    const reportRef = db.collection('reports').doc();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    
    await db.runTransaction(async (transaction) => {
      // Get the campaign
      const campaignDoc = await transaction.get(campaignRef);
      
      if (!campaignDoc.exists) {
        throw new Error('Campaign not found');
      }
      
      const campaignData = campaignDoc.data();
      const currentReportsCount = campaignData.reportsCount || 0;
      const newReportsCount = currentReportsCount + 1;
      
      // Create the report
      const reportData = {
        campaignId,
        campaignSlug: campaignSlug || '',
        reportedBy: reportedBy || 'anonymous',
        reason,
        details: details || '',
        status: 'pending',
        createdAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        action: null,
      };
      
      transaction.set(reportRef, reportData);
      
      // Update campaign
      const campaignUpdates = {
        reportsCount: newReportsCount,
        updatedAt: new Date(),
      };
      
      // Auto-flag for review if threshold reached (3+ reports)
      if (newReportsCount >= 3 && campaignData.moderationStatus === 'active') {
        campaignUpdates.moderationStatus = 'under-review-hidden';
        campaignUpdates.hiddenAt = new Date();
      }
      
      transaction.update(campaignRef, campaignUpdates);
      
      // Send notification if campaign is auto-hidden
      if (newReportsCount >= 3 && campaignData.moderationStatus === 'active' && campaignData.creatorId) {
        const notification = getNotificationTemplate('campaignUnderReview', {
          campaignTitle: campaignData.title || 'Your campaign'
        });
        
        await sendFCMNotificationServer({
          userId: campaignData.creatorId,
          title: notification.title,
          body: notification.body,
          actionUrl: notification.actionUrl,
          icon: notification.icon,
        }).catch(err => console.error('Failed to send notification:', err));
      }
    });
    
    return NextResponse.json(
      { success: true, reportId: reportRef.id },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error creating report:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to submit report. Please try again.' 
      },
      { status: 500 }
    );
  }
}
