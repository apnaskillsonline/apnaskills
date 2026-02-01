// ==================== FIREBASE INITIALIZATION ====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

// Firefly Animation
function createFireflies() {
    const fireflyCount = 20;
    for (let i = 0; i < fireflyCount; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';

        // Random starting position
        const top = Math.random() * window.innerHeight;
        const left = Math.random() * window.innerWidth;

        // Random size
        const size = Math.random() * 10 + 5;

        // Random animation duration/delay
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

// Call on load
window.addEventListener('load', createFireflies);

import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getDatabase, ref, set, get, push, update, onValue } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBj8NFx3wd1PFXR37X4JcE9j4N9pJGnZ8A",
    authDomain: "apnaskills-ef242.firebaseapp.com",
    databaseURL: "https://apnaskills-ef242-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "apnaskills-ef242",
    storageBucket: "apnaskills-ef242.firebasestorage.app",
    messagingSenderId: "120699280754",
    appId: "1:120699280754:web:1aff20056bf990f67c11eb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

// ==================== GLOBAL STATE ====================
let currentUser = null;
let currentUserData = null;
let allInstructors = [];
let filteredInstructors = [];
let isSearchActive = false;

// Indian Cities
const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad', 'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh', 'Tiruppur', 'Moradabad', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Warangal', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Sangli-Miraj', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur'];

// Specializations
const specializations = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Computer Science', 'Programming', 'Web Development', 'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Python', 'Java', 'JavaScript', 'C++', 'Science', 'Social Studies', 'History', 'Geography', 'Economics', 'Commerce', 'Accountancy', 'Business Studies', 'Statistics', 'Music', 'Vocal Music', 'Guitar', 'Piano', 'Keyboard', 'Drums', 'Classical Music', 'Dance', 'Classical Dance', 'Kathak', 'Bharatanatyam', 'Contemporary Dance', 'Hip Hop', 'Art', 'Drawing', 'Painting', 'Sketching', 'Craft', 'French', 'German', 'Spanish', 'Japanese', 'Korean', 'Foreign Languages', 'English Spoken', 'IELTS', 'TOEFL', 'Personality Development', 'Public Speaking', 'Communication Skills', 'Yoga', 'Fitness', 'Meditation', 'Chess', 'Coding', 'Robotics', 'Electronics', 'Photography', 'Video Editing', 'Graphic Design', 'Digital Marketing', 'Content Writing', 'Creative Writing'];

// ==================== AUTHENTICATION ====================
document.getElementById('googleLoginBtn').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;

        const userRef = ref(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            await set(userRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                isInstructor: false,
                createdAt: Date.now()
            });

            const notifRef = push(ref(database, `notifications/${currentUser.uid}`));
            await set(notifRef, {
                type: 'welcome',
                message: 'Welcome to ApnaSkills! Start exploring instructors and book your first session.',
                timestamp: Date.now(),
                read: false
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Failed to login. Please try again.');
    }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        currentUserData = snapshot.val();

        document.getElementById('loginPage').classList.add('hidden');

        if (currentUserData.isInstructor) {
            // ✅ SOLUTION: Show student app (home page) instead of instructor app
            document.getElementById('studentApp').classList.remove('hidden');
            document.getElementById('studentUserNameMenu').textContent = user.displayName;
            document.getElementById('studentUserAvatarMenu').src = user.photoURL;
            
            // Load student features so instructor can see home page
            await loadInstructors();
            await loadCategories();
            await loadStudentNotifications();
            setupStudentNotificationListener();
            
            // Also add "Switch to Dashboard" button in menu
            addDashboardSwitchButton();
        } else {
            // Show student interface
            document.getElementById('studentApp').classList.remove('hidden');
            document.getElementById('studentUserNameMenu').textContent = user.displayName;
            document.getElementById('studentUserAvatarMenu').src = user.photoURL;
            await loadInstructors();
            await loadCategories();
            await loadStudentNotifications();
            setupStudentNotificationListener();
        }

        setTimeout(() => checkPendingRatings(), 2000);
    } else {
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('studentApp').classList.add('hidden');
        document.getElementById('instructorApp').classList.add('hidden');
    }
});

document.getElementById('studentLogoutBtn').addEventListener('click', () => signOut(auth));
document.getElementById('instructorLogoutBtn').addEventListener('click', () => signOut(auth));

// ==================== MENU LOGIC ====================
function setupMenu(btnId, menuId) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);

    if (btn && menu) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other menus first
            document.querySelectorAll('.dropdown-menu.active').forEach(m => {
                if (m.id !== menuId) m.classList.remove('active');
            });
            menu.classList.toggle('active');
        });
    }
}

setupMenu('studentMenuBtn', 'studentDropdown');
setupMenu('instructorMenuBtn', 'instructorDropdown');

// Close menus when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-container')) {
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});

// Close menu when clicking an item
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
            menu.classList.remove('active');
        });
    });
});


// ==================== STUDENT NAVIGATION ====================
document.querySelectorAll('#studentApp .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        document.querySelectorAll('#studentApp .nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('#studentApp .page-content').forEach(p => p.classList.add('hidden'));

        if (page === 'home') {
            document.getElementById('studentHomePage').classList.remove('hidden');
        } else if (page === 'bookings') {
            document.getElementById('studentBookingsPage').classList.remove('hidden');
            loadStudentBookings();
        } else if (page === 'notifications') {
            document.getElementById('studentNotificationsPage').classList.remove('hidden');
            markStudentNotificationsAsRead();
        }
    });
});

// ==================== INSTRUCTOR NAVIGATION ====================
document.querySelectorAll('#instructorApp .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        document.querySelectorAll('#instructorApp .nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('#instructorApp .page-content').forEach(p => p.classList.add('hidden'));

        if (page === 'instructor-home') {
            document.getElementById('instructorHomePage').classList.remove('hidden');
            loadInstructorDashboard();
        } else if (page === 'instructor-bookings') {
            document.getElementById('instructorBookingsPage').classList.remove('hidden');
            loadInstructorBookings();
        } else if (page === 'instructor-profile') {
            document.getElementById('instructorProfilePage').classList.remove('hidden');
            loadInstructorProfile();
        } else if (page === 'instructor-notifications') {
            document.getElementById('instructorNotificationsPage').classList.remove('hidden');
            markInstructorNotificationsAsRead();
        }
    });
});

console.log('ApnaSkills Platform Loaded Successfully!');
// ==================== PART 2: STUDENT FEATURES ====================
// NOTE: This should be appended to Part 1

