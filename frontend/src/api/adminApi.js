import apiClient from './api';

const getDashboardStats = () => {
    return apiClient.get('/admin/dashboard/stats');
};

const getAllShippers = () => {
    return apiClient.get('/admin/shippers');
};

const getAllPackages = () => {
    return apiClient.get('/admin/packages');
};

const createPackage = (packageData) => {
    return apiClient.post('/admin/packages', packageData);
};

const optimizeTrip = (tripData) => {
    return apiClient.post('/admin/delivery-trips/optimize', tripData);
};

export default {
    getDashboardStats,
    getAllShippers,
    getAllPackages,
    createPackage,
    optimizeTrip,
};