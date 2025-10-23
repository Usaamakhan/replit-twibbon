# Code Issues & Improvements - Twibbonize Reporting System

**Last Updated:** October 23, 2025

This document tracks known issues and suggested improvements for the Twibbonize reporting system. All issues are explained in simple, non-technical language so anyone can understand them.

---

## 🔴 Critical Issues

### 1. **Banned Users Cannot See Their Ban Notifications**

**What's the problem?**
When a user is banned, the system sends them an in-app notification about the ban. But banned users are immediately signed out and cannot log in to their account - so they can never see the notification that explains why they were banned!

**How the current system works:**

1. **When banning a user:**
   - Admin selects "Remove/Ban" action in `src/app/api/admin/reports/summary/[summaryId]/route.js` (line 228-244)
   - System updates user's `accountStatus` to `banned-temporary` or `banned-permanent`
   - System sends in-app notification using `sendInAppNotification()` with template `accountBanned`
   - Notification saved to Firestore: `users/{userId}/notifications/{notificationId}`
   - Notification includes ban reason and appeal deadline

2. **When user tries to login:**
   - User enters credentials on signin page
   - Firebase authenticates successfully
   - System checks user profile in `src/hooks/useAuth.js` (line 130)
   - Finds `profile.banned === true`
   - **Immediately signs user out** (line 132)
   - Stores ban info in `sessionStorage` for banned page
   - Redirects to `/banned` page (line 82-103 in `src/app/signin/page.js`)

3. **What user sees:**
   - `/banned` page shows: "Account Suspended" with reason and date
   - Ban info comes from `sessionStorage`, NOT from the in-app notification
   - User is locked out - cannot access their account, profile, or notifications

**What does this mean?**
The in-app notification about the ban is sent to a place the user can never access. It's like mailing a letter to someone and then locking them out of their house before they can read it!

**Current notification flow (BROKEN):**
```
Admin bans user 
  → In-app notification sent to users/{userId}/notifications/
  → User tries to login
  → System signs them out immediately
  → User redirected to /banned page
  → In-app notification sits unread forever ❌
```

**Example scenario:**
- User "john@example.com" posts inappropriate content
- Admin bans the user with reason: "Violated community guidelines - offensive content"
- System sends in-app notification: "Your account has been banned for: Violated community guidelines. You can appeal until March 15, 2025."
- User tries to login next day
- System blocks login and shows generic `/banned` page with reason from sessionStorage
- User never receives the detailed notification or appeal deadline info
- Appeal system information is lost

**Impact:**
- **Users don't get complete ban information** - they only see what's in sessionStorage from their current login attempt
- **Appeal deadlines are not communicated** - users don't know they have 30 days to appeal
- **No notification history** - if user clears sessionStorage, they lose all ban details
- **Unprofessional experience** - users feel abandoned with no way to contact support
- **Wasted resources** - system generates notifications nobody can read
- **Similar issue for unbanned users** - when an admin unbans a user, NO notification is sent at all (they just discover it when login suddenly works)

**Where in code:**
- Ban notification sent: `src/app/api/admin/reports/summary/[summaryId]/route.js` (lines 228-244)
- Ban check during login: `src/hooks/useAuth.js` (lines 130-146)
- Banned page display: `src/app/banned/page.js`
- Notification template: `src/utils/notifications/notificationTemplates.js` (lines 42-48)
- In-app notification function: `src/utils/notifications/sendInAppNotification.js`

---

### 2. **Email System Should Replace In-App Notifications for Banned Users**

**Best solution:**
Replace in-app notifications with **email notifications** for ban/unban actions, since banned users cannot access their account.

**Why email is the right solution:**
- ✅ Users receive ban notification even when locked out
- ✅ Email provides permanent record they can reference later
- ✅ Appeal deadline information is preserved in their inbox
- ✅ Professional and industry-standard approach
- ✅ Works for both banned and unbanned notifications

**Current email infrastructure:**
The project already has Firebase Authentication which sends emails for:
- Email verification (`sendEmailVerification` in `src/hooks/useAuth.js` line 176)
- Password reset (`sendPasswordResetEmail` in `src/hooks/useAuth.js` line 279)

However, there's **NO custom email service** for moderation notifications yet.

**Implementation Tasks:**

#### **Task 1: Choose and Setup Email Service Provider**

**Options to consider:**
1. **MailerSend** (RECOMMENDED for this project - includes free trial domain, no DNS setup needed)
   - Modern, developer-friendly API
   - Simple pricing: $20/month for 50,000 emails
   - React Email templates support (great for Next.js projects)
   - Fast setup, excellent docs
   - Free tier: 100 emails/day for testing

2. **SendGrid**
   - Enterprise-grade, very reliable
   - Free tier: 100 emails/day forever
   - More complex API and setup
   - Good for high-volume needs

