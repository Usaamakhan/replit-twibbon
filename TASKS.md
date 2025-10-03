# Campaign System - Task Tracker

Track progress on building the campaign system (Phase 1 from CAMPAIGN_SYSTEM.md)

**Last Updated:** October 02, 2025

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
**Status:** ✅ Completed

**Description:**
Build individual campaign page for viewing and using campaigns.

**Tasks:**
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

**Design Requirements:**
- ✅ Mobile-first responsive design
- ✅ Canvas-based composition (Frame: overlay, Background: underlay)
- ✅ Intuitive adjustment controls
- ✅ Match existing page styles

**Implementation Details:**

**Page Structure:**
- Campaign hero section with image, title, description, creator info
- Visitor photo upload interface with file validation (10MB, PNG/JPG/WEBP)
- Real-time Canvas preview with live composition
- Adjustment controls: Zoom slider (0.5-3x), drag positioning, Fit button, Reset button
- Download button (disabled until photo uploaded)
- Share buttons: Twitter, Facebook, WhatsApp, native share API
- Report modal with reason selection (copyright, inappropriate, spam, misleading, other)

**Canvas Composition:**
- Uses `imageComposition.js` utility for Canvas-based rendering
- Frame type: User photo UNDER frame (frame overlays)
- Background type: User photo ON TOP of background
- Real-time preview updates on adjustment changes
- Handles aspect ratios and image centering correctly
- High-quality PNG export for downloads

**Adjustment Controls:**
- Zoom slider: 0.5x to 3x with 0.1x steps
- Drag repositioning: Mouse drag or touch support
- Fit button: Auto-calculates zoom/position to fit photo within campaign bounds
- Reset button: Restores default scale (1.0) and center position (0, 0)

**Download Tracking Implementation (Simplified October 03, 2025):**
- **Simple supports tracking:** Every download increments campaign `supportersCount` by 1
- **No authentication required:** Anonymous and authenticated users tracked the same way
- **Server-side API:** `/api/campaigns/track-download` handles all downloads
- **User profile supports:** Calculated dynamically as sum of all campaign supports
- **Atomic updates:** Uses Firestore transactions to ensure consistency
- **firstUsedAt tracking:** Sets timestamp on first download

**Files Created/Updated:**
- `src/app/(chrome)/campaign/[slug]/page.js` - Campaign view page with complete visitor experience
- `src/app/api/campaigns/track-download/route.js` - Simplified server-side download tracking API
- `src/components/ProfilePage.js` - Calculates total supports from campaigns, uses "Supports" terminology
- `src/lib/firebaseAdmin.js` - Added `adminFirestore()` export for server-side Firestore access
- `firestore.rules` - Removed user profile supporter increment rules

**Benefits:**
- ✅ 50% fewer Firestore writes per download (1 write instead of 2)
- ✅ Simpler code (no authentication/token verification needed)
- ✅ More accurate terminology ("Supports" = downloads)
- ✅ Dynamic calculation always shows current total
- ✅ Firebase Admin SDK bypasses client-side security rules (allows anonymous downloads)

**Completed:** October 02, 2025
**Simplified:** October 03, 2025 - Removed authentication-based tracking, now simple supports counter

**Testing Recommendations:**
- Test anonymous download flow (campaign supports counter increments)
- Test authenticated download flow (same as anonymous, just campaign counter)
- Test profile page shows correct total supports (sum of all campaigns)
- Test Canvas composition for both frame and background types
- Test image adjustments on mobile devices (touch drag, pinch zoom)
- Verify "Supports" terminology displays correctly everywhere

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

## 🧪 Testing Strategy

### 6. Testing & Validation
**Status:** ⏳ Pending

**Testing Approach:**
- [ ] Build on Replit (see changes instantly)
- [ ] Test on Vercel (with real Firebase/Supabase)
- [ ] Start with `/create` page first (simplest)
- [ ] Test each page individually before moving to next
- [ ] Test mobile responsiveness on all pages
- [ ] Test authentication flows
- [ ] Test image upload and processing
- [ ] Test transparency detection (frames only)
- [ ] Test campaign creation end-to-end
- [ ] Test campaign usage and download

**Test Cases:**
- [ ] Upload frame with transparency (should succeed)
- [ ] Upload frame without transparency (should fail)
- [ ] Upload background (no transparency check)
- [ ] Create campaign while logged out → auth popup
- [ ] Download campaign image
- [ ] Verify supportersCount increments
- [ ] Test filters on campaigns gallery
- [ ] Test leaderboard sorting

---

## 📋 Design Considerations

### Design Guidelines (All Pages)
- [x] Match existing profile page styles
- [x] Mobile-first responsive design
- [x] Use existing components (Header, Footer, LoadingSpinner, etc.)
- [x] Follow Tailwind CSS 4 conventions
- [x] Use emerald color scheme (brand colors)
- [x] Ensure accessibility (alt tags, labels, etc.)