// ==================== LOAD CATEGORIES ====================
async function loadCategories() {
    const instructorsRef = ref(database, 'instructors');
    const snapshot = await get(instructorsRef);

    const categoryCounts = {};

    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            const instructor = childSnapshot.val();
            const spec = instructor.specialization;
            categoryCounts[spec] = (categoryCounts[spec] || 0) + 1;
        });
    }

    const grid = document.getElementById('categoriesGrid');
    const categories = Object.keys(categoryCounts).slice(0, 12);

    if (categories.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Categories will appear here once instructors register</p>';
        return;
    }

    grid.innerHTML = categories.map(cat => `
        <div class="category-card" onclick="filterByCategory('${cat}')">
            <div class="category-icon">📚</div>
            <div class="category-name">${cat}</div>
            <div class="category-count">${categoryCounts[cat]} instructor${categoryCounts[cat] > 1 ? 's' : ''}</div>
        </div>
    `).join('');
}

window.filterByCategory = function (category) {
    document.getElementById('studentSpecializationInput').value = category;
    document.getElementById('studentSearchForm').dispatchEvent(new Event('submit'));
}

// ==================== LOAD INSTRUCTORS ====================
let allLandmarks = []; // Store unique landmarks

async function loadInstructors() {
    const instructorsRef = ref(database, 'instructors');
    const snapshot = await get(instructorsRef);

    if (snapshot.exists()) {
        allInstructors = [];
        const landmarkSet = new Set();

        snapshot.forEach(childSnapshot => {
            const instructor = childSnapshot.val();
            instructor.id = childSnapshot.key;

            // Don't show current user if they're an instructor
            if (instructor.userId === currentUser.uid) return;

            if (instructor.ratings) {
                const ratings = Object.values(instructor.ratings);
                const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
                instructor.avgRating = (sum / ratings.length).toFixed(1);
                instructor.totalRatings = ratings.length;
            } else {
                instructor.avgRating = 0;
                instructor.totalRatings = 0;
            }

            if (instructor.landmark) {
                landmarkSet.add(instructor.landmark);
            }

            allInstructors.push(instructor);
        });

        // Sort by Rating (Desc), then Total Ratings (Desc)
        allInstructors.sort((a, b) => {
            if (parseFloat(b.avgRating) !== parseFloat(a.avgRating)) {
                return parseFloat(b.avgRating) - parseFloat(a.avgRating);
            }
            return b.totalRatings - a.totalRatings;
        });

        allLandmarks = Array.from(landmarkSet);

        // Initially show only Top Rated (e.g., Top 8)
        const featuredInstructors = allInstructors.slice(0, 8);
        displayInstructors(featuredInstructors);
    } else {
        document.getElementById('studentInstructorsGrid').innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎓</div><p>No instructors available yet. Be the first to register!</p></div>';
    }
}

function displayInstructors(instructors) {
    const grid = document.getElementById('studentInstructorsGrid');

    // Sort passed instructors just in case (e.g. search results)
    instructors.sort((a, b) => {
        if (parseFloat(b.avgRating) !== parseFloat(a.avgRating)) {
            return parseFloat(b.avgRating) - parseFloat(a.avgRating);
        }
        return b.totalRatings - a.totalRatings;
    });

    if (instructors.length === 0) {
        if (isSearchActive) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No instructors found matching your search criteria. Try different keywords or <button class="btn btn-primary" onclick="document.getElementById(\'studentClearSearchBtn\').click()">clear search</button></p></div>';
        } else {
            grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎓</div><p>No featured instructors available right now.</p></div>';
        }
        return;
    }
    // ... rest of function remains same (map/join is below this block in file)

    grid.innerHTML = instructors.map(instructor => {
        // Display multiple specializations
        const specializationsDisplay = Array.isArray(instructor.specializations)
            ? instructor.specializations.join(', ')
            : instructor.specialization;

        return `
        <div class="tutor-card" onclick="viewInstructorDetails('${instructor.id}')">
            <div class="tutor-header">
                <img src="${instructor.photoURL || 'https://via.placeholder.com/80'}" alt="${instructor.name}" class="tutor-avatar" onerror="this.src='https://via.placeholder.com/80?text=Avatar'">
                <div class="tutor-info">
                    <h3>${instructor.name}</h3>
                    <div class="tutor-specialization">${specializationsDisplay}</div>
                    <div class="tutor-rating">⭐ ${instructor.avgRating}</div>
                </div>
            </div>
            <div class="tutor-details">
                <div class="tutor-detail-item">
                    <span class="tutor-detail-label">Experience</span>
                    <span class="tutor-detail-value">${instructor.experience} years</span>
                </div>
                <div class="tutor-detail-item">
                    <span class="tutor-detail-label">Location</span>
                    <span class="tutor-detail-value">${instructor.location}</span>
                </div>
                ${instructor.landmark ? `
                <div class="tutor-detail-item">
                    <span class="tutor-detail-label">Near</span>
                    <span class="tutor-detail-value" style="color: var(--primary);">📍 ${instructor.landmark}</span>
                </div>
                ` : ''}
            </div>
            <div class="tutor-price">₹${instructor.hourlyRate}/hour</div>
            <button class="btn btn-primary" style="width: 100%;" onclick="event.stopPropagation(); showBookingModal('${instructor.id}')">Book Now</button>
        </div>
    `;
    }).join('');
}

// ==================== SEARCH FUNCTIONALITY ====================
const locationInput = document.getElementById('studentLocationInput');
const locationSuggestions = document.getElementById('studentLocationSuggestions');
const specializationInput = document.getElementById('studentSpecializationInput');
const specializationSuggestions = document.getElementById('studentSpecializationSuggestions');

// Debounce Utility
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

locationInput.addEventListener('input', debounce((e) => {
    const value = e.target.value.toLowerCase().trim();
    if (value.length === 0) {
        locationSuggestions.classList.add('hidden');
        return;
    }

    const cityMatches = indianCities.filter(city => city.toLowerCase().includes(value));
    const landmarkMatches = allLandmarks.filter(lm => lm.toLowerCase().includes(value));

    let suggestionsHTML = '';

    if (cityMatches.length > 0) {
        suggestionsHTML += `<div style="padding: 8px 16px; font-size: 11px; font-weight: 700; color: var(--text-light); background: var(--bg-tertiary); letter-spacing: 0.5px;">CITIES</div>`;
        suggestionsHTML += cityMatches.slice(0, 5).map(city =>
            `<div class="suggestion-item" data-value="${city}">🏙️ ${city}</div>`
        ).join('');
    }

    if (landmarkMatches.length > 0) {
        suggestionsHTML += `<div style="padding: 8px 16px; font-size: 11px; font-weight: 700; color: var(--text-light); background: var(--bg-tertiary); letter-spacing: 0.5px;">LANDMARKS</div>`;
        suggestionsHTML += landmarkMatches.slice(0, 5).map(lm =>
            `<div class="suggestion-item" data-value="${lm}">📍 ${lm}</div>`
        ).join('');
    }

    // Always offer the custom search term
    suggestionsHTML += `<div class="suggestion-item custom-option" data-value="${e.target.value}">🔍 Search for "${e.target.value}"</div>`;

    locationSuggestions.innerHTML = suggestionsHTML;
    locationSuggestions.classList.remove('hidden');

    document.querySelectorAll('#studentLocationSuggestions .suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            // Remove icon if present for the value
            let cleanValue = item.dataset.value;
            locationInput.value = cleanValue;
            locationSuggestions.classList.add('hidden');
        });
    });
}, 300));

