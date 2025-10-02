# Campaign Upload System - Implementation Guide

## Terminology
We use the term **"Campaign"** to refer to both frames and backgrounds collectively. Each campaign can be either a frame (with transparency) or a background (solid image).

## Feature Overview
The application supports two types of creator uploads:
1. **Frames** - Images with transparent areas where visitor photos are placed
2. **Backgrounds** - Solid images placed behind visitor photos

## Key Differences
| Feature | Frame | Background |
|---------|-------|------------|
| Transparency Required | ✅ Yes (must detect) | ❌ No |
| Upload Route | `/create/frame` | `/create/background` |
| Use Case | Photo overlays on top | Photo sits on top of background |

---

## Data Schema

### Campaign Collection (Firestore: `campaigns`)
```javascript
{
  id: "auto-generated-id",
  type: "frame" | "background",           // Required (IMMUTABLE after publish)
  title: "Campaign Title",                // Required (editable with restrictions)
  description: "Optional description",    // Optional (editable with restrictions)
  slug: "unique-url-slug",                // Auto-generated from title + random suffix (IMMUTABLE)
  imageUrl: "supabase-storage-url",       // Required (IMMUTABLE after publish)
  creatorId: "firebase-user-id",          // Required (IMMUTABLE)
  captionTemplate: "Share text template", // Optional (editable with restrictions)
  supportersCount: 0,                     // Increment on download (total downloads count)
  reportsCount: 0,                        // Number of reports received
  moderationStatus: "active",             // "active" | "under-review" | "removed"
  createdAt: timestamp,                   // Auto (publish time)
  updatedAt: timestamp,                   // Last edit time (optional)
  firstUsedAt: timestamp,                 // When first supporter used it (optional)
}
```

**Country for Campaigns:**
- Campaigns do NOT store a country field directly
- Country is derived from creator's user profile (`userProfile.country`)
- For filtering "Top Campaigns by Country", use the creator's current country
- Benefits: Single source of truth, no data duplication

**Editing Policy - Limited Editing with Hybrid Restrictions:**
- **Editable Fields:** title, description, captionTemplate (metadata only)
- **Immutable Fields:** type, imageUrl, slug, creatorId (locked forever after publish)
- **Edit Window:** Allowed for **7 days after publish** OR **until 10 supporters**, whichever comes first
- **After Lock:** Campaign becomes permanently read-only
- **Rationale:** Protects supporter trust while allowing creators to fix mistakes

**Deletion Policy:**
- **Who Can Delete:** Only the campaign creator (owner)
- **When:** Anytime after publish (no time restrictions)
- **Confirmation Required:** Yes - popup warning "This action cannot be undone"
- **What Gets Deleted:** 
  - Campaign document from Firestore
  - Campaign image from Supabase Storage (path: `campaigns/{userId}/{campaignId}.png`)
  - All associated data (irreversible)
- **Impact:** Supporters who already downloaded keep their files, but campaign page becomes 404

### Reports Collection (Firestore: `reports`)
```javascript
{
  id: "auto-generated-id",
  campaignId: "campaign-id",              // Required
  campaignSlug: "campaign-slug",          // For easy navigation
  reportedBy: "user-id" | "anonymous",    // Optional (can report without auth)
  reason: "inappropriate" | "spam" | "copyright" | "other",  // Required
  details: "Optional explanation text",   // Optional
  status: "pending" | "reviewed" | "resolved" | "dismissed",  // Default: pending
  createdAt: timestamp,
  reviewedAt: timestamp,                  // When admin reviewed (optional)
  reviewedBy: "admin-user-id",            // Admin who reviewed (optional)
  action: "removed" | "warned" | "no-action"  // What action was taken (optional)
}
```

**Report Policy:**
- Any visitor can report a campaign (no auth required)
- Predefined reasons: Inappropriate, Spam, Copyright violation, Other
- Reports are reviewed by admins (manual process in Phase 1)
- Auto-moderation triggers (Phase 2): 3+ reports = flag, 10+ reports = auto-hide

---

## User Flows

### Creator Flow - Upload Campaign
1. Click "Create Campaign" in hero/sidebar
2. **Modal popup opens** with type selection (Frame or Background)
3. **Choose type**: Frame or Background in modal
4. Navigate to `/create/frame` or `/create/background`
5. **Step 1: Upload Image FIRST**
   - Frame: Upload PNG with transparency
   - Background: Upload any image format
6. **Transparency Detection (Frames Only)** - Auto-validate transparent areas
7. If frame validation fails → Show error: "Frame must have transparent area for photos"
8. **Step 2: Fill Other Fields**
   - Title (required)
   - Description (optional)
   - Caption Template (optional, for both frames and backgrounds)
9. Preview campaign
10. Click "Publish" button
11. **Authentication Check** - If not logged in, show popup:
    - "Sign in to publish your campaign"
    - Options: Sign In / Go Back
    - **Preserve all filled data** during auth flow
12. After auth → Submit → Save to Firestore + Supabase Storage
13. Redirect to campaign view page `/campaign/[slug]`

### Visitor Flow - Use Campaign
1. Browse `/campaigns` gallery → Select campaign
2. Navigate to `/campaign/[slug]`
3. **Upload personal photo** (required before download)
4. **Image Adjustment Tools**:
   - Resize photo (zoom in/out)
   - Move/reposition photo
   - Fit to frame/background area
5. Preview result with adjustments
6. **Sharing Options** - Share to social media
7. **Download** button (disabled until photo uploaded)
8. Download final composed image
9. Increment campaign's `supportersCount`

### Visitor Flow - Report Campaign
1. On any `/campaign/[slug]` page, click "Report" button
2. **Report Modal Opens:**
   - Select reason: Inappropriate, Spam, Copyright, Other
   - Optional: Add explanation text
   - No authentication required
3. Submit report → Saved to `reports` collection
4. Show confirmation: "Thank you, we'll review this"
5. Prevent duplicate reports (same user/IP + same campaign)
6. Campaign's `reportsCount` increments
7. If threshold reached (3+ reports), set `moderationStatus: "under-review"`

---

## Implementation Phases

### Phase 1: Core Campaign System (IMPLEMENT NOW)
**Priority: Immediate Implementation**

#### 1. Create Entry Point
- **Modal popup** - Choice between "Frame" or "Background"
- Triggered from "Create Campaign" buttons in hero and sidebar
- Clean design with compact visual cards showing difference
- No authentication required to open modal
- Optional: `/create` page opens same modal (for direct URL access)

#### 2. Build Upload Routes
- `/create/frame` - Frame upload workflow
- `/create/background` - Background upload workflow
- Allow unauthenticated access - only check auth on publish
- Preserve form data during authentication flow

#### 3. Two-Step Upload Process
- **Step 1:** Image upload first (primary action)
- **Step 2:** Fill metadata (title, description, caption)
- Clear progress indication

#### 4. Implement Transparency Detection (Frames Only)
- Use Canvas API to analyze uploaded image
- Check for alpha channel (PNG format)
- Count transparent pixels
- Minimum threshold: At least 5-10% transparency required
- Clear error messages if validation fails

#### 5. File Upload to Supabase Storage
- Create storage bucket: `campaigns`
- Upload images with unique filenames
- Get public URLs for storage
- Handle upload errors gracefully

#### 6. Save to Firestore
- Create `campaigns` collection (single collection for both types)
- Generate slug from title (URL-safe)
- Store all metadata including type
- Link to creator's user ID

#### 7. Create Campaign View Page
- `/campaign/[slug]` - Individual campaign page
- Show creator info, title, description
- **Visitor Upload Interface:**
  - Upload user photo
  - Image adjustment tools (resize, move, fit)
  - Preview with real-time updates
- **Sharing Options** - Social media share buttons
- **Download Button** - Only enabled after user uploads photo
- Increment `supportersCount` on download

#### 8. Image Composition & Adjustment
- Use Canvas API to composite images
- **Frame:** User photo placed in transparent area
- **Background:** User photo on top of background
- **Adjustment Controls:**
  - Zoom slider (resize photo)
  - Drag to reposition
  - Center/fit button
- Export as downloadable PNG/JPG
- Prevent download without user photo

#### 9. Unified Campaigns Gallery
- `/campaigns` - Browse all campaigns (frames + backgrounds)
- **Filters:**
  - By Country (user's location)
  - By Time Period: Last 24h, 7 days, 1 month, All time
  - By Type: All, Frames only, Backgrounds only
- Grid layout with thumbnails
- Show campaign type badge
- Sort by: Top performing, Most recent, Trending

#### 10. Top Creators Page
- `/creators` - Leaderboard of top creators
- **Filters:**
  - By Country
  - By Time Period: Last 24h, 7 days, 1 month, All time
- Show: Avatar, name, campaign count, total supporters
- Link to creator profile

#### 11. Caption Template for Both
- Add caption template field to both frames and backgrounds
- Used for social sharing
- Pre-fills share text

#### 12. Campaign Reporting System
- Add "Report" button to `/campaign/[slug]` pages
- Create report modal component with predefined reasons
- Allow anonymous reporting (no auth required)
- Store reports in `reports` collection
- Track `reportsCount` on campaign documents
- Update `moderationStatus` based on report threshold
- Prevent duplicate reports from same user/IP
- Show confirmation message after submission

#### 13. Authentication Flow
- Allow unauthenticated users to fill entire form
- Show auth popup only when clicking "Publish"
- Modal with "Sign In" and "Go Back" options
- Preserve all form data during auth
- Complete publish after successful sign-in

---

### Phase 2: Enhanced Features (IMPLEMENT LATER)
**Priority: Future Implementation**

#### 1. Privacy Status 🔮
- Add `privacyStatus: "public" | "private"` field
- Private campaigns only visible to creator
- Toggle in campaign settings

#### 2. User-Submitted Support Images 🔮
- Users who use a campaign can upload their result image
- Show on main page as "Supporters"
- **Creator Controls:**
  - Public (anyone can submit)
  - Approval required (creator must accept)
  - Allowed users only (whitelist)
- Gallery of user submissions on campaign page

#### 3. Background Removal for Visitors 🔮
- Add "Remove Background" button on campaign usage pages
- Integrate BG removal API (e.g., remove.bg)
- **Consideration:** May be a paid feature
- Helps visitors get clean results on backgrounds

#### 4. Campaign Link (External URL) 🔮
- Add `campaignLink` field to schema
- Display as "Learn More" button on campaign pages
- Links to creator's external website/cause
- **Consideration:** May be a paid feature for creators

#### 5. In-App Frame Creator 🔮
- New route: `/create/editor`
- Canvas-based frame creation tool
- Upload image + draw transparent areas
- Add text, shapes, effects
- Advanced feature for premium users

#### 6. Advanced Analytics Dashboard 🔮
- Detailed creator analytics page
- Track: views, downloads, shares, geographic data
- Time-based charts and trends
- Export data as CSV

#### 7. Admin Dashboard (Content Moderation) 🔮
**Priority: Phase 2 - Essential for scaling**

**Admin Routes:**
- `/admin` - Admin dashboard home
- `/admin/reports` - View and manage all reports
- `/admin/campaigns` - Browse and moderate all campaigns
- `/admin/users` - User management (view, ban, warn)
- `/admin/analytics` - Platform-wide statistics

**Core Features:**

**Report Management:**
- View all reports with filters (pending, reviewed, resolved, dismissed)
- Sort by: date, campaign, report count, status
- Batch actions: approve multiple, dismiss multiple
- Quick actions per report:
  - View campaign details
  - View reporter info (if authenticated)
  - Remove campaign (with reason)
  - Warn creator (send notification)
  - Dismiss report (mark as false/spam)
- Add internal admin notes to reports
- Track admin who took action and timestamp

**Campaign Moderation:**
- View all campaigns with moderation status badges
- Filter by: moderation status, type, country, date
- Quick actions:
  - Preview campaign
  - View creator profile
  - See all reports for this campaign
  - Temporarily hide campaign
  - Permanently remove campaign
  - Restore removed campaign (undo within 30 days)
- Bulk moderation actions

**User Management:**
- View all users with activity stats
- Filter users by: role, country, join date, activity
- User actions:
  - View user's campaigns
  - View user's reports (as reporter)
  - Ban user (hide all campaigns, prevent new uploads)
  - Warn user (send notification)
  - View user activity log
- Track banned users and ban reasons

**Admin Analytics:**
- Total campaigns, users, reports
- Reports by reason breakdown
- Moderation actions timeline
- Top reported campaigns
- Active moderators leaderboard
- Platform health metrics

**Access Control:**
- Admin role stored in user profile: `role: "admin" | "user"`
- Middleware protection on all `/admin/*` routes
- Admin-only API endpoints with token verification
- Audit log of all admin actions

---

## Technical Requirements

### File Upload Specifications
- **Supported Formats:** PNG (frames), PNG/JPG/WEBP (backgrounds)
- **Max File Size:** 5MB
- **Recommended Dimensions:** 
  - Frames: 1500x1500px (square) or 1500x500px (banner style)
  - Backgrounds: 1920x1080px or higher
- **Storage:** Supabase Storage with public access
- **Storage Structure:** `campaigns/{userId}/{campaignId}.png`
  - Organized by creator for easier management
  - Example path: `campaigns/user123abc/campaign456def.png`
  - Benefits: Easy batch deletion, clear ownership, simpler debugging

### Transparency Detection Algorithm
```javascript
// Client-side transparency detection
function hasTransparency(imageFile) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;
      
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 255) transparentPixels++;
      }
      
      const transparencyPercent = (transparentPixels / (pixels.length / 4)) * 100;
      resolve(transparencyPercent >= 5); // At least 5% transparency
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
}
```

### Slug Generation
- Convert title to lowercase
- Replace spaces with hyphens
- Remove special characters
- Append random 4-character suffix (alphanumeric, base36)
- No uniqueness check needed (collision probability extremely low)
- Example: "Save Earth 2025" → "save-earth-2025-k8m3"

```javascript
function generateSlug(title) {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/-+/g, '-')            // Multiple hyphens to single
    .substring(0, 50);              // Max 50 chars
  
  // Generate 4-char random suffix (0-9, a-z)
  const suffix = Math.random().toString(36).substring(2, 6);
  
  return `${baseSlug}-${suffix}`;
}
```

### Image Adjustment System
```javascript
// User photo adjustment state
{
  scale: 1.0,        // Zoom level (0.5 - 3.0)
  x: 0,              // Horizontal position
  y: 0,              // Vertical position
  rotation: 0        // Optional rotation (future)
}
```

### Edit Permission Logic (Hybrid Restrictions)
```javascript
// Check if campaign can be edited
function canEditCampaign(campaign) {
  const now = new Date();
  const publishDate = campaign.createdAt.toDate();
  const daysSincePublish = (now - publishDate) / (1000 * 60 * 60 * 24);
  
  // Check 1: Within 7 days of publish?
  const within7Days = daysSincePublish <= 7;
  
  // Check 2: Less than 10 supporters?
  const lessThan10Supporters = campaign.supportersCount < 10;
  
  // Can edit if BOTH conditions are true
  return within7Days && lessThan10Supporters;
}

// Display edit status to creator
function getEditStatus(campaign) {
  const now = new Date();
  const publishDate = campaign.createdAt.toDate();
  const daysRemaining = 7 - Math.floor((now - publishDate) / (1000 * 60 * 60 * 24));
  const supportersRemaining = 10 - campaign.supportersCount;
  
  if (canEditCampaign(campaign)) {
    return {
      canEdit: true,
      message: `Editable for ${daysRemaining} more days or ${supportersRemaining} more supporters`
    };
  } else {
    return {
      canEdit: false,
      message: "Campaign locked (7 days passed or 10+ supporters)"
    };
  }
}

// On first download, track firstUsedAt
function onCampaignDownload(campaignId) {
  const campaignRef = db.collection('campaigns').doc(campaignId);
  
  // Use transaction to safely increment and set firstUsedAt
  db.runTransaction(async (transaction) => {
    const campaign = await transaction.get(campaignRef);
    const currentCount = campaign.data().supportersCount;
    
    const updates = {
      supportersCount: currentCount + 1
    };
    
    // Set firstUsedAt on first download only
    if (currentCount === 0) {
      updates.firstUsedAt = new Date();
    }
    
    transaction.update(campaignRef, updates);
  });
}

// Delete campaign (creator only)
async function deleteCampaign(campaignId, userId) {
  const campaignRef = db.collection('campaigns').doc(campaignId);
  const campaign = await campaignRef.get();
  
  // Verify ownership
  if (campaign.data().creatorId !== userId) {
    throw new Error('Unauthorized: Only campaign creator can delete');
  }
  
  // Delete image from Supabase Storage
  const imageUrl = campaign.data().imageUrl;
  const imagePath = extractPathFromUrl(imageUrl);
  await deleteFile(imagePath); // Use Supabase storage delete function
  
  // Delete campaign document from Firestore
  await campaignRef.delete();
  
  return { success: true, message: 'Campaign deleted successfully' };
}

// Confirmation modal component (pseudocode)
function DeleteConfirmationModal({ campaignTitle, onConfirm, onCancel }) {
  return (
    <Modal>
      <h2>Delete Campaign?</h2>
      <p>Are you sure you want to delete "{campaignTitle}"?</p>
      <p className="warning">This action cannot be undone.</p>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onConfirm} className="danger">Delete Permanently</button>
    </Modal>
  );
}
```

---

## Development Steps (Phase 1)

### 1. Setup Data Structure
- [ ] Create Firestore collection: `campaigns`
- [ ] Create Firestore collection: `reports`
- [ ] Set up Supabase storage bucket: `campaigns` (organized by user: `campaigns/{userId}/{campaignId}.png`)
- [ ] Define data model interfaces

### 2. Build Entry Point
- [ ] Create `/create/page.js` - Choice between frame/background
- [ ] Design visual cards for frame vs background selection
- [ ] Add navigation links in header/hero

### 3. Build Upload Pages
- [ ] Create `/create/frame/page.js`
- [ ] Create `/create/background/page.js`
- [ ] Two-step flow: Upload image → Fill details
- [ ] Form validation with error handling
- [ ] Image preview components

### 4. Implement Image Processing
- [ ] Add transparency detection utility for frames
- [ ] File size and format validation
- [ ] Image preview before upload

### 5. Authentication Integration
- [ ] Allow unauthenticated form filling
- [ ] Create auth popup modal component
- [ ] Preserve form state during auth flow
- [ ] Handle auth success/failure

### 6. Storage Integration
- [ ] Create Supabase upload API routes
- [ ] Handle file uploads with progress (path: `campaigns/{userId}/{campaignId}.png`)
- [ ] Store metadata in Firestore
- [ ] Generate unique slugs with random suffix (no duplicate check needed)

### 7. Build Campaign View Page
- [ ] Create `/campaign/[slug]/page.js`
- [ ] Show campaign details and creator info
- [ ] Visitor upload interface
- [ ] Image adjustment controls (zoom, move, fit)
- [ ] Real-time preview canvas
- [ ] Download button (disabled until user photo uploaded)
- [ ] Sharing options integration

### 8. Implement Campaign Editing & Deletion
**Editing (Hybrid Restrictions):**
- [ ] Add "Edit Campaign" button on creator's own campaigns
- [ ] Implement `canEditCampaign()` permission check
- [ ] Show edit status: days/supporters remaining
- [ ] Create edit form (title, description, captionTemplate only)
- [ ] Update `updatedAt` timestamp on save
- [ ] Track `firstUsedAt` on first download
- [ ] Display lock message when 7 days or 10 supporters reached
- [ ] Prevent editing of immutable fields (image, type, slug)

**Deletion:**
- [ ] Add "Delete Campaign" button on creator's own campaigns
- [ ] Create `DeleteConfirmationModal` component
- [ ] Show warning: "This action cannot be undone"
- [ ] Verify creator ownership before deletion
- [ ] Delete image from Supabase Storage
- [ ] Delete campaign document from Firestore
- [ ] Redirect to profile/campaigns page after deletion
- [ ] Handle 404 for deleted campaign pages

### 9. Image Composition System
- [ ] Canvas-based image composition utility
- [ ] Handle frame overlays
- [ ] Handle background underlays
- [ ] Apply user adjustments (scale, position)
- [ ] Export to downloadable file

### 10. Create Campaigns Gallery
- [ ] Build `/campaigns/page.js`
- [ ] Fetch campaigns from Firestore
- [ ] Filter by country (use creator's profile country), time period, type
- [ ] Grid layout with campaign cards
- [ ] Sorting options

### 11. Create Top Creators Page
- [ ] Build `/creators/page.js`
- [ ] Aggregate creator stats (use creator's profile country for filtering)
- [ ] Filter by country and time period
- [ ] Leaderboard layout

### 12. Add Navigation
- [ ] Update header with "Create" link
- [ ] Update sidebar/mobile menu
- [ ] Update hero section CTA
- [ ] Add campaigns and creators to nav

### 13. Prevent Unauthorized Downloads
- [ ] Disable download button initially
- [ ] Enable only after user photo uploaded
- [ ] Show helpful message when disabled

### 14. Campaign Reporting System
- [ ] Create Firestore collection: `reports`
- [ ] Add "Report" button to campaign view page
- [ ] Create `ReportModal` component with reason selection
- [ ] Allow anonymous reporting (no auth required)
- [ ] Add API route to handle report submissions
- [ ] Increment `reportsCount` on campaign when reported
- [ ] Update `moderationStatus` if threshold reached (3+ reports)
- [ ] Prevent duplicate reports (check user ID or IP)
- [ ] Show confirmation message after report submitted
- [ ] Add report count badge for admin view (Phase 2)

---

## File Structure

**Note:** All campaign pages are placed under `(chrome)` folder to automatically include header/footer layout.

```
src/
├── app/
│   └── (chrome)/                    # Pages with header/footer (existing folder)
│       ├── create/                  # NEW: Create campaign pages
│       │   ├── page.js              # Entry: Choose frame or background
│       │   ├── frame/
│       │   │   └── page.js          # Frame upload workflow
│       │   └── background/
│       │       └── page.js          # Background upload workflow
│       ├── campaign/                # NEW: Campaign view pages
│       │   └── [slug]/
│       │       └── page.js          # Campaign view & usage page
│       ├── campaigns/               # NEW: Gallery page
│       │   └── page.js              # Unified gallery (frames + backgrounds)
│       └── creators/                # NEW: Creators page
│           └── page.js              # Top creators leaderboard
│
├── components/                      # Existing folder - add new components here
│   ├── CampaignChoice.js            # NEW: Frame vs background selection
│   ├── CampaignUploadForm.js        # NEW: Reusable upload form
│   ├── TransparencyDetector.js      # NEW: Transparency validation
│   ├── ImageAdjustmentTools.js      # NEW: Zoom, move, fit controls
│   ├── ImageComposer.js             # NEW: Canvas-based composition
│   ├── CampaignCard.js              # NEW: Gallery card component
│   ├── AuthPopup.js                 # NEW: Sign-in prompt modal
│   ├── DeleteConfirmationModal.js   # NEW: Campaign deletion confirmation
│   ├── ReportModal.js               # NEW: Campaign report modal
│   └── ShareButtons.js              # NEW: Social sharing component
│
└── utils/                           # Existing folder - add new utilities here
    ├── imageValidation.js           # NEW: Validation utilities
    ├── slugGenerator.js             # NEW: Slug generation logic
    ├── imageComposition.js          # NEW: Canvas manipulation
    └── campaignFilters.js           # NEW: Filter logic for gallery
```

**What to do with folders/files:**
- **Pages (under `(chrome)/`)**: Create NEW folders/files as needed during implementation
- **Components folder**: Already exists - add NEW campaign components here
- **Utils folder**: Already exists - add NEW utility functions here
- **Existing files**: Keep all existing files - don't modify unless necessary

---

## Admin Dashboard File Structure (Phase 2)

**Note:** Admin pages require authentication and admin role verification.

```
src/
├── app/
│   ├── (chrome)/                        # Existing folder
│   │   └── admin/                       # NEW (Phase 2): Admin dashboard pages
│   │       ├── layout.js                # Admin layout with sidebar navigation
│   │       ├── page.js                  # Admin dashboard home
│   │       ├── reports/
│   │       │   └── page.js              # Reports management page
│   │       ├── campaigns/
│   │       │   └── page.js              # All campaigns moderation
│   │       ├── users/
│   │       │   └── page.js              # User management page
│   │       └── analytics/
│   │           └── page.js              # Platform analytics
│   │
│   └── api/                             # Existing folder
│       └── admin/                       # NEW (Phase 2): Admin API routes
│           ├── reports/
│           │   ├── list/
│           │   │   └── route.js         # GET all reports with filters
│           │   ├── update/
│           │   │   └── route.js         # PUT update report status
│           │   └── bulk-action/
│           │       └── route.js         # POST batch actions on reports
│           ├── campaigns/
│           │   ├── moderate/
│           │   │   └── route.js         # POST remove/hide campaign
│           │   └── restore/
│           │       └── route.js         # POST restore removed campaign
│           ├── users/
│           │   ├── ban/
│           │   │   └── route.js         # POST ban user
│           │   └── warn/
│           │       └── route.js         # POST send warning to user
│           └── analytics/
│               └── route.js             # GET platform statistics
│
├── components/
│   └── admin/                           # NEW (Phase 2): Admin-specific components
│       ├── AdminSidebar.js              # Admin navigation sidebar
│       ├── ReportCard.js                # Report display card
│       ├── ReportFilters.js             # Filter controls for reports
│       ├── CampaignModerationCard.js    # Campaign card with admin actions
│       ├── UserManagementTable.js       # User list/table component
│       ├── BanUserModal.js              # Ban user confirmation modal
│       ├── RemoveCampaignModal.js       # Remove campaign modal with reason
│       ├── AdminStatsCard.js            # Dashboard statistics card
│       └── AdminActionLog.js            # Action history/audit log
│
├── middleware.js                        # UPDATE: Add admin route protection
│
└── utils/
    └── admin/                           # NEW (Phase 2): Admin utilities
        ├── adminAuth.js                 # Check if user is admin
        ├── moderationActions.js         # Moderation action helpers
        └── adminAnalytics.js            # Analytics aggregation functions
```

**Admin Access Control:**
```javascript
// middleware.js - Add admin route protection
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    // Check admin role from user profile
    const userProfile = await getUserProfile(user.uid);
    if (userProfile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

// Admin role in user profile schema
{
  uid: "user-id",
  email: "user@example.com",
  displayName: "User Name",
  role: "admin" | "user",  // NEW field for admin access
  ...other fields
}
```

**Admin Dashboard Layout:**
- Sidebar navigation with sections:
  - Dashboard (overview)
  - Reports (pending count badge)
  - Campaigns (moderation queue count)
  - Users (total active users)
  - Analytics (platform stats)
- Top bar with admin name and logout
- Main content area for each section
- Action confirmation modals
- Real-time notifications for new reports (optional)

---

## Success Metrics
- Campaign upload success rate
- Transparency detection accuracy
- Visitor engagement (uploads per campaign)
- Download completion rate
- Creator retention and activity
- Gallery browsing patterns
- Share button usage
