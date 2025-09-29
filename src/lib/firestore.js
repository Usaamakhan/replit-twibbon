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

// Check if username already exists
export const checkUsernameExists = async (username) => {
  const normalizedUsername = username.toLowerCase().trim();
  
  // Check if database is initialized
  if (!db) {
    return true; // Assume exists on error to be safe
  }
  
  
  try {
    
    // Check the usernames collection directly - more efficient and consistent
    const usernameDocRef = doc(db, 'usernames', normalizedUsername);
    
    const usernameDoc = await getDoc(usernameDocRef);
    
    const exists = usernameDoc.exists();
    
    
    return exists;
  } catch (error) {
    return true; // Assume exists on error to be safe
  }
};

// Atomic username reservation using usernames collection to prevent race conditions
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
        framesCreated: 0,
        framesUsed: 0,
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
        framesCreated: userData.framesCreated || 0,
        framesUsed: userData.framesUsed || 0,
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

// Get user profile by username (for /[username] route) - uses usernames collection for consistency
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
      framesCreated: userData.framesCreated || 0,
      framesUsed: userData.framesUsed || 0,
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
      
      // If username is being changed, normalize and ensure it's unique using atomic reservation
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
  if (!userId) return { supportersCount: 0, campaignsCount: 0, framesCreated: 0, framesUsed: 0 };
  
  try {
    // Get stored counters from user profile for consistency
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      return {
        supportersCount: userProfile.supportersCount || 0,
        campaignsCount: userProfile.campaignsCount || 0,
        framesCreated: userProfile.framesCreated || 0,
        framesUsed: userProfile.framesUsed || 0,
      };
    } else {
      return { supportersCount: 0, campaignsCount: 0, framesCreated: 0, framesUsed: 0 };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting user stats:', error);
    }
    return { supportersCount: 0, campaignsCount: 0, framesCreated: 0, framesUsed: 0 };
  }
};

// Frame operations with comprehensive error handling
export const createFrame = async (frameData, userId) => {
  if (!userId) {
    return { success: false, error: 'User ID is required' };
  }
  
  if (!frameData || typeof frameData !== 'object') {
    return { success: false, error: 'Frame data is required' };
  }
  
  try {
    return await runTransaction(db, async (transaction) => {
      // Create the frame with proper defaults
      const frameRef = doc(collection(db, 'frames'));
      const frameDoc = {
        ...frameData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        usageCount: 0,
        supporters: {},
        isPublic: frameData?.isPublic ?? true,
      };
      
      transaction.set(frameRef, frameDoc);
      
      // Update user's frame counters atomically
      const userDocRef = doc(db, 'users', userId);
      transaction.update(userDocRef, {
        campaignsCount: increment(1),
        framesCreated: increment(1),
        updatedAt: serverTimestamp(),
      });
      
      return { success: true, frameId: frameRef.id };
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating frame:', error, { userId, frameData: { ...frameData, imageData: '[redacted]' } });
    }
    const errorResponse = await handleFirebaseError(error, 'firestore', { returnType: 'string' });
    return { success: false, error: errorResponse || 'Failed to create frame. Please try again.' };
  }
};

export const getPublicFrames = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'frames'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const frames = [];
    
    querySnapshot.forEach((doc) => {
      frames.push({ id: doc.id, ...doc.data() });
    });
    
    return frames;
  } catch (error) {
    return [];
  }
};

export const getUserFrames = async (userId) => {
  if (!userId) return [];
  
  // Check if database is initialized
  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Database not initialized - cannot get user frames');
    }
    return [];
  }
  
  try {
    const q = query(
      collection(db, 'frames'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const frames = [];
    
    querySnapshot.forEach((doc) => {
      frames.push({ id: doc.id, ...doc.data() });
    });
    
    return frames;
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
      
      // Check if username is being changed and ensure it's unique using atomic reservation
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

// Track frame usage - increment usage count and update user counters with unique supporter tracking
export const trackFrameUsage = async (frameId, userId) => {
  if (!frameId || !userId) return { success: false, error: 'Missing frameId or userId' };
  
  try {
    return await runTransaction(db, async (transaction) => {
      // Get frame details to find the creator
      const frameDocRef = doc(db, 'frames', frameId);
      const frameDoc = await transaction.get(frameDocRef);
      
      if (!frameDoc.exists()) {
        throw new Error('Frame not found');
      }
      
      const frameData = frameDoc.data();
      const frameCreatorId = frameData.createdBy;
      const currentSupporters = frameData.supporters || {};
      const isNewSupporter = frameCreatorId !== userId && !currentSupporters[userId];
      
      // Update frame with usage count and supporter tracking
      const frameUpdates = {
        usageCount: increment(1),
        updatedAt: serverTimestamp(),
      };
      
      // Add user to supporters list if not already there and not the creator
      if (frameCreatorId !== userId) {
        frameUpdates[`supporters.${userId}`] = serverTimestamp();
      }
      
      transaction.update(frameDocRef, frameUpdates);
      
      // Update user's framesUsed counter
      const userDocRef = doc(db, 'users', userId);
      transaction.update(userDocRef, {
        framesUsed: increment(1),
        updatedAt: serverTimestamp(),
      });
      
      // Update frame creator's supportersCount only if this is a new unique supporter
      if (isNewSupporter) {
        const creatorDocRef = doc(db, 'users', frameCreatorId);
        transaction.update(creatorDocRef, {
          supportersCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      }
      
      return { 
        success: true, 
        isNewSupporter,
        frameCreatorId: frameCreatorId !== userId ? frameCreatorId : null 
      };
    });
  } catch (error) {
    const errorResponse = await handleFirebaseError(error, 'firestore', { returnType: 'string' });
    return { success: false, error: errorResponse || 'Failed to complete operation. Please try again.' };
  }
};