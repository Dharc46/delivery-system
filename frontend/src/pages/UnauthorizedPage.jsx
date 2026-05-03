import React from 'react';
import { Link } from 'react-router-dom';
import './UnauthorizedPage.css';

const UnauthorizedPage = () => {
  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <p className="unauthorized-code">403</p>
        <h1 className="unauthorized-title">Khong du quyen truy cap</h1>
        <p className="unauthorized-message">
          Tai khoan cua ban khong co quyen de xem trang nay.
        </p>
        <div className="unauthorized-actions">
          <Link to="/" className="unauthorized-btn unauthorized-btn-primary">
            Ve trang chu
          </Link>
          <Link to="/login" className="unauthorized-btn unauthorized-btn-secondary">
            Dang nhap tai khoan khac
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
