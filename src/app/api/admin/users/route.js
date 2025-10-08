import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';

export async function GET(request) {
  try {
    await requireAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const limitParam = searchParams.get('limit') || '100';
    const limitValue = parseInt(limitParam, 10);
    
    const db = adminFirestore();
    const users = [];
    
    if (search) {
      let query = db.collection('users');
      if (role && role !== 'all') {
        query = query.where('role', '==', role);
      }
      query = query.orderBy('createdAt', 'desc');
      
      let hasMore = true;
      let lastDoc = null;
      const batchSize = 500;
      const searchLower = search.toLowerCase();
      
      while (hasMore && users.length < limitValue) {
        let batchQuery = lastDoc ? query.startAfter(lastDoc).limit(batchSize) : query.limit(batchSize);
        const snapshot = await batchQuery.get();
        
        if (snapshot.empty) {
          break;
        }
        
        for (const doc of snapshot.docs) {
          if (users.length >= limitValue) {
            hasMore = false;
            break;
          }
          
          const userData = { id: doc.id, ...doc.data() };
          
          const matchesSearch = 
            (userData.displayName && userData.displayName.toLowerCase().includes(searchLower)) ||
            (userData.email && userData.email.toLowerCase().includes(searchLower)) ||
            (userData.username && userData.username.toLowerCase().includes(searchLower));
          
          if (!matchesSearch) {
            continue;
          }
          
          const campaignsQuery = db.collection('campaigns')
            .where('creatorId', '==', doc.id)
            .where('moderationStatus', '==', 'active');
          const campaignsSnapshot = await campaignsQuery.get();
          const campaignsCount = campaignsSnapshot.size;
          
          let totalSupports = 0;
          campaignsSnapshot.docs.forEach(campaignDoc => {
            const campaignData = campaignDoc.data();
            totalSupports += campaignData.supportersCount || 0;
          });
          
          userData.campaignsCount = campaignsCount;
          userData.totalSupports = totalSupports;
          
          if (userData.createdAt && userData.createdAt.toDate) {
            userData.createdAt = userData.createdAt.toDate().toISOString();
          }
          if (userData.updatedAt && userData.updatedAt.toDate) {
            userData.updatedAt = userData.updatedAt.toDate().toISOString();
          }
          if (userData.bannedAt && userData.bannedAt.toDate) {
            userData.bannedAt = userData.bannedAt.toDate().toISOString();
          }
          
          users.push(userData);
        }
        
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        
        if (snapshot.docs.length < batchSize) {
          hasMore = false;
        }
      }
    } else {
      let query = db.collection('users');
      if (role && role !== 'all') {
        query = query.where('role', '==', role);
      }
      query = query.orderBy('createdAt', 'desc').limit(limitValue);
      
      const snapshot = await query.get();
      
      for (const doc of snapshot.docs) {
        const userData = { id: doc.id, ...doc.data() };
        
        const campaignsQuery = db.collection('campaigns')
          .where('creatorId', '==', doc.id)
          .where('moderationStatus', '==', 'active');
        const campaignsSnapshot = await campaignsQuery.get();
        const campaignsCount = campaignsSnapshot.size;
        
        let totalSupports = 0;
        campaignsSnapshot.docs.forEach(campaignDoc => {
          const campaignData = campaignDoc.data();
          totalSupports += campaignData.supportersCount || 0;
        });
        
        userData.campaignsCount = campaignsCount;
        userData.totalSupports = totalSupports;
        
        if (userData.createdAt && userData.createdAt.toDate) {
          userData.createdAt = userData.createdAt.toDate().toISOString();
        }
        if (userData.updatedAt && userData.updatedAt.toDate) {
          userData.updatedAt = userData.updatedAt.toDate().toISOString();
        }
        if (userData.bannedAt && userData.bannedAt.toDate) {
          userData.bannedAt = userData.bannedAt.toDate().toISOString();
        }
        
        users.push(userData);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
