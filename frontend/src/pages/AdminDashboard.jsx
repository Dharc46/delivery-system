import React, { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [shippers, setShippers] = useState([]);
    const [packages, setPackages] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, shippersRes, packagesRes] = await Promise.all([
                    adminApi.getDashboardStats(),
                    adminApi.getAllShippers(),
                    adminApi.getAllPackages(),
                ]);
                setStats(statsRes.data);
                setShippers(shippersRes.data);
                setPackages(packagesRes.data);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu admin", err);
                // Xử lý lỗi, ví dụ: chuyển hướng về trang đăng nhập
            }
        };
        fetchData();
    }, []);

    if (!stats) {
        return <div>Đang tải...</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Bảng điều khiển Admin</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                    <h3>Tổng gói hàng</h3>
                    <p>{stats.totalPackages}</p>
                </div>
                {/* Thêm các thống kê khác */}
            </div>

            <h3>Danh sách Shipper</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>ID</th>
                        <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Tên đầy đủ</th>
                        <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Số điện thoại</th>
                    </tr>
                </thead>
                <tbody>
                    {shippers.map(shipper => (
                        <tr key={shipper.id}>
                            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{shipper.id}</td>
                            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{shipper.fullName}</td>
                            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{shipper.phoneNumber}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Thêm phần quản lý gói hàng, tối ưu lộ trình tại đây */}
        </div>
    );
};

export default AdminDashboard;