# Campaign System - Task Tracker

Track progress on building the campaign system (Phase 1 from CAMPAIGN_SYSTEM.md)

**Last Updated:** October 03, 2025

---

## 🎯 3-PAGE CAMPAIGN FLOW IMPLEMENTATION

### Status: 🔄 In Progress
**Start Date:** October 03, 2025

---

## Overview: 3-Page Visitor Flow

Implementing a multi-page visitor experience for campaigns to increase ad impressions and improve engagement. This matches competitor (Twibbonize) best practices.

**Current State:** Single-page campaign experience
**Target State:** 3-page funnel with state persistence

---

## Architecture Summary

### Page Structure
1. **Page 1** `/campaign/[slug]` - Upload page
   - Campaign display with preview
   - "Choose Your Photo" CTA
   - Gallery of supporter posts
   
2. **Page 2** `/campaign/[slug]/adjust` - Adjustment page
   - Photo composition canvas
   - Adjustment controls (zoom, position)
   - Download button
   
3. **Page 3** `/campaign/[slug]/result` - Result page
   - Final image display
   - Share buttons
   - "Start Over" button

### State Management
- **Context**: React Context (`CampaignSessionContext`)
- **Persistence**: sessionStorage for page reload resilience
- **Lifecycle**: Auto-clear on "Start Over" or 24h expiry

### Navigation Flow
```
Upload Photo → Auto-redirect to /adjust
Download → Auto-redirect to /result
Start Over → Clear session → Redirect to base page
```

---

## Implementation Tasks

### ✅ Task 1: Planning Documents
**Status:** ✅ Completed
**Files:** TASKS.md, CAMPAIGN_SYSTEM.md
- [x] Document 3-page architecture
- [x] Define state management strategy
- [x] Plan route structure
- [x] Design navigation logic

---

### 🔄 Task 2: Campaign Session Context
**Status:** 🔄 In Progress
**File:** `src/contexts/CampaignSessionContext.js`

**Requirements:**
- React Context Provider for campaign state
- State persistence to sessionStorage
- Auto-hydration on page load
- Clear session function

**State Schema:**
```javascript
{
  sessionId: string,              // Unique session ID
  campaignSlug: string,            // Current campaign
  userPhoto: File | null,          // Uploaded photo
  userPhotoPreview: string,        // Base64 preview
  adjustments: {                   // Canvas adjustments
    scale: number,
    x: number,
    y: number
  },
  campaignData: object,            // Campaign info
  creatorData: object,             // Creator info
  downloaded: boolean,             // Track if downloaded
  timestamp: number                // Session created time
}
```

**Functions:**
- `useCampaignSession()` - Hook to access/update session
- `clearCampaignSession()` - Clear session data
- `isSessionExpired()` - Check 24h expiry

---

### ⏳ Task 3: Page 1 - Upload Page
**Status:** ⏳ Pending
**File:** `src/app/(chrome)/campaign/[slug]/page.js`

**Features:**
- Large campaign preview (shows frame/background)
- Campaign info (title, description, creator, supports)
- "Choose Your Photo" button (primary CTA)
- Gallery of recent supporter posts (6-9 photos)
- Share campaign buttons
- Report campaign button

**User Flow:**
1. User lands on page → sees campaign
2. Clicks "Choose Your Photo" → file picker
3. Selects photo → stores in context
4. Auto-redirects to `/campaign/[slug]/adjust`

**Design:**
- Yellow header with campaign info
- White content card with preview
- Grid layout for supporter gallery
- Ad placeholder slots

---

### ⏳ Task 4: Page 2 - Adjust Page
**Status:** ⏳ Pending
**File:** `src/app/(chrome)/campaign/[slug]/adjust/page.js`

**Features:**
- Large canvas preview with composition
- Zoom slider (0.5x - 3.0x)
- Drag to reposition (pointer events)
- "Fit to Frame" and "Reset" buttons
- "Change Photo" and "Remove Photo" buttons
- Download button (primary CTA)
- Progress indicator (Step 2 of 3)

