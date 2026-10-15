
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDbz2zOHElL_jbhf5oTc-0FEHWiaW3JYsU",
  authDomain: "betisports-data.firebaseapp.com",
  databaseURL:
    "https://betisports-data-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "betisports-data",
  storageBucket: "betisports-data.firebasestorage.app",
  messagingSenderId: "541689510086",
  appId: "1:541689510086:web:08f71f6cf90dbb38c5bfc7",
  measurementId: "G-NM4LT9WGCC",
};

// Prevent Firebase from being initialized multiple times
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getDatabase(app);

export default app