import apiClient from './api';

const login = (authData) => {
    console.log('Auth Data:', authData);
    if (!authData.username || !authData.password) {
        console.error('Thiếu username hoặc password trong authData');
        throw new Error('Dữ liệu xác thực không hợp lệ');
    }
    return apiClient.post('/auth/login', authData);
};

const register = (registerData) => {
    if (!registerData?.username || !registerData?.password) {
        throw new Error('Dữ liệu đăng ký không hợp lệ');
    }

    // Backend UserDTO hiện nhận username, password, role.
    const payload = {
        username: registerData.username,
        password: registerData.password,
        role: registerData.role,
    };

    return apiClient.post('/auth/register', payload);
};

export default {
    login,
    register,
};