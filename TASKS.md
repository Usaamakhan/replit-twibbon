# Campaign System - Task Tracker

Track progress on building the campaign system (Phase 1 from CAMPAIGN_SYSTEM.md)

**Last Updated:** October 05, 2025

---

## ✅ COMPLETED TASKS

### 3-Page Campaign Flow Implementation
**Status:** ✅ Completed (October 03-04, 2025)

Implemented multi-page visitor experience (Upload → Adjust → Result) with session persistence, route guards, canvas-based image composition, and download tracking. Files: `CampaignSessionContext.js`, `campaignRouteGuards.js`, 3 page components, step indicator, and track-download API.

---

### Pre-Build Tasks
**Status:** ✅ Completed (October 02, 2025)

Added Supabase security validations: file size limits (5MB campaigns), file type validation (PNG/JPG/WEBP), and robust validation checks. Updated: `upload-url/route.js` and `campaign-upload-url/route.js`.

---

### Bug Fixes
**Status:** ✅ Completed (October 02, 2025)

Fixed ProfilePage field mappings (`imageUrl`, `supportersCount`) and resolved Firebase initialization race condition with module-level initialization. Updated: `ProfilePage.js` and `firebase-optimized.js`.

---

### Campaign Entry Point
**Status:** ✅ Completed (October 02, 2025)

Created `CreateCampaignModal` component with Frame/Background selection, integrated in Hero and MobileMenu. File: `CreateCampaignModal.js`.

---

### Upload Flows (Frame & Background)
**Status:** ✅ Completed (October 02, 2025)

Built two-step upload pages for frames (with transparency detection) and backgrounds (multi-format). Includes delayed authentication, form state preservation, slug generation, and Supabase upload integration. Files: `/create/frame/page.js` and `/create/background/page.js`.

---

### Prerequisites & Utilities
**Status:** ✅ Completed (October 01-02, 2025)

Implemented core utilities and backend functions:
- `getCampaignBySlug()` in `firestore.js` - Fetch campaigns by URL slug
- `imageComposition.js` - Canvas-based composition with zoom/drag/rotate adjustments
- `transparencyDetector.js` - PNG transparency validation (5% minimum)
- `slugGenerator.js` - URL-friendly slug generation with random suffix
- `campaignStorage.js` - Storage path utilities for `campaigns/{userId}/{campaignId}.png`

---

### Data Structure Updates
**Status:** ✅ Completed (September 30 - October 01, 2025)

Updated Firestore schema and security rules:
- Collection renamed from `frames` to `campaigns`
- Added required fields: `type`, `slug`, `moderationStatus`, `supportersCount`, `reportsCount`, `captionTemplate`
- Renamed `createdBy` → `creatorId` throughout codebase
- Created `reports` collection with full CRUD functions
- Updated security rules for campaign creation/editing validation

---

### Storage & Upload System
**Status:** ✅ Completed (October 01, 2025)

Configured Supabase storage structure:
- Single bucket approach: `uploads` with `campaigns/` folder
- Dedicated campaign upload endpoint with predictable paths
- Profile/banner image upload fixed (no more base64 in Firestore)
- API endpoints: `campaign-upload-url`, `signed-url`, `delete`, `list`

---

## 🚀 IMAGE OPTIMIZATION & CDN IMPLEMENTATION

**Status:** ✅ Completed (October 05-06, 2025)

Image optimization has been fully implemented using ImageKit.io CDN with automatic WebP conversion and smart resizing across all pages. The `imageTransform.js` utility provides centralized transformation functions to significantly reduce bandwidth usage through optimized image delivery.

---

## 📋 PHASE 2: ADMIN DASHBOARD

**Status:** ⏸️ Pending (Planned)

### Overview
Build comprehensive admin dashboard for platform moderation, user management, and analytics. Includes 4 main sections: Reports, Campaigns, Users, and Analytics.

---

### Foundation Tasks

#### 1. Admin Role Infrastructure
**Priority:** Critical (Required for all admin features)
**Status:** ✅ Completed (October 08, 2025)

**Tasks:**
- [x] Add `role` field to user profile schema (default: `"user"`)
  - Updated `createUserProfile()` in `firestore.js`
  - Role field defaults to "user" for all new profiles

