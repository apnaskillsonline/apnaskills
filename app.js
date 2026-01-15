// ==================== FIREBASE INITIALIZATION ====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getDatabase, ref, set, get, push, update, onValue, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBj8NFx3wd1PFXR37X4JcE9j4N9pJGnZ8A",
    authDomain: "apnaskills-ef242.firebaseapp.com",
    databaseURL: "https://apnaskills-ef242-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "apnaskills-ef242",
    storageBucket: "apnaskills-ef242.firebasestorage.app",
    messagingSenderId: "120699280754",
    appId: "1:120699280754:web:1aff20056bf990f67c11eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

// ==================== GLOBAL STATE ====================
let currentUser = null;
let currentUserData = null;
let allTutors = [];
let filteredTutors = [];
let isSearchActive = false;

// Indian Cities List
const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
    'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi',
    'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
    'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad',
    'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh', 'Tiruppur', 'Moradabad', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Warangal',
    'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack',
    'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur',
    'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu',
    'Sangli-Miraj', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur'
];

// Specializations List
const specializations = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Computer Science', 
    'Programming', 'Web Development', 'Data Science', 'Machine Learning', 'Artificial Intelligence',
    'Python', 'Java', 'JavaScript', 'C++', 'Science', 'Social Studies', 'History', 'Geography',
    'Economics', 'Commerce', 'Accountancy', 'Business Studies', 'Statistics', 'Music', 'Vocal Music',
    'Guitar', 'Piano', 'Keyboard', 'Drums', 'Classical Music', 'Dance', 'Classical Dance', 'Kathak',
    'Bharatanatyam', 'Contemporary Dance', 'Hip Hop', 'Art', 'Drawing', 'Painting', 'Sketching',
    'Craft', 'French', 'German', 'Spanish', 'Japanese', 'Korean', 'Foreign Languages', 
    'English Spoken', 'IELTS', 'TOEFL', 'Personality Development', 'Public Speaking', 'Communication Skills',
    'Yoga', 'Fitness', 'Meditation', 'Chess', 'Coding', 'Robotics', 'Electronics', 'Photography',
    'Video Editing', 'Graphic Design', 'Digital Marketing', 'Content Writing', 'Creative Writing'
];


// ==================== AUTHENTICATION ====================

// Google Sign In
document.getElementById('googleLoginBtn').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
        
        // Check if user exists in database
        const userRef = ref(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
            // Create new user in database
            await set(userRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                isTutor: false,
                createdAt: Date.now()
            });
            
            // Create welcome notification
            const notifRef = push(ref(database, `notifications/${currentUser.uid}`));
            await set(notifRef, {
                type: 'welcome',
                message: 'Welcome to ApnaSkills! Start exploring tutors and book your first session.',
                timestamp: Date.now(),
                read: false
            });
        }
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Failed to login. Please try again.');
    }
});

// Auth state observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        
        // Load user data
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        currentUserData = snapshot.val();
        
        // Show main app
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        // Update UI with user info
        document.getElementById('userName').textContent = user.displayName;
        document.getElementById('userAvatar').src = user.photoURL;
        
        // Update user role display
        if (currentUserData.isTutor) {
            document.getElementById('userRole').textContent = '👨‍🏫 Tutor';
            // Hide become tutor banner for tutors
            document.getElementById('becomeTutorBanner').classList.add('hidden');
        } else {
            document.getElementById('userRole').textContent = '👨‍🎓 Student';
            // Show become tutor banner for students
            document.getElementById('becomeTutorBanner').classList.remove('hidden');
        }
        
        // Load initial data
        await loadTutors();
        await loadNotifications();
        setupNotificationListener();
        
        // Check for pending rating popup on login
        setTimeout(() => {
            checkPendingRatings();
        }, 2000);
        
    } else {
        // User logged out
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        currentUser = null;
        currentUserData = null;
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// ==================== NAVIGATION ====================

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        navigateToPage(page);
    });
});

function navigateToPage(page) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const pageLink = document.querySelector(`[data-page="${page}"]`);
    if (pageLink) {
        pageLink.classList.add('active');
    }
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    
    // Show selected page
    switch(page) {
        case 'home':
            document.getElementById('homePage').classList.remove('hidden');
            break;
        case 'bookings':
            document.getElementById('bookingsPage').classList.remove('hidden');
            loadBookings();
            break;
        case 'notifications':
            document.getElementById('notificationsPage').classList.remove('hidden');
            markNotificationsAsRead();
            break;
        case 'profile':
            document.getElementById('profilePage').classList.remove('hidden');
            loadProfile();
            break;
    }
}

// ==================== LOAD PROFILE ====================

async function loadProfile() {
    const container = document.getElementById('profileContent');
    
    if (!currentUser || !currentUserData) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>Unable to load profile. Please refresh the page.</p></div>';
        return;
    }
    
    // Get fresh user data
    const userRef = ref(database, `users/${currentUser.uid}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();
    
    let profileHTML = `
        <div style="background: var(--bg-secondary); padding: 32px; border-radius: var(--radius); margin-bottom: 24px;">
            <div style="display: flex; gap: 24px; align-items: center; margin-bottom: 24px;">
                <img src="${currentUser.photoURL}" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--primary);" onerror="this.src='https://via.placeholder.com/100?text=Avatar'">
                <div>
                    <h2 style="margin-bottom: 8px;">${currentUser.displayName}</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 4px;">📧 ${currentUser.email}</p>
                    <span style="background: var(--primary); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                        ${userData.isTutor ? '👨‍🏫 TUTOR' : '👨‍🎓 STUDENT'}
                    </span>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <strong>User ID:</strong><br>
                    <span style="color: var(--text-secondary); font-size: 12px; word-break: break-all;">${currentUser.uid}</span>
                </div>
                <div>
                    <strong>Account Created:</strong><br>
                    <span style="color: var(--text-secondary);">${new Date(userData.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    `;
    
    // If user is a tutor, show tutor details
    if (userData.isTutor) {
        const tutorRef = ref(database, `tutors/${currentUser.uid}`);
        const tutorSnapshot = await get(tutorRef);
        const tutorData = tutorSnapshot.val();
        
        if (tutorData) {
            // Calculate ratings
            let avgRating = 0;
            let totalRatings = 0;
            let ratingsHTML = '';
            
            if (tutorData.ratings) {
                const ratings = Object.values(tutorData.ratings);
                const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
                avgRating = (sum / ratings.length).toFixed(1);
                totalRatings = ratings.length;
                
                ratingsHTML = ratings.map(r => `
                    <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; box-shadow: var(--shadow);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <div>
                                <strong>${r.studentName}</strong>
                                <div style="color: var(--warning); margin-top: 4px;">⭐ ${r.rating}/5</div>
                            </div>
                            <div style="color: var(--text-light); font-size: 12px;">${new Date(r.timestamp).toLocaleDateString()}</div>
                        </div>
                        ${r.review ? `<p style="color: var(--text-secondary); margin-top: 8px;">"${r.review}"</p>` : ''}
                        <div style="margin-top: 8px; font-size: 12px;">
                            ${r.showedUp ? '✅ Tutor showed up' : '❌ Tutor did not show up'}
                        </div>
                    </div>
                `).join('');
            } else {
                ratingsHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No ratings yet</p>';
            }
            
            profileHTML += `
                <div style="background: white; padding: 32px; border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 24px;">
                    <h3 style="margin-bottom: 20px; color: var(--primary);">📚 Tutor Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <strong>Specialization:</strong><br>
                            <span style="color: var(--primary); font-size: 18px;">${tutorData.specialization}</span>
                        </div>
                        <div>
                            <strong>Location:</strong><br>
                            <span style="color: var(--text-secondary);">${tutorData.location}</span>
                        </div>
                        <div>
                            <strong>Experience:</strong><br>
                            <span style="color: var(--text-secondary);">${tutorData.experience} years</span>
                        </div>
                        <div>
                            <strong>Age:</strong><br>
                            <span style="color: var(--text-secondary);">${tutorData.age} years</span>
                        </div>
                        <div>
                            <strong>Hourly Rate:</strong><br>
                            <span style="color: var(--success); font-size: 18px; font-weight: 600;">₹${tutorData.hourlyRate}/hour</span>
                        </div>
                        <div>
                            <strong>Mobile:</strong><br>
                            <span style="color: var(--text-secondary);">${tutorData.mobile}</span>
                        </div>
                    </div>
                    ${tutorData.certifications ? `
                        <div style="margin-top: 20px;">
                            <strong>Certifications:</strong><br>
                            <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">${tutorData.certifications}</p>
                        </div>
                    ` : ''}
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--bg-tertiary);">
                        <strong>Overall Rating:</strong>
                        <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                            <span style="font-size: 32px; color: var(--warning);">⭐ ${avgRating}</span>
                            <span style="color: var(--text-secondary);">(${totalRatings} reviews)</span>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 32px; border-radius: var(--radius); box-shadow: var(--shadow);">
                    <h3 style="margin-bottom: 20px; color: var(--primary);">⭐ Reviews & Ratings</h3>
                    ${ratingsHTML}
                </div>
            `;
        }
    } else {
        profileHTML += `
            <div style="background: linear-gradient(135deg, var(--secondary), var(--accent)); color: white; padding: 40px; border-radius: var(--radius); text-align: center;">
                <h3 style="font-size: 24px; margin-bottom: 16px;">Want to become a tutor?</h3>
                <p style="margin-bottom: 24px; opacity: 0.95;">Share your knowledge and earn by teaching students</p>
                <button class="btn btn-primary" onclick="document.getElementById('becomeTutorBtn').click()">Register as Tutor</button>
            </div>
        `;
    }
    
    container.innerHTML = profileHTML;
}

// ==================== LOAD TUTORS ====================

async function loadTutors() {
    const tutorsRef = ref(database, 'tutors');
    const snapshot = await get(tutorsRef);
    
    if (snapshot.exists()) {
        allTutors = [];
        snapshot.forEach(childSnapshot => {
            const tutor = childSnapshot.val();
            tutor.id = childSnapshot.key;
            
            // Calculate average rating
            if (tutor.ratings) {
                const ratings = Object.values(tutor.ratings);
                const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
                tutor.avgRating = (sum / ratings.length).toFixed(1);
                tutor.totalRatings = ratings.length;
            } else {
                tutor.avgRating = 0;
                tutor.totalRatings = 0;
            }
            
            allTutors.push(tutor);
        });
        
        displayTutors(allTutors);
    } else {
        document.getElementById('tutorsGrid').innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎓</div><p>No tutors available yet. Be the first to register!</p></div>';
    }
}

function displayTutors(tutors) {
    const grid = document.getElementById('tutorsGrid');
    
    if (tutors.length === 0) {
        if (isSearchActive) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No tutors found matching your search criteria. Try different keywords or <button class="btn btn-primary" onclick="document.getElementById(\'clearSearchBtn\').click()">clear search</button></p></div>';
        } else {
            grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎓</div><p>No tutors available yet. Be the first to register as a tutor!</p></div>';
        }
        return;
    }
    
    grid.innerHTML = tutors.map(tutor => `
        <div class="tutor-card" onclick="viewTutorDetails('${tutor.id}')">
            <div class="tutor-header">
                <img src="${tutor.photoURL || 'https://via.placeholder.com/80'}" alt="${tutor.name}" class="tutor-avatar" onerror="this.src='https://via.placeholder.com/80?text=Avatar'">
                <div class="tutor-info">
                    <h3>${tutor.name}</h3>
                    <div class="tutor-specialization">${tutor.specialization}</div>
                    <div class="tutor-rating">
                        ⭐ ${tutor.avgRating} (${tutor.totalRatings} reviews)
                    </div>
                </div>
            </div>
            <div class="tutor-details">
                <div class="tutor-detail-item">
                    <span class="tutor-detail-label">Experience</span>
                    <span class="tutor-detail-value">${tutor.experience} years</span>
                </div>
                <div class="tutor-detail-item">
                    <span class="tutor-detail-label">Location</span>
                    <span class="tutor-detail-value">${tutor.location}</span>
                </div>
            </div>
            <div class="tutor-price">₹${tutor.hourlyRate}/hour</div>
            <button class="btn btn-primary" style="width: 100%;" onclick="event.stopPropagation(); showBookingModal('${tutor.id}')">Book Now</button>
        </div>
    `).join('');
}

// ==================== SEARCH FUNCTIONALITY ====================

// Setup autocomplete for location
const locationInput = document.getElementById('locationInput');
const locationSuggestions = document.getElementById('locationSuggestions');

locationInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase().trim();
    
    if (value.length === 0) {
        locationSuggestions.classList.add('hidden');
        return;
    }
    
    // Filter cities that match
    const matches = indianCities.filter(city => 
        city.toLowerCase().includes(value)
    );
    
    if (matches.length === 0) {
        // Show custom option
        locationSuggestions.innerHTML = `
            <div class="suggestion-item custom-option" data-value="${e.target.value}">
                ✏️ Use "${e.target.value}"
            </div>
        `;
        locationSuggestions.classList.remove('hidden');
    } else {
        // Show matching cities
        locationSuggestions.innerHTML = matches.slice(0, 10).map(city => `
            <div class="suggestion-item" data-value="${city}">${city}</div>
        `).join('');
        
        // Add custom option at the end
        locationSuggestions.innerHTML += `
            <div class="suggestion-item custom-option" data-value="${e.target.value}">
                ✏️ Use "${e.target.value}"
            </div>
        `;
        locationSuggestions.classList.remove('hidden');
    }
    
    // Add click handlers
    document.querySelectorAll('#locationSuggestions .suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            locationInput.value = item.dataset.value;
            locationSuggestions.classList.add('hidden');
        });
    });
});

// Setup autocomplete for specialization
const specializationInput = document.getElementById('specializationInput');
const specializationSuggestions = document.getElementById('specializationSuggestions');

specializationInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase().trim();
    
    if (value.length === 0) {
        specializationSuggestions.classList.add('hidden');
        return;
    }
    
    // Filter specializations that match
    const matches = specializations.filter(spec => 
        spec.toLowerCase().includes(value)
    );
    
    if (matches.length === 0) {
        // Show custom option
        specializationSuggestions.innerHTML = `
            <div class="suggestion-item custom-option" data-value="${e.target.value}">
                ✏️ Use "${e.target.value}"
            </div>
        `;
        specializationSuggestions.classList.remove('hidden');
    } else {
        // Show matching specializations
        specializationSuggestions.innerHTML = matches.slice(0, 10).map(spec => `
            <div class="suggestion-item" data-value="${spec}">${spec}</div>
        `).join('');
        
        // Add custom option at the end
        specializationSuggestions.innerHTML += `
            <div class="suggestion-item custom-option" data-value="${e.target.value}">
                ✏️ Use "${e.target.value}"
            </div>
        `;
        specializationSuggestions.classList.remove('hidden');
    }
    
    // Add click handlers
    document.querySelectorAll('#specializationSuggestions .suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            specializationInput.value = item.dataset.value;
            specializationSuggestions.classList.add('hidden');
        });
    });
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.input-group')) {
        locationSuggestions.classList.add('hidden');
        specializationSuggestions.classList.add('hidden');
    }
});

// Handle search form submission
document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const location = locationInput.value.toLowerCase().trim();
    const specialization = specializationInput.value.toLowerCase().trim();
    
    if (!location && !specialization) {
        alert('Please enter location or specialization to search');
        return;
    }
    
    isSearchActive = true;
    
    filteredTutors = allTutors.filter(tutor => {
        const locationMatch = !location || tutor.location.toLowerCase().includes(location);
        const specializationMatch = !specialization || 
            tutor.specialization.toLowerCase().includes(specialization) ||
            tutor.name.toLowerCase().includes(specialization);
        return locationMatch && specializationMatch;
    });
    
    displayTutors(filteredTutors);
    
    // Hide suggestions
    locationSuggestions.classList.add('hidden');
    specializationSuggestions.classList.add('hidden');
    
    // Scroll to tutors section with proper offset
    setTimeout(() => {
        const tutorsSection = document.querySelector('.tutors-section');
        if (tutorsSection) {
            const yOffset = -80; // Account for sticky header
            const y = tutorsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});
        }
    }, 100);
});

// Clear search button
document.getElementById('clearSearchBtn').addEventListener('click', () => {
    locationInput.value = '';
    specializationInput.value = '';
    isSearchActive = false;
    displayTutors(allTutors);
    locationSuggestions.classList.add('hidden');
    specializationSuggestions.classList.add('hidden');
});

// ==================== TUTOR DETAILS MODAL ====================

window.viewTutorDetails = async function(tutorId) {
    const tutor = allTutors.find(t => t.id === tutorId);
    if (!tutor) return;
    
    // Get ratings
    let ratingsHTML = '';
    if (tutor.ratings) {
        const ratingsArray = Object.values(tutor.ratings);
        ratingsHTML = ratingsArray.map(r => `
            <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <div style="color: var(--warning);">⭐ ${r.rating}/5</div>
                    <div style="color: var(--text-light); font-size: 12px;">${new Date(r.timestamp).toLocaleDateString()}</div>
                </div>
                ${r.review ? `<p style="color: var(--text-secondary);">${r.review}</p>` : ''}
            </div>
        `).join('');
    } else {
        ratingsHTML = '<p style="color: var(--text-secondary);">No reviews yet</p>';
    }
    
    const modalHTML = `
        <div class="modal" id="tutorDetailsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Tutor Details</h2>
                    <button class="modal-close" onclick="closeModal('tutorDetailsModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: flex; gap: 24px; margin-bottom: 24px;">
                        <img src="${tutor.photoURL || 'https://via.placeholder.com/120'}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary);" onerror="this.src='https://via.placeholder.com/120?text=Avatar'">
                        <div style="flex: 1;">
                            <h2 style="margin-bottom: 8px;">${tutor.name}</h2>
                            <p style="color: var(--primary); font-weight: 600; margin-bottom: 8px;">${tutor.specialization}</p>
                            <div style="color: var(--warning); margin-bottom: 8px;">⭐ ${tutor.avgRating} (${tutor.totalRatings} reviews)</div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">₹${tutor.hourlyRate}/hour</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin-bottom: 12px;">About</h3>
                        <div style="display: grid; grid-template-columns
                        // APPEND THIS TO THE END OF app.js (Part 1)

// Continuation of viewTutorDetails function
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div><strong>Experience:</strong> ${tutor.experience} years</div>
                            <div><strong>Age:</strong> ${tutor.age}</div>
                            <div><strong>Location:</strong> ${tutor.location}</div>
                            <div><strong>Email:</strong> ${tutor.email}</div>
                        </div>
                    </div>
                    
                    ${tutor.certifications ? `
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin-bottom: 12px;">Certifications</h3>
                        <p style="color: var(--text-secondary);">${tutor.certifications}</p>
                    </div>
                    ` : ''}
                    
                    <div>
                        <h3 style="margin-bottom: 12px;">Reviews</h3>
                        ${ratingsHTML}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('tutorDetailsModal')">Close</button>
                    <button class="btn btn-primary" onclick="closeModal('tutorDetailsModal'); showBookingModal('${tutorId}')">Book Session</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ==================== BOOKING MODAL ====================

window.showBookingModal = function(tutorId) {
    const tutor = allTutors.find(t => t.id === tutorId);
    if (!tutor) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const modalHTML = `
        <div class="modal" id="bookingModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Book Session with ${tutor.name}</h2>
                    <button class="modal-close" onclick="closeModal('bookingModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="bookingForm">
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
                            <label>Description of your needs *</label>
                            <textarea id="bookingDescription" required placeholder="Tell the tutor what you need help with..."></textarea>
                        </div>
                        <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-top: 16px;">
                            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 600;">
                                <span>Estimated Cost:</span>
                                <span style="color: var(--primary);">₹<span id="estimatedCost">${tutor.hourlyRate}</span></span>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('bookingModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="submitBooking('${tutorId}')">Confirm Booking</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Update cost on hours change
    document.getElementById('bookingHours').addEventListener('input', (e) => {
        const hours = parseInt(e.target.value) || 1;
        document.getElementById('estimatedCost').textContent = hours * tutor.hourlyRate;
    });
}

window.submitBooking = async function(tutorId) {
    const tutor = allTutors.find(t => t.id === tutorId);
    const address = document.getElementById('bookingAddress').value;
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const hours = parseInt(document.getElementById('bookingHours').value);
    const description = document.getElementById('bookingDescription').value;
    
    if (!address || !date || !time || !hours || !description) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        // Create booking
        const bookingRef = push(ref(database, 'bookings'));
        const bookingData = {
            studentId: currentUser.uid,
            studentName: currentUser.displayName,
            studentEmail: currentUser.email,
            tutorId: tutorId,
            tutorName: tutor.name,
            address: address,
            date: date,
            time: time,
            hours: hours,
            description: description,
            totalCost: hours * tutor.hourlyRate,
            status: 'pending',
            createdAt: Date.now()
        };
        
        await set(bookingRef, bookingData);
        
        // Send notification to tutor
        const tutorNotifRef = push(ref(database, `notifications/${tutorId}`));
        await set(tutorNotifRef, {
            type: 'new_booking',
            bookingId: bookingRef.key,
            message: `New booking request from ${currentUser.displayName}`,
            timestamp: Date.now(),
            read: false
        });
        
        // Send notification to student
        const studentNotifRef = push(ref(database, `notifications/${currentUser.uid}`));
        await set(studentNotifRef, {
            type: 'booking_sent',
            bookingId: bookingRef.key,
            message: `Booking request sent to ${tutor.name}. Waiting for confirmation.`,
            timestamp: Date.now(),
            read: false
        });
        
        closeModal('bookingModal');
        alert('Booking request sent successfully! The tutor will respond soon.');
        navigateToPage('bookings');
        
    } catch (error) {
        console.error('Booking error:', error);
        alert('Failed to create booking. Please try again.');
    }
}

// ==================== BECOME TUTOR ====================

document.getElementById('becomeTutorBtn').addEventListener('click', () => {
    const specializationOptions = specializations.map(spec => 
        `<option value="${spec}">${spec}</option>`
    ).join('');
    
    const cityOptions = indianCities.map(city => 
        `<option value="${city}">${city}</option>`
    ).join('');
    
    const modalHTML = `
        <div class="modal" id="becomeTutorModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Register as a Tutor</h2>
                    <button class="modal-close" onclick="closeModal('becomeTutorModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="tutorRegistrationForm">
                        <div class="form-group">
                            <label>Full Name *</label>
                            <input type="text" id="tutorName" value="${currentUser.displayName}" required>
                        </div>
                        <div class="form-group" style="position: relative;">
                            <label>Specialization *</label>
                            <input type="text" id="tutorSpecialization" placeholder="Select from list or type your own" autocomplete="off" required list="specializationList">
                            <datalist id="specializationList">
                                ${specializationOptions}
                            </datalist>
                            <small style="color: var(--text-secondary); display: block; margin-top: 4px;">
                                💡 Type any subject if not in list (e.g., "Tabla", "Sanskrit", "Cooking")
                            </small>
                        </div>
                        <div class="form-group" style="position: relative;">
                            <label>Location (City) *</label>
                            <input type="text" id="tutorLocation" placeholder="Select from list or type your own" autocomplete="off" required list="cityList">
                            <datalist id="cityList">
                                ${cityOptions}
                            </datalist>
                            <small style="color: var(--text-secondary); display: block; margin-top: 4px;">
                                💡 Type your city/area if not in list
                            </small>
                        </div>
                        <div class="form-group">
                            <label>Mobile Number *</label>
                            <input type="tel" id="tutorMobile" required placeholder="+91 XXXXXXXXXX" pattern="[+0-9]{10,15}">
                        </div>
                        <div class="form-group">
                            <label>Age *</label>
                            <input type="number" id="tutorAge" min="18" max="100" required>
                        </div>
                        <div class="form-group">
                            <label>Experience (years) *</label>
                            <input type="number" id="tutorExperience" min="0" max="50" required>
                        </div>
                        <div class="form-group">
                            <label>Hourly Rate (₹) *</label>
                            <input type="number" id="tutorRate" min="100" max="10000" required placeholder="e.g., 500">
                        </div>
                        <div class="form-group">
                            <label>Certifications</label>
                            <textarea id="tutorCertifications" placeholder="List your certifications, degrees, and qualifications..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('becomeTutorModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="submitTutorRegistration()">Register</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
});

window.submitTutorRegistration = async function() {
    const name = document.getElementById('tutorName').value.trim();
    const specialization = document.getElementById('tutorSpecialization').value.trim();
    const location = document.getElementById('tutorLocation').value.trim();
    const mobile = document.getElementById('tutorMobile').value.trim();
    const age = document.getElementById('tutorAge').value;
    const experience = document.getElementById('tutorExperience').value;
    const hourlyRate = document.getElementById('tutorRate').value;
    const certifications = document.getElementById('tutorCertifications').value.trim();
    
    if (!name || !specialization || !location || !mobile || !age || !experience || !hourlyRate) {
        alert('Please fill all required fields');
        return;
    }
    
    try {
        // Create tutor profile
        const tutorRef = ref(database, `tutors/${currentUser.uid}`);
        await set(tutorRef, {
            userId: currentUser.uid,
            name: name,
            specialization: specialization,
            location: location,
            mobile: mobile,
            age: parseInt(age),
            experience: parseInt(experience),
            hourlyRate: parseInt(hourlyRate),
            certifications: certifications,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            createdAt: Date.now()
        });
        
        // Update user status to tutor
        await update(ref(database, `users/${currentUser.uid}`), {
            isTutor: true
        });
        
        currentUserData.isTutor = true;
        
        // Update UI
        document.getElementById('becomeTutorBanner').classList.add('hidden');
        document.getElementById('userRole').textContent = '👨‍🏫 Tutor';
        
        closeModal('becomeTutorModal');
        alert('Congratulations! You are now registered as a tutor on ApnaSkills.');
        await loadTutors();
        
    } catch (error) {
        console.error('Registration error:', error);
        alert('Failed to register. Please try again.');
    }
}

