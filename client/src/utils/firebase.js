import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewai-afea6.firebaseapp.com",
  projectId: "interviewai-afea6",
  storageBucket: "interviewai-afea6.firebasestorage.app",
  messagingSenderId: "985782204764",
  appId: "1:985782204764:web:4fd51eb1a6e18118f7e999"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };