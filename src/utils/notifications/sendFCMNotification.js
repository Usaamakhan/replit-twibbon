export async function sendFCMNotification({ userId, title, body, actionUrl, icon, data = {} }) {
  try {
    const response = await fetch('/api/notifications/send', {
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

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send notification');
    }

    return result;
  } catch (error) {
    console.error('Error sending FCM notification:', error);
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
