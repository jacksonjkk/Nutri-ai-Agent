
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const getAuthToken = () => localStorage.getItem('access_token');

export const login = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            return { success: true };
        }
        return { success: false, error: data.detail || 'Login failed' };
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
};

export const signup = async (email: string, username: string, password: string, additionalData: any = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/signup/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password, ...additionalData })
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true };
        }

        let errorMsg = 'Signup failed';
        if (typeof data === 'object') {
            const firstKey = Object.keys(data)[0];
            const firstError = data[firstKey];
            errorMsg = Array.isArray(firstError) ? `${firstKey}: ${firstError[0]}` : (data.detail || errorMsg);
        }

        return { success: false, error: errorMsg };
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
};

export const getVHTDashboard = async () => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/vht/dashboard/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        return null;
    }
};

export const registerIndividual = async (userData: any) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/vht/register-user/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        return await response.json();
    } catch (error) {
        return { error: 'Failed to register individual' };
    }
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

export const getMe = async () => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            logout();
            window.location.reload();
            return null;
        }
        return await response.json();
    } catch (error) {
        return null;
    }
};

export const completeOnboarding = async (onboardingData: any) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/onboarding/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(onboardingData)
        });
        return await response.json();
    } catch (error) {
        return { error: 'Failed to save onboarding data' };
    }
};

export const generateNutritionAdvice = async (prompt: string, userProfile?: any) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/chat/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: prompt })
        });
        const data = await response.json();
        if (response.status === 401) {
            logout();
            window.location.reload();
        }
        return data.reply || "I am analyzing your data. Please log your meals to get specific advice!";
    } catch (error) {
        console.error("Backend Error:", error);
        return "I am having trouble connecting to the NutriAgent backend.";
    }
};

export const getMealPlan = async (userProfile: any) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/meal-plan/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status === 401) {
            logout();
            window.location.reload();
        }
        return await response.json();
    } catch (error) {
        console.error("Meal Plan Error:", error);
        return null;
    }
};
export const saveDailyLog = async (logData: any) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/logs/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(logData)
        });
        return await response.json();
    } catch (error) {
        return { error: 'Failed to save daily log' };
    }
};

export const getDailyLogs = async () => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/logs/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        return [];
    }
};
