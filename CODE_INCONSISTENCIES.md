# Code/Documentation Inconsistencies Tracking

This document tracks all inconsistencies between the current codebase and CAMPAIGN_SYSTEM.md documentation. Update checkboxes as issues are resolved.

**Last Updated:** September 30, 2025

---

## 🔴 HIGH PRIORITY (Breaks Current Functionality)

### 1. Collection Names Mismatch
**Status:** ✅ FIXED (September 30, 2025)

**Resolution:**
- Changed all Firestore collection references from `frames` to `campaigns`
- Renamed all related functions for consistency:
  - `createFrame` → `createCampaign`
  - `getUserFrames` → `getUserCampaigns`
  - `getPublicFrames` → `getPublicCampaigns`
  - `trackFrameUsage` → `trackCampaignUsage`

**Files Updated:**
- [x] `src/lib/firestore.js` - all collection references updated to 'campaigns'
  - Line 428: `collection(db, 'campaigns')`
  - Line 463: `collection(db, 'campaigns')`
  - Line 495: `collection(db, 'campaigns')`
  - Line 613: `doc(db, 'campaigns', campaignId)`
- [x] `src/components/ProfilePage.js` - updated to use `getUserCampaigns`
- [x] `firestore.rules` - updated security rules from 'frames' to 'campaigns'
  - Line 65: `match /campaigns/{campaignId}`
- [x] All function names updated to use "campaign" terminology

