# Vercel Cron Jobs Setup Guide

This document explains how to set up two automated cron jobs for the Twibbonize moderation system on Vercel.

---

## Overview of Cron Jobs

Your project uses **2 Vercel Cron Jobs** (maximum on free tier):

### 1. Cleanup Expired Appeals (Critical)
- **Path:** `/api/cron/cleanup-expired-appeals`
- **Schedule:** Daily at 2:00 AM (`0 2 * * *`)
- **Purpose:** Automatically upgrades expired temporary removals/bans to permanent status
- **Actions:**
  - Finds campaigns with `removed-temporary` status and expired `appealDeadline`
  - Finds users with `banned-temporary` status and expired `appealDeadline`
  - Upgrades to `removed-permanent` or `banned-permanent`
  - Sends in-app notification for campaigns (users can still log in)
  - Sends email notification for permanent bans (users cannot log in)
  - Logs all actions to adminLogs collection

### 2. Send Appeal Deadline Reminders (Important)
- **Path:** `/api/cron/send-appeal-reminders`
- **Schedule:** Daily at 10:00 AM (`0 10 * * *`)
- **Purpose:** Sends reminders to users about upcoming appeal deadlines
- **Actions:**
  - Checks for appeals expiring in 7, 3, and 1 days
  - Sends both in-app notifications and email reminders
  - Includes countdown timer and direct appeal link
  - Helps users avoid missing their appeal window

---

## Setup Instructions

Follow these steps to configure both cron jobs on Vercel.

### Step 1: Generate a CRON_SECRET

Generate a random secret string to secure your cron endpoints:

```bash
# On Linux/Mac
openssl rand -base64 32

# Or use an online generator
# Visit: https://www.random.org/strings/
```

Copy the generated string (keep it secret and secure).

---

### Step 2: Add Environment Variables on Vercel

1. Go to your Vercel project dashboard: `https://vercel.com/your-username/your-project`
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `CRON_SECRET` | (Your generated secret) | Production |

4. Click **Save**

**Important:** You should also have these email-related variables already set:
- `MAILERSEND_API_KEY` (for sending emails)
- `NEXT_PUBLIC_BASE_URL` (for email links)

---

### Step 3: Deploy to Vercel

**Important:** Vercel Cron Jobs only work in production, NOT in local development.

1. Commit and push your code to GitHub (or your Git provider):
   ```bash
   git add .
   git commit -m "Add Vercel cron jobs for moderation automation"
   git push origin main
   ```

2. Vercel will automatically deploy your changes

3. Wait for deployment to complete (usually 1-2 minutes)

---

### Step 4: Verify Cron Jobs are Configured

After deployment completes:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Cron Jobs**
3. You should see **2 active cron jobs**:

   | Path | Schedule | Description |
   |------|----------|-------------|
   | `/api/cron/cleanup-expired-appeals` | `0 2 * * *` | Runs daily at 2:00 AM |
   | `/api/cron/send-appeal-reminders` | `0 10 * * *` | Runs daily at 10:00 AM |

4. Both should show **Status: Active** with a green indicator

**Screenshot Location:** Settings → Cron Jobs (sidebar)

---

## Testing the Cron Jobs

### Manual Testing (Optional)

You can manually trigger each endpoint to verify they work:

#### Test Cleanup Job
```bash
curl -X GET https://your-domain.vercel.app/api/cron/cleanup-expired-appeals \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "processed": {
    "campaigns": 0,
    "users": 0
  },
  "executedAt": "2025-10-26T02:00:00.000Z"
}
```

#### Test Reminder Job
```bash
curl -X GET https://your-domain.vercel.app/api/cron/send-appeal-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "remindersProcessed": {
    "campaigns": { "day7": 0, "day3": 0, "day1": 0 },
    "users": { "day7": 0, "day3": 0, "day1": 0 }
  },
  "executedAt": "2025-10-26T10:00:00.000Z"
}
```

**Replace:**
- `your-domain.vercel.app` with your actual Vercel domain
- `YOUR_CRON_SECRET` with the secret from your environment variables

---

## Monitoring Cron Job Execution

### Method 1: Via Vercel Function Logs

1. Go to your Vercel project dashboard
2. Navigate to **Deployments** → Select your **production** deployment
3. Click **Functions** tab
4. Look for the cron job endpoints:
   - `/api/cron/cleanup-expired-appeals`
   - `/api/cron/send-appeal-reminders`
5. View execution logs, timing, and any errors

**Logs show:**
- Execution timestamp
- Response status (200 = success)
- Duration (should be under 10 seconds for each)
- Any console output or errors

### Method 2: Via Admin Logs (In Your App)

1. Login to your app as admin
2. Go to `/admin/logs`
3. Filter by admin: **system**
4. Look for these action types:
   - `auto_permanent_removal` (cleanup job - campaigns)
   - `auto_permanent_ban` (cleanup job - users)

**Note:** Reminder emails don't create admin logs (they're user notifications, not moderation actions).

### Method 3: Check User Email Inbox

If you have test accounts with temporary removals/bans:
- Reminders will be sent 7, 3, and 1 days before deadline
- Check the test user's email inbox for reminder emails
- Subject: "⏰ Appeal Deadline Reminder - X Days Left"

---

## Troubleshooting

### Problem: Cron Jobs Not Visible in Vercel

**Check:**
1. Did you deploy to production? (Push to main branch)
2. Is `vercel.json` in the root of your repository?
3. Did the deployment complete successfully?

**Solution:**
- Verify `vercel.json` exists and has correct syntax
- Redeploy: `git commit --allow-empty -m "Trigger redeploy" && git push`

