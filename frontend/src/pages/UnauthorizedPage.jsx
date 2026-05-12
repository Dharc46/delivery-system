import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthMessage from '../components/AuthMessage';
import { consumeAuthFlashMessage } from '../utils/authMessages';
import './UnauthorizedPage.css';

const UnauthorizedPage = () => {
  const location = useLocation();
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    const messageFromState = location.state?.authMessage || '';
    if (messageFromState) {
      setAuthMessage(messageFromState);
      return;
    }

    const flashMessage = consumeAuthFlashMessage();
    if (flashMessage) {
      setAuthMessage(flashMessage);
    }
  }, [location.state]);

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <AuthMessage message={authMessage} />
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
