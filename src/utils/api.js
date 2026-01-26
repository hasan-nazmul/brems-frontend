import axios from 'axios';

const api = axios.create({
    // Vercel uses the Env Variable. Localhost uses the fallback.
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Automatically add token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // OR 'ACCESS_TOKEN' (Check what you used in Login.jsx)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// IMPORTANT: This was missing!
export default api;