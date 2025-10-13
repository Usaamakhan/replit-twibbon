# Codebase Structure Documentation

**Last Updated:** October 13, 2025  
**Project:** Twibbonize - Campaign Photo Frame & Background Platform

This document provides a complete overview of the codebase structure with descriptions of each file and folder's purpose.

---

## 📁 Root Directory

```
.
├── attached_assets/          # Uploaded assets and screenshots (temporary files)
├── public/                   # Static assets served directly
├── src/                      # Source code directory (main application)
├── *.md                      # Documentation files
└── Config files              # Project configuration
```

### Documentation Files

- **`README.md`** - Standard Next.js project documentation
- **`replit.md`** - Project overview, strict policies, architecture, and user preferences
- **`TASKS.md`** - Campaign system task tracker with implementation status
- **`CAMPAIGN_SYSTEM.md`** - Complete campaign system implementation guide
- **`CODE_INCONSISTENCIES.md`** - Tracks code/documentation inconsistencies and fixes
- **`CODEBASE_STRUCTURE.md`** - This file - complete codebase structure documentation

### Configuration Files

- **`package.json`** - Node.js dependencies and scripts
- **`package-lock.json`** - Locked dependency versions
- **`next.config.mjs`** - Next.js framework configuration
- **`postcss.config.mjs`** - PostCSS configuration for Tailwind CSS
- **`eslint.config.mjs`** - ESLint linting rules
- **`jsconfig.json`** - JavaScript/TypeScript configuration and path aliases
- **`firestore.rules`** - Firestore database security rules

---

## 📁 `/public` - Static Assets

```
public/
├── file.svg              # File icon
├── globe.svg             # Globe icon
├── next.svg              # Next.js logo
├── vercel.svg            # Vercel logo
└── window.svg            # Window icon
```

**Purpose:** Contains static assets that are served directly without processing. These files are accessible at the root URL (e.g., `/file.svg`).

---

## 📁 `/src` - Source Code

Main application source code organized by Next.js App Router conventions.

---

## 📁 `/src/app` - Application Routes & Pages

Next.js 15 App Router directory structure. Each folder represents a route.

### Root Level Files

- **`layout.js`** - Root layout wrapper for entire app with NotificationProvider
- **`globals.css`** - Global styles and Tailwind CSS imports
- **`loading.js`** - Global loading UI component
- **`not-found.js`** - 404 error page
- **`analytics.js`** - Analytics tracking setup
- **`favicon.ico`** - Site favicon

---

### 📁 `/src/app/(chrome)` - Main App Layout Group

Routes that use the main app layout (header + footer).

#### **`layout.js`** - Chrome layout with Header/Footer navigation

#### **`page.js`** - Homepage with hero and CTA

---

### 📁 `/src/app/(chrome)/admin` - Admin Dashboard

Admin-only routes for platform moderation and management.

#### **`layout.js`** - Admin layout with sidebar navigation and auth protection
#### **`page.js`** - Admin analytics dashboard (default admin page)

#### 📁 **`/reports`** - Reports Management
- **`page.js`** - Reports table with filters and moderation actions

#### 📁 **`/campaigns`** - Campaign Moderation
- **`page.js`** - Campaign grid with moderation status and actions

#### 📁 **`/users`** - User Management
- **`page.js`** - User table with role assignment and ban actions

---

### 📁 `/src/app/(chrome)/campaign/[slug]` - 3-Page Campaign Flow

Visitor experience for using campaigns (frames/backgrounds).

#### **`page.js`** - Page 1: Upload photo and view campaign details
#### 📁 **`/adjust`**
- **`page.js`** - Page 2: Adjust photo with zoom/position/rotate controls
#### 📁 **`/result`**
- **`page.js`** - Page 3: Download result and share options

**Flow:** Upload → Adjust → Result (with session persistence and route guards)

---

### 📁 `/src/app/(chrome)/campaigns` - Campaign Gallery

#### **`page.js`** - Browse all campaigns with filters (type, time, sort)

---

### 📁 `/src/app/(chrome)/create` - Campaign Creation

Creator workflow for uploading new campaigns.

#### **`page.js`** - Opens CreateCampaignModal (for direct URL access)

#### 📁 **`/frame`**
- **`page.js`** - Upload frame with transparency detection (≥5% required)

#### 📁 **`/background`**
- **`page.js`** - Upload background (any format, no transparency required)

**Flow:** Choose type → Upload image → Fill metadata → Publish

