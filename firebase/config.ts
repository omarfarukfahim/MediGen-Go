import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace the following with your app's Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyBH1ZRwv8y505qr7b2aGjxpwkyYEF7w8wI",
  authDomain: "medigen-ai.firebaseapp.com",
  projectId: "medigen-ai",
  storageBucket: "medigen-ai.firebasestorage.app",
  messagingSenderId: "1063450513268",
  appId: "1:1063450513268:web:15e9f79dc8567531d6a621",
  measurementId: "G-4XTT5HX4BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };