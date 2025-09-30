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

### Current Setup Status (2025-09-30)
✅ **Fresh GitHub Import Successfully Configured**
- Fresh clone from GitHub repository configured for Replit environment
- All npm dependencies installed (540 packages, 0 vulnerabilities)
- Next.js 15.5.2 dev server running successfully on 0.0.0.0:5000
- Application loads correctly with loading screen (expected when Firebase/Supabase not configured)
- Deployment configuration set for autoscale (build: npm run build, run: npm start)

✅ **Replit Environment Configuration**
- Next.js dev server properly configured with host 0.0.0.0 and port 5000
- Proxy configuration in next.config.mjs allows Replit's iframe preview
- allowedDevOrigins configured for Replit domains (*.replit.dev, *.repl.co)
- Server actions allowed origins configured for proper CORS handling
- Middleware CORS configuration working properly
- Workflow "Next.js Dev Server" running successfully

✅ **Technical Stack Verified**
- Next.js 15.5.2 with App Router
- React 19.1.0
- Tailwind CSS 4
- Firebase & Firebase Admin (authentication, backend)
- Supabase (database)
- All dependencies installed and verified

⚠️ **Required for Full Functionality:**
- Firebase environment variables (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID)
- Supabase environment variables (configured through API routes)
- The app gracefully handles missing configurations and remains functional

### External Dependencies
- **Firebase:** Used for authentication (Google sign-in, email/password) and backend services.
- **Supabase:** Integrated for database functionalities.
- **Next.js:** Web framework.
- **React:** UI library.
- **Tailwind CSS:** For styling and UI development.