import axiosInstance from "../Utils/Axios";

// ✅ Get all mentors (Admin)
export const getAllMentors = async () => {
  return await axiosInstance.get("/Mentor/admin/mentors");
};

export const getAllStudents = async () => {
  return await axiosInstance.get("/Mentor/admin/users-with-mentor");
};

// ✅ Get students assigned to a mentor
export const getStudentsByMentor = async (mentorId) => {
  return await axiosInstance.get(`/Mentor/${mentorId}/mentees`);
};
// ✅ Assign mentees to mentor
export const assignMenteesToMentor = async (data) => {
  // data = { mentorId, userIds: [] }
  return await axiosInstance.post("/Mentor/assign", data);
};

// ✅ Unassign mentees from mentor
export const unassignMenteesFromMentor = async (data) => {
  // data = { mentorId, userIds: [] }
  return await axiosInstance.post("/Mentor/unassign", data);
};