- [x] Create server-side role management API
  - Created `PATCH /api/admin/users/[userId]/role` endpoint
  - Uses Firebase Admin SDK (adminFirestore) for secure updates
  - Bypasses Firestore rules safely with admin authorization

- [x] Update Firestore security rules
  - Prevents client-side role updates with `request.resource.data.role == resource.data.role`
  - Role changes only possible via server-side Admin SDK

- [x] Create admin middleware (`src/middleware/adminAuth.js`)
  - `requireAdmin(request)` function verifies Firebase auth token
  - Checks user role via adminFirestore
  - Throws error if not admin, returns admin user object

- [x] Verify Firestore Admin in `firebaseAdmin.js`
  - `adminFirestore()` export confirmed working
  - Ready for all admin server-side operations

**Files:**
- `src/lib/firestore.js` - Added role field to user schema
- `firestore.rules` - Updated security rules to block client role changes
- `src/middleware/adminAuth.js` - Admin authorization middleware
- `src/app/api/admin/users/[userId]/role/route.js` - Server-side role management API
- `src/lib/firebaseAdmin.js` - Verified adminFirestore export

---

### Admin Layout & Navigation

#### 2. Admin Layout Components
**Priority:** High (Required before building pages)
**Status:** ✅ Completed (October 08, 2025)

**Tasks:**
- [x] Create `AdminSidebar` component
  - Navigation links: Analytics, Reports, Campaigns, Users
  - Active link highlighting with pathname detection
  - Admin user info at bottom with merged auth/profile data
  - Logout button with callback
  - Mobile responsive (collapsible with fixed toggle button)

- [x] Create `AdminHeader` component
  - Page title display (dynamic based on route)
  - Breadcrumb navigation with route parsing
  - Quick actions (notifications, view site link)
  - User avatar display

- [x] Create admin layout (`src/app/(chrome)/admin/layout.js`)
  - Sidebar + main content area with responsive flex layout
  - Admin auth check using useAuth and useUserProfile
  - Proper authorization flow with isAuthorized state
  - Loading states and unauthorized fallback
  - Redirect non-admins to home

- [x] Create placeholder admin analytics page
  - Metric cards for key statistics (campaigns, users, reports)
  - Placeholder dashboard layout

**Files:**
- `src/components/admin/AdminSidebar.js` - Created with responsive design
- `src/components/admin/AdminHeader.js` - Created with breadcrumb navigation
- `src/app/(chrome)/admin/layout.js` - Created with secure admin-only access
- `src/app/(chrome)/admin/page.js` - Placeholder analytics dashboard

---

### Reports Management

#### 3. Reports Table & API
**Priority:** High (Core moderation feature)

**Tasks:**
- [ ] Create `getAllReportsAdmin()` function in `firestore.js`
  - Server-side query (uses adminFirestore)
  - Support filters: status, campaignId, reason
  - Include campaign and reporter details
  - Pagination support (limit, offset)

- [ ] Create `updateReportAdmin()` function in `firestore.js`
  - Update report status
  - Record action taken (removed, warned, no-action)
  - Track reviewedBy (admin user ID)
  - Set reviewedAt timestamp

- [ ] Build GET `/api/admin/reports` endpoint
  - Call `getAllReportsAdmin()` with filters
  - Require admin auth via middleware
  - Return reports with campaign previews
  - Support pagination

- [ ] Build PATCH `/api/admin/reports/[reportId]` endpoint
  - Call `updateReportAdmin()` with updates
  - Require admin auth
  - Validate status and action values
  - Return updated report

- [ ] Create `ReportsTable` component
  - Table with columns: ID, Campaign, Reason, Reporter, Status, Date, Actions
  - Filter dropdowns: Status, Reason
  - Pagination controls
  - Click row → Show details panel
  - Loading and empty states

- [ ] Create `ReportDetailsPanel` component
  - Side panel with full report info
  - Campaign preview (thumbnail + metadata)
  - Action buttons: Dismiss, Remove Campaign, Warn Creator
  - Close button

- [ ] Build `/admin/reports` page
  - Render ReportsTable with filters
  - Fetch reports from API
  - Handle filter changes
  - Show ReportDetailsPanel on row click

