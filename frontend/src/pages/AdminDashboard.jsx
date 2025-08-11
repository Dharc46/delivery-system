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
            }
        };
        fetchData();
    }, []);

    if (!stats) {
        return (
            <div style={{
                padding: '2rem',
                color: 'white',
                textAlign: 'center',
                fontSize: '1.2rem'
            }}>
                ⏳ Đang tải dữ liệu...
            </div>
        );
    }

    return (
        <div style={{ 
            padding: '2rem',
            color: 'white',
            minHeight: '100vh'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
                
                <h2 style={{ 
                    color: 'white',
                    fontSize: '2.2rem',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    fontWeight: '900',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span style={{
                        fontSize: '2.5rem',
                        color: '#3498db',
                        textShadow: '0 0 15px rgba(52, 152, 219, 0.8)',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
                    }}>
                        📊
                    </span>
                    <span style={{
                        background: 'linear-gradient(135deg, #3498db, #9b59b6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 30px rgba(52, 152, 219, 0.8), 0 0 15px rgba(155, 89, 182, 0.6)',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
                    }}>
                        Admin Dashboard
                    </span>
                </h2>

                {/* Stats Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '1.5rem', 
                    marginBottom: '3rem' 
                }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(155, 89, 182, 0.2))',
                        border: '1px solid rgba(52, 152, 219, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <h3 style={{ 
                            color: '#3498db', 
                            margin: '0 0 0.5rem 0',
                            fontSize: '1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.2rem', color: '#3498db' }}>📦</span>
                            Tổng gói hàng
                        </h3>
                        <p style={{ 
                            color: 'white', 
                            margin: 0,
                            fontSize: '2rem',
                            fontWeight: 'bold'
                        }}>
                            {stats.totalPackages || 0}
                        </p>
                    </div>

                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.2))',
                        border: '1px solid rgba(46, 204, 113, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <h3 style={{ 
                            color: '#2ecc71', 
                            margin: '0 0 0.5rem 0',
                            fontSize: '1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.2rem', color: '#2ecc71' }}>✅</span>
                            Đã giao thành công
                        </h3>
                        <p style={{ 
                            color: 'white', 
                            margin: 0,
                            fontSize: '2rem',
                            fontWeight: 'bold'
                        }}>
                            {stats.deliveredPackages || 0}
                        </p>
                    </div>

                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(241, 196, 15, 0.2), rgba(230, 126, 34, 0.2))',
                        border: '1px solid rgba(241, 196, 15, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <h3 style={{ 
                            color: '#f1c40f', 
                            margin: '0 0 0.5rem 0',
                            fontSize: '1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.2rem', color: '#f1c40f' }}>🚛</span>
                            Đang vận chuyển
                        </h3>
                        <p style={{ 
                            color: 'white', 
                            margin: 0,
                            fontSize: '2rem',
                            fontWeight: 'bold'
                        }}>
                            {stats.inTransitPackages || 0}
                        </p>
                    </div>
                </div>

                {/* Shippers Table */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <h3 style={{ 
                        color: 'white',
                        fontSize: '1.5rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{ fontSize: '1.5rem', color: '#3498db' }}>👥</span>
                        Danh sách Shipper ({shippers.length})
                    </h3>

                    {shippers.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>📭</span>
                            Chưa có shipper nào trong hệ thống
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ 
                                width: '100%', 
                                borderCollapse: 'collapse',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.3), rgba(155, 89, 182, 0.3))'
                                    }}>
                                        <th style={{ 
                                            border: '1px solid rgba(255, 255, 255, 0.1)', 
                                            padding: '1rem',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            textAlign: 'left'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: '#3498db' }}>🆔</span>
                                                ID
                                            </span>
                                        </th>
                                        <th style={{ 
                                            border: '1px solid rgba(255, 255, 255, 0.1)', 
                                            padding: '1rem',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            textAlign: 'left'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: '#3498db' }}>👤</span>
                                                Tên đầy đủ
                                            </span>
                                        </th>
                                        <th style={{ 
                                            border: '1px solid rgba(255, 255, 255, 0.1)', 
                                            padding: '1rem',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            textAlign: 'left'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: '#3498db' }}>📱</span>
                                                Số điện thoại
                                            </span>
                                        </th>
                                        <th style={{ 
                                            border: '1px solid rgba(255, 255, 255, 0.1)', 
                                            padding: '1rem',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            textAlign: 'center'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: '#2ecc71' }}>⚡</span>
                                                Trạng thái
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shippers.map((shipper, index) => (
                                        <tr key={shipper.id} style={{
                                            backgroundColor: index % 2 === 0 
                                                ? 'rgba(255, 255, 255, 0.02)' 
                                                : 'rgba(255, 255, 255, 0.05)',
                                            transition: 'background-color 0.3s ease'
                                        }}>
                                            <td style={{ 
                                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                                padding: '0.75rem',
                                                color: '#3498db',
                                                fontWeight: 'bold'
                                            }}>
                                                #{shipper.id}
                                            </td>
                                            <td style={{ 
                                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                                padding: '0.75rem',
                                                color: 'white'
                                            }}>
                                                {shipper.fullName}
                                            </td>
                                            <td style={{ 
                                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                                padding: '0.75rem',
                                                color: 'rgba(255, 255, 255, 0.8)'
                                            }}>
                                                {shipper.phoneNumber}
                                            </td>
                                            <td style={{ 
                                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                                padding: '0.75rem',
                                                textAlign: 'center'
                                            }}>
                                                <span style={{
                                                    background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                                                    color: 'white',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Hoạt động
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;