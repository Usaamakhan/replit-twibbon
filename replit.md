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
- **FCM Push Notification System:** Real-time push notifications for user updates and moderation events, including an in-app notification inbox.

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
- **Dynamic Service Worker:** For FCM, a dynamic service worker serves Firebase configuration from environment variables.
- **Notification History/Inbox System:** All push notifications are saved to Firestore for an in-app inbox with real-time updates and authenticated APIs for managing read/delete status.

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

2. **FCM Notification System Status Corrected:**
   - Previous docs: Marked as "UI Integration Pending"
   - Actual status: 95% complete (only automated prompting strategy pending)
   - Updated documentation to reflect:
     - ✅ Backend 100% complete (token management, send API, history)
     - ✅ Frontend UI 95% complete (NotificationBell, NotificationToast, NotificationProvider, NotificationBanner, NotificationPermissionModal)
     - ✅ Notification inbox at `/profile/notifications` (read/unread, delete)
     - ✅ Settings page at `/settings/notifications` (device management, preferences)
     - ⏸️ Only pending: Automated prompting strategy (when to show permission modal)

3. **Settings Architecture Documentation Updated:**
   - Added Section 11 completion status
   - Documented new `/settings` hub with sidebar/tabs structure
   - Clarified `/profile/notifications` is inbox (not just preferences)
   - Documented `/settings/notifications` with full feature list

4. **Added Section 12 to TASKS.md:**
   - New task: "Automated Notification Permission Prompting"
   - Priority: 🔥 High (quick win, components ready)
   - Estimated effort: 2-3 hours
   - Complete implementation plan with hook, integration points, and testing checklist

**Current Implementation Status:**
- ✅ Core campaign system fully functional
- ✅ Admin dashboard with full moderation tools
- ✅ FCM notification system (95% - only automated prompting pending)
- ✅ Settings hub with notification preferences
- ✅ Notification inbox with history
- ⏸️ Appeals system (deferred)
- ⏸️ Admin warning history view (deferred)
- ⏸️ Auto-deletion cron jobs (deferred)

**Recommended Next Task:**
Section 12: Automated Notification Permission Prompting - Implement triggers to show NotificationPermissionModal after campaign creation and add dashboard banner for users who haven't enabled notifications.