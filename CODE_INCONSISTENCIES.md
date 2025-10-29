# Code Inconsistencies & Issues - Twibbonize Platform

**Last Updated:** October 29, 2025

This document tracks code inconsistencies, bugs, and areas for improvement found during code audits.

---

## 📧 Email Notification System Issues


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

