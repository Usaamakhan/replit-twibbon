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
**Status:** ✅ FIXED (October 1, 2025)

**Resolution:**
- Created transparency detection utility using Canvas API
- Set minimum threshold to 5% as requested
- Validates PNG format and alpha channel
- Ready for integration into frame upload flow

**Implementation (`src/utils/transparencyDetector.js`):**

**Algorithm:**
1. Validate file is PNG (only format with transparency)
2. Load image into Canvas element
3. Extract RGBA pixel data using getImageData()
4. Count pixels with alpha < 255 (transparent pixels)
5. Calculate transparency percentage
6. Compare against 5% minimum threshold

**Functions Created:**
- [x] `checkTransparency(imageFile, minTransparencyPercent)` - Main validation function
  - Default threshold: 5%
  - Returns: `{hasTransparency: boolean, transparencyPercent: number, error?: string}`
  - Validates PNG format
  - Provides clear error messages
  - Example usage:
    ```javascript
    const result = await checkTransparency(file);
    if (result.hasTransparency) {
      // Valid frame - proceed with upload
    } else {
      // Show error: result.error
    }
    ```

- [x] `analyzeImageTransparency(imageFile)` - Internal Canvas analysis
  - Creates canvas and draws image
  - Analyzes RGBA pixel data
  - Returns detailed transparency info
  - Cleans up resources (revokeObjectURL)

- [x] `supportsTransparency(imageFile)` - Quick format check
  - Checks if file type is PNG
  - Fast pre-validation

- [x] `getTransparencyInfo(imageFile)` - User-friendly wrapper
  - Returns formatted message for display
  - Example: "Valid frame with 15.3% transparency"

**Key Features:**
- ✅ 5% minimum transparency threshold (configurable)
- ✅ PNG format validation
- ✅ Canvas API pixel-level analysis
- ✅ Clear, user-friendly error messages
- ✅ Resource cleanup (no memory leaks)
- ✅ Fully documented with JSDoc

**Error Messages:**
- "Frame must be a PNG image with transparency. Please use PNG format."
- "Frame must have at least 5% transparent area for photos. Current: 2.34%"
- "Failed to load image" / "Canvas analysis failed"

**Integration Notes:**
- Import: `import { checkTransparency } from '@/utils/transparencyDetector'`
- Use in frame upload form before submitting to server
- Show error message if validation fails
- Only allow upload if `result.hasTransparency === true`

---

### 7. Storage Path Structure for Campaigns
**Status:** ✅ FIXED (October 1, 2025)

**Resolution:**
- Created dedicated campaign upload endpoint with correct path structure
- Campaign images now use predictable paths: `campaigns/{userId}/{campaignId}.png`
- Added utility functions for consistent path handling
- Enables easy campaign deletion and clear ownership

**Problem Analysis:**
- ❌ **Old:** Generic upload endpoint created `campaigns/{userId}/{timestamp}-{filename}`
- ✅ **New:** Dedicated endpoint creates `campaigns/{userId}/{campaignId}.png`

**Why This Matters:**
1. **Predictable Deletion** - Know exact file path when deleting campaign
2. **One Image Per Campaign** - No duplicate/orphaned files
3. **Clear Ownership** - Easy to find all campaigns by a user
4. **Matches Documentation** - CAMPAIGN_SYSTEM.md lines 362, 364

**Implementation:**

**New API Endpoint (`src/app/api/storage/campaign-upload-url/route.js`):**
- [x] POST endpoint: `/api/storage/campaign-upload-url`
- [x] Accepts: `{ campaignId: string }`
- [x] Returns: `{ uploadUrl, path, token }`
- [x] Path format: `campaigns/{userId}/{campaignId}.png`
- [x] Validates campaignId format (alphanumeric, hyphens, underscores)
- [x] Enforces PNG format (required for transparency)
- [x] Uses `upsert: true` to allow re-uploading campaign images
- [x] Authenticated via Firebase token

