import React, { useState, useEffect } from 'react';
import shipperApi from '../api/shipperApi';

const ShipperDashboard = () => {
    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [packageId, setPackageId] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await shipperApi.getAssignedTrips();
                setTrips(response.data);
            } catch (err) {
                console.error("Lỗi khi lấy chuyến đi của shipper", err);
            }
        };
        fetchTrips();
    }, []);

    const handleUpdateStatus = async () => {
        setLoading(true);
        try {
            await shipperApi.updatePackageStatus(packageId, status, 'Ghi chú cập nhật');
            alert('Cập nhật trạng thái thành công!');
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái", err);
            alert('Có lỗi xảy ra khi cập nhật.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Bảng điều khiển Shipper</h2>
            <h3>Các chuyến giao hàng của tôi</h3>
            <ul>
                {trips.map(trip => (
                    <li key={trip.id}>Chuyến đi #{trip.id} - Trạng thái: {trip.status}</li>
                ))}
            </ul>

            <h3>Cập nhật trạng thái gói hàng</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
                <input type="text" placeholder="ID gói hàng" value={packageId} onChange={(e) => setPackageId(e.target.value)} />
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Chọn trạng thái</option>
                    <option value="PENDING">Đang chờ</option>
                    <option value="IN_TRANSIT">Đang vận chuyển</option>
                    <option value="DELIVERED">Đã giao</option>
                    <option value="FAILED">Giao thất bại</option>
                </select>
                <button onClick={handleUpdateStatus} disabled={loading}>
                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
            </div>
        </div>
    );
};

export default ShipperDashboard;