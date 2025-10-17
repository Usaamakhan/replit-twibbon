import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(request, { params }) {
  try {
    const adminUser = await requireAdmin(request);
    
    const { userId } = params;
    const body = await request.json();
    let { accountStatus, banReason, permanent = false, banned } = body;
    
    // Legacy support: map old `banned` boolean to new `accountStatus` enum
    if (accountStatus === undefined && banned !== undefined) {
      if (typeof banned !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Banned status must be a boolean' },
          { status: 400 }
        );
      }
      // Map banned boolean + permanent flag to new accountStatus
      if (banned) {
        accountStatus = permanent ? 'banned-permanent' : 'banned-temporary';
      } else {
        accountStatus = 'active';
      }
    }
    
    const validStatuses = ['active', 'banned-temporary', 'banned-permanent'];
    if (accountStatus && !validStatuses.includes(accountStatus)) {
      return NextResponse.json(
        { success: false, error: 'Account status must be: active, banned-temporary, or banned-permanent' },
        { status: 400 }
      );
    }
    
    if ((accountStatus === 'banned-temporary' || accountStatus === 'banned-permanent') && !banReason) {
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
      accountStatus: accountStatus,
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    if (accountStatus === 'banned-temporary' || accountStatus === 'banned-permanent') {
      updateData.banReason = banReason;
      updateData.bannedBy = adminUser.uid;
      updateData.bannedAt = FieldValue.serverTimestamp();
      
      if (accountStatus === 'banned-temporary') {
        const appealDeadline = new Date();
        appealDeadline.setDate(appealDeadline.getDate() + 30);
        updateData.appealDeadline = appealDeadline;
      } else if (accountStatus === 'banned-permanent') {
        // Clear temporary-only fields when setting to permanent
        updateData.appealDeadline = FieldValue.delete();
      }
      
      updateData.banned = true;
    } else {
      updateData.banReason = FieldValue.delete();
      updateData.bannedBy = FieldValue.delete();
      updateData.bannedAt = FieldValue.delete();
      updateData.appealDeadline = FieldValue.delete();
      updateData.banned = false;
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
      message: accountStatus === 'active' ? 'User unbanned successfully' : `User ${accountStatus.replace('-', ' ')} successfully`,
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
