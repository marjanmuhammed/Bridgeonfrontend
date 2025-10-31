// src/pages/Mentor/ProfileManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  GraduationCap,
  User as UserIcon,
  Shield,
  Calendar,
  Eye,
  RefreshCw
} from "lucide-react";
import { 
  getMyMentees,
  getMenteeProfile,
  createMenteeProfile,
  updateMenteeProfile,
  deleteMenteeProfile,
  getMenteesProfileImages
} from "../MentorApi/MentorProfile";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from "../Auth/Home";

const MentorProfileManagement = () => {
  const [mentees, setMentees] = useState([]);
  const [filteredMentees, setFilteredMentees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [currentMentee, setCurrentMentee] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());
  const [saving, setSaving] = useState(false);

  function getInitialFormData() {
    return {
      userId: "",
      email: "",
      phone: "",
      address: "",
      branch: "",
      space: "",
      week: 0,
      advisor: "",
      mentor: "",
      qualification: "",
      institution: "",
      passOutYear: new Date().getFullYear(),
      guardianName: "",
      guardianRelationship: "",
      guardianPhone: ""
    };
  }

  const fetchMenteesWithProfiles = async () => {
    setLoading(true);
    try {
      // Fetch mentor's mentees
      const menteesData = await getMyMentees();
      
      // Fetch profile images
      const profileImagesData = await getMenteesProfileImages();

      const profileMap = {};
      profileImagesData?.data?.forEach(profile => {
        if (profile.email && profile.profileImageUrl) {
          profileMap[profile.email] = profile.profileImageUrl;
        }
      });

      // Enhance mentees with profile data and images
      const menteesWithProfiles = await Promise.all(
        menteesData.map(async (mentee) => {
          try {
            const profile = await getMenteeProfile(mentee.id);
            return {
              ...mentee,
              profileData: profile,
              profileImageUrl: profileMap[mentee.email] || null,
              hasProfile: !!profile
            };
          } catch (error) {
            return {
              ...mentee,
              profileData: null,
              profileImageUrl: profileMap[mentee.email] || null,
              hasProfile: false
            };
          }
        })
      );

      setMentees(menteesWithProfiles);
      setFilteredMentees(menteesWithProfiles);

    } catch (error) {
      console.error("Error fetching mentees:", error);
      showToast("Failed to fetch your mentees", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenteesWithProfiles();
  }, []);

  useEffect(() => {
    let result = mentees;
    
    if (searchTerm) {
      result = result.filter(mentee => 
        mentee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentee.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "All") {
      if (statusFilter === "With Profile") {
        result = result.filter(mentee => mentee.hasProfile);
      } else if (statusFilter === "Without Profile") {
        result = result.filter(mentee => !mentee.hasProfile);
      }
    }
    
    setFilteredMentees(result);
  }, [searchTerm, statusFilter, mentees]);

  const showToast = (message, type = "info") => {
    const toastMethods = {
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info
    };
    
    (toastMethods[type] || toast)(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true, // Fixed: Added missing colon
      theme: "light",
    });
  };

  const handleCreateProfile = (mentee) => {
    setFormData({
      ...getInitialFormData(),
      userId: mentee.id,
      email: mentee.email
    });
    setEditingProfile(null);
    setCurrentMentee(mentee);
    setIsProfileModalOpen(true);
  };

  const handleEditProfile = async (mentee) => {
    try {
      setCurrentMentee(mentee);
      const profileData = await getMenteeProfile(mentee.id);
      
      if (profileData) {
        setFormData({
          userId: mentee.id,
          email: profileData.email || mentee.email,
          phone: profileData.phone || "",
          address: profileData.address || "",
          branch: profileData.branch || "",
          space: profileData.space || "",
          week: profileData.week || 0,
          advisor: profileData.advisor || "",
          mentor: profileData.mentor || "",
          qualification: profileData.qualification || "",
          institution: profileData.institution || "",
          passOutYear: profileData.passOutYear || new Date().getFullYear(),
          guardianName: profileData.guardianName || "",
          guardianRelationship: profileData.guardianRelationship || "",
          guardianPhone: profileData.guardianPhone || ""
        });
        setEditingProfile(profileData);
      } else {
        setFormData({
          ...getInitialFormData(),
          userId: mentee.id,
          email: mentee.email
        });
        setEditingProfile(null);
      }
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast("Failed to load profile data", "error");
    }
  };

  const handleViewProfile = async (mentee) => {
    try {
      setLoading(true);
      setCurrentMentee(mentee);
      
      const profileData = await getMenteeProfile(mentee.id);
      
      if (profileData) {
        setViewingProfile(profileData);
      } else {
        setViewingProfile({
          email: mentee.email,
          phone: "Not provided",
          address: "Not provided",
          branch: "Not provided",
          space: "Not provided",
          week: 0,
          advisor: "Not provided",
          mentor: "Not provided",
          qualification: "Not provided",
          institution: "Not provided",
          passOutYear: new Date().getFullYear(),
          guardianName: "Not provided",
          guardianRelationship: "Not provided",
          guardianPhone: "Not provided"
        });
      }
      setIsViewModalOpen(true);
        
    } catch (error) {
      console.error("Error loading profile:", error);
      showToast("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditFromView = async () => {
    if (currentMentee) {
      setIsViewModalOpen(false);
      await handleEditProfile(currentMentee);
    }
  };

  const handleDeleteFromView = async () => {
    if (currentMentee) {
      setIsViewModalOpen(false);
      await handleDeleteProfile(currentMentee);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseInt(value)) : value
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const profileData = {
        userId: parseInt(formData.userId),
        email: formData.email,
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        branch: formData.branch?.trim() || null,
        space: formData.space?.trim() || null,
        week: formData.week || 0,
        advisor: formData.advisor?.trim() || null,
        mentor: formData.mentor?.trim() || null,
        qualification: formData.qualification?.trim() || null,
        institution: formData.institution?.trim() || null,
        passOutYear: formData.passOutYear || new Date().getFullYear(),
        guardianName: formData.guardianName?.trim() || null,
        guardianRelationship: formData.guardianRelationship?.trim() || null,
        guardianPhone: formData.guardianPhone?.trim() || null
      };

      if (editingProfile) {
        await updateMenteeProfile(formData.userId, profileData);
        showToast("Profile updated successfully", "success");
      } else {
        await createMenteeProfile(profileData);
        showToast("Profile created successfully", "success");
      }

      setIsProfileModalOpen(false);
      setFormData(getInitialFormData());
      fetchMenteesWithProfiles();
      
    } catch (error) {
      console.error("Error saving profile:", error);
      const errorMessage = error.response?.data?.message || 
                          "Failed to save profile. Please check the data and try again.";
      showToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async (mentee) => {
    try {
      const profile = await getMenteeProfile(mentee.id);
      
      if (!profile) {
        showToast("No profile found to delete", "warning");
        return;
      }

      if (window.confirm(`Are you sure you want to delete the profile for ${mentee.fullName}?`)) {
        await deleteMenteeProfile(profile.id);
        showToast("Profile deleted successfully", "success");
        fetchMenteesWithProfiles();
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete profile";
      showToast(errorMessage, "error");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
  };

  const getUserInitials = (fullName) => {
    if (!fullName) return "??";
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  const getProfileStatus = (hasProfile) => {
    if (hasProfile) {
      return { text: "Profile Created", color: "bg-green-100 text-green-800 border-green-200" };
    } else {
      return { text: "No Profile", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    }
  };

  const formatFieldValue = (value) => {
    if (!value || value === "" || value === 0) return "Not provided";
    return value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/40">
      <ToastContainer />

      {/* Header with HomePage Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <HomePage />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Mentee Profile Management</h1>
                <p className="text-gray-600 mt-1">Manage profiles for your mentees</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {mentees.length} mentees
              </div>
              <button
                onClick={fetchMenteesWithProfiles}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Mentee Profiles</h2>
              <p className="text-gray-600 text-sm">
                Showing {filteredMentees.length} of {mentees.length} mentees
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search mentees..."
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:w-64 transition-colors bg-gray-50/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50/50 appearance-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="With Profile">With Profile</option>
                    <option value="Without Profile">Without Profile</option>
                  </select>
                </div>

                {(searchTerm || statusFilter !== "All") && (
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

        {/* Mentees Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMentees.map((mentee) => {
                    const status = getProfileStatus(mentee.hasProfile);
                    return (
                      <tr key={mentee.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {mentee.profileImageUrl ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
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
                              <div className="text-sm font-semibold text-gray-900">{mentee.fullName}</div>
                              <div className="text-sm text-gray-500">ID: {mentee.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{mentee.email}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            {status.text}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewProfile(mentee)}
                              className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm border border-gray-200"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>

                            {mentee.hasProfile ? (
                              <button
                                onClick={() => handleEditProfile(mentee)}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm border border-blue-200"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCreateProfile(mentee)}
                                className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm border border-green-200"
                              >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Create Profile
                              </button>
                            )}

                            {mentee.hasProfile && (
                              <button
                                onClick={() => handleDeleteProfile(mentee)}
                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm border border-red-200"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredMentees.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {mentees.length === 0 ? "No mentees assigned to you yet" : "No mentees found matching your criteria"}
                  </p>
                  {(searchTerm || statusFilter !== "All") && (
                    <button
                      onClick={clearFilters}
                      className="mt-3 text-green-600 hover:text-green-800 transition-colors font-medium"
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

      {/* Create/Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {editingProfile ? 'Edit Mentee Profile' : 'Create Mentee Profile'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {currentMentee?.fullName} • {currentMentee?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setFormData(getInitialFormData());
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                disabled={saving}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form content */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    Contact Information
                  </h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      name="address"
                      placeholder="Enter full address"
                      rows="3"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50 resize-none"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    Academic Information
                  </h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    placeholder="Enter branch"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                    value={formData.branch}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Space</label>
                  <input
                    type="text"
                    name="space"
                    placeholder="Enter space"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                    value={formData.space}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
                  <input
                    type="number"
                    name="week"
                    min="0"
                    max="52"
                    placeholder="0-52"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                    value={formData.week}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Advisor</label>
                  <input
                    type="text"
                    name="advisor"
                    placeholder="Enter advisor name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                    value={formData.advisor}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mentor</label>
                  <input
                    type="text"
                    name="mentor"
                    placeholder="Enter mentor name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                    value={formData.mentor}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    placeholder="Enter qualification"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                    value={formData.qualification}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-green-600" />
                    Personal Information
                  </h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                  <input
                    type="text"
                    name="institution"
                    placeholder="Enter institution"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                    value={formData.institution}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pass Out Year</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="passOutYear"
                      min="1900"
                      max="2100"
                      placeholder="2024"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                      value={formData.passOutYear}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Guardian Information
                  </h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name</label>
                  <input
                    type="text"
                    name="guardianName"
                    placeholder="Enter guardian name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <input
                    type="text"
                    name="guardianRelationship"
                    placeholder="e.g., Father, Mother"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                    value={formData.guardianRelationship}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="guardianPhone"
                      placeholder="Enter guardian phone"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50/50"
                      value={formData.guardianPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setFormData(getInitialFormData());
                }}
                disabled={saving}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {editingProfile ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {editingProfile ? 'Update Profile' : 'Create Profile'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {isViewModalOpen && viewingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {currentMentee?.fullName}'s Profile
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Complete profile information
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* View profile content */}
            <div className="p-6 space-y-6">
              {/* User Basic Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0">
                  {currentMentee?.profileImageUrl ? (
                    <img
                      className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm"
                      src={currentMentee.profileImageUrl}
                      alt={currentMentee.fullName}
                    />
                  ) : (
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-semibold text-lg ${getAvatarColor(currentMentee?.id)}`}>
                      {getUserInitials(currentMentee?.fullName)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{currentMentee?.fullName}</h3>
                  <p className="text-gray-600">{currentMentee?.email}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getProfileStatus(currentMentee?.hasProfile).color}`}>
                    {getProfileStatus(currentMentee?.hasProfile).text}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    Contact Information
                  </h3>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.email)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.phone)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.address)}</p>
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    Academic Information
                  </h3>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.branch)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Space</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.space)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.week)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Advisor</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.advisor)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mentor</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.mentor)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.qualification)}</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-green-600" />
                    Personal Information
                  </h3>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.institution)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pass Out Year</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.passOutYear)}</p>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Guardian Information
                  </h3>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.guardianName)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.guardianRelationship)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Phone</label>
                  <p className="text-gray-900">{formatFieldValue(viewingProfile.guardianPhone)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleEditFromView}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
              <button
                onClick={handleDeleteFromView}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfileManagement;