import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { sendInAppNotification } from '@/utils/notifications/sendInAppNotification';
import { getNotificationTemplate } from '@/utils/notifications/notificationTemplates';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { reportedUserId, reportedUsername, reportedBy, reason } = body;
    
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
    const userRef = db.collection('users').doc(reportedUserId);
    const summaryId = `user-${reportedUserId}`;
    const summaryRef = db.collection('reportSummary').doc(summaryId);
    
    let shouldNotify = false;
    let notificationData = null;
    
    await db.runTransaction(async (transaction) => {
      // ALL READS MUST COME FIRST (Firestore requirement)
      const userDoc = await transaction.get(userRef);
      const summaryDoc = await transaction.get(summaryRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const currentReportsCount = userData.reportsCount || 0;
      const newReportsCount = currentReportsCount + 1;
      
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
        
        // Flag for notification after transaction
        shouldNotify = true;
        notificationData = {
          userId: reportedUserId,
          reason
        };
      }
      
      transaction.update(userRef, userUpdates);
      
      // Update or create report summary with reason counts
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
          summaryUpdates.reportsCount = 1;
          summaryUpdates.firstReportedAt = now;
          summaryUpdates.reasonCounts = { [reason]: 1 };
        } else {
          // Still pending, increment counter and reason count
          summaryUpdates.reportsCount = (currentSummary.reportsCount || 0) + 1;
          
          // Increment reason count
          const currentReasonCounts = currentSummary.reasonCounts || {};
          summaryUpdates.reasonCounts = {
            ...currentReasonCounts,
            [reason]: (currentReasonCounts[reason] || 0) + 1
          };
        }
        
        // Sync moderation status when user profile is auto-hidden
        if (newReportsCount >= 10 && userData.moderationStatus === 'active') {
          summaryUpdates.moderationStatus = 'under-review-hidden';
          summaryUpdates.hiddenAt = now;
        }
        
        // Always refresh cached display data
        summaryUpdates.displayName = userData.displayName || currentSummary.displayName;
        summaryUpdates.username = userData.username || currentSummary.username;
        summaryUpdates.profileImage = userData.profileImage || currentSummary.profileImage;
        summaryUpdates.accountStatus = userData.accountStatus || currentSummary.accountStatus || 'active';
        
        transaction.update(summaryRef, summaryUpdates);
      } else {
        // Create new summary
        transaction.set(summaryRef, {
          targetId: reportedUserId,
          targetType: 'user',
          reportsCount: 1,
          reasonCounts: { [reason]: 1 },
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
    });
    
    // Send notification AFTER transaction completes
    if (shouldNotify && notificationData) {
      const notification = getNotificationTemplate('profileUnderReview');
      
      await sendInAppNotification({
        userId: notificationData.userId,
        title: notification.title,
        body: notification.body,
        actionUrl: notification.actionUrl,
        icon: notification.icon,
        type: notification.type || 'profile-under-review',
        metadata: {
          reportedUserId: notificationData.userId,
          reason: notificationData.reason,
        }
      }).catch(err => console.error('Failed to send notification:', err));
    }
    
    return NextResponse.json(
      { success: true, message: 'Report submitted successfully' },
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
