// Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Các trang không hiển thị nút Sign Out
  const hideLogoutPages = ['/login', '/register', '/'];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const isLoggedIn = localStorage.getItem('token');
  const shouldShowLogout = isLoggedIn && !hideLogoutPages.includes(location.pathname);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFeatureClick = (featurePath) => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      navigate(featurePath);
    }
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="header-container">
      <div className="logo-container">
        <Link to="/" className="logo-link">
          <img src="/images/logo.png" alt="Logo" className="logo-icon" />
        </Link>
      </div>

      <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
        <button className="hamburger" onClick={toggleMenu}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <ul className="nav-links">
          <li className="dropdown">
            <button className="button button-secondary dropdown-toggle" onClick={toggleDropdown}>
              Tính năng
            </button>
            <ul className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleFeatureClick('/features/route-optimization')}
                >
                  Tối ưu hóa tuyến đường
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleFeatureClick('/features/real-time-tracking')}
                >
                  Theo dõi thời gian thực
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleFeatureClick('/features/reporting')}
                >
                  Báo cáo thông minh
                </button>
              </li>
            </ul>
          </li>

          <li>
            <Link to="/contact" className="button button-secondary">Liên hệ</Link>
          </li>

          <li>
            {isLoggedIn ? (
              shouldShowLogout && (
                <button onClick={handleLogout} className="button button-secondary">
                  Đăng xuất
                </button>
              )
            ) : (
              <Link to="/login" className="button button-secondary">
                Đăng nhập
              </Link>
            )}
          </li>

          {/* Chỉ hiển thị Đăng ký khi CHƯA đăng nhập */}
          {!isLoggedIn && (
            <li>
              <Link to="/register" className="button button-primary">
                Đăng ký
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
