# Code Inconsistencies & Issues - Twibbonize Platform

**Last Updated:** October 31, 2025  
**Comprehensive Admin System Audit**

---

## Admin System - Issues & Recommendations

### 🔴 Critical Issues

#### 1. Incomplete Status Color Helper Function
**Location:** `src/utils/admin/adminHelpers.js` (line 39-50)

**Issue:** The `getModerationStatusColor()` function is missing support for several statuses that are actively used in the system.

**Current Implementation:**
```javascript
export function getModerationStatusColor(status) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'under-review':
      return 'bg-yellow-100 text-yellow-800';
    case 'removed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
```

**Missing Statuses:**
- `under-review-hidden` - Used when campaigns have 3+ reports or users have 10+ reports
- `removed-temporary` - Used for campaigns with 30-day appeal window
- `removed-permanent` - Used for permanent campaign removals
- `banned-temporary` - Used for temporarily banned users
- `banned-permanent` - Used for permanently banned users
- `deleted` - Used when target is deleted but summary exists

**Impact:** Status badges in `GroupedReportsTable` and other admin components fall back to gray color for these statuses, reducing visibility and making it harder for admins to quickly identify problematic content.

**Recommended Fix:**
```javascript
export function getModerationStatusColor(status) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'under-review':
      return 'bg-yellow-100 text-yellow-800';
    case 'under-review-hidden':
      return 'bg-orange-100 text-orange-800';
    case 'removed':
    case 'removed-temporary':
      return 'bg-red-100 text-red-800';
    case 'removed-permanent':
      return 'bg-red-200 text-red-900';
    case 'banned-temporary':
      return 'bg-red-100 text-red-800';
    case 'banned-permanent':
      return 'bg-red-200 text-red-900';
    case 'deleted':
      return 'bg-gray-200 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
```

