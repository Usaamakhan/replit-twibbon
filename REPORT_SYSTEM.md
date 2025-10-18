# Twibbonize Reporting System

## Overview
The Twibbonize reporting system allows users to report inappropriate campaigns or user profiles. The system is designed to be efficient, reducing database operations by 95% through an optimized aggregation approach. This document explains how the system works in simple, non-technical terms.

---

## How Users Report Content

### Reporting a Campaign
1. **User clicks "Report" button** on a campaign
2. **Selects a reason** from dropdown:
   - Inappropriate Content
   - Spam
   - Copyright Violation
   - Other
3. **Submits the report** (no text field needed - just reason selection)

### Reporting a User Profile
1. **User clicks "Report" button** on a user's profile
2. **Selects a reason** from dropdown:
   - Inappropriate Profile Picture
   - Offensive Username
   - Spam in Bio/Description
   - Impersonation
   - Other
3. **Submits the report**

---

## What Happens After a Report is Submitted

### For Campaigns:
1. **Report is counted** - The campaign's report count increases by 1
2. **Reason is tracked** - The specific reason (spam, inappropriate, etc.) is recorded
3. **Auto-hide at 3 reports:**
   - When a campaign reaches **3 or more reports**
   - It is automatically **hidden from public view**
   - Status changes to `under-review-hidden`
   - **Creator receives notification**: "⚠️ Campaign Under Review - Your campaign has been flagged by users and is now under review"
4. **Below 3 reports** - Campaign stays visible, no notification sent

### For User Profiles:
1. **Report is counted** - The user's report count increases by 1
2. **Reason is tracked** - The specific reason is recorded
3. **Auto-hide at 10 reports:**
   - When a user reaches **10 or more reports**
   - Their profile is automatically **hidden from public view**
   - Status changes to `under-review-hidden`
   - **User receives notification**: "⚠️ Profile Under Review"
4. **Below 10 reports** - Profile stays visible, no notification sent

---

## Report Aggregation System

### How It Works:
Instead of storing each individual report, the system groups all reports for the same campaign/user into a single **Report Summary**.

**What's Stored:**
- **Total report count** (e.g., 15 reports)
- **Reason breakdown** (e.g., Spam: 8, Inappropriate: 5, Copyright: 2)
- **Status** (Pending, Resolved, or Dismissed)
- **Timestamps** (first report, last report)
- **Cached display info** (campaign title, image, creator name)

**Why This Matters:**
- Saves 95% of database operations
- Faster for admins to review
- Cheaper to run at scale

---

## Admin Dashboard (/admin/reports)

### How Admins Access Reports

Admins visit `/admin/reports` and see a control panel with filters:

#### Filter Options:

1. **Report Type**
   - **All Types** - Shows both campaigns and users
   - **Campaigns** - Shows only reported campaigns
   - **Users** - Shows only reported user profiles

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

---

## Report Table Display

Each row in the table shows:

### Campaign Reports:
- **Campaign thumbnail** (small image)
- **Campaign title**
- **Creator name**
- **Total report count** (big red number)
- **Current status** (active, hidden, removed-temporary, etc.)
- **Last reported date/time**
- **Action buttons** (View Breakdown, Take Action)

### User Reports:
- **Profile picture** (or initials if no picture)
- **User's display name**
- **Username** (@username)
- **Total report count** (big red number)
- **Current status** (active, hidden, banned-temporary, etc.)
- **Last reported date/time**
- **Action buttons** (View Breakdown, Take Action)

---

## Viewing Report Details

### View Breakdown Button
When clicked, expands to show:
- **Reason distribution** (visual breakdown)
- Each reason with:
  - Count (e.g., "Spam: 8")
  - Percentage (e.g., "53%")
  - Visual progress bar
- **First report date**
- **Latest report date**

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
- Current moderation status
- Creator information
- Total reports count
- Report summary information

#### For Users:
- Profile picture
- Display name and username
- Current account status
- Moderation status
- Total reports count
- Link to view full profile

---

## Admin Actions

When admin clicks "Take Action", they see **3 action buttons** with confirmation popups:

### 1. Dismiss Report (Secondary Button - Gray)
**What it does:**
- Marks reports as "dismissed"
- Resets report count to 0
- Restores content to "active" status
- Clears all reason counts

**Notification sent?**
- ✅ **YES** - If campaign/user was auto-hidden (3+ reports for campaigns, 10+ for users)
  - **Campaign**: "✅ Campaign Restored - Good news! Your campaign has been reviewed and restored"
  - **User**: "✅ Profile Restored - Good news! Your profile has been reviewed and restored"
- ❌ **NO** - If content was never hidden (below threshold)

**Confirmation popup:**
> "Are you sure you want to dismiss this report? The campaign/user will be restored to active status."

**Use when:** Reports are false/spam, or content doesn't violate rules

---

### 2. Warn User/Creator (Warning Button - Yellow)
**What it does:**
- Creates a warning record in database
- Keeps content in current state (might still be hidden)
- Resets report count to 0

**Notification sent:** ✅ **ALWAYS**
- **Message**: "⚠️ Warning Issued - You've received a warning. Please review our community guidelines."

**Confirmation popup:**
> "Are you sure you want to issue a warning to this user/creator? They will receive a notification."

**Use when:** Content is borderline/minor issue, but you want to warn the creator

---

### 3. Ban User / Remove Campaign (Danger Button - Red)
**What it does:**

