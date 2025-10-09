# Code Inconsistencies & Documentation Gaps

**Last Updated:** October 09, 2025

This document tracks inconsistencies between documentation (CAMPAIGN_SYSTEM.md, TASKS.md) and actual codebase implementation.

---

## ✅ Documentation Inaccuracies (Need Updates)

### 1. Warnings Collection - ACTUALLY COMPLETED
**Documentation Status:** CAMPAIGN_SYSTEM.md Line 126 says "⏸️ Status: Pending Implementation"

**Actual Implementation Status:** ✅ COMPLETED
- Warning records created in `/api/admin/reports/[reportId]/route.js` (lines 100-112, 163-175)
- Schema matches documentation exactly
- Supports both campaign and profile warnings
- Warning created when admin clicks "Warn Creator" button
- `issuedAt`, `issuedBy`, `acknowledged` fields all implemented

**Action Required:** Update CAMPAIGN_SYSTEM.md Line 126 to "✅ Status: Implemented"

---

### 2. FCM Notifications - ACTUALLY COMPLETED (Infrastructure)
**Documentation Status:** 
- TASKS.md Section 9.2 says "⏸️ PENDING (Section 9.2 Notifications)"
- CAMPAIGN_SYSTEM.md Lines 149-187 says "⏸️ Status: Pending Implementation"

**Actual Implementation Status:** ✅ INFRASTRUCTURE COMPLETED, ⏸️ UI INTEGRATION PENDING
- ✅ Service worker route: `/firebase-messaging-sw/route.js`
- ✅ Token management APIs: `/api/notifications/register-token`, `/api/notifications/remove-token`
- ✅ Send notification API: `/api/notifications/send/route.js`
- ✅ useFCM hook: `src/hooks/useFCM.js`
- ✅ NotificationPermissionModal component: `src/components/notifications/NotificationPermissionModal.js`
- ✅ Notification templates: `src/utils/notifications/notificationTemplates.js`
- ✅ FCM helper: `src/utils/notifications/sendFCMNotification.js`
- ✅ All admin actions trigger notifications (dismiss, warn, remove)
- ⏸️ Missing: Systematic UI integration (when/where to show NotificationPermissionModal)
- ⏸️ Missing: User notification preferences page

**Action Required:** 
1. Update CAMPAIGN_SYSTEM.md to reflect infrastructure is complete
2. Update TASKS.md Section 9.2 to show backend COMPLETED, frontend UI integration PENDING

---

### 3. Profile Moderation - ACTUALLY COMPLETED
**Documentation Status:** CAMPAIGN_SYSTEM.md Lines 217-242 says "⏸️ Status: Pending Implementation"

**Actual Implementation Status:** ✅ COMPLETED
- ✅ Profile report submission: `/api/reports/user/route.js`
- ✅ Auto-hide at 10+ reports: Lines 85-88 in `/api/reports/user/route.js`
- ✅ moderationStatus field: 'active' | 'under-review-hidden'
- ✅ accountStatus field: 'active' | 'banned-temporary' | 'banned-permanent'
- ✅ reportsCount tracking
- ✅ hiddenAt timestamp
- ✅ bannedAt, banReason, appealDeadline fields
- ✅ Admin can ban users via report actions (line 178-186 in `/api/admin/reports/[reportId]/route.js`)

**Action Required:** Update CAMPAIGN_SYSTEM.md Lines 217-242 to "✅ Status: Implemented"

---

## ⏸️ Features Correctly Marked as Pending

### 1. Appeals System - NOT IMPLEMENTED ✅ Correctly Documented
**Documentation Status:** 
- CAMPAIGN_SYSTEM.md Line 192 says "⏸️ Status: Pending Implementation" ✅ Correct
- TASKS.md Lines 982-1000, 1304-1335 marked as pending ✅ Correct

**Verification:**
- ❌ No `/api/appeals/submit` route
- ❌ No `/api/admin/appeals` route  
- ❌ No `/admin/appeals` page
- ❌ No appeal submission forms for users
- ❌ No appeal deadline reminders
- ❌ No auto-deletion after 30 days

**Status:** Documentation is accurate

---

### 2. Admin Warning History View - NOT IMPLEMENTED ✅ Correctly Documented
**Documentation Status:** TASKS.md Line 693 says "⏸️ Admin warning history view (deferred to future update)" ✅ Correct

**Verification:**
- ❌ No UI in admin panel to view user warning count
- ❌ No warning history display in UserDetailsModal
- ❌ Warnings collection exists but no frontend display

**Status:** Documentation is accurate

---

### 3. Auto-Deletion Cron Jobs - NOT IMPLEMENTED ✅ Correctly Documented
**Documentation Status:** TASKS.md Section "Phase 5" Lines 1339-1363 says "⏸️ DEFERRED" ✅ Correct

