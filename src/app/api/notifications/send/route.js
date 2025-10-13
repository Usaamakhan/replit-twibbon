import { NextResponse } from 'next/server';
import adminApp, { adminFirestore } from '@/lib/firebaseAdmin';
import { getMessaging } from 'firebase-admin/messaging';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, title, body: messageBody, actionUrl, icon, data } = body;

    console.log('[SEND API] Received notification request for userId:', userId);
    console.log('[SEND API] Notification:', { title, messageBody, actionUrl });

    if (!userId || !title || !messageBody) {
      console.error('[SEND API] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, and body' },
        { status: 400 }
      );
    }

    const db = adminFirestore();
    const messaging = getMessaging(adminApp);

    console.log('[SEND API] Fetching FCM tokens for user...');
    const tokensSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('tokens')
      .get();

    if (tokensSnapshot.empty) {
      console.log('[SEND API] No FCM tokens found for user:', userId);
      return NextResponse.json({
        success: false,
        message: 'No FCM tokens found for this user'
      });
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    console.log('[SEND API] Found', tokens.length, 'FCM token(s) for user');

    const message = {
      notification: {
        title,
        body: messageBody,
        icon: icon || '/icon-192x192.png',
      },
      data: {
        url: actionUrl || '/',
        ...data
      },
      tokens
    };

    console.log('[SEND API] Sending notification via Firebase Admin SDK...');
    const response = await messaging.sendEachForMulticast(message);
    console.log('[SEND API] Firebase response - Success:', response.successCount, 'Failed:', response.failureCount);

    // Permanent error codes that indicate the token should be removed
    const PERMANENT_ERROR_CODES = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
      'messaging/invalid-argument',
      'messaging/mismatched-credential',
      'messaging/authentication-error',
    ];

    // Transient error codes that should NOT remove tokens (temporary failures)
    const TRANSIENT_ERROR_CODES = [
      'messaging/server-unavailable',
      'messaging/internal-error',
      'messaging/unavailable',
      'messaging/quota-exceeded',
      'messaging/third-party-auth-error',
    ];

    const tokensToRemove = [];
    const tokensToUpdate = [];
    const transientErrors = [];

    response.responses.forEach((resp, idx) => {
      const token = tokens[idx];
      
      if (resp.success) {
        console.log(`[SEND API] ✅ Successfully sent to token ${idx + 1}/${tokens.length}`);
        
        // Check if Firebase returned a canonical registration token (updated token)
        if (resp.canonicalRegistrationToken && resp.canonicalRegistrationToken !== token) {
          console.log(`[SEND API] 📝 Token needs update - Old: ${token.substring(0, 20)}..., New: ${resp.canonicalRegistrationToken.substring(0, 20)}...`);
          tokensToUpdate.push({
            oldToken: token,
            newToken: resp.canonicalRegistrationToken
          });
        }
      } else {
        const errorCode = resp.error?.code || 'unknown';
        const errorMessage = resp.error?.message || 'Unknown error';
        
        console.error(`[SEND API] ❌ Failed to send to token ${idx + 1}/${tokens.length}`);
        console.error(`[SEND API] Error code: ${errorCode}`);
        console.error(`[SEND API] Error message: ${errorMessage}`);
        
        // Only remove token if it's a permanent error
        if (PERMANENT_ERROR_CODES.includes(errorCode)) {
          console.log(`[SEND API] 🗑️  Permanent error detected - Will remove token`);
          tokensToRemove.push(token);
        } else if (TRANSIENT_ERROR_CODES.includes(errorCode)) {
          console.log(`[SEND API] ⚠️  Transient error detected - Token will be retained for retry`);
          transientErrors.push({
            token: token.substring(0, 20) + '...',
            errorCode,
            errorMessage
          });
        } else {
          // Unknown error - log but don't remove (safer approach)
          console.warn(`[SEND API] ⚠️  Unknown error code: ${errorCode} - Token will be retained`);
          transientErrors.push({
            token: token.substring(0, 20) + '...',
            errorCode,
            errorMessage,
            isUnknown: true
          });
        }
      }
    });

    // Update canonical tokens (deduplicate by newToken to avoid batch conflicts)
    if (tokensToUpdate.length > 0) {
      // Deduplicate by canonical token - multiple old tokens may map to same canonical
      // Keep only one old token per canonical token to avoid duplicate writes in batch
      const canonicalMap = new Map(); // newToken -> { oldTokens: [], newToken }
      
      tokensToUpdate.forEach(({ oldToken, newToken }) => {
        if (!canonicalMap.has(newToken)) {
          canonicalMap.set(newToken, { oldTokens: [], newToken });
        }
        canonicalMap.get(newToken).oldTokens.push(oldToken);
      });
      
      console.log(`[SEND API] 📝 Processing ${canonicalMap.size} unique canonical token(s) from ${tokensToUpdate.length} updates...`);
      
      // Fetch data from old tokens (pick first old token for each canonical)
      const tokensToProcess = [];
      for (const { oldTokens, newToken } of canonicalMap.values()) {
        // Use the first old token's data for the canonical token
        const primaryOldToken = oldTokens[0];
        const oldTokenRef = db.collection('users').doc(userId).collection('tokens').doc(primaryOldToken);
        const oldTokenDoc = await oldTokenRef.get();
        
        if (oldTokenDoc.exists) {
          tokensToProcess.push({
            oldTokens, // All old tokens to delete
            newToken,
            data: oldTokenDoc.data()
          });
        }
      }
      
      // Now perform batch update (one write per canonical token)
      if (tokensToProcess.length > 0) {
        const updateBatch = db.batch();
        
        for (const { oldTokens, newToken, data } of tokensToProcess) {
          // Delete all old tokens that map to this canonical
          oldTokens.forEach(oldToken => {
            const oldTokenRef = db.collection('users').doc(userId).collection('tokens').doc(oldToken);
            updateBatch.delete(oldTokenRef);
          });
          
          // Create/update canonical token (only written once per batch)
          const newTokenRef = db.collection('users').doc(userId).collection('tokens').doc(newToken);
          updateBatch.set(newTokenRef, {
            ...data,
            token: newToken,
            lastUsed: FieldValue.serverTimestamp(),
          }, { merge: true }); // Use merge to handle pre-existing canonical docs gracefully
        }
        
        await updateBatch.commit();
        console.log(`[SEND API] ✅ ${tokensToProcess.length} canonical tokens updated successfully`);
      }
    }

    // Remove permanently failed tokens
    if (tokensToRemove.length > 0) {
      console.log(`[SEND API] 🗑️  Removing ${tokensToRemove.length} permanently invalid token(s)...`);
      const deleteBatch = db.batch();
      
      tokensToRemove.forEach(token => {
        const tokenRef = db.collection('users').doc(userId).collection('tokens').doc(token);
        deleteBatch.delete(tokenRef);
      });
      
      await deleteBatch.commit();
      console.log(`[SEND API] ✅ Permanently invalid tokens removed from database`);
    }

    // Log transient errors for monitoring (could be sent to error tracking service)
    if (transientErrors.length > 0) {
      console.warn(`[SEND API] ⚠️  ${transientErrors.length} transient error(s) occurred (tokens retained):`, transientErrors);
    }

    // Save notification to Firestore history
    console.log('[SEND API] Saving notification to history...');
    try {
      const notificationRef = db
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .doc(); // Auto-generate ID
      
      await notificationRef.set({
        type: data?.type || 'general',
        title,
        body: messageBody,
        actionUrl: actionUrl || '/',
        icon: icon || '/icon-192x192.png',
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        metadata: data || {},
      });
      
      console.log('[SEND API] Notification saved to history with ID:', notificationRef.id);
    } catch (historyError) {
      console.error('[SEND API] Error saving notification to history:', historyError);
      // Don't fail the request if history save fails
    }

    console.log('[SEND API] ✅ Notification sending complete');
    return NextResponse.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      tokensRemoved: tokensToRemove.length,
      tokensUpdated: tokensToUpdate.length,
      transientErrors: transientErrors.length,
      message: `Sent ${response.successCount} notifications, ${response.failureCount} failed (${tokensToRemove.length} tokens removed, ${transientErrors.length} transient errors)`
    });

  } catch (error) {
    console.error('Error sending FCM notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
}
