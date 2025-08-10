import apiClient from './api';

const login = (authData) => {
    console.log('Auth Data:', authData);
    if (!authData.username || !authData.password) {
        console.error('Thiếu username hoặc password trong authData');
        throw new Error('Dữ liệu xác thực không hợp lệ');
    }
    return apiClient.post('/auth/login', authData);
};

export default {
    login,
};