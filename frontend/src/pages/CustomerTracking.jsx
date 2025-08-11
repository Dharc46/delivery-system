import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const CustomerTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchValue, setSearchValue] = useState('');

    // Fetch package by ID
    const fetchPackageById = async (packageId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/customer/packages/${packageId}`);
            setPackageData(response.data);
        } catch (err) {
            setError('Không tìm thấy gói hàng với ID này.');
            setPackageData(null);
        } finally {
            setLoading(false);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchValue.trim()) {
            setError('Vui lòng nhập mã gói hàng.');
            return;
        }

        fetchPackageById(searchValue.trim());
        // Update URL for direct sharing
        navigate(`/track/${searchValue.trim()}`, { replace: true });
    };

    // Format status in Vietnamese
    const getStatusText = (status) => {
        const statusMap = {
            'PENDING': 'Đang chờ xử lý',
            'IN_TRANSIT': 'Đang vận chuyển',
            'DELIVERED': 'Đã giao hàng',
            'FAILED': 'Giao hàng thất bại',
            'CANCELLED': 'Đã hủy'
        };
        return statusMap[status] || status;
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return 'Miễn phí';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Nếu ID có trong URL, tự động fetch data
    useEffect(() => {
        if (id) {
            fetchPackageById(id);
            setSearchValue(id);
        }
    }, [id]);

    return (
        <div style={{ 
            padding: '2rem', 
            maxWidth: '800px', 
            margin: 'auto',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ 
                    textAlign: 'center', 
                    color: '#2c3e50',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                }}>
                    🚚 Theo dõi gói hàng
                </h2>

                {/* Search Form */}
                <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem',
                            fontWeight: 'bold',
                            color: '#34495e'
                        }}>
                            Nhập mã gói hàng:
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="VD: 1, 2, 3..."
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '2px solid #e0e6ed',
                                    borderRadius: '8px',
                                    fontSize: '16px'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: loading ? '#bdc3c7' : '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) e.target.style.backgroundColor = '#2980b9';
                                }}
                                onMouseOut={(e) => {
                                    if (!loading) e.target.style.backgroundColor = '#3498db';
                                }}
                            >
                                {loading ? '⏳ Đang tìm...' : '🔍 Tìm kiếm'}
                            </button>
                        </div>
                    </div>

                    {/* Quick search suggestions */}
                    <div style={{ 
                        fontSize: '14px', 
                        color: '#7f8c8d',
                        backgroundColor: '#ecf0f1',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        lineHeight: '1.5'
                    }}>
                        <strong>💡 Gợi ý:</strong> Mã gói hàng được cung cấp khi tạo đơn hàng
                    </div>
                </form>

                {/* Loading */}
                {loading && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '2rem',
                        fontSize: '18px',
                        color: '#3498db'
                    }}>
                        ⏳ Đang tìm kiếm...
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ 
                        color: '#e74c3c',
                        backgroundColor: '#fdf2f2',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        marginBottom: '1rem'
                    }}>
                        ❌ {error}
                    </div>
                )}

                {/* Package Details */}
                {packageData && (
                    <div style={{
                        border: '2px solid #3498db',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <h3 style={{ 
                            color: '#2c3e50',
                            marginBottom: '1.5rem',
                            fontSize: '1.5rem'
                        }}>
                            📦 Chi tiết gói hàng #{packageData.id}
                        </h3>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {/* Status */}
                            <div style={{
                                backgroundColor: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid #e0e6ed'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>🚛 Trạng thái:</span>
                                    <span style={{
                                        backgroundColor: 
                                            packageData.status === 'DELIVERED' ? '#d4edda' :
                                            packageData.status === 'IN_TRANSIT' ? '#fff3cd' :
                                            packageData.status === 'FAILED' ? '#f8d7da' : '#e2e3e5',
                                        color:
                                            packageData.status === 'DELIVERED' ? '#155724' :
                                            packageData.status === 'IN_TRANSIT' ? '#856404' :
                                            packageData.status === 'FAILED' ? '#721c24' : '#495057',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}>
                                        {getStatusText(packageData.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Sender & Receiver Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e6ed'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>📤 Người gửi</h4>
                                    <p style={{ margin: 0, lineHeight: '1.5' }}>{packageData.senderInfo}</p>
                                </div>
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e6ed'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>📥 Người nhận</h4>
                                    <p style={{ margin: 0, lineHeight: '1.5' }}>{packageData.receiverInfo}</p>
                                </div>
                            </div>

                            {/* Package Details */}
                            {packageData.packageDetails && (
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e6ed'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>📋 Chi tiết hàng hóa</h4>
                                    <p style={{ margin: 0, lineHeight: '1.5' }}>{packageData.packageDetails}</p>
                                </div>
                            )}

                            {/* COD Amount */}
                            <div style={{
                                backgroundColor: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid #e0e6ed'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>💰 Tiền thu hộ (COD):</span>
                                    <span style={{ 
                                        fontSize: '18px', 
                                        fontWeight: 'bold',
                                        color: packageData.codAmount > 0 ? '#e74c3c' : '#27ae60'
                                    }}>
                                        {formatCurrency(packageData.codAmount)}
                                    </span>
                                </div>
                            </div>

                            {/* Notes */}
                            {packageData.notes && (
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e6ed'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>📝 Ghi chú</h4>
                                    <p style={{ margin: 0, lineHeight: '1.5' }}>{packageData.notes}</p>
                                </div>
                            )}

                            {/* Proof of Delivery */}
                            {packageData.proofOfDeliveryUrl && (
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e6ed'
                                }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>📸 Bằng chứng giao hàng</h4>
                                    <img 
                                        src={`http://localhost:8080${packageData.proofOfDeliveryUrl}`} 
                                        alt="Proof of Delivery" 
                                        style={{ 
                                            maxWidth: '100%', 
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerTracking;