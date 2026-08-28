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

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForRTDBDirectEndpoint", // Standard Web SDK client config for Realtime Database
  authDomain: "medikiosk-7cf65.firebaseapp.com",
  databaseURL: "https://medikiosk-7cf65-default-rtdb.firebaseio.com",
  projectId: "medikiosk-7cf65",
  storageBucket: "medikiosk-7cf65.firebasestorage.app",
  messagingSenderId: "105678912345",
  appId: "1:105678912345:web:abcdef1234567890"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export {
  app,
  db,
  ref,
  onValue,
  set,
  update,
  push,
  get,
  child,
  off,
  remove
};
