# Admin Dashboard - Implementation Tasks

**Project:** Twibbonize Campaign Platform  
**Phase:** Admin Dashboard (Phase 2)  
**Last Updated:** October 08, 2025

---

## 📋 Completed Tasks Summary

### ✅ Section 1-7: COMPLETED (October 4-8, 2025)

All admin dashboard features have been successfully implemented:

**1. Foundation & Security**
- ✅ Admin role field in user schema (`role: "admin" | "user"`)
- ✅ Admin middleware (`adminAuth.js` with `requireAdmin()`)
- ✅ All admin API routes protected

**2. Admin Layout**
- ✅ AdminSidebar with navigation (4 sections)
- ✅ AdminHeader with breadcrumbs
- ✅ Admin layout wrapper at `/admin`

**3. Reports Management** (`/admin/reports`)
- ✅ ReportsTable with filters and pagination
- ✅ ReportDetailsPanel slide-out
- ✅ API: GET reports, PATCH update status
- ✅ Actions: Update status, resolve, dismiss

**4. Campaign Moderation** (`/admin/campaigns`)
- ✅ CampaignModerationCard grid view
- ✅ Moderation status updates (active/under-review/removed)
- ✅ API: GET campaigns, PATCH moderation status, DELETE campaign
- ✅ Delete campaigns with Supabase image cleanup

**5. User Management** (`/admin/users`)
- ✅ UsersTable with search
- ✅ UserDetailsModal with admin actions
- ✅ API: GET users, PATCH role, PATCH ban/unban
- ✅ Role assignment (admin/user)
- ✅ Ban/unban functionality

**6. Analytics Dashboard** (`/admin` - default page)
- ✅ Platform metrics (campaigns, users, reports)
- ✅ Real-time aggregation queries using Firebase Admin SDK
- ✅ Firestore count() optimization (replaced .get().length)
- ✅ Campaign type breakdown, user role breakdown, report status breakdown
- ✅ Top reported campaigns table
- ✅ Engagement metrics (supports, averages)
- ✅ 2-minute HTTP caching

**7. Admin Utilities**
- ✅ `adminHelpers.js` - 7 formatting functions (formatReportReason, getModerationStatusColor, etc.)
- ✅ `adminValidation.js` - 6 validation functions (validateReportStatus, etc.)
- ✅ `AdminActionButton.js` - Reusable action button with loading/confirm dialog
- ✅ Refactored 3 admin components to use shared utilities

**Files Created:** 24 files (routes, APIs, components, utilities)  
**Total Lines:** ~3,500 lines of code

---

## 🧪 Section 8: Testing & Quality Assurance

**Priority:** High (Before Production Launch)  
**Status:** ⏸️ PENDING - User Testing Required

This section provides a comprehensive testing checklist for all admin dashboard features. Test systematically to ensure everything works correctly before deploying to production.

---

### Prerequisites for Testing

**1. Admin User Setup**
- Create a test user account
- Manually update Firestore: `users/{userId}` → Set `role: "admin"`
- Verify admin role is saved correctly

**2. Test Data Preparation**
- Have at least 3-5 campaigns created
- Create 2-3 test reports (use "Report Campaign" button on public pages)
- Have multiple user accounts (mix of regular users and 1-2 admins)

**3. Environment**
- Test on deployed Vercel environment (NOT localhost)
- Test on both desktop and mobile browsers
- Clear browser cache before testing

---

### A. Admin Authentication & Access Control

**Test Cases:**

1. **Admin Access - Positive Test**
   - [ ] Login with admin user
   - [ ] Navigate to `/admin`
   - [ ] Verify: You can access the admin dashboard
   - [ ] Verify: Sidebar shows all 4 sections (Analytics, Reports, Campaigns, Users)

2. **Non-Admin Access - Negative Test**
   - [ ] Login with regular user (non-admin)
   - [ ] Try to navigate to `/admin`
   - [ ] Verify: Access is blocked with error message
   - [ ] Try direct URL access to `/admin/reports`
   - [ ] Verify: Access is blocked

3. **Unauthenticated Access - Negative Test**
   - [ ] Logout completely
   - [ ] Try to navigate to `/admin`
   - [ ] Verify: Redirected to login page or access denied

4. **API Protection**
   - [ ] Open browser DevTools → Network tab
   - [ ] Navigate to `/admin` (as admin)
   - [ ] Check API requests to `/api/admin/*`
   - [ ] Verify: All requests return 200 OK
   - [ ] Try accessing API endpoints manually without auth
   - [ ] Verify: Returns 401 Unauthorized

**Expected Results:**
- ✅ Admin users can access all admin features
- ✅ Non-admin users cannot access admin dashboard
- ✅ API endpoints reject unauthorized requests

---

### B. Reports Management Testing

**Page:** `/admin/reports`

**Test Cases:**

1. **Reports Table Display**
   - [ ] Navigate to `/admin/reports`
   - [ ] Verify: Table loads with all reports
   - [ ] Check columns: Campaign thumbnail, Campaign title, Reason, Reporter, Status, Date
   - [ ] Verify: Campaign thumbnails display correctly
   - [ ] Verify: Dates are formatted properly

2. **Filter by Status**
   - [ ] Click "Status" filter dropdown
   - [ ] Select "Pending"
   - [ ] Verify: Only pending reports are shown
   - [ ] Select "Resolved"
   - [ ] Verify: Only resolved reports are shown
   - [ ] Select "All"
   - [ ] Verify: All reports are shown again

3. **Report Details Panel**
   - [ ] Click on any report row
   - [ ] Verify: Right side panel opens with full report details
   - [ ] Check: Campaign preview image is visible
   - [ ] Check: Reporter information is shown
   - [ ] Check: Report reason and details are displayed
   - [ ] Check: Created date is shown
   - [ ] Click "Close" or outside panel
   - [ ] Verify: Panel closes

4. **Update Report Status**
   - [ ] Select a "Pending" report
   - [ ] Click "Mark as Reviewed" button
   - [ ] Verify: Status updates to "Reviewed"
   - [ ] Verify: Table updates immediately
   - [ ] Refresh page
   - [ ] Verify: Status persists after refresh

5. **Resolve Report**
   - [ ] Select a "Reviewed" report
   - [ ] Click "Resolve" button
   - [ ] Verify: Status updates to "Resolved"
   - [ ] Verify: Report moves to "Resolved" filter

6. **Dismiss Report**
   - [ ] Select a "Pending" report
   - [ ] Click "Dismiss" button
   - [ ] Verify: Status updates to "Dismissed"
   - [ ] Verify: Report appears under "Dismissed" filter

**Expected Results:**
- ✅ All reports display correctly with campaign previews
- ✅ Filters work properly
- ✅ Status updates persist to Firestore
- ✅ UI updates immediately after actions

---

### C. Campaign Moderation Testing

**Page:** `/admin/campaigns`

**Test Cases:**

1. **Campaigns Grid Display**
   - [ ] Navigate to `/admin/campaigns`
   - [ ] Verify: All campaigns display in grid layout
   - [ ] Check: Campaign thumbnails load correctly
   - [ ] Check: Campaign titles, creator names visible
   - [ ] Check: Supporters count is shown
   - [ ] Check: Reports count badge is visible (if campaign has reports)
   - [ ] Verify: Moderation status badges show correct colors

2. **Filter by Moderation Status**
   - [ ] Click "Filter" dropdown
   - [ ] Select "Active"
   - [ ] Verify: Only active campaigns are shown
   - [ ] Select "Under Review"
   - [ ] Verify: Only under-review campaigns are shown
   - [ ] Select "Removed"
   - [ ] Verify: Only removed campaigns are shown

