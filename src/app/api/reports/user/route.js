import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { sendInAppNotification } from '@/utils/notifications/sendInAppNotification';
import { getNotificationTemplate } from '@/utils/notifications/notificationTemplates';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { reportedUserId, reportedUsername, reportedBy, reason, details } = body;
    
    // Validate required fields
    if (!reportedUserId || !reason) {
      return NextResponse.json(
        { success: false, error: 'User ID and reason are required' },
        { status: 400 }
      );
    }
    
    // Validate reason is one of the allowed values for profile reports
    const validReasons = [
      'inappropriate_avatar',
      'offensive_username',
      'spam_bio',
      'impersonation',
      'other'
    ];
    
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
    const userRef = db.collection('users').doc(reportedUserId);
    const summaryId = `user-${reportedUserId}`;
    const summaryRef = db.collection('reportSummary').doc(summaryId);
    
    await db.runTransaction(async (transaction) => {
      // Get the user
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const currentReportsCount = userData.reportsCount || 0;
      const newReportsCount = currentReportsCount + 1;
      
      // Create the report with type = 'profile'
      const reportData = {
        type: 'profile',
        reportedUserId,
        reportedUsername: reportedUsername || userData.username || '',
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
      
      // Update user moderation fields
      const userUpdates = {
        reportsCount: newReportsCount,
        updatedAt: new Date(),
      };
      
      // Initialize moderation fields if they don't exist
      if (!userData.moderationStatus) {
        userUpdates.moderationStatus = 'active';
      }
      if (!userData.accountStatus) {
        userUpdates.accountStatus = 'active';
      }
      
      // Auto-hide profile at 10+ reports (as per spec)
      if (newReportsCount >= 10 && userData.moderationStatus === 'active') {
        userUpdates.moderationStatus = 'under-review-hidden';
        userUpdates.hiddenAt = new Date();
      }
      
      transaction.update(userRef, userUpdates);
      
      // Update or create report summary
      const summaryDoc = await transaction.get(summaryRef);
      const now = new Date();
      
      if (summaryDoc.exists) {
        // Update existing summary
        const currentSummary = summaryDoc.data();
        transaction.update(summaryRef, {
          reportCount: (currentSummary.reportCount || 0) + 1,
          pendingReportCount: currentSummary.status === 'pending' ? (currentSummary.pendingReportCount || 0) + 1 : (currentSummary.pendingReportCount || 0) + 1,
          lastReportedAt: now,
          updatedAt: now,
        });
      } else {
        // Create new summary
        transaction.set(summaryRef, {
          targetId: reportedUserId,
          targetType: 'user',
          reportCount: 1,
          pendingReportCount: 1,
          firstReportedAt: now,
          lastReportedAt: now,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
          // Display data for quick access
          username: userData.username || '',
          displayName: userData.displayName || '',
          profileImage: userData.profileImage || '',
          moderationStatus: userData.moderationStatus || 'active',
          accountStatus: userData.accountStatus || 'active',
        });
      }
      
      // Send notification if profile is auto-hidden
      if (newReportsCount >= 10 && userData.moderationStatus === 'active') {
        const notification = getNotificationTemplate('profileUnderReview');
        
        await sendInAppNotification({
          userId: reportedUserId,
          title: notification.title,
          body: notification.body,
          actionUrl: notification.actionUrl,
          icon: notification.icon,
          type: notification.type || 'profile-under-review',
          metadata: {
            reportedUserId,
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
    console.error('Error creating user report:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to submit report. Please try again.' 
      },
      { status: 500 }
    );
  }
}
