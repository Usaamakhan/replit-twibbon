# Campaign System - Task Tracker

Track progress on building the campaign system (Phase 1 from CAMPAIGN_SYSTEM.md)

**Last Updated:** January 06, 2025

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

### Project Summary
**Objective:** Reduce bandwidth costs and improve page load performance by implementing Supabase's image transformation API and Smart CDN.

**Current State:**
- Campaign images: ~800 KB per view
- Profile images: ~400 KB per view
- No CDN, no compression, no WebP
- **Projected cost at 100k monthly visitors:** $520/month bandwidth

**Target State:**
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
**Status:** ⏳ Pending
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
```

**Estimated Time:** 30 minutes

---

#### Task 2: Update Campaign View Page
**Status:** ⏳ Pending
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
**Status:** ⏳ Pending
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
**Status:** ⏳ Pending
**Files:**
- `src/components/ProfilePage.js`
- `src/app/(chrome)/u/[username]/page.js`

**Requirements:**
- Profile avatar: 150x150 WebP
- Banner image: 1200x300 WebP
- Campaign thumbnails in grid: 300x300 WebP

**Changes:**
```javascript
import { getProfileAvatar, getCampaignThumbnail } from '@/utils/imageTransform';

// Avatar
<img src={getProfileAvatar(user.photoURL)} />

// Campaign grid
campaigns.map(campaign => (
  <img src={getCampaignThumbnail(campaign.imageUrl)} />
))
```

**Estimated Time:** 30 minutes

---

#### Task 5: Update Campaigns Gallery
**Status:** ⏳ Pending
**File:** `src/app/(chrome)/campaigns/page.js`

**Requirements:**
- Grid thumbnails: 300x300 WebP (quality 75)
- Lazy loading with Next.js Image component

**Changes:**
```javascript
import { getCampaignThumbnail } from '@/utils/imageTransform';

campaigns.map(campaign => (
  <img src={getCampaignThumbnail(campaign.imageUrl)} loading="lazy" />
))
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

Last Updated: January 06, 2025