3. **Change Moderation Status - Mark Under Review**
   - [ ] Find an "Active" campaign
   - [ ] Click "..." menu → "Mark Under Review"
   - [ ] Verify: Confirmation dialog appears
   - [ ] Click "Confirm"
   - [ ] Verify: Status changes to "Under Review" (yellow badge)
   - [ ] Refresh page
   - [ ] Verify: Status persists

4. **Remove Campaign**
   - [ ] Find a campaign to remove
   - [ ] Click "..." menu → "Remove Campaign"
   - [ ] Verify: Confirmation dialog appears with reason input
   - [ ] Enter removal reason: "Test removal - inappropriate content"
   - [ ] Click "Confirm"
   - [ ] Verify: Status changes to "Removed" (red badge)
   - [ ] Navigate to public `/campaigns` page
   - [ ] Verify: Removed campaign is NOT visible to public

5. **Restore Campaign**
   - [ ] Filter by "Removed" campaigns
   - [ ] Find the campaign you just removed
   - [ ] Click "..." menu → "Restore Campaign"
   - [ ] Click "Confirm"
   - [ ] Verify: Status changes back to "Active"
   - [ ] Navigate to public `/campaigns` page
   - [ ] Verify: Campaign is visible again

6. **Delete Campaign Permanently**
   - [ ] Find a test campaign (NOT an important one)
   - [ ] Click "..." menu → "Delete Permanently"
   - [ ] Verify: Warning dialog appears (mentions irreversible action)
   - [ ] Click "Confirm Delete"
   - [ ] Verify: Campaign is removed from list
   - [ ] Check Firestore manually
   - [ ] Verify: Campaign document is deleted
   - [ ] Check Supabase storage
   - [ ] Verify: Campaign image file is deleted

**Expected Results:**
- ✅ Moderation status updates work correctly
- ✅ Removed campaigns are hidden from public view
- ✅ Restored campaigns become public again
- ✅ Permanent deletion removes both Firestore doc and Supabase image
- ✅ Confirmation dialogs prevent accidental actions

---

### D. User Management Testing

**Page:** `/admin/users`

**Test Cases:**

1. **Users Table Display**
   - [ ] Navigate to `/admin/users`
   - [ ] Verify: Table loads with all users
   - [ ] Check columns: Avatar, Display Name, Email, Role, Campaigns, Supports, Joined Date
   - [ ] Verify: Profile pictures display correctly
   - [ ] Verify: Role badges show correct colors (purple for admin, gray for user)

2. **Search Users**
   - [ ] Enter a user's name in search box
   - [ ] Verify: Table filters to matching users only
   - [ ] Enter an email address
   - [ ] Verify: Finds the correct user
   - [ ] Clear search
   - [ ] Verify: All users are shown again

3. **View User Details**
   - [ ] Click on any user row
   - [ ] Verify: User details modal opens
   - [ ] Check: Full user information is displayed
   - [ ] Check: Total campaigns and supports are shown
   - [ ] Check: Join date is correct
   - [ ] Close modal

4. **Assign Admin Role**
   - [ ] Find a regular user (Role: "user")
   - [ ] Click "..." menu → "Make Admin"
   - [ ] Verify: Confirmation dialog appears
   - [ ] Click "Confirm"
   - [ ] Verify: Role badge changes to "Admin" (purple)
   - [ ] Refresh page
   - [ ] Verify: Role persists
   - [ ] Logout and login with that user account
   - [ ] Try accessing `/admin`
   - [ ] Verify: User now has admin access

5. **Revoke Admin Role**
   - [ ] Find the user you just promoted
   - [ ] Click "..." menu → "Revoke Admin"
   - [ ] Click "Confirm"
   - [ ] Verify: Role changes back to "User"
   - [ ] Logout and login with that user account
   - [ ] Try accessing `/admin`
   - [ ] Verify: Access is now denied

6. **Ban User**
   - [ ] Find a test user to ban (NOT your main admin account)
   - [ ] Click "..." menu → "Ban User"
   - [ ] Verify: Ban reason dialog appears
   - [ ] Enter reason: "Test ban - spam violation"
   - [ ] Click "Confirm"
   - [ ] Verify: User status shows as "Banned"
   - [ ] Logout and login with that user account
   - [ ] Verify: User cannot login OR sees "Account banned" message