specializationInput.addEventListener('input', debounce((e) => {
    const value = e.target.value.toLowerCase().trim();
    if (value.length === 0) {
        specializationSuggestions.classList.add('hidden');
        return;
    }

    const matches = specializations.filter(spec => spec.toLowerCase().includes(value));

    let suggestionsHTML = '';

    if (matches.length > 0) {
        suggestionsHTML = matches.slice(0, 10).map(spec =>
            `<div class="suggestion-item" data-value="${spec}">${spec}</div>`
        ).join('');
    }

    suggestionsHTML += `<div class="suggestion-item custom-option" data-value="${e.target.value}">🔍 Search for "${e.target.value}"</div>`;

    specializationSuggestions.innerHTML = suggestionsHTML;
    specializationSuggestions.classList.remove('hidden');

    document.querySelectorAll('#studentSpecializationSuggestions .suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            specializationInput.value = item.dataset.value;
            specializationSuggestions.classList.add('hidden');
        });
    });
}, 300));

document.addEventListener('click', (e) => {
    if (!e.target.closest('.input-group')) {
        locationSuggestions.classList.add('hidden');
        specializationSuggestions.classList.add('hidden');
    }
});

document.getElementById('studentSearchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    try {
        const locationInputVal = document.getElementById('studentLocationInput').value;
        const specializationInputVal = document.getElementById('studentSpecializationInput').value;

        const location = locationInputVal ? locationInputVal.toLowerCase().trim() : '';
        const specialization = specializationInputVal ? specializationInputVal.toLowerCase().trim() : '';

        if (!location && !specialization) {
            alert('Please enter location or specialization to search');
            return;
        }

        isSearchActive = true;

        // 1. First, strictly filter by SPECIALIZATION if provided
        let candidates = allInstructors;
        if (specialization) {
            candidates = allInstructors.filter(instructor => {
                const spec = instructor.specialization ? instructor.specialization.toLowerCase() : '';
                const name = instructor.name ? instructor.name.toLowerCase() : '';
                const specs = Array.isArray(instructor.specializations) ? instructor.specializations : [];

                return spec.includes(specialization) ||
                    name.includes(specialization) ||
                    specs.some(s => s.toLowerCase().includes(specialization));
            });
        }

        // 2. If NO Location provided, just show the specialization matches sorted by rating
        if (!location) {
            candidates.sort((a, b) => parseFloat(b.avgRating || 0) - parseFloat(a.avgRating || 0));
            filteredInstructors = candidates;
        } else {
            // 3. Address/City Detection logic
            let detectedCity = null;
            if (typeof indianCities !== 'undefined') {
                const foundCity = indianCities.find(city => location.includes(city.toLowerCase()));
                if (foundCity) {
                    detectedCity = foundCity.toLowerCase();
                }
            }

            // 4. Score and Filter by LOCATION
            const scoredCandidates = candidates.map(instructor => {
                let score = 0;
                const instLandmark = instructor.landmark ? instructor.landmark.toLowerCase() : '';
                const instLocation = instructor.location ? instructor.location.toLowerCase() : '';

                // PRIORITY 1: Landmark Match (Highest Priority)
                if (instLandmark && instLandmark.includes(location)) {
                    score += 1000;
                }

                // PRIORITY 2: City Match (Medium Priority)
                if (instLocation.includes(location) || (detectedCity && instLocation.includes(detectedCity))) {
                    score += 500;
                }

                // PRIORITY 3: General loose match
                if (score === 0 && (instLocation.includes(location) || location.includes(instLocation))) {
                    score += 100;
                }

                return { instructor, score };
            });

            // Filter out those with 0 score (no location match)
            // Sort by Score DESC, then Rating DESC
            filteredInstructors = scoredCandidates
                .filter(item => item.score > 0)
                .sort((a, b) => {
                    if (a.score !== b.score) return b.score - a.score;
                    return parseFloat(b.instructor.avgRating || 0) - parseFloat(a.instructor.avgRating || 0);
                })
                .map(item => item.instructor);
        }

        // Update Section Title
        const titleEl = document.querySelector('.tutors-section .section-title');
        if (titleEl) titleEl.textContent = `Search Results (${filteredInstructors.length})`;

        displayInstructors(filteredInstructors);

        // Hide suggestions
        locationSuggestions.classList.add('hidden');
        specializationSuggestions.classList.add('hidden');

        // Auto-Scroll to results
        setTimeout(() => {
            const tutorsSection = document.querySelector('.tutors-section');
            if (tutorsSection) {
                tutorsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);

    } catch (error) {
        console.error('Search failed:', error);
        alert('An error occurred during search. Please reload and try again.');
    }
});

document.getElementById('studentClearSearchBtn').addEventListener('click', () => {
    locationInput.value = '';
    specializationInput.value = '';
    isSearchActive = false;
    // Reset to "Featured" (Top Rated) view
    const featuredInstructors = allInstructors.slice(0, 8);
    displayInstructors(featuredInstructors);

    locationSuggestions.classList.add('hidden');
    specializationSuggestions.classList.add('hidden');
});

// ==================== INSTRUCTOR DETAILS ====================
window.viewInstructorDetails = async function (instructorId) {
    const instructor = allInstructors.find(t => t.id === instructorId);
    if (!instructor) return;

    // Display specializations
    const specializationsDisplay = Array.isArray(instructor.specializations)
        ? instructor.specializations.join(', ')
        : instructor.specialization;

    const modalHTML = `
        <div class="modal" id="instructorDetailsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Instructor Details</h2>
                    <button class="modal-close" onclick="closeModal('instructorDetailsModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: flex; gap: 24px; margin-bottom: 24px;">
                        <img src="${instructor.photoURL || 'https://via.placeholder.com/120'}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary);" onerror="this.src='https://via.placeholder.com/120?text=Avatar'">
                        <div style="flex: 1;">
                            <h2 style="margin-bottom: 8px;">${instructor.name}</h2>
                            <p style="color: var(--primary); font-weight: 600; margin-bottom: 8px;">${specializationsDisplay}</p>
                            <div style="color: var(--warning); margin-bottom: 8px; font-size: 24px;">⭐ ${instructor.avgRating}</div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">₹${instructor.hourlyRate}/hour</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin-bottom: 12px;">About</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div><strong>Experience:</strong> ${instructor.experience} years</div>
                            <div><strong>Location:</strong> ${instructor.location}</div>
                            ${instructor.landmark ? `<div style="grid-column: 1 / -1; color: var(--primary);"><strong>📍 Landmark:</strong> ${instructor.landmark}</div>` : ''}
                            <div style="grid-column: 1 / -1;"><strong>Email:</strong> ${instructor.email}</div>
                        </div>
                    </div>
                    ${instructor.certifications ? `
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin-bottom: 12px;">Certifications</h3>
                        <p style="color: var(--text-secondary);">${instructor.certifications}</p>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('instructorDetailsModal')">Close</button>
                    <button class="btn btn-primary" onclick="closeModal('instructorDetailsModal'); showBookingModal('${instructorId}')">Book Session</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Continued in Part 3...
// ==================== PART 3: BOOKING & INSTRUCTOR FEATURES ====================
// NOTE: This should be appended after Part 2

// ==================== BOOKING MODAL ====================
window.showBookingModal = async function (instructorId) {
    const instructor = allInstructors.find(t => t.id === instructorId);
    if (!instructor) return;

    // Check if student has mobile number
    const userRef = ref(database, `users/${currentUser.uid}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    const today = new Date().toISOString().split('T')[0];

    const modalHTML = `
        <div class="modal" id="bookingModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title text-gradient-blue-green">Book Session with ${instructor.name}</h2>
                    <button class="modal-close" onclick="closeModal('bookingModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="bookingForm">
                        ${!userData.mobile ? `
                        <div class="form-group">
                            <label>Your Mobile Number *</label>
                            <input type="tel" id="studentMobile" required placeholder="+91 XXXXXXXXXX" pattern="[+0-9]{10,15}">
                            <small style="color: var(--text-secondary display: block; margin-top: 4px;">Required to share with instructor after booking confirmation</small>
                        </div>
                        ` : ''}
                        <div class="form-group">
                            <label>Session Requirements*</label>
                            <input type="text" id="subjectClass" required placeholder="e.g., Class, Subjects, Yoga, Music, Dance, Art and Craft, Programming">
                            <small style="color: var(--text-secondary); display: block; margin-top: 4px;">Specify the subject and class level you need help with</small>
                        </div>
                        <div class="form-group">
                            <label>Your Address *</label>
                            <input type="text" id="bookingAddress" required placeholder="Enter your full address">
                        </div>
                        <div class="form-group">
                            <label>Preferred Date *</label>
                            <input type="date" id="bookingDate" required min="${today}">
                        </div>
                        <div class="form-group">
                            <label>Preferred Time *</label>
                            <input type="time" id="bookingTime" required>
                        </div>
                        <div class="form-group">
                            <label>Session Duration (hours) *</label>
                            <input type="number" id="bookingHours" min="1" max="8" value="1" required>
                        </div>
                        <div class="form-group">
                            <label>Additional Details</label>
                            <textarea id="bookingDescription" placeholder="Any specific topics or requirements..."></textarea>
                        </div>
                        <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-top: 16px;">
                            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 600;">
                                <span>Estimated Cost:</span>
                                <span style="color: var(--primary);">₹<span id="estimatedCost">${instructor.hourlyRate}</span></span>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('bookingModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="submitBooking('${instructorId}', ${!userData.mobile})">Confirm Booking</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('bookingHours').addEventListener('input', (e) => {
        const hours = parseInt(e.target.value) || 1;
        document.getElementById('estimatedCost').textContent = hours * instructor.hourlyRate;
    });
}

window.submitBooking = async function (instructorId, needsMobile) {
    const instructor = allInstructors.find(t => t.id === instructorId);

    let studentMobile = null;
    if (needsMobile) {
        studentMobile = document.getElementById('studentMobile').value.trim();
        if (!studentMobile) {
            alert('Please enter your mobile number');
            return;
        }
    } else {
        const userRef = ref(database, `users/${currentUser.uid}`);
        const userSnapshot = await get(userRef);
        studentMobile = userSnapshot.val().mobile;
    }

    const subjectClass = document.getElementById('subjectClass').value.trim();
    const address = document.getElementById('bookingAddress').value.trim();
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const hours = parseInt(document.getElementById('bookingHours').value);
    const description = document.getElementById('bookingDescription').value.trim();

    if (!subjectClass || !address || !date || !time || !hours) {
        alert('Please fill all required fields');
        return;
    }

    try {
        // Save mobile if new
        if (needsMobile) {
            await update(ref(database, `users/${currentUser.uid}`), {
                mobile: studentMobile
            });
        }

        const bookingRef = push(ref(database, 'bookings'));
        await set(bookingRef, {
            studentId: currentUser.uid,
            studentName: currentUser.displayName,
            studentEmail: currentUser.email,
            studentMobile: studentMobile,
            instructorId: instructorId,
            instructorName: instructor.name,
            subjectClass: subjectClass,
            address: address,
            date: date,
            time: time,
            hours: hours,
            description: description,
            totalCost: hours * instructor.hourlyRate,
            status: 'pending',
            createdAt: Date.now()
        });

        // Get instructor specializations
        const specializationsDisplay = Array.isArray(instructor.specializations)
            ? instructor.specializations.join(', ')
            : instructor.specialization;

        const instructorNotifRef = push(ref(database, `notifications/${instructorId}`));
        await set(instructorNotifRef, {
            type: 'new_booking',
            bookingId: bookingRef.key,
            message: `New booking from ${currentUser.displayName}
Subject: ${subjectClass}
Contact: ${studentMobile}
Date: ${date} at ${time}
${description ? 'Details: ' + description : ''}`,
            timestamp: Date.now(),
            read: false
        });

        const studentNotifRef = push(ref(database, `notifications/${currentUser.uid}`));
        await set(studentNotifRef, {
            type: 'booking_sent',
            bookingId: bookingRef.key,
            message: `Booking request sent to ${instructor.name} (${specializationsDisplay}). Waiting for confirmation.`,
            timestamp: Date.now(),
            read: false
        });

        closeModal('bookingModal');
        alert('Booking request sent successfully! The instructor will respond soon.');
        document.querySelector('[data-page="bookings"]').click();
    } catch (error) {
        console.error('Booking error:', error);
        alert('Failed to create booking. Please try again.');
    }
}

// ==================== BECOME INSTRUCTOR ====================
// ==================== BECOME INSTRUCTOR ====================
document.querySelectorAll('.become-instructor-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const specializationOptions = specializations.map(spec =>
            `<option value="${spec}">${spec}</option>`
        ).join('');

        const cityOptions = indianCities.map(city =>
            `<option value="${city}">${city}</option>`
        ).join('');

        const modalHTML = `
        <div class="modal" id="becomeInstructorModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Register as an Instructor</h2>
                    <button class="modal-close" onclick="closeModal('becomeInstructorModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="instructorRegistrationForm">
                        <div class="form-group">
                            <label>Full Name *</label>
                            <input type="text" id="instructorName" value="${currentUser.displayName}" required>
                        </div>
                        <div class="form-group">
                            <label>Specializations (You can teach) *</label>
                            <div id="specializationsContainer" style="max-height: 200px; overflow-y: auto; border: 2px solid var(--border); border-radius: var(--radius); padding: 12px;">
                                ${specializations.map(spec => `
                                    <label style="display: block; margin-bottom: 8px; cursor: pointer;">
                                        <input type="checkbox" class="spec-checkbox" value="${spec}" style="margin-right: 8px;">
                                        ${spec}
                                    </label>
                                `).join('')}
                            </div>
                            <small style="color: var(--text-secondary); display: block; margin-top: 8px;">Select all subjects you can teach</small>
                            <input type="text" id="customSpecialization" placeholder="Add custom specialization" style="margin-top: 8px; padding: 8px; border: 1px solid var(--border); border-radius: 4px; width: 100%;">
                            <button type="button" class="btn btn-secondary" onclick="addCustomSpec()" style="margin-top: 8px;">Add Custom</button>
                        </div>
                        <div class="form-group">
                            <label>Location (City) *</label>
                            <input type="text" id="instructorLocation" placeholder="Select from list or type your own" autocomplete="off" required list="cityList">
                            <datalist id="cityList">${cityOptions}</datalist>
                        </div>
                        <div class="form-group">
                            <label>Nearest Landmark *</label>
                            <input type="text" id="instructorLandmark" placeholder="e.g., Near Central Mall, Opposite Railway Station" required>
                            <small style="color: var(--text-secondary); display: block; margin-top: 4px;">Helps students find you easily</small>
                        </div>
                        <div class="form-group">
                            <label>Mobile Number *</label>
                            <input type="tel" id="instructorMobile" required placeholder="+91 XXXXXXXXXX" pattern="[+0-9]{10,15}">
                        </div>
                        <div class="form-group">
                            <label>Age *</label>
                            <input type="number" id="instructorAge" min="18" max="100" required>
                        </div>
                        <div class="form-group">
                            <label>Experience (years) *</label>
                            <input type="number" id="instructorExperience" min="0" max="50" required>
                        </div>
                        <div class="form-group">
                            <label>Hourly Rate (₹) *</label>
                            <input type="number" id="instructorRate" min="100" max="10000" required placeholder="e.g., 500">
                        </div>
                        <div class="form-group">
                            <label>Certifications</label>
                            <textarea id="instructorCertifications" placeholder="List your certifications, degrees, and qualifications..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('becomeInstructorModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="submitInstructorRegistration()">Register</button>
                </div>
            </div>
        </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    });
});

window.addCustomSpec = function () {
    const customInput = document.getElementById('customSpecialization');
    const customValue = customInput.value.trim();

    if (!customValue) {
        alert('Please enter a specialization');
        return;
    }

    const container = document.getElementById('specializationsContainer');
    const newCheckbox = document.createElement('label');
    newCheckbox.style.display = 'block';
    newCheckbox.style.marginBottom = '8px';
    newCheckbox.style.cursor = 'pointer';
    newCheckbox.style.background = 'var(--bg-secondary)';
    newCheckbox.style.padding = '4px 8px';
    newCheckbox.style.borderRadius = '4px';
    newCheckbox.innerHTML = `
        <input type="checkbox" class="spec-checkbox" value="${customValue}" style="margin-right: 8px;" checked>
        ${customValue} (Custom)
    `;

    container.appendChild(newCheckbox);
    customInput.value = '';
}

window.submitInstructorRegistration = async function () {
    const name = document.getElementById('instructorName').value.trim();
    const location = document.getElementById('instructorLocation').value.trim();
    const landmark = document.getElementById('instructorLandmark').value.trim();
    const mobile = document.getElementById('instructorMobile').value.trim();
    const age = document.getElementById('instructorAge').value;
    const experience = document.getElementById('instructorExperience').value;
    const hourlyRate = document.getElementById('instructorRate').value;
    const certifications = document.getElementById('instructorCertifications').value.trim();

    // Get selected specializations
    const selectedSpecs = Array.from(document.querySelectorAll('.spec-checkbox:checked'))
        .map(cb => cb.value);

    if (selectedSpecs.length === 0) {
        alert('Please select at least one specialization');
        return;
    }

    if (!name || !location || !landmark || !mobile || !age || !experience || !hourlyRate) {
        alert('Please fill all required fields');
        return;
    }

    try {
        const instructorRef = ref(database, `instructors/${currentUser.uid}`);
        await set(instructorRef, {
            userId: currentUser.uid,
            name: name,
            specializations: selectedSpecs,
            specialization: selectedSpecs.join(', '), // For backward compatibility
            location: location,
            landmark: landmark,
            mobile: mobile,
            age: parseInt(age),
            experience: parseInt(experience),
            hourlyRate: parseInt(hourlyRate),
            certifications: certifications,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            createdAt: Date.now()
        });

        await update(ref(database, `users/${currentUser.uid}`), {
            isInstructor: true
        });

        closeModal('becomeInstructorModal');
        alert('Congratulations! You are now registered as an instructor. Please logout and login again to access your instructor dashboard.');
        signOut(auth);
    } catch (error) {
        console.error('Registration error:', error);
        alert('Failed to register. Please try again.');
    }
}

// ==================== INSTRUCTOR DASHBOARD ====================
async function loadInstructorDashboard() {
    const instructorRef = ref(database, `instructors/${currentUser.uid}`);
    const snapshot = await get(instructorRef);
    const instructorData = snapshot.val();

    let avgRating = 0;
    let totalRatings = 0;

    if (instructorData.ratings) {
        const ratings = Object.values(instructorData.ratings);
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        avgRating = (sum / ratings.length).toFixed(1);
        totalRatings = ratings.length;
    }

    const bookingsRef = ref(database, 'bookings');
    const bookingsSnapshot = await get(bookingsRef);
    let totalEarnings = 0;
    let completedSessions = 0;

    if (bookingsSnapshot.exists()) {
        bookingsSnapshot.forEach(childSnapshot => {
            const booking = childSnapshot.val();
            if (booking.instructorId === currentUser.uid && booking.status === 'completed') {
                totalEarnings += booking.totalCost;
                completedSessions++;
            }
        });
    }

    // Display specializations
    const specializationsDisplay = Array.isArray(instructorData.specializations)
        ? instructorData.specializations.join(', ')
        : instructorData.specialization;

    const dashboard = document.getElementById('instructorDashboard');
    dashboard.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 32px;">
            <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 32px; border-radius: var(--radius); box-shadow: var(--shadow-lg);">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Total Earnings</div>
                <div style="font-size: 36px; font-weight: 700;">₹${totalEarnings}</div>
            </div>
            <div style="background: linear-gradient(135deg, var(--success), #059669); color: white; padding: 32px; border-radius: var(--radius); box-shadow: var(--shadow-lg);">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Completed Sessions</div>
                <div style="font-size: 36px; font-weight: 700;">${completedSessions}</div>
            </div>
            <div style="background: linear-gradient(135deg, var(--warning), #d97706); color: white; padding: 32px; border-radius: var(--radius); box-shadow: var(--shadow-lg);">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Average Rating</div>
                <div style="font-size: 36px; font-weight: 700;">⭐ ${avgRating}</div>
            </div>
        </div>
        <div style="background: white; padding: 32px; border-radius: var(--radius); box-shadow: var(--shadow);">
            <h3 style="margin-bottom: 20px;">Your Profile Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div style="grid-column: 1 / -1;"><strong>Specializations:</strong> ${specializationsDisplay}</div>
                <div><strong>Location:</strong> ${instructorData.location}</div>
                <div><strong>Landmark:</strong> ${instructorData.landmark || 'Not set'}</div>
                <div><strong>Experience:</strong> ${instructorData.experience} years</div>
                <div><strong>Hourly Rate:</strong> ₹${instructorData.hourlyRate}/hour</div>
            </div>
        </div>
    `;
}

// ==================== PART 4: BOOKINGS, NOTIFICATIONS & UTILITIES ====================
// NOTE: This should be appended after Part 3

// ==================== INSTRUCTOR PROFILE ====================
async function loadInstructorProfile() {
    const instructorRef = ref(database, `instructors/${currentUser.uid}`);
    const snapshot = await get(instructorRef);
    const instructorData = snapshot.val();

    let avgRating = 0;
    let totalRatings = 0;

    if (instructorData.ratings) {
        const ratings = Object.values(instructorData.ratings);
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        avgRating = (sum / ratings.length).toFixed(1);
        totalRatings = ratings.length;
    }

    // Display specializations
    const specializationsDisplay = Array.isArray(instructorData.specializations)
        ? instructorData.specializations.join(', ')
        : instructorData.specialization;

    const content = document.getElementById('instructorProfileContent');
    content.innerHTML = `
        <div style="background: var(--bg-secondary); padding: 32px; border-radius: var(--radius); margin-bottom: 24px;">
            <div style="display: flex; gap: 24px; margin-bottom: 24px;">
                <img src="${currentUser.photoURL}" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--primary);">
                <div>
                    <h2>${instructorData.name}</h2>
                    <p style="color: var(--primary); font-weight: 600; margin: 8px 0;">${specializationsDisplay}</p>
                    <div style="color: var(--warning); font-size: 24px;">⭐ ${avgRating}</div>
                </div>
            </div>
            <button class="btn btn-primary" onclick="editInstructorProfile()">Edit Profile</button>
        </div>
        <div style="background: white; padding: 32px; border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 24px;">
            <h3 style="margin-bottom: 20px;">Profile Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="grid-column: 1 / -1;"><strong>Specializations:</strong><br>${specializationsDisplay}</div>
                <div><strong>Location:</strong><br>${instructorData.location}</div>
                <div><strong>Landmark:</strong><br>${instructorData.landmark || 'Not specified'}</div>
                <div><strong>Experience:</strong><br>${instructorData.experience} years</div>
                <div><strong>Hourly Rate:</strong><br>₹${instructorData.hourlyRate}/hour</div>
                <div><strong>Mobile:</strong><br>${instructorData.mobile}</div>
            </div>
            ${instructorData.certifications ? `<div style="margin-top: 20px;"><strong>Certifications:</strong><br><p style="color: var(--text-secondary); margin-top: 8px;">${instructorData.certifications}</p></div>` : ''}
        </div>
    `;
}

window.editInstructorProfile = async function () {
    const instructorRef = ref(database, `instructors/${currentUser.uid}`);
    const snapshot = await get(instructorRef);
    const instructorData = snapshot.val();

    const specializationOptions = specializations.map(spec =>
        `<option value="${spec}" ${spec === instructorData.specialization ? 'selected' : ''}>${spec}</option>`
    ).join('');

    const cityOptions = indianCities.map(city =>
        `<option value="${city}" ${city === instructorData.location ? 'selected' : ''}>${city}</option>`
    ).join('');

    const modalHTML = `
        <div class="modal" id="editProfileModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Edit Profile</h2>
                    <button class="modal-close" onclick="closeModal('editProfileModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editProfileForm">
                        <div class="form-group">
                            <label>Specialization *</label>
                            <input type="text" id="editSpecialization" value="${instructorData.specialization}" required list="editSpecList">
                            <datalist id="editSpecList">${specializationOptions}</datalist>
                        </div>
                        <div class="form-group">
                            <label>Location *</label>
                            <input type="text" id="editLocation" value="${instructorData.location}" required list="editCityList">
                            <datalist id="editCityList">${cityOptions}</datalist>
                        </div>
                        <div class="form-group">
                            <label>Nearest Landmark *</label>
                            <input type="text" id="editLandmark" value="${instructorData.landmark || ''}" placeholder="e.g., Near Central Mall">
                        </div>
                        <div class="form-group">
                            <label>Mobile *</label>
                            <input type="tel" id="editMobile" value="${instructorData.mobile}" required>
                        </div>
                        <div class="form-group">
                            <label>Experience (years) *</label>
                            <input type="number" id="editExperience" value="${instructorData.experience}" required>
                        </div>
                        <div class="form-group">
                            <label>Hourly Rate (₹) *</label>
                            <input type="number" id="editRate" value="${instructorData.hourlyRate}" required>
                        </div>
                        <div class="form-group">
                            <label>Certifications</label>
                            <textarea id="editCertifications">${instructorData.certifications || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('editProfileModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="saveInstructorProfile()">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.saveInstructorProfile = async function () {
    const specialization = document.getElementById('editSpecialization').value;
    const location = document.getElementById('editLocation').value;
    const landmark = document.getElementById('editLandmark').value;
    const mobile = document.getElementById('editMobile').value;
    const experience = document.getElementById('editExperience').value;
    const hourlyRate = document.getElementById('editRate').value;
    const certifications = document.getElementById('editCertifications').value;

    try {
        await update(ref(database, `instructors/${currentUser.uid}`), {
            specialization: specialization,
            location: location,
            landmark: landmark,
            mobile: mobile,
            experience: parseInt(experience),
            hourlyRate: parseInt(hourlyRate),
            certifications: certifications
        });

        closeModal('editProfileModal');
        alert('Profile updated successfully!');
        loadInstructorProfile();
    } catch (error) {
        console.error('Update error:', error);
        alert('Failed to update profile.');
    }
}

// ==================== STUDENT BOOKINGS ====================
async function loadStudentBookings() {
    const bookingsRef = ref(database, 'bookings');
    const snapshot = await get(bookingsRef);

    const currentBookings = [];
    const pastBookings = [];

    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            const booking = childSnapshot.val();
            booking.id = childSnapshot.key;

            if (booking.studentId === currentUser.uid) {
                if (booking.status === 'completed' || booking.status === 'rejected') {
                    pastBookings.push(booking);
                } else {
                    currentBookings.push(booking);
                }
            }
        });
    }

    displayBookings(currentBookings, 'studentCurrentBookings', false);
    displayBookings(pastBookings, 'studentPastBookings', false);

    setupBookingTabs('studentCurrentBookings', 'studentPastBookings');
}

// ==================== INSTRUCTOR BOOKINGS ====================
async function loadInstructorBookings() {
    const bookingsRef = ref(database, 'bookings');
    const snapshot = await get(bookingsRef);

    const currentBookings = [];
    const pastBookings = [];

    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            const booking = childSnapshot.val();
            booking.id = childSnapshot.key;

            if (booking.instructorId === currentUser.uid) {
                if (booking.status === 'completed' || booking.status === 'rejected') {
                    pastBookings.push(booking);
                } else {
                    currentBookings.push(booking);
                }
            }
        });
    }

    displayBookings(currentBookings, 'instructorCurrentBookings', true);
    displayBookings(pastBookings, 'instructorPastBookings', true);

    setupBookingTabs('instructorCurrentBookings', 'instructorPastBookings');
}

function displayBookings(bookings, containerId, isInstructor) {
    const container = document.getElementById(containerId);

    if (bookings.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>No bookings found</p></div>';
        return;
    }

    container.innerHTML = bookings.map(booking => {
        const otherPerson = isInstructor ? booking.studentName : booking.instructorName;
        let statusClass = 'status-pending';
        if (booking.status === 'accepted') statusClass = 'status-accepted';
        if (booking.status === 'rejected') statusClass = 'status-rejected';
        if (booking.status === 'completed') statusClass = 'status-completed';

        let actionButtons = '';
        if (isInstructor && booking.status === 'pending') {
            actionButtons = `
                <button class="btn btn-success" onclick="respondToBooking('${booking.id}', 'accepted')">Accept</button>
                <button class="btn btn-danger" onclick="respondToBooking('${booking.id}', 'rejected')">Reject</button>
            `;
        } else if (!isInstructor && booking.status === 'accepted' && booking.instructorContact) {
            actionButtons = `
                <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <strong>📞 Instructor Contact:</strong> ${booking.instructorContact}
                </div>
                <button class="btn btn-primary" onclick="showRatingModal('${booking.id}', '${booking.instructorId}', '${booking.instructorName}')">Mark as Completed & Rate</button>
            `;
        } else if (!isInstructor && booking.status === 'completed' && !booking.rated) {
            actionButtons = `<button class="btn btn-primary" onclick="showRatingModal('${booking.id}', '${booking.instructorId}', '${booking.instructorName}')">Rate Instructor</button>`;
        }

        // Show student contact for instructors
        let contactInfo = '';
        if (isInstructor && booking.studentMobile) {
            contactInfo = `<p><strong>Student Contact:</strong> ${booking.studentMobile}</p>`;
        }

        return `
            <div class="booking-card">
                <div class="booking-header">
                    <div>
                        <h3>${isInstructor ? '👨‍🎓 Student' : '👨‍🏫 Instructor'}: ${otherPerson}</h3>
                        <p style="color: var(--text-secondary); margin-top: 4px;">📅 ${booking.date} at ${booking.time} • ${booking.hours} hour(s)</p>
                    </div>
                    <span class="booking-status ${statusClass}">${booking.status}</span>
                </div>
                <div style="margin: 16px 0;">
                    ${booking.subjectClass ? `<p><strong>Subject/Class:</strong> ${booking.subjectClass}</p>` : ''}
                    <p><strong>Location:</strong> ${booking.address}</p>
                    ${booking.description ? `<p><strong>Details:</strong> ${booking.description}</p>` : ''}
                    ${contactInfo}
                    <p><strong>Total Cost:</strong> ₹${booking.totalCost}</p>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">${actionButtons}</div>
            </div>
        `;
    }).join('');
}

function setupBookingTabs(currentId, pastId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.dataset.tab === 'current') {
                document.getElementById(currentId).classList.remove('hidden');
                document.getElementById(pastId).classList.add('hidden');
            } else {
                document.getElementById(currentId).classList.add('hidden');
                document.getElementById(pastId).classList.remove('hidden');
            }
        });
    });
}

window.respondToBooking = async function (bookingId, response) {
    try {
        const bookingRef = ref(database, `bookings/${bookingId}`);
        const snapshot = await get(bookingRef);
        const booking = snapshot.val();

        const instructorRef = ref(database, `instructors/${booking.instructorId}`);
        const instructorSnapshot = await get(instructorRef);
        const instructor = instructorSnapshot.val();

        const updateData = {
            status: response,
            respondedAt: Date.now()
        };

        if (response === 'accepted') {
            updateData.instructorContact = instructor.mobile;
        }

        await update(bookingRef, updateData);

        const notificationMessage = response === 'accepted'
            ? `${booking.instructorName} has accepted your booking! Contact: ${instructor.mobile}`
            : `${booking.instructorName} has declined your booking request.`;

        const studentNotifRef = push(ref(database, `notifications/${booking.studentId}`));
        await set(studentNotifRef, {
            type: response === 'accepted' ? 'booking_accepted' : 'booking_rejected',
            bookingId: bookingId,
            message: notificationMessage,
            timestamp: Date.now(),
            read: false
        });

        alert(response === 'accepted' ? 'Booking accepted!' : 'Booking rejected.');
        loadInstructorBookings();
    } catch (error) {
        console.error('Response error:', error);
        alert('Failed to respond to booking.');
    }
}

// ==================== RATING MODAL ====================
window.showRatingModal = function (bookingId, instructorId, instructorName) {
    const modalHTML = `
        <div class="modal" id="ratingModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Rate ${instructorName}</h2>
                    <button class="modal-close" onclick="closeModal('ratingModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Did the instructor show up? *</label>
                        <select id="instructorShowedUp" required>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Your Rating *</label>
                        <div class="rating-input" id="ratingStars">
                            <span data-rating="1">☆</span>
                            <span data-rating="2">☆</span>
                            <span data-rating="3">☆</span>
                            <span data-rating="4">☆</span>
                            <span data-rating="5">☆</span>
                        </div>
                        <input type="hidden" id="selectedRating" value="0">
                    </div>
                    <div class="form-group">
                        <label>Review (Optional)</label>
                        <textarea id="ratingReview" placeholder="Share your experience..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('ratingModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="submitRating('${bookingId}', '${instructorId}', '${instructorName}')">Submit Rating</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const stars = document.querySelectorAll('#ratingStars span');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            document.getElementById('selectedRating').value = rating;

            stars.forEach((s, index) => {
                if (index < rating) {
                    s.textContent = '★';
                    s.classList.add('active');
                } else {
                    s.textContent = '☆';
                    s.classList.remove('active');
                }
            });
        });
    });
}

