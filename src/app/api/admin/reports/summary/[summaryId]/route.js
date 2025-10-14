import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { sendInAppNotification } from '@/utils/notifications/sendInAppNotification';
import { getNotificationTemplate } from '@/utils/notifications/notificationTemplates';

export async function PATCH(request, { params }) {
  try {
    await requireAdmin(request);
    
    const { summaryId } = params;
    const { status, action } = await request.json();
    
    if (!summaryId || !status || !action) {
      return NextResponse.json(
        { success: false, error: 'Summary ID, status, and action are required' },
        { status: 400 }
      );
    }
    
    const db = adminFirestore();
    const summaryRef = db.collection('reportSummary').doc(summaryId);
    
    // Get the summary
    const summaryDoc = await summaryRef.get();
    
    if (!summaryDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Summary not found' },
        { status: 404 }
      );
    }
    
    const summaryData = summaryDoc.data();
    const { targetId, targetType } = summaryData;
    
    // Get all pending reports for this target
    let reportsQuery = db.collection('reports').where('status', '==', 'pending');
    
    if (targetType === 'campaign') {
      reportsQuery = reportsQuery.where('campaignId', '==', targetId);
    } else if (targetType === 'user') {
      reportsQuery = reportsQuery.where('reportedUserId', '==', targetId);
    }
    
    const reportsSnapshot = await reportsQuery.get();
    
    // Use transaction to update everything atomically
    await db.runTransaction(async (transaction) => {
      const targetRef = targetType === 'campaign' 
        ? db.collection('campaigns').doc(targetId)
        : db.collection('users').doc(targetId);
      
      const targetDoc = await transaction.get(targetRef);
      
      if (!targetDoc.exists) {
        throw new Error(`${targetType} not found`);
      }
      
      const targetData = targetDoc.data();
      const now = new Date();
      
      // Update all reports
      reportsSnapshot.docs.forEach(reportDoc => {
        transaction.update(reportDoc.ref, {
          status,
          action,
          reviewedAt: now,
          reviewedBy: request.headers.get('x-user-id') || 'admin',
        });
      });
      
      // Update the target based on action
      const targetUpdates = {
        updatedAt: now,
      };
      
      if (action === 'no-action') {
        // Dismiss - restore to active
        targetUpdates.reportsCount = 0;
        if (targetType === 'campaign') {
          targetUpdates.moderationStatus = 'active';
          targetUpdates.hiddenAt = null;
        } else {
          targetUpdates.moderationStatus = 'active';
          targetUpdates.hiddenAt = null;
        }
      } else if (action === 'warned') {
        // Warning issued - create warning record (keep current status)
        const warningRef = db.collection('warnings').doc();
        transaction.set(warningRef, {
          userId: targetType === 'campaign' ? targetData.creatorId : targetId,
          targetType,
          targetId,
          reportId: summaryId,
          reason: 'Multiple reports received',
          issuedBy: request.headers.get('x-user-id') || 'admin',
          issuedAt: now,
          acknowledged: false,
        });
      } else if (action === 'removed') {
        // Remove/Ban
        if (targetType === 'campaign') {
          targetUpdates.moderationStatus = 'removed-temporary';
          targetUpdates.removedAt = now;
          targetUpdates.removalReason = 'Multiple reports received';
          targetUpdates.appealDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
          targetUpdates.appealCount = 0;
        } else {
          targetUpdates.accountStatus = 'banned-temporary';
          targetUpdates.bannedAt = now;
          targetUpdates.banReason = 'Multiple reports received';
          targetUpdates.appealDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        }
      }
      
      transaction.update(targetRef, targetUpdates);
      
      // Update summary
      transaction.update(summaryRef, {
        status: action === 'no-action' ? 'dismissed' : 'resolved',
        pendingReportCount: 0,
        updatedAt: now,
      });
    });
    
    // Send notification after transaction completes
    try {
      const userId = targetType === 'campaign' ? summaryData.creatorId : targetId;
      
      if (action === 'no-action') {
        const notification = getNotificationTemplate(
          targetType === 'campaign' ? 'campaignRestored' : 'profileRestored',
          { campaignTitle: summaryData.campaignTitle }
        );
        
        await sendInAppNotification({
          userId,
          title: notification.title,
          body: notification.body,
          actionUrl: notification.actionUrl,
          icon: notification.icon,
          type: notification.type,
        });
      } else if (action === 'warned') {
        const notification = getNotificationTemplate('warningIssued');
        
        await sendInAppNotification({
          userId,
          title: notification.title,
          body: notification.body,
          actionUrl: notification.actionUrl,
          icon: notification.icon,
          type: notification.type,
        });
      } else if (action === 'removed') {
        const notification = getNotificationTemplate(
          targetType === 'campaign' ? 'campaignRemoved' : 'accountBanned',
          { campaignTitle: summaryData.campaignTitle }
        );
        
        await sendInAppNotification({
          userId,
          title: notification.title,
          body: notification.body,
          actionUrl: notification.actionUrl,
          icon: notification.icon,
          type: notification.type,
        });
      }
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully ${action === 'no-action' ? 'dismissed' : action === 'warned' ? 'warned' : 'removed'} ${targetType}`,
    });
  } catch (error) {
    console.error('Error updating grouped reports:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update reports' },
      { status: 500 }
    );
  }
}
