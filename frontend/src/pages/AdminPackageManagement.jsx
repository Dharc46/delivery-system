// src/pages/AdminPackageManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = 'http://localhost:8080/api/v1/admin/packages'; // Thay đổi nếu cần

const AdminPackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState({ id: null, name: '', description: '', status: '' });
  const [isEdit, setIsEdit] = useState(false);

  // Lấy token từ localStorage (giả sử lưu sau login)
  const getToken = () => localStorage.getItem('token') || 'your-bearer-token-here';

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
      alert('Không thể lấy dữ liệu packages.');
    }
  };

  // Tạo package mới
  const createPackage = async () => {
    try {
      const response = await axios.post(API_BASE_URL, currentPackage, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPackages([...packages, response.data]);
      handleClose();
    } catch (error) {
      console.error('Lỗi khi tạo package:', error);
      alert('Không thể tạo package.');
    }
  };

  // Cập nhật package
  const updatePackage = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${currentPackage.id}`, currentPackage, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPackages(packages.map(pkg => (pkg.id === currentPackage.id ? response.data : pkg)));
      handleClose();
    } catch (error) {
      console.error('Lỗi khi cập nhật package:', error);
      alert('Không thể cập nhật package.');
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
        alert('Không thể xóa package.');
      }
    }
  };

  // Mở modal tạo mới
  const handleCreate = () => {
    setCurrentPackage({ id: null, name: '', description: '', status: '' });
    setIsEdit(false);
    setShowModal(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (pkg) => {
    setCurrentPackage(pkg);
    setIsEdit(true);
    setShowModal(true);
  };

  // Đóng modal
  const handleClose = () => {
    setShowModal(false);
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
    setCurrentPackage({ ...currentPackage, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-5">
      <h2>Quản lý Packages (Admin)</h2>
      <Button variant="primary" onClick={handleCreate} className="mb-3">Tạo Package Mới</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {packages.map(pkg => (
            <tr key={pkg.id}>
              <td>{pkg.id}</td>
              <td>{pkg.name}</td>
              <td>{pkg.description}</td>
              <td>{pkg.status}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(pkg)} className="me-2">Sửa</Button>
                <Button variant="danger" size="sm" onClick={() => deletePackage(pkg.id)}>Xóa</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal cho tạo/cập nhật */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Cập Nhật Package' : 'Tạo Package Mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control type="text" name="name" value={currentPackage.name} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control type="text" name="description" value={currentPackage.description} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Control type="text" name="status" value={currentPackage.status} onChange={handleChange} required />
            </Form.Group>
            <Button variant="primary" type="submit">Lưu</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminPackageManagement;