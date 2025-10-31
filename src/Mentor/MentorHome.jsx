import React, { useState, useEffect } from "react";
import { 
  Users, 
  ClipboardList, 
  CalendarDays, 
  FileCheck, 
  Search,
  X,
  CheckCircle,
  PieChart as PieChartIcon,
  BarChart3,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Camera,
  Edit,
  Save,
  Lock
} from "lucide-react";
import { getMyMentees } from "../MentorApi/MentorHomeApi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import UserProfileApi from "../Api/ProfileApi";
import axiosInstance from "../Utils/Axios";
import HomePage from "../Auth/Home";

const MentorHome = () => {
  const [mentees, setMentees] = useState([]);
  const [filteredMentees, setFilteredMentees] = useState([]);
  const [stats, setStats] = useState([
    { 
      title: "My Students", 
      value: 0, 
      icon: <Users className="w-5 h-5 text-white" />, 
      change: "+12%", 
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      trend: "up"
    },
    { 
      title: "My Courses", 
      value: 0, 
      icon: <ClipboardList className="w-5 h-5 text-white" />, 
      change: "+5%", 
      color: "bg-gradient-to-r from-green-500 to-green-600",
      trend: "up"
    },
    { 
      title: "Attendance", 
      value: "95%", 
      icon: <CalendarDays className="w-5 h-5 text-white" />, 
      change: "+8%", 
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      trend: "up"
    },
    { 
      title: "Pending Reviews", 
      value: 3, 
      icon: <FileCheck className="w-5 h-5 text-white" />, 
      change: "-2%", 
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      trend: "down"
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications] = useState(3);
  const navigate = useNavigate();

  // Enhanced toast configuration
  const showToast = (message, type = "info") => {
    const toastConfig = {
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
        toast.success(message, toastConfig);
        break;
      case "error":
        toast.error(message, toastConfig);
        break;
      case "warning":
        toast.warning(message, toastConfig);
        break;
      case "info":
        toast.info(message, toastConfig);
        break;
      default:
        toast(message, toastConfig);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const res = await UserProfileApi.getProfile();
      const data = res.data?.data || res.data;
      setUserName(data.fullName);
      setUserEmail(data.email);
      setProfileImage(data.profileImageUrl);
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  // Fetch mentees - using the correct mentor API
  const fetchMentees = async () => {
    setLoading(true);
    try {
      console.log("Fetching mentees for mentor...");
      
      const response = await getMyMentees();
      console.log("Mentees response:", response);
      
      const menteesData = response.data || [];
      console.log("Mentees data:", menteesData);

      setMentees(menteesData);
      setFilteredMentees(menteesData);
      
      // Update stats with actual mentee count
      setStats((prev) =>
        prev.map((s) => 
          s.title === "My Students" ? { ...s, value: menteesData.length } : s
        )
      );
      
    } catch (error) {
      console.error("Error fetching mentees:", error);
      console.error("Error details:", error.response?.data);
      
      if (error.response?.status === 403) {
        showToast("Access denied: You don't have permission to view mentees", "error");
      } else if (error.response?.status === 401) {
        showToast("Please log in to view your mentees", "error");
      } else {
        showToast("Failed to fetch mentees data", "error");
      }
      
      // Set empty arrays to prevent further errors
      setMentees([]);
      setFilteredMentees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchMentees();
  }, []);

  // Filter mentees based on search term
  useEffect(() => {
    let result = mentees;
    
    if (searchTerm) {
      result = result.filter(mentee => 
        mentee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentee.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMentees(result);
  }, [searchTerm, mentees]);

  // Get user initials for avatar
  const getUserInitials = (fullName) => {
    if (!fullName) return "??";
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random color for avatar based on user id
  const getAvatarColor = (userId) => {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-blue-600',
      'bg-gradient-to-r from-green-500 to-green-600',
      'bg-gradient-to-r from-purple-500 to-purple-600',
      'bg-gradient-to-r from-orange-500 to-orange-600',
      'bg-gradient-to-r from-pink-500 to-pink-600',
      'bg-gradient-to-r from-teal-500 to-teal-600',
    ];
    return colors[(userId || 0) % colors.length];
  };

  // Chart data based on actual mentees
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  
  const pieData = [
    { name: "Active Students", value: filteredMentees.length },
    { name: "Need Attention", value: Math.max(0, Math.floor(filteredMentees.length * 0.2)) },
  ];

  const chartData = [
    { month: 'Jan', students: Math.floor(filteredMentees.length * 0.7) },
    { month: 'Feb', students: Math.floor(filteredMentees.length * 0.8) },
    { month: 'Mar', students: Math.floor(filteredMentees.length * 0.9) },
    { month: 'Apr', students: filteredMentees.length },
    { month: 'May', students: Math.floor(filteredMentees.length * 1.1) },
    { month: 'Jun', students: Math.floor(filteredMentees.length * 1.2) },
  ];

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/Auth/revoke");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/40">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header */}
   <HomePage/>
      {/* Main Content */}
      <div className="p-6">
        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} rounded-2xl shadow-lg text-white p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-xs ${stat.trend === 'up' ? 'text-green-200' : 'text-red-200'}`}>
                      {stat.change}
                    </span>
                    <span className="text-blue-100 text-xs">from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Student Status Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Student Distribution</h2>
                  <p className="text-gray-600 text-sm">Overview of your students</p>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Students']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Growth Area Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Student Growth</h2>
                  <p className="text-gray-600 text-sm">Monthly student progression</p>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="students" 
                    name="Your Students" 
                    fill="#0088FE" 
                    fillOpacity={0.3} 
                    stroke="#0088FE" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Enhanced Students Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          {/* Table Header with Search */}
          <div className="px-6 py-4 border-b border-gray-200/60">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  My Students
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredMentees.length} of {mentees.length} students
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 transition-colors bg-gray-50/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Students Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMentees.map((mentee) => (
                    <tr key={mentee.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {mentee.profileImageUrl ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={mentee.profileImageUrl}
                                alt={mentee.fullName}
                              />
                            ) : (
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(mentee.id)}`}>
                                {getUserInitials(mentee.fullName)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{mentee.fullName || 'Unknown Student'}</div>
                            <div className="text-sm text-gray-500">ID: {mentee.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{mentee.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.floor(Math.random() * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1.5" />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredMentees.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {mentees.length === 0 ? "You don't have any students assigned yet" : "No students found matching your search"}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="mt-3 text-blue-600 hover:text-blue-800 transition-colors font-medium"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          userName={userName}
          userEmail={userEmail}
          profileImage={profileImage}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdate={fetchUserProfile}
        />
      )}
    </div>
  );
};

// Profile Modal Component (standalone)
const ProfileModal = ({
  userName,
  userEmail,
  profileImage,
  onClose,
  onProfileUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profileImage);
  const [isLoading, setIsLoading] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUpdateMsg("");
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (selectedFile) {
        await UserProfileApi.uploadProfileImage(selectedFile);
        await onProfileUpdate();
        setUpdateMsg(" Profile photo updated successfully!");
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      setUpdateMsg("❌ Failed to update profile photo!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-28 h-28 bg-blue-500 text-white text-3xl rounded-full flex items-center justify-center">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
            {updateMsg && <p className="text-green-600 text-sm mt-1">{updateMsg}</p>}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <div className="flex items-center">
                <p className="font-medium text-gray-900">{userName}</p>
                <Lock className="w-4 h-4 text-gray-400 ml-2" />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <div className="flex items-center">
                <p className="font-medium text-gray-900">{userEmail}</p>
                <Lock className="w-4 h-4 text-gray-400 ml-2" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setPreviewUrl(profileImage);
                    setUpdateMsg("");
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile Image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorHome;