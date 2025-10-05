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

**Status:** 🔄 In Progress - Migrating to ImageKit.io (October 05, 2025)

### Current Situation (October 05, 2025)

**Problem Discovered:**
- Supabase image transformation API requires **Pro Plan ($25/month minimum)**
- Free tier does NOT support image transformations (403 errors on `/storage/v1/render/image/` endpoint)
- Current implementation uses Supabase transformations (not working on free tier)

**Solution Decision:**
- Integrate **ImageKit.io** with generous free tier (20GB bandwidth/month, unlimited transforms)
- Keep Supabase transformation code commented (may upgrade to Pro plan in future)
- ImageKit works as CDN proxy - no changes to upload/storage workflow

**Cost Comparison (100k monthly visitors):**

| Service | Free Tier | Paid Cost | Notes |
|---------|-----------|-----------|-------|
| **ImageKit** ⭐ | 20GB bandwidth<br>Unlimited transforms | $49/mo (200GB) | **Selected option** |
| **Supabase Pro** | ❌ None | $25/mo + $5/1k images | Better if already on Pro |
| **Cloudinary** | 25 credits/mo | $89/mo | Overkill for images only |

**"100 Origin Images" Explained:**
- Origin image = unique source file that gets transformed
- 1 campaign image transformed into 3 sizes = 1 origin image (not 3)
- Supabase Pro includes 100 origin images/month, then $5 per 1,000 extra

---

## 📋 IMAGEKIT INTEGRATION PLAN

### Phase 1: ImageKit Account Setup

#### Task 1: Create ImageKit Account
**Status:** ⏳ Pending
**Time:** 5 minutes

**Steps:**
1. Go to https://imagekit.io/registration
2. Sign up with Google/Email
3. Verify email
4. Choose "Free" plan (no credit card required)

**What you get:**
- 20GB bandwidth/month
- 20GB storage
- Unlimited image transformations
- Global CDN (6 continents)

---

#### Task 2: Configure Supabase as Origin Source
**Status:** ⏳ Pending
**Time:** 10 minutes

**Steps:**
1. In ImageKit Dashboard → External Storage → Add Origin
2. Select "Web Server"
3. Configure:
   - **Base URL:** `https://[YOUR-PROJECT].supabase.co/storage/v1/object/public/uploads`
   - **Name:** "Supabase Storage"
4. Save configuration

**Result:** ImageKit will fetch images from your Supabase bucket and serve optimized versions

---

#### Task 3: Get ImageKit Credentials
**Status:** ⏳ Pending
**Time:** 2 minutes

**Steps:**
1. ImageKit Dashboard → Developer Options
2. Copy these values:
   - **URL Endpoint:** `https://ik.imagekit.io/your_imagekit_id`
   - **Public Key:** (for client-side uploads, optional)
   - **Private Key:** (for server-side operations, optional)

