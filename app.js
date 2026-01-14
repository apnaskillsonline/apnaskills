// -------------------------------
// Firebase SDK imports (CDN ONLY)
// -------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// -------------------------------
// Firebase configuration (CORRECT)
// -------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBj8NFx3wd1PFXR37X4JcE9j4N9pJGnZ8A",
  authDomain: "apnaskills-ef242.firebaseapp.com",
  databaseURL: "https://apnaskills-ef242-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "apnaskills-ef242",
  storageBucket: "apnaskills-ef242.firebasestorage.app",
  messagingSenderId: "120699280754",
  appId: "1:120699280754:web:1aff20056bf990f67c11eb"
};

// -------------------------------
// Initialize Firebase
// -------------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// -------------------------------
// DOM references
// -------------------------------
const authScreen = document.getElementById("authScreen");
const appUI = document.getElementById("app");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userPhoto = document.getElementById("userPhoto");
const viewContainer = document.getElementById("viewContainer");

// -------------------------------
// Login with Google
// -------------------------------
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Google Login Error:", error);
    alert(error.message);
  }
});

// -------------------------------
// Logout
// -------------------------------
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// -------------------------------
// Auth state observer
// -------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authScreen.classList.remove("hidden");
    appUI.classList.add("hidden");
    return;
  }

  // Show app
  authScreen.classList.add("hidden");
  appUI.classList.remove("hidden");

  // User UI
  userName.textContent = user.displayName;
  userPhoto.src = user.photoURL;

  // Save user if first login
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    await set(userRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      role: "user",
      createdAt: Date.now()
    });

    // Welcome notification
    await set(ref(db, `notifications/${user.uid}/${Date.now()}`), {
      message: "Welcome to ApnaSkills 👋",
      read: false,
      createdAt: Date.now()
    });
  }

  loadSearchView();
});

// -------------------------------
// Default view after login
// -------------------------------
function loadSearchView() {
  viewContainer.innerHTML = `
    <h2>Search Tutors</h2>
    <p style="color:#9ca3af">
      Find tutors by location and specialization.<br>
      (Tutor search UI comes next.)
    </p>
  `;
}