// ==================== LOAD BOOKINGS ====================

async function loadBookings() {
    const bookingsRef = ref(database, 'bookings');
    const snapshot = await get(bookingsRef);
    
    const currentBookings = [];
    const pastBookings = [];
    
    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            const booking = childSnapshot.val();
            booking.id = childSnapshot.key;
            
            // Check if this booking belongs to current user
            if (booking.studentId === currentUser.uid || booking.tutorId === currentUser.uid) {
                if (booking.status === 'completed' || booking.status === 'rejected') {
                    pastBookings.push(booking);
                } else {
                    currentBookings.push(booking);
                }
            }
        });
    }
    
    displayBookings(currentBookings, 'currentBookings');
    displayBookings(pastBookings, 'pastBookings');
    
    // Setup tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.tab === 'current') {
                document.getElementById('currentBookings').classList.remove('hidden');
                document.getElementById('pastBookings').classList.add('hidden');
            } else {
                document.getElementById('currentBookings').classList.add('hidden');
                document.getElementById('pastBookings').classList.remove('hidden');
            }
        });
    });
}

function displayBookings(bookings, containerId) {
    const container = document.getElementById(containerId);
    
    if (bookings.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>No bookings found</p></div>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => {
        const isTutor = booking.tutorId === currentUser.uid;
        const otherPerson = isTutor ? booking.studentName : booking.tutorName;
        
        let statusClass = 'status-pending';
        if (booking.status === 'accepted') statusClass = 'status-accepted';
        if (booking.status === 'rejected') statusClass = 'status-rejected';
        if (booking.status === 'completed') statusClass = 'status-completed';
        
        let actionButtons = '';
        if (isTutor && booking.status === 'pending') {
            actionButtons = `
                <button class="btn btn-success" onclick="respondToBooking('${booking.id}', 'accepted')">Accept</button>
                <button class="btn btn-danger" onclick="respondToBooking('${booking.id}', 'rejected')">Reject</button>
            `;
        } else if (!isTutor && booking.status === 'accepted' && booking.tutorContact) {
            actionButtons = `
                <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <strong>📞 Tutor Contact:</strong> ${booking.tutorContact}
                </div>
                <button class="btn btn-primary" onclick="markBookingCompleted('${booking.id}', '${booking.tutorId}', '${booking.tutorName}')">Mark as Completed & Rate</button>
            `;
        } else if (!isTutor && booking.status === 'completed' && !booking.rated) {
            actionButtons = `
                <button class="btn btn-primary" onclick="showRatingModal('${booking.id}', '${booking.tutorId}', '${booking.tutorName}')">Rate Tutor</button>
            `;
        }
        
        return `
            <div class="booking-card">
                <div class="booking-header">
                    <div>
                        <h3>${isTutor ? '👨‍🎓 Student' : '👨‍🏫 Tutor'}: ${otherPerson}</h3>
                        <p style="color: var(--text-secondary); margin-top: 4px;">
                            📅 ${booking.date} at ${booking.time} • ${booking.hours} hour(s)
                        </p>
                    </div>
                    <span class="booking-status ${statusClass}">${booking.status}</span>
                </div>
                <div style="margin: 16px 0;">
                    <p><strong>Location:</strong> ${booking.address}</p>
                    <p><strong>Description:</strong> ${booking.description}</p>
                    <p><strong>Total Cost:</strong> ₹${booking.totalCost}</p>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    ${actionButtons}
                </div>
            </div>
        `;
    }).join('');
}

