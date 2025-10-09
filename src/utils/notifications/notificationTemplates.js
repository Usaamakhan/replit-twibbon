export const notificationTemplates = {
  campaignUnderReview: (campaignTitle) => ({
    title: '⚠️ Campaign Under Review',
    body: `Your campaign "${campaignTitle}" has been flagged by users and is now under review. We'll notify you of the outcome.`,
    actionUrl: '/profile',
    icon: '/icon-192x192.png',
  }),

  campaignRemoved: (campaignTitle, appealDeadline) => ({
    title: '🚫 Campaign Removed',
    body: `Your campaign "${campaignTitle}" has been removed. You can appeal this decision until ${appealDeadline}.`,
    actionUrl: '/profile',
    icon: '/icon-192x192.png',
  }),

  campaignRestored: (campaignTitle) => ({
    title: '✅ Campaign Restored',
    body: `Good news! Your campaign "${campaignTitle}" has been reviewed and restored.`,
    actionUrl: '/profile',
    icon: '/icon-192x192.png',
  }),

  warningIssued: (reason) => ({
    title: '⚠️ Warning Issued',
    body: `You've received a warning for: ${reason}. Please review our community guidelines.`,
    actionUrl: '/profile/settings',
    icon: '/icon-192x192.png',
  }),

  profileUnderReview: () => ({
    title: '⚠️ Profile Under Review',
    body: 'Your profile has been flagged by users and is now under review. We\'ll notify you of the outcome.',
    actionUrl: '/profile',
    icon: '/icon-192x192.png',
  }),

  accountBanned: (banReason, appealDeadline) => ({
    title: '🚫 Account Banned',
    body: `Your account has been banned for: ${banReason}. You can appeal until ${appealDeadline}.`,
    actionUrl: '/profile',
    icon: '/icon-192x192.png',
  }),

  profileRestored: () => ({
    title: '✅ Profile Restored',
    body: 'Good news! Your profile has been reviewed and restored.',
    actionUrl: '/profile',
    icon: '/icon-192x192.png',
  }),

  appealDeadlineReminder: (daysLeft, type) => ({
    title: '⏰ Appeal Deadline Reminder',
    body: `You have ${daysLeft} days left to appeal your ${type} removal. Don't miss the deadline!`,
    actionUrl: '/profile',
    icon: '/icon-192x192.png',
  }),

  appealApproved: (type) => ({
    title: '✅ Appeal Approved',
    body: `Your appeal for ${type} removal has been approved and restored.`,
    actionUrl: '/profile',
    icon: '/icon-192x192.png',
  }),

  appealRejected: (type) => ({
    title: '❌ Appeal Rejected',
    body: `Your appeal for ${type} removal has been reviewed and rejected.`,
    actionUrl: '/profile',
    icon: '/icon-192x192.png',
  }),
};

export function getNotificationTemplate(type, params = {}) {
  const template = notificationTemplates[type];
  
  if (!template) {
    console.error(`Notification template not found: ${type}`);
    return {
      title: 'Notification',
      body: 'You have a new notification',
      actionUrl: '/',
      icon: '/icon-192x192.png',
    };
  }

  return typeof template === 'function' ? template(...Object.values(params)) : template;
}
