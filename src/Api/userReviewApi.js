import axiosInstance from '../Utils/Axios';

export const userReviewApi = {
  // Get current user's reviews
  getMyReviews: async () => {
    const response = await axiosInstance.get('/UserReview/my-reviews');
    return response.data;
  }
};