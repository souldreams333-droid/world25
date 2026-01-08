import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDcZiWEKR7QeNOj8IanGW3j9modTG6iq7o",
  authDomain: "world2-60f46.firebaseapp.com",
  projectId: "world2-60f46",
  storageBucket: "world2-60f46.firebasestorage.app",
  messagingSenderId: "478651672174",
  appId: "1:478651672174:web:eda2df15a046915849687f",
  measurementId: "G-D8S036S7QJ"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export default app;
