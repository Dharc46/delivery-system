import apiClient from './api';

const getAssignedTrips = () => {
    return apiClient.get('/shipper/trips');
};

const getTripDetails = (tripId) => {
    return apiClient.get(`/shipper/trips/${tripId}`);
};

const updatePackageStatus = (packageId, status, notes) => {
    return apiClient.put(`/shipper/${packageId}/status`, null, {
        params: { status, notes }
    });
};

const uploadProofImage = (packageId, proofImage) => {
    const formData = new FormData();
    formData.append('proofImage', proofImage);
    return apiClient.put(`/shipper/${packageId}/upload-proof`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export default {
    getAssignedTrips,
    getTripDetails,
    updatePackageStatus,
    uploadProofImage,
};