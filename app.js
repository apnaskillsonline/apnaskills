// ==================== IMPORTS & CONFIG ====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getDatabase, ref, set, get, push, update, onValue, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBnGKcjP9kXe7dFhgD-SZRVYZGT5pTB-_c",
    authDomain: "apnaskills-483e2.firebaseapp.com",
    databaseURL: "https://apnaskills-483e2-default-rtdb.firebaseio.com",
    projectId: "apnaskills-483e2",
    storageBucket: "apnaskills-483e2.firebasestorage.app",
    messagingSenderId: "956454333482",
    appId: "1:956454333482:web:e2071d6721576ca10da753",
    measurementId: "G-XYHN0EZ9TF"
};

// Firefly Animation
function createFireflies() {
    const fireflyCount = 20;
    for (let i = 0; i < fireflyCount; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';
        const top = Math.random() * window.innerHeight;
        const left = Math.random() * window.innerWidth;
        const size = Math.random() * 10 + 5;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;

        firefly.style.top = `${top}px`;
        firefly.style.left = `${left}px`;
        firefly.style.width = `${size}px`;
        firefly.style.height = `${size}px`;
        firefly.style.animationDuration = `${duration}s`;
        firefly.style.animationDelay = `${delay}s`;
        document.body.appendChild(firefly);
    }
}
window.addEventListener('load', createFireflies);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

// ==================== STATE MANAGEMENT ====================
const state = {
    user: null, // Firebase Auth User
    profile: null, // Database User Profile
    instructors: [],
    categories: {},
    isInstructorMode: false
};

// ==================== CONSTANTS ====================
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana'];
const SPECIALIZATIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'Programming', 'Data Science', 'Music', 'Guitar', 'Piano', 'Dance', 'Yoga', 'Fitness', 'Art', 'Drawing', 'Cooking', 'French', 'Spanish', 'German'];

// ==================== AUTHENTICATION FLOW ====================

// Login
document.getElementById('googleLoginBtn').addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed. Please try again.");
    }
});

// Logout
document.getElementById('studentLogoutBtn').addEventListener('click', () => signOut(auth));
document.getElementById('instructorLogoutBtn').addEventListener('click', () => signOut(auth));

// Auth State Listener (Core Logic)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        state.user = user;
        await handleUserLogin(user);
    } else {
        handleUserLogout();
    }
});

async function handleUserLogin(user) {
    const userRef = ref(database, `users/${user.uid}`);

    try {
        let snapshot = await get(userRef);

        // Create profile if not exists
        if (!snapshot.exists()) {
            const newProfile = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                isInstructor: false,
                createdAt: Date.now()
            };
            await set(userRef, newProfile);

            // Welcome Notification
            const notifRef = push(ref(database, `notifications/${user.uid}`));
            await set(notifRef, {
                type: 'welcome',
                message: 'Welcome to ApnaSkills! Start exploring.',
                timestamp: Date.now(),
                read: false
            });

            snapshot = await get(userRef);
        }

        state.profile = snapshot.val();

        // Hide Login
        document.getElementById('loginPage').classList.add('hidden');

        // Determine View
        if (state.profile.isInstructor && localStorage.getItem('lastView') === 'instructor') {
            loadInstructorApp();
        } else {
            loadStudentApp();
        }

    } catch (error) {
        console.error("Profile Load Error:", error);
        alert("Failed to load profile. Please refresh.");
    }
}

function handleUserLogout() {
    state.user = null;
    state.profile = null;
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('studentApp').classList.add('hidden');
    document.getElementById('instructorApp').classList.add('hidden');
}

// ==================== STUDENT APP LOGIC ====================

