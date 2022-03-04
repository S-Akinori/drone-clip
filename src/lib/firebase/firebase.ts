import {getApp, getApps, initializeApp} from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {getFirestore, connectFirestoreEmulator} from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth();
const db = getFirestore()
const storage = getStorage();

if(process.env.NEXT_PUBLIC_ENV !== 'production') {
  console.log('firebase emulators start')
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}

export {auth, db, storage};

export default app;