3. **Mailgun**
   - Pay-as-you-go pricing
   - Free tier: 5,000 emails/month
   - Good for developers
   - Flexible routing rules

4. **Firebase Extensions - Trigger Email**
   - Built into Firebase ecosystem
   - Uses SendGrid/Mailgun under the hood
   - Requires Firebase Blaze plan (pay-as-you-go)
   - Less code but less control

**Setup steps (using MailerSend):**
```bash
# 1. Install package
npm install mailersend

# 2. Get API key from https://mailersend.com
# 3. Add to environment variables
MAILERSEND_API_KEY=mlsn_xxxxxxxxx

# 4. Use trial sender domain (no verification needed!)
# MailerSend provides trial.mailersend.net for free tier
```

---

#### **Task 2: Create Email Utility Function**

**Create:** `src/utils/notifications/sendEmail.js`

```javascript
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

export async function sendEmail({ to, subject, html, from = 'noreply@trial.mailersend.net' }) {
  try {
    console.log('[EMAIL] Sending to:', to);
    console.log('[EMAIL] Subject:', subject);

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, and html');
    }

    const sentFrom = new Sender(from, 'Twibbonize');
    const recipients = [new Recipient(to, to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(html);

    const result = await mailerSend.email.send(emailParams);

    console.log('[EMAIL] Sent successfully:', result.body?.messageId || 'sent');

    return {
      success: true,
      emailId: result.body?.messageId || 'sent',
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('[EMAIL] Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
```

**Why this design:**
- Mirrors existing `sendInAppNotification.js` structure
- Easy to swap email providers by changing only this file
- Returns consistent success/error format
- Includes logging for debugging

---

#### **Task 3: Create Email Templates**

**Create:** `src/utils/notifications/emailTemplates.js`

