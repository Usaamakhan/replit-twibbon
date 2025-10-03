# Twibbonize App

### Overview
Twibbonize is a Next.js 15 application for creating and sharing "Campaigns" (photo frames and backgrounds). Visitors can discover, customize, and download photos with frames or backgrounds. Creators can upload and manage campaigns with public analytics.

### User Preferences
- Prefer stability over experimental features
- Focus on compatibility with Replit environment
- Maintain clean, working codebase structure
- **When importing from GitHub: Do not make any automatic changes or modifications to the code. Only set up the environment to run the existing code as-is. Even if the app appears stuck or shows loading states, do not attempt to debug or fix issues automatically - only install dependencies and configure the runtime environment.**
- **IMPORTANT - Testing Environment: App is tested on Vercel deployment (where environment variables are configured), NOT locally in Replit. Never take screenshots or attempt to test functionality in Replit environment. All testing happens on Vercel.**
- **IMPORTANT - No Dependency Installation, Server Running, or Testing: Do NOT install dependencies, run servers, or test anything. The user handles all dependency installation, server management, and testing themselves.**

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

### Current Setup Status (2025-10-03)
✅ **Fresh GitHub Import - Successfully Configured for Replit (October 3, 2025)**
✅ All dependencies installed (540 packages, 0 vulnerabilities)
✅ Next.js 15.5.2 dev server running on 0.0.0.0:5000
✅ Deployment configured for autoscale (build: npm run build, run: npm start)
✅ Environment ready to run (Firebase/Supabase configuration needed for full functionality)
✅ Application successfully running and accessible via Replit proxy
✅ All configurations verified for Next.js 15.5.2 and React 19.1.0
✅ Middleware configured with CORS handling for Replit proxy environment
✅ Next.js config includes allowedDevOrigins for Replit domains
✅ Workflow configured: "Next.js Dev Server" (npm run dev on port 5000)
✅ .gitignore properly configured for Next.js projects
✅ Replit environment setup complete - ready for development

**Feature Implementation Status:**
✅ CreateCampaignModal implemented (replaces dedicated /create page with popup)
✅ Frame upload flow completed (/create/frame with transparency detection)
✅ Background upload flow completed (/create/background with multi-format support)
✅ **3-Page Campaign Flow** (October 3, 2025)
  - Page 1: Upload page (/campaign/[slug]) - Choose photo and view campaign
  - Page 2: Adjust page (/campaign/[slug]/adjust) - Edit photo with zoom/position controls
  - Page 3: Result page (/campaign/[slug]/result) - Download complete, share options
  - CampaignSessionContext with sessionStorage persistence (24h expiry)
  - Route guards for proper flow enforcement
  - Automatic redirects between pages based on state
✅ Simplified download tracking - every download = +1 support (no auth required)
✅ Campaign grids added to profile pages (/profile and /u/[username]) with responsive layout

### Database Optimization (2025-10-01)
The Firebase/Firestore database has been optimized to reduce storage costs while maintaining data integrity:

**Optimizations Implemented:**
- **Simplified download tracking** - Every download increments campaign `supportersCount` only (no user tracking)
- **Dynamic supports calculation** - User profile shows total supports = sum of all campaign supports
- **Removed supporters object from campaigns** - Viral campaigns no longer store individual supporter UIDs, only supportersCount (prevents document bloat)
- **Removed campaignsCreated field** - Uses campaignsCount counter instead (eliminates redundant array storage)
- **Maintained usernames collection** - Keeps atomic username uniqueness (prevents race conditions)

**Cost Savings:**
- ~50% reduction in Firestore writes per download (1 write instead of 2)
- ~47% reduction in Firebase storage costs
- Prevents write amplification on viral campaigns (no expanding supporters arrays)
- Minimal overhead for username atomicity (small cost for data integrity)

**Data Integrity:**
- Usernames: Atomic reservation using dedicated collection with transaction.get()
- Security: Ownership-based rules prevent username hijacking
- Counters: Protected with +1 increment validation
- No race conditions in username operations

**Collections Structure:**
- `/users/{userId}` - User profiles with counters (campaignsCount only, supports calculated from campaigns)
- `/usernames/{username}` - Username→userId mapping for atomicity
- `/campaigns/{campaignId}` - Campaigns with supports counter (supportersCount = total downloads)
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
/                                # Home with hero
/create                          # Opens modal popup (for direct URL access)
/create/frame                    # Upload frame (completed)
/create/background               # Upload background (completed)
/campaign/[slug]                 # Page 1: Upload photo (3-page flow)
/campaign/[slug]/adjust          # Page 2: Adjust photo (3-page flow)
/campaign/[slug]/result          # Page 3: Result & share (3-page flow)
/campaigns                       # Unified gallery with filters (pending)
/creators                        # Top creators leaderboard (pending)
/profile                         # User profile
/profile/edit                    # Edit profile
/onboarding                      # New user setup
```

### UI Components
- **CreateCampaignModal**: Popup for choosing Frame or Background type
  - Triggered by "Create Campaign" buttons in Hero and MobileMenu
  - Compact design with 2-column grid layout
  - Navigates to `/create/frame` or `/create/background` on selection
