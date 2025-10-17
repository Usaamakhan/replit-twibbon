# Admin System Issues & Inconsistencies

**Analysis Date:** October 16, 2025  
**Last Updated:** October 17, 2025  
**Status:** 🟢 Critical Issues Fixed | 🟡 Minor Issues Remaining

---

## ✅ COMPLETED FIXES (October 16-17, 2025)

### Issue #1: Status Always Shows "Active" in Reports Table ✅ FIXED
- **Solution Implemented:** Option A - Fetch live status from campaigns/users
- **File Updated:** `/src/app/api/admin/reports/grouped/route.js`
- **Implementation:** Now fetches live `moderationStatus` and `accountStatus` from actual campaigns/users collections and also updates cached display data

### Issue #2: Analytics Dashboard Using Wrong Schema ✅ FIXED
- **File Updated:** `/src/app/api/admin/analytics/route.js`
- **Fixes Applied:**
  - Now queries `under-review-hidden` instead of `under-review`
  - Queries both `removed-temporary` and `removed-permanent` for removed campaigns
  - Uses `accountStatus: 'banned-temporary'/'banned-permanent'` instead of `banned: true`
  - Queries `reportSummary` collection instead of non-existent `reports` collection

### Issue #3: Under-Review Count Missing from Analytics ✅ FIXED
- **File Updated:** `/src/app/api/admin/analytics/route.js`
- **Fix Applied:** Line 32 now uses `under-review-hidden` instead of `under-review`

### Issue #4: Campaign Moderation Filter Using Wrong Value ✅ FIXED
- **File Updated:** `/src/app/(chrome)/admin/campaigns/page.js`
- **Fix Applied:** Filter dropdown now includes both `removed-temporary` and `removed-permanent` options

### Issue #5: Cached Data in reportSummary Gets Stale ✅ FIXED
- **File Updated:** `/src/app/api/admin/reports/grouped/route.js`
- **Fix Applied:** API now fetches live data from campaigns/users and updates cached display fields (title, image, username, etc.)

---

## 🟡 REMAINING ISSUES

### Issue #6: Inconsistent Field Names

**Problem:**
Some APIs use `reportsCount` while others check for `reportCount` (singular vs plural).

**Files Affected:**
- Campaigns/Users use: `reportsCount` (plural)
- reportSummary uses: `reportCount` (singular)

**Impact:**
Code inconsistency, potential confusion when querying or updating report counts.

**Solution:**
Standardize to one naming convention across all collections (recommended: `reportsCount` for consistency).

---

### Issue #7: Missing Auto-Update for reportSummary When Status Changes

**Problem:**
When campaigns get auto-hidden at 3 reports or users at 10 reports, the reportSummary status field is not updated from the reporting API.

**Files Affected:**
- `/src/app/api/reports/submit/route.js` (updates campaign but not summary status)
- `/src/app/api/reports/user/route.js` (updates user but not summary status)

**Impact:**
Summary tracking is incomplete - doesn't reflect when items are auto-hidden. Although the grouped reports API fetches live status (Issue #1 fix), the cached status in reportSummary never gets updated.

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

When one changes, others don't automatically update. While Issue #1 fix addresses this by fetching live data, the cached fields in reportSummary can still become stale over time.

**Impact:**
Data inconsistency across admin views (mitigated by Issue #1 fix, but cache staleness remains).

**Solution:**
Implement one of:
1. **Cloud Functions** to sync status changes across collections
2. **Firestore Triggers** that update reportSummary when campaigns/users change
3. **Remove caching entirely** and always fetch live data from source tables (partially implemented)
4. **Background job** that periodically syncs stale cached data

---

## 📊 SUMMARY OF REMAINING FIXES

### Minor Issues (Low Priority):
1. 🔧 **Standardize field naming** - Consistent `reportCount` vs `reportsCount`
2. 🔧 **Auto-update summary status** - When campaigns/users are auto-hidden
3. 🔧 **Implement data sync strategy** - Keep all collections in sync (optional architectural improvement)

---

## 🎯 RECOMMENDED IMPLEMENTATION APPROACH

**Phase 1: Field Naming Standardization (30 min - 1 hour)**
1. Choose one convention (`reportsCount` recommended)
2. Update all references in reportSummary schema
3. Update all queries and increment operations

**Phase 2: Status Sync Enhancement (1-2 hours)**
4. Add reportSummary status updates in `/api/reports/submit/route.js`
5. Add reportSummary status updates in `/api/reports/user/route.js`
6. Test auto-hide functionality with status sync

**Phase 3: Long-term Solution (Optional - Future Enhancement)**
7. Implement Firestore triggers for automatic syncing
8. Consider removing cached fields entirely if always fetching live data
9. Add background job for periodic cache refresh

---

## 📝 NOTES

- ✅ All critical and medium priority issues have been resolved
- 🟡 Remaining issues are minor improvements and architectural enhancements
- ✅ Core functionality is working correctly with live data fetching
- 🟡 Cache staleness is a minor concern, mitigated by live data fetching in admin views
- No breaking changes required for remaining fixes
- Database migrations not needed, only code updates

**End of Analysis**