**Route Guard:**
- Check if photo exists in session
- If no photo → Redirect to base page

**User Flow:**
1. User adjusts photo (zoom, position)
2. Clicks "Download" → downloads image
3. Tracks download in session
4. Auto-redirects to `/campaign/[slug]/result`

**Mobile Optimization:**
- Pointer events (not mouse/touch)
- `touch-action: none` (no scroll)
- `user-select: none` (no selection)
- No blue highlight overlay

---

### ⏳ Task 5: Page 3 - Result Page
**Status:** ⏳ Pending
**File:** `src/app/(chrome)/campaign/[slug]/result/page.js`

**Features:**
- Final composed image display
- Success message/animation
- "Post to Twibbonize" button (share to gallery)
- Social share buttons (Twitter, Facebook, WhatsApp)
- "Re-Download" button (secondary)
- "Start Over" button (clear and restart)
- Progress indicator (Step 3 of 3)

**Route Guard:**
- Check if downloaded in session
- If not downloaded → Redirect to adjust page
- If no photo → Redirect to base page

**User Flow:**
1. User sees final result
2. Can share to social media
3. Can post to public gallery (with caption)
4. "Start Over" clears session → returns to page 1

---

### ⏳ Task 6: Route Guards & Navigation
**Status:** ⏳ Pending
**File:** `src/utils/campaignRouteGuards.js`

**Functions:**
```javascript
// Check if photo uploaded, redirect if not
requirePhotoUpload(session, router, slug)

// Check if downloaded, redirect if not  
requireDownloadComplete(session, router, slug)

// Check session expiry (24h)
isSessionExpired(timestamp)
```

**Logic:**
- Run guards on page mount (useEffect)
- Redirect to correct page if invalid state
- Show loading during guard checks

---

### ⏳ Task 7: Gallery Post Feature
**Status:** ⏳ Pending
**Location:** Result page modal

**Features:**
- Modal with caption input
- Preview of image
- Submit to Firestore `campaignSupports` collection
- Upload image to Supabase storage
- Increment campaign support count

---

### ⏳ Task 8: Testing & Polish
**Status:** ⏳ Pending

**Test Cases:**
- [ ] Full flow: upload → adjust → result
- [ ] Direct URL access to /adjust (should redirect)
- [ ] Direct URL access to /result (should redirect)
- [ ] Page reload during flow (should preserve state)
- [ ] Session expiry after 24h
- [ ] Browser back button behavior
- [ ] Mobile touch interactions
- [ ] Download tracking works
- [ ] "Start Over" clears everything

---

### ⏳ Task 9: Documentation Updates
**Status:** ⏳ Pending

**Files to Update:**
- [ ] replit.md - Add 3-page flow notes
- [ ] CAMPAIGN_SYSTEM.md - Document architecture
- [ ] TASKS.md - Mark tasks complete

---

## Technical Decisions

### Why React Context + sessionStorage?
- ✅ No external dependencies
- ✅ Survives page reloads
- ✅ Auto-expires naturally
- ✅ Easy to debug (visible in DevTools)

### Why Automatic Redirects?
- ✅ Guides user through flow
- ✅ Prevents broken states
- ✅ Matches competitor UX
- ✅ Better for mobile users

### Why Keep File Objects in Memory?
- ✅ No server storage needed
- ✅ Faster preview rendering
- ✅ Auto cleanup on session end
- ✅ Privacy-friendly

---

## Success Metrics

**User Engagement:**
- Time on site (expected: +30-50%)
- Completion rate (target: >70%)
- Drop-off analysis per step

**Monetization:**
- Ad impressions per visit (target: 3-5x increase)
- Ad viewability rate
- Revenue per visit

