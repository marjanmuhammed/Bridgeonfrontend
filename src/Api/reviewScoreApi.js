import axiosInstance from '../Utils/Axios';

const reviewScoreApi = {
  // Get all review scores
  getAllReviewScores: async () => {
    const response = await axiosInstance.get('/ReviewScores');
    return response.data;
  },

  // Get review score by ID
  getReviewScoreById: async (id) => {
    const response = await axiosInstance.get(`/ReviewScores/${id}`);
    return response.data;
  },

  // Get review scores by user ID
  getReviewScoresByUserId: async (userId) => {
    const response = await axiosInstance.get(`/ReviewScores/user/${userId}`);
    return response.data;
  },

  // Create new review score
  createReviewScore: async (reviewScoreData) => {
    const response = await axiosInstance.post('/ReviewScores', reviewScoreData);
    return response.data;
  },

  // Update review score
  updateReviewScore: async (id, reviewScoreData) => {
    const response = await axiosInstance.put(`/ReviewScores/${id}`, reviewScoreData);
    return response.data;
  },

  // Delete review score
  deleteReviewScore: async (id) => {
    await axiosInstance.delete(`/ReviewScores/${id}`);
  }
};

export default reviewScoreApi;