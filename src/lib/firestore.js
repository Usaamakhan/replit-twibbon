"use client";

// Firestore database operations for the Twibbonize app
import { db } from './firebase-optimized';
import { handleFirebaseError } from '../utils/firebaseErrorHandler';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp,
  updateDoc,
  increment,
  runTransaction 
} from 'firebase/firestore';


// Get database instance - simplified since we have direct db import
const getDatabase = () => {
  return db;
};

// Generate unique username with max attempts to prevent infinite loops
export const generateUniqueUsername = async (baseUsername, maxAttempts = 100) => {
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Ensure username is at least 3 characters
  if (username.length < 3) {
    username = username + '123';
  }
  
  // Check if username exists with attempt limit
  let counter = 0;
  let finalUsername = username;
  let attempts = 0;
  
  while (await checkUsernameExists(finalUsername) && attempts < maxAttempts) {
    counter++;
    finalUsername = `${username}${counter}`;
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    // Fallback: use timestamp-based unique identifier
    finalUsername = `${username}${Date.now().toString().slice(-6)}`;

  }
  
  return finalUsername;
};

// Check if username already exists - using usernames collection for atomicity
export const checkUsernameExists = async (username) => {
  const normalizedUsername = username.toLowerCase().trim();
  
  // Check if database is initialized
  if (!db) {
    return true; // Assume exists on error to be safe
  }
  
  try {
    // Check usernames collection for atomicity (maintained for data integrity)
    const usernameDocRef = doc(db, 'usernames', normalizedUsername);
    const usernameDoc = await getDoc(usernameDocRef);
    const exists = usernameDoc.exists();
    
    return exists;
  } catch (error) {
    return true; // Assume exists on error to be safe
  }
};

// Atomic username reservation using usernames collection (maintained for data integrity)
const reserveUsernameAtomically = async (baseUsername, userUid, userProfile) => {
  const maxAttempts = 100;
  let username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Ensure username is at least 3 characters
  if (username.length < 3) {
    username = username + '123';
  }

  return await runTransaction(db, async (transaction) => {
    let counter = 0;
    let finalUsername = username;
    let attempts = 0;
    
    // Try to find available username atomically using usernames collection
    while (attempts < maxAttempts) {
      const usernameDocRef = doc(db, 'usernames', finalUsername);
      const usernameDoc = await transaction.get(usernameDocRef);
      
      if (!usernameDoc.exists()) {
        // Username is available, reserve it atomically
        transaction.set(usernameDocRef, {
          userId: userUid,
          createdAt: serverTimestamp(),
        });
        
        const userDocRef = doc(db, 'users', userUid);
        transaction.set(userDocRef, {
          ...userProfile,
          username: finalUsername,
        });
        return { success: true, username: finalUsername, docRef: userDocRef };
      }
      
      // Username taken, try next variation
      counter++;
      finalUsername = `${username}${counter}`;
      attempts++;
    }
    
    // Fallback: use timestamp-based unique identifier
    finalUsername = `${username}${Date.now().toString().slice(-6)}`;
    
    const usernameDocRef = doc(db, 'usernames', finalUsername);
    transaction.set(usernameDocRef, {
      userId: userUid,
      createdAt: serverTimestamp(),
    });
    
    const userDocRef = doc(db, 'users', userUid);
    transaction.set(userDocRef, {
      ...userProfile,
      username: finalUsername,
    });
    return { success: true, username: finalUsername, docRef: userDocRef };
  });
};

// User Profile operations with atomic username reservation
export const createUserProfile = async (user) => {
  if (!user) return { success: false, error: 'No user provided' };
  
  const database = getDatabase();
  // Check if Firebase is configured
  if (!database) {

    return { success: false, error: 'Database not available' };
  }
  
  try {
      const userDocRef = doc(database, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const { displayName, email, photoURL } = user;
      
      // Prepare user profile data
      const userProfile = {
        displayName,
        email,
        photoURL,
        bio: '',
        country: '',
        bannerImage: '',
        profileImage: photoURL || '',
        role: 'user', // Default role for new users (admin role assigned separately)
        supportersCount: 0,
        campaignsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileCompleted: false, // Track if user has completed welcome popup
      };
      
      // Generate base username and reserve atomically
      const baseUsername = displayName || email?.split('@')[0] || 'user';
      const result = await reserveUsernameAtomically(baseUsername, user.uid, userProfile);
      
      if (result.success) {
        return { success: true, docRef: result.docRef, username: result.username };
      } else {
        return { success: false, error: 'Failed to reserve username' };
      }
    }
    
    return { success: true, docRef: userDocRef, existing: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating user profile:', error);
    }
    const errorResponse = await handleFirebaseError(error, 'firestore', { returnType: 'string' });
    return { success: false, error: errorResponse || 'Failed to complete operation. Please try again.' };
  }
};

export const getUserProfile = async (userId) => {
  if (!userId) {
    return null;
  }
  
  const database = getDatabase();
  // Check if Firebase is configured
  if (!database) {

    return null;
  }
  
  try {
    const userDocRef = doc(database, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Ensure required fields exist with fallbacks
      return { 
        id: userDoc.id, 
        ...userData,
        supportersCount: userData.supportersCount || 0,
        campaignsCount: userData.campaignsCount || 0,
        bio: userData.bio || '',
        profileImage: userData.profileImage || '',
        bannerImage: userData.bannerImage || ''
      };
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

// Get user profile by username (for /[username] route) - using usernames collection for consistency
export const getUserProfileByUsername = async (username) => {
  if (!username || typeof username !== 'string') {
    return null;
  }
  
  // Normalize username
  const normalizedUsername = username.toLowerCase().trim();
  if (!normalizedUsername) {
    return null;
  }
  
  try {
    // Check if database is available
    if (!db) {
      return null;
    }

    // First, resolve username to userId using usernames collection
    const usernameDocRef = doc(db, 'usernames', normalizedUsername);
    const usernameDoc = await getDoc(usernameDocRef);
    
    if (!usernameDoc.exists()) {
      return null;
    }
    
    const { userId } = usernameDoc.data();
    
    // Then fetch user profile using the userId
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    
    // Ensure required fields exist with fallbacks
    return { 
      id: userDoc.id, 
      ...userData,
      supportersCount: userData.supportersCount || 0,
      campaignsCount: userData.campaignsCount || 0,
      bio: userData.bio || '',
      profileImage: userData.profileImage || '',
      bannerImage: userData.bannerImage || ''
    };
  } catch (error) {
    return null;
  }
};

// Update user profile with atomic username reservation
export const updateUserProfile = async (userId, updates) => {
  if (!userId) return { success: false, error: 'No user ID provided' };
  
  // Check if Firebase is configured
  if (!db) {

    return { success: false, error: 'Database not available' };
  }
  
  // Whitelist of safe fields that users can update
  const allowedFields = ['bio', 'bannerImage', 'profileImage', 'displayName', 'country', 'username', 'profileCompleted'];
  
  // Filter updates to only include allowed fields
  const filteredUpdates = {};
  for (const field of allowedFields) {
    if (updates.hasOwnProperty(field)) {
      filteredUpdates[field] = updates[field];
    }
  }
  
  // If no valid fields to update, return early
  if (Object.keys(filteredUpdates).length === 0) {
    return { success: false, error: 'No valid fields to update' };
  }

  try {
    return await runTransaction(db, async (transaction) => {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const currentData = userDoc.data();
      
      // If username is being changed, normalize and ensure it's unique atomically
      if (filteredUpdates.username && filteredUpdates.username !== currentData.username) {
        // Normalize username to ensure consistency
        const normalizedUsername = filteredUpdates.username.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Validate normalized username
        if (normalizedUsername.length < 3) {
          throw new Error('Username must be at least 3 characters long');
        }
        
        // If normalization changed the username, reject to avoid confusion
        if (normalizedUsername !== filteredUpdates.username) {
          throw new Error('Username can only contain lowercase letters and numbers');
        }
        
        // Reserve the new username atomically using usernames collection
        const usernameDocRef = doc(db, 'usernames', normalizedUsername);
        const usernameDoc = await transaction.get(usernameDocRef);
        
        if (usernameDoc.exists()) {
          throw new Error('Username already taken');
        }
        
        // Reserve the new username
        transaction.set(usernameDocRef, {
          userId: userId,
          createdAt: serverTimestamp(),
        });
        
        // Remove old username reservation if it exists
        if (currentData.username) {
          const oldUsernameDocRef = doc(db, 'usernames', currentData.username);
          transaction.delete(oldUsernameDocRef);
        }
        
        // Update the filtered updates with normalized username
        filteredUpdates.username = normalizedUsername;
      }

      // Update the user profile
      transaction.update(userDocRef, {
        ...filteredUpdates,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true, username: filteredUpdates.username || currentData.username };
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating user profile:', error);
    }
    const errorResponse = await handleFirebaseError(error, 'firestore', { returnType: 'string' });
    return { success: false, error: errorResponse || 'Failed to complete operation. Please try again.' };
  }
};

// Get user statistics (returns stored counters for consistency and performance)
export const getUserStats = async (userId) => {
  if (!userId) return { supportersCount: 0, campaignsCount: 0 };
  
  try {
    // Get stored counters from user profile for consistency
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      return {
        supportersCount: userProfile.supportersCount || 0,
        campaignsCount: userProfile.campaignsCount || 0,
      };
    } else {
      return { supportersCount: 0, campaignsCount: 0 };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting user stats:', error);
    }
    return { supportersCount: 0, campaignsCount: 0 };
  }
};

// Campaign operations with comprehensive error handling
export const createCampaign = async (campaignData, userId) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }
  
  if (!campaignData || typeof campaignData !== 'object') {
    return { success: false, error: 'Campaign data is required' };
  }
  
  // Validate required fields
  const requiredFields = ['type', 'title', 'slug', 'imageUrl'];
  const missingFields = requiredFields.filter(field => !campaignData[field]);
  if (missingFields.length > 0) {
    return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` };
  }
  
  // Validate type is either 'frame' or 'background'
  if (!['frame', 'background'].includes(campaignData.type)) {
    return { success: false, error: 'Type must be either "frame" or "background"' };
  }
  
  try {
    return await runTransaction(db, async (transaction) => {
      // Create the campaign with explicit schema (no spread operator)
      const campaignRef = doc(collection(db, 'campaigns'));
      const campaignDoc = {
        // Required fields from CAMPAIGN_SYSTEM.md
        type: campaignData.type,                    // "frame" or "background"
        title: campaignData.title,                  // Campaign title
        slug: campaignData.slug,                    // URL-friendly slug
        imageUrl: campaignData.imageUrl,            // Supabase storage URL
        creatorId: userId,                          // Renamed from createdBy
        
        // Optional metadata fields
        description: campaignData.description || '',
        captionTemplate: campaignData.captionTemplate || '',
        
        // Counter fields (optimized: removed supporters object to reduce document size)
        supportersCount: 0,                         // Total downloads count
        reportsCount: 0,                            // Number of reports received
        
        // Status fields
        moderationStatus: 'active',                 // "active" | "under-review" | "removed"
        isPublic: campaignData.isPublic ?? true,    // Current feature (not in docs)
        
        // Timestamps
        createdAt: serverTimestamp(),               // When campaign was published
        updatedAt: serverTimestamp(),               // Last modification time
        // firstUsedAt - added later when first supporter downloads
      };
      
      transaction.set(campaignRef, campaignDoc);
      
      // Update user's campaign counters atomically (optimized: removed duplicate campaignsCreated field)
      const userDocRef = doc(db, 'users', userId);
      transaction.update(userDocRef, {
        campaignsCount: increment(1),
        updatedAt: serverTimestamp(),
      });
      
      return { success: true, campaignId: campaignRef.id };
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating campaign:', error, { userId, campaignData: { ...campaignData, imageData: '[redacted]' } });
    }
    const errorResponse = await handleFirebaseError(error, 'firestore', { returnType: 'string' });
    return { success: false, error: errorResponse || 'Failed to create campaign. Please try again.' };
  }
};

export const getPublicCampaigns = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'campaigns'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const campaigns = [];
    
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    
    return campaigns;
  } catch (error) {
    return [];
  }
};

export const getUserCampaigns = async (userId, options = {}) => {
  console.log('🔍 [getUserCampaigns] Starting - userId:', userId);
  
  if (!userId) {
    console.warn('🔍 [getUserCampaigns] No userId provided');
    return [];
  }
  
  // Check if database is initialized
  if (!db) {
    console.error('🔍 [getUserCampaigns] Database not initialized (Firebase disabled)');
    return [];
  }
  
  const {
    orderByField = 'createdAt',
    orderDirection = 'desc',
    pageSize = 12,
    startAfterDoc = null
  } = options;
  
  console.log('🔍 [getUserCampaigns] Query params:', {
    orderByField,
    orderDirection,
    pageSize,
    collection: 'campaigns',
    field: 'creatorId',
    value: userId
  });
  
  try {
    // Use Firebase orderBy for better performance (newest first by default)
    let q = query(
      collection(db, 'campaigns'),
      where('creatorId', '==', userId),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    );
    
    // Add pagination cursor if provided
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }
    
    const querySnapshot = await getDocs(q);
    const campaigns = [];
    
    console.log('🔍 [getUserCampaigns] Query result - docs count:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('🔍 [getUserCampaigns] Document:', {
        id: doc.id,
        creatorId: data.creatorId,
        title: data.title,
        slug: data.slug,
        imageUrl: data.imageUrl
      });
      
      campaigns.push({ 
        id: doc.id,
        slug: data.slug,
        title: data.title,
        type: data.type,
        imageUrl: data.imageUrl,
        supportersCount: data.supportersCount || 0,
        createdAt: data.createdAt,
        description: data.description || '',
        moderationStatus: data.moderationStatus || 'active'
      });
    });
    
    console.log('🔍 [getUserCampaigns] Returning campaigns:', campaigns.length);
    return campaigns;
  } catch (error) {
    console.error('🔍 [getUserCampaigns] Error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    return [];
  }
};

/**
 * Get campaign by slug
 * @param {string} slug - Campaign slug from URL
 * @returns {Promise<{campaign: object, creator: object}|null>} Campaign with creator info or null if not found
 */
export const getCampaignBySlug = async (slug) => {
  if (!slug) return null;
  
  // Check if database is initialized
  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Database not initialized - cannot get campaign by slug');
    }
    return null;
  }
  
  try {
    // Query campaigns collection by slug
    const q = query(
      collection(db, 'campaigns'),
      where('slug', '==', slug),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const campaignDoc = querySnapshot.docs[0];
    const campaignData = { id: campaignDoc.id, ...campaignDoc.data() };
    
    // Don't show removed campaigns
    if (campaignData.moderationStatus === 'removed') {
      return null;
    }
    
    // Fetch creator info
    let creatorData = null;
    if (campaignData.creatorId) {
      try {
        const creatorDocRef = doc(db, 'users', campaignData.creatorId);
        const creatorDoc = await getDoc(creatorDocRef);
        
        if (creatorDoc.exists()) {
          creatorData = { id: creatorDoc.id, ...creatorDoc.data() };
        }
      } catch (creatorError) {
        // Continue without creator info if fetch fails
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch creator info:', creatorError);
        }
      }
    }
    
    return {
      campaign: campaignData,
      creator: creatorData
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting campaign by slug:', error);
    }
    return null;
  }
};

// Complete user profile setup after welcome popup
export const completeUserProfile = async (userId, profileData) => {
  if (!userId || !profileData) return { success: false, error: 'Missing required data' };

  try {
    return await runTransaction(db, async (transaction) => {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const currentData = userDoc.data();
      
      // Check if username is being changed and ensure it's unique atomically
      if (profileData.username && profileData.username !== currentData.username) {
        // Normalize username to ensure consistency  
        const normalizedUsername = profileData.username.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Validate normalized username
        if (normalizedUsername.length < 3) {
          throw new Error('Username must be at least 3 characters long');
        }
        
        // If normalization changed the username, reject to avoid confusion
        if (normalizedUsername !== profileData.username) {
          throw new Error('Username can only contain lowercase letters and numbers');
        }
        
        // Reserve username atomically using usernames collection
        const usernameDocRef = doc(db, 'usernames', normalizedUsername);
        const usernameDoc = await transaction.get(usernameDocRef);
        
        if (usernameDoc.exists()) {
          throw new Error('Username already taken');
        }
        
        // Reserve the new username
        transaction.set(usernameDocRef, {
          userId: userId,
          createdAt: serverTimestamp(),
        });
        
        // Remove old username reservation if it exists
        if (currentData.username) {
          const oldUsernameDocRef = doc(db, 'usernames', currentData.username);
          transaction.delete(oldUsernameDocRef);
        }
        
        // Update profileData with normalized username
        profileData.username = normalizedUsername;
      }

      // Prepare update data
      const updateData = {
        displayName: profileData.displayName || currentData.displayName,
        username: profileData.username || currentData.username,
        country: profileData.country || currentData.country,
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      };

      // Handle bio - include empty string values to support clearing
      if (profileData.hasOwnProperty('bio')) {
        updateData.bio = profileData.bio;
      } else {
        updateData.bio = currentData.bio || '';
      }

      // Handle profile image - include null values to support removals
      if (profileData.hasOwnProperty('profileImage')) {
        updateData.profileImage = profileData.profileImage;
      }

      // Handle banner image - include null values to support removals
      if (profileData.hasOwnProperty('bannerImage')) {
        updateData.bannerImage = profileData.bannerImage;
      }

      transaction.update(userDocRef, updateData);
      
      return { success: true, username: updateData.username };
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error completing user profile:', error);
    }
    const errorResponse = await handleFirebaseError(error, 'firestore', { returnType: 'string' });
    return { success: false, error: errorResponse || 'Failed to complete operation. Please try again.' };
  }
};

// Report operations for campaign moderation
export const createReport = async (reportData) => {
  if (!reportData || typeof reportData !== 'object') {
    return { success: false, error: 'Report data is required' };
  }
  
  // Validate required fields
  const requiredFields = ['campaignId', 'reason'];
  const missingFields = requiredFields.filter(field => !reportData[field]);
  if (missingFields.length > 0) {
    return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` };
  }
  
  // Validate reason is one of the allowed values
  const validReasons = ['inappropriate', 'spam', 'copyright', 'other'];
  if (!validReasons.includes(reportData.reason)) {
    return { success: false, error: 'Invalid report reason' };
  }
  
  try {
    return await runTransaction(db, async (transaction) => {
      // Create the report document
      const reportRef = doc(collection(db, 'reports'));
      const reportDoc = {
        campaignId: reportData.campaignId,
        campaignSlug: reportData.campaignSlug || '',
        reportedBy: reportData.reportedBy || 'anonymous',
        reason: reportData.reason,
        details: reportData.details || '',
        status: 'pending',
        createdAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
        action: null,
      };
      
      transaction.set(reportRef, reportDoc);
      
      // Increment the campaign's reportsCount
      const campaignRef = doc(db, 'campaigns', reportData.campaignId);
      const campaignDoc = await transaction.get(campaignRef);
      
      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found');
      }
      
      const currentReportsCount = campaignDoc.data().reportsCount || 0;
      const newReportsCount = currentReportsCount + 1;
      
      const campaignUpdates = {
        reportsCount: increment(1),
        updatedAt: serverTimestamp(),
      };
      
      // Auto-flag for review if threshold reached (3+ reports)
      if (newReportsCount >= 3 && campaignDoc.data().moderationStatus === 'active') {
        campaignUpdates.moderationStatus = 'under-review';
      }
      
      transaction.update(campaignRef, campaignUpdates);
      
      return { success: true, reportId: reportRef.id };
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating report:', error);
    }
    const errorResponse = await handleFirebaseError(error, 'firestore', { returnType: 'string' });
    return { success: false, error: errorResponse || 'Failed to submit report. Please try again.' };
  }
};

// Get all reports (admin only - enforce in component)
export const getReports = async (filterOptions = {}) => {
  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Database not initialized - cannot get reports');
    }
    return [];
  }
  
  try {
    let q = collection(db, 'reports');
    const constraints = [];
    
    // Add filters
    if (filterOptions.status) {
      constraints.push(where('status', '==', filterOptions.status));
    }
    
    if (filterOptions.campaignId) {
      constraints.push(where('campaignId', '==', filterOptions.campaignId));
    }
    
    // Always order by creation date (newest first)
    constraints.push(orderBy('createdAt', 'desc'));
    
    // Add limit if specified
    if (filterOptions.limit) {
      constraints.push(limit(filterOptions.limit));
    }
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const querySnapshot = await getDocs(q);
    const reports = [];
    
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    
    return reports;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting reports:', error);
    }
    return [];
  }
};

// Get reports for a specific campaign
export const getCampaignReports = async (campaignId, limitCount = 50) => {
  return getReports({ campaignId, limit: limitCount });
};

// Update report status (admin only - enforce in component)
export const updateReportStatus = async (reportId, statusData) => {
  if (!reportId || !statusData) {
    return { success: false, error: 'Report ID and status data are required' };
  }
  
  // Validate status
  const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
  if (statusData.status && !validStatuses.includes(statusData.status)) {
    return { success: false, error: 'Invalid status' };
  }
  
  // Validate action if provided
  const validActions = ['removed', 'warned', 'no-action'];
  if (statusData.action && !validActions.includes(statusData.action)) {
    return { success: false, error: 'Invalid action' };
  }
  
  try {
    const reportRef = doc(db, 'reports', reportId);
    const reportDoc = await getDoc(reportRef);
    
    if (!reportDoc.exists()) {
      return { success: false, error: 'Report not found' };
    }
    
    const updateData = {
      updatedAt: serverTimestamp(),
    };
    
    if (statusData.status) {
      updateData.status = statusData.status;
      updateData.reviewedAt = serverTimestamp();
    }
    
    if (statusData.reviewedBy) {
      updateData.reviewedBy = statusData.reviewedBy;
    }
    
    if (statusData.action) {
      updateData.action = statusData.action;
    }
    
    await updateDoc(reportRef, updateData);
    
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating report status:', error);
    }
    const errorResponse = await handleFirebaseError(error, 'firestore', { returnType: 'string' });
    return { success: false, error: errorResponse || 'Failed to update report. Please try again.' };
  }
};

/**
 * Get all campaigns with optional filters
 * @param {object} filters - Filter options
 * @param {string} filters.type - Campaign type ('frame', 'background', or 'all')
 * @param {string} filters.country - Filter by creator's country
 * @param {string} filters.timePeriod - Time period ('24h', '7d', '30d', or 'all')
 * @param {string} filters.sortBy - Sort field ('supportersCount' or 'createdAt')
 * @param {number} filters.limit - Number of campaigns to return
 * @returns {Promise<Array>} Array of campaigns with creator info
 */
export const getAllCampaigns = async (filters = {}) => {
  const {
    type = 'all',
    country = null,
    timePeriod = 'all',
    sortBy = 'createdAt',
    limit: limitCount = 24
  } = filters;
  
  // Check if database is initialized
  if (!db) {
    console.error('Database not initialized - cannot get campaigns');
    return [];
  }
  
  try {
    // Calculate time cutoff for filtering
    let timeCutoff = null;
    if (timePeriod !== 'all') {
      const now = new Date();
      switch (timePeriod) {
        case '24h':
          timeCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }
    
    // Build query
    let constraints = [
      where('moderationStatus', '!=', 'removed')
    ];
    
    // Add type filter
    if (type !== 'all') {
      constraints.push(where('type', '==', type));
    }
    
    // Add time filter
    if (timeCutoff) {
      constraints.push(where('createdAt', '>=', timeCutoff));
    }
    
    // Add sorting
    constraints.push(orderBy(sortBy, 'desc'));
    constraints.push(limit(limitCount));
    
    const q = query(collection(db, 'campaigns'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const campaigns = [];
    
    // Collect all creator IDs to fetch in batch
    const creatorIds = new Set();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.creatorId) {
        creatorIds.add(data.creatorId);
      }
      campaigns.push({
        id: doc.id,
        ...data
      });
    });
    
    // Fetch all creators in one batch
    const creatorsMap = new Map();
    if (creatorIds.size > 0) {
      const creatorPromises = Array.from(creatorIds).map(async (creatorId) => {
        try {
          const creatorDocRef = doc(db, 'users', creatorId);
          const creatorDoc = await getDoc(creatorDocRef);
          if (creatorDoc.exists()) {
            return { id: creatorDoc.id, ...creatorDoc.data() };
          }
        } catch (error) {
          console.error('Error fetching creator:', error);
        }
        return null;
      });
      
      const creators = await Promise.all(creatorPromises);
      creators.forEach((creator) => {
        if (creator) {
          creatorsMap.set(creator.id, creator);
        }
      });
    }
    
    // Filter by country if specified (using creator's country)
    let filteredCampaigns = campaigns;
    if (country) {
      filteredCampaigns = campaigns.filter((campaign) => {
        const creator = creatorsMap.get(campaign.creatorId);
        return creator && creator.country === country;
      });
    }
    
    // Attach creator data to campaigns
    const campaignsWithCreators = filteredCampaigns.map((campaign) => ({
      ...campaign,
      creator: creatorsMap.get(campaign.creatorId) || null
    }));
    
    return campaignsWithCreators;
  } catch (error) {
    console.error('Error getting campaigns:', error);
    return [];
  }
};

