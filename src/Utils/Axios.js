import axios  from "axios";


const axiosInstance = axios.create({
  baseURL: "https://bridgeonbackend.onrender.com",
  timeout: 60000,
  withCredentials: true, // ✅ cookies attach automatically
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    config.withCredentials = true; // attach cookies
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry &&
        !originalRequest.url.includes('/Auth/refresh')) {
      
      originalRequest._retry = true;

      try {
        await axiosInstance.post('/Auth/refresh'); // refresh cookie
        return axiosInstance(originalRequest); // retry original request
      } catch (err) {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
