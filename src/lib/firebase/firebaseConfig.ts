import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration.
// Values are read from Vite environment variables (prefixed with VITE_) at
// build time. See .env.example for the expected keys. The messagingSenderId,
// appId and measurementId fall back to the original project's public values.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "678941564362",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ??
    "1:678941564362:web:15df0a2ece7076dd934333",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-VN3BSPJ14M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
