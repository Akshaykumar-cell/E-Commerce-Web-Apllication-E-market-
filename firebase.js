// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSg_S0V6jxvO1AMiNt6r57PLUwJSpmfyI",
  authDomain: "e-commerce-web-app-ef4cc.firebaseapp.com",
  projectId: "e-commerce-web-app-ef4cc",
  storageBucket: "e-commerce-web-app-ef4cc.firebasestorage.app",
  messagingSenderId: "1020816892272",
  appId: "1:1020816892272:web:590a939abc6757f2c36fb5",
  measurementId: "G-MT9WJR58FR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics (only in browser environment to support SSR/testing safety)
let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Firestore (Cloud Firestore Database)
const db = getFirestore(app);

// Initialize Realtime Database
const rtdb = getDatabase(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

export {
  app,
  analytics,
  db,
  rtdb,
  auth
};
