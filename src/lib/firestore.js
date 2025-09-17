// Firestore database operations for the Twibbonize app
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
import { db } from './firebase';

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
    console.warn(`Max attempts reached for username generation, using fallback: ${finalUsername}`);
  }
  
  return finalUsername;
};

// Check if username already exists
export const checkUsernameExists = async (username) => {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username:', error);
    return true; // Assume exists on error to be safe
  }
};

// Atomic username reservation using transactions to prevent race conditions
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
    
    // Try to find available username atomically
    while (attempts < maxAttempts) {
      const usernameQuery = query(collection(db, 'users'), where('username', '==', finalUsername));
      const existingDocs = await getDocs(usernameQuery);
      
      if (existingDocs.empty) {
        // Username is available, reserve it atomically
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
    console.warn(`Max attempts reached for username generation, using fallback: ${finalUsername}`);
    
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
  
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const { displayName, email, photoURL } = user;
      
      // Prepare user profile data
      const userProfile = {
        displayName,
        email,
        photoURL,
        bio: '',
        bannerImage: '',
        profileImage: photoURL || '',
        supportersCount: 0,
        campaignsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        framesCreated: 0,
        framesUsed: 0,
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
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  if (!userId) {
    console.warn('getUserProfile called with invalid userId');
    return null;
  }
  
  try {
    const userDocRef = doc(db, 'users', userId);
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
      console.log('No user profile found for userId:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error, { userId });
    return null;
  }
};

// Get user profile by username (for /[username] route)
export const getUserProfileByUsername = async (username) => {
  if (!username || typeof username !== 'string') {
    console.warn('getUserProfileByUsername called with invalid username:', username);
    return null;
  }
  
  // Normalize username
  const normalizedUsername = username.toLowerCase().trim();
  if (!normalizedUsername) {
    console.warn('Username is empty after normalization:', username);
    return null;
  }
  
  try {
    const q = query(collection(db, 'users'), where('username', '==', normalizedUsername));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
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
      console.log('No user profile found for username:', normalizedUsername);
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile by username:', error, { username, normalizedUsername });
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  if (!userId) return false;
  
  // Whitelist of safe fields that users can update
  const allowedFields = ['bio', 'bannerImage', 'profileImage'];
  
  // Filter updates to only include allowed fields
  const filteredUpdates = {};
  for (const field of allowedFields) {
    if (updates.hasOwnProperty(field)) {
      filteredUpdates[field] = updates[field];
    }
  }
  
  // If no valid fields to update, return early
  if (Object.keys(filteredUpdates).length === 0) {
    console.warn('No allowed fields provided for update');
    return false;
  }
  
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...filteredUpdates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
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
    console.error('Error getting user stats:', error);
    return { supportersCount: 0, campaignsCount: 0, framesCreated: 0, framesUsed: 0 };
  }
};

// Frame operations with comprehensive error handling
export const createFrame = async (frameData, userId) => {
  if (!userId) {
    console.warn('createFrame called without userId');
    return { success: false, error: 'User ID is required' };
  }
  
  if (!frameData || typeof frameData !== 'object') {
    console.warn('createFrame called with invalid frameData');
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
    console.error('Error creating frame:', error, { userId, frameData: { ...frameData, imageData: '[redacted]' } });
    return { success: false, error: error.message || 'Failed to create frame' };
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
    console.error('Error getting public frames:', error);
    return [];
  }
};

export const getUserFrames = async (userId) => {
  if (!userId) return [];
  
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
    console.error('Error getting user frames:', error);
    return [];
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
    console.error('Error tracking frame usage:', error);
    return { success: false, error: error.message };
  }
};