**For Campaigns:**
- Sets status to `removed-temporary`
- Content stays hidden
- Sets 30-day appeal deadline
- Resets report count to 0
- After 30 days: Auto-deletes permanently if no appeal
- Second removal: `removed-permanent` (no recovery)

**For Users:**
- Sets account status to `banned-temporary`
- Hides all their campaigns
- Sets 30-day appeal deadline
- Resets report count to 0

**Notification sent:** ✅ **ALWAYS**
- **Campaign**: "🚫 Campaign Removed - Your campaign has been removed. You can appeal this decision until [date]"
- **User**: "🚫 Account Banned - Your account has been banned. You can appeal until [date]"

**Confirmation popup:**
> "Are you sure you want to ban this user/remove this campaign? This action will hide the content and notify the user/creator."

**Use when:** Content clearly violates rules and needs removal

---

## Status Meanings

### Report Summary Statuses:
- **pending** - Waiting for admin review
- **resolved** - Admin took action (warned or removed)
- **dismissed** - Admin found no issue

### Campaign Moderation Statuses:
- **active** - Visible to public, no issues
- **under-review-hidden** - Hidden due to 3+ reports, awaiting admin review
- **removed-temporary** - Admin removed, 30-day appeal window
- **removed-permanent** - Permanently deleted (second offense)

### User Account/Moderation Statuses:
- **active** - Normal account, no issues
- **under-review-hidden** - Profile hidden due to 10+ reports
- **suspended** - Temporarily restricted
- **banned-temporary** - Banned with 30-day appeal window
- **banned-permanent** - Permanently banned

---

## Automatic Behavior

### When New Reports Come In After Admin Action:

1. **If admin previously dismissed/resolved:**
   - Report summary status resets to `pending`
   - Counter starts fresh from 1
   - All reason counts reset
   - New report triggers auto-hide thresholds again

2. **Auto-hide triggers again:**
   - Campaign: Hidden at 3rd report
   - User: Hidden at 10th report
   - Notification sent again to creator/user

### Report Summary Retention:
- **Report summaries are kept forever** (not deleted after admin action)
- This allows tracking:
  - Repeat offenders
  - Historical patterns
  - Audit trail for moderation decisions

---

## Notification System

All notifications are **in-app only** (Firestore-based, no browser permissions needed):

### When Notifications Are Sent:

1. **Campaign reaches 3 reports** → "Campaign Under Review"
2. **User profile reaches 10 reports** → "Profile Under Review"
3. **Admin dismisses (if was hidden)** → "Campaign/Profile Restored"
4. **Admin warns** → "Warning Issued"
5. **Admin removes/bans** → "Campaign Removed" or "Account Banned"

### Notification Delivery:
- Saved to Firestore: `users/{userId}/notifications`
- Real-time listeners update UI instantly
- Shows in notification bell (header)
- Toast popup for new notifications
- Inbox available at `/profile/notifications`

---

## Performance Optimizations

### Before Optimization (Old System):
- **Report submission**: 3 Firestore writes
- **Admin dismiss (100 reports)**: 102 reads + 103 writes

### After Optimization (Current System):
- **Report submission**: 2 Firestore writes (33% reduction)
- **Admin dismiss (any number of reports)**: 2 reads + 3 writes (98% reduction)

### How It's Achieved:
- Use aggregated `reportSummary` collection instead of individual report documents
- Store reason counts as objects (e.g., `{spam: 8, inappropriate: 5}`)
- No need to fetch/update hundreds of individual reports
- Single transaction handles everything atomically

---

## Key Design Principles

1. **Efficiency First** - Minimize database operations for scalability
2. **Transparency** - Clear reason breakdowns help admins make informed decisions
3. **User Communication** - Automatic notifications keep creators informed
4. **Audit Trail** - Keep summaries forever for pattern detection
5. **Fairness** - Appeal windows give users a chance to contest decisions
6. **Automation** - Auto-hide at thresholds reduces admin workload for clear cases

---

## Common Admin Workflows

### Scenario 1: False Reports (Spam Reports)
1. Filter: Status = "Pending", Sort = "Top Reported"
2. Click "Take Action" on campaign with high reports
3. Review campaign - looks fine
4. Click "Dismiss Report"
5. Confirm action
6. If campaign was hidden → Creator gets "Restored" notification
7. If campaign wasn't hidden → No notification sent

### Scenario 2: Clear Violation
1. Filter: Status = "Pending"
2. Review campaign - clearly inappropriate
3. Click "Take Action"
4. Click "Remove Campaign" (or "Ban User")
5. Confirm action
6. Creator/user receives removal notification with appeal deadline
7. Report count resets, content hidden

### Scenario 3: Minor Issue / Warning
1. Review reported content
2. Content is borderline but not severe
3. Click "Warn Creator/User"
4. Confirm action
5. Warning saved to database
6. User receives warning notification
7. Content may stay visible or hidden depending on current state

---

## Summary

The Twibbonize reporting system is designed to:
- ✅ Make reporting easy for users (just select a reason)
- ✅ Auto-hide problematic content quickly (3 reports for campaigns, 10 for users)
- ✅ Give admins powerful filtering and sorting tools
- ✅ Show clear reason breakdowns for informed decisions
- ✅ Communicate actions transparently via notifications
- ✅ Maintain audit trails for repeat offenders
- ✅ Optimize performance for viral-scale campaigns
- ✅ Provide fair appeal windows for wrongful removals

This system balances automation with human oversight, ensuring bad content is addressed quickly while giving creators/users appropriate notifications and appeal rights.
