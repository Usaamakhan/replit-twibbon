# Code/Documentation Inconsistencies Tracking

This document tracks all inconsistencies between the current codebase and CAMPAIGN_SYSTEM.md documentation. Update checkboxes as issues are resolved.

**Last Updated:** September 30, 2025

---

## 🔴 HIGH PRIORITY (Breaks Current Functionality)

### 1. Collection Names Mismatch
**Status:** ❌ Not Fixed

**Current Codebase:**
- Uses Firestore collection: `frames`
- All functions in `src/lib/firestore.js` reference `frames`:
  - Line 425: `collection(db, 'frames')`
  - Line 460: `collection(db, 'frames')`
  - Line 492: `collection(db, 'frames')`

**Documentation Expects:**
- Collection name: `campaigns` (not `frames`)
- Should store both frames AND backgrounds in single collection
- Differentiated by `type: "frame" | "background"` field

**Decision Needed:**
- [ ] Rename `frames` → `campaigns` in all code
- [ ] OR update documentation to use `frames` consistently

**Files to Update:**
- [ ] `src/lib/firestore.js` - all collection references
- [ ] All components that query frames
- [ ] Firestore security rules (if any)

---

### 2. Storage Bucket Structure Completely Different
**Status:** ❌ Not Fixed

**Current Implementation:**
- Bucket name: `uploads` (hardcoded)
- Folder structure: `{folder}/{userId}/{timestamp}-{filename}`
- Allowed folders: `uploads/`, `profile-images/`, `documents/`, `temp/`
- Example: `uploads/user123/1234567890-myfile.png`

**Documentation Expects:**
- Bucket name: `campaigns` (dedicated bucket)
- Folder structure: `campaigns/{userId}/{campaignId}.png`
- Example: `campaigns/user123abc/campaign456def.png`

**Files to Update:**
- [ ] `src/app/api/storage/upload-url/route.js` - line 48
- [ ] `src/app/api/storage/signed-url/route.js` - line 50
- [ ] `src/app/api/storage/delete/route.js` - line 50
- [ ] Create `campaigns` bucket in Supabase
- [ ] Update allowed folders/path validation logic

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
**Status:** ❌ Inconsistent

**Current User Profile Counters:**
- `framesCreated` - number of frames created
- `framesUsed` - number of times user used frames
- `campaignsCount` - total campaigns (confusing!)
- `supportersCount` - unique supporters

**Issue:**
- Using both "frames" and "campaigns" causes confusion
- `campaignsCount` should be `framesCreated` OR vice versa

**Decision Needed:**
- [ ] Standardize on "campaigns" terminology
- [ ] OR standardize on "frames" terminology
- [ ] Update all counter field names accordingly

**Files to Update:**
- [ ] `src/lib/firestore.js` - all counter references
- [ ] All components displaying user stats
- [ ] Documentation

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
- [ ] Resolve frames/campaigns naming (Issue #1)
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
- [ ] Standardize terminology (Issue #11)
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
