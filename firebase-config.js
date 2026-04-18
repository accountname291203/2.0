// Firebase configuration provided by LO
const firebaseConfig = {
  apiKey: "AIzaSyD0T9LX62eiriN-9sKNSXqj0iokwwOeuHE",
  authDomain: "discord-f6467.firebaseapp.com",
  projectId: "discord-f6467",
  storageBucket: "discord-f6467.firebasestorage.app",
  messagingSenderId: "803794060206",
  appId: "1:803794060206:web:158789c48b26f3c4463e3f",
  measurementId: "G-R7W76N16NJ"
};

// Initialize Firebase (Compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
