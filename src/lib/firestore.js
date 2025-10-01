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
        usageCount: 0,                              // Total usage count
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

export const getUserCampaigns = async (userId) => {
  if (!userId) return [];
  
  // Check if database is initialized
  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Database not initialized - cannot get user campaigns');
    }
    return [];
  }
  
  try {
    const q = query(
      collection(db, 'campaigns'),
      where('creatorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const campaigns = [];
    
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    
    return campaigns;
  } catch (error) {
    // Return empty array on permissions error or any other error
    return [];
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

// Track campaign usage - increment usage count and download count (optimized: removed supporters object)
// Note: supportersCount now tracks total downloads, not unique supporters (cost optimization)
export const trackCampaignUsage = async (campaignId, userId) => {
  if (!campaignId || !userId) return { success: false, error: 'Missing campaignId or userId' };
  
  try {
    return await runTransaction(db, async (transaction) => {
      // Get campaign details to find the creator
      const campaignDocRef = doc(db, 'campaigns', campaignId);
      const campaignDoc = await transaction.get(campaignDocRef);
      
      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found');
      }
      
      const campaignData = campaignDoc.data();
      const campaignCreatorId = campaignData.creatorId;
      
      // Update campaign with usage count and supporter count (every download counts)
      const campaignUpdates = {
        usageCount: increment(1),
        supportersCount: increment(1),  // Simplified: every download increments
        updatedAt: serverTimestamp(),
      };
      
      transaction.update(campaignDocRef, campaignUpdates);
      
      // Update campaign creator's supportersCount for every download
      if (campaignCreatorId !== userId) {
        const creatorDocRef = doc(db, 'users', campaignCreatorId);
        transaction.update(creatorDocRef, {
          supportersCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      }
      
      return { 
        success: true,
        campaignCreatorId: campaignCreatorId !== userId ? campaignCreatorId : null 
      };
    });
  } catch (error) {
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