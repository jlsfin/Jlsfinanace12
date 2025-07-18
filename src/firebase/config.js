// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAy9t3-FivPb7lJmMz4QWUj0d96FF8ZYd4",
  authDomain: "jlsfin-d5f7e.firebaseapp.com",
  projectId: "jlsfin-d5f7e",
  storageBucket: "jlsfin-d5f7e.firebasestorage.app",
  messagingSenderId: "111133608624",
  appId: "1:111133608624:web:4f75d404d7b3cc9fc00975",
  measurementId: "G-0K50V3JQMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;

