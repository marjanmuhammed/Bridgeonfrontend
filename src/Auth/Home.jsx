// HomePage.jsx
import React, { useState, useEffect } from "react";
import {
  Bell,
  User,
  ChevronDown,
  LogOut,
  X,
  Camera,
  Edit,
  Save,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserProfileApi from "../Api/ProfileApi";
import NotificationApi from "../NotificationApi/NotificationApi";
import axiosInstance from "../Utils/Axios";
import NotificationModal from "../NotificationApi/otificationModal";

const HomePage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUnreadCount();
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const checkIfMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const res = await UserProfileApi.getProfile();
      const data = res.data?.data || res.data;
      setUserName(data.fullName);
      setUserEmail(data.email);
      setProfileImage(data.profileImageUrl);
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await NotificationApi.getUnreadCount();
      setNotificationsCount(res.data?.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
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

  const handleNotificationClick = () => {
    setShowNotificationModal(true);
    setNotificationsCount(0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.profile-dropdown')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  return (
    <>
      {/* ✅ Navbar Section */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 md:py-4">
          {/* Left Section - Welcome Message */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm tracking-wide truncate">
              Hi {userName || "User"} 👋
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm md:text-lg font-medium truncate">
              Welcome to <span className="font-bold text-blue-600">Bridgeon</span>!
            </p>
          </div>

          {/* Right Section - Notifications & Profile */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {/* Notification */}
            <button 
              onClick={handleNotificationClick}
              className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
              {notificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notificationsCount > 9 ? '9+' : notificationsCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="relative profile-dropdown">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] sm:text-xs md:text-sm font-semibold">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-20 md:max-w-none">
                    {userName || "User"}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${
                    showUserDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-36 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40">
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowUserDropdown(false);
                    }}
                    className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                    My Profile
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-50"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          userName={userName}
          userEmail={userEmail}
          profileImage={profileImage}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdate={fetchUserProfile}
          isMobile={isMobile}
        />
      )}

      {/* ✅ Notification Modal */}
      {showNotificationModal && (
        <NotificationModal 
          onClose={() => setShowNotificationModal(false)} 
          isMobile={isMobile}
        />
      )}
    </>
  );
};

const ProfileModal = ({
  userName,
  userEmail,
  profileImage,
  onClose,
  onProfileUpdate,
  isMobile
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
        setUpdateMsg("✅ Profile photo updated successfully!");
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      setUpdateMsg("❌ Failed to update profile photo!");
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal when clicking outside (for mobile)
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div 
        className={`bg-white h-full shadow-lg animate-slide-in-right relative ${
          isMobile ? 'w-full max-w-sm' : 'w-full max-w-md'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">My Profile</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-y-auto h-[calc(100%-80px)]">
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 bg-blue-500 text-white text-xl sm:text-2xl md:text-3xl rounded-full flex items-center justify-center">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 sm:p-1.5 md:p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
            {updateMsg && (
              <p className="text-green-600 text-xs sm:text-sm mt-1 text-center px-2">
                {updateMsg}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Full Name</p>
              <div className="flex items-center">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  {userName || "User"}
                </p>
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-2" />
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-gray-500">Email</p>
              <div className="flex items-center">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  {userEmail || "user@example.com"}
                </p>
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-2" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setPreviewUrl(profileImage);
                    setUpdateMsg("");
                  }}
                  className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Edit Profile Image
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease forwards;
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;