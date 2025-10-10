import axiosInstance from "../Utils/Axios";

export const getAllUsers = async () => {
  return await axiosInstance.get("/admin/users");
};

export const getAllProfileImages = async () => {
  return await axiosInstance.get("/UserProfile/all-profile-images");
};

export const getUserProfile = async (userId) => {
  const response = await axiosInstance.get(`/Profiles/user/${userId}`);
  return response.data;
};

export const createProfile = async (profileData) => {
  const response = await axiosInstance.post("/Profiles", profileData);
  return response.data;
};

export const updateProfile = async (userId, profileData) => {
  const response = await axiosInstance.put(`/Profiles/${userId}`, profileData);
  return response.data;
};

export const deleteProfile = async (profileId) => {
  await axiosInstance.delete(`/Profiles/${profileId}`);
};