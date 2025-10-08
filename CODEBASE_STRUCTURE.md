# Codebase Structure Documentation

**Last Updated:** October 08, 2025  
**Project:** Twibbonize - Campaign Photo Frame & Background Platform

This document provides a complete overview of the codebase structure with descriptions of each file and folder's purpose.

---

## 📁 Root Directory

```
.
├── attached_assets/          # Uploaded assets and screenshots (temporary files)
├── public/                   # Static assets served directly
├── src/                      # Source code directory (main application)
├── .local/                   # Local state and progress tracking
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

- **`layout.js`** - Root layout wrapper for entire app
- **`page.js`** - Homepage with hero section
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

#### 📁 **`/campaigns`**
- **`route.js`** - GET: Fetch all campaigns with creator info (admin view)
- **`/[campaignId]/route.js`** - PATCH: Update campaign moderation status
- **`/[campaignId]/delete/route.js`** - DELETE: Permanently delete campaign + image

#### 📁 **`/reports`**
- **`route.js`** - GET: Fetch all reports with filters
- **`/[reportId]/route.js`** - PATCH: Update report status and action

#### 📁 **`/users`**
- **`route.js`** - GET: Fetch all users with search/filters
- **`/[userId]/role/route.js`** - PATCH: Assign/revoke admin role
- **`/[userId]/ban/route.js`** - PATCH: Ban/unban user

---

### 📁 `/src/app/api/campaigns` - Campaign Operations

#### 📁 **`/track-download`**
- **`route.js`** - POST: Increment campaign supportersCount on download

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

### 📁 `/src/app` - Auth Pages (No Chrome Layout)

Authentication pages without header/footer.

#### **`/signin/page.js`** - Sign in page with email/password
#### **`/signup/page.js`** - Sign up page with email/password
#### **`/forgot-password/page.js`** - Password reset page
#### **`/verify-email/page.js`** - Email verification page
#### **`/onboarding/page.js`** - New user onboarding (username, bio, avatar)

---

## 📁 `/src/components` - React Components

Reusable UI components organized by feature.

### Layout Components

- **`Header.js`** - Main navigation header with auth buttons
- **`Footer.js`** - Site footer with links
- **`MobileMenu.js`** - Mobile hamburger menu
- **`Hero.js`** - Homepage hero section with CTA
- **`ConditionalLayout.js`** - Conditionally render header/footer
- **`AuthenticatedLayout.js`** - Layout wrapper for authenticated users

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

### Admin Components

- **`AdminSidebar.js`** - Admin dashboard sidebar navigation
- **`AdminHeader.js`** - Admin dashboard header with breadcrumbs
- **`ReportsTable.js`** - Reports data table with filters
- **`ReportDetailsPanel.js`** - Report details slide-out panel
- **`CampaignModerationCard.js`** - Campaign card with moderation actions
- **`UsersTable.js`** - Users data table with search
- **`UserDetailsModal.js`** - User details modal with admin actions

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
- **`useFocusTrap.js`** - Trap keyboard focus within modal
- **`useSecureStorage.js`** - Secure localStorage/sessionStorage wrapper with encryption

---

## 📁 `/src/lib` - Core Libraries & Integrations

External service integrations and core utilities.

### Firebase

- **`firebase-optimized.js`** - Firebase client SDK initialization (auth only)
- **`firebaseAdmin.js`** - Firebase Admin SDK for server-side operations
- **`firestore.js`** - Firestore database functions (CRUD operations)
  - User profiles, campaigns, reports, creators, etc.

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
- **`imageTransform.js`** - ImageKit.io CDN transformations
  - Thumbnail, preview, avatar, banner presets
  - WebP conversion and quality optimization

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

## 📁 `.local/state/replit/agent` - Agent State

- **`progress_tracker.md`** - Import progress tracking (internal agent use)

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
4. Navigate `/result` → Share options

### Admin Flow
1. Admin visits `/admin` → `adminAuth.js` middleware checks role
2. View reports → `/api/admin/reports` → `firebaseAdmin.js`
3. Moderate campaign → `/api/admin/campaigns/[id]` → Update status
4. All operations logged and authenticated

---

## External Dependencies

### Core Framework
- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - UI library
- **Tailwind CSS 4** - Utility-first CSS

### Backend Services
- **Firebase** - Authentication and Firestore database
- **Supabase** - Object storage for images
- **ImageKit.io** - CDN for image optimization

### Key Libraries
- **@supabase/supabase-js** - Supabase client
- **firebase** - Firebase client SDK
- **firebase-admin** - Firebase server SDK
- **zod** - Schema validation
- **server-only** - Ensure server-side only code

---

## Environment Variables

**Configured on Vercel (NOT in Replit):**

### Firebase
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string)

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### ImageKit.io
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

## Notes

- All routes under `/admin` require admin role verification
- All API routes under `/api/admin` protected by `requireAdmin()` middleware
- Campaign images stored in Supabase at `campaigns/{userId}/{campaignId}.png`
- Profile images stored in Supabase at `profiles/{userId}/{type}.{ext}`
- Session data persists in sessionStorage with 24h expiry
- ImageKit.io CDN used for all image transformations (WebP, resizing)
- Download tracking uses Firestore transactions to prevent race conditions
- Username reservation uses dedicated collection for atomicity

---

**End of Documentation**