**Files:**
- `src/lib/firestore.js` - Add admin report functions
- `src/app/api/admin/reports/route.js` - New file
- `src/app/api/admin/reports/[reportId]/route.js` - New file
- `src/components/admin/ReportsTable.js` - New file
- `src/components/admin/ReportDetailsPanel.js` - New file
- `src/app/(chrome)/admin/reports/page.js` - New file

---

### Campaign Moderation

#### 4. Campaign Moderation UI & API
**Priority:** High (Content safety)

**Tasks:**
- [ ] Create `getAllCampaignsAdmin()` function in `firestore.js`
  - Fetch all campaigns (not just active)
  - Include creator details
  - Support moderationStatus filter
  - Sort by: reports count, creation date, supporters

- [ ] Create `moderateCampaign()` function in `firestore.js`
  - Update moderationStatus (active, under-review, removed)
  - Record removedBy (admin user ID)
  - Add removeReason field
  - Update timestamp

- [ ] Create `deleteCampaignAdmin()` function in `firestore.js`
  - Delete Firestore document
  - Delete Supabase image via storage API
  - Log deletion action
  - Cannot be undone

- [ ] Build GET `/api/admin/campaigns` endpoint
  - Call `getAllCampaignsAdmin()` with filters
  - Require admin auth
  - Return campaigns with moderation data

- [ ] Build PATCH `/api/admin/campaigns/[campaignId]` endpoint
  - Call `moderateCampaign()` with updates
  - Require admin auth
  - Validate moderationStatus
  - Return updated campaign

- [ ] Build DELETE `/api/admin/campaigns/[campaignId]/delete` endpoint
  - Call `deleteCampaignAdmin()`
  - Require admin auth + confirmation
  - Delete from Firestore + Supabase
  - Return success message

- [ ] Create `CampaignModerationCard` component
  - Campaign thumbnail with type badge
  - Title, creator, supporters, reports count
  - Status badge with color coding
  - Actions dropdown: View Reports, Remove, Restore, Delete
  - Confirmation modal for destructive actions

- [ ] Build `/admin/campaigns` page
  - Grid view of campaigns
  - Filter by moderationStatus
  - Sort controls
  - Pagination
  - Open moderation modal on click

**Files:**
- `src/lib/firestore.js` - Add admin campaign functions
- `src/app/api/admin/campaigns/route.js` - New file
- `src/app/api/admin/campaigns/[campaignId]/route.js` - New file
- `src/app/api/admin/campaigns/[campaignId]/delete/route.js` - New file
- `src/components/admin/CampaignModerationCard.js` - New file
- `src/app/(chrome)/admin/campaigns/page.js` - New file

---

### User Management

#### 5. User Management UI & API
**Priority:** Medium (Admin control)

**Tasks:**
- [ ] Create `getAllUsersAdmin()` function in `firestore.js`
  - Fetch all users with stats
  - Support search by name/email
  - Filter by role (all, admin, user)
  - Include: campaigns count, supports count
  - Pagination support

- [ ] Create `banUser()` function in `firestore.js`
  - Add `banned` field to user profile
  - Add `banReason` and `bannedBy` fields
  - Set `bannedAt` timestamp
  - Support unban (set banned: false)

- [ ] Build GET `/api/admin/users` endpoint
  - Call `getAllUsersAdmin()` with filters
  - Require admin auth
  - Support search and pagination
  - Return user list with stats

- [ ] Build PATCH `/api/admin/users/[userId]/role` endpoint
  - Call `setUserRole()` function
  - Require admin auth
  - Validate role value
  - Return updated user

- [ ] Build PATCH `/api/admin/users/[userId]/ban` endpoint
  - Call `banUser()` function
  - Require admin auth + confirmation
  - Validate ban reason
  - Return updated user

- [ ] Create `UsersTable` component
  - Columns: Avatar, Name, Email, Role, Campaigns, Supports, Joined, Actions
  - Search bar (debounced)
  - Filter: All, Admins, Banned Users
  - Pagination controls
  - Actions dropdown: Make Admin, Ban, View Campaigns

- [ ] Create `UserDetailsModal` component
  - User profile info
  - Activity stats
  - Campaign list
  - Admin actions panel

- [ ] Build `/admin/users` page
  - Render UsersTable
  - Handle search and filters
  - Show UserDetailsModal on row click
  - Confirm destructive actions