window.submitRating = async function (bookingId, instructorId, instructorName) {
    const showedUp = document.getElementById('instructorShowedUp').value;
    const rating = parseInt(document.getElementById('selectedRating').value);
    const review = document.getElementById('ratingReview').value;

    if (rating === 0) {
        alert('Please select a rating');
        return;
    }

    try {
        await update(ref(database, `bookings/${bookingId}`), {
            status: 'completed',
            rated: true,
            showedUp: showedUp === 'yes'
        });

        const ratingRef = push(ref(database, `instructors/${instructorId}/ratings`));
        await set(ratingRef, {
            studentId: currentUser.uid,
            studentName: currentUser.displayName,
            rating: rating,
            review: review,
            showedUp: showedUp === 'yes',
            timestamp: Date.now()
        });

        const studentNotifRef = push(ref(database, `notifications/${currentUser.uid}`));
        await set(studentNotifRef, {
            type: 'rating_submitted',
            message: `Thank you for rating ${instructorName}!`,
            timestamp: Date.now(),
            read: false
        });

        closeModal('ratingModal');
        alert('Thank you for your feedback!');
        loadStudentBookings();
    } catch (error) {
        console.error('Rating error:', error);
        alert('Failed to submit rating.');
    }
}

// ==================== NOTIFICATIONS ====================
async function loadStudentNotifications() {
    const notifRef = ref(database, `notifications/${currentUser.uid}`);
    const snapshot = await get(notifRef);

    const notifications = [];
    let unreadCount = 0;

    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            const notif = childSnapshot.val();
            notif.id = childSnapshot.key;
            notifications.push(notif);
            if (!notif.read) unreadCount++;
        });
    }

    notifications.sort((a, b) => b.timestamp - a.timestamp);

    const badge = document.getElementById('studentNotificationBadge');
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    displayNotifications(notifications, 'studentNotificationsList');
}

