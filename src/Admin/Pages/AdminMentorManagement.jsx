import React, { useState, useEffect } from "react";
import { 
  Search, 
  Users, 
  UserPlus, 
  X, 
  Eye, 
  GraduationCap,
  UserCheck,
  UserMinus,
  Filter,
  ChevronDown,
  Mail,
  Phone,
  Calendar,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllMentors,
  getStudentsByMentor,
  assignMenteesToMentor,
  unassignMenteesFromMentor,
  getAllStudents,
} from "../../AdminApi/AdminMentor";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminMentorManagement = () => {
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mentorSearchTerm, setMentorSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [mentorStudents, setMentorStudents] = useState([]);
  const [isViewMentorModalOpen, setIsViewMentorModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("mentors");
  const [stats, setStats] = useState({
    totalMentors: 0,
    totalStudents: 0,
    assignedStudents: 0
  });

  // Toast configuration
  const showToast = (message, type = "info") => {
    const toastOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    };

    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, toastOptions);
        break;
      case "warning":
        toast.warning(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
    }
  };

  // Fetch all data
  const fetchMentorsAndStudents = async () => {
    setLoading(true);
    try {
      const { data: mentorsData } = await getAllMentors();
      const { data: studentsData } = await getAllStudents();
      
      setMentors(mentorsData);
      setFilteredMentors(mentorsData);
      setStudents(studentsData);
      setFilteredStudents(studentsData);

      // Calculate stats
      const assignedCount = studentsData.filter(student => student.mentorId).length;
      setStats({
        totalMentors: mentorsData.length,
        totalStudents: studentsData.length,
        assignedStudents: assignedCount
      });
    } catch (error) {
      console.log(error);
      showToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorsAndStudents();
  }, []);

  // Filter mentors based on search term
  useEffect(() => {
    if (mentorSearchTerm) {
      const result = mentors.filter(mentor => 
        mentor.fullName?.toLowerCase().includes(mentorSearchTerm.toLowerCase()) ||
        mentor.email?.toLowerCase().includes(mentorSearchTerm.toLowerCase()) ||
        mentor.id?.toString().includes(mentorSearchTerm)
      );
      setFilteredMentors(result);
    } else {
      setFilteredMentors(mentors);
    }
  }, [mentorSearchTerm, mentors]);

  // Filter students based on search term
  useEffect(() => {
    if (studentSearchTerm) {
      const result = students.filter(student => 
        student.fullName?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        student.id?.toString().includes(studentSearchTerm)
      );
      setFilteredStudents(result);
    } else {
      setFilteredStudents(students);
    }
  }, [studentSearchTerm, students]);

  // View mentor details and their students
  const handleViewMentor = async (mentor) => {
    setSelectedMentor(mentor);
    try {
      const { data } = await getStudentsByMentor(mentor.id);
      setMentorStudents(data);
      setIsViewMentorModalOpen(true);
    } catch (error) {
      console.log(error);
      showToast("Failed to fetch mentor students", "error");
    }
  };

  // View student details
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsStudentDetailModalOpen(true);
  };

  // Open assign modal
  const handleOpenAssignModal = (mentor) => {
    setSelectedMentor(mentor);
    setSelectedStudents([]);
    setIsAssignModalOpen(true);
  };

  // Assign students to mentor
  const handleAssignStudents = async () => {
    if (!selectedMentor || selectedStudents.length === 0) {
      showToast("Please select students to assign", "warning");
      return;
    }

    try {
      await assignMenteesToMentor({
        mentorId: selectedMentor.id,
        userIds: selectedStudents
      });
      
      showToast(`Successfully assigned ${selectedStudents.length} students to ${selectedMentor.fullName}`, "success");
      setIsAssignModalOpen(false);
      setSelectedStudents([]);
      
      // Refresh mentor students if view modal is open
      if (isViewMentorModalOpen) {
        const { data } = await getStudentsByMentor(selectedMentor.id);
        setMentorStudents(data);
      }
      
      fetchMentorsAndStudents();
    } catch (error) {
      console.log(error);
      showToast("Failed to assign students", "error");
    }
  };

  // Unassign student from mentor
  const handleUnassignStudent = async (studentId) => {
    if (!selectedMentor) return;

    try {
      await unassignMenteesFromMentor({
        mentorId: selectedMentor.id,
        userIds: [studentId]
      });

      showToast("Student unassigned successfully", "success");
      // Refresh the mentor students list
      const { data } = await getStudentsByMentor(selectedMentor.id);
      setMentorStudents(data);
      fetchMentorsAndStudents();
    } catch (error) {
      console.log(error);
      showToast("Failed to unassign student", "error");
    }
  };

  // Toggle student selection for assignment
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Get assigned students count for a mentor
  const getAssignedStudentsCount = (mentorId) => {
    return students.filter(student => student.mentorId === mentorId).length;
  };

  // Get mentor name for a student
  const getStudentMentorName = (student) => {
    if (!student.mentorId) return "Not assigned";
    const mentor = mentors.find(m => m.id === student.mentorId);
    return mentor ? mentor.fullName : "Not assigned";
  };

  // Get user initials for avatar
  const getUserInitials = (fullName) => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar color
  const getAvatarColor = (id) => {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-blue-600',
      'bg-gradient-to-r from-green-500 to-green-600',
      'bg-gradient-to-r from-purple-500 to-purple-600',
      'bg-gradient-to-r from-orange-500 to-orange-600',
      'bg-gradient-to-r from-pink-500 to-pink-600',
      'bg-gradient-to-r from-indigo-500 to-indigo-600',
    ];
    return colors[id % colors.length];
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <ToastContainer />

      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              Mentor Management
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Manage mentors and student assignments with ease
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Mentors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMentors}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Assigned</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.assignedStudents}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("mentors")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                activeTab === "mentors"
                  ? "text-purple-700 bg-purple-50 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Mentors ({mentors.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                activeTab === "students"
                  ? "text-blue-700 bg-blue-50 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserCheck className="w-4 h-4" />
                Students ({students.length})
              </div>
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Mentors Tab */}
          {activeTab === "mentors" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden"
            >
              {/* Search Bar */}
              <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search mentors by name, email, or ID..."
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white shadow-sm"
                      value={mentorSearchTerm}
                      onChange={(e) => setMentorSearchTerm(e.target.value)}
                    />
                    {mentorSearchTerm && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => setMentorSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg font-medium flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                  </motion.button>
                </div>
              </div>

              {/* Mentors Table */}
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mentor</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Assigned Students</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMentors.map((mentor, index) => (
                        <motion.tr
                          key={mentor.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50/80 transition-colors group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {mentor.profileImageUrl ? (
                                  <motion.img
                                    whileHover={{ scale: 1.1 }}
                                    className="h-12 w-12 rounded-2xl object-cover border-2 border-white shadow-md"
                                    src={mentor.profileImageUrl}
                                    alt={mentor.fullName}
                                  />
                                ) : (
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm ${getAvatarColor(mentor.id)} shadow-md`}
                                  >
                                    {getUserInitials(mentor.fullName)}
                                  </motion.div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                  {mentor.fullName}
                                </div>
                                <div className="text-sm text-gray-500">ID: {mentor.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{mentor.email}</div>
                            <div className="text-sm text-gray-500">{mentor.phone || "No phone"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg font-bold text-purple-600 mr-2">
                                {getAssignedStudentsCount(mentor.id)}
                              </span>
                              <span className="text-sm text-gray-500">students</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewMentor(mentor)}
                                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all duration-300 text-sm font-medium border border-blue-200 shadow-sm"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleOpenAssignModal(mentor)}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm font-medium shadow-lg"
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Assign
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredMentors.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <GraduationCap className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        {mentorSearchTerm ? "No mentors found matching your search" : "No mentors available"}
                      </p>
                      {mentorSearchTerm && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setMentorSearchTerm("")}
                          className="mt-4 text-purple-600 hover:text-purple-800 transition-colors font-medium px-6 py-2 bg-purple-50 rounded-xl"
                        >
                          Clear search
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden"
            >
              {/* Search Bar */}
              <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search students by name, email, or ID..."
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                    />
                    {studentSearchTerm && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => setStudentSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg font-medium flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                  </motion.button>
                </div>
              </div>

              {/* Students Table */}
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Assigned Mentor</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student, index) => (
                        <motion.tr
                          key={student.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                          onClick={() => handleViewStudent(student)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {student.profileImageUrl ? (
                                  <motion.img
                                    whileHover={{ scale: 1.1 }}
                                    className="h-12 w-12 rounded-2xl object-cover border-2 border-white shadow-md"
                                    src={student.profileImageUrl}
                                    alt={student.fullName}
                                  />
                                ) : (
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm ${getAvatarColor(student.id)} shadow-md`}
                                  >
                                    {getUserInitials(student.fullName)}
                                  </motion.div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                  {student.fullName}
                                </div>
                                <div className="text-sm text-gray-500">ID: {student.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.email}</div>
                            <div className="text-sm text-gray-500">{student.phone || "No phone"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {getStudentMentorName(student)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                student.mentorId 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}
                            >
                              {student.mentorId ? (
                                <>
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Assigned
                                </>
                              ) : (
                                "Unassigned"
                              )}
                            </motion.span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredStudents.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        {studentSearchTerm ? "No students found matching your search" : "No students available"}
                      </p>
                      {studentSearchTerm && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setStudentSearchTerm("")}
                          className="mt-4 text-blue-600 hover:text-blue-800 transition-colors font-medium px-6 py-2 bg-blue-50 rounded-xl"
                        >
                          Clear search
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* View Mentor Modal */}
      <AnimatePresence>
        {isViewMentorModalOpen && selectedMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200"
            >
              <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg"
                  >
                    <GraduationCap className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mentor Details</h2>
                    <p className="text-gray-600">Viewing details for {selectedMentor.fullName}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsViewMentorModalOpen(false)}
                  className="p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-2xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
                {/* Mentor Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Mentor Profile Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 shadow-sm">
                    <div className="flex flex-col items-center text-center mb-6">
                      {selectedMentor.profileImageUrl ? (
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-lg mb-4"
                          src={selectedMentor.profileImageUrl}
                          alt={selectedMentor.fullName}
                        />
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`h-24 w-24 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${getAvatarColor(selectedMentor.id)} mb-4 shadow-lg`}
                        >
                          {getUserInitials(selectedMentor.fullName)}
                        </motion.div>
                      )}
                      <h3 className="text-xl font-bold text-gray-900">{selectedMentor.fullName}</h3>
                      <p className="text-gray-600">Mentor ID: {selectedMentor.id}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                        <Mail className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-700">{selectedMentor.email}</span>
                      </div>
                      {selectedMentor.phone && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                          <Phone className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-700">{selectedMentor.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Card */}
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Assignment Summary</h3>
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="text-5xl font-bold text-green-600 mb-2"
                      >
                        {mentorStudents.length}
                      </motion.div>
                      <p className="text-gray-600">Assigned Students</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsViewMentorModalOpen(false);
                        handleOpenAssignModal(selectedMentor);
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-bold flex items-center justify-center gap-2 shadow-lg"
                    >
                      <UserPlus className="w-5 h-5" />
                      Manage Assignments
                    </motion.button>
                  </div>

                 
                </div>

                {/* Assigned Students */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Assigned Students</h3>
                    <span className="text-sm text-gray-500">{mentorStudents.length} students</span>
                  </div>
                  
                  {mentorStudents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mentorStudents.map((student, index) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-300 bg-white hover:shadow-md group"
                        >
                          <div 
                            className="flex items-center flex-1 cursor-pointer"
                            onClick={() => handleViewStudent(student)}
                          >
                            <div className="flex-shrink-0">
                              {student.profileImageUrl ? (
                                <motion.img
                                  whileHover={{ scale: 1.1 }}
                                  className="h-12 w-12 rounded-xl object-cover border-2 border-white shadow-sm"
                                  src={student.profileImageUrl}
                                  alt={student.fullName}
                                />
                              ) : (
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  className={`h-12 w-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(student.id)} shadow-sm`}
                                >
                                  {getUserInitials(student.fullName)}
                                </motion.div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                {student.fullName}
                              </div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleUnassignStudent(student.id)}
                            className="inline-flex items-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200 ml-4"
                          >
                            <UserMinus className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl"
                    >
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No students assigned to this mentor yet</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsViewMentorModalOpen(false);
                          handleOpenAssignModal(selectedMentor);
                        }}
                        className="mt-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium"
                      >
                        Assign students now
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {isStudentDetailModalOpen && selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-200"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <h3 className="text-xl font-bold text-gray-900">Student Details</h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsStudentDetailModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  {selectedStudent.profileImageUrl ? (
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      className="h-20 w-20 rounded-2xl object-cover border-4 border-white shadow-lg mb-4"
                      src={selectedStudent.profileImageUrl}
                      alt={selectedStudent.fullName}
                    />
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`h-20 w-20 rounded-2xl flex items-center justify-center text-white font-bold text-lg ${getAvatarColor(selectedStudent.id)} mb-4 shadow-lg`}
                    >
                      {getUserInitials(selectedStudent.fullName)}
                    </motion.div>
                  )}
                  <h4 className="text-lg font-bold text-gray-900">{selectedStudent.fullName}</h4>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                    <div className="text-sm text-gray-500 font-medium">Student ID</div>
                    <div className="font-bold text-gray-800">{selectedStudent.id}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                    <div className="text-sm text-gray-500 font-medium">Status</div>
                    <div className={`font-bold ${selectedStudent.mentorId ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedStudent.mentorId ? 'Assigned' : 'Unassigned'}
                    </div>
                  </div>
                </div>

                {selectedStudent.mentorId && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                    <div className="text-sm text-blue-600 font-medium mb-1">Current Mentor</div>
                    <div className="font-semibold text-blue-800">
                      {getStudentMentorName(selectedStudent)}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsStudentDetailModalOpen(false)}
                    className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Close
                  </motion.button>
                  {selectedStudent.mentorId && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUnassignStudent(selectedStudent.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-medium border border-red-200"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Unassign
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Students Modal */}
      <AnimatePresence>
        {isAssignModalOpen && selectedMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg"
                  >
                    <UserPlus className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Assign Students</h2>
                    <p className="text-gray-600">Assign students to {selectedMentor.fullName}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              {/* Student List - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Available Students</h3>
                  <p className="text-gray-600">
                    Select students to assign. <span className="font-bold text-green-600">
                      {selectedStudents.length} selected
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  {students.filter(student => !student.mentorId || student.mentorId === selectedMentor.id).map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 border rounded-xl transition-all duration-300 cursor-pointer ${
                        selectedStudents.includes(student.id) || student.mentorId === selectedMentor.id
                          ? 'border-green-500 bg-green-50 shadow-sm'
                          : 'border-gray-200 hover:border-green-300 hover:shadow-sm bg-white'
                      }`}
                      onClick={() => !student.mentorId && toggleStudentSelection(student.id)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {student.profileImageUrl ? (
                            <motion.img
                              whileHover={{ scale: 1.1 }}
                              className="h-10 w-10 rounded-xl object-cover border-2 border-white shadow-sm"
                              src={student.profileImageUrl}
                              alt={student.fullName}
                            />
                          ) : (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(student.id)} shadow-sm`}
                            >
                              {getUserInitials(student.fullName)}
                            </motion.div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900">{student.fullName}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                          {student.mentorId === selectedMentor.id && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1 border border-green-200">
                              Currently assigned
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-xl ${
                          selectedStudents.includes(student.id) || student.mentorId === selectedMentor.id
                            ? 'bg-green-500 text-white shadow-sm' 
                            : student.mentorId
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {selectedStudents.includes(student.id) || student.mentorId === selectedMentor.id ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                {students.filter(student => !student.mentorId || student.mentorId === selectedMentor.id).length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No available students found</p>
                  </motion.div>
                )}
              </div>

              {/* Save Button - Fixed at Bottom */}
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="border-t border-gray-200 bg-white p-6"
              >
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAssignModalOpen(false)}
                    className="flex-1 px-6 py-3.5 text-gray-600 hover:text-gray-800 transition-colors font-medium border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: selectedStudents.length > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: selectedStudents.length > 0 ? 0.98 : 1 }}
                    onClick={handleAssignStudents}
                    disabled={selectedStudents.length === 0}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Assign {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMentorManagement;