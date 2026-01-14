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

/* Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyBj8NFxNFxwd1PFXR37X4JcE9j4N9pJGnZ8A",
  authDomain: "apnaskills-ef242.firebaseapp.com",
  databaseURL: "https://apnaskills-ef242-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "apnaskills-ef242",
  storageBucket: "apnaskills-ef242.firebasestorage.app",
  messagingSenderId: "120699280754",
  appId: "1:120699280754:web:1aff20056bf990f67c11eb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

/* DOM */
const authScreen = document.getElementById("authScreen");
const appUI = document.getElementById("app");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const userPhoto = document.getElementById("userPhoto");
const viewContainer = document.getElementById("viewContainer");

/* Login */
loginBtn.onclick = () => signInWithPopup(auth, provider);

/* Logout */
logoutBtn.onclick = () => signOut(auth);

/* Auth State */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authScreen.classList.remove("hidden");
    appUI.classList.add("hidden");
    return;
  }

  authScreen.classList.add("hidden");
  appUI.classList.remove("hidden");

  userName.textContent = user.displayName;
  userPhoto.src = user.photoURL;

  const userRef = ref(db, `users/${user.uid}`);
  const snap = await get(userRef);

  if (!snap.exists()) {
    await set(userRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      role: "user",
      createdAt: Date.now()
    });

    await set(ref(db, `notifications/${user.uid}/${Date.now()}`), {
      message: "Welcome to ApnaSkills 👋",
      read: false
    });
  }

  loadSearchView();
});

/* Default View */
function loadSearchView() {
  viewContainer.innerHTML = `
    <h2>Search Tutors</h2>
    <p style="color:#9ca3af">
      Find tutors by location and specialization.  
      (Search UI comes in Phase 2)
    </p>
  `;
}
