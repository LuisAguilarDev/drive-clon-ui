import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { env } from "../../env"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_firebase_apiKey,
  authDomain: env.NEXT_PUBLIC_firebase_authDomain,
  databaseURL: env.NEXT_PUBLIC_firebase_databaseURL,
  projectId: env.NEXT_PUBLIC_firebase_projectId,
  storageBucket: env.NEXT_PUBLIC_firebase_storageBucket,
  messagingSenderId: "678941564362",
  appId: "1:678941564362:web:15df0a2ece7076dd934333",
  measurementId: "G-VN3BSPJ14M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };
