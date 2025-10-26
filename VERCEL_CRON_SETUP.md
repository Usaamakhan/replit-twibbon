# Vercel Cron Job Setup Guide

This document explains how to set up the automated cleanup cron job for expired appeals on Vercel.

---

## What Does This Cron Job Do?

The cron job automatically upgrades expired temporary removals/bans to permanent status:

- **Runs:** Daily at 2:00 AM
- **Checks:** All campaigns with `removed-temporary` status and users with `banned-temporary` status
- **Action:** If appeal deadline has passed (30 days), upgrades to permanent status
- **Notifications:** Sends in-app notifications to affected users
- **Logging:** Records all actions in the adminLogs collection

---

## Setup Instructions

### 1. Generate a CRON_SECRET

Generate a random secret string to secure your cron endpoint. You can use:

```bash
# On Linux/Mac
openssl rand -base64 32

# Or use an online generator
# Visit: https://www.random.org/strings/
```

Copy the generated string (keep it secret!).

---

### 2. Add Environment Variable on Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** Paste your generated secret string
   - **Environment:** Production (and optionally Preview if needed)
4. Click **Save**

---

### 3. Deploy to Vercel

**Important:** Vercel Cron Jobs only work in production, not in local development.

1. Push your code to GitHub (or your Git provider)
2. Vercel will automatically deploy
3. Wait for deployment to complete

---

### 4. Verify Cron Job is Configured

After deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Cron Jobs**
3. You should see:
   - **Path:** `/api/cron/cleanup-expired-appeals`
   - **Schedule:** `0 2 * * *` (daily at 2 AM)
   - **Status:** Active

---

## Testing the Cron Job

### Manual Test (Optional)

You can manually trigger the endpoint to test it:

```bash
curl -X GET https://your-domain.vercel.app/api/cron/cleanup-expired-appeals \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace:
- `your-domain.vercel.app` with your actual Vercel domain
- `YOUR_CRON_SECRET` with the secret you set in environment variables

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

---

## How to Monitor Cron Job Execution

### Via Vercel Logs

1. Go to your Vercel project dashboard
2. Navigate to **Deployments** → Select your production deployment
3. Click **Functions** tab
4. Look for `/api/cron/cleanup-expired-appeals`
5. View execution logs and errors

### Via Admin Logs (In Your App)

1. Login as admin
2. Go to `/admin/logs`
3. Filter by:
   - **Action:** `auto_permanent_removal` or `auto_permanent_ban`
   - **Admin:** `system`

You'll see all automatic upgrades logged here.

---

## Troubleshooting

### Cron Job Not Running

**Check:**
1. Is `CRON_SECRET` set in Vercel environment variables?
2. Did you deploy to production? (Cron jobs don't work locally)
3. Is the cron job visible in Vercel Settings → Cron Jobs?

### Unauthorized Error (401)

**Problem:** `CRON_SECRET` mismatch

**Solution:**
1. Verify the secret in Vercel matches your local `.env` (if testing locally)
2. Redeploy after changing environment variables

### No Records Processed

**This is normal if:**
- No campaigns/users have expired appeal deadlines
- All temporary removals/bans are still within the 30-day window

**To verify it's working:**
1. Check Vercel function logs for execution
2. Response should show `"success": true`
3. Check admin logs for system actions

---

## Cron Schedule Format

The schedule `0 2 * * *` means:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

**Current:** `0 2 * * *` = Every day at 2:00 AM

**To change:**
- Edit `vercel.json` → `crons[0].schedule`
- Redeploy to Vercel

---

## Vercel Plan Limits

### Hobby (Free) Plan
- **Cron Jobs:** 2 per account
- **Schedule:** Once per day only
- **Timing:** Not precise (e.g., 2:00 AM might run between 2:00-2:59 AM)

### Pro Plan
- **Cron Jobs:** 40 per account
- **Schedule:** Unlimited (can run every minute if needed)
- **Timing:** Precise execution

**Current setup uses 1 of your 2 free cron jobs.**

---

## Security Notes

- The `CRON_SECRET` prevents unauthorized access to the endpoint
- Only Vercel's cron scheduler knows this secret
- Manual API calls require the secret in the `Authorization` header
- Never commit `CRON_SECRET` to your repository

---

## Files Related to This Feature

- `vercel.json` - Cron job configuration
- `src/app/api/cron/cleanup-expired-appeals/route.js` - Cleanup logic
- `src/utils/notifications/notificationTemplates.js` - Notification templates
- `.env.example` - Documents required environment variables

---

## Need Help?

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Vercel Support](https://vercel.com/support)
- Check your admin logs at `/admin/logs` for execution history

---

**Last Updated:** October 26, 2025
