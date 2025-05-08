import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    getDocs,
    query,
    orderBy,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAHfTgwgSamL-iR3PT4lqZZ219aqWZ-PZE",
    authDomain: "todolist-dd189.firebaseapp.com",
    projectId: "todolist-dd189",
    storageBucket: "todolist-dd189.firebasestorage.app",
    messagingSenderId: "324313137657",
    appId: "1:324313137657:web:772e9493deb8253d883d28",
    measurementId: "G-S2HD0VJNKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
    db,
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    getDocs,
    query,
    orderBy,
    doc,
    serverTimestamp
  };