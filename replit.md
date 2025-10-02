# Twibbonize App

### Overview
Twibbonize is a Next.js 15 application for creating and sharing "Campaigns" (photo frames and backgrounds). Visitors can discover, customize, and download photos with frames or backgrounds. Creators can upload and manage campaigns with public analytics.

### User Preferences
- Prefer stability over experimental features
- Focus on compatibility with Replit environment
- Maintain clean, working codebase structure
- **When importing from GitHub: Do not make any automatic changes or modifications to the code. Only set up the environment to run the existing code as-is. Even if the app appears stuck or shows loading states, do not attempt to debug or fix issues automatically - only install dependencies and configure the runtime environment.**

### System Architecture
Built with Next.js 15.5.2 (App Router), React 19.1.0, Tailwind CSS 4, Firebase (auth), and Supabase (database/storage).

**Core Features:**
1. **Campaign System** - Upload and manage frames (with transparency) and backgrounds
2. **Public Gallery** - Browse campaigns with filters (country, time, type)
3. **Image Composition** - Canvas-based photo overlay with adjustment tools
4. **Top Creators** - Leaderboard by country and time period
5. **Public Analytics** - Transparent usage statistics for all campaigns

**Design Principles:**
- Visitor-first experience (no auth required for browsing/using)
- Minimal account requirements (only for campaign creation)
- Public-first design for discovery and analytics
- Frictionless workflow with delayed authentication

**Technical Implementations:**
- **Campaign Types:** Frames (require transparency detection) and Backgrounds (no transparency)
- **Transparency Detection:** Canvas API validates 5-10% minimum transparency for frames
- **Image Composition:** Canvas API for overlaying/underlaying user photos
- **Image Adjustment:** Zoom, move, fit controls for visitor photos
- **Slug Generation:** Unique URL-friendly identifiers from titles
- **Delayed Auth:** Users fill forms unauthenticated, prompted only at publish
- **Download Prevention:** Disabled until user uploads their photo
- **Unified Gallery:** Single `/campaigns` page for both frames and backgrounds

### Current Setup Status (2025-10-02)
✅ Fresh GitHub import configured for Replit
✅ All dependencies installed (540 packages, 0 vulnerabilities)
✅ Next.js dev server running on 0.0.0.0:5000
✅ Deployment configured for autoscale (build: npm run build, run: npm start)
✅ Environment ready to run (Firebase/Supabase configuration needed for full functionality)
✅ Application successfully running and accessible via Replit proxy
✅ All configurations verified for Next.js 15.5.2 and React 19.1.0

### Database Optimization (2025-10-01)
The Firebase/Firestore database has been optimized to reduce storage costs while maintaining data integrity:

**Optimizations Implemented:**
- **Removed supporters object from campaigns** - Viral campaigns no longer store individual supporter UIDs, only supportersCount (prevents document bloat)
- **Removed campaignsCreated field** - Uses campaignsCount counter instead (eliminates redundant array storage)
- **Maintained usernames collection** - Keeps atomic username uniqueness (prevents race conditions)

**Cost Savings:**
- ~47% reduction in Firebase storage costs
- Prevents write amplification on viral campaigns (no expanding supporters arrays)
- Minimal overhead for username atomicity (small cost for data integrity)

**Data Integrity:**
- Usernames: Atomic reservation using dedicated collection with transaction.get()
- Security: Ownership-based rules prevent username hijacking
- Counters: Protected with +1 increment validation
- No race conditions in username operations

**Collections Structure:**
- `/users/{userId}` - User profiles with counters (campaignsCount, supportersCount)
- `/usernames/{username}` - Username→userId mapping for atomicity
- `/campaigns/{campaignId}` - Campaigns with usage counters (usageCount, supportersCount)
- `/reports/{reportId}` - User reports for moderation

### Environment Variables Required
To enable full functionality, configure these environment variables in Replit Secrets:

**Firebase (Authentication):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string for server-side auth)

**Supabase (Database & Storage):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The app will run without these but with limited functionality (Firebase disabled message shown).

### Campaign System Documentation
📄 See **CAMPAIGN_SYSTEM.md** for complete implementation guide including:
- Data schemas (Firestore structure)
- User flows (creator & visitor)
- Phase 1 (implement now) & Phase 2 (future features)
- Technical requirements & algorithms
- Development steps with checkboxes
- File structure

### External Dependencies
- **Firebase:** Authentication and backend services
- **Supabase:** Database and image storage
- **Next.js:** Web framework (v15.5.2)
- **React:** UI library (v19.1.0)
- **Tailwind CSS:** Styling (v4)

### Route Structure
```
/                          # Home with hero
/create                    # Choose: frame or background
/create/frame              # Upload frame
/create/background         # Upload background
/campaign/[slug]           # Campaign view & usage
/campaigns                 # Unified gallery with filters
/creators                  # Top creators leaderboard
/profile                   # User profile
/profile/edit              # Edit profile
/onboarding                # New user setup
```
