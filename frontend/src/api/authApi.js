import apiClient from './api';

const login = (authData) => {
    return apiClient.post('/auth/login', authData);
};

export default {
    login,
};