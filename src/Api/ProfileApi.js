// ProfileApi.js
import axiosInstance from "../Utils/Axios";

const BASE_URL = '/UserProfile';

// In ProfileApi.js - FIXED version
const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post('/Upload/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true
  });

  return response.data.data; // updated profile image URL from DB
};
const updateProfileImage = async (imageUrl) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/profile-image`, { imageUrl });
    return response.data;
  } catch (error) {
    console.error('API Error: ', error.response?.data || error.message);
    throw error;
  }
};


const getProfile = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/profile`);
    return response.data;
  } catch (error) {
    console.error('Get Profile Error:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ Export all functions
export default {
  uploadProfileImage,
  updateProfileImage,
  getProfile,
};