```javascript
export const getEmailTemplate = (templateName, params = {}) => {
  const templates = {
    accountBanned: ({ userEmail, username, banReason, appealDeadline, isPermanent }) => ({
      subject: '🚫 Your Account Has Been Suspended',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚫 Account Suspended</h1>
            </div>
            <div class="content">
              <p>Hello ${username || userEmail},</p>
              
              <p>Your Twibbonize account has been ${isPermanent ? 'permanently' : 'temporarily'} suspended by our moderation team.</p>
              
              <div class="warning-box">
                <strong>Reason for suspension:</strong>
                <p>${banReason}</p>
              </div>
              
              ${!isPermanent ? `
                <p><strong>Appeal Deadline:</strong> ${appealDeadline}</p>
                <p>You have the right to appeal this decision within 30 days. If you believe this suspension was made in error, you can submit an appeal before the deadline.</p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL}/appeal" class="button">Submit an Appeal</a>
                </p>
              ` : `
                <p>This is a permanent suspension. Your account will not be restored.</p>
              `}
              
              <p>If you have any questions, please contact our support team at support@twibbonize.com</p>
            </div>
            <div class="footer">
              <p>Twibbonize Moderation Team</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }),

    accountUnbanned: ({ userEmail, username }) => ({
      subject: '✅ Your Account Has Been Restored',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .success-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Account Restored</h1>
            </div>
            <div class="content">
              <p>Hello ${username || userEmail},</p>
              
              <div class="success-box">
                <p><strong>Good news!</strong> Your Twibbonize account has been reviewed and restored by our moderation team.</p>
              </div>
              
              <p>You can now log in and access your account normally. We appreciate your patience during the review process.</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/signin" class="button">Sign In Now</a>
              </p>
              
              <p>Please remember to follow our community guidelines to avoid future issues. If you have any questions, contact us at support@twibbonize.com</p>
            </div>
            <div class="footer">
              <p>Twibbonize Moderation Team</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }),

    warningIssued: ({ userEmail, username, reason }) => ({
      subject: '⚠️ Warning Issued for Your Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Warning Issued</h1>
            </div>
            <div class="content">
              <p>Hello ${username || userEmail},</p>
              
              <p>You've received a warning from our moderation team regarding your account activity.</p>
              
              <div class="warning-box">
                <strong>Reason for warning:</strong>
                <p>${reason}</p>
              </div>
              
              <p>This is a formal warning. Your account remains active, but please review our community guidelines to ensure future content complies with our policies.</p>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Review our community guidelines</li>
                <li>Make necessary changes to your content</li>
                <li>Contact support if you have questions</li>
              </ul>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/guidelines" class="button">View Guidelines</a>
              </p>
              
              <p>Repeated violations may result in account suspension. If you have any questions, contact us at support@twibbonize.com</p>
            </div>
            <div class="footer">
              <p>Twibbonize Moderation Team</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }),
  };

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Email template "${templateName}" not found`);
  }

  return typeof template === 'function' ? template(params) : template;
};
```

**Design notes:**
- Professional HTML email design with inline CSS (works across all email clients)
- Consistent branding with color codes (red for ban, green for unban, yellow for warning)
- Mobile-responsive design
- Clear call-to-action buttons
- Matches notification template structure for consistency

---

#### **Task 4: Update Admin Ban Endpoint to Send Emails**

**Modify:** `src/app/api/admin/reports/summary/[summaryId]/route.js`

**Current code (lines 228-244):**
```javascript
// Currently ONLY sends in-app notification
else if (action === 'removed') {
  const appealDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const formattedDeadline = appealDeadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const notification = targetType === 'campaign' 
    ? getNotificationTemplate('campaignRemoved', { ... })
    : getNotificationTemplate('accountBanned', { banReason: reason, appealDeadline: formattedDeadline });
  
  await sendInAppNotification({ ... }); // ❌ Banned users can't see this!
}
```

**Updated code (SHOULD BE):**
```javascript
else if (action === 'removed') {
  const appealDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const formattedDeadline = appealDeadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const userId = targetType === 'campaign' ? summaryData.creatorId : targetId;
  
  if (targetType === 'user') {
    // For BANNED USERS: Send EMAIL instead of in-app notification
    const { sendEmail } = await import('@/utils/notifications/sendEmail');
    const { getEmailTemplate } = await import('@/utils/notifications/emailTemplates');
    
    // Get user email from database
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (userData?.email) {
      const isPermanent = userData.accountStatus === 'banned-permanent';
      const emailTemplate = getEmailTemplate('accountBanned', {
        userEmail: userData.email,
        username: userData.displayName || userData.username,
        banReason: reason,
        appealDeadline: formattedDeadline,
        isPermanent: isPermanent,
      });
      
      await sendEmail({
        to: userData.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      }).catch(err => console.error('Failed to send ban email:', err));
    }
  } else {
    // For CAMPAIGN REMOVALS: Keep in-app notification (user can still log in)
    const notification = getNotificationTemplate('campaignRemoved', { 
      campaignTitle: summaryData.campaignTitle, 
      appealDeadline: formattedDeadline, 
      removalReason: reason 
    });
    
    await sendInAppNotification({
      userId,
      title: notification.title,
      body: notification.body,
      actionUrl: notification.actionUrl,
      icon: notification.icon,
      type: notification.type,
    });
  }
}
```

**Key changes:**
- Check if target is user (banned account) vs campaign (removed content)
- For banned users: send EMAIL instead of in-app notification
- For removed campaigns: keep in-app notification (creator can still access account)
- Fetch user email from Firestore users collection
- Handle permanent vs temporary bans differently in email

---

#### **Task 5: Add Email Notification for Unbanning Users**

**Modify:** `src/app/api/admin/users/[userId]/ban/route.js`

**Current code:**
- Lines 83-89: Updates user status to `active` when unbanning
- **NO notification sent at all** ❌

**Add this code after line 91 (after `userRef.update(updateData)`):**
```javascript
await userRef.update(updateData);

// NEW CODE: Send email notification when unbanning a user
if (accountStatus === 'active' && userDoc.data().banned === true) {
  // User is being unbanned - send email notification
  const { sendEmail } = await import('@/utils/notifications/sendEmail');
  const { getEmailTemplate } = await import('@/utils/notifications/emailTemplates');
  
  const userData = userDoc.data();
  
  if (userData?.email) {
    const emailTemplate = getEmailTemplate('accountUnbanned', {
      userEmail: userData.email,
      username: userData.displayName || userData.username,
    });
    
    await sendEmail({
      to: userData.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }).catch(err => console.error('Failed to send unban email:', err));
  }
}

