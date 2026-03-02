const API_BASE = 'http://localhost:8000/api';
let accessToken = localStorage.getItem('access_token');

// Utility for fetching with Auth headers
async function apiFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    if (response.status === 401 && accessToken) {
        // Handle Token refresh if needed
        console.warn("Unauthorized: Token might be expired.");
        logout();
        return;
    }

    return response;
}

// LOGIN Logic
async function login() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    try {
        const response = await fetch(`${API_BASE}/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            accessToken = data.access;
            checkLoginStatus();
            loadDashboard();
        } else {
            alert("Uh oh! Login failed. Check your credentials.");
        }
    } catch (error) {
        console.error("Connection error:", error);
        alert("Could not connect to the backend. Is Django running on :8000?");
    }
}

// LOGOUT
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    accessToken = null;
    checkLoginStatus();
}

// Check initial status
function checkLoginStatus() {
    const dashboard = document.getElementById('dashboard-section');
    const auth = document.getElementById('auth-section');
    const userDisp = document.getElementById('user-display');
    const logoutBtn = document.getElementById('logout-btn');

    if (accessToken) {
        dashboard.classList.remove('hidden');
        auth.classList.add('hidden');
        userDisp.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        userDisp.innerText = "Logged In";
    } else {
        dashboard.classList.add('hidden');
        auth.classList.remove('hidden');
        userDisp.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// LOAD DASHBOARD DATA
async function loadDashboard() {
    const response = await apiFetch('/dashboard/');
    if (response && response.ok) {
        const data = await response.json();
        renderDashboard(data);
    }
}

function renderDashboard(data) {
    // Profile Info
    const profileDiv = document.getElementById('profile-info');
    const profile = data.profile_summary;
    profileDiv.innerHTML = `
    <p><strong class="text-slate-900">Age:</strong> ${profile.age || 'Not set'}</p>
    <p><strong class="text-slate-900">Gender:</strong> ${profile.gender || 'Not set'}</p>
    <p><strong class="text-slate-900">Weight:</strong> ${profile.weight || '-'} kg</p>
    <p><strong class="text-slate-900">Height:</strong> ${profile.height || '-'} cm</p>
  `;

    // Goal/Progress
    document.getElementById('goal-name').innerText = profile.goal || "Healthy Living";
    document.getElementById('bmr-value').innerText = `${Math.round(data.goal_progress.bmr)} kcal`;
    document.getElementById('tdee-value').innerText = `${Math.round(data.goal_progress.tdee)} kcal`;

    // AI Insights
    if (data.ai_insight) {
        document.getElementById('insight-text').innerText = `"${data.ai_insight.behavioral_insight}"`;
        const recContainer = document.getElementById('insight-recommendations');
        recContainer.innerHTML = '';
        data.ai_insight.recommendations.forEach(rec => {
            const pill = document.createElement('span');
            pill.className = "px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200";
            pill.innerText = rec;
            recContainer.appendChild(pill);
        });
    }
}

// Initialize on page load
window.onload = () => {
    checkLoginStatus();
    if (accessToken) loadDashboard();
};
