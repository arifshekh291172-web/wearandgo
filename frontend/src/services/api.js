import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject token if stored in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wear_and_go_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (localStorage.getItem('wear_and_go_token')) {
        localStorage.removeItem('wear_and_go_token');
        localStorage.removeItem('wear_and_go_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
