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
**Status:** ❌ Not Fixed

**Current Frame Schema (`src/lib/firestore.js` createFrame):**
```javascript
{
  ...frameData,
  createdBy: userId,
  createdAt: timestamp,
  updatedAt: timestamp,
  usageCount: 0,
  supporters: {},
  isPublic: true
}
```

**Documentation Campaign Schema Requires:**
- [ ] `type: "frame" | "background"` - NOT in current schema
- [ ] `title: string` - NOT in current schema
- [ ] `description: string` - NOT in current schema
- [ ] `slug: string` - NOT in current schema
- [ ] `imageUrl: string` - NOT in current schema
- [ ] `captionTemplate: string` - NOT in current schema
- [ ] `reportsCount: 0` - NOT in current schema
- [ ] `moderationStatus: "active"` - NOT in current schema
- [ ] `firstUsedAt: timestamp` - NOT in current schema
- [ ] Rename `createdBy` → `creatorId` for consistency

**Files to Update:**
- [ ] `src/lib/firestore.js` - createFrame function (line 412-455)
- [ ] Update all components that use frame data

---

## 🟡 MEDIUM PRIORITY (Needed for Phase 1 Features)

### 4. Missing `reports` Collection
**Status:** ❌ Not Implemented

**Current Status:**
- No `reports` collection exists
- No report creation/management functions

**Documentation Requires:**
```javascript
{
  id: "auto-generated",
  campaignId: string,
  reportedBy: string,
  reason: "inappropriate" | "copyright" | "spam" | "other",
  description: string,
  status: "pending" | "reviewed" | "dismissed" | "actioned",
  createdAt: timestamp,
  reviewedAt: timestamp | null,
  reviewedBy: string | null
}
```

**Tasks:**
- [ ] Add `createReport()` function to firestore.js
- [ ] Add `getReports()` function for admin
- [ ] Add `updateReportStatus()` function
- [ ] Create report submission UI component
- [ ] Add report button to campaign pages

---

### 5. Slug Generation Not Implemented
**Status:** ❌ Not Implemented

**Documentation Specifies:**
- Format: `{title-slug}-{random-suffix}`
- Example: `save-earth-2025-k8m3`
- Random suffix: 4-character alphanumeric

**Tasks:**
- [ ] Create `src/utils/slugGenerator.js`
- [ ] Implement `generateSlug(title)` function
- [ ] Add slug uniqueness check in Firestore
- [ ] Integrate into campaign creation flow
- [ ] Add slug to campaign schema

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
**Status:** ⚠️ Different (Current is Better)

**Current Implementation (Better):**
```javascript
supporters: {
  "userId1": timestamp,
  "userId2": timestamp
}
supportersCount: number  // Calculated from supporters object
```
- Tracks individual supporters with timestamps
- Enables supporter analytics
- Prevents duplicate counting

**Documentation Shows (Simpler):**
```javascript
supportersCount: 0  // Just a counter
```

**Recommendation:**
- ✅ Keep current implementation (more detailed)
- [ ] Update documentation to reflect actual implementation
- Current approach enables features like:
  - "See who supported this campaign"
  - "When did user X support this?"
  - Better analytics

---

## 📝 Summary Checklist

**Critical Path to Phase 1:**
- [x] Resolve frames/campaigns naming (Issue #1) ✅ FIXED
- [ ] Fix storage bucket structure (Issue #2)
- [ ] Add missing campaign schema fields (Issue #3)
- [ ] Implement slug generation (Issue #5)
- [ ] Implement transparency detection (Issue #6)
- [ ] Create reports collection & functions (Issue #4)

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