---

### 📁 `/src/app/(chrome)/creators` - Top Creators

#### **`page.js`** - Leaderboard ranked by total campaign supports

---

### 📁 `/src/app/(chrome)/profile` - User Profile

#### **`page.js`** - User's own profile page with campaigns grid

#### 📁 **`/edit`**
- **`page.js`** - Edit profile (avatar, banner, bio, username)

#### 📁 **`/notifications`**
- **`page.js`** - Notification inbox with read/unread status and history

---

### 📁 `/src/app/(chrome)/settings` - Settings Pages

User settings with sidebar navigation.

#### **`layout.js`** - Settings layout with SettingsSidebar
#### **`page.js`** - Main settings page (redirects to notifications)

#### 📁 **`/notifications`**
- **`page.js`** - Notification preferences (enable/disable, manage devices, per-notification-type toggles)

---

### 📁 `/src/app/(chrome)/u/[username]` - Public Profiles

#### **`page.js`** - Public user profile pages (accessible via username)

---

### 📁 `/src/app/(chrome)/privacy` - Legal Pages

#### **`page.js`** - Privacy policy page

---

### 📁 `/src/app/(chrome)/terms` - Legal Pages

#### **`page.js`** - Terms of service page

---

### 📁 `/src/app/api` - API Routes (Server-Side)

Backend API endpoints for data operations.

---

### 📁 `/src/app/api/admin` - Admin API Routes

Server-side admin operations (protected by admin middleware).

#### 📁 **`/analytics`**
- **`route.js`** - GET: Fetch platform analytics (total users, campaigns, reports, bans)

#### 📁 **`/campaigns`**
- **`route.js`** - GET: Fetch all campaigns with creator info (admin view)
- **`/[campaignId]/route.js`** - PATCH: Update campaign moderation status
- **`/[campaignId]/delete/route.js`** - DELETE: Permanently delete campaign + image

#### 📁 **`/reports`**
- **`route.js`** - GET: Fetch all reports with filters
- **`/[reportId]/route.js`** - PATCH: Update report status and perform moderation actions

#### 📁 **`/users`**
- **`route.js`** - GET: Fetch all users with search/filters
- **`/[userId]/role/route.js`** - PATCH: Assign/revoke admin role
- **`/[userId]/ban/route.js`** - PATCH: Ban/unban user

---

### 📁 `/src/app/api/campaigns` - Campaign Operations

#### 📁 **`/track-download`**
- **`route.js`** - POST: Increment campaign supportersCount on download

---

### 📁 `/src/app/api/notifications` - FCM Push Notifications

Firebase Cloud Messaging integration for push notifications.

#### 📁 **`/[notificationId]`**
- **`route.js`** - PATCH: Mark notification as read/unread, DELETE: Delete notification

#### 📁 **`/register-token`**
- **`route.js`** - POST: Register FCM device token for user

#### 📁 **`/remove-token`**
- **`route.js`** - DELETE: Remove FCM device token on logout

#### 📁 **`/send`**
- **`route.js`** - POST: Send FCM notification to user(s) (server-side only)

---

### 📁 `/src/app/api/reports` - Report Submission

#### 📁 **`/submit`**
- **`route.js`** - POST: Submit campaign report (anonymous allowed)

#### 📁 **`/user`**
- **`route.js`** - POST: Submit user/profile report (anonymous allowed)

---

### 📁 `/src/app/api/storage` - Supabase Storage Operations

#### 📁 **`/campaign-upload-url`**
- **`route.js`** - POST: Generate signed upload URL for campaigns

#### 📁 **`/upload-url`**
- **`route.js`** - POST: Generate signed upload URL for profile images

#### 📁 **`/delete`**
- **`route.js`** - POST: Delete file from Supabase storage

#### 📁 **`/signed-url`**
- **`route.js`** - POST: Generate temporary download URL

#### 📁 **`/list`**
- **`route.js`** - POST: List files in storage bucket

---

### 📁 `/src/app` - Auth & Special Pages (No Chrome Layout)

Authentication pages and special pages without header/footer.

#### **`/signin/page.js`** - Sign in page with email/password
#### **`/signup/page.js`** - Sign up page with email/password
#### **`/forgot-password/page.js`** - Password reset page
#### **`/verify-email/page.js`** - Email verification page
#### **`/onboarding/page.js`** - New user onboarding (username, bio, avatar)
#### **`/banned/page.js`** - Banned account notice with appeal option

---

