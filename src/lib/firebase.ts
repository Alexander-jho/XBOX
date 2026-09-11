import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Firestore,
  DocumentReference,
  DocumentData,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from 'firebase/auth';

export const firebaseConfig = {
  projectId: "predictive-graph-6cf5x",
  appId: "1:887918588587:web:342c3624ac530ea4d6fdee",
  apiKey: "AIzaSyAlgV8cxUU3a28BYDRfAd4RPn5TilHUcag",
  authDomain: "predictive-graph-6cf5x.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-controldenegocio-0805b6b2-f59d-470a-b88d-eebe95de65ee",
  storageBucket: "predictive-graph-6cf5x.firebasestorage.app",
  messagingSenderId: "887918588587",
  oAuthClientId: "887918588587-8mfohkjtifpahi1vqut2hkh4p8dikjch.apps.googleusercontent.com",
};

let app: any = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  
  // Connect to the specific database instance created for this business
  if (firebaseConfig.firestoreDatabaseId) {
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }

  // Authenticate anonymously so all queries have a valid Firebase auth token (prevents 403 Forbidden)
  signInAnonymously(auth).catch((err) => {
    console.warn('Firebase anonymous auth warning (still continuing with public rules):', err?.message);
  });
} catch (error) {
  console.error('Error initializing Firebase client:', error);
}

export { app, auth, db };

export const CENTRAL_DOC_COLLECTION = 'pos_central_data';
export const CENTRAL_DOC_ID = 'business_state';

export function getCentralDocRef(): DocumentReference<DocumentData> | null {
  if (!db) return null;
  return doc(db, CENTRAL_DOC_COLLECTION, CENTRAL_DOC_ID);
}
