import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebaseAdmin';
import { adminFirestore } from '@/lib/firebaseAdmin';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function DELETE(request, { params }) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authorization.replace('Bearer ', '');
    
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;
    const { campaignId } = params;

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

    const campaignData = campaignDoc.data();

    if (campaignData.creatorId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to delete this campaign' },
        { status: 403 }
      );
    }

    try {
      if (campaignData.imageUrl) {
        const imagePath = campaignData.imageUrl;
        
        const { error: storageError } = await supabaseAdmin.storage
          .from('uploads')
          .remove([imagePath]);
        
        if (storageError) {
          console.error('Supabase storage deletion error:', storageError);
        }
      }
    } catch (storageError) {
      console.error('Error deleting campaign image from storage:', storageError);
    }

    const summaryId = `campaign-${campaignId}`;
    const summaryRef = db.collection('reportSummary').doc(summaryId);

    await db.runTransaction(async (transaction) => {
      const summaryDoc = await transaction.get(summaryRef);
      
      transaction.delete(campaignRef);

      if (summaryDoc.exists) {
        transaction.update(summaryRef, {
          status: 'dismissed',
          reportsCount: 0,
          reasonCounts: {},
          moderationStatus: 'deleted',
          updatedAt: new Date(),
          deletionNote: 'Campaign deleted by creator',
        });
      }

      const userRef = db.collection('users').doc(userId);
      transaction.update(userRef, {
        campaignsCount: FieldValue.increment(-1),
        updatedAt: new Date(),
      });
    });

    const reportsQuery = db.collection('reports')
      .where('campaignId', '==', campaignId)
      .where('status', 'in', ['pending', 'reviewed', 'resolved']);
    
    const reportsSnapshot = await reportsQuery.get();
    
    if (!reportsSnapshot.empty) {
      const batch = db.batch();
      
      reportsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: 'dismissed',
          action: 'no-action',
          reviewedAt: new Date(),
          dismissalNote: 'Campaign deleted by creator',
          updatedAt: new Date(),
        });
      });
      
      await batch.commit();
      console.log(`Auto-dismissed ${reportsSnapshot.size} reports for deleted campaign ${campaignId}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
      data: {
        campaignId,
        title: campaignData.title,
        reportsDismissed: reportsSnapshot.size || 0,
      },
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