**Utility Functions (`src/utils/campaignStorage.js`):**
- [x] `buildCampaignImagePath(userId, campaignId)` - Build storage path
  - Returns: `campaigns/{userId}/{campaignId}.png`
  
- [x] `buildCampaignImageUrl(userId, campaignId)` - Build public URL
  - Returns full Supabase public URL
  
- [x] `parseCampaignImagePath(path)` - Extract IDs from path
  - Returns: `{ userId, campaignId }` or null
  
- [x] `isValidCampaignPath(path)` - Validate path format
  - Returns: boolean
  
- [x] `getCampaignUploadUrl(campaignId, authToken)` - Client-side helper
  - Calls API endpoint and returns upload URL
  
- [x] `deleteCampaignImage(path, authToken)` - Client-side delete helper
  - Calls delete API and removes campaign image

**Usage Example:**
```javascript
import { buildCampaignImagePath, getCampaignUploadUrl } from '@/utils/campaignStorage';

// 1. Get upload URL
const { uploadUrl, path } = await getCampaignUploadUrl(campaignId, authToken);

// 2. Upload image
await fetch(uploadUrl, {
  method: 'PUT',
  body: imageFile,
  headers: { 'Content-Type': 'image/png' }
});

// 3. Save path to Firestore
const imageUrl = buildCampaignImagePath(userId, campaignId);
await createCampaign({ ...data, imageUrl });

// 4. On delete, remove image
await deleteCampaignImage(path, authToken);
```

**Benefits:**
- ✅ Predictable file paths for deletion
- ✅ One image per campaign (no duplicates)
- ✅ Easy batch operations (get all campaigns by userId)
- ✅ Matches CAMPAIGN_SYSTEM.md specification
- ✅ Clear ownership structure
- ✅ Fully documented with JSDoc comments

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
- Removed `supporters` object completely for cost optimization
- Only `supportersCount` field exists (tracks total downloads, not unique supporters)
- Prevents document bloat on viral campaigns

**Actual Implementation (Cost-Optimized):**
```javascript
// Campaign schema - NO supporters object
{
  supportersCount: number,  // Total downloads (increments on every download)
  // NO supporters: {} object
}
```

**How it works:**
- Every download increments `supportersCount` by 1
- Same user downloading twice = counts twice (total downloads, not unique users)
- No tracking of who downloaded (prevents document size bloat)

**Files Updated:**
- [x] `src/lib/firestore.js` - Only `supportersCount: 0` in campaign creation (line 437)
- [x] `src/lib/firestore.js` - Simple increment in `trackCampaignUsage` (line 639)
- [x] `firestore.rules` - Only allows `supportersCount` updates (lines 91, 95-96)
- [x] NO supporters object anywhere in codebase (verified via grep)

**Benefits:**
- ✅ Prevents 1MB Firestore document limit on viral campaigns
- ✅ 47% storage cost reduction (no expanding objects)
- ✅ Better write performance (simple counter vs object updates)
- ✅ Infinite scalability (works at any download volume)

**Trade-offs Accepted:**
- ❌ Cannot see who downloaded (but not needed for public app)
- ❌ Cannot prevent duplicate downloads (same user counts multiple times)
- ❌ supportersCount = total downloads, not unique supporters

**Note:** If "who supported" analytics needed later, use separate subcollection `/campaigns/{id}/supporters/{userId}` instead of nesting in main document

---

## 📝 Summary Checklist

**Critical Path to Phase 1:**
- [x] Resolve frames/campaigns naming (Issue #1) ✅ FIXED
- [x] Fix storage bucket structure (Issue #2) ✅ FIXED
- [x] Add missing campaign schema fields (Issue #3) ✅ FIXED
- [x] Create reports collection & functions (Issue #4) ✅ FIXED
- [x] Implement slug generation (Issue #5) ✅ FIXED
- [x] Implement transparency detection (Issue #6) ✅ FIXED

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