7. **Unban User**
   - [ ] Find the banned user in admin panel
   - [ ] Click "..." menu → "Unban User"
   - [ ] Click "Confirm"
   - [ ] Verify: Ban status is removed
   - [ ] Logout and login with that user account
   - [ ] Verify: User can now login successfully

**Expected Results:**
- ✅ User search works correctly
- ✅ Role changes persist to Firestore
- ✅ Promoted users immediately gain admin access
- ✅ Banned users cannot login
- ✅ Unbanned users can login again

---

### E. Analytics Dashboard Testing

**Page:** `/admin` (default admin page)

**Test Cases:**

1. **Platform Metrics Display**
   - [ ] Navigate to `/admin`
   - [ ] Verify: Dashboard loads with metric cards
   - [ ] Check "Total Campaigns" card
   - [ ] Verify: Number matches actual campaign count
   - [ ] Check "Total Users" card
   - [ ] Verify: Number matches actual user count
   - [ ] Check "Total Reports" card
   - [ ] Verify: Number matches actual report count

2. **Campaign Type Breakdown**
   - [ ] Find "Campaign Types" section
   - [ ] Verify: Shows Frame count
   - [ ] Verify: Shows Background count
   - [ ] Verify: Total = Frames + Backgrounds
   - [ ] Create a new frame campaign (if possible)
   - [ ] Refresh admin dashboard
   - [ ] Verify: Frame count increases by 1

3. **User Role Breakdown**
   - [ ] Find "User Roles" section
   - [ ] Verify: Shows admin count
   - [ ] Verify: Shows regular user count
   - [ ] Verify: Shows banned user count (if any)
   - [ ] Make a user admin (from Users section)
   - [ ] Refresh dashboard
   - [ ] Verify: Admin count increases

4. **Report Status Breakdown**
   - [ ] Find "Report Status" section
   - [ ] Verify: Shows pending count
   - [ ] Verify: Shows reviewed count
   - [ ] Verify: Shows resolved count
   - [ ] Verify: Shows dismissed count
   - [ ] Resolve a pending report
   - [ ] Refresh dashboard
   - [ ] Verify: Pending decreases, Resolved increases

5. **Engagement Metrics**
   - [ ] Find "Engagement" section
   - [ ] Verify: Shows total supports count
   - [ ] Verify: Shows average supports per campaign
   - [ ] Download a campaign (as regular user)
   - [ ] Refresh admin dashboard
   - [ ] Verify: Total supports increases

6. **Top Reported Campaigns**
   - [ ] Find "Top Reported Campaigns" table
   - [ ] Verify: Shows campaigns with most reports
   - [ ] Verify: Sorted by report count (highest first)
   - [ ] Verify: Shows campaign title and report count
   - [ ] Submit a new report for a campaign
   - [ ] Refresh dashboard
   - [ ] Verify: Report count for that campaign increases

7. **Performance Check**
   - [ ] Open browser DevTools → Network tab
   - [ ] Refresh `/admin` page
   - [ ] Check `/api/admin/analytics` request
   - [ ] Verify: Response time is < 3 seconds
   - [ ] Check response data format
   - [ ] Verify: All counts are numbers (not null/undefined)

**Expected Results:**
- ✅ All metrics display accurate real-time data
- ✅ Counts update when underlying data changes
- ✅ Aggregation queries perform well (< 3s response time)
- ✅ No null/undefined errors in metrics

---

### F. Admin Utilities Testing

**Components to Test:**

1. **AdminActionButton Component**
   - [ ] Find any admin action button (e.g., "Remove Campaign")
   - [ ] Click the button
   - [ ] Verify: Loading spinner appears during action
   - [ ] Verify: Button is disabled while loading
   - [ ] Verify: Success/error state shows after completion
   - [ ] Test a button with confirmation dialog
   - [ ] Verify: Confirmation modal appears before action
   - [ ] Click "Cancel"
   - [ ] Verify: Action is not executed

