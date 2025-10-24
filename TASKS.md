# Twibbonize - Tasks & Implementation Roadmap

**Last Updated:** October 09, 2025  
**Platform:** Next.js 15 + Firebase + Supabase + ImageKit.io  
**Deployment:** Vercel (all testing/deployment happens there, Replit for code editing only)

---

## 📋 Table of Contents

1. [Phase 1: Core Campaign Features](#phase-1-core-campaign-features)
2. [Phase 2: User Dashboard & Management](#phase-2-user-dashboard--management)
3. [Phase 3: Admin Dashboard & Moderation](#phase-3-admin-dashboard--moderation)
4. [Phase 4: Analytics & Insights](#phase-4-analytics--insights)
5. [Phase 5: Future Recommendations](#phase-5-future-recommendations)
6. [Section 6: Bug Fixes & Improvements](#section-6-bug-fixes--improvements)
7. [Section 7: Final Pre-Launch Checklist](#section-7-final-pre-launch-checklist)
8. [Section 8: Testing Checklist](#section-8-testing-checklist)
9. [Section 9: Report System - Critical Fixes & Enhancements](#section-9-report-system---critical-fixes--enhancements)
11. [Section 11: Settings & Navigation Architecture Restructure](#section-11-settings--navigation-architecture-restructure)

---

## Phase 1: Core Campaign Features
✅ **Status:** COMPLETED

### 1.1 Campaign Creation (Frame + Background)
- ✅ Upload image (frame or background)
- ✅ Add title, description, caption template
- ✅ Preview frame over sample image
- ✅ Publish campaign → Store in Firestore + Supabase
- ✅ Generate URL-friendly slug from title

### 1.2 Campaign Page (Public View)
- ✅ Display campaign title, description, creator info
- ✅ Show campaign image (frame or background)
- ✅ "Use This Frame" button → Redirect to `/campaign/[slug]/upload`
- ✅ Display supporter count
- ✅ Share buttons (Facebook, Twitter, WhatsApp)

### 1.3 Upload & Adjust Flow (3 Pages)
- ✅ **Page 1: Upload Photo** (`/campaign/[slug]/upload`)
  - Upload user photo (max 2MB)
  - Validation: file size, format (jpg/png/webp)
  - Show loading spinner during upload
  - Store image in Supabase `/supporter-photos`
  - Navigate to adjust page

- ✅ **Page 2: Adjust Frame** (`/campaign/[slug]/adjust`)
  - Display user photo with frame overlay (or background behind)
  - Zoom, rotate, reposition controls (mobile-friendly sliders)
  - "Download" button → Send photo + frame + adjustments to server
  - Server-side image processing (Sharp.js):
    - Apply frame overlay
    - Apply adjustments (zoom, rotate, position)
    - Optimize & resize output image
    - Store final result in Supabase `/results`
  - Navigate to result page with result image ID

- ✅ **Page 3: Result & Share** (`/campaign/[slug]/result`)
  - Display final combined image
  - "Download" button (high-res PNG/JPG)
  - Share buttons with auto-generated caption
  - "Use Another Frame" button
  - Track download count (increment `supportersCount`)

### 1.4 Image Processing & Storage
- ✅ Supabase Storage Buckets:
  - `uploads/` - Campaign images (frames/backgrounds)
  - `supporter-photos/` - User uploaded photos
  - `results/` - Final processed images
- ✅ ImageKit.io CDN integration for fast delivery
- ✅ Server-side image processing with Sharp.js
- ✅ Optimized image compression & format conversion

---

## Phase 2: User Dashboard & Management
✅ **Status:** COMPLETED

### 2.1 User Profile & Dashboard
- ✅ Public profile page (`/@[username]`)
  - Display username, bio, profile picture
  - List all public campaigns created by user
  - Show total supporters count across all campaigns
  - Report user button (for inappropriate profiles)
  
- ✅ Private dashboard (`/dashboard`)
  - View all campaigns (public + private)
  - Edit/Delete campaign buttons
  - Switch campaign visibility (public/private)
  - View campaign analytics (supporters, views, shares)

### 2.2 Campaign Management
- ✅ Edit campaign (title, description, caption template)
- ✅ Toggle campaign visibility (public/private)
- ✅ Delete campaign → Remove from Firestore, Supabase, and ImageKit
- ✅ Duplicate campaign feature

### 2.3 Authentication & User Settings
- ✅ Firebase Authentication (Email/Password + Google OAuth)
- ✅ User profile editing (username, bio, avatar)
- ✅ Account deletion (remove all user data + campaigns)
- ✅ Password reset & email verification

---

## Phase 3: Admin Dashboard & Moderation
✅ **Status:** COMPLETED

### 3.1 Admin Dashboard Overview
- ✅ Admin login at `/admin` (role-based access)
- ✅ Metrics dashboard:
  - Total campaigns, users, reports, bans
  - Recent activity feed
  - Pending reports count
- ✅ Quick actions: Ban user, remove campaign, dismiss report

### 3.2 Campaign Moderation
- ✅ View all campaigns (filter by status: active, flagged, removed)
- ✅ Bulk moderation actions (approve, remove, ban creator)
- ✅ Flag inappropriate content (manual review queue)
- ✅ Auto-hide campaigns with 3+ reports

### 3.3 User Moderation
- ✅ View all users (filter by status: active, banned, flagged)
- ✅ Ban user (temporary or permanent)
- ✅ View user's campaign history
- ✅ Ban enforcement → Hide all user campaigns
- ✅ Profile reporting & auto-hide at 10+ reports

### 3.4 Report Management ✅ COMPLETED
- ✅ View all reports (filter by type: campaign, profile)
- ✅ Report details panel showing:
  - Reporter info (or anonymous)
  - Reported content/user details
  - Report reason & timestamp
  - Admin action buttons
- ✅ Admin Actions:
  - **Dismiss Report** → Reset reportsCount, restore to active, mark reports as dismissed
  - **Warn Creator** → Create warning record, track history (no auto-ban)
  - **Remove/Ban** → Temporary removal with 30-day appeal window
- ✅ Atomic transaction-based updates (prevent race conditions)
- ✅ Auto-moderation rules:
  - Campaigns: Hide at 3+ reports
  - Profiles: Hide at 10+ reports

---

## Phase 4: Analytics & Insights
⏸️ **Status:** DEFERRED (Future Enhancement)

### 4.1 Campaign Analytics
- ⏸️ Real-time supporter count
- ⏸️ Geographic distribution of supporters
- ⏸️ Share count by platform (Facebook, Twitter, WhatsApp)
- ⏸️ Peak usage times & trends

### 4.2 User Analytics
- ⏸️ Total reach (supporters across all campaigns)
- ⏸️ Most popular campaign
- ⏸️ Campaign performance comparison

### 4.3 Platform Analytics (Admin Only)
- ⏸️ Daily/Weekly/Monthly active users
- ⏸️ Top creators by supporters
- ⏸️ Most shared campaigns
- ⏸️ Moderation metrics (reports resolved, bans issued)

---

## Phase 5: Future Recommendations
⏸️ **Status:** DEFERRED (Post-Launch)

### 5.1 Advanced Features
- ⏸️ Multi-language support (i18n)
- ⏸️ Campaign templates marketplace
- ⏸️ Collaboration features (co-creators)
- ⏸️ Campaign expiry dates (time-limited campaigns)
- ⏸️ Watermark removal (premium feature)

### 5.2 Monetization
- ⏸️ Premium creator accounts (more storage, priority support)
- ⏸️ Sponsored campaigns (brands can feature campaigns)
- ⏸️ Campaign promotion tools (boost visibility)

### 5.3 Automation & Scaling
- ⏸️ **Auto-deletion cron jobs:**
  - Daily job to check expired `appealDeadline` (30 days)
  - Permanent deletion logic for campaigns + images
  - Permanent ban logic for users + cascade delete
  - Requires: Vercel Cron or Firebase Scheduled Functions

- ⏸️ **Email notifications:**
  - Moderation action updates
  - Appeal deadline reminders (3 days before)
  - Weekly campaign performance digest

- ⏸️ **Content moderation automation:**
  - AI-based image moderation (detect inappropriate content)
  - Auto-flag campaigns based on ML model
  - Human-in-the-loop review workflow

---

## Section 6: Bug Fixes & Improvements
✅ **Status:** COMPLETED

### 6.1 Campaign Deletion Issues ✅ FIXED
- ✅ **Problem:** Campaign deletion leaves orphaned data in Supabase storage
- ✅ **Fix:** Implemented cascade deletion:
  - Delete Firestore document
  - Delete campaign image from Supabase
  - Delete all supporter photos for that campaign
  - Delete all result images for that campaign
  - Remove from ImageKit.io CDN cache

### 6.2 Image Upload Validation ✅ FIXED
- ✅ **Problem:** Users can upload huge files (10MB+) causing slow uploads
- ✅ **Fix:** Client-side validation before upload:
  - Max file size: 2MB
  - Allowed formats: jpg, png, webp
  - Show clear error messages

### 6.3 Mobile Responsiveness ✅ FIXED
- ✅ **Problem:** Adjust page controls are hard to use on mobile
- ✅ **Fix:** Redesigned controls with:
  - Larger touch targets (48px minimum)
  - Mobile-friendly sliders
  - Pinch-to-zoom gesture support
  - Bottom sheet UI for controls

### 6.4 Performance Optimization ✅ COMPLETED
- ✅ Lazy loading for campaign lists
- ✅ Image compression before upload (client-side)
- ✅ CDN caching strategy (ImageKit.io)
- ✅ Database query optimization (indexes on frequently queried fields)
- ✅ Parallel API calls for faster page loads

---

## Section 7: Final Pre-Launch Checklist
✅ **Status:** COMPLETED

### 7.1 Security & Compliance
- ✅ Environment variables secured (no hardcoded secrets)
- ✅ Firebase security rules configured
- ✅ Supabase RLS (Row Level Security) policies enabled
- ✅ CORS configured correctly
- ✅ Rate limiting on API routes
- ✅ Input sanitization to prevent XSS

### 7.2 SEO & Performance
- ✅ Meta tags for all pages (title, description, OG tags)
- ✅ Sitemap.xml generation
- ✅ Robots.txt configured
- ✅ Image alt texts for accessibility
- ✅ Lighthouse score > 90 (Performance, SEO, Accessibility)

### 7.3 Error Handling & Monitoring
- ✅ Graceful error handling (try-catch blocks)
- ✅ User-friendly error messages
- ✅ Logging setup (Vercel Analytics, Sentry)
- ✅ 404 & 500 error pages

### 7.4 Documentation
- ✅ User guide (how to create campaigns)
- ✅ FAQ page
- ✅ Privacy policy & Terms of Service
- ✅ Admin guide (moderation workflows)
- ✅ API documentation (internal use)

---

## Section 8: Testing Checklist
✅ **Status:** COMPLETED

### 8.1 Functional Testing
- ✅ Campaign creation (frame & background)
- ✅ Upload → Adjust → Result flow
- ✅ Image processing quality
- ✅ Download functionality
- ✅ Share buttons work correctly
- ✅ User authentication (sign up, login, logout)
- ✅ Profile editing
- ✅ Campaign deletion & cascade cleanup

### 8.2 Admin Testing
- ✅ Admin login & role verification
- ✅ Report review workflow
- ✅ Ban/Remove actions
- ✅ Dismiss report & restore content
- ✅ Warning system
- ✅ Profile moderation

### 8.3 Edge Cases & Error Scenarios
- ✅ Upload oversized image → Show error
- ✅ Upload non-image file → Show error
- ✅ Network timeout during upload → Retry logic
- ✅ User tries to edit someone else's campaign → Forbidden
- ✅ Non-admin tries to access `/admin` → Redirect
- ✅ Delete campaign with active supporters → Handle gracefully
- ✅ Report same content multiple times → Increment reportsCount

### 8.4 Cross-Browser & Device Testing
- ✅ Chrome, Firefox, Safari, Edge (Desktop)
- ✅ Chrome, Safari (Mobile)
- ✅ Responsive design (320px to 4K)
- ✅ Touch gestures on mobile
- ✅ Keyboard navigation

### 8.5 Performance Testing
- ✅ Page load time < 3 seconds
- ✅ Image optimization verified
- ✅ API response time < 500ms
- ✅ Concurrent user handling (stress test)

---

## 🐛 Bug Report Template

```markdown
**Bug Title:** [Brief description]

**Description:**
[Detailed description of the issue]

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
**Status:** ✅ FULLY COMPLETED (All Sections)  
**Last Updated:** October 09, 2025

### Problem Discovered

The admin report action buttons (**Dismiss Report**, **Warn Creator**, **Remove Campaign**) previously **only updated the report status** but **did NOT perform the actual actions**. This has been fixed.

---

### 9.1: Fix Report Action Buttons ✅ COMPLETED

**Status:** ✅ All core moderation actions fully implemented (October 09, 2025)

#### Auto-Moderation Rules:
- **Campaigns:** Hide from public at 3+ reports (status: `under-review-hidden`)
- **Profiles:** Hide from public at 10+ reports (status: `under-review-hidden`)
- Warning does NOT auto-ban/remove, only sends notifications and tracks history

---

#### 1. **Dismiss Report** Button ✅ COMPLETED
**Implementation:**
- ✅ Resets campaign/profile `reportsCount` to 0
- ✅ Changes status back to `active` (unhides if hidden)
- ✅ Marks all related reports as `dismissed`
- ✅ No notification sent
- ✅ Atomic transaction prevents race conditions

**Completed Tasks:**
- ✅ Updated `/api/admin/reports/[reportId]/route.js` with transaction-based dismiss logic
- ✅ Resets reportsCount to 0 for both campaigns and profiles
- ✅ Changes moderationStatus back to `active`
- ✅ Removes `hiddenAt` timestamp if present
- ✅ Updates all related reports to dismissed status

---

#### 2. **Warn Creator** Button ✅ COMPLETED
**Implementation:**
- ✅ Creates warning record in Firestore `warnings` collection
- ✅ Tracks warning history for admin visibility
- ✅ Does NOT auto-ban or remove content
- ✅ Admin manually decides ban/removal based on warning count

**Warnings Collection Schema:**
```javascript
{
  userId: string,
  targetType: 'campaign' | 'profile',
  targetId: string,  // campaignId or userId
  reportId: string,
  reason: string,
  details: string,
  issuedBy: adminId,
  issuedAt: timestamp,
  acknowledged: boolean,
}
```

**Completed Tasks:**
- ✅ Created `warnings` collection structure in API
- ✅ Updated API route to create warning documents
- ✅ Supports both campaign and profile warnings
- ⏸️ Admin warning history view (deferred to future update)
- ✅ In-app notification delivery

---

#### 3. **Remove Campaign/Ban User** Button ✅ COMPLETED
**Implementation:**
- ✅ **Campaigns:** Sets `moderationStatus` to `removed-temporary`
- ✅ **Profiles:** Sets `accountStatus` to `banned-temporary`
- ✅ Sets 30-day appeal deadline
- ✅ Tracks removal reason and timestamp
- ✅ Hidden from public but NOT deleted (soft delete)

**Completed Tasks:**
- ✅ Updated API route with temporary removal logic
- ✅ Sets `moderationStatus: removed-temporary` for campaigns
- ✅ Sets `accountStatus: banned-temporary` for profiles
- ✅ Sets `removedAt` timestamp
- ✅ Sets `removalReason` from report reason
- ✅ Calculates `appealDeadline` (30 days from removal)
- ✅ Tracks `appealCount` for campaigns
- ✅ Appeal submission UI at `/profile/appeals`
- ✅ Admin appeals review dashboard at `/admin/appeals`
- ✅ In-app notifications for appeal submission, approval, and rejection
- ⏸️ Auto-deletion after 30 days (deferred - requires cron job)
- ⏸️ Appeal deadline reminder notifications (deferred - requires cron job)

---

#### 4. **Admin Validation & UI Updates** ✅ COMPLETED
**Completed Tasks:**
- ✅ Updated `adminValidation.js` with new moderation statuses:
  - `under-review-hidden`
  - `removed-temporary`
  - `removed-permanent`
- ✅ Updated `ReportDetailsPanel` component:
  - Supports both campaign and profile reports
  - Dynamic action button labels (Ban User vs Remove Campaign)
  - Shows appropriate report information based on type
  - Enhanced reason text for profile report reasons
- ✅ Profile report reasons added to panel display

---

### 9.2: Appeal System

**Priority:** CRITICAL  
**Status:** ✅ FULLY IMPLEMENTED  
**Last Updated:** October 24, 2025

**Overview:**
Complete appeal system allowing users to appeal removed campaigns or banned accounts within a 30-day window. Admins can review and approve/reject appeals through a dedicated dashboard.

**User-Facing Features:**
- ✅ Appeal submission page at `/profile/appeals`
- ✅ Fetches eligible removed campaigns and banned accounts
- ✅ 30-day appeal window enforcement
- ✅ One appeal per item limit
- ✅ Minimum 20-character appeal reason requirement
- ✅ Real-time submission confirmation
- ✅ Appeal eligible items API endpoint (`/api/appeals/eligible`)
- ✅ Appeal submission API endpoint (`/api/appeals/submit`)

**Admin Features:**
- ✅ Admin appeals dashboard at `/admin/appeals`
- ✅ Filter appeals by status (pending, approved, rejected)
- ✅ Filter by type (campaign, account)
- ✅ Comprehensive appeal details display
- ✅ Approve/reject actions with confirmation modal
- ✅ Admin notes field for documentation
- ✅ Type "CONFIRM" requirement to prevent accidents
- ✅ Appeals listing API (`/api/admin/appeals`)
- ✅ Appeal action API (`/api/admin/appeals/[appealId]`)

**Notifications:**
- ✅ Appeal submitted confirmation
- ✅ Appeal approved notification (restores content/account)
- ✅ Appeal rejected notification (permanent removal/ban)
- ✅ All notifications use camelCase type names

**Database:**
- ✅ Appeals collection with full CRUD operations
- ✅ Appeal status tracking (pending, approved, rejected)
- ✅ appealCount increments on campaigns
- ✅ Integration with moderation workflow

**Admin Navigation:**
- ✅ Appeals link added to AdminSidebar

**Outstanding Items:**
- ⏸️ Appeal deadline reminder notifications (requires cron job)
- ⏸️ Auto-deletion after 30 days (requires cron job)

---

### 9.3: In-App Notification System

**Priority:** HIGH  
**Status:** ✅ FULLY IMPLEMENTED  
**Last Updated:** October 13, 2025

**System Architecture:**
- ✅ Firestore-based real-time notifications (no browser permissions needed)
- ✅ NotificationProvider with real-time listeners
- ✅ NotificationBell component with unread count
- ✅ NotificationToast for instant alerts
- ✅ Notification inbox at `/profile/notifications`
- ✅ Server-side notification sender utility
- ✅ All admin actions trigger in-app notifications

**Key Benefits:**
- 🎯 No browser permission requests required
- 🎯 Instant delivery via Firestore real-time snapshots
- 🎯 Works on all devices without setup
- 🎯 Simpler architecture with fewer dependencies
- 🎯 Better user experience (no permission popups)

---

#### A. Notification Data Structure ✅ IMPLEMENTED
Notifications stored in Firestore: `users/{userId}/notifications/{notificationId}`

```javascript
{
  id: string,                    // Auto-generated
  type: "warning" | "campaign_removed" | "campaign_under_review" | 
        "profile_under_review" | "account_banned" | "appeal_deadline",
  title: string,                 // Notification title
  message: string,               // Notification message
  actionUrl: string,             // Deep link to take action
  actionLabel: string,           // "Appeal Removal", "View Campaign", etc.
  
  // Optional metadata
  campaignId?: string,
  reportId?: string,
  appealDeadline?: timestamp,
  
  // Status
  read: boolean,
  createdAt: timestamp,
}
```

---

#### B. Core Components ✅ IMPLEMENTED

**1. useNotifications Hook (`/src/hooks/useNotifications.js`):**
- Real-time Firestore listener for user notifications
- Provides: notifications list, unread count, latest notification
- Functions: markAsRead(), deleteNotification()
- Auto-updates on any notification change

**2. NotificationProvider (`/src/components/notifications/NotificationProvider.js`):**
- Wraps entire app in layout
- Manages global notification state
- Provides notifications to all child components
- Handles real-time listener lifecycle

**3. NotificationBell (`/src/components/notifications/NotificationBell.js`):**
- Shows unread count badge
- Links to `/profile/notifications` inbox
- Real-time updates when new notifications arrive

**4. NotificationToast (`/src/components/notifications/NotificationToast.js`):**
- Auto-displays latest unread notification
- Appears in top-right corner
- Includes action button and close button
- Auto-marks as read when action clicked

---

#### C. Server-Side Utilities ✅ IMPLEMENTED

**1. sendInAppNotification (`/src/utils/notifications/sendInAppNotification.js`):**
```javascript
await sendInAppNotification(userId, {
  type: 'campaign_removed',
  title: 'Campaign Removed',
  message: 'Your campaign was removed...',
  actionUrl: '/campaign/example',
  actionLabel: 'Appeal Removal',
  metadata: { campaignId, appealDeadline }
});
```

**2. Notification Templates (`/src/utils/notifications/notificationTemplates.js`):**
- Campaign Under Review (3+ reports)
- Campaign Removed (with appeal link)
- Warning Issued
- Profile Under Review (10+ reports)
- Account Banned (with appeal link)
- Campaign/Profile Restored
- Appeal Deadline Reminders

---

#### D. Integration with Moderation ✅ IMPLEMENTED

**Admin Actions Trigger Notifications:**
- ✅ Dismiss reports → "Campaign/Profile Restored"
- ✅ Issue warning → "Warning Issued"
- ✅ Remove/Ban → "Content Removed/Account Banned"

**Auto-Hide Triggers:**
- ✅ Campaign gets 3 reports → "Campaign Under Review"
- ✅ Profile gets 10 reports → "Profile Under Review"

**Notification Triggers:**
- ✅ Campaign removed temporarily → Notify with appeal link
- ✅ Warning issued → Notify creator
- ✅ Account banned → Notify with appeal link
- ✅ Admin dismisses reports → Notify "Restored"
- ⏸️ Appeal deadline reminder → 3 days before (requires cron job)

---

### 9.3: Profile/User Reporting System

**Priority:** 🔥 CRITICAL  
**Status:** ✅ COMPLETED (October 9, 2025)

**Implementation Summary:**
- ✅ Backend API for user/profile reports with auto-hide at 10+ reports
- ✅ ReportUserModal component with profile-specific report reasons
- ✅ "Report User" button integrated into public profile pages
- ✅ Admin reports dashboard updated with type filtering (Campaign/Profile/All)
- ✅ ReportsTable displays both campaign and profile report data

**Auto-Moderation Rules for Profiles:**
- **10+ reports** → Profile auto-hides from public (status: `under-review-hidden`)
- Admin can dismiss (restore) or ban account
- Ban = Temporary removal with 30-day appeal window
- Permanent ban = Delete all user data (profile + campaigns)

**Use Cases:**
- Inappropriate profile pictures
- Offensive usernames
- Spam in bio/description
- Impersonation

---

#### A. Backend - User Report API ✅ COMPLETED
- ✅ Created `/api/reports/user/route.js`:
  ```javascript
  POST /api/reports/user
  {
    reportedUserId: string,
    reportedUsername: string,
    reportedBy: string | 'anonymous',
    reason: 'inappropriate_avatar' | 'offensive_username' | 'spam_bio' | 'impersonation' | 'other',
    details?: string,
  }
  ```

- ✅ **Implementation:**
  - Validate required fields (reportedUserId, reason)
  - Create report document in Firestore `reports` collection
  - Increment `reportsCount` on user document (atomic transaction)
  - **Auto-hide logic:** If `reportsCount >= 10`, set `moderationStatus: 'under-review-hidden'`
  - Store `hiddenAt` timestamp when auto-hidden
  - Return success response with report ID

---

#### B. Frontend - Report User Modal ✅ COMPLETED
- ✅ Created `ReportUserModal` component:
  - Profile-specific report reasons dropdown:
    - Inappropriate Profile Picture
    - Offensive Username
    - Spam in Bio/Description
    - Impersonation
    - Other (with details textarea)
  - Submit button → POST to `/api/reports/user`
  - Success/Error handling with toast notifications
  - Form validation

---

#### C. Admin Dashboard - Profile Reports ✅ COMPLETED
- ✅ Updated `/admin/reports` page:
  - Added "Report Type" filter: All / Campaign / Profile
  - Display profile reports with:
    - Reported user's username
    - Report reason (human-readable text)
    - Reporter info (or "Anonymous")
    - Timestamp
  - "View Details" opens `ReportDetailsPanel`

---

#### D. Admin Actions - Profile Moderation ✅ COMPLETED
- ✅ Updated `ReportDetailsPanel` component:
  - Detect report type (campaign vs profile)
  - Show appropriate action buttons:
    - **For Campaign Reports:** "Dismiss", "Warn Creator", "Remove Campaign"
    - **For Profile Reports:** "Dismiss", "Warn User", "Ban User"
  - Dynamic labels and behavior based on report type

- ✅ Admin Actions for Profile Reports:
  1. **Dismiss Report:**
     - Reset `reportsCount` to 0
     - Set `moderationStatus: 'active'` (unhide profile)
     - Remove `hiddenAt` timestamp
     - Mark all reports as `dismissed`

  2. **Warn User:**
     - Create warning record in `warnings` collection
     - Track warning history (visible to admin in user details)
     - Does NOT auto-ban user
     - Admin decides ban based on warning count

  3. **Ban User:**
     - Set `accountStatus: 'banned-temporary'`
     - Set `bannedAt` timestamp
     - Set `banReason` from report reason
     - Calculate `appealDeadline` (30 days from ban)
     - Hide all user's campaigns from public
     - Send in-app notification with appeal link
     - User can appeal within 30 days
     - After 30 days with no appeal → Permanent ban (requires cron job - see Phase 5)

---

#### E. User Experience - Profile Moderation ✅ COMPLETED
- ✅ Auto-hide profiles at 10+ reports:
  - Profile page shows "Profile under review" message to public
  - Creator can still see their own profile
  - Admin can view full profile details

- ✅ Ban enforcement:
  - Banned users cannot create new campaigns
  - Banned users cannot edit existing campaigns
  - Banned users see "Account Banned" message on login
  - Display appeal deadline and "Submit Appeal" button (deferred - appeal UI pending)

- ✅ Cascade effects of profile moderation:
  - Banned user → All campaigns hidden from public
  - Permanent ban → Delete all user data (profile + campaigns + images)

---

#### F. Report Reason Mapping ✅ COMPLETED
- ✅ Human-readable reason text:
  ```javascript
  const profileReportReasons = {
    'inappropriate_avatar': 'Inappropriate Profile Picture',
    'offensive_username': 'Offensive Username',
    'spam_bio': 'Spam in Bio/Description',
    'impersonation': 'Impersonation',
    'other': 'Other'
  };
  ```

- ✅ Display in admin panel and notifications

---

### 9.4: Moderation Status Fields Summary

**Campaign Moderation Statuses:**
- `active` - Publicly visible, no issues
- `under-review` - Reported but still visible (1-2 reports)
- `under-review-hidden` - Auto-hidden due to 3+ reports
- `removed-temporary` - Admin removed, 30-day appeal window
- `removed-permanent` - Permanently deleted (after appeal rejection or expiry)

**Profile Moderation Statuses:**
- `active` - Normal profile, publicly visible
- `under-review-hidden` - Auto-hidden due to 10+ reports
- (No `under-review` status for profiles - they go straight to hidden at 10 reports)

**Account Status (for users):**
- `active` - Normal account
- `banned-temporary` - Banned with 30-day appeal window
- `banned-permanent` - Permanently banned, all data deleted

---

## 🔧 Section 11: Settings & Notifications Navigation Improvement

**Priority:** HIGH  
**Status:** 🚀 READY TO IMPLEMENT  
**Last Updated:** October 10, 2025

### Problem Analysis

**Current Navigation Issues:**

1. **Settings Structure:**
   - `/settings` page → Needs to be a comprehensive settings hub
   - `/profile/edit` page → Profile information (avatar, bio, username, banner) - **KEEP AS-IS**
   - Need dedicated notification preferences page

2. **Navigation Inconsistencies:**
   - ✅ Bell icon in header → `/profile/notifications` (correct)
   - ✅ "Notifications" in sidebar menu → `/profile/notifications` (correct)
   - ⚠️ "Settings" button on `/profile/notifications` page → Should go to comprehensive settings
   - ⚠️ "Settings" in sidebar menu → Should go to comprehensive settings hub

---

### Phased Solution: Incremental Settings Implementation

**Goal:** Build unified settings system incrementally, starting with notification settings.

**Design Decision:**
- ✅ Keep `/profile/edit` unchanged for profile information
- ✅ Build settings under `/settings` hierarchy
- ✅ Start with notifications, add other settings later

---

### 11.1: Phase 1 - Notification Settings (CURRENT PRIORITY) 🚀

**New Structure (Phase 1):**

```
/settings (Main Hub with Sidebar Navigation - starts simple, expandable)
└── /settings/notifications    → Notification Preferences (NEW - first implementation)

FUTURE PHASES (to be added later):
├── /settings/account          → Account & Security (FUTURE)
├── /settings/privacy          → Privacy & Data (FUTURE)
└── /settings/preferences      → General Preferences (FUTURE)

UNCHANGED:
/profile/edit                  → Profile Information (UNCHANGED - stays as-is)
```

**Benefits:**
- Incremental implementation (low risk)
- Clear path for future expansion
- `/profile/edit` remains stable
- Logical settings organization

---

### 11.2: Phase 1 Implementation - Notification Settings Page

#### A. `/settings` - Main Settings Hub (NEW) 🚀

**Purpose:** Central hub for all user settings (starts with notifications, expandable)

**Layout:**
- Desktop: Sidebar navigation (left) + Content area (right)
- Mobile: Tabs at top (horizontal scroll)

**Phase 1 Sidebar Items (Starting Point):**
1. 🔔 Notifications (Active/Available)
2. 🔒 Account & Security (Grayed out - "Coming Soon")
3. 🔐 Privacy & Data (Grayed out - "Coming Soon")

**Default View:** Opens `/settings/notifications` automatically (only active page)

**Why Sidebar Now?**
- Prepare infrastructure for future settings pages
- Better UX than switching layouts later
- Shows users what's coming next

---

#### B. `/settings/notifications` - Notification Preferences (NEW) 🚀

**Purpose:** Comprehensive notification management (replaces current `/settings` page)

**Content:**

**Section 1: In-App Notifications (from current `/settings`)**
- ✅ Master notification toggle
- ✅ Browser permission status display
- ✅ Active devices list
- ✅ Device management (remove devices)
- ✅ Notification preferences (type-specific toggles)

**Section 2: Notification Type Preferences (NEW)**
- 🆕 Per-notification-type toggles:
  - ✅ Campaign Warnings (when campaign flagged)
  - ✅ Campaign Removals (when campaign removed)
  - ✅ Campaign Restorations (when campaign restored)
  - ✅ Profile Reports (when someone reports your profile)
  - ✅ Admin Actions (warnings, bans, etc.)
  - ⏸️ Marketing Emails (Future)

**Section 3: Email Notifications (FUTURE)**
- ⏸️ Email notification preferences
- ⏸️ Digest mode (daily/weekly summary)
- ⏸️ Unsubscribe from specific types

**Features:**
- Toggle all notifications on/off with one click
- Individual granular control per notification type
- Visual indication of permission status
- Device-specific management
- Clear explanations for each notification type

---

### 11.3: Navigation Updates (Phase 1)

#### A. Update Mobile Sidebar (MobileMenu.js) 🚀

**Current Links:**
```javascript
- Profile → /profile
- Notifications → /profile/notifications
- Settings → /settings (notification preferences)
```

**Updated Links (Phase 1):**
```javascript
- Profile → /profile
- Notifications → /profile/notifications
- Settings → /settings (opens /settings/notifications by default)
```

**Changes:**
- Settings link remains `/settings` but now opens the settings hub
- Default view shows notification settings (only active page in Phase 1)

---

#### B. Update Notifications Page Header 🚀

**Current:**
```javascript
// Settings button on /profile/notifications page
<Link href="/settings">Settings</Link>
```

**Updated:**
```javascript
// Settings button on /profile/notifications page
<Link href="/settings/notifications">Notification Settings</Link>
```

**Changes:**
- More specific link text for clarity
- Links to `/settings/notifications` instead of `/settings`

---

#### C. Keep Profile Edit Button UNCHANGED ✅

**Current (NO CHANGES):**
```javascript
// On /profile page - KEEP THIS AS-IS
<button onClick={() => router.push('/profile/edit')}>
  Edit Profile
</button>
```

**Decision:**
- `/profile/edit` remains independent for profile information
- Will NOT be moved to `/settings` structure
- Users can access profile editing from profile page as before

---

### 11.4: Migration & Backward Compatibility (Phase 1)

#### A. Route Redirects 🚀

**Preserve old URL with redirect:**
```javascript
// In middleware.js or app router
/settings → /settings/notifications (redirect to default settings page)
```

**Benefits:**
- No broken bookmarks from existing users
- Smooth transition to new structure
- `/profile/edit` unchanged (no redirect needed)

---

#### B. Data Migration ⏸️

**No data migration needed** - Only UI/routing changes:
- Current `/settings` page content moves to `/settings/notifications`
- New settings layout wrapper added
- All existing APIs remain unchanged
- Firestore schema unchanged (notification preferences will be added later)

---

### 11.5: Implementation Plan (Phase 1 Only)

#### Phase 1: Notification Settings (CURRENT - Week 1) 🚀

**Step 1: Create Settings Layout**
- [ ] Create `/app/(chrome)/settings/layout.js` with sidebar navigation
- [ ] Create `SettingsSidebar.js` component (desktop sidebar, mobile tabs)
- [ ] Add navigation items: Notifications (active), Account (grayed), Privacy (grayed)
- [ ] Implement active state highlighting
- [ ] Responsive design (desktop sidebar, mobile horizontal tabs)

**Step 2: Create Notification Settings Page**
- [ ] Create `/app/(chrome)/settings/notifications/page.js`
- [ ] Migrate notification preferences from current `/settings`
- [ ] Add Section 1: In-App Notifications (master toggle, notification preferences)
- [ ] Add Section 2: Notification Type Preferences (per-type toggles)
- [ ] Add API route for saving notification preferences

**Step 3: Update Navigation**
- [ ] Update MobileMenu.js: Keep `/settings` link (now opens hub)
- [ ] Update `/profile/notifications` page: Change Settings button to link to `/settings/notifications`
- [ ] Add redirect: `/settings` → `/settings/notifications`

**Step 4: Database Schema (Optional)**
- [ ] Add `notificationPreferences` to user profile (optional for Phase 1)
  ```javascript
  notificationPreferences: {
    warnings: boolean,        // Default: true
    removals: boolean,        // Default: true
    restorations: boolean,    // Default: true
    profileReports: boolean,  // Default: true
    adminActions: boolean,    // Default: true
  }
  ```

**Step 5: Testing**
- [ ] Test settings sidebar navigation (desktop & mobile)
- [ ] Test notification preferences save/load
- [ ] Test notification preferences still work
- [ ] Test redirect from `/settings` to `/settings/notifications`
- [ ] Cross-browser testing

**Deliverables:**
- ✅ Settings hub with sidebar/tabs navigation
- ✅ Comprehensive notification settings page
- ✅ Per-notification-type preferences
- ✅ Updated navigation links
- ✅ Mobile responsive design

**Estimated Time:** 1 week

---

#### Future Phases (To Be Planned Later) ⏸️

**Phase 2: Account & Security Settings (FUTURE)**
- Create `/settings/account` page
- Password change functionality
- Email management
- Session management
- Account deletion

**Phase 3: Privacy & Data Settings (FUTURE)**
- Create `/settings/privacy` page
- Profile visibility controls
- Data export (GDPR)
- Privacy preferences

**Phase 4: General Preferences (FUTURE)**
- Create `/settings/preferences` page
- Language, theme, accessibility
- Dashboard layout preferences

**Note:** `/profile/edit` remains unchanged throughout all phases

---

### 11.6: UI/UX Design Guidelines (Phase 1)

#### A. Settings Sidebar Navigation 🚀

**Desktop (≥768px):**
```
┌─────────────────────────────────────────┐
│ Settings                                 │
├──────────────┬──────────────────────────┤
│              │                          │
│ 🔔 Notif...   │  [Notification Settings │
│              │   Content Area]         │
│ 🔒 Account    │                          │
│   (grayed)   │  In-app notifications,   │
│              │  Preferences, Devices   │
│ 🔐 Privacy    │                          │
│   (grayed)   │  [Save Button]          │
└──────────────┴──────────────────────────┘
```

**Mobile (<768px):**
```
┌─────────────────────────────────────────┐
│ Settings                                 │
├─────────────────────────────────────────┤
│ [Notif][Account🔒][Privacy🔒]           │ (Horizontal scroll tabs)
├─────────────────────────────────────────┤
│                                         │
│  [Notification Settings Content]        │
│                                         │
│  In-app notifications, preferences      │
│                                         │
│  [Save Button]                          │
└─────────────────────────────────────────┘
```

**Note:** Account and Privacy tabs shown as grayed/disabled with lock icon

---

#### B. Design Consistency 🚀

**Colors:**
- Primary: Emerald (#059669)
- Secondary: Yellow (#FCD34D)
- Danger: Red (#DC2626)
- Success: Green (#10B981)

**Components:**
- Use existing button styles (btn-base, btn-primary, etc.)
- Maintain yellow header sections
- Keep emerald accent colors
- Use card-based layouts with shadows

**Spacing:**
- Consistent padding: px-4, py-3
- Section gaps: mb-6, gap-6
- Form field spacing: space-y-4

---

### 11.7: API Requirements (Phase 1)

#### Notification Preferences API (NEW) 🚀

```javascript
// GET /api/notifications/preferences
// Returns user's notification preferences

// PATCH /api/notifications/preferences
// Saves notification preferences
{
  warnings: boolean,
  removals: boolean,
  restorations: boolean,
  profileReports: boolean,
  adminActions: boolean,
}
```

**Note:** Notification preference APIs already exist at `/api/notifications/[notificationId]`.

---

### 11.8: Database Schema (Phase 1)

#### User Profile Updates (Optional) 🚀

**Add to `users` collection (if implementing preferences storage):**
```javascript
{
  // ... existing fields
  
  // Notification Preferences (NEW - Optional for Phase 1)
  notificationPreferences: {
    warnings: boolean,              // Default: true
    removals: boolean,              // Default: true
    restorations: boolean,          // Default: true
    profileReports: boolean,        // Default: true
    adminActions: boolean,          // Default: true
  }
}
```

**Note:** Can start with UI-only (localStorage) and add DB persistence later.

---

### 11.9: Testing Checklist (Phase 1)

#### Functional Testing 🚀

- [ ] Settings sidebar navigation works (desktop)
- [ ] Mobile tabs navigation works
- [ ] Notification settings page loads correctly
- [ ] Notification preferences still work (migrated from `/settings`)
- [ ] Notification preference toggles work
- [ ] Preferences save/load correctly
- [ ] Redirect from `/settings` to `/settings/notifications` works
- [ ] Updated navigation links work (MobileMenu, notifications page)

#### UX Testing 🚀

- [ ] Sidebar navigation intuitive
- [ ] Mobile tabs easy to use
- [ ] Active tab highlighted correctly
- [ ] Grayed-out future tabs look disabled
- [ ] Success messages shown
- [ ] Loading states smooth
- [ ] Responsive on all screen sizes

---

### 11.10: Summary & Next Steps

**Phase 1 Goal:**
- ✅ Create unified `/settings` hub (with sidebar/tabs)
- ✅ Implement notification settings page under `/settings/notifications`
- ✅ Migrate notification preferences
- ✅ Add per-notification-type preferences
- ✅ Update navigation links
- ✅ Keep `/profile/edit` unchanged

**Current Issues:**
- ❌ `/settings` needs to be more comprehensive
- ❌ Notification preferences need better organization
- ❌ No unified settings structure

**After Phase 1:**
- ✅ Unified `/settings` hub with expandable structure
- ✅ Comprehensive notification settings
- ✅ Per-notification-type control
- ✅ Mobile-optimized experience
- ✅ Clear path for future settings pages

**Future Phases:**
- Phase 2: Account & Security (password, email, sessions)
- Phase 3: Privacy & Data (visibility, GDPR export)
- Phase 4: General Preferences (theme, language, etc.)

**Estimated Timeline (Phase 1):** 1 week

**Note:** `/profile/edit` remains independent for profile information throughout all phases.

---

**End of Section 11: Settings & Navigation Architecture Restructure**

---

**End of TASKS.md**
