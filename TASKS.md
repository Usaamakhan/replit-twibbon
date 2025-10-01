# Campaign System - Task Tracker

Track progress on building the campaign system (Phase 1 from CAMPAIGN_SYSTEM.md)

**Last Updated:** October 01, 2025

---

## 🎯 Pre-Build Tasks

### 1. Add Missing Supabase Validations
**Status:** ⏳ Pending

**Description:**
Before users upload campaigns, add security validations to prevent abuse and errors.

**Tasks:**
- [ ] Add file size limits (5MB max for campaigns)
- [ ] Add server-side file type validation
- [ ] Test validation with oversized files
- [ ] Test validation with wrong file types

**Files to Update:**
- `src/app/api/storage/upload-url/route.js`
- `src/app/api/storage/campaign-upload-url/route.js`

**Estimated Time:** 5-10 minutes

---

## 🚀 Phase 1 Build Order

### 2. Priority 1: Create Entry Point
**Status:** ⏳ Pending

**Description:**
Build the `/create` page where users choose between creating a frame or background campaign.

**Tasks:**
- [ ] Create `/src/app/(chrome)/create/page.js`
- [ ] Design choice cards (Frame vs Background)
- [ ] Add visual explanation of differences
- [ ] Style to match existing pages (mobile-first)
- [ ] Add navigation links in Header/Hero

**Design Requirements:**
- Clean visual cards showing frame vs background
- Mobile-first responsive design
- Match existing profile page styles
- Use existing components (Header, Footer)

**Estimated Time:** 15-20 minutes

---

### 3. Priority 2: Upload Flows
**Status:** ⏳ Pending

**Description:**
Build frame and background upload pages with two-step workflow.

**Tasks:**
- [ ] Create `/src/app/(chrome)/create/frame/page.js`
- [ ] Create `/src/app/(chrome)/create/background/page.js`
- [ ] Implement two-step flow: Upload image → Fill details
- [ ] Add transparency detection for frames (use `src/utils/transparencyDetector.js`)
- [ ] Add image preview components
- [ ] Add form validation with error handling
- [ ] Implement delayed authentication (allow unauthenticated form filling)
- [ ] Create auth popup modal for publish action
- [ ] Preserve form state during auth flow
- [ ] Connect to Firestore createCampaign function
- [ ] Generate slug using `src/utils/slugGenerator.js`
- [ ] Upload to Supabase using campaign storage API

**Design Requirements:**
- Mobile-first responsive design
- Clear progress indication (Step 1 of 2, Step 2 of 2)
- Real-time image preview
- Error messages for failed transparency detection
- Match existing page styles

**Estimated Time:** 45-60 minutes

---

### 4. Priority 3: Campaign View Page
**Status:** ⏳ Pending

**Description:**
Build individual campaign page for viewing and using campaigns.

**Tasks:**
- [ ] Create `/src/app/(chrome)/campaign/[slug]/page.js`
- [ ] Show campaign details and creator info
- [ ] Add visitor upload interface
- [ ] Build image adjustment controls (zoom, move, fit)
- [ ] Implement Canvas-based image composition
- [ ] Add real-time preview canvas
- [ ] Add download button (disabled until user photo uploaded)
- [ ] Add sharing options integration
- [ ] Track usage with `trackCampaignUsage` function
- [ ] Increment supportersCount on download
- [ ] Add report button (Phase 1 requirement)

**Design Requirements:**
- Mobile-first responsive design
- Canvas-based composition (Frame: overlay, Background: underlay)
- Intuitive adjustment controls
- Match existing page styles

**Estimated Time:** 60-90 minutes

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
