# Twibbonize App - Next.js Project

## Overview
This is a Next.js 15 application with React 19 and Tailwind CSS, designed to work in the Replit environment. The project was successfully imported from GitHub and configured for optimal performance in Replit's proxy environment.

## Project Architecture
- **Framework**: Next.js 15.5.2 with App Router
- **UI**: React 19.1.0 with Tailwind CSS 4
- **Build Tool**: Next.js built-in bundler (Turbopack disabled for compatibility)
- **Development Server**: Running on port 5000 with host 0.0.0.0
- **Deployment**: Configured for Replit's autoscale deployment

## Configuration
- **Host Configuration**: Set to 0.0.0.0:5000 for Replit proxy compatibility
- **CORS Headers**: Configured to allow cross-origin requests
- **Cache Control**: Disabled caching for development
- **Turbopack**: Disabled due to compatibility issues with Replit environment

## Recent Changes (September 18, 2025)
1. Successfully imported project from GitHub and installed all dependencies
2. Configured Next.js to work with Replit's proxy environment 
3. Set up development workflow on port 5000 with proper host configuration (0.0.0.0)
4. Updated CORS and domain configuration with current Replit domain (12862a49-ece6-4729-8233-ee83129d960d-00-1c9mwypvqfen1.riker.replit.dev)
5. Set up Firebase authentication with Google provider and environment variables (NEXT_PUBLIC_* format)
6. Implemented secure CORS middleware with proper wildcard subdomain handling
7. Fixed production build configuration and set up autoscale deployment
8. Verified AuthProvider is properly wrapped around the app in layout.js
9. Added comprehensive cross-origin request handling for all routes including API routes
10. **Project Import Complete**: All dependencies installed, Firebase credentials configured, secure CORS middleware implemented, development server running successfully on port 5000 with proper Replit proxy configuration
11. **Navigation Enhancement**: Updated sidebar navigation with icons for all links, added Profile link for authenticated users, and fixed clickable areas to only include text/icon content instead of entire line width
12. **Profile Page System Complete**: Implemented comprehensive profile system with /profile and /[username] routes, real Firestore data integration, user statistics tracking, campaigns display, loading states, error handling, and public access for profile viewing
13. **Fresh Import Configuration (September 18, 2025)**: Fresh GitHub clone imported and configured for Replit environment with all dependencies installed and dev server running successfully on port 5000
14. **Firebase Development Mode**: Modified Firebase configuration to work in development mode without requiring environment variables, allowing the application to run without Firebase credentials while still supporting full authentication when configured

## Firebase Setup Status
- **Development Mode**: Firebase configuration is optional and will work without environment variables for development
- **Required Environment Variables** (for production/authentication): NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID
- Authentication provider properly configured with Google sign-in redirect flow
- User needs to add Replit dev domain and production domain to Firebase Console authorized domains when setting up authentication
- AuthProvider correctly wraps the main page content and handles graceful fallback when Firebase is not configured

## Development Workflow
- **Start Development**: `npm run dev` (automatically configured in workflow)
- **Build**: `npm run build`
- **Production**: `npm run start`
- **Linting**: `npm run lint`

## User Preferences
- Prefer stability over experimental features
- Focus on compatibility with Replit environment
- Maintain clean, working codebase structure