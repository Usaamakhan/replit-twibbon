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
10. [Section 10: FCM UI Integration - Implementation Plan](#section-10-fcm-ui-integration---implementation-plan)
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
✅ **Status:** COMPLETED (Core Features) | ⏸️ PENDING (Appeals & Advanced Features)

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
- ⏸️ In-app notification delivery (deferred - see Section 9.2)

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
- ⏸️ Appeal submission UI (deferred to future update)
- ⏸️ Auto-deletion after 30 days (deferred - requires cron job)
- ⏸️ In-app notification with appeal link (deferred - see Section 9.2)

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

### 9.2: FCM Push Notification System

**Priority:** HIGH  
**Status:** ✅ FULLY COMPLETED  
**Last Updated:** October 09, 2025

**Backend Infrastructure (✅ COMPLETED):**
- ✅ Service worker route (`/firebase-messaging-sw/route.js`)
- ✅ Token management APIs (`/api/notifications/register-token`, `/api/notifications/remove-token`)
- ✅ Send notification API (`/api/notifications/send/route.js`)
- ✅ FCM hook (`useFCM()`)
- ✅ Notification templates (`notificationTemplates.js`)
- ✅ All admin actions trigger notifications (dismiss, warn, remove)
- ✅ NotificationPermissionModal component

**UI Integration (✅ COMPLETED):**
- ✅ Notification permission prompt strategy (after campaign creation + dashboard banner)
- ✅ User notification preferences page (`/profile/notifications`)
- ✅ Foreground notification toast/banner component (NotificationToast, NotificationBanner)
- ✅ NotificationProvider integrated in app layout
- ✅ Toast animations with Tailwind CSS
- ✅ Custom toast system replacing browser notifications

**Implementation: Firebase Cloud Messaging (FCM) for Web Push Notifications**

---

#### A. FCM Setup & Token Management ✅ COMPLETED
- ✅ Set up Firebase Cloud Messaging in Firebase Console (requires VAPID key from Firebase Console)
- ✅ Configure FCM for web push notifications (VAPID keys)
- ✅ Add FCM config to Firebase initialization
- ✅ Store FCM device tokens in Firestore:
  ```javascript
  // Collection: users/{userId}/tokens/{tokenId}
  {
    token: string,              // FCM device token
    device: 'web' | 'android' | 'ios',
    browser?: string,           // Chrome, Firefox, Safari, etc.
    createdAt: timestamp,
    lastUsed: timestamp,
  }
  ```

---

#### B. API Routes for Token Management ✅ COMPLETED
- ✅ Created `/api/notifications/register-token/route.js`:
  - POST: Save user's FCM device token to Firestore
  - Support multiple devices per user
  - Update `lastUsed` timestamp on token refresh
  - Validate token format before saving
  
- ✅ Created `/api/notifications/remove-token/route.js`:
  - DELETE: Remove FCM token on logout
  - Clean up expired/invalid tokens

- ✅ Created `/api/notifications/send/route.js` (server-side):
  - Use Firebase Admin SDK to send FCM messages
  - Support notification payload + data payload
  - Handle multi-device delivery (send to all user's tokens)
  - Error handling for invalid/expired tokens
  - Auto-cleanup of failed tokens

---

#### C. Service Worker for Web Push ✅ COMPLETED
- ✅ Created `/public/firebase-messaging-sw.js`:
  - Handle background notifications when app is closed
  - Show notification UI with title, body, icon
  - Deep link to action URLs on notification click
  - Handle notification actions (View/Dismiss buttons)
  - Focus existing tab or open new tab on click

---

#### D. Frontend FCM Integration ✅ COMPLETED
- ✅ Created `useFCM()` hook for token management:
  - Request notification permission on user action (not automatic)
  - Get FCM token from Firebase SDK
  - Save token to Firestore via API
  - Refresh token on expiry
  - Delete token on logout
  - Handle foreground notifications
  
- ✅ Created `NotificationPermissionModal` component:
  - Explain why notifications are helpful
  - Request permission button
  - Show "Don't ask again" option
  - Store user preference in localStorage
  - Modern UI with Tailwind CSS

- ⏸️ Create notification preferences page (`/profile/settings`):
  - Toggle to enable/disable push notifications
  - Option to re-request permission if denied
  - List of active devices with notification access
  - Remove device tokens individually
  - **Deferred to future update** (modal covers core functionality)

---

#### E. Notification Utility Functions ✅ COMPLETED
- ✅ Created `/src/utils/notifications/sendFCMNotification.js`:
  - Client-side function calling send API
  - Send to single user (all their devices)
  - Send batch notifications (multiple users)
  - Include notification title, body, icon, click action URL
  
- ✅ Created `/src/utils/notifications/notificationTemplates.js`:
  - Template: Campaign Under Review (3+ reports)
  - Template: Campaign Removed (with appeal link)
  - Template: Warning Issued
  - Template: Profile Under Review (10+ reports)
  - Template: Account Banned (with appeal link)
  - Template: Campaign/Profile Restored
  - Template: Appeal Deadline Reminder (3 days before)
  - Template: Appeal Approved/Rejected

---

#### F. Integration with Moderation Actions ✅ COMPLETED
- ✅ Updated `/api/admin/reports/[reportId]/route.js`:
  - Send FCM notification on "Dismiss" → "Campaign/Profile Restored"
  - Send FCM notification on "Warn" → "Warning Issued"
  - Send FCM notification on "Remove/Ban" → "Content Removed/Account Banned"
  - Integrated with existing transaction-based moderation logic

- ✅ Updated auto-hide logic in report APIs:
  - Send FCM notification when campaign gets 3 reports → "Campaign Under Review"
  - Send FCM notification when profile gets 10 reports → "Profile Under Review"
  - Fixed campaign auto-hide status to `under-review-hidden` (was incorrectly `under-review`)
  - Added `hiddenAt` timestamp for campaigns

---

#### G. Notification Triggers Summary
- ✅ Campaign removed temporarily → Notify with appeal link (30-day deadline)
- ✅ Warning issued → Notify creator (track in warning history)
- ✅ Account banned → Notify with appeal link (30-day deadline)
- ✅ Admin dismisses reports → Notify creator "Campaign/Profile Restored"
- ✅ Campaign gets 3 reports → Auto-hide + Notify creator "Campaign Under Review"
- ✅ Profile gets 10 reports → Auto-hide + Notify user "Profile Under Review"
- ⏸️ Appeal deadline reminder → 3 days before expiry (requires cron job - see Phase 5 in Future Recommendations)

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
     - Send FCM notification with appeal link
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

## 🎯 Section 10: FCM UI Integration - Implementation Plan

**Priority:** HIGH  
**Status:** ⏸️ PENDING IMPLEMENTATION  
**Estimated Effort:** 2-3 days  
**Last Updated:** October 09, 2025

---

### 📋 Overview

FCM backend infrastructure is 100% complete. This section focuses on **UI/UX integration** with industry best practices for web push notifications.

**What's Already Done (Backend):**
- ✅ Service worker & token management
- ✅ All notification sending APIs
- ✅ `useFCM()` hook with permission handling
- ✅ NotificationPermissionModal component
- ✅ All admin actions trigger FCM notifications

**What Needs Implementation (Frontend UI):**
1. Permission prompt strategy (when/where to ask)
2. Foreground notification toast component
3. Notification preferences page
4. Auto-hide notifications integration
5. Testing & polish

---

### 🎨 Implementation Tasks

#### **Task 1: Permission Prompt Strategy** ⏸️ PENDING

**Goal:** Ask for notification permission at optimal moments without being intrusive.

**Industry Best Practices:**
1. **Never auto-prompt on page load** - Users will deny it
2. **Progressive disclosure** - Show value before asking
3. **Contextual timing** - Ask after user engagement
4. **Respect user choice** - Honor "Don't ask again"

**Recommended Implementation:**

**A. After First Campaign Creation** ✅ **PRIMARY TRIGGER**
```javascript
// Location: src/app/(chrome)/create/frame/page.js & create/background/page.js
// Timing: After successful campaign creation, before redirect

const handlePublish = async () => {
  // ... existing upload & creation logic ...
  
  if (result.success) {
    // Check if user has already granted/denied permission
    const hasDeclined = localStorage.getItem('fcm-permission-declined');
    const currentPermission = Notification.permission;
    
    if (currentPermission === 'default' && !hasDeclined) {
      // Show permission modal
      setShowNotificationPrompt(true);
    } else {
      // Navigate to campaign page immediately
      router.push(`/campaign/${slug}`);
    }
  }
};

// Modal Integration:
{showNotificationPrompt && (
  <NotificationPermissionModal 
    onClose={() => {
      setShowNotificationPrompt(false);
      router.push(`/campaign/${slug}`);
    }}
    context="campaign_created"
  />
)}
```

**Why this works:**
- User just completed meaningful action (created campaign)
- Clear value proposition: "Get notified if your campaign gets reported"
- Not blocking critical path (can dismiss and continue)

---

**B. Persistent Banner on Dashboard** ✅ **SECONDARY TRIGGER**
```javascript
// Location: src/app/(chrome)/dashboard/page.js
// Show banner at top of dashboard if permission not granted

import NotificationBanner from '@/components/notifications/NotificationBanner';

export default function DashboardPage() {
  const { notificationPermission } = useFCM();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  useEffect(() => {
    const dismissed = localStorage.getItem('notification-banner-dismissed');
    setBannerDismissed(!!dismissed);
  }, []);
  
  const handleDismissBanner = () => {
    localStorage.setItem('notification-banner-dismissed', 'true');
    setBannerDismissed(true);
  };
  
  return (
    <div>
      {notificationPermission === 'default' && !bannerDismissed && (
        <NotificationBanner onDismiss={handleDismissBanner} />
      )}
      
      {/* Rest of dashboard */}
    </div>
  );
}
```

**NotificationBanner Component (NEW):**
```javascript
// Location: src/components/notifications/NotificationBanner.js
"use client";

import { useState } from 'react';
import { useFCM } from '@/hooks/useFCM';

export default function NotificationBanner({ onDismiss }) {
  const { requestPermission } = useFCM();
  const [loading, setLoading] = useState(false);
  
  const handleEnable = async () => {
    setLoading(true);
    await requestPermission();
    setLoading(false);
    onDismiss();
  };
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-blue-100 dark:bg-blue-800">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
            <p className="ml-3 font-medium text-blue-900 dark:text-blue-100 text-sm">
              Get notified when your campaigns are reviewed or removed
            </p>
          </div>
          <div className="mt-2 sm:mt-0 sm:ml-3 flex-shrink-0 flex gap-2">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </button>
            <button
              onClick={onDismiss}
              className="inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-md text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

**C. Settings Page Link** ✅ **ALWAYS AVAILABLE**
```javascript
// Location: User profile dropdown / settings menu
// Always show link to notification settings (no prompting)

<Link href="/profile/notifications" className="...">
  <BellIcon /> Notification Settings
</Link>
```

---

#### **Task 2: Foreground Notification Toast** ⏸️ PENDING

**Goal:** Show in-app toast when user receives notification while app is open.

**Current Issue:**
- `useFCM()` hook uses browser's basic `new Notification()` API (lines 111-116)
- Not customizable, doesn't match app design
- No click handling for in-app navigation

**Recommended Solution: Custom Toast Component**

**A. Create Toast Component:**
```javascript
// Location: src/components/notifications/NotificationToast.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationToast({ notification, onClose }) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };
  
  const handleClick = () => {
    if (notification.data?.actionUrl) {
      router.push(notification.data.actionUrl);
      handleClose();
    }
  };
  
  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto overflow-hidden transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {notification.notification?.image ? (
              <img 
                src={notification.notification.image} 
                alt="" 
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {notification.notification?.title}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {notification.notification?.body}
            </p>
            {notification.data?.actionUrl && (
              <button
                onClick={handleClick}
                className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                {notification.data.actionLabel || 'View Details'} →
              </button>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Progress bar for auto-dismiss */}
      <div className="h-1 bg-blue-100 dark:bg-blue-900">
        <div className="h-full bg-blue-600 dark:bg-blue-400 animate-toast-progress" />
      </div>
    </div>
  );
}
```

**B. Add CSS Animation (tailwind.config.js):**
```javascript
module.exports = {
  theme: {
    extend: {
      animation: {
        'toast-progress': 'toast-progress 5s linear forwards',
      },
      keyframes: {
        'toast-progress': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
    },
  },
};
```

**C. Update useFCM Hook:**
```javascript
// Location: src/hooks/useFCM.js
// Replace lines 107-117 with callback system

export function useFCM() {
  // ... existing state ...
  const [foregroundNotification, setForegroundNotification] = useState(null);

  useEffect(() => {
    if (!messaging || !fcmToken) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground notification received:', payload);
      
      // Instead of browser notification, trigger toast
      setForegroundNotification(payload);
    });

    return () => unsubscribe();
  }, [fcmToken]);

  const clearNotification = () => setForegroundNotification(null);

  return {
    notificationPermission,
    fcmToken,
    isSupported,
    loading,
    requestPermission,
    removeToken,
    foregroundNotification,  // NEW: Expose notification data
    clearNotification,       // NEW: Clear notification
  };
}
```

**D. Integrate Toast in Layout:**
```javascript
// Location: src/app/layout.js or src/components/NotificationProvider.js
"use client";

import { useFCM } from '@/hooks/useFCM';
import NotificationToast from '@/components/notifications/NotificationToast';

export default function NotificationProvider({ children }) {
  const { foregroundNotification, clearNotification } = useFCM();
  
  return (
    <>
      {children}
      
      {foregroundNotification && (
        <NotificationToast 
          notification={foregroundNotification}
          onClose={clearNotification}
        />
      )}
    </>
  );
}
```

---

#### **Task 3: Notification Preferences Page** ⏸️ PENDING

**Goal:** Dedicated settings page for managing notifications.

**Page Location:** `/profile/notifications` or `/settings/notifications`

**Features:**
1. Enable/Disable notifications toggle
2. Device/browser management (list active tokens)
3. Permission status indicator
4. Re-request permission if denied
5. Notification event preferences (future enhancement)

**Implementation:**

```javascript
// Location: src/app/(chrome)/profile/notifications/page.js
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFCM } from '@/hooks/useFCM';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase-optimized';

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const { 
    notificationPermission, 
    fcmToken, 
    isSupported,
    requestPermission, 
    removeToken 
  } = useFCM();
  
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch user's registered devices
  useEffect(() => {
    if (!user) return;
    
    const fetchDevices = async () => {
      try {
        const tokensRef = collection(db, 'users', user.uid, 'tokens');
        const snapshot = await getDocs(query(tokensRef));
        
        const deviceList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isCurrent: doc.data().token === fcmToken,
        }));
        
        setDevices(deviceList);
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevices();
  }, [user, fcmToken]);
  
  const handleEnableNotifications = async () => {
    await requestPermission();
  };
  
  const handleRemoveDevice = async (deviceId, token) => {
    try {
      // Remove from Firestore
      await deleteDoc(doc(db, 'users', user.uid, 'tokens', deviceId));
      
      // Remove from local state
      setDevices(devices.filter(d => d.id !== deviceId));
      
      // If removing current device, also clear local token
      if (token === fcmToken) {
        await removeToken();
      }
    } catch (error) {
      console.error('Error removing device:', error);
    }
  };
  
  const getPermissionStatusColor = () => {
    switch (notificationPermission) {
      case 'granted': return 'text-green-600 dark:text-green-400';
      case 'denied': return 'text-red-600 dark:text-red-400';
      default: return 'text-yellow-600 dark:text-yellow-400';
    }
  };
  
  const getPermissionStatusText = () => {
    switch (notificationPermission) {
      case 'granted': return 'Enabled';
      case 'denied': return 'Blocked';
      default: return 'Not Enabled';
    }
  };
  
  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Push notifications are not supported in your browser. Please use Chrome, Firefox, or Edge.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Notification Settings
      </h1>
      
      {/* Permission Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Push Notifications
        </h2>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Status: <span className={`font-medium ${getPermissionStatusColor()}`}>
                {getPermissionStatusText()}
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Get notified about moderation updates for your campaigns
            </p>
          </div>
          
          {notificationPermission === 'default' && (
            <button
              onClick={handleEnableNotifications}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Enable Notifications
            </button>
          )}
          
          {notificationPermission === 'denied' && (
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Enable in browser settings
              </p>
              <button
                onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Open Browser Settings →
              </button>
            </div>
          )}
        </div>
        
        {notificationPermission === 'granted' && (
          <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            You're all set! You'll receive notifications for moderation updates.
          </div>
        )}
      </div>
      
      {/* Registered Devices */}
      {notificationPermission === 'granted' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Devices
          </h2>
          
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading devices...</p>
          ) : devices.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No devices registered for notifications
            </p>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div 
                  key={device.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.browser || 'Web Browser'}
                        {device.isCurrent && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Current Device
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Added {device.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveDevice(device.id, device.token)}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Future: Notification Preferences */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Coming Soon:</span> Choose which events you want to be notified about (warnings, removals, restorations, etc.)
        </p>
      </div>
    </div>
  );
}
```

---

#### **Task 4: Auto-Hide Notifications Integration** ⏸️ PENDING

**Goal:** Send notifications when campaigns/profiles are auto-hidden due to reports.

**Current State:**
- Auto-hide logic exists in `/api/reports/campaign/route.js` (3+ reports)
- Auto-hide logic exists in `/api/reports/user/route.js` (10+ reports)
- ❌ No notification sent when auto-hidden

**Implementation:**

**A. Update Campaign Report API:**
```javascript
// Location: src/app/api/reports/campaign/route.js
// Add notification after auto-hide logic (around line 85-90)

