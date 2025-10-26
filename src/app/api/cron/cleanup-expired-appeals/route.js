import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { logAdminAction } from '@/utils/logAdminAction';
import { sendInAppNotification } from '@/utils/notifications/sendInAppNotification';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    let campaignsProcessed = 0;
    let usersProcessed = 0;
    const errors = [];

    const campaignsSnapshot = await adminDb
      .collection('campaigns')
      .where('moderationStatus', '==', 'removed-temporary')
      .get();

    for (const doc of campaignsSnapshot.docs) {
      try {
        const campaign = doc.data();
        
        if (campaign.appealDeadline && campaign.appealDeadline.toDate() < now) {
          await doc.ref.update({
            moderationStatus: 'removed-permanent',
            appealDeadline: FieldValue.delete(),
            appealCount: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          });

          await sendInAppNotification(campaign.creatorId, {
            type: 'campaignPermanentlyRemoved',
            title: '🚫 Campaign Permanently Removed',
            message: `Your campaign "${campaign.title}" has been permanently removed. The 30-day appeal window has expired.`,
            actionUrl: '/profile',
            actionLabel: 'View Profile',
          });

          await logAdminAction({
            adminId: 'system',
            adminEmail: 'system@twibbonize.com',
            action: 'auto_permanent_removal',
            targetType: 'campaign',
            targetId: doc.id,
            reason: 'Appeal deadline expired - auto-upgraded to permanent removal',
          });

          campaignsProcessed++;
        }
      } catch (error) {
        console.error(`Error processing campaign ${doc.id}:`, error);
        errors.push({ campaignId: doc.id, error: error.message });
      }
    }

    const usersSnapshot = await adminDb
      .collection('users')
      .where('accountStatus', '==', 'banned-temporary')
      .get();

    for (const doc of usersSnapshot.docs) {
      try {
        const user = doc.data();
        
        if (user.appealDeadline && user.appealDeadline.toDate() < now) {
          await doc.ref.update({
            accountStatus: 'banned-permanent',
            appealDeadline: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          });

          await sendInAppNotification(doc.id, {
            type: 'accountPermanentlyBanned',
            title: '🚫 Account Permanently Banned',
            message: 'Your account has been permanently banned. The 30-day appeal window has expired.',
            actionUrl: '/banned',
            actionLabel: 'View Details',
          });

          await logAdminAction({
            adminId: 'system',
            adminEmail: 'system@twibbonize.com',
            action: 'auto_permanent_ban',
            targetType: 'user',
            targetId: doc.id,
            reason: 'Appeal deadline expired - auto-upgraded to permanent ban',
          });

          usersProcessed++;
        }
      } catch (error) {
        console.error(`Error processing user ${doc.id}:`, error);
        errors.push({ userId: doc.id, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: {
        campaigns: campaignsProcessed,
        users: usersProcessed,
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
