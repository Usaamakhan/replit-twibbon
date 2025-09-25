# Twibbonize App - Next.js Project

## Overview
This is a Next.js 15 application with React 19 and Tailwind CSS, designed to work in the Replit environment. The project was successfully imported from GitHub and configured for optimal performance in Replit's proxy environment.

## 🎯 CORE PRODUCT SPECIFICATION & USER FLOW
**⚠️ CRITICAL: All development decisions must align with this user flow specification ⚠️**

### User Types & Core Philosophy
The website "Frame" (Twibbonize) is designed around **accessibility for everyone** with two distinct user types:

#### **Visitors (Non-authenticated Users) - Primary Focus**
- **Discovery**: Homepage displays public gallery of trending frames, filterable by time periods and country
- **Search**: Global search functionality to find specific frames 
- **Frame Selection**: Click any frame to view its dedicated page with full details
- **Usage**: Upload personal photos and automatically overlay frames onto them
- **Download**: Download final framed photos **WITHOUT requiring account creation** - completely seamless experience
- **Analytics Access**: View public analytics for any frame (usage stats, popularity, country data)

#### **Creators (Authenticated Users) - Secondary Focus**  
- **Account Creation**: Required ONLY for uploading custom frames (not for using existing frames)
- **Frame Upload**: Access dedicated upload page with frame design, naming, descriptions, and tagging
- **Frame Management**: Personal dashboard to view, edit, delete uploaded frames and track performance
- **Public Profile**: Creator profiles with their uploaded frames and statistics

### Core Features (Implementation Priority)
1. **Public Gallery** (Primary Feature)
   - Heart of the website - displays all publicly available frames
   - All content and analytics are completely public and accessible without accounts
   - Primary visitor interaction point

2. **Frame Analytics** (Key Differentiator)
   - **Completely public** usage statistics for transparency
   - Track: number of uses, downloads, popularity over time, country-based metrics
   - Creates engaging, transparent community environment

3. **Trending & Top Creators**
   - Highlight most popular frames and successful creators
   - Rankings based on actual usage data
   - Motivates quality content creation

4. **User Accounts** (Creators Only)
   - Streamlined system focused on content creation and management tools
   - Keep simple - only essential features for frame uploading and management

### Development Guidelines Based on User Flow
- **Visitor Experience Priority**: Any feature should work for non-authenticated users first
- **Minimal Account Requirements**: Never require accounts unless absolutely necessary (only for frame uploads)
- **Public-First Design**: All analytics, trending, and discovery features must be publicly accessible
- **Seamless Frame Usage**: Photo upload → frame overlay → download should be frictionless for visitors

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

## Recent Changes (September 25, 2025)
1. **Fresh GitHub Import Setup (September 25, 2025 - COMPLETED)**: Successfully imported and configured fresh GitHub clone:
   - Dependencies installed successfully (Next.js 15, React 19, Firebase, Supabase, Tailwind CSS)
   - Domain configuration updated to current Replit domain (fddcdfe4-aa19-4690-993b-f8ed36e9f42f-00-2obgqwd3qwgyl.janeway.replit.dev)
   - Development server running successfully on port 5000 with host 0.0.0.0
   - Application tested and verified working in Replit proxy environment
   - Production deployment configured for autoscale with proper build and start commands
   - Import process completed successfully ✅

2. **Simple Loading States Implementation (September 25, 2025 - COMPLETED)**: Added appropriate loading states for this simple project:
   - **Global Loading**: Single loading.js file for all routes with consistent "Loading..." message
   - **Essential Components**: Kept only LoadingSpinner and PageLoader components - removed overcomplicated skeleton components
   - **Server Component Architecture**: Maintained server-side rendering for optimal performance
   - **Simplified Approach**: Followed principle of not over-engineering for a simple project scope
   - **Clean Codebase**: Removed unnecessary route-specific loading files and unused components
   - **User Experience**: Users see appropriate feedback without code bloat
   - Simple loading implementation completed successfully ✅

