import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(request, { params }) {
  try {
    const adminUser = await requireAdmin(request);
    
    const { userId } = params;
    const body = await request.json();
    const { banned, banReason } = body;
    
    if (typeof banned !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Banned status must be a boolean' },
        { status: 400 }
      );
    }
    
    if (banned && !banReason) {
      return NextResponse.json(
        { success: false, error: 'Ban reason is required when banning a user' },
        { status: 400 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const db = adminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const updateData = {
      banned: banned,
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    if (banned) {
      updateData.banReason = banReason;
      updateData.bannedBy = adminUser.uid;
      updateData.bannedAt = FieldValue.serverTimestamp();
    } else {
      updateData.banReason = FieldValue.delete();
      updateData.bannedBy = FieldValue.delete();
      updateData.bannedAt = FieldValue.delete();
    }
    
    await userRef.update(updateData);
    
    const updatedDoc = await userRef.get();
    const updatedData = { id: updatedDoc.id, ...updatedDoc.data() };
    
    if (updatedData.createdAt && updatedData.createdAt.toDate) {
      updatedData.createdAt = updatedData.createdAt.toDate().toISOString();
    }
    if (updatedData.updatedAt && updatedData.updatedAt.toDate) {
      updatedData.updatedAt = updatedData.updatedAt.toDate().toISOString();
    }
    if (updatedData.bannedAt && updatedData.bannedAt.toDate) {
      updatedData.bannedAt = updatedData.bannedAt.toDate().toISOString();
    }
    
    return NextResponse.json({
      success: true,
      message: banned ? 'User banned successfully' : 'User unbanned successfully',
      data: updatedData,
    });
  } catch (error) {
    console.error('Error updating user ban status:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update user ban status' },
      { status: 500 }
    );
  }
}
