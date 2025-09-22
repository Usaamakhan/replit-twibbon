"use client";

// Optimized Firestore helpers with static imports for better performance
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

import { auth, db } from './firebase-optimized';

// Create or update user profile
export const createUserProfile = async (user) => {
  if (!db || !user) return null;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        username: user.email?.split('@')[0] || '',
        bio: '',
        location: '',
        website: '',
        isEmailVerified: user.emailVerified || false,
        preferences: {
          emailNotifications: true,
          publicProfile: true
        }
      });
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        isEmailVerified: user.emailVerified || false
      });
    }
    
    return userRef;
  } catch (error) {
    throw error;
  }
};

// Get user profile by ID
export const getUserProfile = async (userId) => {
  if (!db || !userId) return null;
  
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  if (!db || !userId) return false;
  
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Create a new frame
export const createFrame = async (frameData) => {
  if (!db || !auth?.currentUser) return null;
  
  try {
    const framesRef = collection(db, 'frames');
    const frameDoc = await addDoc(framesRef, {
      ...frameData,
      createdBy: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      downloads: 0,
      isPublic: frameData.isPublic || false
    });
    
    return frameDoc.id;
  } catch (error) {
    throw error;
  }
};

// Get frames by user
export const getUserFrames = async (userId, limitCount = 20) => {
  if (!db || !userId) return [];
  
  try {
    const framesRef = collection(db, 'frames');
    const q = query(
      framesRef,
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    return [];
  }
};

// Get public frames
export const getPublicFrames = async (limitCount = 20) => {
  if (!db) return [];
  
  try {
    const framesRef = collection(db, 'frames');
    const q = query(
      framesRef,
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    return [];
  }
};

// Increment frame views
export const incrementFrameViews = async (frameId) => {
  if (!db || !frameId) return;
  
  try {
    const frameRef = doc(db, 'frames', frameId);
    await updateDoc(frameRef, {
      views: increment(1)
    });
  } catch (error) {
  }
};

// Export all helpers
export {
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
};