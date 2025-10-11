import axiosInstance from "../Utils/Axios";

export const getAllUsers = async () => {
  return await axiosInstance.get("/admin/users");
};

export const getAllProfileImages = async () => {
  return await axiosInstance.get("/UserProfile/all-profile-images");
};

// In AdminProfile.js - FIXED VERSION
export const getUserProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/Profiles/user/${userId}`);
    // The API returns the profile data directly, not nested in data property
    return response.data; // This is already the profile object
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`Profile not found for user ${userId}`);
      return null;
    }
    throw error;
  }
};

export const getProfileDetails = async (userId) => {
  try {
    const response = await axiosInstance.get(`/Profiles/user/${userId}`);
    return response.data; // Direct return of profile data
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Return null instead of empty object
    }
    throw error;
  }
};
export const createProfile = async (profileData) => {
  const response = await axiosInstance.post("/Profiles", profileData);
  return response.data;
};

export const updateProfile = async (userId, profileData) => {
  // Use the same endpoint structure as your API documentation
  const response = await axiosInstance.put(`/Profiles/${userId}`, profileData);
  return response.data;
};

export const deleteProfile = async (profileId) => {
  await axiosInstance.delete(`/Profiles/${profileId}`);
};


///////////////////////////////////


// Add this function to get current user's profile
export const getMyProfile = async () => {
  try {
    const response = await axiosInstance.get("/Profiles/my-profile");
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn("Profile not found for current user");
      return null;
    }
    throw error;
  }
};