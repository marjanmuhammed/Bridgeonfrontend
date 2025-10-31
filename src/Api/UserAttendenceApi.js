import axiosInstance from '../Utils/Axios';

export const UserAttendenceApi = {
  // Get user's attendance records
  getMyAttendances: async () => {
    try {
      const response = await axiosInstance.get('/Attendance/my-attendances');
      return response.data;
    } catch (error) {
      console.error('Error fetching attendances:', error);
      throw error;
    }
  }
};

export default UserAttendenceApi;