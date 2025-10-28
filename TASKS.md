# Twibbonize - Pending Tasks & Development Roadmap

**Last Updated:** October 28, 2025 (Comprehensive Codebase Audit)  
**Platform:** Next.js 15 + Firebase + Supabase + ImageKit.io  
**Deployment:** Vercel (all testing/deployment happens there, Replit for code editing only)

---

## 📋 Overview

This document tracks **unimplemented features only**. All completed features are documented in:
- `replit.md` - Project overview and architecture
- `CAMPAIGN_SYSTEM.md` - Campaign system documentation
- `REPORT_SYSTEM.md` - Reporting and moderation system
- `CODEBASE_STRUCTURE.md` - Complete codebase structure

**Current Status:**
- ✅ Core campaign system (creation, usage, gallery)
- ✅ Admin moderation dashboard (reports, campaigns, users, analytics, appeals, logs)
- ✅ In-app notification system with Firestore
- ✅ Email notifications for bans/unbans (MailerSend)
- ✅ Appeal system (user submission + admin review)
- ✅ Automated cron jobs (appeal cleanup, reminders)
- ⏸️ Settings architecture (not yet implemented)
- ⏸️ Advanced analytics (deferred to future)

---

## 🎯 Phase 1: Settings & Navigation Architecture (HIGH PRIORITY)

**Status:** 🚀 **READY TO IMPLEMENT**  
**Goal:** Create unified settings hub with notification preferences  
**Estimated Time:** 1 week

### Current State

**Existing Pages:**
- ✅ `/profile/edit` - Profile editing (avatar, bio, username, banner) - **KEEP AS-IS**
- ✅ `/profile/notifications` - Notification inbox (read/unread, filter, delete) - **KEEP AS-IS**
- ❌ `/settings` - Does NOT exist yet
- ❌ `/settings/notifications` - Does NOT exist yet

**Navigation Issues:**
1. **No centralized settings hub** - Settings are scattered across different pages
2. **"Settings" links in UI go nowhere** - Sidebar and notification page have broken links
3. **No notification preferences page** - Users cannot control which notification types they receive

---

### 1.1: Settings Hub with Notification Preferences

**Objective:** Build `/settings` hub starting with notification preferences, expandable for future settings pages.

**Design Decision:**
- ✅ Keep `/profile/edit` unchanged for profile information
- ✅ Build settings under `/settings` hierarchy
- ✅ Start with notifications, add other settings later (account, privacy, preferences)

---

### 1.2: New Pages to Create

#### A. `/settings` - Main Settings Hub (with Sidebar/Tabs Layout)

**Purpose:** Central hub for all user settings (starts with notifications, expandable)

**Desktop Layout (≥768px):**
```
┌─────────────────────────────────────────┐
│ Settings                                 │
├──────────────┬──────────────────────────┤
│              │                          │
│ 🔔 Notif...  │  [Notification Settings │
│              │   Content Area]         │
│ 🔒 Account   │                          │
│   (grayed)   │  Master toggle,          │
│              │  Type preferences        │
│ 🔐 Privacy   │                          │
│   (grayed)   │  [Save Button]          │
└──────────────┴──────────────────────────┘
```

**Mobile Layout (<768px):**
```
┌─────────────────────────────────────────┐
│ Settings                                 │
├─────────────────────────────────────────┤
│ [Notif][Account🔒][Privacy🔒]           │ (Horizontal scroll tabs)
├─────────────────────────────────────────┤
│                                         │
│  [Notification Settings Content]        │
│                                         │
│  Master toggle, preferences             │
│                                         │
│  [Save Button]                          │
└─────────────────────────────────────────┘
```

**Phase 1 Sidebar Items:**
1. 🔔 **Notifications** (Active/Available) - Links to `/settings/notifications`
2. 🔒 **Account & Security** (Grayed out - "Coming Soon") - Future Phase 2
3. 🔐 **Privacy & Data** (Grayed out - "Coming Soon") - Future Phase 3

**Default Behavior:** Opening `/settings` automatically redirects to `/settings/notifications`

**Why Sidebar Now?**
- Prepare infrastructure for future settings pages
- Better UX than switching layouts later
- Shows users what's coming next

---

#### B. `/settings/notifications` - Notification Preferences Page

**Purpose:** Comprehensive notification management

**Content Sections:**

**Section 1: Master Notification Toggle**
- Enable/disable ALL notifications with one toggle
- Clear visual indicator when notifications are disabled
- Warning message when disabling

**Section 2: Notification Type Preferences**

Per-notification-type toggles:
- ✅ **Campaign Warnings** - When your campaign is flagged for review
- ✅ **Campaign Removals** - When your campaign is removed by admin
- ✅ **Campaign Restorations** - When your campaign is restored after review
- ✅ **Profile Reports** - When someone reports your profile
- ✅ **Admin Actions** - Warnings, bans, and moderation notices
- ⏸️ **Marketing Emails** (Future) - Product updates and announcements

**Section 3: Notification Delivery Info**
- Explanation of in-app notifications (no browser permissions needed)
- Email notifications for critical actions (bans/unbans only)
- Link to notification inbox at `/profile/notifications`

**Features:**
- Toggle all notifications on/off with master switch
- Individual granular control per notification type
- Visual indication of each notification type's purpose
- Save button with success/error feedback
- Responsive design (desktop sidebar, mobile tabs)

---

### 1.3: Implementation Checklist

**Step 1: Create Settings Layout Structure**
- [ ] Create `/app/(chrome)/settings/layout.js` with sidebar navigation
- [ ] Create `SettingsSidebar.js` component (desktop sidebar, mobile tabs)
- [ ] Add navigation items: Notifications (active), Account (grayed), Privacy (grayed)
- [ ] Implement active state highlighting
- [ ] Responsive design (desktop sidebar switches to mobile horizontal tabs)

**Step 2: Create Notification Settings Page**
- [ ] Create `/app/(chrome)/settings/notifications/page.js`
- [ ] Add Section 1: Master notification toggle
- [ ] Add Section 2: Notification type preferences (per-type toggles)
- [ ] Add Section 3: Delivery information and inbox link
- [ ] Add save functionality with loading/success/error states

**Step 3: Create API Endpoints**
- [ ] Create `/api/notifications/preferences` - GET endpoint
  - Returns user's notification preferences from Firestore
  - Returns default preferences if none saved
- [ ] Create `/api/notifications/preferences` - PATCH endpoint
  - Saves notification preferences to Firestore
  - Validates preference data
  - Returns success/error response

**Step 4: Update Navigation Links**
- [ ] Update `MobileMenu.js`: Change Settings link to `/settings`
- [ ] Update `/profile/notifications` page: Add "Notification Settings" button linking to `/settings/notifications`
- [ ] Add redirect: `/settings` → `/settings/notifications` (default page)

**Step 5: Database Schema (Optional for Phase 1)**
- [ ] Add `notificationPreferences` to user profile in Firestore
  ```javascript
  notificationPreferences: {
    enabled: boolean,              // Master toggle (default: true)
    warnings: boolean,             // Campaign warnings (default: true)
    removals: boolean,             // Campaign removals (default: true)
    restorations: boolean,         // Campaign restorations (default: true)
    profileReports: boolean,       // Profile reports (default: true)
    adminActions: boolean,         // Admin actions (default: true)
  }
  ```
- [ ] Alternatively: Start with localStorage and add DB persistence later

**Step 6: Testing**
- [ ] Test settings sidebar navigation (desktop)
- [ ] Test mobile tabs navigation
- [ ] Test notification preferences save/load
- [ ] Test master toggle enables/disables all types
- [ ] Test individual type toggles work independently
- [ ] Test redirect from `/settings` to `/settings/notifications`
- [ ] Test updated navigation links work correctly
- [ ] Test responsive design on mobile devices
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

---

### 1.4: Design Guidelines

