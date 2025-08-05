import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await authApi.login({ username, password });
            localStorage.setItem('token', response.data.token);
            // Bạn cần thêm logic để lấy role từ response hoặc từ token
            // Hiện tại, giả định bạn có thể lấy role từ server và lưu vào localStorage
            const role = "ROLE_ADMIN"; // TODO: Thay đổi bằng cách lấy role thực tế từ API
            localStorage.setItem('role', role);

            if (role === 'ROLE_ADMIN') {
                navigate('/admin');
            } else if (role === 'ROLE_SHIPPER') {
                navigate('/shipper');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', border: '1px solid #ccc' }}>
            <h2>Đăng nhập</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Tên đăng nhập:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Mật khẩu:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.75rem', cursor: 'pointer' }}>Đăng nhập</button>
            </form>
        </div>
    );
};

export default LoginPage;