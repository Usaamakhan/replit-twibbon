# Code Issues & Improvements - Twibbonize Reporting System

**Last Updated:** October 23, 2025

This document tracks known issues and suggested improvements for the Twibbonize reporting system. All issues are explained in simple, non-technical language so anyone can understand them.

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

## 📝 Implementation Notes

**Last reviewed:** October 23, 2025

**Status Field Naming Convention:**
The codebase uses different field names for campaigns vs users intentionally:
- **Campaigns:** `moderationStatus` (tracks content moderation state: active, removed, etc.)
- **Users:** `accountStatus` (tracks account access state: active, banned, etc.)

This is **correct and should be kept** because:
✅ They represent different concepts (content moderation vs account access)
✅ Prevents field name conflicts when handling both types in the same code
✅ Makes code more readable and semantically accurate
✅ Consistent usage throughout the entire codebase

**Report System Architecture:**
The system uses **aggregated report summaries** instead of individual report documents:
- Main collection: `reportSummary` (aggregates all reports for a target)
- Legacy collection: `reports` (individual reports - still exists but unused)
- Performance: 96% reduction in database operations using batch `getAll()` queries
- Reason counts stored as objects: `{spam: 8, inappropriate: 5, copyright: 2}`

**Rate Limiting & Security:**
- Maximum 5 reports per hour per IP address
- Duplicate prevention: tracks both IP address AND userId for authenticated users
- IP addresses are **SHA-256 hashed** before storage (never stored raw)
- Stored in Firestore `reportRateLimits` collection with 24-hour TTL
- Auto-cleanup prevents database bloat

**Hybrid Notification System:**
- **In-app notifications:** Used for warnings, campaign removals, auto-hides, content restorations
- **Email notifications:** Used exclusively for ban/unban actions (critical for users who cannot access their account)
- All notification templates use object destructuring to prevent parameter order issues
- Typed confirmation ("CONFIRM") required for all dangerous admin actions

**Admin Accountability:**
- All admin actions logged to `adminLogs` Firestore collection
- Tracks: admin ID/email/name, action type, target, reason, timestamp
- Admin logs page available at `/admin/logs` with comprehensive filters
- Audit trail for all moderation decisions

---

**End of Document**
