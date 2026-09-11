import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import type { DocumentReference, DocumentData, Unsubscribe } from 'firebase/firestore';


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
let db: Firestore | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Connect directly to the specific cloud database instance created for this business
  if (firebaseConfig.firestoreDatabaseId) {
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Error initializing Firebase client:', error);
}

export { app, db };

export const CENTRAL_DOC_COLLECTION = 'pos_central_data';
export const CENTRAL_DOC_ID = 'business_state';

export function getCentralDocRef(): DocumentReference<DocumentData> | null {
  if (!db) return null;
  return doc(db, CENTRAL_DOC_COLLECTION, CENTRAL_DOC_ID);
}

/**
 * Persist a table or partial update directly to Firebase Firestore
 */
export async function saveToCloudFirestore(table: string, data: any, updatedBy: string = 'sistema'): Promise<boolean> {
  const docRef = getCentralDocRef();
  if (!docRef) return false;
  try {
    await setDoc(docRef, {
      [table]: data,
      lastUpdated: Date.now(),
      updatedBy,
    }, { merge: true });
    return true;
  } catch (err: any) {
    console.error(`Error saving table ${table} to Firestore:`, err?.message || err);
    throw err;
  }
}

/**
 * Fetch full business state directly from Firebase Firestore
 */
export async function fetchFromCloudFirestore(): Promise<DocumentData | null> {
  const docRef = getCentralDocRef();
  if (!docRef) return null;
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}

/**
 * Subscribe to real-time changes from Firebase Firestore
 */
export function subscribeToCloudFirestore(
  onData: (data: DocumentData, hasPendingWrites: boolean) => void,
  onError?: (error: Error) => void
): Unsubscribe | null {
  const docRef = getCentralDocRef();
  if (!docRef) return null;

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data(), snapshot.metadata.hasPendingWrites);
      }
    },
    (err) => {
      console.warn('Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
}

