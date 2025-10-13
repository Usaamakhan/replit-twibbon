import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { getNotificationTemplate } from '@/utils/notifications/notificationTemplates';
import { sendInAppNotification } from '@/utils/notifications/sendInAppNotification';

export async function PATCH(request, context) {
  try {
    console.log('[ADMIN REPORT UPDATE] Starting request...');
    console.log('[ADMIN REPORT UPDATE] Context:', context);
    
    const params = await Promise.resolve(context.params);
    console.log('[ADMIN REPORT UPDATE] Params:', params);
    
    const adminUser = await requireAdmin(request);
    console.log('[ADMIN REPORT UPDATE] Admin user verified:', adminUser.uid);
    
    const { reportId } = params;
    const body = await request.json();
    const { status, action } = body;
    console.log('[ADMIN REPORT UPDATE] Request body:', { status, action, reportId });
    
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
    
    console.log('[ADMIN REPORT UPDATE] Getting Firestore instance...');
    const db = adminFirestore();
    const reportRef = db.collection('reports').doc(reportId);
    
    console.log('[ADMIN REPORT UPDATE] Fetching report document...');
    const reportDoc = await reportRef.get();
    
    if (!reportDoc.exists) {
      console.log('[ADMIN REPORT UPDATE] Report not found:', reportId);
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }
    
    const reportData = reportDoc.data();
    const reportType = reportData.type || 'campaign';
    console.log('[ADMIN REPORT UPDATE] Report data:', { 
      reportType, 
      campaignId: reportData.campaignId,
      reportedUserId: reportData.reportedUserId,
      currentStatus: reportData.status
    });
    
    // Fetch related reports BEFORE transaction (for dismissals)
    let relatedReportsSnapshot = null;
    if (action === 'no-action' && status === 'dismissed') {
      console.log('[ADMIN REPORT UPDATE] Fetching related reports for dismissal...');
      if (reportType === 'campaign' && reportData.campaignId) {
        relatedReportsSnapshot = await db.collection('reports')
          .where('campaignId', '==', reportData.campaignId)
          .where('status', 'in', ['pending', 'reviewed', 'resolved'])
          .get();
        console.log('[ADMIN REPORT UPDATE] Found', relatedReportsSnapshot.size, 'related campaign reports');
      } else if (reportType === 'profile' && reportData.reportedUserId) {
        relatedReportsSnapshot = await db.collection('reports')
          .where('reportedUserId', '==', reportData.reportedUserId)
          .where('status', 'in', ['pending', 'reviewed', 'resolved'])
          .get();
        console.log('[ADMIN REPORT UPDATE] Found', relatedReportsSnapshot.size, 'related profile reports');
      }
    }
    
    // Fetch campaign/user document BEFORE transaction (all reads must be before writes)
    let targetDoc = null;
    let targetData = null;
    if (reportType === 'campaign' && reportData.campaignId) {
      console.log('[ADMIN REPORT UPDATE] Fetching campaign document before transaction...');
      targetDoc = await db.collection('campaigns').doc(reportData.campaignId).get();
      if (targetDoc.exists) {
        targetData = targetDoc.data();
        console.log('[ADMIN REPORT UPDATE] Campaign data fetched:', { creatorId: targetData.creatorId, title: targetData.title });
      }
    } else if (reportType === 'profile' && reportData.reportedUserId) {
      console.log('[ADMIN REPORT UPDATE] Fetching user document before transaction...');
      targetDoc = await db.collection('users').doc(reportData.reportedUserId).get();
      if (targetDoc.exists) {
        targetData = targetDoc.data();
        console.log('[ADMIN REPORT UPDATE] User data fetched');
      }
    }
    
    console.log('[ADMIN REPORT UPDATE] Starting transaction...');
    await db.runTransaction(async (transaction) => {
      console.log('[ADMIN REPORT UPDATE] Inside transaction - preparing report update...');
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
      
      console.log('[ADMIN REPORT UPDATE] Updating report document with:', reportUpdateData);
      transaction.update(reportRef, reportUpdateData);
      console.log('[ADMIN REPORT UPDATE] Report update queued successfully');
      
      // Process campaign report (using pre-fetched data)
      if (reportType === 'campaign' && reportData.campaignId && targetDoc && targetDoc.exists) {
        console.log('[ADMIN REPORT UPDATE] Processing campaign report...');
        const campaignRef = db.collection('campaigns').doc(reportData.campaignId);
        const campaignData = targetData;
        const campaignUpdates = {};
          
          if (action === 'no-action' && status === 'dismissed') {
            console.log('[ADMIN REPORT UPDATE] Dismissing campaign report - resetting counts...');
            campaignUpdates.reportsCount = 0;
            campaignUpdates.moderationStatus = 'active';
            if (campaignData.hiddenAt) {
              campaignUpdates.hiddenAt = FieldValue.delete();
            }
            
            if (relatedReportsSnapshot && !relatedReportsSnapshot.empty) {
              console.log('[ADMIN REPORT UPDATE] Dismissing', relatedReportsSnapshot.size, 'related reports');
              relatedReportsSnapshot.forEach(doc => {
                transaction.update(doc.ref, { 
                  status: 'dismissed', 
                  action: 'no-action',
                  reviewedAt: new Date(),
                  reviewedBy: adminUser.uid
                });
              });
            }
          }
          
          else if (action === 'warned') {
            console.log('[ADMIN REPORT UPDATE] Creating warning for campaign creator...');
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
            console.log('[ADMIN REPORT UPDATE] Warning queued successfully');
          }
          
          else if (action === 'removed') {
            console.log('[ADMIN REPORT UPDATE] Removing campaign temporarily...');
            const appealDeadline = new Date();
            appealDeadline.setDate(appealDeadline.getDate() + 30);
            
            campaignUpdates.moderationStatus = 'removed-temporary';
            campaignUpdates.removedAt = new Date();
            campaignUpdates.removalReason = reportData.reason;
            campaignUpdates.appealDeadline = appealDeadline;
            campaignUpdates.appealCount = campaignData.appealCount || 0;
          }
          
        if (Object.keys(campaignUpdates).length > 0) {
          console.log('[ADMIN REPORT UPDATE] Updating campaign with:', campaignUpdates);
          campaignUpdates.updatedAt = new Date();
          transaction.update(campaignRef, campaignUpdates);
          console.log('[ADMIN REPORT UPDATE] Campaign update queued successfully');
        }
      }
      
      // Process profile report (using pre-fetched data)
      else if (reportType === 'profile' && reportData.reportedUserId && targetDoc && targetDoc.exists) {
        console.log('[ADMIN REPORT UPDATE] Processing profile report...');
        const userRef = db.collection('users').doc(reportData.reportedUserId);
        const userData = targetData;
        const userUpdates = {};
          
          if (action === 'no-action' && status === 'dismissed') {
            console.log('[ADMIN REPORT UPDATE] Dismissing profile report - resetting counts...');
            userUpdates.reportsCount = 0;
            userUpdates.moderationStatus = 'active';
            if (userData.hiddenAt) {
              userUpdates.hiddenAt = FieldValue.delete();
            }
            
            if (relatedReportsSnapshot && !relatedReportsSnapshot.empty) {
              console.log('[ADMIN REPORT UPDATE] Dismissing', relatedReportsSnapshot.size, 'related reports');
              relatedReportsSnapshot.forEach(doc => {
                transaction.update(doc.ref, { 
                  status: 'dismissed', 
                  action: 'no-action',
                  reviewedAt: new Date(),
                  reviewedBy: adminUser.uid
                });
              });
            }
          }
          
          else if (action === 'warned') {
            console.log('[ADMIN REPORT UPDATE] Creating warning for user...');
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
            console.log('[ADMIN REPORT UPDATE] Warning queued successfully');
          }
          
          else if (action === 'removed') {
            console.log('[ADMIN REPORT UPDATE] Banning user temporarily...');
            const appealDeadline = new Date();
            appealDeadline.setDate(appealDeadline.getDate() + 30);
            
            userUpdates.banned = true;
            userUpdates.bannedAt = new Date();
            userUpdates.bannedBy = adminUser.uid;
            userUpdates.banReason = reportData.reason;
            userUpdates.appealDeadline = appealDeadline;
          }
          
        if (Object.keys(userUpdates).length > 0) {
          console.log('[ADMIN REPORT UPDATE] Updating user with:', userUpdates);
          userUpdates.updatedAt = new Date();
          transaction.update(userRef, userUpdates);
          console.log('[ADMIN REPORT UPDATE] User update queued successfully');
        }
      }
    });
    
    console.log('[ADMIN REPORT UPDATE] Transaction completed successfully');
    
    console.log('[ADMIN REPORT UPDATE] Fetching updated report document...');
    const updatedDoc = await reportRef.get();
    const updatedReportData = updatedDoc.data();
    const updatedData = { id: updatedDoc.id, ...updatedReportData };
    
    let targetUserId = null;
    let campaignTitle = null;
    let notificationData = null;
    
    console.log('[ADMIN REPORT UPDATE] Preparing notification...');
    if (reportType === 'campaign' && reportData.campaignId) {
      console.log('[ADMIN REPORT UPDATE] Fetching campaign for notification...');
      const campaignDoc = await db.collection('campaigns').doc(reportData.campaignId).get();
      if (campaignDoc.exists) {
        const campaignData = campaignDoc.data();
        targetUserId = campaignData.creatorId;
        campaignTitle = campaignData.title;
        console.log('[ADMIN REPORT UPDATE] Target user:', targetUserId, 'Campaign:', campaignTitle);
        
        if (action === 'no-action' && status === 'dismissed') {
          console.log('[ADMIN REPORT UPDATE] Creating campaignRestored notification');
          notificationData = getNotificationTemplate('campaignRestored', { campaignTitle });
        } else if (action === 'warned') {
          console.log('[ADMIN REPORT UPDATE] Creating warningIssued notification');
          const reasonText = reportData.reason?.replace(/_/g, ' ') || 'policy violation';
          notificationData = getNotificationTemplate('warningIssued', { reason: reasonText });
        } else if (action === 'removed') {
          console.log('[ADMIN REPORT UPDATE] Creating campaignRemoved notification');
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
      console.log('[ADMIN REPORT UPDATE] Profile report - target user:', reportData.reportedUserId);
      targetUserId = reportData.reportedUserId;
      
      if (action === 'no-action' && status === 'dismissed') {
        console.log('[ADMIN REPORT UPDATE] Creating profileRestored notification');
        notificationData = getNotificationTemplate('profileRestored');
      } else if (action === 'warned') {
        console.log('[ADMIN REPORT UPDATE] Creating warningIssued notification');
        const reasonText = reportData.reason?.replace(/_/g, ' ') || 'policy violation';
        notificationData = getNotificationTemplate('warningIssued', { reason: reasonText });
      } else if (action === 'removed') {
        console.log('[ADMIN REPORT UPDATE] Creating accountBanned notification');
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
      console.log('[ADMIN REPORT UPDATE] Sending in-app notification to user:', targetUserId);
      try {
        await sendInAppNotification({
          userId: targetUserId,
          title: notificationData.title,
          body: notificationData.body,
          actionUrl: notificationData.actionUrl,
          icon: notificationData.icon,
          type: notificationData.type || 'general',
          metadata: {
            reportId: reportData.id,
            campaignId: reportData.campaignId,
            action,
            status,
          }
        });
        console.log('[ADMIN REPORT UPDATE] In-app notification sent successfully');
      } catch (notificationError) {
        console.error('[ADMIN REPORT UPDATE] Failed to send in-app notification:', notificationError);
      }
    } else {
      console.log('[ADMIN REPORT UPDATE] No notification to send (targetUserId:', targetUserId, ', notificationData:', !!notificationData, ')');
    }
    
    console.log('[ADMIN REPORT UPDATE] Converting timestamps...');
    if (updatedData.createdAt && updatedData.createdAt.toDate) {
      updatedData.createdAt = updatedData.createdAt.toDate().toISOString();
    }
    if (updatedData.reviewedAt && updatedData.reviewedAt.toDate) {
      updatedData.reviewedAt = updatedData.reviewedAt.toDate().toISOString();
    }
    if (updatedData.updatedAt && updatedData.updatedAt.toDate) {
      updatedData.updatedAt = updatedData.updatedAt.toDate().toISOString();
    }
    
    console.log('[ADMIN REPORT UPDATE] Success! Returning response');
    return NextResponse.json({
      success: true,
      message: 'Report updated successfully',
      data: updatedData,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update report',
        details: error.message,
        errorCode: error.code
      },
      { status: 500 }
    );
  }
}