**Colors (Match Existing Design):**
- Primary: Emerald (#059669)
- Secondary: Yellow (#FCD34D)
- Danger: Red (#DC2626)
- Success: Green (#10B981)
- Gray for disabled items

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

### 1.5: API Specification

**GET /api/notifications/preferences**
```javascript
// Response
{
  success: true,
  data: {
    enabled: true,
    warnings: true,
    removals: true,
    restorations: true,
    profileReports: true,
    adminActions: true,
  }
}
```

**PATCH /api/notifications/preferences**
```javascript
// Request Body
{
  enabled: boolean,
  warnings: boolean,
  removals: boolean,
  restorations: boolean,
  profileReports: boolean,
  adminActions: boolean,
}

// Response
{
  success: true,
  message: "Notification preferences saved successfully"
}
```

---

### 1.6: Future Phases (Not in Current Scope)

**Phase 2: Account & Security Settings (FUTURE)**
- Create `/settings/account` page
- Password change functionality
- Email management
- Session management
- Two-factor authentication
- Account deletion

**Phase 3: Privacy & Data Settings (FUTURE)**
- Create `/settings/privacy` page
- Profile visibility controls
- Data export (GDPR compliance)
- Privacy preferences
- Block/mute users

**Phase 4: General Preferences (FUTURE)**
- Create `/settings/preferences` page
- Language selection (i18n)
- Theme (dark mode)
- Accessibility settings
- Dashboard layout preferences

**Note:** `/profile/edit` remains unchanged throughout all phases - it stays dedicated to profile information only (avatar, banner, bio, username).

---

## 🚀 Phase 2: Advanced Analytics & Insights (DEFERRED)

**Status:** ⏸️ **DEFERRED (Post-Launch)**  
**Priority:** Low (Nice-to-have features)

**Note:** Basic platform analytics dashboard is **FULLY IMPLEMENTED** at `/admin` with:
- Campaign counts (total, active, removed, by type)
- User counts (total, admins, banned)
- Report statistics (total, pending, resolved, resolution rate)
- Engagement metrics (total supports, average per campaign)
- Top reported campaigns

The following are **advanced features** deferred to post-launch:

### 2.1 Advanced Campaign Analytics

- ⏸️ **Real-time supporter count** - Live supporter tracking with WebSockets
- ⏸️ **Geographic distribution** - Map showing where supporters are from
- ⏸️ **Share count by platform** - Track Facebook, Twitter, WhatsApp shares separately
- ⏸️ **Peak usage times** - Identify when campaigns are most popular
- ⏸️ **Trend analysis** - Growth charts, momentum tracking

### 2.2 Advanced User Analytics

- ⏸️ **Total reach metrics** - Supporters across all campaigns
- ⏸️ **Creator rankings** - Most popular creators leaderboard
- ⏸️ **Campaign performance comparison** - Compare multiple campaigns side-by-side
- ⏸️ **Creator dashboard** - Detailed analytics for campaign creators

### 2.3 Advanced Platform Analytics

- ⏸️ **Time-series data** - Daily/Weekly/Monthly active users over time
- ⏸️ **Top creators leaderboard** - Advanced sorting and filtering
- ⏸️ **Most shared campaigns** - Social media share tracking
- ⏸️ **Moderation metrics over time** - Reports resolved trends, ban trends
- ⏸️ **Revenue analytics** - For future monetization features

**Implementation Note:** These features require additional infrastructure:
- Real-time database (Firebase Realtime Database or WebSockets)
- Analytics pipeline (BigQuery or similar)
- Data warehouse for time-series storage
- Social media API integrations for share tracking

---

## 🎨 Phase 3: Future Feature Enhancements (DEFERRED)

**Status:** ⏸️ **DEFERRED (Post-Launch)**  
**Priority:** Low (Future roadmap items)

### 3.1 Platform Features

**Multi-language Support (i18n):**
- ⏸️ Translation system for UI strings
- ⏸️ Language selector in user preferences
- ⏸️ Support for RTL languages (Arabic, Hebrew)
- ⏸️ Localized date/time formats

**Campaign Templates Marketplace:**
- ⏸️ Pre-made campaign templates
- ⏸️ Template categories (holidays, events, causes)
- ⏸️ Featured templates section
- ⏸️ Template rating system

**Collaboration Features:**
- ⏸️ Co-creator functionality (multiple users manage one campaign)
- ⏸️ Team accounts for organizations
- ⏸️ Permission levels (owner, editor, viewer)
- ⏸️ Activity log for team actions

**Campaign Expiry Dates:**
- ⏸️ Time-limited campaigns (auto-archive after date)
- ⏸️ Countdown timers on campaign pages
- ⏸️ Scheduled campaign publishing
- ⏸️ Auto-renewal option

**Watermark Removal:**
- ⏸️ Premium feature to remove Twibbonize watermark
- ⏸️ Custom branding for premium users
- ⏸️ White-label campaigns

### 3.2 Monetization Features

**Premium Creator Accounts:**
- ⏸️ Increased storage limits
- ⏸️ Priority support
- ⏸️ Advanced analytics access
- ⏸️ Custom profile URLs
- ⏸️ Verified badge

**Sponsored Campaigns:**
- ⏸️ Brands can feature campaigns
- ⏸️ Promoted placement in gallery
- ⏸️ Sponsored badge
- ⏸️ Analytics for sponsors

**Campaign Promotion Tools:**
- ⏸️ Boost visibility for a fee
- ⏸️ Homepage featured slots
- ⏸️ Newsletter inclusion
- ⏸️ Social media promotion

### 3.3 Automation & Email Features

**Moderation Automation:**
- ⏸️ AI-based image moderation (detect inappropriate content)
- ⏸️ Auto-flag campaigns based on ML model
- ⏸️ Human-in-the-loop review workflow
- ⏸️ Confidence scores for admin decisions

**Email Notifications Expansion:**
- ⏸️ Weekly campaign performance digest (for creators)
- ⏸️ Moderation action updates via email (currently in-app only)
- ⏸️ Marketing emails (product updates, announcements)
- ⏸️ Email preferences management

**Note:** Auto-deletion cron jobs and email notifications for bans/appeals are **already implemented**.

### 3.4 User Experience Enhancements

**Gallery Improvements:**
- ⏸️ Infinite scroll pagination
- ⏸️ Advanced search (keywords, tags)
- ⏸️ Saved/favorite campaigns
- ⏸️ Campaign collections/playlists

**Mobile App:**
- ⏸️ Native iOS app
- ⏸️ Native Android app
- ⏸️ React Native for cross-platform

**Social Features:**
- ⏸️ Follow creators
- ⏸️ Activity feed
- ⏸️ Campaign comments
- ⏸️ User profiles with social links

---

## 📝 Implementation Notes

### Current Deployment
- **Platform:** Vercel (production)
- **Environment:** Replit (code editing only, NOT for testing)
- **Testing:** All testing happens on Vercel deployments

### Technology Stack
- **Frontend:** Next.js 15.5.2 (App Router) + React 19.1.0
- **Styling:** Tailwind CSS 4
- **Authentication:** Firebase Auth
- **Database:** Firestore
- **Storage:** Supabase
- **CDN:** ImageKit.io
- **Email:** MailerSend

### Key Principles
- **Visitor-first:** Browsing campaigns requires no authentication
- **Delayed authentication:** Only require login at publish time
- **Public analytics:** All campaign stats are transparent
- **Mobile-first design:** Responsive on all devices

---

## 🔗 Related Documentation

- **replit.md** - Project overview, architecture, user preferences
- **CAMPAIGN_SYSTEM.md** - Complete campaign system documentation
- **REPORT_SYSTEM.md** - Reporting and moderation system details
- **CODEBASE_STRUCTURE.md** - Complete codebase file structure
- **CODE_INCONSISTENCIES.md** - Known issues and fixes needed

---

**End of TASKS.md**
