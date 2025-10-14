# Twibbonize App

## Overview
Twibbonize is a Next.js 15 application designed for creating and sharing "Campaigns" consisting of photo frames and backgrounds. It allows visitors to discover, customize, and download photos with these elements, while creators can upload and manage their campaigns with public analytics. The project aims to provide a visitor-first, frictionless experience with minimal authentication requirements, emphasizing public discovery and transparency.

## User Preferences
- Prefer stability over experimental features
- Focus on clean, maintainable code structure
- Make code changes ONLY when explicitly requested
- Never perform automatic setup, testing, or debugging

## System Architecture
The application is built with Next.js 15.5.2 (App Router), React 19.1.0, and Tailwind CSS 4. It leverages Firebase for authentication and Supabase for database and storage.

**Core Features:**
- **Campaign System:** Users can upload and manage campaigns, categorized as Frames (requiring transparency detection) or Backgrounds.
- **Public Gallery:** A unified `/campaigns` page for browsing campaigns with filtering capabilities.
- **Image Composition:** Utilizes Canvas API for overlaying user photos with frames/backgrounds, including adjustment tools (zoom, move, fit).
- **Top Creators:** A leaderboard feature showcasing creators by country and time period.
- **Public Analytics:** Transparent usage statistics for all campaigns.
- **Three-Page Campaign Flow:** A guided user experience for photo upload, adjustment, and result download/sharing.
- **Admin Dashboard:** A comprehensive panel for moderation, including reports management, campaign moderation, user management, and analytics.
- **In-App Notification System:** Real-time Firestore-based notifications for user updates and moderation events, with notification inbox and toast alerts.

**Design Principles:**
- **Visitor-first experience:** Browsing and using campaigns do not require authentication.
- **Minimal account requirements:** Authentication is only required for campaign creation.
- **Public-first design:** Emphasizes discovery and transparent analytics.
- **Frictionless workflow:** Achieved through delayed authentication and intuitive user flows.

**Technical Implementations:**
- **Transparency Detection:** Canvas API is used to validate transparency for frame uploads.
- **Slug Generation:** Unique, URL-friendly identifiers are generated from campaign titles.
- **Delayed Authentication:** Users can complete forms unauthenticated, with a prompt only at the point of publishing.
- **Optimized Database Structure:** Firebase/Firestore is optimized to reduce storage costs and prevent document bloat, especially for viral campaigns, by simplifying download tracking and using counters.
- **Image Optimization:** ImageKit.io CDN is integrated for image transformation (WebP, resizing, quality optimization) across all application images.
- **In-App Notifications Only:** Notifications are delivered through Firestore real-time listeners - no browser permissions or service workers needed.
- **Notification History/Inbox System:** All notifications are saved to Firestore (`users/{userId}/notifications`) for an in-app inbox with real-time updates and authenticated APIs for managing read/delete status.

## External Dependencies
- **Firebase:** Authentication and backend services.
- **Supabase:** Database and image storage.
- **ImageKit.io:** CDN for image optimization and transformations.
- **Next.js:** Web framework (v15.5.2).
- **React:** UI library (v19.1.0).
- **Tailwind CSS:** Styling (v4).

## Recent Updates (October 13, 2025)

### Documentation Audit & Corrections
Conducted comprehensive documentation audit comparing actual codebase against all documentation files:

**Files Analyzed:**
- CODEBASE_STRUCTURE.md (647 lines)
- CODE_INCONSISTENCIES.md
- TASKS.md (2427 lines)
- README.md
- CAMPAIGN_SYSTEM.md
- replit.md

**Key Findings & Fixes:**
1. **Component Discrepancies Resolved:**
   - ❌ Removed non-existent `ReportUserModal.js` from docs
   - ✅ Added missing `ShareModal.js` to docs (universal modal for campaigns and profiles)
   - ✅ Clarified `ReportModal.js` handles both campaign and user reports

2. **In-App Notification System:**
   - Firestore-based real-time notification system
   - No browser permissions required
   - System features:
     - ✅ Real-time Firestore listeners for instant notifications
     - ✅ NotificationBell, NotificationToast, NotificationProvider components
     - ✅ Notification inbox at `/profile/notifications` (read/unread, filter, delete)
     - ✅ Settings page at `/settings/notifications` (notification type preferences)
     - ✅ Server-side sendInAppNotification utility for sending notifications

3. **Settings Architecture Documentation Updated:**
   - Added Section 11 completion status
   - Documented new `/settings` hub with sidebar/tabs structure
   - Clarified `/profile/notifications` is inbox (not just preferences)
   - Documented `/settings/notifications` with full feature list

4. **Documentation Updates:**
   - Updated TASKS.md with notification system documentation
   - Documented in-app notification architecture and components
   - Added notification system integration with moderation features

**Current Implementation Status:**
- ✅ Core campaign system fully functional
- ✅ Admin dashboard with full moderation tools
- ✅ In-app notification system with Firestore real-time listeners
- ✅ Settings hub with notification preferences
- ✅ Notification inbox with history
- ✅ Optimized grouped reporting system
- ⏸️ Appeals system (deferred)
- ⏸️ Admin warning history view (deferred)
- ⏸️ Auto-deletion cron jobs (deferred)

## Recent Updates (October 14, 2025)

### Grouped Reporting System Optimization
Implemented a highly optimized grouped reporting system that reduces Firestore reads by ~95% (from 1000+ reads to 10-30 reads per page load).

**Implementation Details:**
1. **reportSummary Aggregated Collection:**
   - New Firestore collection that aggregates reports by target (campaign or user)
   - Schema includes: `targetId`, `targetType`, `reportCount`, `status`, `firstReportedAt`, `lastReportedAt`
   - Display data cached in summary for quick access (title, image, creator info)
   - `reportCount` resets to 0 when admin takes any action (dismiss/warn/remove)

2. **Report Submission Updates:**
   - Both `/api/reports/submit` and `/api/reports/user` maintain reportSummary collection
   - Atomic transactions ensure consistency between individual reports and summaries
   - Status automatically resets to 'pending' when new reports filed against resolved entities

3. **Admin API Endpoints:**
   - `/api/admin/reports/grouped`: Fetches paginated summaries (max 10) with filters (type, status, sort)
   - `/api/admin/reports/details`: Lazy-loads individual report details on demand
   - Support for sorting by top reported, most recent, or oldest pending

4. **GroupedReportsTable Component:**
   - Displays aggregated report summaries with expand/collapse functionality
   - Individual reports loaded only when admin expands a row (lazy loading)
   - Shows report count, pending count, and moderation status at a glance

5. **Admin Reports Page Updates:**
   - Replaced individual report listing with grouped summaries
   - Filters: Report type (campaign/user), status (pending/resolved/dismissed), sort options
   - Pagination limited to 10 grouped items per page
   - Auto-refresh after admin actions to show next batch

6. **Admin Action Handler Updates:**
   - Updates reportSummary status to 'resolved' or 'dismissed' when actions taken
   - Resets reportCount to 0 on any admin action (dismiss/warn/remove)
   - Resets campaign/user reportsCount to 0 on any admin action
   - Maintains atomicity with Firestore transactions
   - Next report after action starts fresh at count=1

7. **UI Cleanup:**
   - Removed "Top Reported Campaigns" section from main admin dashboard
   - Consolidated all reporting functionality in `/admin/reports` page

**Performance Impact:**
- Initial page load: 1000 reads → 10-30 reads (~95% reduction)
- Grouped view shows exactly 10 summaries instead of loading all individual reports
- Individual report details loaded on-demand only when needed
- Significant cost savings on Firestore usage for high-volume reporting scenarios