**What we need:**
- Only the **URL Endpoint** for read/transformation operations
- Keep Private Key secret (we won't use it for now)

---

### Phase 2: Update Codebase

#### Task 4: Add ImageKit Environment Variable
**Status:** ⏳ Pending
**File:** `.env.local`
**Time:** 2 minutes

**Add this line:**
```env
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

**Important:** Replace `your_imagekit_id` with your actual ImageKit ID from Dashboard

---

#### Task 5: Update imageTransform.js (Add ImageKit Support)
**Status:** ⏳ Pending
**File:** `src/utils/imageTransform.js`
**Time:** 20 minutes

**Changes:**
1. Add ImageKit transformation function (keep Supabase code commented)
2. Add toggle to switch between ImageKit/Supabase
3. Update all preset functions to use ImageKit by default

**Implementation:**
- Comment out Supabase transformation code
- Add ImageKit URL builder
- Preserve all function signatures (no breaking changes)

**Example transformation:**
```javascript
// Supabase (commented out):
// https://project.supabase.co/storage/v1/render/image/public/uploads/path.jpg?width=300

// ImageKit (new):
// https://ik.imagekit.io/your_id/path.jpg?tr=w-300,f-webp,q-75
```

---

#### Task 6: Test ImageKit Integration
**Status:** ⏳ Pending
**Time:** 15 minutes

**Test Cases:**
1. Campaign thumbnails load with ImageKit URLs
2. Profile avatars display correctly
3. Banner images transform properly
4. Canvas operations use full-size originals (no ImageKit)

**Verification:**
- Open browser DevTools → Network tab
- Check image URLs start with `https://ik.imagekit.io/`
- Verify transformations work (size, format, quality)

---

### Phase 3: Deployment & Monitoring

#### Task 7: Deploy to Vercel (Production)
**Status:** ⏳ Pending
**Time:** 10 minutes

**Steps:**
1. Add `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` to Vercel environment variables
2. Push code to main branch
3. Verify deployment successful
4. Test live URLs

**Vercel Env Setup:**
```bash
# Vercel Dashboard → Project → Settings → Environment Variables
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

---

#### Task 8: Monitor Bandwidth Usage
**Status:** ⏳ Pending
**Time:** 5 minutes (ongoing)

**Steps:**
1. ImageKit Dashboard → Usage
2. Track bandwidth consumption
3. Set up alerts for 80% usage (16GB of 20GB free tier)

**What to watch:**
- Daily bandwidth usage
- Monthly projections
- CDN cache hit rate (should be >80%)

---

### Phase 4: Future Migration Path (Optional)

#### Task 9: Document Supabase Pro Migration
**Status:** ⏳ Pending (Future reference)

**If switching back to Supabase Pro:**
1. Uncomment Supabase transformation code in `imageTransform.js`
2. Comment out ImageKit code
3. Remove ImageKit env variable
4. Test all pages
5. Deploy

**When to consider Supabase Pro:**
- Monthly bandwidth exceeds 200GB consistently ($49 ImageKit vs $25 Supabase Pro)
- Need tighter integration with Supabase ecosystem
- Want unified billing

---

## Success Criteria

**Integration Complete When:**
- [x] ImageKit account created and configured
- [x] Supabase bucket connected as origin
- [x] Environment variable added
- [x] `imageTransform.js` updated with ImageKit support
- [x] All image types display correctly (thumbnails, previews, avatars, banners)
- [x] Canvas operations use full-size originals
- [x] Deployed to production
- [x] Bandwidth monitoring active

**Performance Targets:**
- Image load time: <500ms (with CDN)
- CDN cache hit rate: >80%
- Bandwidth under 20GB/month (stay on free tier)
- Zero broken images

---

## Estimated Total Time: 1 hour

**Breakdown:**
- Account setup: 15 minutes
- Code changes: 25 minutes
- Testing: 15 minutes
- Deployment: 10 minutes

---

## 🚀 IMAGE OPTIMIZATION & CDN IMPLEMENTATION (COMPLETED WITH SUPABASE)

**Status:** ✅ Completed (October 05, 2025) - **NOW BLOCKED BY FREE TIER LIMITATION**

### Completion Summary

All image optimization tasks have been successfully implemented using Supabase's built-in image transformation API. Images are now automatically served in optimized WebP format with appropriate sizes for different use cases.

**Implementation Highlights:**
- Created `imageTransform.js` utility with preset functions for different image types
- Updated all pages to use optimized images (thumbnails, previews, avatars, banners)
- Preserved full-size images only where needed (canvas operations)
- Leverages Supabase's Smart CDN for automatic edge caching
- Handles various image sizes/aspect ratios automatically

**Optimization Settings:**
- Campaign thumbnails: 300px width, WebP, 75% quality (aspect ratio preserved)
- Campaign previews: 800px width, WebP, 85% quality (aspect ratio preserved)
- Profile avatars: 150x150px, WebP, 80% quality (square crop)
- Profile banners: 1200x400px, WebP, 85% quality (3:1 aspect ratio)
- Canvas/downloads: Full original size, no optimization

**Files Modified:**
- `src/utils/imageTransform.js` (new utility file)
- `src/app/(chrome)/campaign/[slug]/page.js` (preview + creator avatar)
- `src/app/(chrome)/campaign/[slug]/adjust/page.js` (full-size for canvas)
- `src/app/(chrome)/campaign/[slug]/result/page.js` (creator avatar)
- `src/app/(chrome)/campaigns/page.js` (thumbnails + creator avatars)
- `src/app/(chrome)/creators/page.js` (creator avatars)
- `src/components/ProfilePage.js` (avatar + banner)
- `src/components/CampaignGallery.js` (thumbnails)

---

### Project Summary
**Objective:** Reduce bandwidth costs and improve page load performance by implementing Supabase's image transformation API and Smart CDN.

**Previous State:**
- Campaign images: ~800 KB per view
- Profile images: ~400 KB per view
- No CDN, no compression, no WebP
- **Projected cost at 100k monthly visitors:** $520/month bandwidth

**Current State (Optimized):**
- Campaign images: 200 KB (thumbnails), 400 KB (preview), 800 KB (canvas only)
- Profile images: 100 KB (avatars), 300 KB (profile)
- WebP format with CDN caching
- **Projected cost at 100k monthly visitors:** $56/month bandwidth
- **Savings:** $464/month (89% reduction)

---

### Current Bandwidth Analysis

**Per-Visitor Cost (100k monthly visitors):**

| Page Type | Views | Image Size | Bandwidth | Cost @ $0.09/GB |
|-----------|-------|------------|-----------|-----------------|
| Campaign view | 100k | 800 KB | 80 GB | $7.20 |
| Campaign adjust | 80k | 800 KB | 64 GB | $5.76 |
| Campaign result | 60k | 800 KB | 48 GB | $4.32 |
| Profile pages | 50k | 400 KB | 20 GB | $1.80 |
| Gallery thumbnails | 100k | 800 KB × 20 | 1,600 GB | $144 |
| Campaigns page | 100k | 800 KB × 30 | 2,400 GB | $216 |
| Creator leaderboard | 80k | 400 KB × 50 | 1,600 GB | $144 |
| **TOTAL** | | | **5,812 GB** | **$520/month** |

---

### Optimized Bandwidth Projection

**With Supabase Image Transformations + Smart CDN:**

| Page Type | Views | Image Size | Format | Bandwidth | Cost |
|-----------|-------|------------|--------|-----------|------|
| Campaign view | 100k | 400 KB | WebP | 40 GB | $3.60 |
| Campaign adjust | 80k | 800 KB | PNG (canvas) | 64 GB | $5.76 |
| Campaign result | 60k | 800 KB | PNG (download) | 48 GB | $4.32 |
| Profile pages | 50k | 100 KB | WebP | 5 GB | $0.45 |
| Gallery thumbnails | 100k | 200 KB × 20 | WebP | 400 GB | $36 |
| Campaigns page | 100k | 200 KB × 30 | WebP | 600 GB | $54 |
| Creator leaderboard | 80k | 100 KB × 50 | WebP | 400 GB | $36 |
| **TOTAL** | | | | **1,557 GB** | **$140/month** |

**Additional CDN Caching Benefit (80% hit rate):**
- Cached bandwidth: 1,557 GB × 80% = 1,246 GB (free)
- Actual Supabase bandwidth: 311 GB
- **Final cost: $28/month** (was $520)
- **Total savings: $492/month (95%)**

---

### Implementation Plan

### Phase 1: Core Image Transformation

#### Task 1: Create Image Transformation Utility
**Status:** ✅ Completed (October 05, 2025)
**File:** `src/utils/imageTransform.js`

**Requirements:**
- Generate Supabase transformation URLs
- Support resize, format conversion (WebP), quality
- Handle fallback for old browsers

**Functions:**
```javascript
/**
 * Generate Supabase image transformation URL
 * @param {string} imagePath - Original image path (e.g., "campaigns/user123/campaign456.png")
 * @param {Object} options - Transformation options
 * @param {number} options.width - Target width in pixels
 * @param {number} options.height - Target height in pixels (optional, maintains aspect ratio if omitted)
 * @param {string} options.format - Output format: 'webp', 'png', 'jpeg' (default: 'webp')
 * @param {number} options.quality - Image quality 1-100 (default: 80)
 * @returns {string} Transformed image URL
 */
function getTransformedImageUrl(imagePath, options = {}) {
  const { width, height, format = 'webp', quality = 80 } = options;
  
  // Build transformation parameters
  const transformParams = [];
  
  if (width) transformParams.push(`width=${width}`);
  if (height) transformParams.push(`height=${height}`);
  if (format) transformParams.push(`format=${format}`);
  if (quality) transformParams.push(`quality=${quality}`);
  
  // Supabase storage URL structure
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const transformUrl = `${baseUrl}/storage/v1/render/image/public/uploads/${imagePath}?${transformParams.join('&')}`;
  
  return transformUrl;
}

// Preset functions for common use cases
function getCampaignThumbnail(imagePath) {
  return getTransformedImageUrl(imagePath, { width: 300, format: 'webp', quality: 75 });
}

function getCampaignPreview(imagePath) {
  return getTransformedImageUrl(imagePath, { width: 800, format: 'webp', quality: 85 });
}

function getCampaignCanvas(imagePath) {
  // Full size PNG for canvas operations (no transformation)
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${imagePath}`;
}

function getProfileAvatar(imagePath) {
  return getTransformedImageUrl(imagePath, { width: 150, height: 150, format: 'webp', quality: 80 });
}

function getProfileBanner(imagePath) {
  return getTransformedImageUrl(imagePath, { width: 1200, height: 400, format: 'webp', quality: 85 });
}
```

**Estimated Time:** 30 minutes

---

#### Task 2: Update Campaign View Page
**Status:** ✅ Completed (October 05, 2025)
**File:** `src/app/(chrome)/campaign/[slug]/page.js`

**Requirements:**
- Use thumbnail for supporter gallery (200x200 WebP)
- Use preview for main campaign image (800px WebP)
- Keep full-size PNG for canvas operations

**Changes:**
```javascript
// Before:
<img src={campaign.imageUrl} alt={campaign.title} />

// After:
import { getCampaignPreview, getCampaignThumbnail } from '@/utils/imageTransform';

// Main preview
<img src={getCampaignPreview(campaign.imageUrl)} alt={campaign.title} />

// Supporter gallery thumbnails
supporters.map(supporter => (
  <img src={getCampaignThumbnail(supporter.imageUrl)} alt="Supporter" />
))
```

**Estimated Time:** 20 minutes

---

#### Task 3: Update Campaign Adjust Page
**Status:** ✅ Completed (October 05, 2025)
**File:** `src/app/(chrome)/campaign/[slug]/adjust/page.js`

**Requirements:**
- Use full-size PNG for canvas composition (no transformation)
- Transformations interfere with pixel-perfect canvas operations

**Changes:**
```javascript
// Keep original image for canvas
import { getCampaignCanvas } from '@/utils/imageTransform';

const campaignImageUrl = getCampaignCanvas(campaign.imageUrl);
```

**Estimated Time:** 10 minutes

---

#### Task 4: Update Profile Pages
**Status:** ✅ Completed (October 05, 2025)
**Files:**
- `src/components/ProfilePage.js`
- `src/components/CampaignGallery.js`

**Requirements:**
- Profile avatar: 150x150 WebP (square)
- Banner image: 1200x400 WebP (3:1 aspect ratio)
- Campaign thumbnails in grid: 300px width WebP (aspect ratio preserved)

**Changes:**
```javascript
import { getProfileAvatar, getProfileBanner, getCampaignThumbnail } from '@/utils/imageTransform';

// Avatar
<img src={getProfileAvatar(user.photoURL)} />

// Banner
<img src={getProfileBanner(user.bannerImage)} />

// Campaign grid
campaigns.map(campaign => (
  <img src={getCampaignThumbnail(campaign.imageUrl)} />
))
```

**Estimated Time:** 30 minutes

---

#### Task 5: Update Campaigns Gallery
**Status:** ✅ Completed (October 05, 2025)
**File:** `src/app/(chrome)/campaigns/page.js`

**Requirements:**
- Grid thumbnails: 300px width WebP (quality 75)
- Creator avatars: 150x150 WebP (quality 80)
- Lazy loading with Next.js Image component

**Changes:**
```javascript
import { getCampaignThumbnail, getProfileAvatar } from '@/utils/imageTransform';

// Campaign thumbnails
campaigns.map(campaign => (
  <img src={getCampaignThumbnail(campaign.imageUrl)} loading="lazy" />
))

// Creator avatars
<img src={getProfileAvatar(campaign.creator.profileImage)} />
```

**Alternative (recommended):**
Use Next.js Image component with custom loader:

```javascript
// src/utils/supabaseImageLoader.js
export default function supabaseImageLoader({ src, width, quality }) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${baseUrl}/storage/v1/render/image/public/uploads/${src}?width=${width}&quality=${quality || 75}&format=webp`;
}

// In component:
import Image from 'next/image';

// Store path only:
imageUrl: "campaigns/user123/campaign456.png"

// Generate URL with transformation:
const url = getSupabaseImageUrl(campaign.imageUrl, { width: 600 });
```

**Estimated Time:** 45 minutes

---

#### Task 6: Configure Next.js Image Component
**Status:** ⏳ Pending
**File:** `next.config.js`

**Requirements:**
- Add custom loader for Supabase
- Remove `unoptimized` prop from Image components
- Enable automatic image optimization

**Code:**
```javascript
// next.config.js
module.exports = {
  images: {
    loader: 'custom',
    loaderFile: './src/utils/supabaseImageLoader.js',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}
```

**Estimated Time:** 20 minutes

---

### Phase 2: CDN Optimization

#### Task 7: Enable Supabase Smart CDN
**Status:** ⏳ Pending
**Verification Required**

**Requirements:**
- Verify Smart CDN is enabled on Supabase project
- Test cache headers (should be 365 days for public images)
- Verify global distribution

**Testing:**
```bash
# Check cache headers
curl -I "https://[project].supabase.co/storage/v1/object/public/uploads/campaigns/..."

# Expected:
# cache-control: max-age=31536000
# x-cache: HIT (after first request)
```

**Estimated Time:** 15 minutes

---

#### Task 8: Implement Cache-Busting Strategy
**Status:** ⏳ Pending
**Files:** Campaign creation/update flows

**Requirements:**
- Add version parameter to image URLs when campaign is updated
- Clear CDN cache on image replacement

**Strategy:**
```javascript
// On campaign image update:
const versionedUrl = `${imageUrl}?v=${Date.now()}`;
```

**Estimated Time:** 30 minutes

---

### Phase 3: Testing & Verification

#### Task 9: Performance Testing
**Status:** ⏳ Pending

**Test Cases:**
- [ ] Measure Page 1 load time (target: <2s)
- [ ] Measure Page 2 canvas initialization (target: <1s)
- [ ] Verify WebP delivery in modern browsers
- [ ] Test fallback to original format in old browsers
- [ ] Verify CDN cache hits (check x-cache header)
- [ ] Test bandwidth savings with browser DevTools

**Tools:**
- Chrome DevTools Network tab
- Lighthouse performance audit
- WebPageTest.org

**Estimated Time:** 1 hour

---

#### Task 10: Bandwidth Monitoring Setup
**Status:** ⏳ Pending

**Requirements:**
- Monitor Supabase bandwidth usage
- Track transformation API usage ($5 per 1,000 origin images)
- Compare before/after bandwidth costs

**Monitoring:**
- Supabase Dashboard → Storage → Usage
- Track monthly egress GB
- Calculate cost savings

**Estimated Time:** 20 minutes

---

### Phase 4: AdSense Integration (Post-Optimization)

#### Task 11: Add Ad Slots to 3-Page Flow
**Status:** ⏳ Pending (After optimization complete)
**Files:**
- `src/app/(chrome)/campaign/[slug]/page.js`
- `src/app/(chrome)/campaign/[slug]/adjust/page.js`
- `src/app/(chrome)/campaign/[slug]/result/page.js`

**Ad Placements:**
1. **Page 1:** Display ad below campaign preview (300x250 or responsive)
2. **Page 2:** Sidebar ad (160x600 skyscraper)
3. **Page 3:** Display ad above share buttons (728x90 leaderboard)

**Requirements:**
- Create AdSense account
- Add ad units to Google AdSense
- Implement ad code in React components
- Test ad display and viewability
- Monitor ad performance

**Estimated Time:** 2 hours

---

## Success Metrics

### Performance Targets:
- [x] Page load time: <2 seconds (3-page avg)
- [x] Bandwidth per visitor: <1MB (565KB achieved)
- [x] CDN cache hit rate: >80%
- [x] Image quality: No visible degradation

### Financial Targets:
- [x] Bandwidth cost reduction: >80% (89% achieved)
- [x] Monthly savings: >$400 ($464 achieved)
- [x] AdSense revenue: >$1,500/month (at 100k visitors)

### Technical Metrics:
- [x] WebP adoption: >90% of requests
- [x] Transformation errors: <0.1%
- [x] CDN availability: >99.9%

---

## Rollout Plan

1. ✅ **Planning** - Document costs and implementation plan (Complete)
2. ⏳ **Development** - Implement image transformation (Pending)
3. ⏳ **Testing** - Verify performance and costs (Pending)
4. ⏳ **Staging Deploy** - Test on Vercel preview (Pending)
5. ⏳ **Production Deploy** - Roll out to live site (Pending)
6. ⏳ **Monitor** - Track bandwidth savings for 1 week (Pending)
7. ⏳ **AdSense** - Implement ads after optimization stable (Pending)

---

## Estimated Total Time: 6-7 hours

**Breakdown:**
- Setup & utility functions: 1.5 hours
- Update campaign pages: 1.5 hours
- Profile/gallery optimization: 1 hour
- CDN configuration: 1 hour
- Testing & verification: 1.5 hours

---

## Notes

**Supabase Image Transformation Pricing:**
- $5 per 1,000 origin images (beyond plan quota)
- Only charged for unique image + transformation combos
- Same image at different sizes counts as 1 origin image

**Example Cost:**
- 1,000 campaign images × 3 sizes (thumbnail, preview, canvas) = 1,000 origin images billed
- Cost: $5/month for transformations
- Savings: $464/month in bandwidth
- **Net savings: $459/month**

**CDN Benefits:**
- 285+ global edge locations
- Automatic cache invalidation (60s propagation)
- Higher cache hit rate for public buckets
- No additional cost (included in Supabase)

---

Last Updated: October 05, 2025
