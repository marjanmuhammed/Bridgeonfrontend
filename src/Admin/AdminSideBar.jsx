// 📁 src/Admin/AdminSidebar.jsx
import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  User,
  ClipboardList,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  Gift
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../Utils/Axios";

const AdminSidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "home", label: "Home", icon: LayoutDashboard, color: "from-blue-500 to-indigo-500", path: "/admin-dashboard" },
    { id: "profile", label: "Profile Management", icon: User, color: "from-purple-500 to-pink-500", path: "/admin-profile" },
    { id: "dashboard", label: "Dashboard Management", icon: LayoutDashboard, color: "from-blue-500 to-indigo-500", path: "/admin-dashboard-management" },
    { id: "attendance", label: "Attendance Management", icon: Calendar, color: "from-green-500 to-emerald-500", path: "/admin-attendance" },
    { id: "review", label: "Review Management", icon: MessageSquare, color: "from-cyan-500 to-blue-500", path: "/admin-review" },
    { id: "leave", label: "Leave Request Management", icon: FileText, color: "from-orange-500 to-red-500", path: "/admin-leave" },
    { id: "mentor", label: "Mentor Management", icon: Users, color: "from-teal-500 to-cyan-500", path: "/admin-mentor-management" },
    { id: "holidays", label: "Holiday Management", icon: Gift, color: "from-amber-500 to-orange-500", path: "/admin-holidays" }
  ];

  const activeItem = menuItems.find(item => item.path === location.pathname)?.id;

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/Auth/revoke");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleNavigation = (item) => {
    navigate(item.path);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`relative h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        } flex flex-col shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div
            className={`flex items-center gap-3 ${
              isCollapsed ? "justify-center w-full" : ""
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r " + item.color + " shadow-lg scale-105"
                      : "hover:bg-slate-800/50"
                  }
                  ${isCollapsed ? "justify-center" : ""}`}
              >
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}

                <div
                  className={`relative z-10 ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
                  } transition-colors`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {!isCollapsed && (
                  <span
                    className={`font-medium text-sm ${
                      isActive
                        ? "text-white"
                        : "text-slate-300 group-hover:text-white"
                    } transition-colors`}
                  >
                    {item.label}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-slate-700 z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-700/50 space-y-2">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-200 group ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all duration-200"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default AdminSidebar;