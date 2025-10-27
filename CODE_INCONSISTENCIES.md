# Code Issues & Improvements - Twibbonize Platform

**Last Updated:** October 26, 2025

This document tracks known issues, inconsistencies, and suggested improvements discovered during documentation review.

---

## 🔍 Issues Found (Documentation Review - October 26, 2025)

### 1. **User Report Reasons Mismatch Between Documentation and Code**

**Status:** DOCUMENTATION ERROR

**What's the problem?**
The REPORT_SYSTEM.md shows user-friendly labels for report reasons, but the **actual API code** uses different snake_case values.

**Documentation says** (REPORT_SYSTEM.md lines 22-29):
- Inappropriate Profile Picture
- Offensive Username  
- Spam in Bio/Description
- Impersonation
- Other

**But code actually uses** (`src/app/api/reports/user/route.js` lines 22-28):
```javascript
const validReasons = [
  'inappropriate_avatar',    // Not "inappropriate_profile_picture"
  'offensive_username',       // Matches documentation
  'spam_bio',                // Not "spam_in_bio"
  'impersonation',           // Matches documentation
  'other'                    // Matches documentation
];
```

**Impact:**
- Frontend form must send these exact snake_case values
- Documentation only shows friendly labels, not actual API values
- Could cause confusion for developers integrating with the API

**Location:**
- **Code:** `src/app/api/reports/user/route.js` (lines 22-28)
- **Docs:** `REPORT_SYSTEM.md` (lines 22-29)

**Solution:**
Update REPORT_SYSTEM.md to show both friendly labels AND the actual API values that must be sent.

**Priority:** LOW (documentation clarity - functionality works)

---

### 2. **Campaign Report Reasons Should Show API Values**

**Status:** DOCUMENTATION INCOMPLETE

**What's the problem?**
REPORT_SYSTEM.md lists campaign report reasons with friendly labels, but doesn't clarify these are the actual snake_case API values.

**Documentation shows:**
- Inappropriate Content
- Spam
- Copyright Violation
- Other

**Actual API values** (`src/app/api/reports/submit/route.js` line 22):
```javascript
const validReasons = ['inappropriate', 'spam', 'copyright', 'other'];
```

These happen to match the snake_case pattern, but documentation doesn't make this clear.

**Impact:**
- Minor - developers might assume they need to send "Inappropriate Content" instead of "inappropriate"
- Documentation should clarify format expectations

**Location:**
- **Code:** `src/app/api/reports/submit/route.js` (line 22)
- **Docs:** `REPORT_SYSTEM.md` (lines 14-18)

**Solution:**
Update documentation to explicitly show API values in addition to friendly labels.

**Priority:** LOW (documentation clarity)

---

### 3. **Appeal Reminders for Campaigns Send Dual Notifications (Not Fully Documented)**

**Status:** DOCUMENTATION INCOMPLETE

**What's the problem?**
REPORT_SYSTEM.md mentions "Dual notification system: Both in-app + email reminders sent" (line 495) which is correct, but it doesn't clarify that this applies ONLY to campaigns, not user bans.

**Actual behavior:**
- **Campaign removals:** BOTH in-app + email reminders sent (lines 45-77 in `send-appeal-reminders/route.js`)
- **User bans:** ONLY email reminders sent (lines 91-117 in `send-appeal-reminders/route.js`)

**Why the difference?**
- Banned users cannot log in, so in-app notifications wouldn't be seen anyway
- Campaign creators can still log in (only their campaign is removed, not their account)

**Impact:**
- Documentation is technically correct but could be more specific
- Users might wonder why they only get email for ban reminders

**Location:**
- **Code:** `src/app/api/cron/send-appeal-reminders/route.js`
- **Docs:** `REPORT_SYSTEM.md` (lines 492-498)

**Solution:**
Update REPORT_SYSTEM.md to explicitly state:
- "Campaign removals: BOTH in-app + email reminders"
- "Account bans: Email reminders only (users cannot log in to see in-app)"

**Priority:** LOW (documentation clarity)

