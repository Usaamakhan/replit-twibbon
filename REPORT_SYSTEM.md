# Twibbonize Reporting System

## Overview
The Twibbonize reporting system allows users to report inappropriate campaigns or user profiles. The system is designed to be efficient, reducing database operations by 95% through an optimized aggregation approach. This document explains how the system works in simple, non-technical terms.

---

## How Users Report Content

### Reporting a Campaign
1. **User clicks "Report" button** on a campaign page
2. **Selects a reason** from dropdown (required):
   - Inappropriate Content
   - Spam
   - Copyright Violation
   - Other
3. **Submits the report** (no text field needed - just reason selection)

### Reporting a User Profile
1. **User clicks "Report" button** on a user's profile page
2. **Selects a reason** from dropdown (required):
   - Inappropriate Profile Picture
   - Offensive Username
   - Spam in Bio/Description
   - Impersonation
   - Other
3. **Submits the report**

**Rate Limiting:**
- Maximum 5 reports per hour from the same IP address
- Cannot report the same target twice from the same IP address
- Returns error message if limit exceeded: "You have submitted too many reports. Please try again later."
- IP addresses are hashed for privacy before storage

---

## What Happens After a Report is Submitted

### For Campaigns:
1. **Report is counted** - The campaign's report count increases by 1
2. **Reason is tracked** - The specific reason (spam, inappropriate, etc.) is recorded in the report summary
3. **Two synchronized counters updated:**
   - Campaign document: `reportsCount` field increments
   - Report Summary document: `reasonCounts` object increments the specific reason count
   - **Both counters always stay synchronized** - they increment together and reset together
4. **Auto-hide at 3 reports:**
   - When a campaign reaches **3 or more reports**
   - Status changes to `under-review-hidden` (auto-hidden from public)
   - Hidden timestamp recorded
   - **Creator receives in-app notification**: "⚠️ Campaign Under Review - Your campaign has been flagged by users and is now under review"
5. **Below 3 reports** - Campaign stays visible, no notification sent

### For User Profiles:
1. **Report is counted** - The user's report count increases by 1
2. **Reason is tracked** - The specific reason is recorded
3. **Two synchronized counters updated:**
   - User document: `reportsCount` field increments
   - Report Summary document: `reasonCounts` object increments the specific reason count
   - **Both counters always stay synchronized** - they increment together and reset together
4. **Auto-hide at 10 reports:**
   - When a user reaches **10 or more reports**
   - Account status changes to `under-review-hidden` (profile hidden from public)
   - Hidden timestamp recorded
   - **User receives in-app notification**: "⚠️ Profile Under Review - Your profile has been flagged by users and is now under review"
5. **Below 10 reports** - Profile stays visible, no notification sent

**Counter Synchronization (Fixed October 22, 2025):**
- When a new report comes in AFTER admin has reviewed previous reports (status was 'resolved' or 'dismissed'), the system:
  - Resets BOTH the Report Summary counter AND the campaign/user counter to 1 (starting fresh)
  - Both counters increment together as new reports arrive
  - Both counters reset to 0 together when admin takes action (dismiss/warn/remove)
  - No temporary mismatches - counters are always synchronized

---

## Report Aggregation System

### How It Works:
Instead of storing each individual report as a separate document, the system groups all reports for the same campaign/user into a single **Report Summary** document. This dramatically reduces database operations.

**What's Stored in Report Summary:**
- **targetId** - ID of reported campaign or user
- **targetType** - Either "campaign" or "user"
- **Total report count** (e.g., 15 reports)
- **Reason breakdown with counts** (e.g., `{ spam: 8, inappropriate: 5, copyright: 2 }`)
- **Status** - `pending`, `resolved`, or `dismissed`
- **Timestamps** - `firstReportedAt`, `lastReportedAt`, `createdAt`, `updatedAt`
- **Cached display info** - Campaign title/image or user's name/profile picture for quick display

