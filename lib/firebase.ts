import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "",
  authDomain: "taskpilot-ai-44432.firebaseapp.com",
  projectId: "taskpilot-ai-44432",
  storageBucket: "taskpilot-ai-44432.firebasestorage.app",
  messagingSenderId: "66689161556",
  appId: "1:66689161556:web:cd7cd675ee4f0cb3a910c1",
  measurementId: "G-RG1023DZZT"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