**Files:**
- `src/lib/firestore.js` - Add banUser function
- `src/app/api/admin/users/route.js` - New file
- `src/app/api/admin/users/[userId]/role/route.js` - New file
- `src/app/api/admin/users/[userId]/ban/route.js` - New file
- `src/components/admin/UsersTable.js` - New file
- `src/components/admin/UserDetailsModal.js` - New file
- `src/app/(chrome)/admin/users/page.js` - New file

---

### Platform Analytics

#### 6. Analytics Dashboard
**Priority:** Low (Nice to have)

**Tasks:**
- [ ] Create `getPlatformStats()` function in `firestore.js`
  - Count total campaigns by status
  - Count total users
  - Count reports by status
  - Calculate resolution rate
  - Support date range filtering

- [ ] Build GET `/api/admin/analytics` endpoint
  - Call `getPlatformStats()` with period
  - Require admin auth
  - Return metrics object
  - Cache for 5 minutes

- [ ] Create `AnalyticsCard` component
  - Metric display with icon
  - Large number + label
  - Optional trend indicator
  - Color coded by metric type

- [ ] Create `AnalyticsChart` component (optional)
  - Line/bar chart using chart library
  - Display trends over time
  - Configurable data source

- [ ] Build `/admin` page (analytics dashboard)
  - Grid of AnalyticsCards
  - Key metrics: Total campaigns, Total users, Pending reports, Active campaigns
  - Date range selector
  - Charts (if implemented)

**Files:**
- `src/lib/firestore.js` - Add getPlatformStats function
- `src/app/api/admin/analytics/route.js` - New file
- `src/components/admin/AnalyticsCard.js` - New file
- `src/components/admin/AnalyticsChart.js` - Optional
- `src/app/(chrome)/admin/page.js` - New file

---

### Utilities & Helpers

#### 7. Admin Utilities
**Priority:** Low (Quality of life)

**Tasks:**
- [ ] Create `adminHelpers.js` utility file
  - `formatReportReason()` - Human-readable reason text
  - `getModerationStatusColor()` - Badge color mapping
  - `formatTimestamp()` - Date formatting for admin tables
  - `truncateText()` - Text truncation helper

- [ ] Create `adminValidation.js` utility file
  - `validateReportStatus()` - Check valid status values
  - `validateModerationStatus()` - Check valid moderation status
  - `validateUserRole()` - Check valid role values
  - `validateBanReason()` - Ensure ban reason is provided

- [ ] Create `AdminActionButton` component
  - Reusable button with loading state
  - Confirm dialog for destructive actions
  - Success/error toast notifications
  - Icon support

**Files:**
- `src/utils/admin/adminHelpers.js` - New file
- `src/utils/admin/adminValidation.js` - New file
- `src/components/admin/AdminActionButton.js` - New file

---

### Testing & Polish

#### 8. Admin Dashboard Testing
**Priority:** Medium (Before launch)

**Tasks:**
- [ ] Test admin auth middleware
  - Verify admin access granted
  - Verify non-admin access blocked
  - Test token expiry handling

- [ ] Test reports management
  - Filter and search functionality
  - Report status updates
  - Campaign moderation actions

- [ ] Test campaign moderation
  - View all campaigns
  - Update moderation status
  - Delete campaigns (with image cleanup)

- [ ] Test user management
  - Search and filter users
  - Assign/revoke admin role
  - Ban/unban users

- [ ] Test analytics
  - Verify metrics accuracy
  - Test date range filtering
  - Check performance with large datasets

- [ ] Security testing
  - Attempt API access without auth
  - Attempt access with non-admin user
  - Test SQL injection / XSS protection

**No new files - testing only**

---

## 📝 Phase 2 Summary

**Total Estimated Tasks:** ~60 tasks across 8 sections

**Implementation Order:**
1. Foundation (Admin role + middleware) - Week 1
2. Admin Layout - Week 1
3. Reports Management - Week 2
4. Campaign Moderation - Week 2-3
5. User Management - Week 3
6. Analytics Dashboard - Week 4
7. Utilities & Polish - Week 4
8. Testing - Ongoing

**Dependencies:**
- Foundation must be completed first (blocks all other tasks)
- Admin Layout required before building pages
- Utilities can be built in parallel with features

---
