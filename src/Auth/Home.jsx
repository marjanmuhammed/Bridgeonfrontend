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
import axiosInstance from "../Utils/Axios";

const HomePage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications] = useState(3);

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
    <>
      {/* ✅ Navbar Section (not full-screen) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm tracking-wide">
              Hi {userName} 👋
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Welcome to <span className="font-bold text-blue-600">Bridgeon</span>!
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell className="w-6 h-6 text-gray-700" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showUserDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40">
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowUserDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4 mr-3" />
                    My Profile
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Keep modal fully functional */}
      {showProfileModal && (
        <ProfileModal
          userName={userName}
          userEmail={userEmail}
          profileImage={profileImage}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdate={fetchUserProfile}
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
    <div className="fixed inset-0 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full shadow-lg animate-slide-in-right relative">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
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
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700">
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
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
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
