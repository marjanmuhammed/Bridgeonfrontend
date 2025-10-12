import axiosInstance from "../Utils/Axios";

const adminReviewApi = {
  // Get all user profiles with images
  getAllUserProfiles: async () => {
    const response = await axiosInstance.get('/UserProfile/all-profile-images');
    return response.data;
  },

  // Create review for user
  createReview: async (userId, reviewData) => {
    const response = await axiosInstance.post('/UserReview/add-review', {
      userId,
      reviewStatus: reviewData.reviewStatus,
     reviewDate: reviewData.reviewDate ? reviewData.reviewDate.toISOString() : null

    });
    return response.data;
  },

  // Update review status
updateReviewStatus: async (userId, reviewStatus, reviewDate) => {
  const response = await axiosInstance.put(`/UserReview/update-review-status/${userId}`, {
    reviewStatus,
    reviewDate: reviewDate ? reviewDate.toISOString() : null
  });
  return response.data;
},


  // Delete review
  deleteReview: async (userId) => {
    const response = await axiosInstance.delete(`/UserReview/delete-review/${userId}`);
    return response.data;
  },

  // Get review by user ID
  getReviewByUserId: async (userId) => {
    const response = await axiosInstance.get(`/UserReview/${userId}`);
    return response.data;
  },

  // Add or update fees
  addOrUpdateFees: async (userId, feeData) => {
    const response = await axiosInstance.post(`/UserReview/${userId}/fees`, feeData);
    return response.data;
  },

  // Update fee status
  updateFeeStatus: async (userId, feeStatus) => {
    const response = await axiosInstance.put(`/UserReview/${userId}/fee-status`, {
      feeStatus
    });
    return response.data;
  },

  // Delete fees
  deleteFees: async (userId) => {
    const response = await axiosInstance.delete(`/UserReview/${userId}/fees`);
    return response.data;
  },

  // Get fees by user ID
  getFeesByUserId: async (userId) => {
    const response = await axiosInstance.get(`/UserReview/${userId}/fees`);
    return response.data;
  }
};

export default adminReviewApi;