async function loadStudentApp() {
    state.isInstructorMode = false;
    localStorage.setItem('lastView', 'student');

    document.getElementById('studentApp').classList.remove('hidden');
    document.getElementById('instructorApp').classList.add('hidden');

    // Update UI Header
    document.getElementById('studentUserNameMenu').textContent = state.user.displayName;
    document.getElementById('studentUserAvatarMenu').src = state.user.photoURL;

    // Handle "Become Instructor" buttons
    const becomeBtns = document.querySelectorAll('.become-instructor-trigger');
    becomeBtns.forEach(btn => {
        if (state.profile.isInstructor) {
            btn.innerHTML = '📊 Switch to Dashboard';
            btn.onclick = (e) => {
                e.preventDefault();
                loadInstructorApp();
            };
        } else {
            console.log("Setting up click for:", btn);
            btn.onclick = (e) => {
                e.preventDefault();
                // Registration Modal
                const modalHtml = `
                   <div id="instructorModal" class="modal-overlay">
                       <div class="modal-content">
                           <div class="modal-header">
                               <h3>Become an Instructor</h3>
                               <button onclick="document.getElementById('instructorModal').remove()">✕</button>
                           </div>
                           <div class="modal-body">
                               <form id="instructorForm">
                                   <div class="input-group" style="margin-bottom:12px;">
                                        <label>Specialization</label>
                                        <input type="text" id="regSpec" required placeholder="e.g. Mathematics, Guitar, Yoga">
                                   </div>
                                   <div class="input-group" style="margin-bottom:12px;">
                                        <label>Experience (Years)</label>
                                        <input type="number" id="regExp" required min="0">
                                   </div>
                                   <div class="input-group" style="margin-bottom:12px;">
                                        <label>Hourly Rate (₹)</label>
                                        <input type="number" id="regRate" required min="0">
                                   </div>
                                   <div class="input-group" style="margin-bottom:12px;">
                                        <label>Location</label>
                                        <input type="text" id="regLoc" required placeholder="City, Area">
                                   </div>
                               </form>
                           </div>
                           <div class="modal-footer">
                               <button class="btn" onclick="document.getElementById('instructorModal').remove()">Cancel</button>
                               <button class="btn btn-primary" onclick="submitInstructorRegistration()">Register</button>
                           </div>
                       </div>
                   </div>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHtml);
            };
        }
    });

    window.submitInstructorRegistration = async () => {
        const spec = document.getElementById('regSpec').value;
        const exp = document.getElementById('regExp').value;
        const rate = document.getElementById('regRate').value;
        const loc = document.getElementById('regLoc').value;

        if (!spec || !exp || !rate || !loc) {
            alert("Please fill all fields");
            return;
        }

        try {
            // Update User Profile
            await update(ref(database, `users/${state.user.uid}`), {
                isInstructor: true
            });

            // Create Instructor Entry
            await set(ref(database, `instructors/${state.user.uid}`), {
                userId: state.user.uid,
                name: state.user.displayName,
                photoURL: state.user.photoURL,
                email: state.user.email,
                specialization: spec,
                experience: exp,
                hourlyRate: rate,
                location: loc,
                rating: 5.0,
                ratingCount: 0
            });

            alert("Congratulations! You are now an Instructor.");
            document.getElementById('instructorModal').remove();

            // Reload to refresh state
            window.location.reload();

        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed. Please try again.");
        }
        // Load Data
        await loadInstructors();
        await loadCategories();
        setupNotifications('student');
        initializeSearch();
    }

    // Data Fetching: Instructors
    async function loadInstructors() {
        const dbRef = ref(database, 'instructors');
        const snapshot = await get(dbRef);
        const grid = document.getElementById('studentInstructorsGrid');

        state.instructors = [];
        grid.innerHTML = '<p class="loading-text">Loading instructors...</p>';

        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const inst = child.val();
                inst.id = child.key;
                // Filter out self
                if (inst.userId !== state.user.uid) {
                    state.instructors.push(inst);
                }
            });
        }

        renderInstructors(state.instructors);
    }

    function renderInstructors(list) {
        const grid = document.getElementById('studentInstructorsGrid');
        if (list.length === 0) {
            grid.innerHTML = '<div class="empty-state">No instructors found.</div>';
            return;
        }

        grid.innerHTML = list.map(inst => `
        <div class="instructor-card">
            <div class="card-header">
                <img src="${inst.photoURL || 'https://via.placeholder.com/60'}" class="instructor-avatar" alt="${inst.name}">
                <div>
                    <h3>${inst.name}</h3>
                    <p style="color: var(--brand-blue); font-weight: 500;">${inst.specialization}</p>
                    <small>⭐ ${inst.rating || 'New'} (${inst.ratingCount || 0} reviews)</small>
                </div>
            </div>
            <div class="card-body">
                <p><strong>Exp:</strong> ${inst.experience} years</p>
                <p><strong>Loc:</strong> ${inst.location}</p>
                <p><strong>Rate:</strong> ₹${inst.hourlyRate}/hr</p>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary" style="width: 100%" onclick="window.openBooking('${inst.id}')">Book Session</button>
            </div>
        </div>
    `).join('');
    }

    // Data Fetching: Categories
    async function loadCategories() {
        // Derived from instructors for now
        const counts = {};
        state.instructors.forEach(inst => {
            counts[inst.specialization] = (counts[inst.specialization] || 0) + 1;
        });

        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = Object.keys(counts).map(cat => `
        <div class="card" style="text-align: center; cursor: pointer;" onclick="window.filterByCat('${cat}')">
            <h3>${cat}</h3>
            <p>${counts[cat]} Instructor(s)</p>
        </div>
    `).join('');
    }

    // Search Logic
    function initializeSearch() {
        const form = document.getElementById('studentSearchForm');

        // Debounce Dropdowns
        setupDropdown('studentLocationInput', 'studentLocationSuggestions', CITIES, 'RefineLocation');
        setupDropdown('studentSpecializationInput', 'studentSpecializationSuggestions', SPECIALIZATIONS, 'RefineSpec');

        form.onsubmit = (e) => {
            e.preventDefault();
            const loc = document.getElementById('studentLocationInput').value.toLowerCase();
            const spec = document.getElementById('studentSpecializationInput').value.toLowerCase();

            const filtered = state.instructors.filter(inst => {
                const matchesLoc = !loc || inst.location.toLowerCase().includes(loc) || (inst.landmark && inst.landmark.toLowerCase().includes(loc));
                const matchesSpec = !spec || inst.specialization.toLowerCase().includes(spec);
                return matchesLoc && matchesSpec;
            });

            renderInstructors(filtered);
            document.getElementById('studentClearSearchBtn').classList.remove('hidden');
        };

        document.getElementById('studentClearSearchBtn').onclick = () => {
            document.getElementById('studentLocationInput').value = '';
            document.getElementById('studentSpecializationInput').value = '';
            renderInstructors(state.instructors);
            document.getElementById('studentClearSearchBtn').classList.add('hidden');
        };
    }

    function setupDropdown(inputId, listId, dataArray, type) {
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);

        input.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            if (!val) {
                list.classList.add('hidden');
                return;
            }

            const matches = dataArray.filter(item => item.toLowerCase().includes(val));
            list.innerHTML = matches.map(item => `<div class="suggestion-item">${item}</div>`).join('');

            if (matches.length > 0) list.classList.remove('hidden');
            else list.classList.add('hidden');
        });

        list.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                input.value = e.target.textContent;
                list.classList.add('hidden');
            }
        });

        // Hide on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest(`#${inputId}`) && !e.target.closest(`#${listId}`)) {
                list.classList.add('hidden');
            }
        });
    }

    window.filterByCat = (cat) => {
        document.getElementById('studentSpecializationInput').value = cat;
        document.getElementById('studentSearchForm').dispatchEvent(new Event('submit'));
    };

    // ==================== INSTRUCTOR APP LOGIC ====================

    async function loadInstructorApp() {
        state.isInstructorMode = true;
        localStorage.setItem('lastView', 'instructor');

        document.getElementById('studentApp').classList.add('hidden');
        document.getElementById('instructorApp').classList.remove('hidden');

        document.getElementById('instructorUserNameMenu').textContent = state.user.displayName;
        document.getElementById('instructorUserAvatarMenu').src = state.user.photoURL;

        // Load Dashboard Stats
        loadInstructorDashboard();
        setupNotifications('instructor');

        document.getElementById('switchToStudentBtn').onclick = (e) => {
            e.preventDefault();
            loadStudentApp();
        };
    }

    async function loadInstructorDashboard() {
        const dashboard = document.getElementById('instructorDashboard');
        // Fetch bookings for this instructor
        // For demo purposes, simplified:
        dashboard.innerHTML = `
        <div class="card">
            <h3>Total Bookings</h3>
            <p class="text-brand-blue" style="font-size: 2rem; font-weight: 800;">0</p>
        </div>
        <div class="card">
            <h3>Rating</h3>
            <p class="text-warning" style="font-size: 2rem; font-weight: 800;">0.0</p>
        </div>
        <div class="card">
            <h3>Profile Views</h3>
            <p class="text-brand-green" style="font-size: 2rem; font-weight: 800;">0</p>
        </div>
    `;
    }

    // ==================== BOOKING SYSTEM ====================

    window.openBooking = (instructorId) => {
        const instructor = state.instructors.find(i => i.id === instructorId);
        if (!instructor) return;

        const modalHtml = `
    <div id="bookingModal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Book Session with ${instructor.name}</h3>
                <button onclick="document.getElementById('bookingModal').remove()">✕</button>
            </div>
            <div class="modal-body">
                <form id="bookingForm">
                    <div class="input-group" style="margin-bottom:12px;">
                         <label>Date</label>
                         <input type="date" id="bookDate" required>
                    </div>
                    <div class="input-group" style="margin-bottom:12px;">
                         <label>topic</label>
                         <input type="text" id="bookTopic" placeholder="What do you want to learn?" required>
                    </div>
                    <p>Price: <strong>₹${instructor.hourlyRate}/hr</strong></p>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="document.getElementById('bookingModal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="confirmBooking('${instructorId}')">Confirm</button>
            </div>
        </div>
    </div>
    `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };

    window.confirmBooking = async (instructorId) => {
        const date = document.getElementById('bookDate').value;
        const topic = document.getElementById('bookTopic').value;

        if (!date || !topic) {
            alert("Please fill all fields");
            return;
        }

        try {
            const bookingsRef = ref(database, 'bookings');
            const newBooking = push(bookingsRef);
            await set(newBooking, {
                studentId: state.user.uid,
                instructorId: instructorId,
                date: date,
                topic: topic,
                status: 'pending',
                timestamp: Date.now()
            });

            alert("Booking request sent!");
            document.getElementById('bookingModal').remove();
        } catch (err) {
            console.error(err);
            alert("Booking failed");
        }
    };

    // ==================== NAVIGATION & TABS ====================

    function setupNavigation(appId) {
        const links = document.querySelectorAll(`#${appId} .menu-link, #${appId} .menu-item`);
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.id.includes('Logout') || link.id.includes('Switch') || link.id === 'becomeInstructorBtn') return;

                e.preventDefault();
                const pageId = link.dataset.page;

                // Hide all pages in this app
                document.querySelectorAll(`#${appId} .page-content`).forEach(p => p.classList.add('hidden'));

                if (pageId === 'home') document.getElementById('studentHomePage').classList.remove('hidden');
                if (pageId === 'bookings') {
                    document.getElementById('studentBookingsPage').classList.remove('hidden');
                    loadBookings('student');
                }
                if (pageId === 'notifications') document.getElementById('studentNotificationsPage').classList.remove('hidden');

                // Instructor Pages
                if (pageId === 'instructor-home') document.getElementById('instructorHomePage').classList.remove('hidden');
                if (pageId === 'instructor-bookings') {
                    document.getElementById('instructorBookingsPage').classList.remove('hidden');
                    loadBookings('instructor');
                }
                if (pageId === 'instructor-profile') document.getElementById('instructorProfilePage').classList.remove('hidden');
                if (pageId === 'instructor-notifications') document.getElementById('instructorNotificationsPage').classList.remove('hidden');
            });
        });
    }

    setupNavigation('studentApp');
    setupNavigation('instructorApp');

    // Menu Toggles
    const toggles = [
        { btn: 'studentMenuBtn', menu: 'studentDropdown' },
        { btn: 'instructorMenuBtn', menu: 'instructorDropdown' }
    ];

    toggles.forEach(({ btn, menu }) => {
        const b = document.getElementById(btn);
        const m = document.getElementById(menu);
        if (b && m) {
            b.onclick = (e) => {
                e.stopPropagation();
                m.classList.toggle('active');
            };
        }
    });

    document.body.onclick = () => {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
    };


    // ==================== NOTIFICATIONS ====================
    function setupNotifications(role) {
        const refPath = `notifications/${state.user.uid}`;
        const badgeId = `${role}NotificationBadge`;
        const listId = `${role}NotificationsList`;

        onValue(ref(database, refPath), (snapshot) => {
            const data = snapshot.val();
            const list = document.getElementById(listId);
            const badge = document.getElementById(badgeId);

            if (data) {
                const notifs = Object.values(data).reverse(); // Newest first
                const unreadCount = notifs.filter(n => !n.read).length;

                badge.textContent = unreadCount;
                if (unreadCount > 0) badge.classList.remove('hidden');
                else badge.classList.add('hidden');

                list.innerHTML = notifs.map(n => `
                <div class="card" style="margin-bottom: 10px; border-left: 4px solid var(--brand-blue);">
                    <p>${n.message}</p>
                    <small style="color:var(--text-light)">${new Date(n.timestamp).toLocaleDateString()}</small>
                </div>
            `).join('');
            } else {
                list.innerHTML = '<p>No notifications.</p>';
            }
        });
    }

    async function loadBookings(role) {
        // Placeholder for booking loading logic
        const listId = `${role}CurrentBookings`;
        document.getElementById(listId).innerHTML = '<p>No active bookings.</p>';
    }
}