const updatedDoc = await userRef.get();
```

**Why this matters:**
- Currently, unbanned users discover they're unbanned by **accidentally trying to login**
- No communication from platform about account restoration
- Professional platforms (Twitter, Reddit) always notify users when reinstated
- Builds trust and shows platform cares about user experience

---

#### **Task 6: Update Warning Notifications to Send Emails Too**

**Modify:** `src/app/api/admin/reports/summary/[summaryId]/route.js` (lines 215-227)

**Current code:**
```javascript
else if (action === 'warned') {
  const notification = getNotificationTemplate('warningIssued', { reason: reason });
  
  await sendInAppNotification({ ... }); // Only in-app
}
```

**Updated code (SEND BOTH EMAIL + IN-APP):**
```javascript
else if (action === 'warned') {
  // Send in-app notification (user can still access account)
  const notification = getNotificationTemplate('warningIssued', { reason: reason });
  
  await sendInAppNotification({
    userId,
    title: notification.title,
    body: notification.body,
    actionUrl: notification.actionUrl,
    icon: notification.icon,
    type: notification.type,
  });
  
  // ALSO send email for important warnings (belt-and-suspenders approach)
  const { sendEmail } = await import('@/utils/notifications/sendEmail');
  const { getEmailTemplate } = await import('@/utils/notifications/emailTemplates');
  
  const userDoc = targetType === 'campaign' 
    ? await db.collection('users').doc(summaryData.creatorId).get()
    : await db.collection('users').doc(targetId).get();
  
  const userData = userDoc.data();
  
  if (userData?.email) {
    const emailTemplate = getEmailTemplate('warningIssued', {
      userEmail: userData.email,
      username: userData.displayName || userData.username,
      reason: reason,
    });
    
    await sendEmail({
      to: userData.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }).catch(err => console.error('Failed to send warning email:', err));
  }
}
```

**Why send both email + in-app for warnings:**
- Warned users CAN still access account (not banned)
- Email ensures they don't miss the warning
- In-app notification provides in-app history
- Industry best practice: important moderation actions always get email

---

#### **Task 7: Add Environment Variables**

**Add to `.env.local`:**
```bash
# Email Service (MailerSend)
MAILERSEND_API_KEY=mlsn_your_api_key_here

# Base URL for email links
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

**Add to `.env.example`:**
```bash
# Email Service
MAILERSEND_API_KEY=
NEXT_PUBLIC_BASE_URL=
```

---

#### **Task 8: Remove or Keep In-App Notifications?**

**Decision needed:** What to do with existing in-app ban notifications?

**Option A: Remove completely** (RECOMMENDED)
- Remove `sendInAppNotification` for ban actions
- Saves Firestore writes
- Cleaner code
- Users can't access them anyway

**Option B: Keep as backup**
- Send both email AND in-app notification
- Provides notification history if user is unbanned
- Small extra cost (1 Firestore write per ban)

**Recommendation:** Option A - remove in-app notifications for bans since they're inaccessible and wasteful.

---

### **Summary of Changes Required:**

1. ✅ **Choose email provider** (MailerSend recommended)
2. ✅ **Install email package** (`npm install mailersend`)
3. ✅ **Create `sendEmail.js`** utility function
4. ✅ **Create `emailTemplates.js`** with ban/unban/warning templates
5. ✅ **Update ban endpoint** to send email instead of in-app notification for users
6. ✅ **Update unban endpoint** to send email notification (currently missing)
7. ✅ **Update warning endpoint** to send both email + in-app notification
8. ✅ **Add environment variables** for email API key
9. ✅ **Test thoroughly** with real email addresses

**Files to create:**
- `src/utils/notifications/sendEmail.js` (new)
- `src/utils/notifications/emailTemplates.js` (new)

**Files to modify:**
- `src/app/api/admin/reports/summary/[summaryId]/route.js` (ban and warning notifications)
- `src/app/api/admin/users/[userId]/ban/route.js` (unban notifications)
- `.env.local` (add MAILERSEND_API_KEY)
- `.env.example` (document required env vars)

**Estimated effort:**
- Setup email provider: 30 minutes
- Create utility + templates: 2 hours
- Update endpoints: 1 hour
- Testing: 1 hour
- **Total: ~4-5 hours**

**Monthly cost estimate:**
- MailerSend: $0 (free tier: 12,000 emails/month with trial domain)
- For 10,000 moderation emails/month: $20/month

---

## ⚠️ Important Issues

### 5. **No Reminder for Appeal Deadlines**

**What's the problem?**
When a campaign is removed or user is banned, they have 30 days to appeal. But the system doesn't remind them as the deadline approaches.

**What does this mean?**
Users might forget to appeal until it's too late.

**Example:**
- User gets banned on January 1st
- They have until January 31st to appeal
- On January 30th (1 day left), no reminder is sent
- User forgets and misses the deadline
- Content is permanently deleted

**Impact:**
- Users miss their appeal window
- More angry users claiming the system is unfair
- Support team has to deal with "I missed the deadline" requests
- Could lead to users feeling the platform doesn't give them a fair chance

**Best solution:**
Send automatic reminders:
- **7 days before deadline:** "Reminder: You have 7 days left to appeal"
- **3 days before deadline:** "Reminder: You have 3 days left to appeal"  
- **1 day before deadline:** "Final reminder: Appeal deadline is tomorrow"

**Note:**
This requires a scheduled job (cron job) that runs daily to check appeal deadlines and send reminders.

---

### 6. **Appeal System Shows Deadlines But Can't Actually Appeal**

**What's the problem?**
When a user is banned or their campaign is removed, the system:
- Sets a 30-day appeal deadline
- Sends a notification saying "You can appeal until [date]"
- But there's no actual way to submit an appeal!

