# Twibbonize App

### Overview
Twibbonize is a Next.js application designed for creating, sharing, and discovering "Twibbons" (photo frames) and backgrounds. It enables visitors to easily find, use, and download framed photos, while providing creators with tools to upload, manage, and track their custom content. The project prioritizes public accessibility and transparency, making frame usage and analytics available to all users. The core ambition is to offer a seamless experience for visitors and robust, public-first tools for creators.

### User Preferences
- Prefer stability over experimental features
- Focus on compatibility with Replit environment
- Maintain clean, working codebase structure

### System Architecture
The application is built with Next.js 15.5.2 (App Router) and React 19.1.0, utilizing Tailwind CSS 4 for styling, and optimized for the Replit environment.

**Core Features:**
*   **Public Content Discovery:** A gallery for all publicly available frames and backgrounds, with trending content and top creators highlighted.
*   **Campaign Management (Creators):** A system for creators to upload, manage, and track their frames and backgrounds, including public usage analytics.
*   **Visitor Interaction:** Frictionless process for visitors to upload photos, overlay them with frames/backgrounds, adjust, and download the composed image.
*   **Public Transparency:** Analytics and usage statistics for campaigns are publicly accessible.

**Design Principles:**
*   **Visitor-First Experience:** Features are designed primarily for non-authenticated users.
*   **Minimal Account Requirements:** Accounts are only necessary for content creation.
*   **Public-First Design:** All discovery and analytics features are publicly transparent.

**Technical Implementations:**
*   **Image Composition:** Uses Canvas API for overlaying user photos with frames or placing them on backgrounds, including real-time adjustments (resize, reposition).
*   **Transparency Detection:** Canvas API is used to detect transparency in uploaded frame images (minimum 5-10% transparency required).
*   **Slug Generation:** Unique, URL-friendly identifiers are generated from campaign titles.
*   **Authentication Flow:** Supports unauthenticated access for campaign creation, prompting for sign-in only at the point of publishing, with form data preserved.
*   **Global States:** Centralized Firebase error handling and global loading states using `loading.js`.

### External Dependencies
*   **Firebase:** Used for authentication and backend services.
*   **Supabase:** Utilized for database management and image storage.
*   **Next.js:** The primary web framework.
*   **React:** The UI library.
*   **Tailwind CSS:** For styling the application.