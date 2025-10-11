import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, Code2, Edit3, Save, X, User, Camera } from 'lucide-react';
import { getMyProfile } from '../AdminApi/AdminProfile';
import ProfileApi from '../Api/ProfileApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '#',
    github: '#',
    portfolio: '#'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editLinks, setEditLinks] = useState({ ...socialLinks });
  const [uploadingImage, setUploadingImage] = useState(false);

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
      draggable: true,
      theme: "light",
    });
  };

  // ✅ Upload and update profile image
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      setUploadingImage(true);
      showToast('Uploading profile image...', 'info');

      // Step 1: Upload the image file
      const imageUrl = await ProfileApi.uploadProfileImage(file);
      console.log('✅ Image uploaded, URL:', imageUrl);

      // Step 2: Update profile with the new image URL
      await ProfileApi.updateProfileImage(imageUrl);
      
      // Step 3: Update local state
      setProfileData(prev => ({
        ...prev,
        profileImageUrl: imageUrl
      }));

      showToast('Profile image updated successfully!', 'success');
      
      // Refresh profile data to get latest changes
      fetchProfileData();
    } catch (error) {
      console.error('💥 Error uploading profile image:', error);
      showToast('Failed to upload profile image', 'error');
    } finally {
      setUploadingImage(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // ✅ Fetch user profile using both endpoints for comprehensive data
  const fetchProfileData = async () => {
  try {
    setLoading(true);
    console.log('🚀 Fetching current user profile...');

    let profileData = null;

    // Step 1: Try getMyProfile()
    try {
      const profile = await getMyProfile();
      if (profile) {
        console.log('✅ Profile data from getMyProfile:', profile);
        profileData = profile;
      }
    } catch (firstError) {
      console.log('⚠️ getMyProfile failed, trying ProfileApi...', firstError);
    }

    // Step 2: Always try to get image + username from ProfileApi also
    try {
      const response = await ProfileApi.getProfile();
      const imageProfile = response.data || response.data?.data || {};
      console.log('✅ Profile image data from ProfileApi:', imageProfile);

      // Merge both results together
      profileData = {
        ...profileData,
        profileImageUrl: imageProfile.profileImageUrl || profileData?.profileImageUrl || "",
        fullName: imageProfile.fullName || profileData?.fullName || "User Name"
      };
    } catch (secondError) {
      console.log('⚠️ Error fetching image profile:', secondError);
    }

    if (profileData) {
      setProfileData(profileData);
      showToast("Profile loaded successfully", "success");
    } else {
      setProfileData(getDefaultProfileData());
      showToast("No profile data found", "warning");
    }
  } catch (error) {
    console.error("💥 Error fetching profile:", error);
    showToast("Failed to load profile data", "error");
    setProfileData(getDefaultProfileData());
  } finally {
    setLoading(false);
  }
};


  // Default profile data
  const getDefaultProfileData = () => {
    return {
      email: "Not available",
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
      guardianPhone: "Not provided",
      fullName: "User Name",
      role: "Trainee",
      profileImageUrl: ""
    };
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleEditClick = () => {
    setEditLinks({ ...socialLinks });
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setSocialLinks({ ...editLinks });
    setIsEditing(false);
    showToast("Social links updated successfully", "success");
  };

  const handleCancelClick = () => {
    setEditLinks({ ...socialLinks });
    setIsEditing(false);
  };

  const handleInputChange = (platform, value) => {
    setEditLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const formatFieldValue = (value) => {
    if (!value || value === "" || value === 0 || value === "Not provided") return "Not provided";
    return value;
  };

  const getUserInitials = (fullName) => {
    if (!fullName || fullName === "User Name") return "??";
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
    return colors[((userId || 0) + Math.floor(Math.random() * 100)) % colors.length];
  };

  

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white font-inter overflow-x-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white font-inter overflow-x-hidden">
      <ToastContainer />
      
      <div className="w-full flex justify-center px-4 sm:px-8 md:px-16 py-10">
        <div className="w-full max-w-7xl space-y-10">
          {/* Debug Info - Only shows in development */}
         
          {/* Header Section */}
          <div className="bg-gradient-to-br from-purple-900/60 via-purple-800/50 to-purple-900/60 border border-purple-600/30 shadow-2xl rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 backdrop-blur-xl">
            <div className="relative group">
              {profileData?.profileImageUrl ? (
                <div className="relative">
                  <img
                    src={profileData.profileImageUrl}
                    alt="Profile"
                    className="w-36 h-36 rounded-full border-4 border-purple-500 shadow-lg shadow-purple-500/40 object-cover"
                  />
                  <label 
                    htmlFor="profile-image-upload"
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-white" />
                    <span className="sr-only">Change profile image</span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className={`w-36 h-36 rounded-full border-4 border-purple-500 shadow-lg shadow-purple-500/40 flex items-center justify-center text-white font-bold text-2xl ${getAvatarColor(profileData?.userId || profileData?.id)}`}>
                    {getUserInitials(profileData?.fullName)}
                  </div>
                  <label 
                    htmlFor="profile-image-upload"
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-white" />
                    <span className="sr-only">Upload profile image</span>
                  </label>
                </div>
              )}
              
              {/* Hidden file input */}
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
              
              {/* Uploading overlay */}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                {profileData?.fullName || "User Name"}
              </h1>
               <p className="text-purple-200 mt-1 text-lg font-medium">
                {formatFieldValue(profileData?.space)} • Software Development
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-400/40 rounded-full text-sm">
                  Branch: {formatFieldValue(profileData?.branch)}
                </span>
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-400/40 rounded-full text-sm">
                  Week: {formatFieldValue(profileData?.week)}
                </span>
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-400/40 rounded-full text-sm">
                  Role: {profileData?.role || "Internship"}
                </span>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-purple-500/20 transition-all">
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-purple-500 pl-3">Contact</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-3 break-words">
                  <Mail className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white break-all">{formatFieldValue(profileData?.email)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white">{formatFieldValue(profileData?.phone)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Address</p>
                    <p className="text-white leading-relaxed">{formatFieldValue(profileData?.address)}</p>
                  </div>
                </div>
              </div>

              {/* Social Links Section */}
              <div className="mt-8 border-t border-white/20 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Social Links</h3>
                  {!isEditing ? (
                    <button
                      onClick={handleEditClick}
                      className="p-2 bg-purple-600/50 border border-purple-400/40 rounded-xl hover:bg-purple-600/70 transition-all flex items-center gap-2 text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveClick}
                        className="p-2 bg-green-600/50 border border-green-400/40 rounded-xl hover:bg-green-600/70 transition-all flex items-center gap-2 text-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelClick}
                        className="p-2 bg-red-600/50 border border-red-400/40 rounded-xl hover:bg-red-600/70 transition-all flex items-center gap-2 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 flex-wrap">
                  {!isEditing ? (
                    <>
                      <a
                        href={socialLinks.linkedin}
                        className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:scale-110 transition-transform shadow-md shadow-purple-500/30"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-6 h-6 text-white" />
                      </a>
                      <a
                        href={socialLinks.github}
                        className="p-3 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl hover:scale-110 transition-transform shadow-md shadow-gray-700/50"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-6 h-6 text-white" />
                      </a>
                      <a
                        href={socialLinks.portfolio}
                        className="p-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl hover:scale-110 transition-transform shadow-md shadow-pink-500/40"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Code2 className="w-6 h-6 text-white" />
                      </a>
                    </>
                  ) : (
                    <>
                      <EditInput
                        icon={<Linkedin className="w-6 h-6 text-white" />}
                        bg="from-blue-500 to-purple-600"
                        value={editLinks.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        placeholder="LinkedIn URL"
                      />
                      <EditInput
                        icon={<Github className="w-6 h-6 text-white" />}
                        bg="from-gray-700 to-gray-900"
                        value={editLinks.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        placeholder="GitHub URL"
                      />
                      <EditInput
                        icon={<Code2 className="w-6 h-6 text-white" />}
                        bg="from-orange-500 to-pink-600"
                        value={editLinks.portfolio}
                        onChange={(e) => handleInputChange('portfolio', e.target.value)}
                        placeholder="Portfolio URL"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-8">
              <Section title="Academic Info">
                <Info label="Branch" value={formatFieldValue(profileData?.branch)} />
                <Info label="Space" value={formatFieldValue(profileData?.space)} />
                <Info label="Week" value={formatFieldValue(profileData?.week)} />
                <Info label="Advisor" value={formatFieldValue(profileData?.advisor)} />
                <Info label="Mentor" value={formatFieldValue(profileData?.mentor)} />
                <Info label="Qualification" value={formatFieldValue(profileData?.qualification)} />
              </Section>

              <Section title="Personal Info">
                <Info label="Institution" value={formatFieldValue(profileData?.institution)} />
                <Info label="PassOut Year" value={formatFieldValue(profileData?.passOutYear)} />

                <div className="mt-8 border-t border-white/20 pt-6">
                  <h3 className="text-xl font-semibold mb-4">Guardian</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Info label="Name" value={formatFieldValue(profileData?.guardianName)} />
                    <Info label="Relationship" value={formatFieldValue(profileData?.guardianRelationship)} />
                    <Info label="Phone" value={formatFieldValue(profileData?.guardianPhone)} />
                  </div>
                </div>
              </Section>

              <Section title="GitHub & LeetCode Stats" icon={<Github className="w-6 h-6 text-purple-400" />}>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="bg-black/40 p-6 rounded-2xl w-full md:w-1/2 border border-purple-400/20 text-center hover:bg-black/60 transition-all">
                    <p className="text-gray-400 text-sm mb-2">GitHub Contributions</p>
                    <div className="h-32 flex items-center justify-center text-purple-400 italic">
                      Connect GitHub to view contributions
                    </div>
                  </div>
                  <div className="bg-black/40 p-6 rounded-2xl w-full md:w-1/2 border border-purple-400/20 text-center hover:bg-black/60 transition-all">
                    <p className="text-gray-400 text-sm mb-2">LeetCode Progress</p>
                    <div className="h-32 flex items-center justify-center text-purple-400 italic">
                      Connect LeetCode to view problems solved
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-10 border-t border-white/10 pt-6">
            © {new Date().getFullYear()} Bridgeon Learning Platform. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
const Section = ({ title, children, icon }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-purple-500/20 transition-all">
    <h2 className="text-2xl font-bold mb-6 border-l-4 border-purple-500 pl-3 flex items-center gap-2">
      {icon && icon} {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <p className="text-white font-medium">{value}</p>
  </div>
);

const EditInput = ({ icon, bg, value, onChange, placeholder }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`p-3 bg-gradient-to-r ${bg} rounded-xl`}>{icon}</div>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="w-28 sm:w-32 md:w-40 px-2 py-1 bg-black/30 border border-purple-400/30 rounded text-sm text-white"
      placeholder={placeholder}
    />
  </div>
);