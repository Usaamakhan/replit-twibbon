import { NextResponse } from 'next/server';
import adminApp, { adminFirestore } from '@/lib/firebaseAdmin';
import { getMessaging } from 'firebase-admin/messaging';

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

    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
        console.error('[SEND API] Failed to send to token:', tokens[idx], 'Error:', resp.error);
      }
    });

    if (failedTokens.length > 0) {
      console.log('[SEND API] Cleaning up', failedTokens.length, 'failed token(s)...');
      const batch = db.batch();
      failedTokens.forEach(token => {
        const tokenRef = db.collection('users').doc(userId).collection('tokens').doc(token);
        batch.delete(tokenRef);
      });
      await batch.commit();
      console.log('[SEND API] Failed tokens removed from database');
    }

    console.log('[SEND API] ✅ Notification sending complete');
    return NextResponse.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: `Sent ${response.successCount} notifications, ${response.failureCount} failed`
    });

  } catch (error) {
    console.error('Error sending FCM notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
}
