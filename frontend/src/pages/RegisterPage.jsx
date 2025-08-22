import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    role: 'ROLE_SHIPPER',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const fe = {};

    if (!formData.username) fe.username = 'Vui lòng nhập tên đăng nhập.';
    if (!formData.fullName) fe.fullName = 'Vui lòng nhập họ và tên.';
    if (!formData.phoneNumber) fe.phoneNumber = 'Vui lòng nhập số điện thoại.';
    if (!/^[0-9]{10,11}$/.test(formData.phoneNumber || '')) {
      fe.phoneNumber = 'Số điện thoại không hợp lệ (10–11 chữ số).';
    }

    if (!formData.password) fe.password = 'Vui lòng nhập mật khẩu.';
    if (formData.password && formData.password.length < 6) {
      fe.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (!formData.confirmPassword) fe.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    if (formData.password !== formData.confirmPassword) {
      fe.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    setFieldErrors(fe);
    if (Object.keys(fe).length) {
      setError('Vui lòng kiểm tra lại các trường bị lỗi.');
      return false;
    }
    setError('');
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const registerData = {
        username: formData.username.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
      };

      await authApi.register(registerData);
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container" role="form" aria-labelledby="register-title">
        <h2 id="register-title" className="register-title">Đăng ký tài khoản</h2>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleRegister} noValidate>
          {/* Username */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Tên đăng nhập <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="username"
                type="text"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Nhập tên đăng nhập"
              />
            </div>
            {fieldErrors.username ? (
              <div className="field-error">{fieldErrors.username}</div>
            ) : (
              <div className="field-hint">Dùng 6–32 ký tự, không dấu.</div>
            )}
          </div>

          {/* Full name */}
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Họ và tên <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="fullName"
                type="text"
                name="fullName"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
                placeholder="Nhập họ và tên"
              />
            </div>
            {fieldErrors.fullName && <div className="field-error">{fieldErrors.fullName}</div>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              Số điện thoại <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                autoComplete="tel"
                pattern="[0-9]{10,11}"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Nhập số điện thoại (10–11 số)"
              />
            </div>
            {fieldErrors.phoneNumber && <div className="field-error">{fieldErrors.phoneNumber}</div>}
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Vai trò <span className="required">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="ROLE_SHIPPER">Shipper (Nhân viên giao hàng)</option>
              <option value="ROLE_ADMIN">Admin (Quản trị viên)</option>
            </select>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Ít nhất 6 ký tự"
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPw ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
          </div>

          {/* Confirm password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Xác nhận mật khẩu <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                type={showPw2 ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Nhập lại mật khẩu"
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPw2((v) => !v)}
                aria-label={showPw2 ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPw2 ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <div className="field-error">{fieldErrors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? 'disabled' : ''}`}
            aria-busy={loading}
          >
            {loading ? '⏳ Đang đăng ký...' : 'Đăng ký'}
          </button>

          <div className="login-link-container">
            <p className="login-text">
              Đã có tài khoản?
              <Link to="/login" className="login-link">Đăng nhập ngay</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