### 📁 `/src/app/firebase-messaging-sw` - Service Worker Route

#### **`/route.js`** - Dynamic service worker for FCM with environment variables

---

## 📁 `/src/components` - React Components

Reusable UI components organized by feature.

### Layout Components

- **`Header.js`** - Main navigation header with auth buttons and notification bell
- **`Footer.js`** - Site footer with links
- **`MobileMenu.js`** - Mobile hamburger menu
- **`Hero.js`** - Homepage hero section with CTA
- **`ConditionalLayout.js`** - Conditionally render header/footer
- **`AuthenticatedLayout.js`** - Layout wrapper for authenticated users
- **`SettingsSidebar.js`** - Settings page sidebar navigation

### Auth Components

- **`AuthGate.js`** - Protected route wrapper (requires authentication)
- **`ClientAuthProvider.js`** - Firebase auth context provider
- **`EmailVerification.js`** - Email verification prompt
- **`UserOnboardingWrapper.js`** - Onboarding flow wrapper
- **`UserProfileProvider.js`** - User profile data provider

### Campaign Components

- **`CampaignGallery.js`** - Grid of campaign cards with filters
- **`CampaignStepIndicator.js`** - Step indicator for 3-page flow (Upload → Adjust → Result)
- **`CreateCampaignModal.js`** - Modal for choosing Frame or Background type
- **`FilterModal.js`** - Filter modal for campaigns/creators pages

### Profile Components

- **`ProfilePage.js`** - User profile display component
- **`ProfilePageWrapper.js`** - Profile page wrapper with loading state

### Modal Components

- **`ConfirmationModal.js`** - Reusable confirmation dialog
- **`ReportModal.js`** - Universal report modal for both campaigns and user profiles
- **`ShareModal.js`** - Universal share modal for campaigns and profiles
- **`CreateCampaignModal.js`** - Campaign type selection modal

### Admin Components

Located in `/src/components/admin/`:

- **`AdminSidebar.js`** - Admin dashboard sidebar navigation
- **`AdminHeader.js`** - Admin dashboard header with breadcrumbs
- **`AdminActionButton.js`** - Reusable action button with loading/confirm dialog
- **`ReportsTable.js`** - Reports data table with filters (uses adminHelpers)
- **`ReportDetailsPanel.js`** - Report details slide-out panel
- **`CampaignModerationCard.js`** - Campaign card with moderation actions (uses adminHelpers)
- **`UsersTable.js`** - Users data table with search (uses adminHelpers)
- **`UserDetailsModal.js`** - User details modal with admin actions

### Notification Components

Located in `/src/components/notifications/`:

- **`NotificationProvider.js`** - Global notification provider with FCM integration
- **`NotificationBell.js`** - Notification bell icon with unread count badge
- **`NotificationBanner.js`** - In-app notification banner display
- **`NotificationToast.js`** - Toast notifications with animations
- **`NotificationPermissionModal.js`** - Modal to request notification permissions

### Utility Components

- **`ConfirmationModal.js`** - Reusable confirmation dialog
- **`LoadingSpinner.js`** - Loading spinner component
- **`PageLoader.js`** - Full-page loading indicator
- **`ErrorBoundary.js`** - Error boundary wrapper
- **`InteractiveClient.js`** - Client-side interactive wrapper
- **`FirestoreProvider.js`** - Firestore context provider
- **`LayoutVisibilityContext.js`** - Control header/footer visibility
- **`TimeoutWrapper.js`** - Timeout handling wrapper

---

## 📁 `/src/contexts` - React Context Providers

Global state management using React Context.

- **`CampaignSessionContext.js`** - Campaign flow session state (photo, adjustments, campaign data)
  - Persists to sessionStorage with 24h expiry
  - Used across 3-page campaign flow

---

## 📁 `/src/data` - Static Data

- **`countries.js`** - List of countries with codes and names for filters

---

## 📁 `/src/hooks` - Custom React Hooks

Reusable logic hooks.

- **`useAuth.js`** - Firebase authentication hook (user state, login, logout)
- **`useBodyScrollLock.js`** - Lock body scroll when modal is open
- **`useFCM.js`** - Firebase Cloud Messaging hook (token management, foreground notifications)
- **`useFocusTrap.js`** - Trap keyboard focus within modal
- **`useSecureStorage.js`** - Secure localStorage/sessionStorage wrapper with encryption

---

## 📁 `/src/lib` - Core Libraries & Integrations

External service integrations and core utilities.

