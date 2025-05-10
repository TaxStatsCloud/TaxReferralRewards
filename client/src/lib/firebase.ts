import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key-for-development",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "demo-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const registerWithEmailAndPassword = async (email: string, password: string, userData: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      ...userData,
      createdAt: new Date()
    });
    
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const subscribeToAuthChanges = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User functions
export const getUserProfile = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { profile: userDoc.data(), error: null };
    } else {
      return { profile: null, error: "User not found" };
    }
  } catch (error: any) {
    return { profile: null, error: error.message };
  }
};

export const updateUserProfile = async (uid: string, data: any) => {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Referral functions
export const createReferral = async (referralData: any) => {
  try {
    const referralsRef = collection(db, "referrals");
    const newReferralRef = doc(referralsRef);
    
    await setDoc(newReferralRef, {
      ...referralData,
      id: newReferralRef.id,
      createdAt: new Date()
    });
    
    return { id: newReferralRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getUserReferrals = async (uid: string) => {
  try {
    const referralsQuery = query(
      collection(db, "referrals"),
      where("referrerId", "==", uid)
    );
    
    const querySnapshot = await getDocs(referralsQuery);
    const referrals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return { referrals, error: null };
  } catch (error: any) {
    return { referrals: [], error: error.message };
  }
};

export { auth, db };
