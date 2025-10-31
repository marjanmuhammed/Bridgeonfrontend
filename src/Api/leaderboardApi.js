// Api/leaderboardApi.js
import axiosInstance from '../Utils/Axios';

const leaderboardApi = {
  getLeaderboard: async () => {
    const response = await axiosInstance.get('/Leaderboard');
    return response.data;
  },

  getTopUsers: async (count = 3) => {
    const response = await axiosInstance.get(`/Leaderboard/top/${count}`);
    return response.data;
  },

  getMyPosition: async () => {
    const response = await axiosInstance.get('/Leaderboard/my-position');
    return response.data;
  },

  getDetailedLeaderboard: async () => {
    const response = await axiosInstance.get('/Leaderboard/detailed');
    return response.data;
  },

  getLatestLeaderboard: async () => {
    const response = await axiosInstance.get('/Leaderboard/latest');
    return response.data;
  },

  getMentorMentees: async () => {
    const response = await axiosInstance.get('/Leaderboard/mentor-mentees');
    return response.data;
  },

  // Debug endpoint
  debug: async () => {
    const response = await axiosInstance.get('/Leaderboard/debug');
    return response.data;
  },

  getAllProfileImages: async () => {
    const response = await axiosInstance.get('/UserProfile/all-profile-images');
    return response.data;
  }
};

export default leaderboardApi;