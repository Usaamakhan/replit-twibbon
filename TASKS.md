# Twibbonize - Pending Tasks & Future Roadmap

**Last Updated:** October 28, 2025 (Verified against codebase)  
**Platform:** Next.js 15 + Firebase + Supabase + ImageKit.io  
**Deployment:** Vercel (all testing/deployment happens there, Replit for code editing only)

---

## 📋 Table of Contents

1. [Phase 4: Analytics & Insights](#phase-4-analytics--insights)
2. [Phase 5: Future Recommendations](#phase-5-future-recommendations)
3. [Section 11: Settings & Navigation Architecture Restructure](#section-11-settings--navigation-architecture-restructure)

---

## Phase 4: Analytics & Insights
🔄 **Status:** PARTIALLY IMPLEMENTED

**✅ Implemented:**
- Basic admin platform analytics dashboard (`/admin` + `/api/admin/analytics`)
  - Total campaigns (with breakdown by status: active, under review, removed)
  - Campaign type breakdown (frames vs backgrounds)
  - Total users, admin users, banned users
  - Report statistics (total, pending, resolved, dismissed, resolution rate)
  - Engagement metrics (total supports, average supports per campaign)
  - Campaign breakdown visualizations

**⏸️ Deferred (Advanced Analytics):**

### 4.1 Campaign Analytics (Advanced)
- ⏸️ Real-time supporter count (currently uses static counts)
- ⏸️ Geographic distribution of supporters
- ⏸️ Share count by platform (Facebook, Twitter, WhatsApp)
- ⏸️ Peak usage times & trends

### 4.2 User Analytics (Advanced)
- ⏸️ Total reach (supporters across all campaigns)
- ⏸️ Most popular campaign rankings
- ⏸️ Campaign performance comparison tools

### 4.3 Platform Analytics - Advanced Features
- ⏸️ Daily/Weekly/Monthly active users (time-series data)
- ⏸️ Top creators leaderboard by supporters
- ⏸️ Most shared campaigns tracking
- ⏸️ Moderation metrics over time (reports resolved trends, ban trends)

---

## Phase 5: Future Recommendations
⏸️ **Status:** DEFERRED (Post-Launch)

### 5.1 Advanced Features
- ⏸️ Multi-language support (i18n)
- ⏸️ Campaign templates marketplace
- ⏸️ Collaboration features (co-creators)
- ⏸️ Campaign expiry dates (time-limited campaigns)
- ⏸️ Watermark removal (premium feature)

### 5.2 Monetization
- ⏸️ Premium creator accounts (more storage, priority support)
- ⏸️ Sponsored campaigns (brands can feature campaigns)
- ⏸️ Campaign promotion tools (boost visibility)

### 5.3 Automation & Scaling

**Deferred Items:**
- ⏸️ **Moderation action updates:** Currently in-app only, email notifications pending
- ⏸️ **Weekly campaign performance digest:** Email digest for creators

- ⏸️ **Content moderation automation:**
  - AI-based image moderation (detect inappropriate content)
  - Auto-flag campaigns based on ML model
  - Human-in-the-loop review workflow

**Note:** Auto-deletion cron jobs and email notifications for bans/appeals are already implemented.

---

## 🔧 Section 11: Settings & Navigation Architecture Restructure

**Priority:** HIGH  
**Status:** 🚀 READY TO IMPLEMENT  
**Last Updated:** October 28, 2025 (Verified against codebase)

**✅ Already Implemented:**
- `/profile/notifications` - Notification inbox page (fully functional with filters, mark as read, delete)
- `/profile/edit` - Profile editing page (avatar, bio, username, banner)

### Problem Analysis

**Current Navigation Issues:**

1. **Settings Structure:**
   - `/settings` page → **Does NOT exist yet** - needs to be created as comprehensive settings hub
   - `/profile/edit` page → **Already exists** - profile information (avatar, bio, username, banner) - **KEEP AS-IS**
   - Need dedicated notification preferences page at `/settings/notifications`

2. **Navigation Inconsistencies:**
   - ✅ Bell icon in header → `/profile/notifications` (correct - ✅ already implemented)
   - ✅ "Notifications" in sidebar menu → `/profile/notifications` (correct - ✅ already implemented)
   - ⚠️ "Settings" button on `/profile/notifications` page → Should go to comprehensive settings (NOT IMPLEMENTED YET)
   - ⚠️ "Settings" in sidebar menu → Should go to comprehensive settings hub (NOT IMPLEMENTED YET)

---

### Phased Solution: Incremental Settings Implementation

**Goal:** Build unified settings system incrementally, starting with notification settings.

**Design Decision:**
- ✅ Keep `/profile/edit` unchanged for profile information
- ✅ Build settings under `/settings` hierarchy
- ✅ Start with notifications, add other settings later

---

### 11.1: Phase 1 - Notification Settings (CURRENT PRIORITY) 🚀

**New Structure (Phase 1):**

```
/settings (Main Hub with Sidebar Navigation - starts simple, expandable)
└── /settings/notifications    → Notification Preferences (NEW - first implementation)

FUTURE PHASES (to be added later):
├── /settings/account          → Account & Security (FUTURE)
├── /settings/privacy          → Privacy & Data (FUTURE)
└── /settings/preferences      → General Preferences (FUTURE)

UNCHANGED:
/profile/edit                  → Profile Information (UNCHANGED - stays as-is)
```

**Benefits:**
- Incremental implementation (low risk)
- Clear path for future expansion
- `/profile/edit` remains stable
- Logical settings organization

---

### 11.2: Phase 1 Implementation - Notification Settings Page

#### A. `/settings` - Main Settings Hub (NEW) 🚀

**Purpose:** Central hub for all user settings (starts with notifications, expandable)

**Layout:**
- Desktop: Sidebar navigation (left) + Content area (right)
- Mobile: Tabs at top (horizontal scroll)

**Phase 1 Sidebar Items (Starting Point):**
1. 🔔 Notifications (Active/Available)
2. 🔒 Account & Security (Grayed out - "Coming Soon")
3. 🔐 Privacy & Data (Grayed out - "Coming Soon")

**Default View:** Opens `/settings/notifications` automatically (only active page)

**Why Sidebar Now?**
- Prepare infrastructure for future settings pages
- Better UX than switching layouts later
- Shows users what's coming next

---

#### B. `/settings/notifications` - Notification Preferences (NEW) 🚀

**Purpose:** Comprehensive notification management (replaces current `/settings` page)

**Content:**

**Section 1: In-App Notifications (from current `/settings`)**
- ✅ Master notification toggle
- ✅ Browser permission status display
- ✅ Active devices list
- ✅ Device management (remove devices)
- ✅ Notification preferences (type-specific toggles)

**Section 2: Notification Type Preferences (NEW)**
- 🆕 Per-notification-type toggles:
  - ✅ Campaign Warnings (when campaign flagged)
  - ✅ Campaign Removals (when campaign removed)
  - ✅ Campaign Restorations (when campaign restored)
  - ✅ Profile Reports (when someone reports your profile)
  - ✅ Admin Actions (warnings, bans, etc.)
  - ⏸️ Marketing Emails (Future)

**Section 3: Email Notifications (FUTURE)**
- ⏸️ Email notification preferences
- ⏸️ Digest mode (daily/weekly summary)
- ⏸️ Unsubscribe from specific types

**Features:**
- Toggle all notifications on/off with one click
- Individual granular control per notification type
- Visual indication of permission status
- Device-specific management
- Clear explanations for each notification type

---

### 11.3: Navigation Updates (Phase 1)

#### A. Update Mobile Sidebar (MobileMenu.js) 🚀

**Current Links:**
```javascript
- Profile → /profile
- Notifications → /profile/notifications
- Settings → /settings (notification preferences)
```

**Updated Links (Phase 1):**
```javascript
- Profile → /profile
- Notifications → /profile/notifications
- Settings → /settings (opens /settings/notifications by default)
```

**Changes:**
- Settings link remains `/settings` but now opens the settings hub
- Default view shows notification settings (only active page in Phase 1)

---

#### B. Update Notifications Page Header 🚀

**Current:**
```javascript
// Settings button on /profile/notifications page
<Link href="/settings">Settings</Link>
```

**Updated:**
```javascript
// Settings button on /profile/notifications page
<Link href="/settings/notifications">Notification Settings</Link>
```

**Changes:**
- More specific link text for clarity
- Links to `/settings/notifications` instead of `/settings`

---

#### C. Keep Profile Edit Button UNCHANGED ✅

**Current (NO CHANGES):**
```javascript
// On /profile page - KEEP THIS AS-IS
<button onClick={() => router.push('/profile/edit')}>
  Edit Profile
</button>
```

**Decision:**
- `/profile/edit` remains independent for profile information
- Will NOT be moved to `/settings` structure
- Users can access profile editing from profile page as before

---

### 11.4: Migration & Backward Compatibility (Phase 1)

#### A. Route Redirects 🚀

**Preserve old URL with redirect:**
```javascript
// In middleware.js or app router
/settings → /settings/notifications (redirect to default settings page)
```

**Benefits:**
- No broken bookmarks from existing users
- Smooth transition to new structure
- `/profile/edit` unchanged (no redirect needed)

---

#### B. Data Migration ⏸️

**No data migration needed** - Only UI/routing changes:
- Current `/settings` page content moves to `/settings/notifications`
- New settings layout wrapper added
- All existing APIs remain unchanged
- Firestore schema unchanged (notification preferences will be added later)

---

### 11.5: Implementation Plan (Phase 1 Only)

#### Phase 1: Notification Settings (CURRENT - Week 1) 🚀

**Step 1: Create Settings Layout**
- [ ] Create `/app/(chrome)/settings/layout.js` with sidebar navigation
- [ ] Create `SettingsSidebar.js` component (desktop sidebar, mobile tabs)
- [ ] Add navigation items: Notifications (active), Account (grayed), Privacy (grayed)
- [ ] Implement active state highlighting
- [ ] Responsive design (desktop sidebar, mobile horizontal tabs)

**Step 2: Create Notification Settings Page**
- [ ] Create `/app/(chrome)/settings/notifications/page.js`
- [ ] Migrate notification preferences from current `/settings`
- [ ] Add Section 1: In-App Notifications (master toggle, notification preferences)
- [ ] Add Section 2: Notification Type Preferences (per-type toggles)
- [ ] Add API route for saving notification preferences

**Step 3: Update Navigation**
- [ ] Update MobileMenu.js: Keep `/settings` link (now opens hub)
- [ ] Update `/profile/notifications` page: Change Settings button to link to `/settings/notifications`
- [ ] Add redirect: `/settings` → `/settings/notifications`

**Step 4: Database Schema (Optional)**
- [ ] Add `notificationPreferences` to user profile (optional for Phase 1)
  ```javascript
  notificationPreferences: {
    warnings: boolean,        // Default: true
    removals: boolean,        // Default: true
    restorations: boolean,    // Default: true
    profileReports: boolean,  // Default: true
    adminActions: boolean,    // Default: true
  }
  ```

**Step 5: Testing**
- [ ] Test settings sidebar navigation (desktop & mobile)
- [ ] Test notification preferences save/load
- [ ] Test notification preferences still work
- [ ] Test redirect from `/settings` to `/settings/notifications`
- [ ] Cross-browser testing

**Deliverables:**
- ✅ Settings hub with sidebar/tabs navigation
- ✅ Comprehensive notification settings page
- ✅ Per-notification-type preferences
- ✅ Updated navigation links
- ✅ Mobile responsive design

**Estimated Time:** 1 week

---

#### Future Phases (To Be Planned Later) ⏸️

**Phase 2: Account & Security Settings (FUTURE)**
- Create `/settings/account` page
- Password change functionality
- Email management
- Session management
- Account deletion

**Phase 3: Privacy & Data Settings (FUTURE)**
- Create `/settings/privacy` page
- Profile visibility controls
- Data export (GDPR)
- Privacy preferences

**Phase 4: General Preferences (FUTURE)**
- Create `/settings/preferences` page
- Language, theme, accessibility
- Dashboard layout preferences

**Note:** `/profile/edit` remains unchanged throughout all phases

---

### 11.6: UI/UX Design Guidelines (Phase 1)

#### A. Settings Sidebar Navigation 🚀

**Desktop (≥768px):**
```
┌─────────────────────────────────────────┐
│ Settings                                 │
├──────────────┬──────────────────────────┤
│              │                          │
│ 🔔 Notif...   │  [Notification Settings │
│              │   Content Area]         │
│ 🔒 Account    │                          │
│   (grayed)   │  In-app notifications,   │
│              │  Preferences, Devices   │
│ 🔐 Privacy    │                          │
│   (grayed)   │  [Save Button]          │
└──────────────┴──────────────────────────┘
```

**Mobile (<768px):**
```
┌─────────────────────────────────────────┐
│ Settings                                 │
├─────────────────────────────────────────┤
│ [Notif][Account🔒][Privacy🔒]           │ (Horizontal scroll tabs)
├─────────────────────────────────────────┤
│                                         │
│  [Notification Settings Content]        │
│                                         │
│  In-app notifications, preferences      │
│                                         │
│  [Save Button]                          │
└─────────────────────────────────────────┘
```

**Note:** Account and Privacy tabs shown as grayed/disabled with lock icon

---

#### B. Design Consistency 🚀

**Colors:**
- Primary: Emerald (#059669)
- Secondary: Yellow (#FCD34D)
- Danger: Red (#DC2626)
- Success: Green (#10B981)

**Components:**
- Use existing button styles (btn-base, btn-primary, etc.)
- Maintain yellow header sections
- Keep emerald accent colors
- Use card-based layouts with shadows

**Spacing:**
- Consistent padding: px-4, py-3
- Section gaps: mb-6, gap-6
- Form field spacing: space-y-4

---

### 11.7: API Requirements (Phase 1)

#### Notification Preferences API (NEW) 🚀

```javascript
// GET /api/notifications/preferences
// Returns user's notification preferences

// PATCH /api/notifications/preferences
// Saves notification preferences
{
  warnings: boolean,
  removals: boolean,
  restorations: boolean,
  profileReports: boolean,
  adminActions: boolean,
}
```

**Note:** Notification preference APIs already exist at `/api/notifications/[notificationId]`.

---

### 11.8: Database Schema (Phase 1)

#### User Profile Updates (Optional) 🚀

**Add to `users` collection (if implementing preferences storage):**
```javascript
{
  // ... existing fields
  
  // Notification Preferences (NEW - Optional for Phase 1)
  notificationPreferences: {
    warnings: boolean,              // Default: true
    removals: boolean,              // Default: true
    restorations: boolean,          // Default: true
    profileReports: boolean,        // Default: true
    adminActions: boolean,          // Default: true
  }
}
```

**Note:** Can start with UI-only (localStorage) and add DB persistence later.

---

### 11.9: Testing Checklist (Phase 1)

#### Functional Testing 🚀

- [ ] Settings sidebar navigation works (desktop)
- [ ] Mobile tabs navigation works
- [ ] Notification settings page loads correctly
- [ ] Notification preferences still work (migrated from `/settings`)
- [ ] Notification preference toggles work
- [ ] Preferences save/load correctly
- [ ] Redirect from `/settings` to `/settings/notifications` works
- [ ] Updated navigation links work (MobileMenu, notifications page)

#### UX Testing 🚀

- [ ] Sidebar navigation intuitive
- [ ] Mobile tabs easy to use
- [ ] Active tab highlighted correctly
- [ ] Grayed-out future tabs look disabled
- [ ] Success messages shown
- [ ] Loading states smooth
- [ ] Responsive on all screen sizes

---

### 11.10: Summary & Next Steps

**Phase 1 Goal:**
- ✅ Create unified `/settings` hub (with sidebar/tabs)
- ✅ Implement notification settings page under `/settings/notifications`
- ✅ Migrate notification preferences
- ✅ Add per-notification-type preferences
- ✅ Update navigation links
- ✅ Keep `/profile/edit` unchanged

**Current Issues:**
- ❌ `/settings` needs to be more comprehensive
- ❌ Notification preferences need better organization
- ❌ No unified settings structure

**After Phase 1:**
- ✅ Unified `/settings` hub with expandable structure
- ✅ Comprehensive notification settings
- ✅ Per-notification-type control
- ✅ Mobile-optimized experience
- ✅ Clear path for future settings pages

**Future Phases:**
- Phase 2: Account & Security (password, email, sessions)
- Phase 3: Privacy & Data (visibility, GDPR export)
- Phase 4: General Preferences (theme, language, etc.)

**Estimated Timeline (Phase 1):** 1 week

**Note:** `/profile/edit` remains independent for profile information throughout all phases.

---

**End of Section 11: Settings & Navigation Architecture Restructure**

---

**End of TASKS.md**
