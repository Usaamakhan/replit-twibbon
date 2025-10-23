# Email Notification Setup Instructions

## What Was Implemented

The email notification system has been implemented to replace in-app notifications for banned users (since they cannot access their accounts). This fixes Critical Issue #1 in CODE_INCONSISTENCIES.md.

### Changes Made:

1. **New Files Created:**
   - `src/utils/notifications/sendEmail.js` - Email sending utility using Resend API
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

### Step 1: Install the Resend Package

Run this command in your project:

```bash
npm install resend
```

This will add the Resend email service library to your project.

---

### Step 2: Get Resend API Key

1. Go to **https://resend.com** and sign up for a free account
2. Free tier includes: **100 emails/day** (3,000/month) - good for testing
3. Navigate to **API Keys** section in the dashboard
4. Click **Create API Key**
5. Copy the API key (starts with `re_...`)

**Pricing Note:** 
- Free: 100 emails/day
- Paid: $20/month for 50,000 emails

---

### Step 3: Configure Domain (Optional but Recommended)

For production, you should verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `twibbonize.com`)
4. Add the DNS records they provide to your domain registrar
5. Wait for verification (usually 5-10 minutes)

**For testing:** You can skip this and use Resend's test mode which delivers to verified email addresses only.

---

### Step 4: Add Environment Variables to Vercel

Go to your Vercel project settings and add these environment variables:

#### Required Variables:

| Variable Name | Value | Example |
|---------------|-------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_123abc456def789...` |
| `NEXT_PUBLIC_BASE_URL` | Your app's public URL | `https://twibbonize.com` |

**How to add in Vercel:**
1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add both variables above
4. Set them for: **Production**, **Preview**, and **Development** environments
5. Click **Save**

**For the sender email address:**
- If you verified a domain: Update `from` parameter in templates to use your domain (e.g., `noreply@twibbonize.com`)
- If using free tier: Keep default `noreply@yourdomain.com` (Resend will handle it)

---

### Step 5: Update Email Templates (Optional)

In `src/utils/notifications/emailTemplates.js`, you can customize:

1. **Sender email:** Change the default `from` parameter:
   ```javascript
   from: 'noreply@twibbonize.com'  // Use your verified domain
   ```

2. **Email content:** Modify the HTML templates to match your branding

3. **Appeal link:** Update the appeal URL when you implement the appeal system:
   ```html
   <a href="${process.env.NEXT_PUBLIC_BASE_URL}/appeal" class="button">Submit an Appeal</a>
   ```

---

### Step 6: Redeploy on Vercel

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on your latest deployment
3. Or simply push a new commit to trigger automatic deployment

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
- RESEND_API_KEY is set correctly
- NEXT_PUBLIC_BASE_URL is set correctly
```

**Check Resend Dashboard:**
- Go to https://resend.com/emails
- See delivery status of sent emails
- Check for any errors or bounces

**Check Vercel Function Logs:**
- Go to Vercel → Deployments → Functions
- Look for `[EMAIL]` log entries
- Check for errors

### Email Goes to Spam?

This is common if you haven't verified a domain:
- Verify your domain in Resend (see Step 3)
- Add SPF, DKIM, and DMARC records
- Use a professional "from" address (not noreply@random.com)

### Rate Limiting?

Free tier: 100 emails/day
- If exceeded, upgrade to paid plan ($20/month for 50,000)
- Or implement email queuing to batch send

---

## What's Next?

After implementing email notifications, you should consider:

1. **Implement the Appeal System** (Critical Issue #6 in CODE_INCONSISTENCIES.md)
   - Create `/appeal` page for users to submit appeals
   - Create admin interface to review appeals
   - The email already links to `/appeal` but the page doesn't exist yet

2. **Email Reminder System** (Issue #5 - now optional)
   - Send reminder emails 3-7 days before appeal deadline
   - Requires setting up a cron job (Vercel Cron or similar)

3. **Monitor Email Delivery**
   - Set up Resend webhooks to track opens, clicks, bounces
   - Log email failures for investigation

---

## Cost Estimation

**Resend Pricing:**
- Free: 100 emails/day (3,000/month)
- Paid: $20/month for 50,000 emails (~$0.0004 per email)

**Example Scenarios:**
- 10 bans/unbans per day: Free tier is sufficient
- 100 bans/unbans per day: Still free tier (3,000/month)
- 5,000 bans/unbans per month: Need paid plan ($20/month)

---

## Support

If you encounter issues:
- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com
- Check Vercel function logs for debugging

---

**Implementation completed!** 

Email notifications are now ready to use once you:
1. Install `resend` package (`npm install resend`)
2. Add environment variables to Vercel
3. Redeploy your application
