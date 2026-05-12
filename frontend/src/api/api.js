import axios from 'axios';
import { AUTH_MESSAGES, setAuthFlashMessage } from '../utils/authMessages';

const API_URL = 'http://localhost:8080/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động thêm JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const isAuthEndpoint = (config) => {
    const url = config?.url || '';
    return url.includes('/auth/login') || url.includes('/auth/register');
};

const clearAuthState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
};

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const config = error?.config;

        if (status && !isAuthEndpoint(config) && (status === 401 || status === 403)) {
            const message =
                error?.response?.data?.message ||
                (status === 401 ? AUTH_MESSAGES.unauthorized : AUTH_MESSAGES.forbidden);
            const redirectTo = status === 401 ? '/login' : '/unauthorized';

            setAuthFlashMessage(message);

            if (status === 401) {
                clearAuthState();
            }

            if (typeof window !== 'undefined' && window.location.pathname !== redirectTo) {
                window.location.replace(redirectTo);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;