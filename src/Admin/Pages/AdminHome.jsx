import React, { useState, useEffect } from "react";
import { 
  Home, 
  Users, 
  ClipboardList, 
  CalendarDays, 
  FileCheck, 
  Search,
  UserPlus,
  Mail,
  User,
  Shield,
  Trash2,
  Ban,
  CheckCircle,
  PieChart as PieChartIcon,
  BarChart3,
  Eye,
  Download,
  Filter,
  ChevronDown,
  MoreVertical,
  Settings,
  Bell,
  X,
  Save,
  Edit
} from "lucide-react";
import {
  addUser,
  getAllUsers,
  removeUser,
  blockUser,
  unblockUser,
  updateUserRole,
  getAllProfileImages,
} from "../../AdminApi/AdminHomeApi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from "recharts";


const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState([
    { 
      title: "Total Users", 
      value: 0, 
      icon: <Users className="w-5 h-5 text-white" />, 
      change: "+12%", 
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      trend: "up"
    },
    { 
      title: "Total Courses", 
      value: 18, 
      icon: <ClipboardList className="w-5 h-5 text-white" />, 
      change: "+5%", 
      color: "bg-gradient-to-r from-green-500 to-green-600",
      trend: "up"
    },
    { 
      title: "Attendance Records", 
      value: 940, 
      icon: <CalendarDays className="w-5 h-5 text-white" />, 
      change: "+8%", 
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      trend: "up"
    },
    { 
      title: "Pending Reviews", 
      value: 12, 
      icon: <FileCheck className="w-5 h-5 text-white" />, 
      change: "-2%", 
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      trend: "down"
    },
  ]);

  const [newUser, setNewUser] = useState({ email: "", role: "User", fullName: "" });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [profileImages, setProfileImages] = useState({});
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const roleOptions = ["Admin", "User", "Mentor"];
  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"];
  
  // Enhanced chart data
  const [chartData, setChartData] = useState([
    { month: 'Jan', users: 45, blocked: 2, new: 10, active: 43 },
    { month: 'Feb', users: 52, blocked: 3, new: 12, active: 49 },
    { month: 'Mar', users: 48, blocked: 1, new: 8, active: 47 },
    { month: 'Apr', users: 60, blocked: 4, new: 15, active: 56 },
    { month: 'May', users: 65, blocked: 2, new: 18, active: 63 },
    { month: 'Jun', users: 70, blocked: 3, new: 12, active: 67 },
  ]);

  // Enhanced toast configuration :cite[1]:cite[2]
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

  // Fetch users with profile images
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: usersData } = await getAllUsers();
      const { data: profileData } = await getAllProfileImages();
      
      // Create profile image mapping
      const profileMap = {};
      profileData?.data?.forEach(profile => {
        if (profile.email && profile.profileImageUrl) {
          profileMap[profile.email] = profile.profileImageUrl;
        }
      });

      // Merge users with profile images
      const usersWithProfiles = usersData.map(user => ({
        ...user,
        profileImageUrl: profileMap[user.email] || null
      }));

      setUsers(usersWithProfiles);
      setFilteredUsers(usersWithProfiles);
      setProfileImages(profileMap);
      
      // Update total users stat
      setStats((prev) =>
        prev.map((s) => (s.title === "Total Users" ? { ...s, value: usersWithProfiles.length } : s))
      );
    } catch (error) {
      console.log(error);
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and filters
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      result = result.filter(user => 
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== "All") {
      result = result.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter !== "All") {
      if (statusFilter === "Blocked") {
        result = result.filter(user => user.isBlocked);
      } else if (statusFilter === "Active") {
        result = result.filter(user => !user.isBlocked);
      }
    }
    
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, statusFilter, users]);

  // Add User with enhanced toast feedback :cite[2]
  const handleAddUser = async () => {
    if (!newUser.email || !newUser.fullName) {
      showToast("Email and Full Name are required", "error");
      return;
    }
    try {
      await addUser(newUser);
      showToast("User added successfully", "success");
      setNewUser({ email: "", role: "User", fullName: "" });
      setIsAddUserModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.log(error);
      showToast(error.response?.data?.message || "Failed to add user", "error");
    }
  };

  // Delete User with confirmation toast
  const handleDeleteUser = async (id) => {
    const userToDelete = users.find(user => user.id === id);
    if (window.confirm(`Are you sure you want to delete ${userToDelete?.fullName || 'this user'}?`)) {
      try {
        await removeUser(id);
        showToast("User deleted successfully", "success");
        fetchUsers();
      } catch (error) {
        console.log(error);
        showToast("Failed to delete user", "error");
      }
    }
  };

  // Block / Unblock with enhanced feedback
  const handleToggleBlock = async (user) => {
    try {
      if (user.isBlocked) {
        await unblockUser(user.id);
        showToast(`${user.fullName} has been unblocked`, "success");
      } else {
        await blockUser(user.id);
        showToast(`${user.fullName} has been blocked`, "warning");
      }
      fetchUsers();
    } catch (error) {
      console.log(error);
      showToast("Failed to update block status", "error");
    }
  };

  // Update role with enhanced toast feedback :cite[2]
  const handleRoleChange = async (user, newRole) => {
    try {
      await updateUserRole(user.id, { role: newRole });
      showToast(`${user.fullName}'s role updated to ${newRole}`, "success");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.log(error);
      showToast("Failed to update role", "error");
    }
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
    return colors[userId % colors.length];
  };

  // Blocked users count for graph
  const blockedCount = users.filter((u) => u.isBlocked).length;
  const adminCount = users.filter((u) => u.role === "Admin").length;
  const mentorCount = users.filter((u) => u.role === "Mentor").length;
  const userCount = users.filter((u) => u.role === "User").length;

  const pieData = [
    { name: "Active Users", value: users.length - blockedCount },
    { name: "Blocked Users", value: blockedCount },
    { name: "Admin Users", value: adminCount },
    { name: "Mentor Users", value: mentorCount },
  ];

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  // Role badge colors
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Mentor":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
        transition="Bounce"
      />

      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200/60">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl shadow-sm">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm">Manage users, view analytics, and monitor system performance</p>
            </div>
          
          </div>
        </div>
      </div>

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

        {/* Modern Add User Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
                <p className="text-gray-600 text-sm">Create a new user account in the system</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              <UserPlus className="w-5 h-5" />
              Add New User
            </button>
          </div>
        </div>

        {/* Add User Modal */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md transform animate-scale-in">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
                    <p className="text-gray-600 text-sm">Create a new user account in the system</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Enter full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <select
                      className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-gray-50/50 transition-all duration-200"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Add User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* User Status Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">User Distribution</h2>
                  <p className="text-gray-600 text-sm">Overview of user roles and status</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                <Download className="w-4 h-4" />
              </button>
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
                  <Tooltip formatter={(value) => [value, 'Users']} />
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
                  <h2 className="text-xl font-semibold text-gray-800">User Analytics</h2>
                  <p className="text-gray-600 text-sm">Monthly growth and activity</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" name="Total Users" fill="#0088FE" fillOpacity={0.3} stroke="#0088FE" />
                  <Area type="monotone" dataKey="new" name="New Users" fill="#00C49F" fillOpacity={0.3} stroke="#00C49F" />
                  <Area type="monotone" dataKey="active" name="Active Users" fill="#FFBB28" fillOpacity={0.3} stroke="#FFBB28" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

       

        {/* Enhanced Users Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          {/* Table Header with Search and Filters */}
          <div className="px-6 py-4 border-b border-gray-200/60">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  User Management
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 transition-colors bg-gray-50/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50/50 appearance-none"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="All">All Roles</option>
                      {roleOptions.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <select
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50/50"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                  </select>

                  {(searchTerm || roleFilter !== "All" || statusFilter !== "All") && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors text-sm border border-gray-300 rounded-xl hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Users Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {user.profileImageUrl ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                                src={user.profileImageUrl}
                                alt={user.fullName}
                              />
                            ) : (
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(user.id)}`}>
                                {getUserInitials(user.fullName)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                              value={user.role}
                              onChange={(e) => handleRoleChange(user, e.target.value)}
                            >
                              {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                            <button
                              onClick={() => setEditingUser(user.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.isBlocked 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {user.isBlocked ? (
                            <>
                              <Ban className="w-3 h-3 mr-1.5" />
                              Blocked
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1.5" />
                              Active
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2 hours ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleBlock(user)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg transition-colors text-sm border ${
                              user.isBlocked 
                                ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' 
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                            }`}
                          >
                            {user.isBlocked ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Unblock
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-1" />
                                Block
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm border border-gray-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No users found matching your criteria</p>
                  {(searchTerm || roleFilter !== "All" || statusFilter !== "All") && (
                    <button
                      onClick={clearFilters}
                      className="mt-3 text-blue-600 hover:text-blue-800 transition-colors font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;