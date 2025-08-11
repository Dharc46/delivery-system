import React, { useState, useEffect } from 'react';
import shipperApi from '../api/shipperApi';

const ShipperDashboard = () => {
    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [packageId, setPackageId] = useState('');
    const [status, setStatus] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchTrips = async () => {
            setLoading(true);
            try {
                const response = await shipperApi.getAssignedTrips();
                setTrips(response.data);
            } catch (err) {
                console.error("Lỗi khi lấy chuyến đi của shipper", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    const handleUpdateStatus = async () => {
        if (!packageId.trim()) {
            alert('Vui lòng nhập ID gói hàng!');
            return;
        }
        if (!status) {
            alert('Vui lòng chọn trạng thái!');
            return;
        }

        setUpdateLoading(true);
        try {
            await shipperApi.updatePackageStatus(packageId, status, 'Ghi chú cập nhật từ shipper');
            alert('✅ Cập nhật trạng thái thành công!');
            setPackageId('');
            setStatus('');
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái", err);
            alert('❌ Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.');
        } finally {
            setUpdateLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'DELIVERED': return '#2ecc71';
            case 'IN_TRANSIT': return '#f1c40f';
            case 'PENDING': return '#3498db';
            case 'FAILED': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'PENDING': '⏳ Đang chờ xử lý',
            'IN_TRANSIT': '🚛 Đang vận chuyển',
            'DELIVERED': '✅ Đã giao hàng',
            'FAILED': '❌ Giao hàng thất bại',
            'CANCELLED': '🚫 Đã hủy'
        };
        return statusMap[status] || status;
    };

    return (
        <div style={{ 
            padding: '2rem',
            color: 'white',
            minHeight: '100vh'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
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
                    background: 'linear-gradient(135deg, #f1c40f, #e67e22)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(241, 196, 15, 0.5)'
                }}>
                    🚚 Bảng điều khiển Shipper
                </h2>

                {/* Trips Section */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ 
                        color: 'white',
                        fontSize: '1.5rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        📋 Các chuyến giao hàng của tôi
                    </h3>

                    {loading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '1.1rem'
                        }}>
                            ⏳ Đang tải danh sách chuyến đi...
                        </div>
                    ) : trips.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '1.1rem'
                        }}>
                            📭 Chưa có chuyến giao hàng nào được phân công
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {trips.map(trip => (
                                <div key={trip.id} style={{
                                    background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1))',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(155, 89, 182, 0.2))';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1))';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong style={{ color: 'white', fontSize: '1.1rem' }}>
                                                🚛 Chuyến đi #{trip.id}
                                            </strong>
                                        </div>
                                        <span style={{
                                            background: getStatusColor(trip.status),
                                            color: 'white',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {getStatusText(trip.status)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Update Status Section */}
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
                        🔄 Cập nhật trạng thái gói hàng
                    </h3>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1rem', 
                        marginBottom: '1.5rem'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: '600'
                            }}>
                                📦 ID gói hàng:
                            </label>
                            <input 
                                type="text" 
                                placeholder="Nhập ID gói hàng (VD: 1, 2, 3...)" 
                                value={packageId} 
                                onChange={(e) => setPackageId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    color: '#333',
                                    outline: 'none',
                                    transition: 'border-color 0.3s ease',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3498db'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: '600'
                            }}>
                                📊 Trạng thái mới:
                            </label>
                            <select 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    color: '#333',
                                    outline: 'none',
                                    transition: 'border-color 0.3s ease',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3498db'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                            >
                                <option value="">-- Chọn trạng thái --</option>
                                <option value="PENDING">⏳ Đang chờ xử lý</option>
                                <option value="IN_TRANSIT">🚛 Đang vận chuyển</option>
                                <option value="DELIVERED">✅ Đã giao hàng</option>
                                <option value="FAILED">❌ Giao hàng thất bại</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleUpdateStatus} 
                        disabled={updateLoading || !packageId.trim() || !status}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1.5rem',
                            background: updateLoading || !packageId.trim() || !status ?
                                'linear-gradient(135deg, #bdc3c7, #95a5a6)' :
                                'linear-gradient(135deg, #3498db, #2980b9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: updateLoading || !packageId.trim() || !status ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: updateLoading || !packageId.trim() || !status ? 
                                'none' : 
                                '0 4px 15px rgba(52, 152, 219, 0.3)'
                        }}
                        onMouseOver={(e) => {
                            if (!updateLoading && packageId.trim() && status) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!updateLoading && packageId.trim() && status) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)';
                            }
                        }}
                    >
                        {updateLoading ? '⏳ Đang cập nhật...' : '🔄 Cập nhật trạng thái'}
                    </button>

                    {/* Help text */}
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: 'rgba(52, 152, 219, 0.1)',
                        border: '1px solid rgba(52, 152, 219, 0.2)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        lineHeight: '1.5'
                    }}>
                        💡 <strong>Hướng dẫn:</strong> Nhập ID gói hàng và chọn trạng thái mới để cập nhật. 
                        ID gói hàng có thể tìm thấy trong danh sách chuyến giao hàng được phân công.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipperDashboard;