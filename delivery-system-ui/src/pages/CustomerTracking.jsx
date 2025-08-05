import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

const CustomerTracking = () => {
    const { id } = useParams();
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPackageData = async (packageId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/customer/packages/${packageId}`);
            setPackageData(response.data);
        } catch (err) {
            setError('Không tìm thấy gói hàng hoặc có lỗi xảy ra.');
            setPackageData(null);
        } finally {
            setLoading(false);
        }
    };

    // Nếu ID có trong URL, tự động fetch data
    useEffect(() => {
        if (id) {
            fetchPackageData(id);
        }
    }, [id]);

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
            <h2>Theo dõi gói hàng</h2>
            <p>Sử dụng URL dạng `/track/{id}` để theo dõi hoặc nhập ID bên dưới.</p>
            
            {/* Form nhập ID nếu cần */}

            {loading && <div>Đang tải...</div>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {packageData && (
                <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
                    <h3>Chi tiết gói hàng #{packageData.id}</h3>
                    <p><b>Trạng thái:</b> {packageData.status}</p>
                    <p><b>Thông tin người gửi:</b> {packageData.senderInfo}</p>
                    <p><b>Thông tin người nhận:</b> {packageData.receiverInfo}</p>
                    <p><b>Tiền COD:</b> {packageData.codAmount}</p>
                    {packageData.proofOfDeliveryUrl && (
                        <div>
                            <p><b>Bằng chứng giao hàng:</b></p>
                            <img src={`http://localhost:8080${packageData.proofOfDeliveryUrl}`} alt="Proof of Delivery" style={{ maxWidth: '100%' }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerTracking;