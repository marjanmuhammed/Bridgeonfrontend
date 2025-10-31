// src/MentorApi/MentorProfile.js
import axiosInstance from "../Utils/Axios";

// Get mentor's own mentees
export const getMyMentees = async () => {
  try {
    const response = await axiosInstance.get('/Mentor/my-mentees');
    return response.data;
  } catch (error) {
    console.error("Error fetching mentees:", error);
    throw error;
  }
};

// Get profile for a specific mentee
export const getMenteeProfile = async (menteeId) => {
  try {
    const response = await axiosInstance.get(`/Profiles/user/${menteeId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Create profile for mentee
export const createMenteeProfile = async (profileData) => {
  const response = await axiosInstance.post("/Profiles", profileData);
  return response.data;
};

// Update profile for mentee
export const updateMenteeProfile = async (userId, profileData) => {
  const response = await axiosInstance.put(`/Profiles/${userId}`, profileData);
  return response.data;
};

// Delete profile for mentee
export const deleteMenteeProfile = async (profileId) => {
  await axiosInstance.delete(`/Profiles/${profileId}`);
};

// Get all profile images for mentees
export const getMenteesProfileImages = async () => {
  try {
    const response = await axiosInstance.get("/UserProfile/all-profile-images");
    return response.data;
  } catch (error) {
    console.error("Error fetching profile images:", error);
    return { data: [] };
  }
};