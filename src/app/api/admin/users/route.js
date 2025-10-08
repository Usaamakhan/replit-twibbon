import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/adminAuth';
import { adminFirestore } from '@/lib/firebaseAdmin';

export async function GET(request) {
  try {
    await requireAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const limitParam = searchParams.get('limit') || '50';
    const limitValue = parseInt(limitParam, 10);
    
    const db = adminFirestore();
    let usersQuery = db.collection('users');
    
    if (role && role !== 'all') {
      usersQuery = usersQuery.where('role', '==', role);
    }
    
    usersQuery = usersQuery.orderBy('createdAt', 'desc').limit(limitValue);
    
    const usersSnapshot = await usersQuery.get();
    
    const users = [];
    
    for (const doc of usersSnapshot.docs) {
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
    
    let filteredUsers = users;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(user => 
        (user.displayName && user.displayName.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.username && user.username.toLowerCase().includes(searchLower))
      );
    }
    
    return NextResponse.json({
      success: true,
      data: filteredUsers,
      total: filteredUsers.length,
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
