// 📁 src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 🔹 Auth pages
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import ProtectedRoute from "./Auth/ProtectedRoute";

// 🔹 User pages
import Dashboard from "./Pages/Dashboard";
import Attendance from "./Pages/Attendence";
import Course from "./Pages/Course";
import Review from "./Pages/Review";
import Task from "./Pages/Task";
import Profile from "./Pages/Profile";
import LayoutWrapper from "./Pages/LayoutWrapper";

// 🔹 Admin pages
import AdminWrapper from "./Admin/AdminDashboardWrapper";
import AdminHome from "./Admin/Pages/AdminHome";
import ProfileManagement from "./Admin/Pages/ProfileManagement";
import DashboardManagement from "./Admin/Pages/DashboardManagement";
import AttendanceManagement from "./Admin/Pages/AttendanceManagement";
import ReviewManagement from "./Admin/Pages/ReviewManagement";
import LeaveRequestManagement from "./Admin/Pages/LeaveRequestManagement";
import AdminMentorManagement from "./Admin/Pages/AdminMentorManagement";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 🔹 Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔹 User Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <Dashboard />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <Dashboard />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendence"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <Attendance />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/course"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <Course />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <Review />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/task"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <Task />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <Profile />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* 🔹 Admin Protected Routes */}

        <Route
  path="/admin-dashboard"
  element={
    <ProtectedRoute>
      <AdminWrapper>
        <AdminHome />
      </AdminWrapper>
    </ProtectedRoute>
  }
/>

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminWrapper>
                <AdminHome />
              </AdminWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-profile"
          element={
            <ProtectedRoute>
              <AdminWrapper>
                <ProfileManagement />
              </AdminWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard-management"
          element={
            <ProtectedRoute>
              <AdminWrapper>
                <DashboardManagement />
              </AdminWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-attendance"
          element={
            <ProtectedRoute>
              <AdminWrapper>
                <AttendanceManagement />
              </AdminWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-review"
          element={
            <ProtectedRoute>
              <AdminWrapper>
                <ReviewManagement />
              </AdminWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-leave"
          element={
            <ProtectedRoute>
              <AdminWrapper>
                <LeaveRequestManagement />
              </AdminWrapper>
            </ProtectedRoute>
          }
        />

        <Route
  path="/admin-mentor-management"
  element={
    <ProtectedRoute>
      <AdminWrapper>
        <AdminMentorManagement />
      </AdminWrapper>
    </ProtectedRoute>
  }
/>



        {/* 🔹 Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
