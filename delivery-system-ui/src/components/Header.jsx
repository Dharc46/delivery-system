import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <header style={{ padding: '1rem', backgroundColor: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem' }}>Delivery System</Link>
            </div>
            <nav>
                {localStorage.getItem('token') ? (
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Đăng xuất</button>
                ) : (
                    <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Đăng nhập</Link>
                )}
            </nav>
        </header>
    );
};

export default Header;