**Technical:**
- Page load time (<2s per page)
- Session persistence rate (>95%)
- Error rate (<1%)

---

## Ad Placement Strategy

**Page 1 (Upload):**
- Hero ad below campaign preview
- Sidebar ad (desktop)

**Page 2 (Adjust):**
- Sticky sidebar ad

**Page 3 (Result):**
- Interstitial ad before page loads
- Footer ad below share buttons

---

## Rollout Plan

1. ✅ **Planning** - Write detailed docs
2. 🔄 **Development** - Build all 3 pages + context
3. ⏳ **Testing** - Comprehensive QA
4. ⏳ **Review** - Architect review
5. ⏳ **Launch** - Deploy to production
6. ⏳ **Monitor** - Track metrics for 1 week

---

## Estimated Timeline

- Context & Guards: 1 hour
- Page 1 (Upload): 1 hour
- Page 2 (Adjust): 1.5 hours
- Page 3 (Result): 1 hour
- Gallery Post: 45 min
- Testing: 1 hour
- Documentation: 30 min

**Total: 6-7 hours**

---

## Future Enhancements

**Post-Launch:**
- A/B test 2-page vs 3-page flow
- Add photo filters/effects
- Implement premium features
- Add video tutorials
- Auto-save drafts
- Email download links
- Social login for posting

---

## Previous Campaign System Work

*(All previous tasks moved below for reference)*

---

## 🎯 Pre-Build Tasks

### 1. Add Missing Supabase Validations
**Status:** ✅ Completed

**Description:**
Before users upload campaigns, add security validations to prevent abuse and errors.

**Tasks:**
- [x] Add file size limits (5MB max for campaigns, 10MB for others)
- [x] Add server-side file type validation (PNG, JPG, WEBP for campaigns)
- [x] Added robust validation using Number.isFinite() and positive number checks
- [x] Added empty string validation for fileType

**Files Updated:**
- `src/app/api/storage/upload-url/route.js` - Added required validations
- `src/app/api/storage/campaign-upload-url/route.js` - Added required validations

**Completed:** October 02, 2025

---

## 🐛 Bug Fixes (Pre-Phase 1)

### 1.1. Fix ProfilePage Campaign Display Bugs
**Status:** ✅ Completed

**Description:**
ProfilePage.js has incorrect field mappings when displaying user campaigns.

**Issues Fixed:**
1. **Line 90**: Changed `campaign.frameImageUrl` to `campaign.imageUrl`
   - ✅ Fixed: Now uses correct schema field for thumbnails
   - Campaign images will display correctly when campaigns exist

2. **Line 91**: Changed `campaign.usageCount` to `campaign.supportersCount`
   - ✅ Fixed: Now displays correct supporter count (downloads)
   - Note: We don't track `usageCount` (views/analytics) - only `supportersCount` (total downloads)

**Files Fixed:**
- `src/components/ProfilePage.js` (lines 90-91)

**Completed:** October 02, 2025

---

### 1.2. Firebase Initialization Race Condition
**Status:** ✅ Completed

**Description:**
Firebase is only initialized inside `useFirebaseOptimized()` hook, but `src/lib/firestore.js` exports db and auth as module-level variables that are null until a component mounts.

**Solution Implemented:**
Refactored Firebase initialization to happen at module load time instead of inside React hook:

1. **Module-level initialization**: Firebase now initializes immediately when the module loads (client-side only)
2. **No race conditions**: `db` and `auth` exports are set before any components mount
3. **Simplified hook**: `useFirebaseOptimized()` now just returns already-initialized instances
4. **Cold start protection**: Initialization happens synchronously at module load, preventing "Database not available" errors

**Changes Made:**
- ✅ Moved Firebase initialization from `useEffect` to module-level function `initializeFirebaseModule()`
- ✅ Added immediate initialization call at module load: `initializeFirebaseModule()`
- ✅ Updated `useFirebaseOptimized()` to return already-initialized instances
- ✅ Exports (`auth`, `db`) now available immediately, not null until hook runs

