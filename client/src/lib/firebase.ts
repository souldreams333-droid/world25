import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcZiWEKR7QeNOj8IanGW3j9modTG6iq7o",
  authDomain: "world2-60f46.firebaseapp.com",
  projectId: "world2-60f46",
  storageBucket: "world2-60f46.firebasestorage.app",
  messagingSenderId: "478651672174",
  appId: "1:478651672174:web:0199e7325835969849687f",
  measurementId: "G-ERZ30VQCK3"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app);
export default app;
