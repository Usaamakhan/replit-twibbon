import { NextResponse } from 'next/server';
import { adminApp, adminDb } from '@/lib/firebaseAdmin';
import { getMessaging } from 'firebase-admin/messaging';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, title, body: messageBody, actionUrl, icon, data } = body;

    if (!userId || !title || !messageBody) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, and body' },
        { status: 400 }
      );
    }

    const db = adminDb();
    const messaging = getMessaging(adminApp());

    const tokensSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('tokens')
      .get();

    if (tokensSnapshot.empty) {
      return NextResponse.json({
        success: false,
        message: 'No FCM tokens found for this user'
      });
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

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

    const response = await messaging.sendEachForMulticast(message);

    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
        console.error('Failed to send to token:', tokens[idx], resp.error);
      }
    });

    if (failedTokens.length > 0) {
      const batch = db.batch();
      failedTokens.forEach(token => {
        const tokenRef = db.collection('users').doc(userId).collection('tokens').doc(token);
        batch.delete(tokenRef);
      });
      await batch.commit();
    }

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
