export async function sendFCMNotification({ userId, title, body, actionUrl, icon, data = {} }) {
  try {
    console.log('[FCM SEND] Preparing to send notification to userId:', userId);
    console.log('[FCM SEND] Notification details:', { title, body, actionUrl });
    
    const isServer = typeof window === 'undefined';
    const baseUrl = isServer 
      ? (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000')
      : '';
    
    const apiUrl = `${baseUrl}/api/notifications/send`;
    console.log('[FCM SEND] Using API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        actionUrl,
        icon,
        data
      }),
    });

    const result = await response.json();
    console.log('[FCM SEND] API response status:', response.status);
    console.log('[FCM SEND] API response data:', result);

    if (!response.ok) {
      console.error('[FCM SEND] API returned error:', result.error);
      throw new Error(result.error || 'Failed to send notification');
    }

    console.log('[FCM SEND] ✅ Notification sent successfully');
    return result;
  } catch (error) {
    console.error('[FCM SEND] ❌ Error sending FCM notification:', error);
    throw error;
  }
}

export async function sendBatchNotifications(notifications) {
  const promises = notifications.map(notification => 
    sendFCMNotification(notification).catch(err => {
      console.error('Failed to send notification:', err);
      return { success: false, error: err.message };
    })
  );

  return await Promise.allSettled(promises);
}