2. **Helper Functions (Visual Check)**
   - [ ] Navigate to `/admin/reports`
   - [ ] Verify: Report reasons show as "Inappropriate Content" (not "inappropriate")
   - [ ] Verify: Dates are formatted as "Oct 08, 2025" format
   - [ ] Check status badges
   - [ ] Verify: Colors are consistent (pending=yellow, resolved=green, etc.)

3. **Validation Functions (Error Prevention)**
   - [ ] Try to update a report status with invalid value (use DevTools console)
   - [ ] Verify: Validation prevents invalid status
   - [ ] Try to ban a user without reason
   - [ ] Verify: Error message requires ban reason

**Expected Results:**
- ✅ Action buttons show proper loading states
- ✅ Confirmation dialogs prevent accidental actions
- ✅ Helper functions format data consistently
- ✅ Validation prevents invalid inputs

---

### G. Mobile Responsiveness Testing

**Test on Mobile Device or Browser DevTools Mobile View:**

1. **Admin Sidebar**
   - [ ] Open `/admin` on mobile
   - [ ] Verify: Sidebar is collapsible or responsive
   - [ ] Navigate between sections
   - [ ] Verify: Navigation works smoothly

2. **Tables on Mobile**
   - [ ] Open `/admin/reports` on mobile
   - [ ] Verify: Table is horizontally scrollable OR stacks vertically
   - [ ] Check `/admin/users` table
   - [ ] Verify: All columns are accessible

3. **Modals and Panels**
   - [ ] Open report details panel on mobile
   - [ ] Verify: Panel takes full screen or adapts to mobile width
   - [ ] Open user details modal
   - [ ] Verify: Modal is readable and functional

**Expected Results:**
- ✅ Admin dashboard is usable on mobile devices
- ✅ Tables are scrollable or responsive
- ✅ Modals and panels work on small screens

---

### H. Security Testing

**Critical Security Checks:**

1. **API Authorization**
   - [ ] Open browser DevTools → Console
   - [ ] Logout from admin account
   - [ ] Try to call: `fetch('/api/admin/reports')`
   - [ ] Verify: Returns 401 Unauthorized
   - [ ] Login as regular user (non-admin)
   - [ ] Try to call: `fetch('/api/admin/analytics')`
   - [ ] Verify: Returns 403 Forbidden (not admin)

2. **Direct URL Access**
   - [ ] Logout completely
   - [ ] Try to access: `/admin/campaigns`
   - [ ] Verify: Access is blocked
   - [ ] Login as non-admin user
   - [ ] Try to access: `/admin/users`
   - [ ] Verify: Access is blocked

