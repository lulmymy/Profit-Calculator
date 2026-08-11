import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3B1zXrhRfqW9YjN6zUWMskiN4yRk7_l8",
  authDomain: "login-b8ac8.firebaseapp.com",
  projectId: "login-b8ac8",
  storageBucket: "login-b8ac8.firebasestorage.app",
  messagingSenderId: "508328361935",
  appId: "1:508328361935:web:2e69386b5c8f570ee71cba"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);