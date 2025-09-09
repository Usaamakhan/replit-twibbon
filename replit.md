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

## Recent Changes (September 2025)
1. Successfully imported project from GitHub and installed all dependencies
2. Configured Next.js to work with Replit's proxy environment
3. Set up development workflow on port 5000 with proper host configuration (0.0.0.0)
4. Added proper CORS and caching headers for cross-origin requests
5. Configured allowedDevOrigins to handle Replit's proxy environment
6. Set up autoscale deployment configuration for production
7. Verified application runs successfully with all components working

## Development Workflow
- **Start Development**: `npm run dev` (automatically configured in workflow)
- **Build**: `npm run build`
- **Production**: `npm run start`
- **Linting**: `npm run lint`

## User Preferences
- Prefer stability over experimental features
- Focus on compatibility with Replit environment
- Maintain clean, working codebase structure