import axiosInstance from "../Utils/Axios";

// Add new user
export const addUser = async (data) => {
  return await axiosInstance.post("/admin/add-user", data);
};

// Get all users
export const getAllUsers = async () => {
  return await axiosInstance.get("/admin/users");
};

// Remove user
export const removeUser = async (id) => {
  return await axiosInstance.delete(`/admin/remove-user/${id}`);
};

// Block user
export const blockUser = async (id) => {
  return await axiosInstance.patch(`/admin/block-user/${id}`);
};

// Unblock user
export const unblockUser = async (id) => {
  return await axiosInstance.patch(`/admin/unblock-user/${id}`);
};

// Update user role
export const updateUserRole = async (id, data) => {
  return await axiosInstance.patch(`/admin/update-role/${id}`, data);
};

// Get all profile images
export const getAllProfileImages = async () => {
  return await axiosInstance.get("/UserProfile/all-profile-images");
};