### Firebase

- **`firebase-optimized.js`** - Firebase client SDK initialization (auth + messaging)
- **`firebaseAdmin.js`** - Firebase Admin SDK for server-side operations
- **`firestore.js`** - Firestore database functions (CRUD operations)
  - User profiles, campaigns, reports, creators, notifications, etc.

### Supabase

- **`supabase.js`** - Supabase client SDK (storage operations)
- **`supabase-admin.js`** - Supabase Admin SDK for server-side storage

---

## 📁 `/src/middleware` - API Middleware

Server-side middleware for API routes.

- **`adminAuth.js`** - Admin authentication middleware
  - `requireAdmin()` - Verify user has admin role
  - Used in all `/api/admin/*` routes

---

## 📁 `/src/utils` - Utility Functions

Helper functions and algorithms.

### Campaign Utilities

- **`slugGenerator.js`** - Generate unique URL slugs from titles (50 chars + 4-char random)
- **`transparencyDetector.js`** - Detect PNG transparency (≥5% threshold for frames)
- **`campaignStorage.js`** - Storage path utilities (`campaigns/{userId}/{campaignId}.png`)
- **`campaignRouteGuards.js`** - Route guards for 3-page campaign flow
  - `requirePhotoUpload()` - Redirect if no photo
  - `requireDownloadComplete()` - Redirect if not downloaded

### Image Utilities

- **`imageComposition.js`** - Canvas-based image composition
  - Frame: photo under frame
  - Background: photo on top
  - Zoom, position, rotate adjustments
- **`imageTransform.js`** - Supabase CDN transformations
  - Thumbnail, preview, avatar, banner presets
  - WebP conversion and quality optimization

### Admin Utilities

Located in `/src/utils/admin/`:

- **`adminHelpers.js`** - Admin dashboard formatting utilities
  - `formatReportReason()` - Human-readable report reasons
  - `getModerationStatusColor()` - Badge colors for moderation status
  - `getReportStatusColor()` - Badge colors for report status
  - `getRoleBadgeColor()` - Badge colors for user roles
  - `formatTimestamp()` - Date formatting with optional time
  - `truncateText()` - Text truncation with ellipsis
  - `formatNumber()` - Number formatting with thousands separator

- **`adminValidation.js`** - Admin input validation
  - `validateReportStatus()` - Validate report status values
  - `validateModerationStatus()` - Validate moderation status values
  - `validateUserRole()` - Validate user role values
  - `validateBanReason()` - Validate ban reason is provided
  - `validateReportAction()` - Validate report action types
  - `getValidationError()` - Get validation error message

### Notification Utilities

Located in `/src/utils/notifications/`:

- **`notificationTemplates.js`** - FCM notification templates for moderation actions
  - Campaign under review
  - Campaign removed
  - Warning issued
  - Profile under review
  - Account banned
  - Appeal deadline reminders

- **`sendFCMNotification.js`** - Client-side FCM notification sender
  - Send to single user (all devices)
  - Send batch notifications
  - Error handling and retry logic

### General Utilities

- **`validation.js`** - Input validation functions
- **`schemas.js`** - Data schemas and validators
- **`firebaseErrorHandler.js`** - Firebase error messages formatter
- **`networkUtils.js`** - Network request utilities

---

## 📁 `/src` - Root Level Files

- **`middleware.js`** - Next.js middleware (route protection, redirects)
- **`polyfills.js`** - Browser polyfills for older browsers

---

## Key File Relationships

### Campaign Creation Flow
1. User clicks "Create Campaign" → `CreateCampaignModal.js`
2. Choose Frame → `/create/frame/page.js` → `transparencyDetector.js`
3. Upload → `campaignStorage.js` → `supabase.js`
4. Publish → `firestore.js` (createCampaign)

### Campaign Usage Flow (3-Page)
1. Visit `/campaign/[slug]` → Upload photo → `CampaignSessionContext.js`
2. Navigate `/adjust` → `imageComposition.js` → Canvas controls
3. Download → `/api/campaigns/track-download` → Increment supportersCount
4. Navigate `/result` → Share options via `ShareModal.js`

### Admin Moderation Flow
1. Admin visits `/admin` → `adminAuth.js` middleware checks role
2. View reports → `/api/admin/reports` → `firebaseAdmin.js`
3. Moderate campaign → `/api/admin/campaigns/[id]` → Update status
4. Send FCM notification → `/api/notifications/send` → `sendFCMNotification.js`
5. User receives notification → `useFCM.js` → `NotificationToast.js`

