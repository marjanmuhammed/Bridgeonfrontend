import axiosInstance
 from "../Utils/Axios";
const AUTH_URL = "/Auth";

export const register = async (data) => {
  const res = await axiosInstance.post(`${AUTH_URL}/register`, data);
  return res.data; // already {status, message, data}
};

export const login = async (data) => {
  const res = await axiosInstance.post(`${AUTH_URL}/login`, data);
  return res.data; // already {status, message, data}
};

export const refreshToken = async () => {
  const res = await axiosInstance.post(`${AUTH_URL}/refresh`);
  return res.data;
};

export const logout = async () => {
  const res = await axiosInstance.post(`${AUTH_URL}/revoke`);
  return res.data;
};
