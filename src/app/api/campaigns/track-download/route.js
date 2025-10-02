import { NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../../../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { campaignId } = body;
    
    // Validate required field
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    // Verify authentication via Firebase ID token (if provided)
    let verifiedUserId = null;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.substring(7);
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        verifiedUserId = decodedToken.uid;
      } catch (verifyError) {
        // Invalid token - treat as anonymous
        console.warn('Invalid ID token, treating as anonymous:', verifyError.message);
      }
    }
    
    // Get Firestore instance
    const db = adminFirestore();
    
    // Run transaction to update counts
    const result = await db.runTransaction(async (transaction) => {
      // Get campaign document
      const campaignRef = db.collection('campaigns').doc(campaignId);
      const campaignDoc = await transaction.get(campaignRef);
      
      if (!campaignDoc.exists) {
        throw new Error('Campaign not found');
      }
      
      const campaignData = campaignDoc.data();
      const campaignCreatorId = campaignData.creatorId;
      
      // Update campaign supportersCount (always increments for both authenticated and anonymous)
      transaction.update(campaignRef, {
        supportersCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
        // Set firstUsedAt on first download
        ...(campaignData.supportersCount === 0 ? { firstUsedAt: FieldValue.serverTimestamp() } : {})
      });
      
      // Update creator's supportersCount only if downloader is VERIFIED authenticated and different from creator
      if (verifiedUserId && campaignCreatorId && verifiedUserId !== campaignCreatorId) {
        const creatorRef = db.collection('users').doc(campaignCreatorId);
        transaction.update(creatorRef, {
          supportersCount: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp()
        });
      }
      
      return {
        success: true,
        verified: !!verifiedUserId,
        campaignCreatorId: verifiedUserId && campaignCreatorId && verifiedUserId !== campaignCreatorId ? campaignCreatorId : null
      };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error tracking download:', error);
    
    // Return appropriate error message
    if (error.message === 'Campaign not found') {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to track download' },
      { status: 500 }
    );
  }
}
