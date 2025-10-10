import React, { useState } from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, Code2, Edit3, Save, X } from 'lucide-react';

export default function Profile() {
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '#',
    github: '#',
    portfolio: '#'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editLinks, setEditLinks] = useState({ ...socialLinks });

  const handleEditClick = () => {
    setEditLinks({ ...socialLinks });
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setSocialLinks({ ...editLinks });
    setIsEditing(false);
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white font-inter overflow-x-hidden">
      <div className="w-full flex justify-center px-4 sm:px-8 md:px-16 py-10">
        <div className="w-full max-w-7xl space-y-10">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-purple-900/60 via-purple-800/50 to-purple-900/60 border border-purple-600/30 shadow-2xl rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 backdrop-blur-xl">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                alt="Profile"
                className="w-36 h-36 rounded-full border-4 border-purple-500 shadow-lg shadow-purple-500/40"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                Muhammed Marjan
              </h1>
              <p className="text-purple-200 mt-1 text-lg font-medium">Glowsis • Software Developer</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-400/40 rounded-full text-sm">
                  Batch: C41
                </span>
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-400/40 rounded-full text-sm">
                  Week: 17
                </span>
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-400/40 rounded-full text-sm">
                  Role: Trainee
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
                    <p className="text-white break-all">marjanmuhammad790@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white">7902480917</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Address</p>
                    <p className="text-white leading-relaxed">Najiya Manzil, Kadoor, Mayyil PO, Cherupazhashi</p>
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
                      >
                        <Linkedin className="w-6 h-6 text-white" />
                      </a>
                      <a
                        href={socialLinks.github}
                        className="p-3 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl hover:scale-110 transition-transform shadow-md shadow-gray-700/50"
                      >
                        <Github className="w-6 h-6 text-white" />
                      </a>
                      <a
                        href={socialLinks.portfolio}
                        className="p-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl hover:scale-110 transition-transform shadow-md shadow-pink-500/40"
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
                <Info label="Branch" value="Kakkanchery" />
                <Info label="Space" value="Glowsis" />
                <Info label="Week" value="17" />
                <Info label="Advisor" value="Sinan B H" />
                <Info label="Mentor" value="Viswajith K" />
                <Info label="Qualification" value="Degree Others" />
              </Section>

              <Section title="Personal Info">
                <Info label="Institution" value="Sir Syed College" />
                <Info label="PassOut Year" value="2023" />

                <div className="mt-8 border-t border-white/20 pt-6">
                  <h3 className="text-xl font-semibold mb-4">Guardian</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <Info label="Name" value="Abdul Sathar K V" />
                    <Info label="Relationship" value="Father" />
                    <Info label="Phone" value="9847386722" />
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
    <div className="grid grid-cols-2 gap-6">{children}</div>
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
