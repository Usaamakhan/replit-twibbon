import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { campaignId, campaignSlug, reportedBy, reason, details } = body;
    
    // Validate required fields
    if (!campaignId || !reason) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID and reason are required' },
        { status: 400 }
      );
    }
    
    // Validate reason is one of the allowed values
    const validReasons = ['inappropriate', 'spam', 'copyright', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report reason' },
        { status: 400 }
      );
    }
    
    // Use Firestore transaction for atomic operations
    const reportRef = adminDb.collection('reports').doc();
    const campaignRef = adminDb.collection('campaigns').doc(campaignId);
    
    await adminDb.runTransaction(async (transaction) => {
      // Get the campaign
      const campaignDoc = await transaction.get(campaignRef);
      
      if (!campaignDoc.exists) {
        throw new Error('Campaign not found');
      }
      
      const campaignData = campaignDoc.data();
      const currentReportsCount = campaignData.reportsCount || 0;
      const newReportsCount = currentReportsCount + 1;
      
      // Create the report
      const reportData = {
        campaignId,
        campaignSlug: campaignSlug || '',
        reportedBy: reportedBy || 'anonymous',
        reason,
        details: details || '',
        status: 'pending',
        createdAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        action: null,
      };
      
      transaction.set(reportRef, reportData);
      
      // Update campaign
      const campaignUpdates = {
        reportsCount: newReportsCount,
        updatedAt: new Date(),
      };
      
      // Auto-flag for review if threshold reached (3+ reports)
      if (newReportsCount >= 3 && campaignData.moderationStatus === 'active') {
        campaignUpdates.moderationStatus = 'under-review';
      }
      
      transaction.update(campaignRef, campaignUpdates);
    });
    
    return NextResponse.json(
      { success: true, reportId: reportRef.id },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error creating report:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to submit report. Please try again.' 
      },
      { status: 500 }
    );
  }
}
