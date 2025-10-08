import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(request, { params }) {
  try {
    const adminUser = await requireAdmin(request);
    
    const { campaignId } = params;
    const body = await request.json();
    const { moderationStatus, removeReason } = body;
    
    const validStatuses = ['active', 'under-review', 'removed'];
    if (moderationStatus && !validStatuses.includes(moderationStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid moderation status. Must be: active, under-review, or removed' },
        { status: 400 }
      );
    }
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    const db = adminFirestore();
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const campaignDoc = await campaignRef.get();
    
    if (!campaignDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    const updateData = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    if (moderationStatus) {
      updateData.moderationStatus = moderationStatus;
      
      if (moderationStatus === 'removed') {
        updateData.removedBy = adminUser.uid;
        updateData.removedAt = FieldValue.serverTimestamp();
        
        if (removeReason) {
          updateData.removeReason = removeReason;
        }
      }
    }
    
    await campaignRef.update(updateData);
    
    const updatedDoc = await campaignRef.get();
    const updatedData = { id: updatedDoc.id, ...updatedDoc.data() };
    
    if (updatedData.createdAt && updatedData.createdAt.toDate) {
      updatedData.createdAt = updatedData.createdAt.toDate().toISOString();
    }
    if (updatedData.updatedAt && updatedData.updatedAt.toDate) {
      updatedData.updatedAt = updatedData.updatedAt.toDate().toISOString();
    }
    if (updatedData.removedAt && updatedData.removedAt.toDate) {
      updatedData.removedAt = updatedData.removedAt.toDate().toISOString();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Campaign moderation status updated successfully',
      data: updatedData,
    });
  } catch (error) {
    console.error('Error updating campaign moderation status:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign moderation status' },
      { status: 500 }
    );
  }
}