3. **Role Manipulation Test**
   - [ ] As regular user, open Firestore
   - [ ] Try to manually update your own `role` field to "admin"
   - [ ] Verify: Firestore rules prevent this (or changes don't grant access)
   - [ ] Only admins should be able to change roles

**Expected Results:**
- ✅ All admin API endpoints reject non-admin users
- ✅ Direct URL access is blocked for non-admins
- ✅ Users cannot self-promote to admin role
- ✅ Token-based authentication works correctly

---

### I. Error Handling Testing

**Test Error States:**

1. **Network Errors**
   - [ ] Open DevTools → Network tab
   - [ ] Set throttling to "Offline"
   - [ ] Try to load `/admin/reports`
   - [ ] Verify: Error message appears
   - [ ] Re-enable network
   - [ ] Verify: Page recovers

2. **Empty States**
   - [ ] Create a new admin account with no data
   - [ ] Navigate to `/admin/reports`
   - [ ] Verify: Shows "No reports found" message (not blank page)
   - [ ] Navigate to `/admin/campaigns`
   - [ ] Verify: Shows empty state message

3. **Loading States**
   - [ ] Refresh `/admin/analytics`
   - [ ] Watch for loading indicators
   - [ ] Verify: Loading spinners or skeletons appear
   - [ ] Verify: Data loads and replaces loading state

**Expected Results:**
- ✅ Network errors show user-friendly messages
- ✅ Empty states are handled gracefully
- ✅ Loading states prevent layout shift

---

### J. Performance Testing

**Measure Performance:**

1. **Page Load Time**
   - [ ] Clear browser cache
   - [ ] Open DevTools → Performance tab
   - [ ] Record page load for `/admin`
   - [ ] Verify: Page loads in < 3 seconds
   - [ ] Check for any blocking scripts

2. **API Response Time**
   - [ ] Open DevTools → Network tab
   - [ ] Navigate to `/admin/analytics`
   - [ ] Check `/api/admin/analytics` request
   - [ ] Verify: Response time < 3 seconds (even with 100+ campaigns)

3. **Memory Leaks**
   - [ ] Open DevTools → Memory tab
   - [ ] Take heap snapshot
   - [ ] Navigate between admin sections multiple times
   - [ ] Take another heap snapshot
   - [ ] Verify: Memory usage is stable (no major leaks)

**Expected Results:**
- ✅ Admin pages load quickly
- ✅ API responses are fast
- ✅ No memory leaks during navigation

---

## 📝 Testing Summary Checklist

Before marking admin dashboard as production-ready, ensure:

- [ ] ✅ Admin authentication works correctly
- [ ] ✅ All API endpoints are protected
- [ ] ✅ Reports management is fully functional
- [ ] ✅ Campaign moderation works (status updates, deletion)
- [ ] ✅ User management works (role assignment, banning)
- [ ] ✅ Analytics dashboard shows accurate metrics
- [ ] ✅ Mobile responsiveness is acceptable
- [ ] ✅ Security tests pass (no unauthorized access)
- [ ] ✅ Error states are handled gracefully
- [ ] ✅ Performance is acceptable (< 3s load times)

---

## 🐛 Bug Reporting

If you find any issues during testing, note them here:

**Bug Template:**
```
**Issue:** [Brief description]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Expected vs Actual]

**Severity:** Critical / High / Medium / Low
**Browser:** Chrome/Firefox/Safari/Mobile
**Screenshot:** [If applicable]
```

---

## ✅ Sign-Off

**Tested By:** _________________  
**Date:** _________________  
**Status:** Pass / Fail / Needs Fixes  
**Notes:** _________________

---

**End of Testing Checklist**

---

## 🚨 Section 9: Report System - Critical Fixes & Enhancements

**Priority:** CRITICAL  
**Status:** ⏸️ PENDING - Action Buttons Currently Non-Functional  
**Last Updated:** October 08, 2025

### Problem Discovered

The admin report action buttons (**Dismiss Report**, **Warn Creator**, **Remove Campaign**) currently **only update the report status** but **do NOT perform the actual actions** they claim to do. This is a critical gap in functionality.

---

### 9.1: Fix Report Action Buttons (CRITICAL)

**Current Behavior vs Expected Behavior:**

#### 1. **Dismiss Report** Button
- ✅ **Current:** Updates report to `status: dismissed`, `action: no-action`
- ❌ **Missing:** No actual functionality needed (working as intended)
- ✅ **Status:** COMPLETE

#### 2. **Warn Creator** Button
- ✅ **Current:** Updates report to `status: resolved`, `action: warned`
- ❌ **Missing:**
  - Does NOT send any warning notification to creator
  - Does NOT create warning record in user's account
  - Does NOT track warning count
  - Does NOT have escalation logic (3 warnings = ban?)

**Tasks to Fix:**
- [ ] Create `warnings` collection in Firestore
  ```javascript
  {
    userId: string,
    campaignId: string,
    reportId: string,
    reason: string,
    issuedBy: adminId,
    issuedAt: timestamp,
    acknowledged: boolean,
  }
  ```
- [ ] Update API route `/api/admin/reports/[reportId]/route.js`:
  - When `action: warned`, create warning document in Firestore
  - Increment user's `warningsCount` field
  - Send notification to creator (email or in-app)
- [ ] Create warning escalation logic:
  - 3 warnings = 7-day ban
  - 5 warnings = permanent ban
  - Track warnings in user profile

#### 3. **Remove Campaign** Button
- ✅ **Current:** Updates report to `status: resolved`, `action: removed`
- ❌ **Missing:**
  - Does NOT actually remove the campaign
  - Does NOT update campaign's `moderationStatus`
  - Campaign remains public and accessible
  - Creator is NOT notified

**Tasks to Fix:**
- [ ] Update API route `/api/admin/reports/[reportId]/route.js`:
  - When `action: removed`, update campaign's `moderationStatus` to `removed`
  - Set campaign's `removedAt` timestamp
  - Set campaign's `removalReason` field
  - Optionally delete campaign image from Supabase (or keep for records)
  - Send notification to creator
- [ ] Update campaign queries to filter out `moderationStatus: removed` campaigns
- [ ] Add ability for creator to appeal removal (Phase 3)

---

### 9.2: Notification & Messaging System

**Priority:** HIGH  
**Status:** ⏸️ NOT IMPLEMENTED - No notification system exists

**Current State:**
- ❌ No email notifications
- ❌ No in-app notifications
- ❌ No notification preferences
- ❌ Users are unaware when:
  - Their campaign is reported
  - Their campaign is removed
  - They receive a warning
  - They are banned

**Implementation Tasks:**

#### A. Email Notification System (Recommended: Resend.com or SendGrid)
- [ ] Choose email service provider (Resend.com recommended - 3,000 free emails/month)
- [ ] Set up email templates:
  - Campaign removed notification
  - Warning issued notification
  - Account banned notification
  - Campaign under review notification
- [ ] Create `/api/notifications/email/route.js` for sending emails
- [ ] Integrate with report action buttons
- [ ] Add unsubscribe functionality

#### B. In-App Notification System (Future - Phase 3)
- [ ] Create `notifications` collection in Firestore:
  ```javascript
  {
    userId: string,
    type: 'warning' | 'campaign_removed' | 'under_review' | 'ban',
    title: string,
    message: string,
    link: string,
    read: boolean,
    createdAt: timestamp,
  }
  ```
- [ ] Create notification bell component in header
- [ ] Create `/api/notifications/route.js` for CRUD operations
- [ ] Add notification preferences page (`/profile/notifications`)
- [ ] Real-time notifications using Firebase Cloud Messaging (optional)

#### C. Notification Triggers
- [ ] Campaign removed → Email + In-app notification to creator
- [ ] Warning issued → Email + In-app notification to creator
- [ ] Account banned → Email to user
- [ ] Campaign under review (3+ reports) → Email to creator
- [ ] Report resolved (for reporter) → Optional in-app notification

---

### 9.3: Profile/User Reporting System

**Priority:** MEDIUM  
**Status:** ⏸️ NOT IMPLEMENTED

**Current State:**
- ✅ Campaign reporting works
- ❌ No ability to report user profiles
- ❌ No moderation for user-generated content (bio, username, avatar)

**Use Cases:**
- Inappropriate profile pictures
- Offensive usernames
- Spam in bio/description
- Impersonation

**Implementation Tasks:**

#### A. Backend - User Report API
- [ ] Create `/api/reports/user/route.js`:
  ```javascript
  POST /api/reports/user
  {
    reportedUserId: string,
    reportedBy: string | 'anonymous',
    reason: 'inappropriate_avatar' | 'offensive_username' | 'spam_bio' | 'impersonation' | 'other',
    details: string,
  }
  ```
- [ ] Update `reports` collection schema to support `type: 'campaign' | 'user'`
- [ ] Add `reportedUserId` field (optional, for user reports)
- [ ] Update admin reports page to filter by report type

#### B. Frontend - Report User UI
- [ ] Add "Report User" button to public profile pages (`/u/[username]`)
- [ ] Create `ReportUserModal` component (similar to campaign report modal)
- [ ] Add report reasons dropdown specific to user reports
- [ ] Integrate with `/api/reports/user` endpoint

#### C. Admin Moderation - User Reports
- [ ] Update `/admin/reports` to show user reports
- [ ] Add filter: Campaign Reports | User Reports | All
- [ ] User report actions:
  - Dismiss report
  - Warn user
  - Force username change
  - Remove profile picture
  - Ban user
- [ ] Update `ReportDetailsPanel` to display user info for user reports

#### D. Auto-Moderation for User Content
- [ ] Implement profanity filter for usernames (during onboarding)
- [ ] Implement image moderation for avatars (Cloud Vision API or similar)
- [ ] Auto-flag suspicious usernames containing:
  - Admin, mod, official, support
  - Common offensive terms
  - URLs or contact info

---

### 9.4: Reporting System Enhancements (Suggestions)

**Priority:** LOW  
**Status:** ⏸️ FUTURE ENHANCEMENTS

#### A. Report Abuse Prevention
- [ ] Rate limiting: Max 5 reports per user per day
- [ ] Prevent duplicate reports (same user + same campaign)
- [ ] Track reporter reputation (false report detection)
- [ ] Auto-dismiss reports from users with low reputation

#### B. Bulk Actions for Admins
- [ ] Select multiple reports and take action
- [ ] Bulk dismiss spam reports
- [ ] Bulk resolve reports for same campaign

#### C. Report Analytics
- [ ] Most reported campaigns dashboard
- [ ] Most common report reasons (pie chart)
- [ ] Reporter leaderboard (identify serial reporters)
- [ ] False report rate tracking

#### D. Appeal System (Phase 3)
- [ ] Allow creators to appeal campaign removals
- [ ] Allow users to appeal bans
- [ ] Create `/admin/appeals` page
- [ ] Appeal workflow: Submitted → Under Review → Approved/Rejected

#### E. Community Moderation (Future)
- [ ] Trusted user program (community moderators)
- [ ] Voting system for reports (requires X votes to action)
- [ ] Reputation-based moderation powers

---

### 9.5: Implementation Priority Order

**Immediate (Week 1):**
1. ✅ Fix "Remove Campaign" button to actually remove campaigns
2. ✅ Fix "Warn Creator" button to create warning records
3. ✅ Implement email notification system (Resend.com)

**Short-term (Week 2-3):**
4. ✅ Implement user/profile reporting system
5. ✅ Add report abuse prevention (rate limiting)
6. ✅ Add bulk actions for admins

**Long-term (Month 2-3):**
7. ✅ In-app notification system
8. ✅ Appeal system for removals/bans
9. ✅ Community moderation features

---

### 9.6: Files to Create/Modify

**API Routes:**
- Modify: `/src/app/api/admin/reports/[reportId]/route.js` (fix action buttons)
- Create: `/src/app/api/notifications/email/route.js` (email notifications)
- Create: `/src/app/api/reports/user/route.js` (user reporting)
- Create: `/src/app/api/notifications/route.js` (in-app notifications)

**Components:**
- Create: `ReportUserModal.js` (user report modal)
- Modify: `ReportDetailsPanel.js` (handle user reports)
- Create: `NotificationBell.js` (header notification icon)
- Create: `NotificationsList.js` (notification dropdown)

**Collections:**
- Update: `reports` (add `type` field: 'campaign' | 'user')
- Create: `warnings` (track user warnings)
- Create: `notifications` (in-app notifications)
- Create: `appeals` (appeal submissions)

**Utilities:**
- Create: `/src/lib/email.js` (email service integration)
- Create: `/src/utils/reportValidation.js` (rate limiting, duplicate check)
- Create: `/src/utils/profanityFilter.js` (username/bio moderation)

---

**End of Report System Section**
