# Code Inconsistencies & Issues - Twibbonize Platform

**Last Updated:** October 29, 2025

This document tracks code inconsistencies, bugs, and areas for improvement found during code audits.

---

## 📧 Email Notification System Issues


### 3. ✅ FIXED - Redundant Email Notifications for Campaign Appeal Reminders

**Issue:** Campaign creators were receiving BOTH in-app notifications AND emails for appeal deadline reminders, which was excessive since they can log in.

**Fix Applied:** Removed email sending for campaign appeal reminders. Now only sends in-app notifications.

**Current Behavior:**
- Campaign removals: Only in-app notification (lines 60-68) - creators can log in ✅
- Account bans: Only email (lines 100-113) - users can't log in ✅

**Rationale:**
- Campaign creators can log in → see in-app notifications
- Banned users cannot log in → need email to know about appeals

**Location:** `src/app/api/cron/send-appeal-reminders/route.js`, lines 59-71

**Date Fixed:** October 29, 2025

---

## ✅ All Issues Resolved

All email notification system issues have been fixed:

1. ✅ **Unban Email** - Reports page now sends unban emails
2. ✅ **Appeal URL** - Fixed by user  
3. ✅ **Campaign Appeal Emails** - Removed redundant emails, keeping only in-app notifications

**Email Notification Strategy:**
- **Account Bans/Unbans:** Send emails (users can't log in)
- **Campaign Removals:** Send in-app notifications only (creators can log in)
- **Account Appeal Reminders:** Send emails (users can't log in)
- **Campaign Appeal Reminders:** Send in-app notifications only (creators can log in)

---