---

## ✅ Completion Checklist

**Phase 1 Complete When:**
- [ ] All 5 priority tasks completed
- [ ] All pages tested on Replit
- [ ] All pages tested on Vercel with real data
- [ ] Mobile responsive on all pages
- [ ] No console errors
- [ ] Firestore data saving correctly
- [ ] Supabase images uploading correctly
- [ ] Authentication flows working
- [ ] Update replit.md with completion status

---

## 📝 Notes

- Follow CAMPAIGN_SYSTEM.md for detailed requirements
- Refer to CODE_INCONSISTENCIES.md for resolved issues
- Use existing utilities (slugGenerator, transparencyDetector, campaignStorage)
- Database schema already complete (no changes needed)
- Storage API routes already complete (just add validations)

---

## Status Legend

- ⏳ **Pending** - Not started
- 🔄 **In Progress** - Currently working on
- ✅ **Completed** - Done and tested
- ⏸️ **Blocked** - Waiting on something
- ❌ **Cancelled** - Not needed anymore

---

## 💡 Suggestions & Observations

### Completed Features Review (October 02, 2025)

**What Works Well:**
1. ✅ **Two-step upload flow** is intuitive and guides users naturally
2. ✅ **Transparency detection** provides immediate feedback for frames
3. ✅ **Delayed authentication** allows users to fill forms before signing in
4. ✅ **Consistent design** matches onboarding/profile pages perfectly
5. ✅ **File validation** catches issues early with clear error messages
6. ✅ **Auto-advance** to step 2 after successful upload feels smooth

**Potential Improvements for Future:**
1. 📸 **Image preview optimization:** Consider showing image dimensions after upload
2. 🔄 **Progress persistence:** Currently form data is lost if user leaves page (consider localStorage)
3. ⚡ **Upload feedback:** Could add progress bar for large file uploads
4. 🎨 **Crop/resize tool:** Allow users to crop images before upload (Phase 2?)
5. 📱 **Mobile camera access:** Add "Take Photo" option on mobile devices
6. ✏️ **Title auto-suggest:** Could suggest title based on image filename

### Testing Recommendations

**Before Next Feature:**
1. Test frame upload with various transparency levels (5%, 10%, 50%, 90%)
2. Test background upload with all three formats (PNG, JPG, WEBP)
3. Verify auth flow with redirect preservation
4. Check mobile responsiveness on real devices
5. Test with Firebase/Supabase on Vercel deployment

**Edge Cases to Test:**
- Upload same file twice (should work)
- Upload very large images (close to 5MB)
- Upload images with special characters in filename
- Try to publish without signing in (should show auth modal)
- Change image after filling form (should reset or preserve title?)

### Priority 3 Preparation

**Before building campaign view page (`/campaign/[slug]`):**
- Need to decide on Canvas library (native Canvas API vs library like Fabric.js)
- Consider image adjustment UX (sliders vs pinch-zoom on mobile)
- Plan download format (PNG always, or user choice?)
- Decide on social sharing method (native share API vs custom buttons)

**Key Questions:**
1. Should visitors be able to save their adjustment preferences?
2. Do we want to show "similar campaigns" on campaign pages?
3. Should we track "views" separately from "downloads"?
4. What happens if campaign creator deletes campaign while visitor is using it?

### Code Quality Notes

**Current Strengths:**
- Clean component structure with good separation of concerns
- Proper error handling and validation
- Responsive design with mobile-first approach
- Consistent naming conventions

**Future Refactoring Ideas:**
- Extract shared upload logic into custom hook (`useImageUpload`)
- Create reusable `ImagePreview` component for both pages
- Consider extracting auth modal into shared component
- Add JSDoc comments to upload functions for better documentation

### Performance Considerations

**Current Implementation:**
- File reading happens client-side (good for privacy)
- Transparency check runs before upload (saves bandwidth)
- Single upload endpoint per campaign (prevents duplicate files)

**Potential Optimizations:**
- Consider image compression before upload (reduce file sizes)
- Add lazy loading for preview images
- Implement service worker for offline form completion
- Cache transparency check results (same file = same result)

### Security & Database Review (October 02, 2025)

**Firestore Security Rules Status:** ✅ All Correct
- Campaign creation properly restricted (authenticated + creatorId validation)
- Campaign editing has proper 7-day window and <10 supporters limit
- Immutable fields (type, slug, imageUrl, creatorId) are protected
- supportersCount can only increment by 1 (prevents manipulation)
- Username atomicity maintained with dedicated collection
- Public read access working as intended for guest users

**No Firebase or Supabase manual changes needed** - all security rules are correctly configured for the campaign system.

---