**Files Fixed:**
- `src/lib/firebase-optimized.js` - Complete refactor to module-level initialization

**Completed:** October 02, 2025

---

## 🚀 Phase 1 Build Order

### 2. Priority 1: Create Entry Point
**Status:** ✅ Completed

**Description:**
Created a modal popup where users choose between creating a frame or background campaign.

**Tasks:**
- [x] Create `CreateCampaignModal` component
- [x] Design compact choice cards (Frame vs Background)
- [x] Add visual explanation of differences
- [x] Style to match existing pages with emerald theme
- [x] Add modal triggers in Hero and MobileMenu
- [x] Create `/create` page that opens modal (for direct URL access)
- [x] Handle navigation properly (dismiss vs select)

**Implementation Details:**
- Compact modal design with 2-column grid
- Emerald-themed hover states
- Escape key and backdrop click to close
- Proper body scroll lock when open
- Navigation to `/create/frame` or `/create/background`

**Files Created/Updated:**
- `src/components/CreateCampaignModal.js` - Modal component
- `src/components/Hero.js` - "Create Campaign" button triggers modal
- `src/components/MobileMenu.js` - "Create Campaign" link triggers modal
- `src/app/(chrome)/create/page.js` - Opens modal on direct access

**Completed:** October 02, 2025

---

### 3. Priority 2: Upload Flows
**Status:** ✅ Completed

**Description:**
Build frame and background upload pages with two-step workflow.

**Tasks:**
- [x] Create `/src/app/(chrome)/create/frame/page.js`
- [x] Create `/src/app/(chrome)/create/background/page.js`
- [x] Implement two-step flow: Upload image → Fill details
- [x] Add transparency detection for frames (use `src/utils/transparencyDetector.js`)
- [x] Add image preview components
- [x] Add form validation with error handling
- [x] Implement delayed authentication (allow unauthenticated form filling)
- [x] Create auth popup modal for publish action
- [x] Preserve form state during auth flow
- [x] Connect to Firestore createCampaign function
- [x] Generate slug using `src/utils/slugGenerator.js`
- [x] Upload to Supabase using campaign storage API

**Implementation Details:**
- **Frame Page:** PNG-only upload with automatic transparency validation (min 5%)
- **Background Page:** Accepts PNG, JPG, WEBP (no transparency check)
- **Two-step progress indicator:** Visual steps with color-coded completion
- **Auto-advance:** Moves to step 2 after successful image upload
- **File validation:** 5MB limit with clear error messages
- **Auth modal:** Clean popup with "Go Back" and "Sign In" options
- **Redirect handling:** Preserves destination after sign-in
- **Yellow header + white content card:** Matches onboarding/profile design
- **Responsive layout:** Mobile-first with centered max-w-4xl container

**Design Requirements:**
- ✅ Mobile-first responsive design
- ✅ Clear progress indication (Step 1 of 2, Step 2 of 2)
- ✅ Real-time image preview with aspect ratio preservation
- ✅ Error messages for failed transparency detection
- ✅ Matches existing page styles (yellow header, emerald theme)

**Files Created:**
- `src/app/(chrome)/create/frame/page.js` - Frame upload flow
- `src/app/(chrome)/create/background/page.js` - Background upload flow

**Completed:** October 02, 2025

**Post-Completion Improvements (October 02, 2025):**
- ✅ Fixed missing `userId` parameter in `createCampaign` calls
- ✅ Fixed missing `fileSize` and `fileType` parameters in `getCampaignUploadUrl` 
- ✅ Center-aligned error messages for better UX
- ✅ Changed preview boxes to fixed square (320px height) with `object-contain` to show complete images without cropping
- ✅ Updated field focus styles to match onboarding page (emerald ring, no yellow borders)
- ✅ Added `outline-none` and `transition-all` to all input fields
- ✅ Updated image size recommendations to accept all sizes (no cropping)
- ✅ Increased button height with `py-3` for better proportions
- ✅ Reviewed Firestore security rules - all correctly configured

