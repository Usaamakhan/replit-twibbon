import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';

export async function GET(request) {
  try {
    await requireAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType');
    
    if (!targetId || !targetType) {
      return NextResponse.json(
        { success: false, error: 'Target ID and type are required' },
        { status: 400 }
      );
    }
    
    const db = adminFirestore();
    let reportsQuery = db.collection('reports');
    
    // Filter by target type and ID
    if (targetType === 'campaign') {
      reportsQuery = reportsQuery.where('campaignId', '==', targetId);
    } else if (targetType === 'user') {
      reportsQuery = reportsQuery.where('reportedUserId', '==', targetId);
    }
    
    // Order by creation date (newest first)
    reportsQuery = reportsQuery.orderBy('createdAt', 'desc');
    
    const reportsSnapshot = await reportsQuery.get();
    
    const reports = [];
    
    for (const doc of reportsSnapshot.docs) {
      const reportData = { id: doc.id, ...doc.data() };
      
      // Add reporter info if not anonymous
      if (reportData.reportedBy && reportData.reportedBy !== 'anonymous') {
        const reporterDoc = await db.collection('users').doc(reportData.reportedBy).get();
        if (reporterDoc.exists) {
          const reporterData = reporterDoc.data();
          reportData.reporter = {
            uid: reporterDoc.id,
            displayName: reporterData.displayName,
            username: reporterData.username,
          };
        }
      }
      
      // Convert Firestore timestamps to ISO strings
      if (reportData.createdAt && reportData.createdAt.toDate) {
        reportData.createdAt = reportData.createdAt.toDate().toISOString();
      }
      if (reportData.reviewedAt && reportData.reviewedAt.toDate) {
        reportData.reviewedAt = reportData.reviewedAt.toDate().toISOString();
      }
      
      reports.push(reportData);
    }
    
    return NextResponse.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    console.error('Error fetching report details:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report details' },
      { status: 500 }
    );
  }
}
