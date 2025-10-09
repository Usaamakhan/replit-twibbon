import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and token' },
        { status: 400 }
      );
    }

    const db = adminDb();
    const tokenRef = db.collection('users').doc(userId).collection('tokens').doc(token);

    await tokenRef.delete();

    return NextResponse.json({
      success: true,
      message: 'FCM token removed successfully'
    });

  } catch (error) {
    console.error('Error removing FCM token:', error);
    return NextResponse.json(
      { error: 'Failed to remove FCM token', details: error.message },
      { status: 500 }
    );
  }
}
