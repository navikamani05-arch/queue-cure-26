import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDWdTCkwH7J_LEAususXFSZlq9WALTAE3w",
  authDomain: "queue-cure-38baa.firebaseapp.com",
  databaseURL: "https://queue-cure-38baa-default-rtdb.firebaseio.com",
  projectId: "queue-cure-38baa",
  storageBucket: "queue-cure-38baa.firebasestorage.app",
  messagingSenderId: "983702570361",
  appId: "1:983702570361:web:a664e760a1fb61f23bdba8"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);