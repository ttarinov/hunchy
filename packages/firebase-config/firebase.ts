import { initializeApp } from "firebase/app";
import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  GithubAuthProvider,
  GoogleAuthProvider,
  connectAuthEmulator
} from "firebase/auth";
import { getDatabase, connectDatabaseEmulator, ref, get, update } from "firebase/database";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || ""
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const functions = getFunctions(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    } else {
      console.warn('Firebase Analytics is not supported in this environment');
    }
  }).catch(err => {
    console.error('Error checking analytics support:', err);
  });
}
if (process.env.NODE_ENV === 'development') {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  connectFunctionsEmulator(functions, host, 5001);
  connectDatabaseEmulator(database, host, 9000);
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(firestore, host, 8080);
  connectStorageEmulator(storage, host, 9199);
}
const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider();
export {
  app,
  auth,
  database,
  functions,
  firestore,
  storage,
  analytics,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  githubProvider,
  googleProvider,
  ref,
  get,
  update
};
