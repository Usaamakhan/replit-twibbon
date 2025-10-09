import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { getNotificationTemplate } from '@/utils/notifications/notificationTemplates';
import { sendFCMNotification } from '@/utils/notifications/sendFCMNotification';

export async function PATCH(request, { params }) {
  try {
    const adminUser = await requireAdmin(request);
    
    const { reportId } = params;
    const body = await request.json();
    const { status, action } = body;
    
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be: pending, reviewed, resolved, or dismissed' },
        { status: 400 }
      );
    }
    
    const validActions = ['removed', 'warned', 'no-action'];
    if (action && !validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be: removed, warned, or no-action' },
        { status: 400 }
      );
    }
    
    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      );
    }
    
    const db = adminFirestore();
    const reportRef = db.collection('reports').doc(reportId);
    const reportDoc = await reportRef.get();
    
    if (!reportDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }
    
    const reportData = reportDoc.data();
    const reportType = reportData.type || 'campaign';
    
    await db.runTransaction(async (transaction) => {
      const reportUpdateData = {
        updatedAt: new Date(),
      };
      
      if (status) {
        reportUpdateData.status = status;
        reportUpdateData.reviewedAt = new Date();
        reportUpdateData.reviewedBy = adminUser.uid;
      }
      
      if (action) {
        reportUpdateData.action = action;
      }
      
      transaction.update(reportRef, reportUpdateData);
      
      if (reportType === 'campaign' && reportData.campaignId) {
        const campaignRef = db.collection('campaigns').doc(reportData.campaignId);
        const campaignDoc = await transaction.get(campaignRef);
        
        if (campaignDoc.exists) {
          const campaignData = campaignDoc.data();
          const campaignUpdates = {};
          
          if (action === 'no-action' && status === 'dismissed') {
            campaignUpdates.reportsCount = 0;
            campaignUpdates.moderationStatus = 'active';
            if (campaignData.hiddenAt) {
              campaignUpdates.hiddenAt = FieldValue.delete();
            }
            
            const allReportsQuery = db.collection('reports')
              .where('campaignId', '==', reportData.campaignId)
              .where('status', 'in', ['pending', 'reviewed', 'resolved']);
            const relatedReports = await transaction.get(allReportsQuery);
            relatedReports.forEach(doc => {
              transaction.update(doc.ref, { 
                status: 'dismissed', 
                action: 'no-action',
                reviewedAt: new Date(),
                reviewedBy: adminUser.uid
              });
            });
          }
          
          else if (action === 'warned') {
            const warningRef = db.collection('warnings').doc();
            const warningData = {
              userId: campaignData.creatorId,
              targetType: 'campaign',
              targetId: reportData.campaignId,
              reportId: reportId,
              reason: reportData.reason,
              details: reportData.details || '',
              issuedBy: adminUser.uid,
              issuedAt: new Date(),
              acknowledged: false,
            };
            transaction.set(warningRef, warningData);
          }
          
          else if (action === 'removed') {
            const appealDeadline = new Date();
            appealDeadline.setDate(appealDeadline.getDate() + 30);
            
            campaignUpdates.moderationStatus = 'removed-temporary';
            campaignUpdates.removedAt = new Date();
            campaignUpdates.removalReason = reportData.reason;
            campaignUpdates.appealDeadline = appealDeadline;
            campaignUpdates.appealCount = campaignData.appealCount || 0;
          }
          
          if (Object.keys(campaignUpdates).length > 0) {
            campaignUpdates.updatedAt = new Date();
            transaction.update(campaignRef, campaignUpdates);
          }
        }
      }
      
      else if (reportType === 'profile' && reportData.reportedUserId) {
        const userRef = db.collection('users').doc(reportData.reportedUserId);
        const userDoc = await transaction.get(userRef);
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          const userUpdates = {};
          
          if (action === 'no-action' && status === 'dismissed') {
            userUpdates.reportsCount = 0;
            userUpdates.moderationStatus = 'active';
            if (userData.hiddenAt) {
              userUpdates.hiddenAt = FieldValue.delete();
            }
            
            const allReportsQuery = db.collection('reports')
              .where('reportedUserId', '==', reportData.reportedUserId)
              .where('status', 'in', ['pending', 'reviewed', 'resolved']);
            const relatedReports = await transaction.get(allReportsQuery);
            relatedReports.forEach(doc => {
              transaction.update(doc.ref, { 
                status: 'dismissed', 
                action: 'no-action',
                reviewedAt: new Date(),
                reviewedBy: adminUser.uid
              });
            });
          }
          
          else if (action === 'warned') {
            const warningRef = db.collection('warnings').doc();
            const warningData = {
              userId: reportData.reportedUserId,
              targetType: 'profile',
              targetId: reportData.reportedUserId,
              reportId: reportId,
              reason: reportData.reason,
              details: reportData.details || '',
              issuedBy: adminUser.uid,
              issuedAt: new Date(),
              acknowledged: false,
            };
            transaction.set(warningRef, warningData);
          }
          
          else if (action === 'removed') {
            const appealDeadline = new Date();
            appealDeadline.setDate(appealDeadline.getDate() + 30);
            
            userUpdates.banned = true;
            userUpdates.bannedAt = new Date();
            userUpdates.banReason = reportData.reason;
            userUpdates.appealDeadline = appealDeadline;
          }
          
          if (Object.keys(userUpdates).length > 0) {
            userUpdates.updatedAt = new Date();
            transaction.update(userRef, userUpdates);
          }
        }
      }
    });
    
    const updatedDoc = await reportRef.get();
    const updatedReportData = updatedDoc.data();
    const updatedData = { id: updatedDoc.id, ...updatedReportData };
    
    let targetUserId = null;
    let campaignTitle = null;
    let notificationData = null;
    
    if (reportType === 'campaign' && reportData.campaignId) {
      const campaignDoc = await db.collection('campaigns').doc(reportData.campaignId).get();
      if (campaignDoc.exists) {
        const campaignData = campaignDoc.data();
        targetUserId = campaignData.creatorId;
        campaignTitle = campaignData.title;
        
        if (action === 'no-action' && status === 'dismissed') {
          notificationData = getNotificationTemplate('campaignRestored', { campaignTitle });
        } else if (action === 'warned') {
          const reasonText = reportData.reason?.replace(/_/g, ' ') || 'policy violation';
          notificationData = getNotificationTemplate('warningIssued', { reason: reasonText });
        } else if (action === 'removed') {
          const appealDeadline = new Date();
          appealDeadline.setDate(appealDeadline.getDate() + 30);
          notificationData = getNotificationTemplate('campaignRemoved', {
            campaignTitle,
            appealDeadline: appealDeadline.toLocaleDateString()
          });
        }
      }
    }
    
    else if (reportType === 'profile' && reportData.reportedUserId) {
      targetUserId = reportData.reportedUserId;
      
      if (action === 'no-action' && status === 'dismissed') {
        notificationData = getNotificationTemplate('profileRestored');
      } else if (action === 'warned') {
        const reasonText = reportData.reason?.replace(/_/g, ' ') || 'policy violation';
        notificationData = getNotificationTemplate('warningIssued', { reason: reasonText });
      } else if (action === 'removed') {
        const appealDeadline = new Date();
        appealDeadline.setDate(appealDeadline.getDate() + 30);
        const banReasonText = reportData.reason?.replace(/_/g, ' ') || 'policy violation';
        notificationData = getNotificationTemplate('accountBanned', {
          banReason: banReasonText,
          appealDeadline: appealDeadline.toLocaleDateString()
        });
      }
    }
    
    if (targetUserId && notificationData) {
      try {
        await sendFCMNotification({
          userId: targetUserId,
          title: notificationData.title,
          body: notificationData.body,
          actionUrl: notificationData.actionUrl,
          icon: notificationData.icon,
        });
      } catch (notificationError) {
        console.error('Failed to send FCM notification:', notificationError);
      }
    }
    
    if (updatedData.createdAt && updatedData.createdAt.toDate) {
      updatedData.createdAt = updatedData.createdAt.toDate().toISOString();
    }
    if (updatedData.reviewedAt && updatedData.reviewedAt.toDate) {
      updatedData.reviewedAt = updatedData.reviewedAt.toDate().toISOString();
    }
    if (updatedData.updatedAt && updatedData.updatedAt.toDate) {
      updatedData.updatedAt = updatedData.updatedAt.toDate().toISOString();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Report updated successfully',
      data: updatedData,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
