import axiosInstance from '../utils/axiosInstance';
import API_ENDPOINTS from '../constants/api';

const uploadImages = async (files, folder = 'others') => {
    try {
        const formData = new FormData();
        // The backend expects an array of files under the 'images' field
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
        
        // You could append the folder name if the backend expects it, but based on the route, it just uploads.
        formData.append('folder', folder);

        const response = await axiosInstance.post(API_ENDPOINTS.UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    } catch (error) {
        console.error('Error uploading images:', error);
        throw error;
    }
};

const uploadService = {
    uploadImages,
};

export default uploadService;
