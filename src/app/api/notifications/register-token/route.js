import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, token, device = 'web', browser } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and token' },
        { status: 400 }
      );
    }

    const db = adminFirestore();
    const tokenRef = db.collection('users').doc(userId).collection('tokens').doc(token);

    await tokenRef.set({
      token,
      device,
      browser: browser || 'unknown',
      createdAt: FieldValue.serverTimestamp(),
      lastUsed: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'FCM token registered successfully'
    });

  } catch (error) {
    console.error('Error registering FCM token:', error);
    return NextResponse.json(
      { error: 'Failed to register FCM token', details: error.message },
      { status: 500 }
    );
  }
}
