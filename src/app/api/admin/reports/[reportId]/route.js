import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(request, { params }) {
  try {
    const adminUser = await requireAdmin(request);
    
    const { reportId } = params;
    const body = await request.json();
    const { status, action } = body;
    
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be: pending, reviewed, resolved, or dismissed' },
        { status: 400 }
      );
    }
    
    const validActions = ['removed', 'warned', 'no-action'];
    if (action && !validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be: removed, warned, or no-action' },
        { status: 400 }
      );
    }
    
    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      );
    }
    
    const db = adminFirestore();
    const reportRef = db.collection('reports').doc(reportId);
    const reportDoc = await reportRef.get();
    
    if (!reportDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }
    
    const updateData = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    if (status) {
      updateData.status = status;
      updateData.reviewedAt = FieldValue.serverTimestamp();
      updateData.reviewedBy = adminUser.uid;
    }
    
    if (action) {
      updateData.action = action;
    }
    
    await reportRef.update(updateData);
    
    const updatedDoc = await reportRef.get();
    const updatedData = { id: updatedDoc.id, ...updatedDoc.data() };
    
    if (updatedData.createdAt && updatedData.createdAt.toDate) {
      updatedData.createdAt = updatedData.createdAt.toDate().toISOString();
    }
    if (updatedData.reviewedAt && updatedData.reviewedAt.toDate) {
      updatedData.reviewedAt = updatedData.reviewedAt.toDate().toISOString();
    }
    if (updatedData.updatedAt && updatedData.updatedAt.toDate) {
      updatedData.updatedAt = updatedData.updatedAt.toDate().toISOString();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Report updated successfully',
      data: updatedData,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
