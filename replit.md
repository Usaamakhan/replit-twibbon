# Twibbonize App

## Overview
Twibbonize is a Next.js 15 application designed for creating and sharing "Campaigns" consisting of photo frames and backgrounds. It allows visitors to discover, customize, and download photos with these elements, while creators can upload and manage their campaigns with public analytics. The project aims to provide a visitor-first, frictionless experience with minimal authentication requirements, emphasizing public discovery and transparency.

## User Preferences
- Prefer stability over experimental features
- Focus on clean, maintainable code structure
- Make code changes ONLY when explicitly requested
- Never perform automatic setup, testing, or debugging

## System Architecture
The application is built with Next.js 15.5.2 (App Router), React 19.1.0, and Tailwind CSS 4. It leverages Firebase for authentication and Supabase for database and storage.

**Core Features:**
- **Campaign System:** Users can upload and manage campaigns, categorized as Frames (requiring transparency detection) or Backgrounds.
- **Public Gallery:** A unified `/campaigns` page for browsing campaigns with filtering capabilities.
- **Image Composition:** Utilizes Canvas API for overlaying user photos with frames/backgrounds, including adjustment tools (zoom, move, fit).
- **Top Creators:** A leaderboard feature showcasing creators by country and time period.
- **Public Analytics:** Transparent usage statistics for all campaigns.
- **Three-Page Campaign Flow:** A guided user experience for photo upload, adjustment, and result download/sharing.
- **Admin Dashboard:** A comprehensive panel for moderation, including reports management, campaign moderation, user management, and analytics.
- **FCM Push Notification System:** Real-time push notifications for user updates and moderation events, including an in-app notification inbox.

**Design Principles:**
- **Visitor-first experience:** Browsing and using campaigns do not require authentication.
- **Minimal account requirements:** Authentication is only required for campaign creation.
- **Public-first design:** Emphasizes discovery and transparent analytics.
- **Frictionless workflow:** Achieved through delayed authentication and intuitive user flows.

**Technical Implementations:**
- **Transparency Detection:** Canvas API is used to validate transparency for frame uploads.
- **Slug Generation:** Unique, URL-friendly identifiers are generated from campaign titles.
- **Delayed Authentication:** Users can complete forms unauthenticated, with a prompt only at the point of publishing.
- **Optimized Database Structure:** Firebase/Firestore is optimized to reduce storage costs and prevent document bloat, especially for viral campaigns, by simplifying download tracking and using counters.
- **Image Optimization:** ImageKit.io CDN is integrated for image transformation (WebP, resizing, quality optimization) across all application images.
- **Dynamic Service Worker:** For FCM, a dynamic service worker serves Firebase configuration from environment variables.
- **Notification History/Inbox System:** All push notifications are saved to Firestore for an in-app inbox with real-time updates and authenticated APIs for managing read/delete status.

## External Dependencies
- **Firebase:** Authentication and backend services.
- **Supabase:** Database and image storage.
- **ImageKit.io:** CDN for image optimization and transformations.
- **Next.js:** Web framework (v15.5.2).
- **React:** UI library (v19.1.0).
- **Tailwind CSS:** Styling (v4).