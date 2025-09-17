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

## Recent Changes (September 17, 2025)
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

## Firebase Setup Status
- Environment variables configured: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID
- Authentication provider properly configured with Google sign-in redirect flow
- User needs to add Replit dev domain and production domain to Firebase Console authorized domains
- AuthProvider correctly wraps the entire application in layout.js

## Development Workflow
- **Start Development**: `npm run dev` (automatically configured in workflow)
- **Build**: `npm run build`
- **Production**: `npm run start`
- **Linting**: `npm run lint`

## User Preferences
- Prefer stability over experimental features
- Focus on compatibility with Replit environment
- Maintain clean, working codebase structure