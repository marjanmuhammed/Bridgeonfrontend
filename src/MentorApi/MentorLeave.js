import axiosInstance from '../Utils/Axios';

class LeaveRequestApi {
  // Create a new leave request
  async createLeaveRequest(leaveData) {
    try {
      console.log('📤 Sending leave request to API:', leaveData);
      const response = await axiosInstance.post('/LeaveRequest', leaveData);
      console.log('📥 API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating leave request:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  }

  // Upload proof file
  async uploadProofFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axiosInstance.post('/FileUpload/leave-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading proof file:', error);
      throw error;
    }
  }

  // Get current user's leave requests
  async getMyLeaveRequests() {
    try {
      const response = await axiosInstance.get('/LeaveRequest/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching my leave requests:', error);
      throw error;
    }
  }

  // Get pending leave requests (for admin/mentor)
  async getPendingRequests() {
    try {
      console.log('Fetching pending leave requests...');
      const response = await axiosInstance.get('/LeaveRequest/pending');
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  // ✅ NEW: Get mentor's mentees pending leave requests
  async getMentorPendingRequests() {
    try {
      console.log('🟡 Fetching mentor-specific pending requests...');
      const response = await axiosInstance.get('/LeaveRequest/mentor/pending');
      console.log('🟢 Mentor pending requests response:', response);
      console.log('🟢 Mentor pending requests data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching mentor pending requests:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  // Review leave request (approve/reject)
  async reviewRequest(reviewData) {
    try {
      const response = await axiosInstance.post('/LeaveRequest/review', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error reviewing leave request:', error);
      throw error;
    }
  }

  // Get leave request by ID
  async getLeaveRequestById(id) {
    try {
      const response = await axiosInstance.get(`/LeaveRequest/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave request by ID:', error);
      throw error;
    }
  }

  // Get current user info
  async getUserInfo() {
    try {
      const response = await axiosInstance.get('/Auth/user-info');
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  // Get mentor's mentees
  async getMyMentees() {
    try {
      const response = await axiosInstance.get('/Mentor/my-mentees');
      console.log('🟢 Mentees API Raw Response:', response);
      return response.data;
    } catch (error) {
      console.error('🔴 Error fetching mentees:', error);
      throw error;
    }
  }
}

export const leaveRequestApi = new LeaveRequestApi();