**What does this mean?**
Users are promised they can appeal, but when they try to find how, there's nothing there.

**Example:**
User gets notification: "Your campaign has been removed. You can appeal until February 20."
User thinks: "Okay, let me appeal"
User searches for appeal button: **Nothing found**
User gets frustrated: "They said I could appeal but there's no way to do it!"

**Impact:**
- User frustration (promised feature doesn't exist)
- Misleading notifications
- Support tickets from confused users
- Platform looks unprofessional
- Database fields (`appealDeadline`, `appealCount`) are set but never used

**Where in code:**
- `src/app/api/admin/reports/summary/[summaryId]/route.js` (lines 127, 133)

**Best solution:**
Three options:
- **Option 1:** Build the complete appeals system (see TASKS.md Section 9.2 for details)
- **Option 2:** Remove appeal references from notifications and stop setting appealDeadline/appealCount
- **Option 3:** Add a placeholder appeal page that says "Appeals system coming soon - contact support@example.com for urgent cases"

**Recommendation:** Option 3 as a quick fix, then implement Option 1 later.

---

## 💡 Suggestions for Improvements

### 8. **Missing Status Transition Validation**

**What's the problem?**
The system doesn't check if status changes make sense. An admin could accidentally restore something that should stay permanently deleted.

**Example scenarios:**
- A campaign with `removed-permanent` status could be restored to `active` by dismissing reports
- A `banned-permanent` user could be warned and become `active` again
- No check prevents invalid state transitions

**What does this mean?**
"Permanent" removals/bans aren't actually permanent if admin clicks wrong button.

**Impact:**
- Business rules not enforced (permanent doesn't mean permanent)
- Potential for data integrity issues
- Confusing for admins (what does "permanent" mean if it can be reversed?)

**Best solution:**
Add status transition validation in the admin action endpoint:

```javascript
// Define valid transitions
const VALID_TRANSITIONS = {
  'active': ['under-review-hidden', 'removed-temporary', 'banned-temporary'],
  'under-review-hidden': ['active', 'removed-temporary', 'banned-temporary'],
  'removed-temporary': ['active', 'removed-permanent'],
  'banned-temporary': ['active', 'banned-permanent'],
  'removed-permanent': [], // Cannot transition out
  'banned-permanent': [], // Cannot transition out
};

// Check before updating
if (!VALID_TRANSITIONS[currentStatus].includes(newStatus)) {
  throw new Error('Invalid status transition');
}
```

---


## ✅ Recently Fixed Issues

The following issues have been fixed and are working correctly:

### October 23, 2025 (Latest):

**Issue #6 - Notification Parameters Could Be Mixed Up (RESOLVED)**
- ✅ Fixed notification template functions to accept objects instead of positional parameters
- ✅ Eliminated risk of parameter order being mixed up
- ✅ All notification templates now use destructured object parameters
- ✅ Ensures users receive notifications with correct information in correct places
- **Where fixed:**
  - `src/utils/notifications/notificationTemplates.js` - Updated all template functions to use object destructuring
- **Implementation:**
  - Changed template functions from `(param1, param2, param3)` to `({ param1, param2, param3 })`
  - Updated `getNotificationTemplate()` to pass params object directly instead of using `Object.values()`
  - All existing callers already pass objects, so no breaking changes
- **Before:** `campaignRemoved: (campaignTitle, appealDeadline, removalReason) => ({...})`
- **After:** `campaignRemoved: ({ campaignTitle, appealDeadline, removalReason }) => ({...})`
- **Impact:** Notifications now always display correct information, no risk of parameter order issues, more maintainable code

---

### October 22, 2025:

**Issue #1 - Can't Track Which Admin Did What (RESOLVED)**
- ✅ Fixed admin ID tracking to use real authenticated admin data
- ✅ Created comprehensive admin action logging system
- ✅ Built dedicated admin logs page with filtering and search
- ✅ All admin actions now properly tracked with full accountability
- **Where fixed:**
  - `src/utils/logAdminAction.js` - New utility function to log all admin actions
  - `src/app/api/admin/reports/summary/[summaryId]/route.js` - Captures real admin ID from auth token
  - `src/app/api/admin/logs/route.js` - New API endpoint to fetch admin logs
  - `src/app/(chrome)/admin/logs/page.js` - New admin logs UI page
  - `src/components/admin/AdminLogsTable.js` - Table component to display logs
  - `src/components/admin/AdminSidebar.js` - Added "Logs" navigation link
- **Implementation:**
  1. Created `adminLogs` Firestore collection to store all admin actions
  2. Updated admin action endpoint to use `requireAdmin()` return value for admin ID
  3. Added admin ID, email, and name to warning records
  4. Log every admin action (dismissed, warned, removed) with full context
  5. Built admin logs page with filters: action type, target type, admin, limit
  6. Display logs in table with timestamp, admin, action, target, reason, reports count
- **Data tracked for each action:**
  - Admin ID, email, and display name
  - Action type (dismissed, warned, removed)
  - Target type (campaign or user) and target ID/title
  - Reason provided by admin
  - Report summary ID
  - Previous status and reports count
  - Timestamp
- **Impact:** Full admin accountability, performance tracking, mistake identification, pattern analysis, audit trail for all moderation decisions

**Issue #8 - Performance: Database Reads Could Be Optimized (RESOLVED)**
- ✅ Eliminated N+1 query problem in admin reports dashboard
- ✅ Reduced database reads from ~76 to ~3 per page load (96% reduction!)
- ✅ Implemented Firestore batch `getAll()` for efficient data fetching
- ✅ Much faster page load times for admin dashboard
- **Where fixed:**
  - `src/app/api/admin/reports/grouped/route.js` - Complete refactor using batch fetching
- **Implementation:**
  1. Collect all unique IDs (campaigns, users, creators) from report summaries
  2. Use `db.getAll()` to batch fetch all campaigns in one query
  3. Use `db.getAll()` to batch fetch all users in one query (parallel with campaigns)
  4. Build lookup maps for O(1) access when populating summary data
  5. Map through summaries and populate with pre-fetched data
- **Performance improvement:**
  - Before: 1 query for summaries + 50 individual campaign queries + 25 individual user queries = ~76 reads
  - After: 1 query for summaries + 1 batch query for campaigns + 1 batch query for users = 3 reads
  - Result: **96% reduction in database operations** for admin dashboard
- **Impact:** Faster admin dashboard, lower database costs, better scalability with more reports

**Issue #9 - Authenticated Users Can Bypass Report Limits (RESOLVED)**
- ✅ Fixed authenticated users bypassing rate limits by switching networks
- ✅ Added userId tracking for logged-in users in addition to IP tracking
- ✅ Duplicate detection now checks BOTH IP address AND userId for authenticated users
- ✅ Anonymous reporters continue to be tracked by IP only
- **Where fixed:**
  - `src/utils/reportRateLimit.js` - Added userId parameter and duplicate check by userId
  - `src/app/api/reports/submit/route.js` - Pass reportedBy (userId) to rate limit check
  - `src/app/api/reports/user/route.js` - Pass reportedBy (userId) to rate limit check
- **Implementation:** When userId is provided and not 'anonymous', system checks if that userId has already reported the same target, preventing network-switching bypass
- **Impact:** Closed report spam loophole, ensures one user = one report per target regardless of IP address

**Issue #10 - Rate Limit Data Never Gets Cleaned Up (RESOLVED)**
- ✅ Implemented Firestore TTL (Time To Live) for automatic cleanup
- ✅ Rate limit documents now auto-delete after 24 hours
- ✅ No manual cleanup or cron jobs needed
- ✅ Prevents unlimited database growth
- **Where fixed:**
  - `src/utils/reportRateLimit.js` - Added `expireAt` field with 24-hour TTL
- **Implementation:** Each rate limit document includes `expireAt: oneDayFromNow` timestamp. Firestore automatically deletes documents when this timestamp is reached
- **Why 24 hours?** Rate limit is 5 reports per hour, but 24-hour retention provides safety buffer and potential audit trail while still preventing unlimited growth
- **Impact:** Automatic cleanup prevents database bloat, reduces storage costs, maintains query performance over time

---

### October 22, 2025 (Earlier):

**Critical Issue #1 - Report Counts Synchronization (RESOLVED)**
- ✅ Fixed counter synchronization between reportSummary and campaign/user documents
- ✅ When new reports come in after admin action, BOTH counters now reset to 1 simultaneously
- ✅ Eliminated temporary mismatches that confused admins during pending review periods
- ✅ Updated both campaign and user profile report submission logic
- **Where fixed:**
  - `src/app/api/reports/submit/route.js` (lines 75-93, 120-135)
  - `src/app/api/reports/user/route.js` (lines 79-93, 130-145)
- **Implementation:** When `isResettingCounts = true`, both the target document (campaign/user) and reportSummary document set `reportsCount: 1` in the same transaction
- **Impact:** Eliminated admin confusion, ensured accurate report counts across all system components

**Critical Issue #2 - Typed Confirmation for Admin Actions (RESOLVED)**
- ✅ Implemented "type CONFIRM to proceed" requirement for all dangerous admin actions
- ✅ Prevents accidental clicks on Ban/Remove/Warn actions
- ✅ Two-step confirmation process provides safety without slowing down workflow
- **Where implemented:**
  - `src/components/ConfirmationModal.js` - Reusable modal with typed confirmation feature
  - `src/components/admin/ReportDetailsPanel.js` (line 461) - Warn and Remove actions require typing "CONFIRM"
  - `src/components/admin/UserDetailsModal.js` (lines 387-401) - Ban User action requires typing "CONFIRM"
- **How it works:**
  1. Admin selects action and fills in required details (reason, ban type, etc.)
  2. Clicks "Continue" to proceed to confirmation modal
  3. Must type "CONFIRM" (exact match, case-sensitive) to enable the confirm button
  4. Clicking outside or pressing ESC cancels the action safely
- **User experience:**
  - Unban actions don't require typed confirmation (restoring access is low-risk)
  - Dismiss report actions don't require typed confirmation (restoring content is low-risk)
  - Only destructive actions (Ban, Remove, Warn) require typing "CONFIRM"
- **Impact:** Eliminated accidental bans/removals, reduced admin stress, improved platform safety

---

### October 19, 2025:

**Critical Issue 1 - Dual Database Collections (RESOLVED)**
- ✅ Removed all legacy `reports` collection code from campaign deletion API
- ✅ Refactored `/api/admin/reports` endpoint to use `reportSummary` instead of legacy `reports` collection
- ✅ Campaign deletion now calculates reportsDismissed count from reportSummary directly
- ✅ All report queries now consistently use the optimized `reportSummary` collection
- **Impact:** Eliminated data inconsistency, removed wasted database operations, achieved full 95% performance improvement

**Critical Issue 2 - Dual Status Fields for Users (RESOLVED)**
- ✅ Unified user status to use `accountStatus` exclusively across all systems
- ✅ Campaigns continue using `moderationStatus` (clear distinction between entity types)
- ✅ Updated report submission APIs to use `accountStatus` for users
- ✅ Updated report action endpoints to use `accountStatus` for users
- ✅ Updated admin UI components to display `accountStatus` for users
- ✅ Updated all backend queries to use `accountStatus` for users
- **Impact:** Eliminated field conflicts, consistent ban enforcement, clear semantic distinction between user accounts and campaign content

**Files Updated:**
- Backend APIs: `src/app/api/campaigns/[campaignId]/route.js`, `src/app/api/admin/reports/route.js`, `src/app/api/admin/reports/summary/[summaryId]/route.js`, `src/app/api/admin/reports/grouped/route.js`, `src/app/api/reports/user/route.js`
- Frontend Components: `src/components/admin/ReportDetailsPanel.js`, `src/components/admin/GroupedReportsTable.js`
- Documentation: `CODE_INCONSISTENCIES.md`, `REPORT_SYSTEM.md`

**Other Fixes:**

1. ✅ **IP-Based Rate Limiting for Reports** - Prevents report spam and abuse
   - Maximum 5 reports per hour per IP address
   - Duplicate prevention: Same IP cannot report the same target multiple times
   - IP addresses are hashed (SHA-256) for privacy
   - Rate limit data stored in Firestore `reportRateLimits` collection
   - Automatic cleanup of reports older than 1 hour
   - Returns HTTP 429 status code with clear error messages
   - Applies to both campaign and user profile reports
   - File: `src/utils/reportRateLimit.js`

2. ✅ **Admin Reason Selection for Warnings and Bans** - Frontend UI implementation
   - Added reason dropdown modal when admins take "Warn" or "Ban/Remove" actions
   - Admin must select a reason before confirming the action
   - Available reasons: Inappropriate content, Spam, Harassment, Misinformation, Copyright violation, Other
   - Selected reason is included in the API request and stored with the action
   - Notifications to users now include the specific reason selected by admin
   - Two-step confirmation process: Select reason → Confirm action
   - File: `src/components/admin/ReportDetailsPanel.js`

3. ✅ **Campaign Deletion Feature** - Users can now delete their own campaigns
   - Delete button appears in campaign menu on /profile page (only for campaign owners)
   - DELETE API endpoint at `/api/campaigns/[campaignId]`
   - Confirmation modal prevents accidental deletions
   - Deletes campaign from Firestore and Supabase storage
   - Automatically dismisses all related reports
   - Updates user's campaign count
   - Shows success message with count of auto-dismissed reports
   - Files: `src/app/api/campaigns/[campaignId]/route.js`, `src/components/CampaignGallery.js`, `src/components/ProfilePage.js`

4. ✅ **Issue #1 RESOLVED: Deleted Campaigns No Longer Show in Reports**
   - Campaign deletion now auto-dismisses all pending/reviewed reports
   - Report summary status updated to 'dismissed' with moderationStatus: 'deleted'
   - Admin dashboard filters properly exclude dismissed reports
   - Added safety checks to detect deleted campaigns in report queries
   - Reports for deleted campaigns show `campaignDeleted: true` flag
   - Report summaries for deleted targets show `targetDeleted: true` flag
   - Admins no longer waste time on non-existent content
   - Files: `src/app/api/campaigns/[campaignId]/route.js`, `src/app/api/admin/reports/route.js`, `src/app/api/admin/reports/grouped/route.js`

### October 18, 2025:
1. ✅ **Notifications for restored content** - Now correctly sent when admins dismiss reports
2. ✅ **User account restoration** - Users fully restored when reports are dismissed
3. ✅ **Warning behavior** - Content is now visible again after warnings (warnings are "slap on the wrist," not removal)
4. ✅ **Input validation** - System now validates that reports are for valid target types (campaign or user)
5. ✅ **Standardized status fields** - Reporting system now uses only `moderationStatus` for consistent tracking
6. ✅ **Reason selection for actions** - Admins can now specify reasons for warnings and bans that are included in notifications
7. ✅ **Appeal deadline in notifications** - Ban/removal notifications now include appeal deadline (30 days)

---

## 📝 Notes

**Last reviewed:** October 22, 2025

**Status Field Naming Rationale:**
The codebase uses different field names for campaigns vs users intentionally:
- **Campaigns:** `moderationStatus` (tracks content moderation state: active, removed, etc.)
- **Users:** `accountStatus` (tracks account access state: active, banned, etc.)

This is **correct and should be kept** because:
✅ They represent different concepts (content moderation vs account access)
✅ Prevents field name conflicts when handling both types in the same code
✅ Makes code more readable and semantically accurate
✅ Consistent usage throughout the entire codebase

**IP Address Storage & Privacy:**
The rate limiting system stores IP addresses securely:
- IPs are **SHA-256 hashed** before storage (never stored raw)
- Stored in Firestore `reportRateLimits` collection with ipHash as document ID
- Each document contains array of recent reports with timestamps
- Reports older than 1 hour are filtered out when checking limits
- ⚠️ **Issue #10:** Old data is never deleted - documents grow indefinitely
- **Recommendation:** Implement Firestore TTL to auto-delete documents older than 7 days

**Testing recommendations:**
- Test report counter synchronization: Submit report → Admin dismiss → Submit new report → Verify both counters show same value
- Test typed confirmation: Try to ban user → Verify you must type "CONFIRM" → Try typing wrong text → Verify button stays disabled
- Test typed confirmation: Click "Cancel" or click outside modal → Verify action is cancelled safely
- Test IP-based rate limiting by submitting multiple reports from same IP
- Test duplicate report prevention
- Test admin reason selection modal appears when clicking "Warn" or "Ban/Remove"
- Test that "Continue" button is disabled until a reason is selected
- Test notification content includes the admin-selected reason and appeal deadline
- Test that warning and ban actions fail if reason is not provided
- Test campaign deletion: Delete button only visible on own profile
- Test campaign deletion: Confirmation modal appears before deletion
- Test campaign deletion: Related reports are auto-dismissed
- Test campaign deletion: User's campaign count decreases
- Test admin dashboard: Deleted campaign reports don't appear in pending queue
- Test that authenticated users can bypass rate limits by changing networks
- Test notification parameter order with different scenarios
- Review admin logs to confirm action tracking works

**Future considerations:**
- Add automated tests for all admin actions
- Create admin troubleshooting guide
- Consider adding API documentation for developers
- Implement appeal system (see TASKS.md Section 9.2)
- Add status transition validation
- Implement automatic rate limit cleanup
- Track authenticated user reports by userId
- Keep reason count history for pattern analysis

---

## 📊 Documentation Update Summary

**Latest Update:** October 23, 2025

**Issues Resolved:**
1. ✅ **FIXED:** Report counts synchronization between reportSummary and campaign/user documents (October 22, 2025)
2. ✅ **FIXED:** Typed confirmation required for all dangerous admin actions (October 22, 2025)
3. ✅ **FIXED:** Notification template parameter order could get mixed up (October 23, 2025)

**Active Issues:**
1. 🔴 **CRITICAL:** Banned users cannot see their ban notifications (in-app notifications inaccessible when logged out)
2. 🔴 **CRITICAL:** Email system should replace in-app notifications for banned users (comprehensive implementation guide added)
3. ⚠️ **IMPORTANT:** No reminder for appeal deadlines
4. ⚠️ **IMPORTANT:** Appeal system shows deadlines but can't actually appeal
5. 💡 **SUGGESTION:** Missing status transition validation

**Documentation Quality:**
- All issues explained in simple, non-technical language
- Added "What's the problem?", "What does this mean?", "Impact", and "Best solution" sections
- Technical explanations included for developers
- Code locations added for each issue
- Examples provided to illustrate problems
- Clear priority indicators (🔴 Critical, ⚠️ Important, 💡 Suggestion)

---

**End of Document**
