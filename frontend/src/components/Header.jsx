import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Các trang không hiển thị button đăng xuất
    const hideLogoutPages = ['/login', '/register', '/'];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const isLoggedIn = localStorage.getItem('token');
    const shouldShowLogout = isLoggedIn && !hideLogoutPages.includes(location.pathname);

    return (
        <header style={{ 
            padding: '1rem 2rem', 
            background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url('/images/HeaderBackground.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backdropFilter: 'blur(10px)',
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: '60px'
        }}>
            <div>
                <Link 
                    to="/" 
                    style={{ 
                        color: 'white', 
                        textDecoration: 'none', 
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #3498db, #9b59b6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 30px rgba(52, 152, 219, 0.5)',
                        filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span style={{
                        fontSize: '2rem',
                        background: 'none',
                        WebkitBackgroundClip: 'initial',
                        WebkitTextFillColor: 'initial',
                        color: '#3498db',
                        textShadow: '0 0 10px rgba(52, 152, 219, 0.8)',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
                    }}>
                        🚚
                    </span>
                    Delivery Management System
                </Link>
            </div>
            
            <nav>
                {shouldShowLogout && (
                    <button 
                        onClick={handleLogout} 
                        style={{ 
                            padding: '0.5rem 1.5rem',
                            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.3)';
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>🚪</span>
                        Đăng xuất
                    </button>
                )}
            </nav>
        </header>
    );
};

export default Header;