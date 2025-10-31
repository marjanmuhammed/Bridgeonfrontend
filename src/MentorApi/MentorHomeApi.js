import axiosInstance from "../Utils/Axios";

// Get mentor's own mentees
export const getMyMentees = () => {
  return axiosInstance.get('/Mentor/my-mentees');
};

// Get mentees for specific mentor (for admin or the mentor themselves)
export const getMenteesForMentor = (mentorId) => {
  return axiosInstance.get(`/Mentor/${mentorId}/mentees`);
};

// Get all mentors (admin only)
export const getAllMentors = () => {
  return axiosInstance.get('/Mentor/admin/mentors');
};

// Get all users with mentor info (admin only)
export const getAllUsersWithMentor = () => {
  return axiosInstance.get('/Mentor/admin/users-with-mentor');
};

// Assign mentees to mentor (admin only)
export const assignMentees = (assignData) => {
  return axiosInstance.post('/Mentor/assign', assignData);
};

// Unassign mentees from mentor (admin only)
export const unassignMentees = (unassignData) => {
  return axiosInstance.post('/Mentor/unassign', unassignData);
};

export default {
  getMyMentees,
  getMenteesForMentor,
  getAllMentors,
  getAllUsersWithMentor,
  assignMentees,
  unassignMentees
};