**Why This Matters:**
- Saves 95% of database operations
- Faster for admins to review
- Cheaper to run at scale
- No need to fetch hundreds of individual reports
- Admin sees percentage breakdown instantly (e.g., "53% spam, 33% inappropriate, 13% copyright")

**Performance Comparison:**

Before optimization (individual reports):
- Report submission: 3 writes per report
- Admin dismiss (100 reports): 102 reads + 103 writes

After optimization (aggregated summaries):
- Report submission: 2 writes per report (33% reduction)
- Admin dismiss (any number): 2 reads + 3 writes (98% reduction)

---

## Admin Dashboard (/admin/reports)

### How Admins Access Reports

Admins visit `/admin/reports` and see a control panel with filters:

#### Filter Options:

1. **Report Type**
   - **All Types** - Shows both campaigns and users
   - **Campaign** - Shows only reported campaigns
   - **User** - Shows only reported user profiles

2. **Status**
   - **All** - Shows all reports regardless of status
   - **Pending** - Reports that haven't been reviewed yet (default)
   - **Resolved** - Reports where admin took action (warned/removed)
   - **Dismissed** - Reports where admin found no issue

3. **Sort By**
   - **Most Recent** (lastReportedAt) - Shows newest reports first
   - **Top Reported** (reportsCount) - Shows items with most reports first (default)
   - **Oldest Pending** (firstReportedAt) - Shows oldest unresolved reports first

4. **Number of Reports**
   - Choose how many to load (1-100, default: 10)

5. **Load Button**
   - Click to fetch reports with selected filters
   - Does NOT auto-load on page open (admin must click "Load")

