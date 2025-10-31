import axiosInstance from '../Utils/Axios';

const userApi = {
  getAllUsers: async () => {
     const response = await axiosInstance.get('/admin/users'); // Fixed endpoint
    return response.data;
  },

  getUserById: async (id) => {
     const response = await axiosInstance.get(`/admin/user/${id}`);
    return response.data;
  }
};

export default userApi;