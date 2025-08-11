import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phoneNumber: '',
        role: 'ROLE_SHIPPER'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.username || !formData.password || !formData.fullName || !formData.phoneNumber) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return false;
        }

        if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
            setError('Số điện thoại không hợp lệ (10-11 chữ số).');
            return false;
        }

        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const registerData = {
                username: formData.username,
                password: formData.password,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                role: formData.role
            };

            await authApi.register(registerData);
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Đăng ký thất bại. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        color: '#333',
        transition: 'all 0.3s ease',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const focusStyle = {
        borderColor: '#3498db',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)'
    };

    return (
        <div style={{ 
            padding: '2rem', 
            maxWidth: '500px', 
            margin: 'auto', 
            marginTop: '2rem',
            background: 'rgba(255, 255, 255, 0)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.3),
                0 0 0 1px rgba(255, 255, 255, 0.1) inset
            `,
        }}>
            <h2 style={{ 
                textAlign: 'center', 
                marginBottom: '1.5rem',
                color: 'white',
                fontSize: '2rem',
                fontWeight: '600'
            }}>
                🚀 Đăng ký tài khoản
            </h2>
            
            {error && (
                <div style={{ 
                    color: '#dc3545', 
                    backgroundColor: 'rgba(220, 53, 69, 0.1)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid rgba(220, 53, 69, 0.2)',
                    fontSize: '14px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '600',
                        color: 'white',
                        fontSize: '14px'
                    }}>
                        👤 Tên đăng nhập: <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                        type="text" 
                        name="username"
                        value={formData.username} 
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Nhập tên đăng nhập"
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '600',
                        color: 'white',
                        fontSize: '14px'
                    }}>
                        🏷️ Họ và tên: <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName} 
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Nhập họ và tên"
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '600',
                        color: 'white',
                        fontSize: '14px'
                    }}>
                        📱 Số điện thoại: <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                        type="tel" 
                        name="phoneNumber"
                        value={formData.phoneNumber} 
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Nhập số điện thoại (10-11 số)"
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '600',
                        color: 'white',
                        fontSize: '14px'
                    }}>
                        👨‍💼 Vai trò: <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select 
                        name="role"
                        value={formData.role} 
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            cursor: 'pointer'
                        }}
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <option value="ROLE_SHIPPER">🚚 Shipper (Nhân viên giao hàng)</option>
                        <option value="ROLE_ADMIN">👑 Admin (Quản trị viên)</option>
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '600',
                        color: 'white',
                        fontSize: '14px'
                    }}>
                        🔐 Mật khẩu: <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                        type="password" 
                        name="password"
                        value={formData.password} 
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '600',
                        color: 'white',
                        fontSize: '14px'
                    }}>
                        🔒 Xác nhận mật khẩu: <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                        type="password" 
                        name="confirmPassword"
                        value={formData.confirmPassword} 
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Nhập lại mật khẩu"
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        padding: '0.75rem',
                        background: loading ? 
                            'linear-gradient(135deg, #bdc3c7, #95a5a6)' : 
                            'linear-gradient(135deg, #2927aed6, #2ecc71)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginBottom: '1rem',
                        transition: 'all 0.3s ease',
                        boxShadow: loading ? 'none' : '0 4px 15px rgba(39, 174, 96, 0.3)'
                    }}
                    onMouseOver={(e) => {
                        if (!loading) {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(39, 174, 96, 0.4)';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!loading) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(39, 174, 96, 0.3)';
                        }
                    }}
                >
                    {loading ? '⏳ Đang đăng ký...' : '✨ Đăng ký'}
                </button>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, color: 'white', fontSize: '14px' }}>
                        Đã có tài khoản? {' '}
                        <Link 
                            to="/login" 
                            style={{ 
                                color: '#3498db', 
                                textDecoration: 'none',
                                fontWeight: '600',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.color = '#2980b9'}
                            onMouseOut={(e) => e.target.style.color = '#3498db'}
                        >
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;