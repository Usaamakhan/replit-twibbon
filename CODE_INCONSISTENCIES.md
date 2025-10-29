# Code Inconsistencies & Issues - Twibbonize Platform

**Last Updated:** October 29, 2025

This document tracks code inconsistencies, bugs, and areas for improvement found during code audits.

---

## 📧 Email Notification System Issues

### 1. Missing Unban Email from Reports Summary Endpoint

**Issue:** When an admin unbans a user by dismissing reports from the `/admin/reports` page, no email notification is sent.

**Current Behavior:**
- `/api/admin/users/[userId]/ban/route.js` ✅ Sends unban email (lines 127-143)
- `/api/admin/reports/summary/[summaryId]/route.js` ❌ Does NOT send unban email

**Expected Behavior:**
Users should receive an unban/restoration email regardless of which admin interface was used to unban them.

**Location:** `src/app/api/admin/reports/summary/[summaryId]/route.js`

**Proposed Fix:**
When action is 'no-action' (dismiss) and target was previously banned, send the unban email similar to how the ban endpoint does it.

```javascript
// Around line 225, in the 'no-action' section
if (action === 'no-action') {
  if (wasHidden) {
    const notification = getNotificationTemplate(
      targetType === 'campaign' ? 'campaignRestored' : 'profileRestored',
      { campaignTitle: summaryData.campaignTitle }
    );
    
    await sendInAppNotification({
      userId,
      title: notification.title,
      body: notification.body,
      actionUrl: notification.actionUrl,
      icon: notification.icon,
      type: notification.type,
    });
    
    // ADD THIS: Send unban email if it was a banned user being restored
    if (targetType === 'user' && (summaryData.accountStatus === 'banned-temporary' || summaryData.accountStatus === 'banned-permanent')) {
      const { sendEmail } = await import('@/utils/notifications/sendEmail');
      const { getEmailTemplate } = await import('@/utils/notifications/emailTemplates');
      
      const userDoc = await db.collection('users').doc(targetId).get();
      const userData = userDoc.data();
      
      if (userData?.email) {
        const emailTemplate = getEmailTemplate('accountUnbanned', {
          userEmail: userData.email,
          username: userData.displayName || userData.username || userData.email,
        });
        
        await sendEmail({
          to: userData.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      }
    }
  }
}
```

**Priority:** Medium - Users who get unbanned via reports page won't know their account is restored

---

### 2. Incorrect Appeal URL in Ban Email Template

**Issue:** The ban email template uses an incorrect URL for the appeal link.

**Current Behavior:**
- `accountBanned` email template (line 101): Uses `/appeal`
- `appealReminder` email template (line 240): Uses `/profile/appeals` ✅ Correct

**Expected Behavior:**
Both should use `/profile/appeals` as that's the actual route in the application.

**Location:** `src/utils/notifications/emailTemplates.js`, line 101

**Fix:**
Change line 101 from:
```html
<a href="${process.env.NEXT_PUBLIC_BASE_URL}/appeal" class="button">Submit an Appeal</a>
```

To:
```html
<a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile/appeals" class="button">Submit an Appeal</a>
```

**Priority:** High - Users clicking the appeal link in ban emails get a 404 error

---

### 3. Redundant In-App Notifications for Campaign Appeal Reminders

**Issue:** Campaign creators receive BOTH in-app notifications AND emails for appeal reminders, but they can already log in to see in-app notifications.

**Current Behavior:**
- Campaign appeal reminders: Sends BOTH in-app (lines 57-63) AND email (lines 65-78)
- User ban appeal reminders: Sends ONLY email (lines 100-113)

**Rationale for Current Design:**
- Banned users cannot log in → Must use email
- Campaign creators can log in → Could use in-app OR email

**Question:** Is sending both necessary for campaigns, or should we only send emails for consistency?

**Location:** `src/app/api/cron/send-appeal-reminders/route.js`, lines 45-86

**Discussion:**
The documentation (REPORT_SYSTEM.md) states:
> Campaign removals: BOTH in-app + email reminders sent (creators can still log in)
> Account bans: Email reminders ONLY (banned users cannot log in to see in-app)

This appears to be intentional design, but could be streamlined to reduce notification noise.

**Recommendation:** 
- Option A: Keep as-is (defensive approach - ensures creators see the reminder)
- Option B: Remove in-app notification for campaigns, use email only (consistent with user bans)

**Priority:** Low - This is working as documented, but worth discussing for UX optimization

---

## 📊 Summary

| Issue | Severity | Status | Location |
|-------|----------|--------|----------|
| Missing unban email from reports page | Medium | ❌ Not Fixed | `src/app/api/admin/reports/summary/[summaryId]/route.js` |
| Incorrect appeal URL in ban email | High | ❌ Not Fixed | `src/utils/notifications/emailTemplates.js:101` |
| Redundant campaign appeal reminders | Low | ⚠️ Design Decision | `src/app/api/cron/send-appeal-reminders/route.js` |

---

**End of Document**