---

### Problem: Unauthorized Error (401)

**Error Message:** `{ "error": "Unauthorized" }`

**Cause:** `CRON_SECRET` mismatch or missing

**Solution:**
1. Verify `CRON_SECRET` is set in Vercel environment variables
2. Make sure you're using the correct secret in your test request
3. Redeploy after adding/changing environment variables

---

### Problem: No Records Processed

**Response:** `"campaigns": 0, "users": 0` or all reminder counts are 0

**This is NORMAL if:**
- No campaigns/users have expired deadlines (cleanup job)
- No appeals are expiring in 7/3/1 days (reminder job)
- All temporary removals/bans are still active

**To verify it's working:**
1. Check Vercel function logs - should show `200 OK`
2. Response should have `"success": true`
3. Create a test scenario with an expiring appeal

---

### Problem: Emails Not Sending

**Check:**
1. Is `MAILERSEND_API_KEY` set in Vercel environment variables?
2. Is your MailerSend account active and within sending limits?
3. Check Vercel function logs for email errors
4. Verify `NEXT_PUBLIC_BASE_URL` is correct

**Solution:**
- Test email sending with MailerSend dashboard
- Check spam folder for test emails
- Review MailerSend sending logs

---

### Problem: Cron Job Runs at Wrong Time

**On Free (Hobby) Plan:**
- Timing is NOT precise
- `0 2 * * *` might run anytime between 2:00-2:59 AM
- `0 10 * * *` might run anytime between 10:00-10:59 AM

**This is expected behavior on the free tier.**

**Solution:**
- Upgrade to Vercel Pro for precise timing
- Or accept the 1-hour window (doesn't affect functionality)

---

## Cron Schedule Format Explained

The schedule uses cron syntax:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23, UTC timezone)
└───────── Minute (0-59)
```

### Current Schedules:

| Cron Job | Schedule | Meaning |
|----------|----------|---------|
| Cleanup | `0 2 * * *` | Every day at 2:00 AM UTC |
| Reminders | `0 10 * * *` | Every day at 10:00 AM UTC |

**Note:** Times are in UTC. Convert to your local timezone if needed.

### To Change Schedules:

1. Edit `vercel.json`
2. Modify the `schedule` field
3. Commit and push to deploy

**Examples:**
- `0 0 * * *` = Midnight UTC
- `0 12 * * *` = Noon UTC
- `0 */6 * * *` = Every 6 hours (Pro plan only)

---

## Vercel Plan Limits

### Hobby (Free) Plan
- **Cron Jobs:** 2 per account (you're using both)
- **Schedule:** Once per day maximum
- **Timing:** Approximate (±59 minutes)
- **Function Duration:** 10 seconds max (both jobs run under 5s)
- **Function Executions:** Unlimited

### Pro Plan ($20/month)
- **Cron Jobs:** 40 per account
- **Schedule:** Unlimited (can run every minute)
- **Timing:** Precise to the minute
- **Function Duration:** 60 seconds max
- **Better monitoring and logs**

**Current setup uses 2 of your 2 free cron jobs.** If you need more automation, consider upgrading.

---

## Security Best Practices

### Protecting Your Cron Endpoints

1. **Never commit `CRON_SECRET` to Git**
   - Keep it only in Vercel environment variables
   - Use different secrets for production/preview if needed

2. **Rotate the secret periodically**
   - Generate a new secret every 3-6 months
   - Update in Vercel environment variables
   - Redeploy to activate

3. **Monitor for unauthorized access**
   - Check Vercel function logs for 401 errors
   - Investigate unexpected execution patterns

4. **Use strong secrets**
   - Minimum 32 characters
   - Mix of letters, numbers, and symbols
   - Use `openssl rand -base64 32` for generation

---

## Email Templates

### Appeal Reminder Email
- **Subject:** "⏰ Appeal Deadline Reminder - X Days Left"
- **Style:** Orange/amber theme with countdown
- **Content:**
  - Days remaining (large number)
  - Original removal reason
  - Appeal submission link
  - Warning about permanent status

### Permanent Ban Email
- **Subject:** "🚫 Your Account Has Been Suspended"
- **Style:** Red theme
- **Content:**
  - Permanent ban notice
  - Original ban reason
  - No appeal option (expired)
  - Support contact info

---

## Files Related to Cron Jobs

### Configuration:
- `vercel.json` - Cron job definitions and schedules

### Endpoints:
- `src/app/api/cron/cleanup-expired-appeals/route.js` - Cleanup logic
- `src/app/api/cron/send-appeal-reminders/route.js` - Reminder logic

### Email & Notifications:
- `src/utils/notifications/emailTemplates.js` - Email HTML templates
- `src/utils/notifications/sendEmail.js` - MailerSend integration
- `src/utils/notifications/sendInAppNotification.js` - In-app notifications
- `src/utils/notifications/notificationTemplates.js` - In-app templates

### Utilities:
- `src/utils/logAdminAction.js` - Admin action logging
- `.env.example` - Documents required environment variables

---

## Need Help?

### Documentation:
- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Schedule Examples](https://crontab.guru/)
- [MailerSend Documentation](https://developers.mailersend.com/)

### Support:
- [Vercel Support](https://vercel.com/support)
- [MailerSend Support](https://www.mailersend.com/help)

### In-App Monitoring:
- Admin logs: `/admin/logs`
- Filter by admin: `system`

---

**Last Updated:** October 26, 2025  
**Cron Jobs Active:** 2 of 2 (Free tier limit reached)