**Next Steps Suggestion:**
- Test full flow end-to-end on Vercel with real Firebase/Supabase credentials
- Priority 3: Build campaign view page (`/campaign/[slug]`) for visitors to use campaigns

---

### 3.5. Priority 2.5: Missing Prerequisites for Campaign View Page
**Status:** ✅ Completed

**Description:**
Before building the campaign view page (Task #4), we need to create missing backend functions and utilities for fetching campaigns and composing images.

**Missing Items Identified (October 02, 2025):**

#### A. Firestore Function: getCampaignBySlug()
**Status:** ✅ Completed

**Why Needed:**
Campaign view page needs to fetch campaign data by slug from URL parameter `/campaign/[slug]`

**Tasks:**
- [x] Add `getCampaignBySlug(slug)` function to `src/lib/firestore.js`
- [x] Query campaigns collection where `slug === slug`
- [x] Return campaign document with creator info
- [x] Handle 404 case (campaign not found)
- [x] Respect `moderationStatus` (don't show removed campaigns)

**Expected Function Signature:**
```javascript
async function getCampaignBySlug(slug) {
  // Query campaigns collection by slug field
  // Return { campaign, creator } or null if not found
}
```

**Implementation Notes:**
- Use Firestore `where('slug', '==', slug)` query
- Join with creator's user profile data
- Check `moderationStatus !== 'removed'`
- Cache results if needed (optional optimization)

---

#### B. Canvas Composition Utility: imageComposition.js
**Status:** ✅ Completed

**Why Needed:**
Campaign view page needs to overlay/underlay user photos with campaign images

**Tasks:**
- [x] Create `src/utils/imageComposition.js` utility file
- [x] Implement `composeImages(userPhoto, campaignImage, adjustments, type)` function
- [x] Handle Frame type: User photo UNDER frame (frame on top)
- [x] Handle Background type: User photo ON TOP of background
- [x] Apply adjustments: scale (zoom), x position, y position
- [x] Export composed image as downloadable PNG/JPG
- [x] Add image quality/format options

**Expected Functions:**
```javascript
// Main composition function
async function composeImages(userPhotoFile, campaignImageUrl, adjustments, campaignType) {
  // adjustments = { scale: 1.0, x: 0, y: 0 }
  // campaignType = 'frame' | 'background'
  // Returns: Canvas element or Blob for download
}

// Helper: Load image from URL/File
function loadImage(source) { }

// Helper: Apply transformations
function applyAdjustments(canvas, ctx, img, adjustments) { }

// Helper: Export canvas to downloadable format
function exportCanvas(canvas, format = 'png') { }
```

**Implementation Notes:**
- Use native Canvas API (no external libraries needed)
- Frame composition: Draw user photo first, then frame on top
- Background composition: Draw background first, then user photo on top
- Handle aspect ratios correctly (letterbox/pillarbox if needed)
- Provide high-quality export (avoid compression artifacts)
- Clean up resources (revokeObjectURL) to prevent memory leaks

**Algorithm (Frame Type):**
1. Create canvas matching campaign image dimensions
2. Draw user photo (scaled/positioned per adjustments)
3. Draw frame image on top (covers user photo where not transparent)
4. Export as PNG to preserve transparency

**Algorithm (Background Type):**
1. Create canvas matching campaign image dimensions
2. Draw background image first (full canvas)
3. Draw user photo on top (scaled/positioned per adjustments)
4. Export as PNG or JPG

---

**Priority:** 🔴 HIGH - Blocking Task #4

**Estimated Time:** 45-60 minutes total
- getCampaignBySlug: 15-20 minutes
- imageComposition.js: 30-40 minutes

**Completion Criteria:**
- [x] getCampaignBySlug returns campaign data correctly
- [x] imageComposition.js composes frames correctly (photo under frame)
- [x] imageComposition.js composes backgrounds correctly (photo over background)
- [x] Adjustments (zoom, move) work smoothly
- [x] Export produces high-quality downloadable images
- [x] All functions documented with JSDoc

**Files Created:**
- `src/lib/firestore.js` - Added `getCampaignBySlug()` function (lines 527-593)
- `src/utils/imageComposition.js` - Complete Canvas composition utility with helpers

**Completed:** October 02, 2025

---

### 4. Priority 3: Campaign View Page
**Status:** ✅ Completed → 🔄 Being Refactored to 3-Page Flow

**Description:**
Build individual campaign page for viewing and using campaigns.

**Original Implementation (Single Page):**
- [x] Create `/src/app/(chrome)/campaign/[slug]/page.js`
- [x] Show campaign details and creator info
- [x] Add visitor upload interface
- [x] Build image adjustment controls (zoom, move, fit)
- [x] Implement Canvas-based image composition
- [x] Add real-time preview canvas
- [x] Add download button (disabled until user photo uploaded)
- [x] Add sharing options integration
- [x] Track usage with secure server-side API
- [x] Increment supportersCount on download
- [x] Add report button (Phase 1 requirement)

**Refactoring to 3-Page Flow (October 03, 2025):**
- 🔄 Split into 3 separate pages (upload, adjust, result)
- 🔄 Add session state management (Context + sessionStorage)
- 🔄 Implement route guards and navigation
- 🔄 Add progress indicators
- 🔄 Prepare ad placement slots

**Design Requirements:**
- ✅ Mobile-first responsive design
- ✅ Canvas-based composition (Frame: overlay, Background: underlay)
- ✅ Intuitive adjustment controls
- ✅ Match existing page styles
- ✅ Yellow header + white content cards
- ✅ Global button styling

**Files Created/Updated:**
- `src/app/(chrome)/campaign/[slug]/page.js` - Campaign page (refactored Oct 03, 2025)
- `src/app/api/campaigns/track-download/route.js` - Download tracking API
- `src/components/ProfilePage.js` - Calculates total supports from campaigns
- `src/lib/firebaseAdmin.js` - Added `adminFirestore()` export

**Completed (Original):** October 02, 2025
**Refactored:** October 03, 2025 - Now supports consistent styling
**In Progress:** October 03, 2025 - Converting to 3-page flow

---

### 5. Priority 4: Discovery Pages
**Status:** ⏳ Pending

**Description:**
Build campaigns gallery and top creators leaderboard.

**Tasks:**

**Campaigns Gallery (`/campaigns`):**
- [ ] Create `/src/app/(chrome)/campaigns/page.js`
- [ ] Fetch campaigns from Firestore
- [ ] Add filters: Country, Time Period, Type (Frame/Background)
- [ ] Add sorting: Top performing, Most recent, Trending
- [ ] Build grid layout with campaign cards
- [ ] Show campaign type badges

**Top Creators Leaderboard (`/creators`):**
- [ ] Create `/src/app/(chrome)/creators/page.js`
- [ ] Aggregate creator stats from Firestore
- [ ] Add filters: Country, Time Period
- [ ] Show: Avatar, name, campaign count, total supporters
- [ ] Add links to creator profiles
- [ ] Build leaderboard layout

**Design Requirements:**
- Mobile-first responsive design
- Grid layouts with cards
- Filter dropdowns/buttons
- Match existing page styles

**Estimated Time:** 45-60 minutes

---

## Status Legend

- ⏳ **Pending** - Not started
- 🔄 **In Progress** - Currently working on
- ✅ **Completed** - Done and tested
- ⏸️ **Blocked** - Waiting on something
- ❌ **Cancelled** - Not needed anymore

---

Last Updated: October 03, 2025