## Previous Changes (September 22, 2025)
1. **Fresh GitHub Import Complete**: Successfully imported fresh project from GitHub
2. **Dependencies Installed**: All Node.js packages installed successfully (Next.js 15, React 19, Firebase, Supabase, Tailwind CSS) 
3. **Development Server**: Configured and running on port 5000 with host 0.0.0.0 for Replit proxy compatibility
4. **Domain Configuration**: Updated allowedDevOrigins with current Replit domain (559d7b3a-ff12-4c31-b6e3-e0924b7a83b3-00-3mtsq23u52pd7.janeway.replit.dev) for cross-origin compatibility
5. **Workflow Setup**: Next.js Dev Server workflow configured and running successfully
6. **Production Build Configuration**: Set up for Replit's autoscale deployment with proper build and start commands
7. **Cross-Origin Configuration**: Added local origins to allowedDevOrigins to prevent cross-origin warnings
8. **Deployment Ready**: Application fully configured for both development and production deployment on Replit
9. **GitHub Import Setup**: COMPLETE - Application is ready for development and external service configuration
10. **Import Process Completed**: All systems verified working, deployment configured, application fully operational in Replit environment
11. **Fresh Import Setup (September 24, 2025 - COMPLETED)**: Fresh GitHub clone successfully configured for Replit environment:
    - Dependencies installed (Next.js 15, React 19, Firebase, Supabase, Tailwind CSS)
    - Domain updated to current Replit domain (6a7e5cab-35a9-4103-86fe-de93ba8fbe6e-00-1sychj9fwnqrm.worf.replit.dev)
    - Development server running successfully on port 5000 with host 0.0.0.0
    - Application tested and fully operational in Replit proxy environment
    - Deployment configured for autoscale production deployment with build and start commands
    - Environment variables checked - app gracefully handles missing Firebase/Supabase configs
    - **Product Specification Preserved**: Core user flow and feature specification maintained from previous setup
    - Import process completed successfully ✅
11. **Profile Edit Modal Navigation Fixed**: Removed automatic navigation to username page after profile changes - users now stay on current page after editing
12. **Debug Logging Cleanup**: Removed all debug console.log statements from WelcomePopup, ProfileEditModal, and UserOnboardingWrapper for cleaner codebase
13. **Global Popup Visibility**: Moved AuthGate (email verification) and UserOnboardingWrapper (welcome popup) to root layout level - these critical onboarding flows now appear on all pages, not just homepage
15. **Authentication Modal Cleanup (September 24, 2025)**: Removed unused authentication modal components and context system as app now uses dedicated pages for all auth flows (/signin, /signup, /forgot-password)
16. **Onboarding Page Conversion (September 24, 2025)**: Converted welcome popup modal to dedicated `/onboarding` page while maintaining identical functionality:
    - Users are automatically redirected to `/onboarding` when profile setup is incomplete
    - All original features preserved: username validation, profile pictures, country selection, bio
    - Improved UX with full-page layout instead of modal overlay
    - Authentication required to access onboarding page
14. **Authentication UX Improvements (September 23, 2025)**: 
    - Fixed full-page loading overlays that were hiding authentication forms during sign-in/sign-up actions
    - Implemented user-friendly error messages replacing technical Firebase error codes
    - Added yellow background styling to forgot-password success page for consistent design across all auth flows
    - Enhanced authentication forms to remain visible with button-level loading states only

## Firebase Setup Status - FULLY CONFIGURED ✅
- **Production Ready**: All Firebase environment variables successfully configured and active
- **Authentication Active**: Firebase initialized successfully with project "replit-twibbon"
- **Environment Variables Set**: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID, FIREBASE_SERVICE_ACCOUNT_KEY
- **Supabase Integration**: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY configured
- Authentication provider fully operational with Google sign-in and email/password flows
- User should add Replit dev domain and production domain to Firebase Console authorized domains
- AuthProvider gracefully handles both configured and unconfigured states

## Development Workflow
- **Start Development**: `npm run dev` (automatically configured in workflow)
- **Build**: `npm run build`
- **Production**: `npm run start`
- **Linting**: `npm run lint`

## Production Deployment Notes
- **Firestore Indexes Required**: Before going live, create these composite indexes in Firebase Console:
  1. Collection: `frames` - Fields: `createdBy` (ASC), `createdAt` (DESC)
  2. Collection: `frames` - Fields: `isPublic` (ASC), `createdAt` (DESC)
- **Domain Configuration**: Add your production domain to Firebase Console authorized domains
- **Build Verified**: Production build passes successfully with only non-blocking warnings

## User Preferences
- Prefer stability over experimental features
- Focus on compatibility with Replit environment
- Maintain clean, working codebase structure