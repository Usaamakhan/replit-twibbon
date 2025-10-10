import { NextResponse } from 'next/server';
import { adminFirestore, verifyIdToken } from '@/lib/firebaseAdmin';
import { headers } from 'next/headers';

// PATCH: Mark notification as read/unread
export async function PATCH(request, { params }) {
  try {
    // Get and verify authorization token
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authorization.replace('Bearer ', '');
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const { notificationId } = params;
    const body = await request.json();
    const { read } = body;
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notificationId' },
        { status: 400 }
      );
    }
    
    if (typeof read !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid read status. Must be boolean' },
        { status: 400 }
      );
    }
    
    const db = adminFirestore();
    const notificationRef = db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc(notificationId);
    
    // Check if notification exists
    const notificationDoc = await notificationRef.get();
    if (!notificationDoc.exists) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    await notificationRef.update({
      read,
      updatedAt: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      message: `Notification marked as ${read ? 'read' : 'unread'}`,
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    
    if (error.message.includes('Invalid authentication token')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update notification', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete notification
export async function DELETE(request, { params }) {
  try {
    // Get and verify authorization token
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authorization.replace('Bearer ', '');
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const { notificationId } = params;
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notificationId' },
        { status: 400 }
      );
    }
    
    const db = adminFirestore();
    const notificationRef = db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc(notificationId);
    
    // Check if notification exists before deleting
    const notificationDoc = await notificationRef.get();
    if (!notificationDoc.exists) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    await notificationRef.delete();
    
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    
    if (error.message.includes('Invalid authentication token')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete notification', details: error.message },
      { status: 500 }
    );
  }
}