### FCM Notification Flow
1. User grants permission → `NotificationPermissionModal.js`
2. Get FCM token → `useFCM.js` → Firebase Messaging SDK
3. Register token → `/api/notifications/register-token` → Firestore
4. Admin action triggers notification → `/api/admin/reports/[id]`
5. Server sends FCM → `/api/notifications/send` → Firebase Admin SDK
6. User receives:
   - Background: Service worker (`firebase-messaging-sw/route.js`)
   - Foreground: `useFCM.js` → `NotificationToast.js`
7. View history → `NotificationBell.js` → `/profile/notifications`

---

## External Dependencies

### Core Framework
- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - UI library
- **Tailwind CSS 4** - Utility-first CSS

### Backend Services
- **Firebase** - Authentication, Firestore database, and Cloud Messaging (FCM)
- **Supabase** - Object storage for images with CDN
- **ImageKit.io** - Image optimization (deprecated in favor of Supabase CDN)

### Key Libraries
- **@supabase/supabase-js** - Supabase client
- **firebase** - Firebase client SDK (auth + messaging)
- **firebase-admin** - Firebase server SDK
- **zod** - Schema validation
- **server-only** - Ensure server-side only code

---

## Environment Variables

**Configured on Vercel (NOT in Replit):**

### Firebase
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` - For web push notifications
- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string)

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### ImageKit.io (Legacy)
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`

---

## Development Workflow

1. **Code editing** - Done in Replit editor
2. **Testing** - All testing on Vercel deployment (NOT locally)
3. **Dependencies** - User installs manually (`npm install`)
4. **Server** - User manages server execution (NOT agent)
5. **Environment** - All env vars configured on Vercel

**Important:** Replit is used ONLY for code editing, not for running/testing the application.

---

## Implementation Status Summary

### ✅ Fully Implemented Features

**Core Campaign System:**
- Campaign creation (frame + background)
- 3-page visitor flow (upload → adjust → result)
- Image composition with Canvas API
- Campaign gallery and discovery
- Top creators leaderboard

**Admin Dashboard:**
- Reports management with moderation actions
- Campaign moderation with status updates
- User management with role assignment and bans
- Platform analytics dashboard

**Moderation System:**
- Report submission (campaigns + profiles)
- Auto-hide rules (3+ reports for campaigns, 10+ for profiles)
- Admin actions: Dismiss, Warn, Remove/Ban
- Warnings collection and tracking

**Push Notifications (FCM):**
- ✅ Backend infrastructure (token management, send API)
- ✅ Notification templates for all moderation actions
- ✅ Service worker for background notifications
- ✅ In-app notification inbox at `/profile/notifications` (read/unread, delete)
- ✅ Notification history saved to Firestore
- ✅ Foreground notification toasts (`NotificationToast.js`)
- ✅ NotificationBell with unread count
- ✅ Settings page at `/settings/notifications` with:
  - FCM device management
  - Per-notification-type preferences (localStorage-based)
  - Enable/disable notifications toggle
- ✅ NotificationProvider integrated in app layout
- ✅ NotificationPermissionModal component ready
- ⏸️ **PENDING:** Automated prompting strategy (when to show permission modal)

### ⏸️ Deferred Features

- Appeals system (user appeals for removed content/banned accounts)
- Admin warning history view in user details
- Auto-deletion cron jobs (30-day appeal deadline enforcement)
- Email notifications for moderation actions
- Automated notification permission prompting (modal trigger strategy)

---

## Notes

- All routes under `/admin` require admin role verification
- All API routes under `/api/admin` protected by `requireAdmin()` middleware
- Campaign images stored in Supabase at `campaigns/{userId}/{campaignId}.png`
- Profile images stored in Supabase at `profiles/{userId}/{type}.{ext}`
- Session data persists in sessionStorage with 24h expiry
- Supabase CDN used for all image transformations (WebP, resizing)
- Download tracking uses Firestore transactions to prevent race conditions
- Username reservation uses dedicated collection for atomicity
- FCM tokens stored in user subcollection: `users/{userId}/tokens/{tokenId}`
- Notifications saved to Firestore: `users/{userId}/notifications/{notificationId}`
- Service worker served dynamically with environment variables
- `ReportModal.js` handles both campaign and user/profile reports (universal component)
- `ShareModal.js` handles both campaign and profile sharing (universal component)

---

**End of Documentation**
