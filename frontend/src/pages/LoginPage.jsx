import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';
import { jwtDecode } from 'jwt-decode';

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
            const role = decodedToken.role; // <--- Dòng này sẽ lấy role từ payload của token
            
            localStorage.setItem('role', role);

            console.log("Giá trị của 'role' nhận được:", role);
            console.log("Kết quả so sánh role với 'ROLE_ADMIN':", role === 'ROLE_ADMIN');

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
        <div style={{ 
            padding: '2rem', 
            maxWidth: '400px', 
            margin: 'auto', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginTop: '5rem'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'white' }}>Đăng nhập</h2>
            
            {error && (
                <div style={{ 
                    color: 'red', 
                    backgroundColor: '#ffe6e6', 
                    padding: '0.5rem', 
                    borderRadius: '4px',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'white' }}>
                        Tên đăng nhập:
                    </label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        style={{ 
                            width: '94%', 
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                        placeholder="Nhập tên đăng nhập"
                    />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'white' }}>
                        Mật khẩu:
                    </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={{ 
                            width: '94%', 
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                        placeholder="Nhập mật khẩu"
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, #3498db, #2ecc71)', // Thay đổi tại đây
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px', // Tăng độ bo tròn
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginBottom: '1rem',
                        transition: 'all 0.3s ease', // Thêm hiệu ứng chuyển động
                        boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)' // Thêm bóng đổ
                    }}
                    onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)';
                    }}
                >
                    Đăng nhập
                </button>

                <div style={{ textAlign: 'center', color: 'white' }}>
                    <p>
                        Chưa có tài khoản? {' '}
                        <Link 
                            to="/register" 
                            style={{ 
                                color: '#007bff', 
                                textDecoration: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;