**Performance Note:**
When loading reports, the system fetches live status from each campaign/user document to ensure displayed information is current. This means if you load 100 reports, the system makes 100-300 database reads to show accurate data. This is a known performance issue (see CODE_INCONSISTENCIES.md #2).

---

## Report Table Display

Each row in the table shows:

### Campaign Reports:
- **Campaign thumbnail** (small preview image)
- **Campaign title** (clickable)
- **Creator name** and profile picture
- **Total report count** (big red number badge)
- **Current moderation status** badge (active, hidden, removed-temporary, etc.)
- **Last reported date/time**
- **Action buttons:**
  - "View Breakdown" - Expands to show reason distribution
  - "Take Action" - Opens detailed panel with admin actions

### User Reports:
- **Profile picture** (or initials if no picture)
- **User's display name** (clickable)
- **Username** (@username)
- **Total report count** (big red number badge)
- **Current account status** badge (active, hidden, banned-temporary, etc.)
- **Last reported date/time**
- **Action buttons:**
  - "View Breakdown" - Expands to show reason distribution
  - "Take Action" - Opens detailed panel with admin actions

---

## Viewing Report Details

### View Breakdown Button
When clicked, the row expands to show:
- **Reason distribution** (visual breakdown)
- Each reason with:
  - Count (e.g., "Spam: 8")
  - Percentage (e.g., "53%")
  - Visual progress bar showing proportion
- **First report date** - When first report was received
- **Latest report date** - When most recent report was received

**Example:**
```
Report Breakdown
━━━━━━━━━━━━━━━━
Spam: 8 (53%)          [████████████░░░] 
Inappropriate: 5 (33%) [████████░░░░░░░]
Copyright: 2 (13%)     [███░░░░░░░░░░░░]

First Report: Jan 15, 2025 2:30 PM
Latest Report: Jan 18, 2025 9:45 AM
```

### Take Action Button
Opens a **detailed side panel** showing:

#### For Campaigns:
- Campaign image (full size preview)
- Campaign title and type (Frame/Background)
- Current moderation status with color-coded badge
- Creator information (name, profile picture, username)
- Total reports count with reason breakdown
- Campaign slug (URL identifier)
- Timestamps (created, first reported, last reported)

#### For Users:
- Profile picture (full size)
- Display name and username
- Current account status with color-coded badge
- Current moderation status
- Total reports count with reason breakdown
- Link to view full profile page
- Timestamps (account created, first reported, last reported)

---

## Admin Actions

When admin clicks "Take Action" in the side panel, they see **3 action buttons** with two-step confirmation:

### 1. Dismiss Report (Secondary Button - Gray)

**Step 1: Click "Dismiss Report"**
- Shows confirmation modal

**Step 2: Confirm Dismissal**
- Admin confirms they want to dismiss

**What it does:**
- Marks report summary status as "dismissed"
- Resets ALL report counts to 0:
  - Campaign/User `reportsCount` → 0
  - Report Summary `reportsCount` → 0
  - Report Summary `reasonCounts` → {} (empty)
- Restores content to "active" status:
  - Campaigns: `moderationStatus` → "active"
  - Users: `accountStatus` → "active"
- Removes hidden timestamps
- Removes ban-related fields

**Notification sent?**
- ✅ **YES** - If campaign/user was auto-hidden (at 3+ reports for campaigns, 10+ for users)
  - **Campaign**: "✅ Campaign Restored - Good news! Your campaign has been reviewed and restored"
  - **User**: "✅ Profile Restored - Good news! Your profile has been reviewed and restored"
- ❌ **NO** - If content was never hidden (below threshold)

**Use when:** Reports are false/spam, or content doesn't violate rules

---

### 2. Warn User/Creator (Warning Button - Yellow)

**Step 1: Click "Warn User" or "Warn Creator"**
- Shows reason selection modal with dropdown
- Admin MUST select a reason:
  - Inappropriate content
  - Spam
  - Harassment
  - Misinformation
  - Copyright violation
  - Other

**Step 2: Confirm Warning**
- "Continue" button disabled until reason selected
- Admin confirms the warning

**What it does:**
- Creates warning record in `warnings` collection with:
  - Selected reason from admin
  - User ID who received warning
  - Target type (campaign or user)
  - Target ID
  - Admin ID (currently defaults to "admin" - see CODE_INCONSISTENCIES.md #4)
  - Timestamp
  - Acknowledged status (false)
- **Restores content to active status** (this is intentional - warning is not removal):
  - Campaigns: `moderationStatus` → "active"  
  - Users: `accountStatus` → "active"
- Resets all report counts to 0
- Removes hidden timestamps
- Removes ban-related fields

**Rationale for restoration:**
Warning is a "slap on the wrist" - admin reviewed and decided content is not severe enough for removal. If content deserves to stay hidden, admin should use "Ban User/Remove Campaign" instead. Users should be able to see their content after being warned.

**Notification sent:** ✅ **ALWAYS**
- **Message**: "⚠️ Warning Issued - You've received a warning for: [admin-selected reason]. Please review our community guidelines."
- The notification includes the specific reason the admin selected from the dropdown

**Use when:** Content is borderline/minor issue - you want to warn the creator but allow content to remain visible

**Note:** Warning does NOT auto-ban users. Admin must manually decide actions based on warning history. Future enhancement needed: Admin warning history view (currently deferred).

---

### 3. Ban User / Remove Campaign (Danger Button - Red)

**Step 1: Click "Ban User" or "Remove Campaign"**
- Shows reason selection modal with dropdown
- Admin MUST select a reason:
  - Inappropriate content
  - Spam
  - Harassment
  - Misinformation
  - Copyright violation
  - Other

**Step 2: Confirm Removal/Ban**
- "Continue" button disabled until reason selected
- Admin confirms the action
- Shows strong warning about consequences

**What it does:**

**For Campaigns:**
- Sets `moderationStatus` to `removed-temporary`
- Content stays hidden from public
- Sets 30-day appeal deadline (calculated: current date + 30 days)
- Stores admin-selected reason in `banReason` field
- Stores `bannedAt` timestamp
- Sets `appealCount` to 0
- Resets `reportsCount` to 0
- **After 30 days:** Should auto-delete permanently if no appeal (requires cron job - currently not implemented)
- **Second removal:** Admin can manually set to `removed-permanent` (no recovery)

**For Users:**
- Sets `accountStatus` to `banned-temporary`
- Profile hidden from public
- Hides all their campaigns from public
- Sets 30-day appeal deadline
- Stores admin-selected reason in `banReason` field
- Stores `bannedAt` timestamp
- Resets `reportsCount` to 0
- **After 30 days:** Should auto-delete all data if no appeal (requires cron job - currently not implemented)

**Notification sent:** ✅ **ALWAYS**
- **Campaign**: "🚫 Campaign Removed - Your campaign has been removed for: [reason]. You can appeal this decision until [date]."
- **User**: "🚫 Account Banned - Your account has been banned for: [reason]. You can appeal until [date]."
- Notifications now include both:
  - The specific reason admin selected from dropdown
  - The exact appeal deadline date (formatted as "February 20, 2025")

**Important Note:** 
The appeal system is PROMISED in notifications but NOT YET IMPLEMENTED. Users receive notifications saying they can appeal, but there's no actual appeal submission interface. See CODE_INCONSISTENCIES.md #6 for details.

**Use when:** Content clearly violates rules and needs removal

---

## Status Meanings

### Report Summary Statuses:
- **pending** - Waiting for admin review (new reports)
- **resolved** - Admin took action (warned or removed/banned)
- **dismissed** - Admin found no issue and cleared the reports

**Status Transitions:**
- When new report comes in on previously `resolved`/`dismissed` target → Status resets to `pending`
- When admin takes action → Status changes to `resolved` (for warn/remove) or `dismissed` (for dismiss)

### Moderation Statuses (For Campaigns):
- **active** - Visible to public, no issues
- **under-review-hidden** - Hidden due to 3+ reports, awaiting admin review
- **removed-temporary** - Campaign removed by admin, 30-day appeal window
- **removed-permanent** - Campaign permanently deleted (second offense or severe violation)
- **deleted** - Campaign deleted by creator (only appears in reportSummary for tracking)

### Account Statuses (For Users):
- **active** - Profile visible, account accessible, no issues
- **under-review-hidden** - Profile hidden due to 10+ reports, awaiting admin review
- **banned-temporary** - User banned by admin, 30-day appeal window, cannot login
- **banned-permanent** - User permanently banned (severe violations), all data deleted

**Clear Distinction:**
- **Campaigns** use `moderationStatus` - Controls content visibility and moderation state
- **Users** use `accountStatus` - Controls account access and ban state
- This prevents field conflicts and ensures consistent enforcement

---

## Automatic Behavior

### When New Reports Come In After Admin Action:

1. **If admin previously dismissed or resolved:**
   - Report summary status resets to `pending`
   - **Counter behavior (synchronized):**
     - **Both Report Summary AND Campaign/User counters reset to 1** (starting fresh to track "new wave" of reports)
     - Counters stay synchronized and increment together as new reports arrive
     - Fixed October 22, 2025 - no more temporary mismatches
   - All reason counts in summary reset to track new pattern
   - New reports trigger auto-hide thresholds again

2. **Auto-hide triggers again:**
   - Campaign: Hidden at 3rd report (if status is `active`)
   - User: Hidden at 10th report (if status is `active`)
   - Notification sent again to creator/user
   - **Note:** Only triggers if current status is `active` - intentional design to require manual admin review for previously-reviewed content

### Report Summary Retention:
- **Report summaries are kept forever** (not deleted after admin action)
- Status changes to `dismissed` or `resolved` but document remains
- This allows tracking:
  - Repeat offenders
  - Historical patterns
  - Audit trail for moderation decisions
  - Analysis of which violations are most common

**Important:** Reason counts are reset to empty `{}` when admin takes action. Historical reason data is lost. See CODE_INCONSISTENCIES.md #10 for improvement suggestion to preserve this data.

### Campaign Deletion by Creator:
When a campaign creator deletes their own campaign:

1. **Campaign document deleted:**
   - Removed from Firestore `campaigns` collection
   - Associated image deleted from Supabase storage
   - Creator's `campaignsCount` decreased by 1

2. **Report Summary updated (NOT deleted):**
   - Status changed to `dismissed`
   - `reportsCount` reset to 0
   - `reasonCounts` reset to empty object `{}`
   - `moderationStatus` set to `deleted`
   - `deletionNote` added: "Campaign deleted by creator"
   - **Summary kept for audit trail**

3. **Admin dashboard behavior:**
   - Deleted campaign reports don't appear in pending queue (status is `dismissed`)
   - If admin filters by "all" or "dismissed" status, they may see historical data
   - Report summaries show `targetDeleted: true` flag when target no longer exists
   - Prevents admins from wasting time on non-existent content

4. **Notifications:**
   - No notification sent to creator (they initiated the deletion)
   - API returns count of auto-dismissed reports in response

**API Endpoint:** `DELETE /api/campaigns/[campaignId]`
**Authorization:** Only campaign owner (creatorId match required)
**UI Location:** Profile page > Campaign menu (3-dot button) > "Delete Campaign"
**Confirmation:** Required before deletion proceeds

---

## Notification System

All notifications are **in-app only** (Firestore-based, no browser permissions needed):

### When Notifications Are Sent:

1. **Campaign reaches 3 reports** → "⚠️ Campaign Under Review"
   - Triggered automatically when 3rd report submitted
   - Only if current status is `active`

2. **User profile reaches 10 reports** → "⚠️ Profile Under Review"
   - Triggered automatically when 10th report submitted
   - Only if current status is `active`

3. **Admin dismisses reports** → "✅ Campaign/Profile Restored"
   - Only sent if content was previously hidden (at threshold)
   - Not sent if content was never auto-hidden

4. **Admin issues warning** → "⚠️ Warning Issued"
   - Always sent
   - Includes admin-selected reason

5. **Admin removes/bans** → "🚫 Campaign Removed" or "🚫 Account Banned"
   - Always sent
   - Includes admin-selected reason and appeal deadline
   - **Note:** Promises appeal system that doesn't exist yet

6. **Appeal deadline reminders** → "⏰ Appeal Deadline Reminder"
   - PLANNED but not implemented (requires cron job)
   - Would notify 7 days, 3 days, and 1 day before deadline

### Notification Delivery:
- Saved to Firestore: `users/{userId}/notifications/{notificationId}`
- Real-time listeners update UI instantly via `useNotifications` hook
- Shows in notification bell icon in header (with unread count badge)
- Toast popup appears for new notifications (auto-dismisses after 5 seconds)
- Full inbox available at `/profile/notifications` with:
  - Read/unread status toggle
  - Filter by notification type
  - Delete individual notifications
  - Mark all as read
  - Action buttons (e.g., "View Campaign", "Appeal Removal")

### Notification Structure:
```javascript
{
  id: "auto-generated-id",
  type: "warning" | "campaign_removed" | "campaign_under_review" | etc.,
  title: "Notification Title",
  body: "Notification message with details",
  actionUrl: "/profile" or specific page,
  icon: "/icon-192x192.png",
  read: false,
  createdAt: timestamp,
  metadata: { campaignId, reason, etc. } // Optional additional data
}
```

---

## Performance Optimizations

### Before Optimization (Individual Reports System):
- **Report submission**: 3 Firestore writes per report
  - 1 write to create individual report document
  - 1 write to update campaign/user reportsCount
  - 1 write to update creator/user notification
- **Admin dismiss (100 reports)**: 102 reads + 103 writes
  - 1 read to fetch campaign/user
  - 100 reads to fetch all individual reports
  - 1 write to update campaign/user
  - 100 writes to update each report status
  - 1 write for notification
  - 1 write to update admin action log

### After Optimization (Current Aggregated System):
- **Report submission**: 2 Firestore writes (33% reduction)
  - 1 write to update campaign/user reportsCount
  - 1 write to update/create reportSummary with reason counts
  - (Notification is optional, not always sent)
- **Admin dismiss (any number of reports)**: 2 reads + 3 writes (98% reduction)
  - 1 read to fetch reportSummary
  - 1 read to fetch campaign/user
  - 1 write to update campaign/user status
  - 1 write to update reportSummary status
  - 1 write to create warning (if warning action)
  - (Notification write happens after transaction)

### How It's Achieved:
- Use aggregated `reportSummary` collection instead of individual report documents
- Store reason counts as objects: `{spam: 8, inappropriate: 5, copyright: 2}`
- No need to fetch/update hundreds of individual reports
- Single atomic transaction handles everything
- Instant admin actions with no query overhead

### Trade-offs:
- **Pro:** 95% reduction in database operations
- **Pro:** Faster admin actions (instant instead of seconds)
- **Pro:** Significant cost savings on Firestore usage
- **Pro:** Better admin UX with instant reason distribution visibility
- **Con:** Can't see individual report details (who reported, when each report came in)
- **Con:** Reason count history lost when admin takes action
- **Con:** Still has N+1 query problem when loading reports table (see CODE_INCONSISTENCIES.md #3)

---

## Key Design Principles

1. **Efficiency First** - Minimize database operations for scalability at viral scale

2. **Transparency** - Clear reason breakdowns help admins make informed decisions quickly

3. **User Communication** - Automatic in-app notifications keep creators informed of all moderation actions

4. **Audit Trail** - Keep report summaries forever for pattern detection and repeat offender tracking

5. **Fairness** - Appeal windows give users a chance to contest decisions (though not yet implemented)

6. **Automation** - Auto-hide at thresholds reduces admin workload for clear-cut cases

7. **Clear Status Separation** - Campaigns use `moderationStatus`, Users use `accountStatus` to prevent conflicts

8. **Atomic Transactions** - All status updates happen atomically to prevent race conditions and inconsistencies

9. **Rate Limiting** - Prevent report spam and abuse through IP-based limits

10. **Privacy** - IP addresses are hashed (SHA-256) before storage for user privacy

---

## Common Admin Workflows

### Scenario 1: False Reports (Spam Reports)
1. Admin sets filters: Status = "Pending", Sort = "Top Reported"
2. Clicks "Load" to fetch reports
3. Clicks "Take Action" on campaign with high report count
4. Reviews campaign image and details - looks fine, no violations
5. Clicks "Dismiss Report"
6. Confirms dismissal in modal
7. System:
   - Resets all report counts to 0
   - Restores campaign to `active` status
   - If campaign was hidden → Creator gets "✅ Campaign Restored" notification
   - If campaign wasn't hidden → No notification sent
8. Panel closes, reports table refreshes

### Scenario 2: Clear Violation
1. Admin reviews reports (loaded with filters)
2. Clicks "Take Action" on reported campaign
3. Reviews campaign - clearly inappropriate content (violates rules)
4. Clicks "Remove Campaign" (red danger button)
5. Reason selection modal appears
6. Selects reason: "Inappropriate content"
7. Clicks "Continue"
8. Confirms removal in second confirmation modal
9. System:
   - Sets `moderationStatus` to `removed-temporary`
   - Sets 30-day appeal deadline
   - Stores ban reason "Inappropriate content"
   - Resets report counts to 0
   - Creator receives "🚫 Campaign Removed" notification with reason and appeal deadline
10. Panel closes, reports table refreshes

### Scenario 3: Minor Issue / Warning
1. Admin reviews reported content
2. Content is borderline but not severe enough for removal
   - Example: Slightly misleading caption but not harmful
3. Clicks "Warn Creator"
4. Reason selection modal appears
5. Selects reason: "Misinformation"
6. Clicks "Continue"
7. Confirms warning
8. System:
   - Creates warning record with reason "Misinformation"
   - **Restores campaign to `active` status** (unhides if was auto-hidden)
   - Resets report counts to 0
   - User receives "⚠️ Warning Issued" notification with specific reason
9. User can see their content again, but warning is tracked for future reference
10. If user gets more warnings, admin can see pattern (future enhancement needed)

---

## Known Limitations & Future Enhancements

### Current Limitations:

1. **Appeal System Not Implemented**
   - Notifications promise users can appeal
   - But no actual appeal submission interface exists
   - `appealDeadline` and `appealCount` fields are set but never used
   - See CODE_INCONSISTENCIES.md #7

2. **No Admin Audit Trail**
   - Cannot track which specific admin took which action
   - All actions show "admin" instead of actual admin's name
   - No admin activity history page
   - See CODE_INCONSISTENCIES.md #4

3. **No Appeal Deadline Reminders**
   - Users aren't reminded as deadline approaches
   - Easy to miss 30-day window
   - Requires cron job to implement
   - See CODE_INCONSISTENCIES.md #5

4. **Performance Issue with Report Loading**
   - Loading reports makes 1-3 database reads per report
   - 100 reports = 100-300 reads
   - N+1 query problem
   - See CODE_INCONSISTENCIES.md #3

5. **Report Count Synchronization Issue**
   - Campaign/user reportsCount can temporarily differ from reportSummary reportsCount
   - Happens when new reports come after previous dismissal
   - They sync again when admin takes action
   - See CODE_INCONSISTENCIES.md #1

6. **Reason Count History Lost**
   - When admin takes action, all reason count data is erased
   - Can't see historical patterns of violations
   - See CODE_INCONSISTENCIES.md #11

7. **Authenticated Users Can Bypass Rate Limits**
   - Only IP-based checking
   - Logged-in users can report from multiple locations
   - See CODE_INCONSISTENCIES.md #8

8. **Rate Limit Data Never Cleaned Up**
   - `reportRateLimits` collection grows indefinitely
   - Old data never deleted
   - See CODE_INCONSISTENCIES.md #9

9. **No Status Transition Validation**
   - "Permanent" removals could theoretically be reversed
   - No enforcement of valid status transitions
   - See CODE_INCONSISTENCIES.md #10

### Planned Enhancements:

1. **Appeals System** (Priority: HIGH)
   - Appeal submission interface
   - Admin appeal review page
   - Appeal approval/rejection workflow
   - Auto-delete after deadline expires
   - See TASKS.md Section 9.2

2. **Admin Activity Logging** (Priority: HIGH)
   - Track which admin took which action
   - Activity history page
   - Performance metrics per admin
   - Undo functionality for recent actions

3. **Appeal Deadline Reminders** (Priority: MEDIUM)
   - Automated reminders at 7 days, 3 days, 1 day before deadline
   - Requires scheduled job (cron)

4. **Performance Optimization** (Priority: MEDIUM)
   - Batch fetch campaigns/users instead of one-by-one
   - Or: Only fetch live data when admin clicks "Take Action"
   - Reduce database reads by 90%

5. **Enhanced User Tracking** (Priority: MEDIUM)
   - Track reports by userId for authenticated users
   - Prevent report spam from same user on different networks

6. **Reason Count History** (Priority: LOW)
   - Archive reason counts when admin takes action
   - Allow pattern analysis and trend detection

7. **Automatic Cleanup** (Priority: LOW)
   - Cron job to delete old rate limit data
   - Or: Use Firestore TTL to auto-delete

---

## Summary

The Twibbonize reporting system is designed to:
- ✅ Make reporting easy for users (just select a reason from dropdown)
- ✅ Auto-hide problematic content quickly (3 reports for campaigns, 10 for users)
- ✅ Give admins powerful filtering and sorting tools
- ✅ Show clear reason breakdowns for informed decisions
- ✅ Communicate actions transparently via in-app notifications
- ✅ Maintain audit trails for repeat offenders
- ✅ Optimize performance for viral-scale campaigns (95% reduction in database operations)
- ⏸️ Provide fair appeal windows (system ready but interface not built)
- ✅ Prevent report spam through rate limiting
- ✅ Protect user privacy (hashed IP addresses)

This system balances automation with human oversight, ensuring bad content is addressed quickly while giving creators/users appropriate notifications and (eventually) appeal rights.

**Note:** This document reflects the actual implementation as of October 21, 2025. For known issues and improvement suggestions, see CODE_INCONSISTENCIES.md.