**Verification:**
- ❌ No cron job for expired appeal deadlines
- ❌ No automatic permanent deletion after 30 days
- ❌ Temporary removals require manual admin cleanup

**Status:** Documentation is accurate, manual cleanup is current approach

---

## 🔍 Implementation Gaps (Features to Build Next)

Based on TASKS.md priority and current implementation status:

### Priority 1: FCM Notifications UI Integration (Section 9.2)
**Status:** Backend ✅ Complete | Frontend ⏸️ Pending

**What's Done:**
- All backend infrastructure for FCM
- Notification sending on admin actions
- Permission modal component exists

**What's Missing:**
1. When/where to show NotificationPermissionModal:
   - After user creates first campaign?
   - After user downloads first campaign result?
   - In profile settings?
   - As a banner on specific pages?

2. User notification preferences page:
   - Enable/disable notifications
   - Choose which events to be notified about
   - Manage devices/browsers
   - View notification history

3. Foreground notification display:
   - Toast/banner component for in-app notifications
   - Handle `onMessage()` events with UI

**Recommendation:** Complete this section next (highest ROI, mostly UI work)

---

### Priority 2: Appeals System (Phases 3-4)
**Status:** ⏸️ Not Started

**Requirements:**
1. **User Appeal Submission:**
   - `/appeal-ban/page.js` - Account ban appeal form
   - `/campaign/[slug]/appeal/page.js` - Campaign removal appeal form
   - Deadline countdown display
   - Appeal reason textarea
   - Submit to `/api/appeals/submit`

2. **Admin Appeals Management:**
   - `/admin/appeals/page.js` - List all pending appeals
   - Filter by type (Campaign / Account)
   - View appeal details with original report context
   - Approve/Reject actions with admin notes
   - Track appeal history

3. **API Routes:**
   - POST `/api/appeals/submit` - User submits appeal
   - GET `/api/admin/appeals` - Admin fetches all appeals
   - PATCH `/api/admin/appeals/[appealId]` - Admin approve/reject

4. **Business Logic:**
   - Enforce 30-day appeal deadline
   - Track `appealCount` (max 2 for campaigns, 1 for accounts)
   - Permanent removal/ban after rejection
   - Restore content/account on approval

**Recommendation:** Implement after completing FCM UI integration

---

### Priority 3: Admin Warning History View
**Status:** ⏸️ Deferred

**Requirements:**
- Display warning count in `UserDetailsModal`
- Show warning history table (date, reason, target, admin)
- Link to related reports
- Track warnings across campaigns and profile

**Recommendation:** Low priority, manual admin workflow sufficient for now

---

### Priority 4: Auto-Deletion Cron Jobs
**Status:** ⏸️ Deferred (Requires infrastructure decision)

**Requirements:**
- Choose cron service (Vercel Cron, Firebase Scheduled Functions, etc.)
- Daily job to check expired `appealDeadline`
- Permanent deletion logic for campaigns + images
- Permanent ban logic for users + cascade delete

**Recommendation:** Defer until platform scales, manual cleanup sufficient

---

## 📋 Summary of Actions Required

### Documentation Updates Needed:
1. ✏️ CAMPAIGN_SYSTEM.md Line 126: Change warnings collection status to "✅ Implemented"
2. ✏️ CAMPAIGN_SYSTEM.md Line 150: Update FCM status to show infrastructure complete, UI pending
3. ✏️ CAMPAIGN_SYSTEM.md Line 217: Change profile moderation status to "✅ Implemented"
4. ✏️ TASKS.md Section 9.2: Mark backend FCM as ✅ COMPLETED, clarify UI integration is pending

### Next Implementation Priority (Based on TASKS.md):
**Recommendation: Section 9.2 - FCM Notifications UI Integration**

**Reason:**
- Backend infrastructure 100% complete
- Only needs UI/UX integration decisions
- High user value (real-time moderation updates)
- Low complexity (mostly frontend components)
- Completes the moderation notification loop

**Tasks to Implement:**
1. Decide notification permission prompt strategy:
   - Show modal after first campaign creation? ✅ Recommended
   - Show banner on profile page? ✅ Recommended
   - Add to onboarding flow?

2. Create notification preferences page:
   - `/profile/notifications` route
   - Enable/disable toggle
   - Event type preferences
   - Device management

3. Foreground notification UI:
   - Toast component for in-app notifications
   - Integrate with `useFCM()` `onMessage` handler
   - Auto-dismiss after 5 seconds
   - Click to navigate to action URL

4. Testing & refinement:
   - Test notification delivery on all actions
   - Verify deep linking works
   - Test on different browsers/devices
   - Handle notification failures gracefully

**Estimated Effort:** 1-2 days (mostly UI components, backend is done)

---

**End of Analysis**
