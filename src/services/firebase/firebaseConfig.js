import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  push,
  get,
  child,
  off,
  remove
} from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForRTDBDirectEndpoint",
  authDomain: "medikiosk-7cf65.firebaseapp.com",
  databaseURL: "https://medikiosk-7cf65-default-rtdb.firebaseio.com",
  projectId: "medikiosk-7cf65",
  storageBucket: "medikiosk-7cf65.firebasestorage.app",
  messagingSenderId: "105678912345",
  appId: "1:105678912345:web:abcdef1234567890"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);

export {
  app,
  db,
  auth,
  ref,
  onValue,
  set,
  update,
  push,
  get,
  child,
  off,
  remove,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged
};
