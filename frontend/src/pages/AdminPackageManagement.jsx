// src/pages/AdminPackageManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { normalizePackage } from '../adapters/packageAdapter';

const API_BASE_URL = 'http://localhost:8080/api/v1/admin/packages';

const AdminPackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(getInitialPackageState());
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState('');

  // Lấy token từ localStorage (giả sử lưu sau login)
  const getToken = () => localStorage.getItem('token') || 'your-bearer-token-here';

  function getInitialPackageState() {
    return {
      id: null,
      senderInfo: '',
      receiverInfo: '',
      latitude: '',
      longitude: '',
      packageDetails: '',
      codAmount: 0,
      status: 'PENDING',
      notes: '',
      deliveryTripId: null
    };
  }

  // Lấy tất cả packages khi load
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPackages(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy packages:', error);
      setError('Không thể lấy dữ liệu packages.');
    }
  };

  // Validate form
  const validateForm = () => {
    if (!currentPackage.senderInfo.trim()) {
      setError('Vui lòng nhập thông tin người gửi');
      return false;
    }
    if (!currentPackage.receiverInfo.trim()) {
      setError('Vui lòng nhập thông tin người nhận');
      return false;
    }
    if (!currentPackage.latitude || isNaN(parseFloat(currentPackage.latitude))) {
      setError('Vui lòng nhập tọa độ latitude hợp lệ');
      return false;
    }
    if (!currentPackage.longitude || isNaN(parseFloat(currentPackage.longitude))) {
      setError('Vui lòng nhập tọa độ longitude hợp lệ');
      return false;
    }
    if (currentPackage.codAmount < 0) {
      setError('Số tiền COD không được âm');
      return false;
    }
    setError('');
    return true;
  };

  // Tạo package mới
  const createPackage = async () => {
    if (!validateForm()) return;
    
    try {
      const payload = {
        ...currentPackage,
        latitude: parseFloat(currentPackage.latitude),
        longitude: parseFloat(currentPackage.longitude),
        codAmount: parseFloat(currentPackage.codAmount) || 0
      };
      const response = await axios.post(API_BASE_URL, payload, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPackages([...packages, response.data]);
      handleClose();
    } catch (error) {
      console.error('Lỗi khi tạo package:', error);
      setError(error.response?.data?.message || 'Không thể tạo package.');
    }
  };

  // Cập nhật package
  const updatePackage = async () => {
    if (!validateForm()) return;
    
    try {
      const payload = {
        ...currentPackage,
        latitude: parseFloat(currentPackage.latitude),
        longitude: parseFloat(currentPackage.longitude),
        codAmount: parseFloat(currentPackage.codAmount) || 0
      };
      const response = await axios.put(`${API_BASE_URL}/${currentPackage.id}`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPackages(packages.map(pkg => (pkg.id === currentPackage.id ? response.data : pkg)));
      handleClose();
    } catch (error) {
      console.error('Lỗi khi cập nhật package:', error);
      setError(error.response?.data?.message || 'Không thể cập nhật package.');
    }
  };

  // Xóa package
  const deletePackage = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa package này?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setPackages(packages.filter(pkg => pkg.id !== id));
      } catch (error) {
        console.error('Lỗi khi xóa package:', error);
        setError(error.response?.data?.message || 'Không thể xóa package.');
      }
    }
  };

  // Mở modal tạo mới
  const handleCreate = () => {
    setCurrentPackage(getInitialPackageState());
    setIsEdit(false);
    setError('');
    setShowModal(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (pkg) => {
    setCurrentPackage({
      id: pkg.id,
      senderInfo: pkg.senderInfo || '',
      receiverInfo: pkg.receiverInfo || '',
      latitude: pkg.latitude || '',
      longitude: pkg.longitude || '',
      packageDetails: pkg.packageDetails || '',
      codAmount: pkg.codAmount || 0,
      status: pkg.status || 'PENDING',
      notes: pkg.notes || '',
      deliveryTripId: pkg.deliveryTripId || null
    });
    setIsEdit(true);
    setError('');
    setShowModal(true);
  };

  // Đóng modal
  const handleClose = () => {
    setShowModal(false);
    setError('');
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updatePackage();
    } else {
      createPackage();
    }
  };

  // Thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPackage({ ...currentPackage, [name]: value });
  };

  return (
    <div className="container mt-5">
      <h2>Quản lý Packages (Admin)</h2>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      <Button variant="primary" onClick={handleCreate} className="mb-3">Tạo Package Mới</Button>
      
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Người gửi</th>
              <th>Người nhận</th>
              <th>Tọa độ</th>
              <th>Loại gói</th>
              <th>COD</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => {
              const normalized = normalizePackage(pkg);
              return (
                <tr key={pkg.id}>
                  <td>{pkg.id}</td>
                  <td>{pkg.senderInfo || '—'}</td>
                  <td>{pkg.receiverInfo || '—'}</td>
                  <td>{pkg.latitude}, {pkg.longitude}</td>
                  <td>{pkg.packageDetails || '—'}</td>
                  <td>{pkg.codAmount ? `${pkg.codAmount.toLocaleString('vi-VN')}đ` : '—'}</td>
                  <td>
                    <span className={`badge bg-${pkg.status === 'PENDING' ? 'warning' : pkg.status === 'IN_TRANSIT' ? 'info' : 'success'}`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td>
                    <Button variant="warning" size="sm" onClick={() => handleEdit(pkg)} className="me-2">Sửa</Button>
                    <Button variant="danger" size="sm" onClick={() => deletePackage(pkg.id)}>Xóa</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Modal cho tạo/cập nhật */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Cập Nhật Package' : 'Tạo Package Mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Thông tin người gửi</Form.Label>
              <Form.Control 
                type="text" 
                name="senderInfo" 
                placeholder="Ví dụ: Tên - 0123456789 - Địa chỉ"
                value={currentPackage.senderInfo} 
                onChange={handleChange} 
                required 
              />
              <Form.Text className="text-muted">Định dạng: Tên - SĐT - Địa chỉ</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Thông tin người nhận *</Form.Label>
              <Form.Control 
                type="text" 
                name="receiverInfo" 
                placeholder="Ví dụ: Tên - 0987654321 - Địa chỉ"
                value={currentPackage.receiverInfo} 
                onChange={handleChange} 
                required 
              />
              <Form.Text className="text-muted">Định dạng: Tên - SĐT - Địa chỉ</Form.Text>
            </Form.Group>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Vĩ độ (Latitude) *</Form.Label>
                <Form.Control 
                  type="number" 
                  name="latitude" 
                  placeholder="10.7769"
                  step="0.0001"
                  value={currentPackage.latitude} 
                  onChange={handleChange} 
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Kinh độ (Longitude) *</Form.Label>
                <Form.Control 
                  type="number" 
                  name="longitude" 
                  placeholder="106.7009"
                  step="0.0001"
                  value={currentPackage.longitude} 
                  onChange={handleChange} 
                  required 
                />
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Loại gói hàng</Form.Label>
              <Form.Control 
                type="text" 
                name="packageDetails" 
                placeholder="Ví dụ: Tài liệu, Thực phẩm, Điện tử..."
                value={currentPackage.packageDetails} 
                onChange={handleChange} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Số tiền COD (Nếu có)</Form.Label>
              <Form.Control 
                type="number" 
                name="codAmount" 
                placeholder="0"
                step="1000"
                min="0"
                value={currentPackage.codAmount} 
                onChange={handleChange} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select 
                name="status" 
                value={currentPackage.status} 
                onChange={handleChange}
              >
                <option value="PENDING">PENDING (Chờ xử lý)</option>
                <option value="IN_TRANSIT">IN_TRANSIT (Đang giao)</option>
                <option value="DELIVERED">DELIVERED (Đã giao)</option>
                <option value="FAILED">FAILED (Giao thất bại)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control 
                as="textarea"
                rows={3}
                name="notes" 
                placeholder="Ghi chú thêm (tùy chọn)"
                value={currentPackage.notes} 
                onChange={handleChange} 
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit">
                {isEdit ? 'Cập Nhật' : 'Tạo Mới'}
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                Hủy
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminPackageManagement;