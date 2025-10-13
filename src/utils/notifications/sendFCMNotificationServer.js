import 'server-only';
import adminApp, { adminFirestore } from '@/lib/firebaseAdmin';
import { getMessaging } from 'firebase-admin/messaging';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Server-side FCM notification sender (direct, no HTTP request)
 * Use this in API routes to avoid HTTP self-calls
 */
export async function sendFCMNotificationServer({ userId, title, body, actionUrl, icon, data = {} }) {
  try {
    console.log('[FCM SERVER] Preparing to send notification to userId:', userId);
    console.log('[FCM SERVER] Notification details:', { title, body, actionUrl });

    if (!userId || !title || !body) {
      throw new Error('Missing required fields: userId, title, and body');
    }

    const db = adminFirestore();
    const messaging = getMessaging(adminApp);

    console.log('[FCM SERVER] Fetching FCM tokens for user...');
    const tokensSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('tokens')
      .get();

    if (tokensSnapshot.empty) {
      console.log('[FCM SERVER] No FCM tokens found for user:', userId);
      return {
        success: false,
        message: 'No FCM tokens found for this user',
        successCount: 0,
        failureCount: 0
      };
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    console.log('[FCM SERVER] Found', tokens.length, 'FCM token(s) for user');

    const message = {
      notification: {
        title,
        body: body,
        icon: icon || '/icon-192x192.png',
      },
      data: {
        url: actionUrl || '/',
        ...data
      },
      tokens
    };

    console.log('[FCM SERVER] Sending notification via Firebase Admin SDK...');
    const response = await messaging.sendEachForMulticast(message);
    console.log('[FCM SERVER] Firebase response - Success:', response.successCount, 'Failed:', response.failureCount);

    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
        console.error('[FCM SERVER] Failed to send to token:', tokens[idx], 'Error:', resp.error);
      }
    });

    if (failedTokens.length > 0) {
      console.log('[FCM SERVER] Cleaning up', failedTokens.length, 'failed token(s)...');
      const batch = db.batch();
      failedTokens.forEach(token => {
        const tokenRef = db.collection('users').doc(userId).collection('tokens').doc(token);
        batch.delete(tokenRef);
      });
      await batch.commit();
      console.log('[FCM SERVER] Failed tokens removed from database');
    }

    // Save notification to Firestore history
    console.log('[FCM SERVER] Saving notification to history...');
    try {
      const notificationRef = db
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .doc();
      
      await notificationRef.set({
        type: data?.type || 'general',
        title,
        body: body,
        actionUrl: actionUrl || '/',
        icon: icon || '/icon-192x192.png',
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        metadata: data || {},
      });
      
      console.log('[FCM SERVER] Notification saved to history with ID:', notificationRef.id);
    } catch (historyError) {
      console.error('[FCM SERVER] Error saving notification to history:', historyError);
    }

    console.log('[FCM SERVER] ✅ Notification sending complete');
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: `Sent ${response.successCount} notifications, ${response.failureCount} failed`
    };

  } catch (error) {
    console.error('[FCM SERVER] ❌ Error sending FCM notification:', error);
    throw error;
  }
}