window.respondToBooking = async function(bookingId, response) {
    try {
        const bookingRef = ref(database, `bookings/${bookingId}`);
        const snapshot = await get(bookingRef);
        const booking = snapshot.val();
        
        // Get tutor info
        const tutorRef = ref(database, `tutors/${booking.tutorId}`);
        const tutorSnapshot = await get(tutorRef);
        const tutor = tutorSnapshot.val();
        
        // Update booking
        const updateData = {
            status: response,
            respondedAt: Date.now()
        };
        
        if (response === 'accepted') {
            updateData.tutorContact = tutor.mobile;
        }
        
        await update(bookingRef, updateData);
        
        // Send notification
        const notificationMessage = response === 'accepted' 
            ? `${booking.tutorName} has accepted your booking! Contact: ${tutor.mobile}`
            : `${booking.tutorName} has declined your booking request.`;
        
        const studentNotifRef = push(ref(database, `notifications/${booking.studentId}`));
        await set(studentNotifRef, {
            type: response === 'accepted' ? 'booking_accepted' : 'booking_rejected',
            bookingId: bookingId,
            message: notificationMessage,
            timestamp: Date.now(),
            read: false
        });
        
        alert(response === 'accepted' ? 'Booking accepted!' : 'Booking rejected.');
        loadBookings();
        
    } catch (error) {
        console.error('Response error:', error);
        alert('Failed to respond. Please try again.');
    }
}