async function loadInstructorNotifications() {
    const notifRef = ref(database, `notifications/${currentUser.uid}`);
    const snapshot = await get(notifRef);

    const notifications = [];
    let unreadCount = 0;

    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            const notif = childSnapshot.val();
            notif.id = childSnapshot.key;
            notifications.push(notif);
            if (!notif.read) unreadCount++;
        });
    }

    notifications.sort((a, b) => b.timestamp - a.timestamp);

    const badge = document.getElementById('instructorNotificationBadge');
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    displayNotifications(notifications, 'instructorNotificationsList');
}

function displayNotifications(notifications, containerId) {
    const container = document.getElementById(containerId);

    if (notifications.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔔</div><p>No notifications</p></div>';
        return;
    }

    container.innerHTML = notifications.map(notif => {
        const timeAgo = getTimeAgo(notif.timestamp);
        return `
            <div class="notification-item ${!notif.read ? 'unread' : ''}">
                <div class="notification-header">
                    <strong>${notif.type.replace(/_/g, ' ').toUpperCase()}</strong>
                    <span class="notification-time">${timeAgo}</span>
                </div>
                <p>${notif.message}</p>
            </div>
        `;
    }).join('');
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(timestamp).toLocaleDateString();
}

async function markStudentNotificationsAsRead() {
    const notifRef = ref(database, `notifications/${currentUser.uid}`);
    const snapshot = await get(notifRef);

    if (snapshot.exists()) {
        snapshot.forEach(async (childSnapshot) => {
            const notif = childSnapshot.val();
            if (!notif.read) {
                await update(ref(database, `notifications/${currentUser.uid}/${childSnapshot.key}`), {
                    read: true
                });
            }
        });
    }

    document.getElementById('studentNotificationBadge').classList.add('hidden');
}

async function markInstructorNotificationsAsRead() {
    const notifRef = ref(database, `notifications/${currentUser.uid}`);
    const snapshot = await get(notifRef);

    if (snapshot.exists()) {
        snapshot.forEach(async (childSnapshot) => {
            const notif = childSnapshot.val();
            if (!notif.read) {
                await update(ref(database, `notifications/${currentUser.uid}/${childSnapshot.key}`), {
                    read: true
                });
            }
        });
    }

    document.getElementById('instructorNotificationBadge').classList.add('hidden');
}

function setupStudentNotificationListener() {
    const notifRef = ref(database, `notifications/${currentUser.uid}`);
    onValue(notifRef, () => loadStudentNotifications());
}

function setupInstructorNotificationListener() {
    const notifRef = ref(database, `notifications/${currentUser.uid}`);
    onValue(notifRef, () => loadInstructorNotifications());
}

async function checkPendingRatings() {
    const bookingsRef = ref(database, 'bookings');
    const snapshot = await get(bookingsRef);

    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            const booking = childSnapshot.val();
            if (booking.studentId === currentUser.uid && booking.status === 'accepted' && !booking.rated) {
                const bookingDate = new Date(booking.date);
                const today = new Date();
                if (bookingDate < today) {
                    setTimeout(() => {
                        if (confirm(`Did you have a session with ${booking.instructorName}? Would you like to rate them?`)) {
                            showRatingModal(childSnapshot.key, booking.instructorId, booking.instructorName);
                        }
                    }, 2000);
                }
            }
        });
    }
}

// ==================== UTILITY FUNCTIONS ====================
window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.remove();
    }
});

// ==================== ADD DASHBOARD SWITCH BUTTON ====================
function addDashboardSwitchButton() {
    // Find the "Become Instructor" button and replace it with "Dashboard" button
    const becomeInstructorBtn = document.querySelector('#studentDropdown .become-instructor-trigger');
    
    if (becomeInstructorBtn && currentUserData.isInstructor) {
        // Replace "Become Instructor" with "Go to Dashboard"
        becomeInstructorBtn.innerHTML = '📊 Dashboard';
        becomeInstructorBtn.classList.remove('become-instructor-trigger');
        
        // Add click handler to switch to instructor app
        becomeInstructorBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Hide student app
            document.getElementById('studentApp').classList.add('hidden');
            
            // Show instructor app
            document.getElementById('instructorApp').classList.remove('hidden');
            document.getElementById('instructorUserNameMenu').textContent = currentUser.displayName;
            document.getElementById('instructorUserAvatarMenu').src = currentUser.photoURL;
            
            // Load instructor features
            await loadInstructorDashboard();
            await loadInstructorNotifications();
            setupInstructorNotificationListener();
        });
    }
}

// ==================== HOME BUTTON LISTENER ====================
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for "Home" button in instructor menu
    const switchToHomeBtn = document.getElementById('switchToHomeBtn');
    if (switchToHomeBtn) {
        switchToHomeBtn.addEventListener('click', async () => {
            // Hide instructor app
            document.getElementById('instructorApp').classList.add('hidden');
            
            // Show student app (home page)
            document.getElementById('studentApp').classList.remove('hidden');
            document.getElementById('studentUserNameMenu').textContent = currentUser.displayName;
            document.getElementById('studentUserAvatarMenu').src = currentUser.photoURL;
            
            // Reload home page content
            await loadInstructors();
            await loadCategories();
            
            // Show home page
            document.querySelectorAll('#studentApp .page-content').forEach(p => p.classList.add('hidden'));
            document.getElementById('studentHomePage').classList.remove('hidden');
        });
    }
});



