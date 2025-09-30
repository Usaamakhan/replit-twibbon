# Twibbonize App

### Overview
Twibbonize is a Next.js application for creating and sharing "Twibbons" (photo frames) and backgrounds. It allows visitors to easily discover, use, and download framed photos. Creators can upload, manage, and track their custom frames and backgrounds. The project emphasizes accessibility and public transparency, making frame usage and analytics available to all users. Key ambitions include providing a seamless experience for visitors and robust tools for creators, with a focus on public-first design for discovery and analytics.

### User Preferences
- Prefer stability over experimental features
- Focus on compatibility with Replit environment
- Maintain clean, working codebase structure

### System Architecture
The application is built with Next.js 15.5.2 (App Router) and React 19.1.0, styled using Tailwind CSS 4. It is optimized for the Replit environment.

**Core Features:**
1.  **Public Gallery:** Displays all publicly available frames and backgrounds.
2.  **Frame & Background Analytics:** Provides public usage statistics for transparency.
3.  **Trending & Top Creators:** Highlights popular content and creators.
4.  **User Accounts (Creators Only):** System for content upload and management.

**Design Principles:**
- Prioritize visitor experience; features must work for non-authenticated users first.
- Minimal account requirements, only for content uploads.
- Public-first design for all discovery and analytics features.
- Frictionless content usage: easy photo upload, overlay, and download for visitors.

**Technical Implementations:**
- Centralized Firebase error handling.
- Global loading states using `loading.js`.
- Authentication flows use dedicated pages (`/signin`, `/signup`, `/forgot-password`).
- User onboarding via a dedicated `/onboarding` page post-authentication.
- Content upload system supports two types: Frames (requiring transparency) and Backgrounds (no transparency required).
- Image composition and download functionality using Canvas API.
- Transparency detection for frames using Canvas API (min 5-10% transparency).
- Slug generation for unique, URL-friendly identifiers.

### External Dependencies
-   **Firebase:** Authentication and backend services.
-   **Supabase:** Database and storage for images.
-   **Next.js:** Web framework.
-   **React:** UI library.
-   **Tailwind CSS:** For styling.