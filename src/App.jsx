
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
import AdminHolidayManagement from "./Admin/Pages/AdminHolidayManagement ";

// 🔹 Mentor pages - IMPORT THE CORRECT COMPONENTS
import MentorHome from "./Mentor/MentorHome";
import MentorProfileManagement from "./Mentor/MentorProfileManagement";
import MentorDashboardManagement from "./Mentor/MentorDashboard";
import MentorSidebar from "./Mentor/MentorSidebar";
import MentorAttendanceDashboard from "./Mentor/MentorAttendance";
import MentorReview from "./Mentor/MentorReview";
import MentorLeaveManagement from "./Mentor/MentorLeaveManagement";
import Placements from "./Pages/Placements";
import PlacementsPage from "./Pages/Placements";
import ContactUsPage from "./Pages/ContactUsPage";
import { ThemeProvider } from "./contexts/ThemeContext";

const App = () => {
  return (
    <ThemeProvider> 
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
        /><Route
          path="/Placements"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <PlacementsPage />
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
        /> <Route
          path="/ContactUsPage"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <ContactUsPage />
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
        <Route
          path="/admin-holidays"
          element={
            <ProtectedRoute>
              <AdminWrapper>
                <AdminHolidayManagement />
              </AdminWrapper>
            </ProtectedRoute>
          }
        />

        {/* 🔹 Mentor Protected Routes - FIXED ROUTING */}
        <Route
          path="/mentor-home"
          element={
            <ProtectedRoute>
              <MentorSidebar>
                <MentorHome />
              </MentorSidebar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor-profileManagement"
          element={
            <ProtectedRoute>
              <MentorSidebar>
                <MentorProfileManagement />
              </MentorSidebar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor-dashboardmanagement"
          element={
            <ProtectedRoute>
              <MentorSidebar>
                <MentorDashboardManagement />
              </MentorSidebar>
            </ProtectedRoute>
          }
        />
         <Route
          path="/mentor-attendance"
          element={
            <ProtectedRoute>
              <MentorSidebar>
                <MentorAttendanceDashboard />
              </MentorSidebar>
            </ProtectedRoute>
          }
        />  
        
          <Route
          path="/mentor-reviews"
          element={
            <ProtectedRoute>
              <MentorSidebar>
                <MentorReview />
              </MentorSidebar>
            </ProtectedRoute>
          }
        />


          <Route
          path="/mentor-leave"
          element={
            <ProtectedRoute>
              <MentorSidebar>
                <MentorLeaveManagement />
              </MentorSidebar>
            </ProtectedRoute>
          }
        />

        {/* 🔹 Catch-all redirect */}
        {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
      </Routes>
    </Router>
     </ThemeProvider>
  );
};

export default App;