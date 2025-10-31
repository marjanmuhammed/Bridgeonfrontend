import axiosInstance from "../Utils/Axios";
const AUTH_URL = "/Auth";

export const register = async (data) => {
  const res = await axiosInstance.post(`${AUTH_URL}/register`, data);
  return res.data;
};

export const login = async (data) => {
  const res = await axiosInstance.post(`${AUTH_URL}/login`, data);
  return res.data;
};

export const refreshToken = async () => {
  const res = await axiosInstance.post(`${AUTH_URL}/refresh`);
  return res.data;
};

export const logout = async () => {
  const res = await axiosInstance.post(`${AUTH_URL}/revoke`);
  return res.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get("/ReviewScores/me");
  return response.data;
};

// ✅ Fixed changePassword function with all required fields
export const changePassword = async (data) => {
  const res = await axiosInstance.post("/UserProfile/change-password", {
    CurrentPassword: data.currentPassword,
    NewPassword: data.newPassword,
    ConfirmPassword: data.confirmPassword // Add this field
  });
  return res.data;
};