**Firestore Collection Structure:**
- Collection is now: `campaigns`
- Ready to store both frames AND backgrounds
- Will use `type: "frame" | "background"` field (to be added in issue #3)

---

### 2. Storage Bucket Structure & Profile Image Upload
**Status:** ✅ FIXED (October 1, 2025)

**Resolution:**
- Chose **Option 1**: Keep single `uploads` bucket and add `campaigns` as new folder
- Added `'campaigns'` to allowed folders in all storage API files
- Fixed profile/banner image upload bug (was saving base64 to Firestore)
- Profile/banner images now properly upload to Supabase Storage

**Implementation Details:**
- Bucket name: `uploads` (unchanged - single bucket approach)
- New folder structure: `campaigns/{userId}/{timestamp}-{filename}` added
- All folders: `uploads/`, `profile-images/`, `documents/`, `temp/`, `campaigns/`
- Profile/banner images now use `uploadFile()` from `src/lib/supabase.js`
- Firestore stores URLs only (not base64 data URLs anymore)

**Files Updated:**
- [x] `src/app/api/storage/upload-url/route.js` - added 'campaigns' to allowedFolders (line 35)
- [x] `src/app/api/storage/list/route.js` - added 'campaigns' to allowedFolders (line 38)
- [x] `src/app/api/storage/signed-url/route.js` - added campaigns prefix to allowedPrefixes (line 44)
- [x] `src/app/api/storage/delete/route.js` - added campaigns prefix to allowedPrefixes (line 44)
- [x] `src/app/(chrome)/profile/edit/page.js` - fixed base64 bug, now uploads to Supabase
- [x] `src/app/onboarding/page.js` - fixed base64 bug, now uploads to Supabase

**Benefits:**
- ✅ Campaign storage ready for implementation
- ✅ No manual Supabase bucket creation needed
- ✅ Profile/banner images properly stored in Supabase
- ✅ Reduced Firestore storage costs (no more base64 bloat)
- ✅ Faster profile page loads (images served from Supabase CDN)

---

### 3. Campaign/Frame Data Schema Missing Fields
**Status:** ✅ FIXED (October 1, 2025)

**Resolution:**
- Updated campaign schema to match CAMPAIGN_SYSTEM.md documentation
- Renamed `createdBy` → `creatorId` throughout codebase
- Added all required fields with validation
- Updated security rules to enforce schema

**New Campaign Schema (`src/lib/firestore.js` createCampaign):**
```javascript
{
  // Required fields
  type: "frame" | "background",
  title: string,
  slug: string,
  imageUrl: string,
  creatorId: userId,
  
  // Optional metadata
  description: string,
  captionTemplate: string,
  
  // Counters
  supportersCount: 0,
  supporters: {},
  usageCount: 0,
  reportsCount: 0,
  
  // Status
  moderationStatus: "active",
  isPublic: true,
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  // firstUsedAt (added on first download)
}
```

**Files Updated:**
- [x] `src/lib/firestore.js` - Explicit schema with all required fields (lines 437-463)
- [x] `src/lib/firestore.js` - Added validation for required fields (lines 421-431)
- [x] `src/lib/firestore.js` - Renamed `createdBy` → `creatorId` in createCampaign (line 443)
- [x] `src/lib/firestore.js` - Updated getUserCampaigns query to use `creatorId` (line 522)
- [x] `src/lib/firestore.js` - Updated trackCampaignUsage to use `creatorId` (line 647)
- [x] `firestore.rules` - Updated campaign creation rules with field validation (lines 67-72)
- [x] `firestore.rules` - Updated ownership checks to use `creatorId` (line 75)

---

## 🟡 MEDIUM PRIORITY (Needed for Phase 1 Features)

### 4. Missing `reports` Collection
**Status:** ✅ FIXED (October 1, 2025)

**Resolution:**
- Created complete reports collection with all required functions
- Added security rules for anonymous reporting
- Implemented auto-moderation (3+ reports = under-review)
- Ready for UI integration

**Reports Schema (`src/lib/firestore.js`):**
```javascript
{
  id: "auto-generated",
  campaignId: string,
  campaignSlug: string,
  reportedBy: string | "anonymous",
  reason: "inappropriate" | "spam" | "copyright" | "other",
  details: string,
  status: "pending" | "reviewed" | "resolved" | "dismissed",
  createdAt: timestamp,
  reviewedAt: timestamp | null,
  reviewedBy: string | null,
  action: "removed" | "warned" | "no-action" | null
}
```

**Functions Implemented:**
- [x] `createReport(reportData)` - Submit new report (lines 690-759)
  - Validates required fields and reason
  - Increments campaign's reportsCount
  - Auto-flags campaign as "under-review" if 3+ reports
  - Allows anonymous reporting
  
- [x] `getReports(filterOptions)` - Get all reports with filters (lines 762-809)
  - Filter by status, campaignId
  - Sort by creation date (newest first)
  - Supports pagination with limit
  
- [x] `getCampaignReports(campaignId, limit)` - Get reports for specific campaign (lines 812-814)
  
- [x] `updateReportStatus(reportId, statusData)` - Update report status (lines 817-869)
  - Change status (pending, reviewed, resolved, dismissed)
  - Record action taken (removed, warned, no-action)
  - Track who reviewed and when

**Security Rules Added:**
- [x] `firestore.rules` - Reports collection rules (lines 91-105)
  - Allow anonymous report creation
  - Validate required fields and reason
  - Only authenticated users can read/update (admin check in app layer)
  - No deletion allowed

**Next Steps (UI Implementation):**
- [ ] Create report submission modal component
- [ ] Add report button to campaign pages
- [ ] Create admin dashboard for report management

---

### 5. Slug Generation Not Implemented
**Status:** ✅ FIXED (October 1, 2025)

**Resolution:**
- Created slug generation utility with complete implementation
- Follows algorithm from CAMPAIGN_SYSTEM.md exactly
- No uniqueness check needed (collision probability extremely low)
- Ready for integration into campaign creation

**Implementation (`src/utils/slugGenerator.js`):**

**Algorithm:**
1. Convert title to lowercase
2. Trim and remove special characters (keep letters, numbers, hyphens)
3. Replace spaces with hyphens
4. Limit base slug to 50 characters
5. Append 4-character random suffix (base36: 0-9, a-z)

**Functions Created:**
- [x] `generateSlug(title)` - Main slug generation function
  - Example: `"Save Earth 2025"` → `"save-earth-2025-k8m3"`
  - Example: `"My Frame!"` → `"my-frame-a7b2"`
  - Handles edge cases (empty string, special chars only)
  - Max base slug length: 50 characters
  
- [x] `generateRandomSuffix()` - Internal helper for 4-char random suffix
  - Uses Math.random().toString(36) for base36 encoding
  - Pads with zeros if needed to ensure 4 characters
  
- [x] `isValidSlug(slug)` - Validation helper
  - Checks slug format matches pattern
  - Validates lowercase letters, numbers, hyphens only
  - Ensures ends with 4-character suffix

**Key Features:**
- ✅ No uniqueness check needed (per CAMPAIGN_SYSTEM.md)
- ✅ Collision probability extremely low (~1.7 million combinations)
- ✅ URL-safe characters only
- ✅ Handles edge cases gracefully
- ✅ Fully documented with JSDoc comments

**Integration Notes:**
- Import in campaign creation: `import { generateSlug } from '@/utils/slugGenerator'`
- Use: `const slug = generateSlug(campaignTitle)`
- Slug is already a required field in campaign schema (Issue #3)

---

### 6. Transparency Detection Not Implemented
**Status:** ❌ Not Implemented

**Documentation Specifies:**
- Canvas API-based detection
- 5-10% minimum transparency threshold
- Frame validation before upload

**Tasks:**
- [ ] Create `src/utils/transparencyDetector.js`
- [ ] Implement Canvas-based pixel analysis
- [ ] Add validation to upload flow
- [ ] Display error if transparency too low
- [ ] Add `hasTransparency: boolean` to schema

---

### 7. Storage Path Structure for Campaigns
**Status:** ❌ Not Aligned

**Current Paths:**
- Profile images: `profile-images/{userId}/{timestamp}-{filename}`
- Generic uploads: `uploads/{userId}/{timestamp}-{filename}`

**Documentation Needs:**
- Campaign images: `campaigns/{userId}/{campaignId}.png`

**Tasks:**
- [ ] Add campaign-specific upload endpoint
- [ ] Validate campaignId format
- [ ] Update path structure to match docs
- [ ] Add campaign cleanup on deletion

---

## 🟢 LOW PRIORITY (Phase 2 / Admin Features)

### 8. User Profile Missing Admin Role Field
**Status:** ❌ Not Implemented

**Current User Schema (`src/lib/firestore.js` createUserProfile):**
- No `role` field exists

**Documentation Needs (line 785-790):**
```javascript
{
  uid: "user-id",
  email: "user@example.com",
  displayName: "User Name",
  role: "admin" | "user",  // NEW field needed
  ...other fields
}
```

**Tasks:**
- [ ] Add `role: "user"` default to createUserProfile (line 163-178)
- [ ] Add `role` to allowed update fields (line 305)
- [ ] Create admin assignment function
- [ ] Update middleware for admin route protection
- [ ] Test admin access control

---

### 9. Firebase Admin Missing Firestore Access
**Status:** ❌ Not Implemented

**Current `src/lib/firebaseAdmin.js`:**
- Only has Auth: `getAuth(adminApp)` (line 45)
- No Firestore Admin export

**Documentation Needs:**
- Server-side Firestore for admin operations
- Query reports collection server-side
- Moderate campaigns server-side

**Tasks:**
- [ ] Add `import { getFirestore } from 'firebase-admin/firestore'`
- [ ] Export `adminFirestore = getFirestore(adminApp)`
- [ ] Use in admin API routes

---

### 10. Admin Dashboard Files Not Created
**Status:** ❌ Not Implemented (Phase 2)

**Documentation Specifies (lines 696-803):**
- Admin pages under `src/app/(chrome)/admin/`
- Admin API routes under `src/app/api/admin/`
- Admin components under `src/components/admin/`
- Admin utilities under `src/utils/admin/`

**Tasks (Phase 2):**
- [ ] Create admin layout and pages
- [ ] Create admin API routes
- [ ] Create admin components
- [ ] Implement middleware protection
- [ ] Add admin utilities

---

## 📊 Counter Fields: Terminology Inconsistency

### 11. Mixed "Frames" and "Campaigns" Terminology
**Status:** ✅ FIXED (October 1, 2025)

**Resolution:**
- Removed `framesUsed` counter completely (not needed)
- Renamed `framesCreated` to `campaignsCreated` for consistency
- Standardized on "campaigns" terminology throughout

**Updated User Profile Counters:**
- `campaignsCreated` - number of campaigns created (renamed from framesCreated)
- `campaignsCount` - total campaigns count
- `supportersCount` - unique supporters
- ~~`framesUsed`~~ - REMOVED (no longer tracked)

**Files Updated:**
- [x] `src/lib/firestore.js` - all counter references updated
  - Line 178: User profile initialization uses `campaignsCreated`
  - Line 227, 284: getUserProfile functions return `campaignsCreated`
  - Line 389-407: getUserStats updated to new field names
  - Line 441: createCampaign increments `campaignsCreated`
  - Removed all `framesUsed` increment logic
- [x] `firestore.rules` - security rules updated
  - Lines 39-47: Updated allowed fields and validation rules

---

## 🔄 Data Structure Differences

### 12. Supporters Tracking: Implementation vs Documentation
**Status:** ✅ FIXED (October 1, 2025)

**Resolution:**
- Kept the better implementation with detailed supporter tracking
- Added `supportersCount` field for documentation compatibility
- Both fields are now maintained automatically

**Final Implementation (Best of Both):**
```javascript
supporters: {
  "userId1": timestamp,
  "userId2": timestamp
}
supportersCount: number  // Auto-incremented counter
```
- Tracks individual supporters with timestamps (detailed analytics)
- Maintains supportersCount for quick queries (documentation compliance)
- Enables supporter analytics and prevents duplicate counting

**Files Updated:**
- [x] `src/lib/firestore.js` - Added `supportersCount: 0` to campaign creation (line 432)
- [x] `src/lib/firestore.js` - Auto-increment `supportersCount` in `trackCampaignUsage` (line 633)
- [x] `firestore.rules` - Added `supportersCount` to allowed update fields (line 74, 78-79)

**Benefits:**
- ✅ Documentation compatibility (has supportersCount field)
- ✅ Detailed tracking (supporters object with timestamps)
- ✅ Quick queries (supportersCount for sorting/filtering)
- ✅ Analytics ready ("See who supported this campaign")
- ✅ Prevents duplicate counting automatically

---

## 📝 Summary Checklist

**Critical Path to Phase 1:**
- [x] Resolve frames/campaigns naming (Issue #1) ✅ FIXED
- [x] Fix storage bucket structure (Issue #2) ✅ FIXED
- [x] Add missing campaign schema fields (Issue #3) ✅ FIXED
- [x] Create reports collection & functions (Issue #4) ✅ FIXED
- [x] Implement slug generation (Issue #5) ✅ FIXED
- [ ] Implement transparency detection (Issue #6)

**Phase 2 Prerequisites:**
- [ ] Add admin role field (Issue #8)
- [ ] Add Firestore Admin (Issue #9)
- [ ] Create admin dashboard (Issue #10)

**Ongoing Cleanup:**
- [x] Standardize terminology (Issue #11) ✅ FIXED
- [ ] Update documentation (Issue #12)

---

## 🎯 Recommended Next Steps

1. **Decision Meeting:** Choose `frames` vs `campaigns` naming
2. **Schema Update:** Add all missing fields to frame/campaign documents
3. **Storage Migration:** Set up campaigns bucket in Supabase
4. **Feature Implementation:** Slug generation + transparency detection
5. **Testing:** Verify all changes work together

---

**Notes:**
- Check off items with `[x]` as they are completed
- Update file paths if they change
- Add notes for any decisions made
- Link to related commits/PRs when fixing issues
