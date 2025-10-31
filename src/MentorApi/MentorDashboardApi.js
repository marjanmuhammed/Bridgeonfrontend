// import axiosInstance from "../Utils/Axios";

// const MentorDashboardApi = {
//   // Get mentor's own mentees
//   getMyMentees: async () => {
//     try {
//       const response = await axiosInstance.get('/Mentor/my-mentees');
//       console.log('Get mentees response:', response);
//       return response;
//     } catch (error) {
//       console.error('Error getting mentees:', error);
//       throw error;
//     }
//   },

//   // Create review for mentee - USING SAME ENDPOINTS AS ADMIN
//   createReview: async (menteeId, reviewData) => {
//     try {
//       console.log('Creating review API call:', { menteeId, reviewData });
//       const response = await axiosInstance.post('/UserReview/add-review', {
//         userId: menteeId, // Using userId parameter as expected by backend
//         reviewStatus: reviewData.reviewStatus,
//         reviewDate: reviewData.reviewDate ? reviewData.reviewDate.toISOString() : null
//       });
//       console.log('Create review response:', response);
//       return response;
//     } catch (error) {
//       console.error('Error creating review API:', error);
//       throw error;
//     }
//   },

//   // Update review status for mentee - USING SAME ENDPOINTS AS ADMIN
//   updateReviewStatus: async (menteeId, reviewStatus, reviewDate) => {
//     try {
//       console.log('Updating review status API call:', { menteeId, reviewStatus, reviewDate });
//       const response = await axiosInstance.put(`/UserReview/update-review-status/${menteeId}`, {
//         reviewStatus,
//         reviewDate: reviewDate ? reviewDate.toISOString() : null
//       });
//       console.log('Update review status response:', response);
//       return response;
//     } catch (error) {
//       console.error('Error updating review status API:', error);
//       throw error;
//     }
//   },

//   // Delete review for mentee - USING SAME ENDPOINTS AS ADMIN
//   deleteReview: async (menteeId) => {
//     try {
//       console.log('Deleting review API call:', menteeId);
//       const response = await axiosInstance.delete(`/UserReview/delete-review/${menteeId}`);
//       console.log('Delete review response:', response);
//       return response;
//     } catch (error) {
//       console.error('Error deleting review API:', error);
//       throw error;
//     }
//   },

//   // Get review by mentee ID - USING SAME ENDPOINTS AS ADMIN
//   getReviewByMenteeId: async (menteeId) => {
//     try {
//       console.log('Getting review API call:', menteeId);
//       const response = await axiosInstance.get(`/UserReview/${menteeId}`);
//       console.log('Get review response:', response);
//       return response;
//     } catch (error) {
//       console.error('Error getting review API:', error);
//       throw error;
//     }
//   },

//   // Add or update fees for mentee - USING SAME ENDPOINTS AS ADMIN
//   addOrUpdateFees: async (menteeId, feeData) => {
//     try {
//       console.log('Adding/updating fees API call:', { menteeId, feeData });
//       const response = await axiosInstance.post(`/UserReview/${menteeId}/fees`, {
//         feeCategory: feeData.feeCategory,
//         pendingAmount: feeData.pendingAmount,
//         dueDate: feeData.dueDate,
//         feeStatus: feeData.feeStatus
//       });
//       console.log('Add/update fees response:', response);
//       return response;
//     } catch (error) {
//       console.error('Error adding/updating fees API:', error);
//       throw error;
//     }
//   },

//   // Update fee status for mentee - USING SAME ENDPOINTS AS ADMIN
//   updateFeeStatus: async (menteeId, feeStatus) => {
//     try {
//       console.log('Updating fee status API call:', { menteeId, feeStatus });
//       const response = await axiosInstance.put(`/UserReview/${menteeId}/fee-status`, {
//         feeStatus: feeStatus
//       });
//       console.log('Update fee status response:', response);
//       return response;
//     } catch (error) {
//       console.error('Error updating fee status API:', error);
//       throw error;
//     }
//   },

//   // Delete fees for mentee - USING SAME ENDPOINTS AS ADMIN
//   deleteFees: async (menteeId) => {
//     try {
//       console.log('Deleting fees API call:', menteeId);
//       const response = await axiosInstance.delete(`/UserReview/${menteeId}/fees`);
//       console.log('Delete fees response:', response);
//       return response;
//     } catch (error) {
//       console.error('Error deleting fees API:', error);
//       throw error;
//     }
//   },

//   // Get fees by mentee ID - USING SAME ENDPOINTS AS ADMIN
//   getFeesByMenteeId: async (menteeId) => {
//     try {
//       console.log('Getting fees API call:', menteeId);
//       const response = await axiosInstance.get(`/UserReview/${menteeId}/fees`);
//       console.log('Get fees response:', response);
//       return response;
//     } catch (error) {
//       console.error('Error getting fees API:', error);
//       throw error;
//     }
//   }
// };

// export default MentorDashboardApi;



import axiosInstance from "../Utils/Axios";

const MentorDashboardApi = {
  // Get only mentor's own mentees
 getMyMentees: async () => {
  const response = await axiosInstance.get('/Mentor/my-mentees');
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
    const response = await axiosInstance.post(`/UserReview/${userId}/fees`, {
      feeCategory: feeData.feeCategory,
      pendingAmount: feeData.pendingAmount,
      dueDate: feeData.dueDate,
      feeStatus: feeData.feeStatus
    });
    return response.data;
  },

  // Update fee status
  updateFeeStatus: async (userId, feeStatus) => {
    const response = await axiosInstance.put(`/UserReview/${userId}/fee-status`, {
      feeStatus: feeStatus
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

export default MentorDashboardApi;