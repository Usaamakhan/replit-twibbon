import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { sendInAppNotification } from '@/utils/notifications/sendInAppNotification';
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
    const summaryId = `campaign-${campaignId}`;
    const summaryRef = db.collection('reportSummary').doc(summaryId);
    
    await db.runTransaction(async (transaction) => {
      // ALL READS MUST COME FIRST (Firestore requirement)
      const campaignDoc = await transaction.get(campaignRef);
      const summaryDoc = await transaction.get(summaryRef);
      
      if (!campaignDoc.exists) {
        throw new Error('Campaign not found');
      }
      
      const campaignData = campaignDoc.data();
      const currentReportsCount = campaignData.reportsCount || 0;
      const newReportsCount = currentReportsCount + 1;
      
      // Create the report
      const reportData = {
        type: 'campaign',
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
      
      // Update or create report summary
      const now = new Date();
      
      if (summaryDoc.exists) {
        // Update existing summary
        const currentSummary = summaryDoc.data();
        const summaryUpdates = {
          lastReportedAt: now,
          updatedAt: now,
        };
        
        // If previously resolved/dismissed, reset counter and status to start fresh
        if (currentSummary.status === 'resolved' || currentSummary.status === 'dismissed') {
          summaryUpdates.status = 'pending';
          summaryUpdates.reportCount = 1;
          summaryUpdates.firstReportedAt = now;
        } else {
          // Still pending, increment counter
          summaryUpdates.reportCount = (currentSummary.reportCount || 0) + 1;
        }
        
        transaction.update(summaryRef, summaryUpdates);
      } else {
        // Create new summary
        transaction.set(summaryRef, {
          targetId: campaignId,
          targetType: 'campaign',
          reportCount: 1,
          firstReportedAt: now,
          lastReportedAt: now,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
          // Display data for quick access
          campaignTitle: campaignData.title || 'Untitled Campaign',
          campaignImage: campaignData.imageUrl || '',
          campaignSlug: campaignData.slug || '',
          campaignType: campaignData.type || '',
          creatorId: campaignData.creatorId || '',
          moderationStatus: campaignData.moderationStatus || 'active',
        });
      }
      
      // Send notification if campaign is auto-hidden
      if (newReportsCount >= 3 && campaignData.moderationStatus === 'active' && campaignData.creatorId) {
        const notification = getNotificationTemplate('campaignUnderReview', {
          campaignTitle: campaignData.title || 'Your campaign'
        });
        
        await sendInAppNotification({
          userId: campaignData.creatorId,
          title: notification.title,
          body: notification.body,
          actionUrl: notification.actionUrl,
          icon: notification.icon,
          type: notification.type || 'campaign-under-review',
          metadata: {
            campaignId,
            reason,
          }
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
