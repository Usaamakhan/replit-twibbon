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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// User Profile operations
export const createUserProfile = async (user) => {
  if (!user) return;
  
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    const { displayName, email, photoURL } = user;
    try {
      await setDoc(userDocRef, {
        displayName,
        email,
        photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        framesCreated: 0,
        framesUsed: 0,
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }
  
  return userDocRef;
};

export const getUserProfile = async (userId) => {
  if (!userId) return null;
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.log('No user profile found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Frame operations
export const createFrame = async (frameData, userId) => {
  if (!userId) return null;
  
  try {
    const frameRef = await addDoc(collection(db, 'frames'), {
      ...frameData,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      usageCount: 0,
      isPublic: frameData?.isPublic ?? true,
    });
    
    return frameRef.id;
  } catch (error) {
    console.error('Error creating frame:', error);
    return null;
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