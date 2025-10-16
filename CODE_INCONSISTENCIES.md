# Admin System Issues & Inconsistencies

**Analysis Date:** October 16, 2025  
**Status:** Issues Identified - Awaiting Fixes

---

## 🔴 CRITICAL ISSUES

### Issue #1: Status Always Shows "Active" in Reports Table

**Location:** `/admin/reports` page - GroupedReportsTable component

**Problem:**
The "Status" column in the reports table always shows "active" even when campaigns/users are actually hidden, removed, or banned.

**Root Cause:**
1. When a report is created (`/api/reports/submit` and `/api/reports/user`), the `reportSummary` document stores cached `moderationStatus` and `accountStatus` fields from the campaign/user at that moment (lines 124, 135-136).
2. When admin takes action via `/api/admin/reports/summary/[summaryId]`, it updates the actual campaign/user document's moderation status.
3. **BUT**: The cached `moderationStatus` and `accountStatus` in `reportSummary` are NEVER updated to reflect the current state.
4. The GroupedReportsTable displays the stale cached status from reportSummary instead of the real-time status.

**Files Affected:**
- `/src/app/api/reports/submit/route.js` (line 124)
- `/src/app/api/reports/user/route.js` (lines 135-136)
- `/src/app/api/admin/reports/summary/[summaryId]/route.js` (does not update cached fields)
- `/src/components/admin/GroupedReportsTable.js` (line 170 - displays cached status)

**Impact:** 
Admins cannot see the current moderation state of reported items. This makes it impossible to quickly identify which reported items are already handled vs. still active.

**Solution:**
**Option A (Recommended):** Fetch live status from campaigns/users table when displaying reports
- Update `/api/admin/reports/grouped/route.js` to fetch current moderationStatus/accountStatus from the actual target document instead of relying on cached data
- Join the data in the API response

**Option B:** Update cached fields in reportSummary when admin takes action
- In `/api/admin/reports/summary/[summaryId]/route.js`, after updating the target (campaign/user), also update the cached status fields in reportSummary
- Add transaction.update(summaryRef, { moderationStatus: newStatus, accountStatus: newStatus })

**Option C:** Remove status column entirely if it's redundant
- If the status isn't crucial, remove it from the UI to avoid confusion

---

### Issue #2: Analytics Dashboard Using Wrong Schema

**Location:** `/admin` page (main analytics dashboard)

**Problem:**
The analytics API queries the database using fields that don't match the documented schema.

**Root Cause:**
1. Analytics API (`/api/admin/analytics/route.js`) queries:
   - `campaigns.where('moderationStatus', '==', 'removed')` (line 32)
   - `users.where('banned', '==', true)` (line 41)
   - `reports` collection (lines 44-48)

2. **Actual Schema Issues:**
   - **Campaigns**: Use `moderationStatus` values: `removed-temporary` and `removed-permanent` (NOT just `removed`)
   - **Users**: Use `accountStatus: 'banned-temporary'` or `'banned-permanent'` (NOT `banned: true`)
   - **Reports**: The new optimized system uses `reportSummary` collection, NOT individual `reports` documents

**Files Affected:**
- `/src/app/api/admin/analytics/route.js` (lines 32, 41, 44-48)
- Documentation: `CAMPAIGN_SYSTEM.md`, `replit.md`, `TASKS.md` all specify the correct schema

**Impact:**
Analytics shows **incorrect counts** for:
- Removed campaigns (shows 0 or wrong count)
- Banned users (shows 0 or wrong count)
- Reports statistics (queries non-existent collection)

**Solution:**
Update `/api/admin/analytics/route.js`:

1. **Campaigns - Removed Count:** Query for both removal statuses
```javascript
// Instead of line 32:
const removedCampaignsSnap1 = db.collection('campaigns').where('moderationStatus', '==', 'removed-temporary').count().get();
const removedCampaignsSnap2 = db.collection('campaigns').where('moderationStatus', '==', 'removed-permanent').count().get();
const removedCampaigns = removedSnap1.data().count + removedSnap2.data().count;
```

2. **Users - Banned Count:** Query using accountStatus
```javascript
// Instead of line 41:
const bannedUsersSnap1 = db.collection('users').where('accountStatus', '==', 'banned-temporary').count().get();
const bannedUsersSnap2 = db.collection('users').where('accountStatus', '==', 'banned-permanent').count().get();
const bannedUsers = bannedSnap1.data().count + bannedSnap2.data().count;
```

3. **Reports Stats:** Use reportSummary collection instead
```javascript
// Replace lines 44-48:
const totalReportsSnap = db.collection('reportSummary').count().get();
const pendingReportsSnap = db.collection('reportSummary').where('status', '==', 'pending').count().get();
const resolvedReportsSnap = db.collection('reportSummary').where('status', '==', 'resolved').count().get();
const dismissedReportsSnap = db.collection('reportSummary').where('status', '==', 'dismissed').count().get();
```

---

### Issue #3: Under-Review Count Missing from Analytics

**Location:** `/admin` analytics page

**Problem:**
Analytics query for "under review" campaigns uses wrong status value.

**Root Cause:**
- Line 31: `campaigns.where('moderationStatus', '==', 'under-review')`
- **Actual value:** `under-review-hidden` (when auto-hidden at 3+ reports)
- There's no plain `under-review` status in the schema

