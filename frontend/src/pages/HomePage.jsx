import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './HomePage.css';

const HomePage = () => {
  const { pathname } = useLocation();

  // Cuộn lên đầu trang khi tải, với setTimeout để đảm bảo chạy sau render
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    scrollToTop();
    // Thêm setTimeout để đảm bảo chạy sau khi trang render hoàn tất
    const timer = setTimeout(scrollToTop, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Animation variants cho hiệu ứng trôi từ dưới lên
  const revealVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  // Variants cho các thẻ tính năng và số liệu (có độ trễ)
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.2 },
    }),
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.h1
            className="text-title"
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            layout // Ngăn nhảy nội dung
          >
            Tối ưu hóa giao hàng chặng cuối với AI
          </motion.h1>
          <motion.p
            className="paragraph"
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            layout
          >
            Tăng hiệu quả, giảm chi phí, và mang lại trải nghiệm giao hàng vượt trội với nền tảng quản lý thông minh.
          </motion.p>
          <motion.div
            className="cta-buttons"
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            layout
          >
            <Link to="/register" className="button button-primary">
              Bắt đầu miễn phí
            </Link>
          </motion.div>
        </div>
        <motion.div
          className="hero-image"
          variants={revealVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          layout
        >
          <img
            src="images/delivery-map.jpg"
            alt="Delivery Map"
            className="rounded-lg shadow-lg"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <motion.h2
          className="text-title text-center"
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          Tính năng nổi bật
        </motion.h2>
        <div className="features-grid">
          {[
            {
              title: 'Tối ưu hóa tuyến đường',
              description:
                'Sử dụng thuật toán AI để gom nhóm đơn hàng và tạo tuyến đường hiệu quả, tiết kiệm thời gian và chi phí.',
            },
            {
              title: 'Theo dõi thời gian thực',
              description:
                'Cung cấp vị trí tài xế và trạng thái đơn hàng theo thời gian thực cho cả quản trị viên và khách hàng.',
            },
            {
              title: 'Báo cáo thông minh',
              description:
                'Phân tích hiệu suất giao hàng với báo cáo trực quan, xuất Excel/PDF dễ dàng.',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h3 className="feature-title">{feature.title}</h3>
              <p className="paragraph">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <motion.h2
          className="text-title text-center"
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          Số liệu ấn tượng
        </motion.h2>
        <div className="stats-grid">
          {[
            { number: '10K+', text: 'Đơn hàng được giao mỗi ngày' },
            { number: '95%', text: 'Tỷ lệ giao hàng đúng hạn' },
            { number: '500+', text: 'Doanh nghiệp tin dùng' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="stat-item"
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h3 className="stat-number">{stat.number}</h3>
              <p className="paragraph">{stat.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.h2
          className="text-title text-center"
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          Sẵn sàng tối ưu hóa giao hàng?
        </motion.h2>
        <motion.p
          className="paragraph text-center"
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3, delay: 0.2 }}
        >
          Tham gia ngay để trải nghiệm nền tảng quản lý giao hàng hiện đại nhất.
        </motion.p>
        <motion.div
          className="mx-auto"
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3, delay: 0.4 }}
        >
          <Link to="/register" className="button button-primary">
            Đăng ký ngay
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;