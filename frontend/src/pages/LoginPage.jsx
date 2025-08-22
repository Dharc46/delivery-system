import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';
import { jwtDecode } from 'jwt-decode';
import './LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await authApi.login({ username, password });
            const token = response.data.token;
            localStorage.setItem('token', token);

            // Giải mã token để lấy role
            const decodedToken = jwtDecode(token);
            const role = decodedToken.role;
            
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
        <div className="login-page">
            <div className="modal-container">
                <div className="modal-container-inner">
                    <h2 className="text-title">ShipNow</h2>
                    {error && (
                        <p className="paragraph" style={{ color: 'red' }}>
                            {error}
                        </p>
                    )}

                    <form className="complete-options-form" onSubmit={handleLogin}>
                        <div className="toggles-container">
                            <label className="toggle-label">
                                Tên đăng nhập:
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    className="toggle-input"
                                    placeholder="Nhập tên đăng nhập"
                                />
                            </label>
                            <label className="toggle-label">
                                Mật khẩu:
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="toggle-input"
                                    placeholder="Nhập mật khẩu"
                                />
                            </label>
                        </div>
                        <div className="accept-or-reject-all-button-row">
                            <button type="submit" className="button">
                                <span className="button-base-text button-primary-text">Đăng nhập</span>
                            </button>
                        </div>
                        <div className="bottom-menu-container">
                            <p className="bottom-menu-item">
                                Chưa có tài khoản?{' '}
                                <Link to="/register" className="bottom-menu-item">
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