/**
 * Get top creators with aggregated stats
 * @param {object} filters - Filter options
 * @param {string} filters.country - Filter by country
 * @param {string} filters.timePeriod - Time period ('24h', '7d', '30d', or 'all')
 * @param {number} filters.limit - Number of creators to return
 * @returns {Promise<Array>} Array of creators with stats
 */
export const getTopCreators = async (filters = {}) => {
  const {
    country = null,
    timePeriod = 'all',
    limit: limitCount = 20
  } = filters;
  
  // Check if database is initialized
  if (!db) {
    console.error('Database not initialized - cannot get top creators');
    return [];
  }
  
  try {
    // Calculate time cutoff for filtering
    let timeCutoff = null;
    if (timePeriod !== 'all') {
      const now = new Date();
      switch (timePeriod) {
        case '24h':
          timeCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }
    
    // Build query for campaigns (active campaigns only)
    const campaignsQuery = query(
      collection(db, 'campaigns'),
      where('moderationStatus', '!=', 'removed')
    );
    const campaignsSnapshot = await getDocs(campaignsQuery);
    
    // Aggregate stats by creator
    const creatorStatsMap = new Map();
    
    // Process each campaign
    for (const campaignDoc of campaignsSnapshot.docs) {
      const campaignData = campaignDoc.data();
      const creatorId = campaignData.creatorId;
      
      // Initialize creator stats if not exists
      if (!creatorStatsMap.has(creatorId)) {
        creatorStatsMap.set(creatorId, {
          campaignsCount: 0,
          totalSupports: 0
        });
      }
      
      const stats = creatorStatsMap.get(creatorId);
      
      // Count campaigns created in time period (if time filter applied)
      if (!timeCutoff || (campaignData.createdAt && campaignData.createdAt.toDate() >= timeCutoff)) {
        stats.campaignsCount++;
      }
      
      // Count supports received in time period
      if (timeCutoff) {
        // Query downloads subcollection for this campaign within time period
        const downloadsQuery = query(
          collection(db, 'campaigns', campaignDoc.id, 'downloads'),
          where('downloadedAt', '>=', timeCutoff)
        );
        const downloadsSnapshot = await getDocs(downloadsQuery);
        stats.totalSupports += downloadsSnapshot.size;
      } else {
        // For 'all time', use the main supportersCount
        stats.totalSupports += campaignData.supportersCount || 0;
      }
    }
    
    // Fetch creator profiles
    const creatorIds = Array.from(creatorStatsMap.keys());
    const creatorPromises = creatorIds.map(async (creatorId) => {
      try {
        const creatorDocRef = doc(db, 'users', creatorId);
        const creatorDoc = await getDoc(creatorDocRef);
        
        if (creatorDoc.exists()) {
          const creatorData = { id: creatorDoc.id, ...creatorDoc.data() };
          const stats = creatorStatsMap.get(creatorId);
          
          return {
            ...creatorData,
            campaignsCount: stats.campaignsCount,
            totalSupports: stats.totalSupports
          };
        }
      } catch (error) {
        console.error('Error fetching creator profile:', error);
      }
      return null;
    });
    
    let creators = await Promise.all(creatorPromises);
    creators = creators.filter(creator => creator !== null);
    
    // Filter by country if specified
    if (country) {
      creators = creators.filter(creator => creator.country === country);
    }
    
    // Sort by total supports (descending)
    creators.sort((a, b) => b.totalSupports - a.totalSupports);
    
    // Limit results
    return creators.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting top creators:', error);
    return [];
  }
};

// ==================== ADMIN FUNCTIONS ====================

// Set user role (admin only - must be called from server-side with admin verification)
export const setUserRole = async (userId, role, adminId) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }
  
  if (!role || !['admin', 'user'].includes(role)) {
    return { success: false, error: 'Role must be either "admin" or "user"' };
  }
  
  if (!adminId) {
    return { success: false, error: 'Admin ID is required for authorization' };
  }
  
  const database = getDatabase();
  if (!database) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    // Verify admin user has admin role
    const adminDocRef = doc(database, 'users', adminId);
    const adminDoc = await getDoc(adminDocRef);
    
    if (!adminDoc.exists()) {
      return { success: false, error: 'Admin user not found' };
    }
    
    const adminData = adminDoc.data();
    if (adminData.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Only admins can change user roles' };
    }
    
    // Update target user's role
    const userDocRef = doc(database, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    await updateDoc(userDocRef, {
      role: role,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true, message: `User role updated to ${role}` };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error setting user role:', error);
    }
    const errorResponse = await handleFirebaseError(error, 'firestore', { returnType: 'string' });
    return { success: false, error: errorResponse || 'Failed to update user role. Please try again.' };
  }
};