import { sendNotificationToUser } from '@/utils/notifications/sendFCMNotification';
import { campaignUnderReviewTemplate } from '@/utils/notifications/notificationTemplates';

// Inside the transaction, after auto-hide logic:
if (newReportsCount >= 3 && campaignData.moderationStatus !== 'under-review-hidden') {
  // Set to under-review-hidden
  transaction.update(campaignRef, {
    moderationStatus: 'under-review-hidden',
    hiddenAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  // ✅ NEW: Send notification to campaign creator
  const notification = campaignUnderReviewTemplate(
    campaignData.title,
    `/campaign/${campaignData.slug}`
  );
  
  await sendNotificationToUser(campaignData.creatorId, notification);
}
```

**B. Update User Report API:**
```javascript
// Location: src/app/api/reports/user/route.js
// Add notification after auto-hide logic (around line 85-90)

import { sendNotificationToUser } from '@/utils/notifications/sendFCMNotification';
import { profileUnderReviewTemplate } from '@/utils/notifications/notificationTemplates';

// Inside the transaction, after auto-hide logic:
if (newReportsCount >= 10 && userData.moderationStatus !== 'under-review-hidden') {
  // Set to under-review-hidden
  transaction.update(userRef, {
    moderationStatus: 'under-review-hidden',
    hiddenAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  // ✅ NEW: Send notification to user
  const notification = profileUnderReviewTemplate(
    userData.username,
    `/@${userData.username}`
  );
  
  await sendNotificationToUser(reportedUserId, notification);
}
```

---

#### **Task 5: Testing & Polish** ⏸️ PENDING

**Goal:** Ensure notifications work reliably across all scenarios.

**Testing Checklist:**

**A. Permission Flow Testing:**
- [ ] Test "Enable Notifications" after first campaign creation
- [ ] Test "Don't ask again" checkbox behavior
- [ ] Test banner dismiss and localStorage persistence
- [ ] Test permission request on settings page
- [ ] Test browser-denied permission handling

**B. Notification Delivery Testing:**
- [ ] Test background notification (app closed/tab inactive)
- [ ] Test foreground notification (app open/tab active)
- [ ] Test notification click → Navigate to correct page
- [ ] Test notification with image vs without image
- [ ] Test notification auto-dismiss (5 seconds)
- [ ] Test manual notification close

**C. Multi-Device Testing:**
- [ ] Test notifications on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test notification to multiple devices simultaneously
- [ ] Test device removal from settings page
- [ ] Test current device removal behavior

**D. Admin Action Notifications:**
- [ ] Test notification on "Dismiss Report"
- [ ] Test notification on "Warn Creator"
- [ ] Test notification on "Remove Campaign"
- [ ] Test notification on "Ban User"
- [ ] Test notification on auto-hide (3 reports / 10 reports)

**E. Edge Cases:**
- [ ] Test notification when user is offline (should queue)
- [ ] Test notification to logged-out user (should fail gracefully)
- [ ] Test notification to user with expired token (should remove token)
- [ ] Test notification with missing action URL
- [ ] Test notification with very long text (should truncate)

**F. Performance Testing:**
- [ ] Test service worker registration time
- [ ] Test token save/retrieve performance
- [ ] Test notification rendering performance (100+ notifications)
- [ ] Test memory leaks (long session with many notifications)

---

#### **Task 6: Documentation Updates** ⏸️ PENDING

**Goal:** Document the completed notification system.

**Files to Update:**

1. **CAMPAIGN_SYSTEM.md:**
   - Update line 153: Change status to "✅ Status: Fully Implemented"
   - Add section on UI integration details

2. **TASKS.md:**
   - Mark Section 10 as ✅ COMPLETED
   - Update notification triggers summary

3. **Create User Guide:**
   - How to enable notifications
   - How to manage notification settings
   - Troubleshooting guide (permission denied, not receiving notifications)

---

### 🎯 Success Metrics

**Task is complete when:**
1. ✅ Permission prompt shows after first campaign creation
2. ✅ Dashboard banner shows for users without permission
3. ✅ Foreground notifications display as custom toast (not browser notification)
4. ✅ Notification settings page allows device management
5. ✅ Auto-hide triggers send notifications
6. ✅ All notification types tested and working
7. ✅ Cross-browser compatibility verified (Chrome, Firefox, Safari)
8. ✅ Mobile notification support confirmed
9. ✅ Documentation updated

---

### 🔧 Technical Notes

**Important Considerations:**

1. **Service Worker Scope:**
   - Service worker is registered at root scope (`/`)
   - Ensure no conflicts with Next.js service worker
   - Test offline notification delivery

2. **Token Management:**
   - Tokens can expire - handle refresh gracefully
   - User can have max 10 active tokens (cleanup old ones)
   - Remove tokens on logout (privacy)

3. **Notification Payload Size:**
   - Keep data payload < 4KB (FCM limit)
   - Use actionUrl for deep linking, not full HTML

4. **Browser Compatibility:**
   - Safari requires HTTPS (no localhost exceptions)
   - Safari on iOS doesn't support web push (as of 2025)
   - Firefox requires explicit permission (no soft-prompt)

5. **Privacy & Compliance:**
   - Store user's permission choice in localStorage
   - Honor "Don't ask again" selection
   - Provide easy opt-out in settings
   - Clear tokens on account deletion

---

### 📦 Implementation Order (Recommended)

**Day 1: Core Toast & Permission**
1. Create NotificationToast component
2. Update useFCM hook to use toast instead of browser notification
3. Integrate toast in app layout
4. Add permission prompt after campaign creation
5. Test foreground notifications

**Day 2: Settings & Banner**
1. Create NotificationBanner component
2. Add banner to dashboard page
3. Build notification settings page
4. Implement device management
5. Test permission flows

**Day 3: Auto-Hide & Polish**
1. Add auto-hide notifications to report APIs
2. Test all notification triggers
3. Cross-browser testing
4. Mobile testing
5. Update documentation

---

### 🚀 Next Steps After Completion

Once Section 10 is complete, the notification system will be fully operational. The next priorities would be:

1. **Appeals System (Section 11)** - Allow users to appeal removals/bans
2. **Admin Warning History View** - Display warning count in admin panel
3. **Auto-Deletion Cron Jobs** - Automated cleanup of expired appeals

---

**End of Section 10: FCM UI Integration Plan**

---

---

## 🔧 Section 11: Settings & Notifications Navigation Improvement

**Priority:** HIGH  
**Status:** 🚀 READY TO IMPLEMENT  
**Last Updated:** October 10, 2025

### Problem Analysis

**Current Navigation Issues:**

1. **Settings Structure:**
   - `/settings` page → Only handles FCM device management (confusing, should be more comprehensive)
   - `/profile/edit` page → Profile information (avatar, bio, username, banner) - **KEEP AS-IS**
   - No dedicated notification settings page

2. **Navigation Inconsistencies:**
   - ✅ Bell icon in header → `/profile/notifications` (correct)
   - ✅ "Notifications" in sidebar menu → `/profile/notifications` (correct)
   - ⚠️ "Settings" button on `/profile/notifications` page → `/settings` (only FCM devices, not comprehensive)
   - ⚠️ "Settings" in sidebar menu → `/settings` (only FCM devices, not comprehensive)

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

**Section 1: Push Notifications (Migrated from current `/settings`)**
- ✅ Master push notification toggle
- ✅ Browser permission status display
- ✅ Active devices list
- ✅ Device management (remove devices)
- ✅ FCM token status

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
- Settings → /settings (only FCM devices)
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
- [ ] Migrate FCM device management from current `/settings`
- [ ] Add Section 1: Push Notifications (master toggle, devices, permissions)
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
- [ ] Test FCM device management still works
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
│   (grayed)   │  Push notifications,    │
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
│  Push notifications, devices, prefs     │
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

**Note:** FCM device management APIs already exist, will be reused.

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
- [ ] FCM device management still works (migrated from `/settings`)
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
- ✅ Migrate FCM device management
- ✅ Add per-notification-type preferences
- ✅ Update navigation links
- ✅ Keep `/profile/edit` unchanged

**Current Issues:**
- ❌ `/settings` only shows FCM devices (confusing)
- ❌ No granular notification preferences
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
