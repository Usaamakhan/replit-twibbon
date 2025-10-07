# Code/Documentation Inconsistencies Tracking

This document tracks inconsistencies between the current codebase and CAMPAIGN_SYSTEM.md documentation.

**Last Updated:** October 07, 2025

---

## ✅ COMPLETED FIXES

### Issues #1-7: Core Campaign System (Sep 30 - Oct 1, 2025)
- **#1:** Collection renamed `frames` → `campaigns` with all function updates
- **#2:** Single bucket structure with `campaigns/` folder, profile images fixed
- **#3:** Complete campaign schema with all required fields (`type`, `slug`, `creatorId`, etc.)
- **#4:** Reports collection implemented with auto-moderation (3+ reports = under-review)
- **#5:** Slug generator utility (`slugGenerator.js`) - 50 chars + 4-char random suffix
- **#6:** Transparency detector utility (`transparencyDetector.js`) - 5% minimum threshold
- **#7:** Campaign storage paths (`campaigns/{userId}/{campaignId}.png`) with utilities

### Issues #11-12: Data Structure Optimization (Oct 1, 2025)
- **#11:** Standardized terminology - `campaignsCreated` counter (removed `framesUsed`)
- **#12:** Cost-optimized supporters tracking - simple counter vs object (prevents bloat)

---

## 🟢 PENDING (Phase 2 - Admin Features)

### 8. User Profile Missing Admin Role Field
**Status:** ❌ Not Implemented

**Required:**
- Add `role: "admin" | "user"` field to user profiles
- Default to `"user"` on profile creation
- Create admin assignment function
- Update middleware for admin route protection

---

### 9. Firebase Admin Missing Firestore Access
**Status:** ❌ Not Implemented

**Required:**
- Add Firestore Admin to `firebaseAdmin.js`
- Server-side Firestore for admin operations
- Use in admin API routes for secure queries

---

### 10. Admin Dashboard Not Created
**Status:** ❌ Not Implemented (Phase 2)

**Required:**
- Admin pages under `src/app/(chrome)/admin/`
- Admin API routes under `src/app/api/admin/`
- Admin components under `src/components/admin/`
- Middleware for route protection

---

## 📝 Summary

**Phase 1 Complete:**
- [x] Core campaign system (Issues #1-7) ✅
- [x] Data optimization (Issues #11-12) ✅

**Phase 2 Pending:**
- [ ] Admin role infrastructure (Issue #8)
- [ ] Server-side admin tools (Issue #9)
- [ ] Admin dashboard UI (Issue #10)
