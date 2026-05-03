import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import ShipperDashboard from './pages/ShipperDashboard';
import CustomerTracking from './pages/CustomerTracking';
import HomePage from './pages/HomePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

// Define the animation variants for the original page transitions (slide)
const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100vw",
    scale: 0.8
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: "100vw",
    scale: 1.2
  }
};

// Define the transition properties for the original slide effect
const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

// Component màn hình loading
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <p className="loading-text">Đang tải...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <RouterWrapper />
    </BrowserRouter>
  );
}

// Tạo một component wrapper riêng để sử dụng hook useLocation
function RouterWrapper() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Cuộn lên đầu trang và kích hoạt loading khi thay đổi route
  useEffect(() => {
    setIsLoading(true);
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    scrollToTop();
    const timer = setTimeout(() => setIsLoading(false), 500); // Thời gian loading: 500ms
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingScreen key="loading" />
          ) : (
            <Routes location={location} key={location.pathname}>
              {/* Giữ lại hiệu ứng trượt sang hai bên cho Login và Register */}
              <Route 
                path="/login" 
                element={
                  <motion.div
                    key="login-page"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    layout
                  >
                    <LoginPage />
                  </motion.div>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <motion.div
                    key="register-page"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    layout
                  >
                    <RegisterPage />
                  </motion.div>
                } 
              />
              
              {/* Không sử dụng hiệu ứng cho Admin Dashboard */}
              <Route 
                path="/admin" 
                element={
                  <PrivateRoute roles={['ROLE_ADMIN']}>
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/shipper" 
                element={
                  <PrivateRoute roles={['ROLE_SHIPPER']}>
                    <motion.div
                      key="shipper-dashboard"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                      layout
                    >
                      <ShipperDashboard />
                    </motion.div>
                  </PrivateRoute>
                } 
              />
              <Route
                path="/"
                element={
                  <motion.div
                    key="home-page"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    layout
                  >
                    <HomePage />
                  </motion.div>
                }
              />
              <Route
                path="/unauthorized"
                element={
                  <motion.div
                    key="unauthorized-page"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    layout
                  >
                    <UnauthorizedPage />
                  </motion.div>
                }
              />
              {/* Các route không có hiệu ứng chuyển cảnh */}
              <Route path="/track" element={<CustomerTracking />} />
              <Route path="/track/:id" element={<CustomerTracking />} />
              <Route path="/features/route-optimization" element={<div>Tối ưu hóa tuyến đường - Đang phát triển</div>} />
              <Route path="/features/real-time-tracking" element={<div>Theo dõi thời gian thực - Đang phát triển</div>} />
              <Route path="/features/reporting" element={<div>Báo cáo thông minh - Đang phát triển</div>} />
            </Routes>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;