import React from 'react';
import './AuthMessage.css';

const AuthMessage = ({ message }) => {
    if (!message) {
        return null;
    }

    return (
        <div className="auth-message-banner" role="alert" aria-live="polite">
            <span className="auth-message-label">Thông báo</span>
            <p className="auth-message-text">{message}</p>
        </div>
    );
};

export default AuthMessage;
