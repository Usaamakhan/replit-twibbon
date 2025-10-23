# Email Notification Setup Instructions

## What Was Implemented

The email notification system has been implemented to replace in-app notifications for banned users (since they cannot access their accounts). This fixes Critical Issue #1 in CODE_INCONSISTENCIES.md.

### Changes Made:

1. **New Files Created:**
   - `src/utils/notifications/sendEmail.js` - Email sending utility using MailerSend API
   - `src/utils/notifications/emailTemplates.js` - HTML email templates for ban/unban notifications

2. **Updated Endpoints:**
   - `src/app/api/admin/users/[userId]/ban/route.js` - Now sends email for ban/unban actions
   - `src/app/api/admin/reports/summary/[summaryId]/route.js` - Now sends email for user bans (via reports)

3. **Email Sending Logic:**
   - **User Bans:** Send EMAIL instead of in-app notification (users can't access their account)
   - **User Unbans:** Send EMAIL notification (previously not sent at all)
   - **Campaign Removals:** Keep in-app notification (creators can still log in)
   - **Warnings:** Keep in-app notification only (not changed)

---

## Steps to Enable Email Notifications

### Step 1: Get MailerSend API Key

1. Go to **https://mailersend.com** and sign up for a free account
2. Free tier includes: **12,000 emails/month** + trial domain (no custom domain verification needed!)
3. Navigate to **API Tokens** section in the dashboard
4. Click **Create Token**
5. Copy the API key

**Pricing Note:** 
- Free: 12,000 emails/month with trial domain
- Paid: $25/month for 50,000 emails with custom domain

---

### Step 2: Add Environment Variable to Vercel

Go to your Vercel project settings and add:

| Variable Name | Value | Example |
|---------------|-------|---------|
| `MAILERSEND_API_KEY` | Your MailerSend API key | `mlsn.abc123...` |
| `NEXT_PUBLIC_BASE_URL` | Your app's public URL | `https://replit-twibbon.vercel.app` |

**How to add in Vercel:**
1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add both variables above
4. Set them for: **Production**, **Preview**, and **Development** environments
5. Click **Save**

---

### Step 3: Redeploy on Vercel

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on your latest deployment
3. Or simply push a new commit to trigger automatic deployment

---

## Using MailerSend Trial Domain

The free tier includes a **trial domain** (`trial.mailersend.net`) that works immediately without DNS verification!

**Default sender:** `noreply@trial.mailersend.net`

**To switch to your own domain later:**
1. Purchase a custom domain (e.g., `twibbonize.com`)
2. Verify it in MailerSend dashboard
3. Update the `from` parameter in `src/utils/notifications/sendEmail.js`

---

## Testing the Email System

### Test Ban Email:
1. Create a test user account in your app
2. As admin, ban the user from `/admin/users`
3. Check the user's email inbox for the ban notification

### Test Unban Email:
1. Unban a previously banned user
2. Check their email for the restoration notification

### Check Logs:
- Vercel Functions logs will show: `[EMAIL] Sent successfully: <email_id>`
- If email fails, you'll see: `[EMAIL] Error: <error_message>`

---

## Email Template Preview

### Ban Email:
- **Subject:** 🚫 Your Account Has Been Suspended
- **Content:** 
  - Explains suspension (temporary or permanent)
  - Shows ban reason
  - Shows appeal deadline (if temporary)
  - "Submit an Appeal" button
  - Support contact info

### Unban Email:
- **Subject:** ✅ Your Account Has Been Restored
- **Content:**
  - Notifies account restoration
  - "Sign In Now" button
  - Reminder to follow guidelines
  - Support contact info

---

## Troubleshooting

### Email Not Sending?

**Check Environment Variables:**
```bash
# In Vercel dashboard, verify:
- MAILERSEND_API_KEY is set correctly
- NEXT_PUBLIC_BASE_URL is set correctly
```

**Check MailerSend Dashboard:**
- Go to https://mailersend.com/activity
- See delivery status of sent emails
- Check for any errors or bounces

**Check Vercel Function Logs:**
- Go to Vercel → Deployments → Functions
- Look for `[EMAIL]` log entries
- Check for errors

---

## Switching to Custom Domain (Optional)

When you purchase your own domain:

1. **Verify in MailerSend:**
   - Add domain in MailerSend dashboard
   - Add DNS records to your domain registrar
   - Wait for verification

2. **Update Code:**
   - In `src/utils/notifications/sendEmail.js`, change:
   ```javascript
   from = "noreply@yourdomain.com"
   ```

3. **Redeploy** your app

---

## Switching Back to Resend (If Needed)

If you purchase a custom domain and want to use Resend:

1. Install Resend: `npm install resend`
2. Update `src/utils/notifications/sendEmail.js` to use Resend API
3. Change `MAILERSEND_API_KEY` to `RESEND_API_KEY` in Vercel
4. Redeploy

---

## Cost Estimation

**MailerSend Pricing:**
- Free: 12,000 emails/month
- Paid: $25/month for 50,000 emails (~$0.0005 per email)

**Example Scenarios:**
- 100 bans/unbans per day: Free tier is sufficient (3,000/month)
- 400 bans/unbans per day: Still free tier (12,000/month)
- 50,000 bans/unbans per month: Need paid plan ($25/month)

---

**Implementation completed!** 

Email notifications are ready to use once you add `MAILERSEND_API_KEY` to Vercel and redeploy.