window.markBookingCompleted = async function(bookingId, tutorId, tutorName) {
    showRatingModal(bookingId, tutorId, tutorName);
}

// ==================== RATING MODAL ====================

window.showRatingModal = function(bookingId, tutorId, tutorName) {
    const modalHTML = `
        <div class="modal" id="ratingModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Rate ${tutorName}</h2>
                    <button class="modal-close" onclick="closeModal('ratingModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Did the tutor show up? *</label>
                        <select id="tutorShowedUp" required>
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
                    <div class="form-group">
                        <label>Complaint or Suggestion (Optional)</label>
                        <textarea id="ratingComplaint" placeholder="Any complaints or suggestions?"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('ratingModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="submitRating('${bookingId}', '${tutorId}', '${tutorName}')">Submit Rating</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup rating stars
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

window.submitRating = async function(bookingId, tutorId, tutorName) {
    const showedUp = document.getElementById('tutorShowedUp').value;
    const rating = parseInt(document.getElementById('selectedRating').value);
    const review = document.getElementById('ratingReview').value;
    const complaint = document.getElementById('ratingComplaint').value;
    
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
        
        const ratingRef = push(ref(database, `tutors/${tutorId}/ratings`));
        await set(ratingRef, {
            studentId: currentUser.uid,
            studentName: currentUser.displayName,
            rating: rating,
            review: review,
            showedUp: showedUp === 'yes',
            timestamp: Date.now()
        });
        
        if (complaint) {
            const notifRef = push(ref(database, `notifications/${tutorId}`));
            await set(notifRef, {
                type: 'complaint',
                bookingId: bookingId,
                message: `Feedback from ${currentUser.displayName}: ${complaint}`,
                timestamp: Date.now(),
                read: false
            });
        }
        
        const studentNotifRef = push(ref(database, `notifications/${currentUser.uid}`));
        await set(studentNotifRef, {
            type: 'rating_submitted',
            message: `Thank you for rating ${tutorName}!`,
            timestamp: Date.now(),
            read: false
        });
        
        closeModal('ratingModal');
        alert('Thank you for your feedback!');
        loadBookings();
        loadTutors();
        
    } catch (error) {
        console.error('Rating error:', error);
        alert('Failed to submit rating. Please try again.');
    }
}

async function checkPendingRatings() {
    const bookingsRef = ref(database, 'bookings');
    const snapshot = await get(bookingsRef);
    
    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            const booking = childSnapshot.val();
            
            if (booking.studentId === currentUser.uid && 
                booking.status === 'accepted' && 
                !booking.rated) {
                
                const bookingDate = new Date(booking.date);
                const today = new Date();
                
                if (bookingDate < today) {
                    setTimeout(() => {
                        if (confirm(`Did you have a session with ${booking.tutorName}? Would you like to rate them?`)) {
                            showRatingModal(childSnapshot.key, booking.tutorId, booking.tutorName);
                        }
                    }, 2000);
                }
            }
        });
    }
}

// ==================== NOTIFICATIONS ====================

async function loadNotifications() {
    const notifRef = ref(database, `notifications/${currentUser.uid}`);
    const snapshot = await get(notifRef);
    
    const notifications = [];
    let unreadCount = 0;
    
    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            const notif = childSnapshot.val();
            notif.id = childSnapshot.key;
            notifications.push(notif);
            
            if (!notif.read) {
                unreadCount++;
            }
        });
    }
    
    notifications.sort((a, b) => b.timestamp - a.timestamp);
    
    const badge = document.getElementById('notificationBadge');
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
    
    displayNotifications(notifications);
}

function displayNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔔</div><p>No notifications</p></div>';
        return;
    }
    
    container.innerHTML = notifications.map(notif => {
        const timeAgo = getTimeAgo(notif.timestamp);
        
        return `
            <div class="notification-item ${!notif.read ? 'unread' : ''}">
                <div class="notification-header">
                    <strong>${getNotificationIcon(notif.type)} ${notif.type.replace(/_/g, ' ').toUpperCase()}</strong>
                    <span class="notification-time">${timeAgo}</span>
                </div>
                <p>${notif.message}</p>
            </div>
        `;
    }).join('');
}

function getNotificationIcon(type) {
    const icons = {
        'welcome': '👋',
        'new_booking': '📚',
        'booking_sent': '✉️',
        'booking_accepted': '✅',
        'booking_rejected': '❌',
        'complaint': '⚠️',
        'rating_submitted': '⭐'
    };
    return icons[type] || '🔔';
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(timestamp).toLocaleDateString();
}

async function markNotificationsAsRead() {
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
    
    document.getElementById('notificationBadge').classList.add('hidden');
}

function setupNotificationListener() {
    const notifRef = ref(database, `notifications/${currentUser.uid}`);
    onValue(notifRef, (snapshot) => {
        loadNotifications();
    });
}

// ==================== UTILITY FUNCTIONS ====================

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.remove();
    }
});

console.log('ApnaSkills Platform Loaded Successfully!');
