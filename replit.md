# Twibbonize App - Next.js Project

### Overview
This is a Next.js 15 application with React 19 and Tailwind CSS, designed for creating and sharing "Twibbons" (frames for photos). The core purpose is to provide a seamless experience for visitors to discover, use, and download framed photos without requiring account creation. For creators, it offers tools to upload, manage, and track the performance of their custom frames. The project prioritizes accessibility and public transparency, making frame usage and analytics available to all users.

### User Preferences
- Prefer stability over experimental features
- Focus on compatibility with Replit environment
- Maintain clean, working codebase structure

### System Architecture
The application is built with Next.js 15.5.2 (App Router) and React 19.1.0, styled using Tailwind CSS 4. It's configured for optimal performance within the Replit environment, including specific host and CORS settings.

**Core Features (Implementation Priority):**
1.  **Public Gallery:** Displays all publicly available frames, serving as the primary visitor interaction point. All content and analytics are publicly accessible.
2.  **Frame Analytics:** Provides public usage statistics (uses, downloads, popularity over time, country-based metrics) for transparency and community engagement.
3.  **Trending & Top Creators:** Highlights popular frames and successful creators based on actual usage data.
4.  **User Accounts (Creators Only):** Streamlined system for frame upload and management.

**Development Guidelines:**
- Prioritize the visitor experience; features must work for non-authenticated users first.
- Account requirements are minimal, only for frame uploads.
- Public-first design for all discovery and analytics features.
- Seamless frame usage: frictionless photo upload, frame overlay, and download for visitors.

**Technical Implementations:**
- Centralized Firebase error handling for consistent, secure, and user-friendly error messages.
- Simple global loading states using `loading.js` for consistent user feedback.
- Authentication flows utilize dedicated pages (`/signin`, `/signup`, `/forgot-password`) rather than modals.
- User onboarding (e.g., profile setup) is managed via a dedicated `/onboarding` page, accessible after authentication.

### External Dependencies
- **Firebase:** Used for authentication (Google sign-in, email/password) and backend services.
- **Supabase:** Integrated for database functionalities.
- **Next.js:** Web framework.
- **React:** UI library.
- **Tailwind CSS:** For styling and UI development.

### Setup Status (2025-09-27)
- ✅ **Dependencies:** All npm packages installed successfully
- ✅ **Development Server:** Next.js dev server running on port 5000
- ✅ **Basic UI:** Core application interface loads correctly
- ✅ **Replit Configuration:** Next.js configuration optimized for Replit environment
- ✅ **CORS/Origins:** Allowed origins configured for current Replit domain
- ⚠️ **Firebase Authentication:** Not yet configured (requires environment variables)
- ⚠️ **Supabase:** Database connection status needs verification
- ✅ **Deployment:** Configured for autoscale deployment

### To Complete Setup
1. **Configure Firebase:** Set up the following environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` 
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
2. **Configure Supabase:** Verify database connection and set up required environment variables
3. **Test Authentication:** Once Firebase is configured, test auth flows
4. **Production Testing:** Test deployed version with full functionality