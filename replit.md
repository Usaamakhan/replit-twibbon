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
1. **Fresh GitHub Import Complete**: Successfully imported fresh project from GitHub
2. **Dependencies Installed**: All Node.js packages installed successfully (Next.js 15, React 19, Firebase, Supabase, Tailwind CSS)
3. **Development Server**: Configured and running on port 5000 with host 0.0.0.0 for Replit proxy compatibility
4. **Firebase Integration**: Fully configured with all required API keys and development mode fallback
5. **Supabase Integration**: Complete setup with both client-side and server-side credentials (service role key)
6. **CORS Configuration**: Robust middleware with proper wildcard subdomain handling for Replit domains
7. **Storage API**: Server-side storage endpoints configured with Firebase authentication and Supabase admin access
8. **Deployment Configuration**: Set up for Replit's autoscale deployment with proper build and start commands
9. **Security Setup**: All API keys stored securely in Replit environment variables
10. **Development Ready**: Application fully functional and ready for development work

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