**Files Affected:**
- `/src/app/api/admin/analytics/route.js` (line 31)

**Impact:**
"Under Review" count always shows 0, even when campaigns are auto-hidden.

**Solution:**
```javascript
// Line 31 - change to:
db.collection('campaigns').where('moderationStatus', '==', 'under-review-hidden').count().get()
```

---

## ⚠️ MEDIUM PRIORITY ISSUES

### Issue #4: Campaign Moderation Filter Using Wrong Value

**Location:** `/admin/campaigns` page

**Problem:**
The moderation status filter has option "removed" but schema uses "removed-temporary" and "removed-permanent".

**Files Affected:**
- `/src/app/(chrome)/admin/campaigns/page.js` (line 84)

**Impact:**
Filtering by "Removed" status returns no results.

**Solution:**
Update filter dropdown to include both removal types:
```javascript
<option value="removed-temporary">Removed (Temporary)</option>
<option value="removed-permanent">Removed (Permanent)</option>
```

Or create a compound query that checks for both.

---

### Issue #5: Cached Data in reportSummary Gets Stale

**Location:** `/api/reports/submit` and `/api/reports/user`

**Problem:**
reportSummary caches campaign/user data for display (title, image, slug, username, etc.) at the time of the first report. This data never updates even if the campaign/user changes their title, username, or profile picture.

**Files Affected:**
- `/src/app/api/reports/submit/route.js` (lines 119-124)
- `/src/app/api/reports/user/route.js` (lines 132-136)

**Impact:**
Admins see outdated campaign titles, usernames, or images in the reports table.

**Solution:**
**Option A:** Re-fetch display data every time in the grouped reports API
- In `/api/admin/reports/grouped/route.js`, fetch fresh data from campaigns/users

**Option B:** Update cached fields when reportSummary exists
- When updating existing summaries, refresh the cached display fields

**Option C:** Remove cached fields and always join fresh data
- Don't cache at all, always fetch live data from source

---

## 🟡 MINOR ISSUES / IMPROVEMENTS

### Issue #6: Inconsistent Field Names

**Problem:**
Some APIs use `reportsCount` while others check for `reportCount` (singular vs plural).

**Files Affected:**
- Campaigns/Users use: `reportsCount` (plural)
- reportSummary uses: `reportCount` (singular)

**Impact:**
Code inconsistency, potential confusion.

**Solution:**
Standardize to one naming convention across all collections.

---

### Issue #7: Missing Auto-Update for reportSummary When Status Changes

**Problem:**
When campaigns get auto-hidden at 3 reports or users at 10 reports, the reportSummary status field is not updated from the reporting API.

**Files Affected:**
- `/src/app/api/reports/submit/route.js` (updates campaign but not summary status)
- `/src/app/api/reports/user/route.js` (updates user but not summary status)

**Impact:**
Summary tracking is incomplete - doesn't reflect when items are auto-hidden.

**Solution:**
In both report submission routes, when auto-hiding occurs, also update:
```javascript
transaction.update(summaryRef, {
  moderationStatus: 'under-review-hidden', // or accountStatus for users
  hiddenAt: new Date()
});
```

---

### Issue #8: No Real-Time Status Sync Between Collections

**Problem:**
The project has three sources of truth for moderation status:
1. `campaigns` collection - actual campaign status
2. `users` collection - actual user status  
3. `reportSummary` collection - cached status for reports view

When one changes, others don't automatically update.

**Impact:**
Data inconsistency across admin views.

**Solution:**
Implement one of:
1. **Cloud Functions** to sync status changes across collections
2. **Firestore Triggers** that update reportSummary when campaigns/users change
3. **Remove caching** and always fetch live data from source tables
4. **Background job** that periodically syncs stale cached data

---

## 📊 SUMMARY OF FIXES NEEDED

### Immediate Fixes (Critical):
1. ✅ **Fix status display in reports table** - Either fetch live status or sync cached status
2. ✅ **Fix analytics queries** - Use correct schema field names and values
3. ✅ **Fix under-review count** - Use `under-review-hidden` instead of `under-review`

### Medium Priority:
4. ⚠️ **Fix campaigns filter** - Add both removal status options
5. ⚠️ **Sync cached display data** - Keep reportSummary data fresh

### Nice to Have:
6. 🔧 **Standardize field naming** - Consistent `reportCount` vs `reportsCount`
7. 🔧 **Auto-update summary status** - When campaigns/users are auto-hidden
8. 🔧 **Implement data sync strategy** - Keep all collections in sync

---

## 🎯 RECOMMENDED IMPLEMENTATION APPROACH

**Phase 1: Quick Fixes (1-2 hours)**
1. Update analytics API to use correct schema
2. Fetch live status in reports grouped API
3. Fix campaign filter dropdown

**Phase 2: Data Sync (2-3 hours)**
4. Add status sync when admin takes action
5. Update cached fields when creating/updating summaries
6. Add auto-update for status changes

**Phase 3: Long-term Solution (Optional)**
7. Implement Firestore triggers for automatic syncing
8. Remove redundant cached fields
9. Standardize naming conventions

---

## 📝 NOTES

- All issues are **functional bugs** - the code runs without errors but produces incorrect results
- The core architecture is sound, just implementation details need alignment
- Most fixes are simple query/field name changes
- No breaking changes to existing functionality
- Database migrations not needed, only code updates

**End of Analysis**
