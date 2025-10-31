import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, changePassword } from "../Api/AuthApi";
import { Mail, Lock, Eye, EyeOff, X, CheckCircle, ArrowLeft } from 'lucide-react';
import axiosInstance from "../Utils/Axios";

const Login = () => {
  const navigate = useNavigate();

  // states
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Verify, 2: Set New Password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");

  // handlers
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({ 
      ...forgotPasswordData, 
      [e.target.name]: e.target.value 
    });
    if (forgotPasswordError) setForgotPasswordError("");
    if (forgotPasswordSuccess) setForgotPasswordSuccess("");
  };

  const validateForm = () => {
    const { email, password } = formData;
    if (!email || !password) {
      setErrorMsg("⚠️ Please fill all fields");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("⚠️ Please enter a valid email address");
      return false;
    }
    return true;
  };

  const validateForgotPasswordStep1 = () => {
    const { email, currentPassword } = forgotPasswordData;

    if (!email || !currentPassword) {
      setForgotPasswordError("⚠️ Please fill all fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setForgotPasswordError("⚠️ Please enter a valid email address");
      return false;
    }

    return true;
  };

  const validateForgotPasswordStep2 = () => {
    const { newPassword, confirmPassword } = forgotPasswordData;

    if (!newPassword || !confirmPassword) {
      setForgotPasswordError("⚠️ Please fill all fields");
      return false;
    }

    if (newPassword.length < 6) {
      setForgotPasswordError("⚠️ New password must be at least 6 characters long");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setForgotPasswordError("⚠️ New passwords don't match");
      return false;
    }

    if (forgotPasswordData.currentPassword === newPassword) {
      setForgotPasswordError("⚠️ New password must be different from current password");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      // Step 1: Check if email exists
      const check = await axiosInstance.get(`/Auth/check-email?email=${formData.email}`);
      const userData = check.data.data;

      // Step 2: Handle cases
      if (!userData.passwordExists) {
        setErrorMsg("⚠️ Email is verified. Please register first.");
        setLoading(false);
        return;
      }

      if (userData.isBlocked) {
        setErrorMsg("❌ Your account is blocked. Contact admin.");
        setLoading(false);
        return;
      }

      // Step 3: Proceed with login
      const res = await axiosInstance.post("/Auth/login", formData);
      const data = res.data.data;

      // Step 4: Navigate based on role
      if (data.role === "Admin") {
        navigate("/admin-dashboard");
      } else if (data.role === "Mentor") {
        navigate("/mentor-home");
      } else {
        navigate("/home");
      }

    } catch (error) {
      if (error.response?.status === 404) {
        setErrorMsg("❌ Email not found");
      } else if (error.response?.status === 401) {
        setErrorMsg("Invalid email or password.");
      } else {
        setErrorMsg(error.response?.data?.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Verify email and current password
  const handleVerifyCurrentPassword = async (e) => {
    e.preventDefault();
    if (!validateForgotPasswordStep1()) return;

    setForgotPasswordLoading(true);
    setForgotPasswordError("");

    try {
      // First try to login with the provided credentials to verify
      const loginResponse = await axiosInstance.post("/Auth/login", {
        email: forgotPasswordData.email,
        password: forgotPasswordData.currentPassword
      });

      // If login successful, store user data and move to step 2
      if (loginResponse.data.status === 200) {
        setVerifiedUser(loginResponse.data.data);
        setForgotPasswordStep(2);
        setForgotPasswordError("");
        console.log("✅ Step 1: Verification successful");
      }

    } catch (error) {
      if (error.response?.status === 401) {
        setForgotPasswordError("❌ Invalid email or current password");
      } else if (error.response?.status === 404) {
        setForgotPasswordError("❌ Email not found");
      } else {
        setForgotPasswordError(error.response?.data?.message || "Verification failed");
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Step 2: Set new password
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (!validateForgotPasswordStep2()) return;

    setForgotPasswordLoading(true);
    setForgotPasswordError("");

    try {
      console.log("🔄 Step 2: Attempting to change password...");
      console.log("Current Password:", forgotPasswordData.currentPassword);
      console.log("New Password:", forgotPasswordData.newPassword);
      console.log("Confirm Password:", forgotPasswordData.confirmPassword);

      const response = await changePassword({
        currentPassword: forgotPasswordData.currentPassword,
        newPassword: forgotPasswordData.newPassword,
        confirmPassword: forgotPasswordData.confirmPassword // Add this
      });

      console.log("📦 Backend Response:", response);

      // Check both possible response structures
      if (response.status === 200 || (response.data && response.data.status === 200)) {
        setForgotPasswordSuccess("✅ Password changed successfully! Please login with your new password.");

        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordStep(1);
          setForgotPasswordData({
            email: "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          setVerifiedUser(null);
          setForgotPasswordSuccess("");
        }, 3000);
      } else {
        setForgotPasswordError(response.message || response.data?.message || "❌ Failed to change password");
      }
    } catch (error) {
      console.error("❌ Password change error:", error);
      console.error("Error response:", error.response);

      if (error.response?.status === 400) {
        // Show validation errors from backend
        if (error.response.data?.errors) {
          const validationErrors = error.response.data.errors;
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          setForgotPasswordError(`❌ Validation errors: ${errorMessages}`);
        } else {
          setForgotPasswordError("❌ Current password is incorrect or validation failed.");
        }
      } else if (error.response?.status === 404) {
        setForgotPasswordError("❌ User not found");
      } else if (error.response?.data?.message) {
        setForgotPasswordError(`❌ ${error.response.data.message}`);
      } else {
        setForgotPasswordError("❌ Failed to change password. Please try again.");
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const openForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotPasswordStep(1);
    setForgotPasswordData({
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setVerifiedUser(null);
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    setVerifiedUser(null);
  };

  const goBackToStep1 = () => {
    setForgotPasswordStep(1);
    setForgotPasswordError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/50">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src="/download.png" alt="Company Logo" className="w-40 h-32 object-contain" />
          </div>

          <h2 className="text-xl font-bold text-white text-center mb-2">Welcome Back</h2>
          <p className="text-gray-300 text-center text-sm mb-4">Please sign in to your account</p>

          {errorMsg && (
            <div className="mb-3 p-2 bg-red-500/20 border border-red-400/50 rounded-lg text-white text-center text-sm font-medium animate-shake">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-pink-50 border border-pink-200 rounded-lg py-2 px-10 text-gray-900 placeholder-pink-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-pink-50 border border-pink-200 rounded-lg py-2 px-10 pr-10 text-gray-900 placeholder-pink-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500 hover:text-pink-700 transition-all p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-pink-400 hover:text-pink-300 text-xs font-medium hover:underline transition-all"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-300 text-xs">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-pink-400 hover:text-pink-300 hover:underline transition-all">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/50 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                {forgotPasswordStep === 1 ? "Verify Your Account" : "Set New Password"}
              </h3>
              <button
                onClick={closeForgotPassword}
                className="text-gray-400 hover:text-white transition-all p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-300 text-sm mb-4">
              {forgotPasswordStep === 1 
                ? "Enter your email and current password to verify your identity."
                : "Now you can set your new password."
              }
            </p>

            {forgotPasswordError && (
              <div className="mb-3 p-2 bg-red-500/20 border border-red-400/50 rounded-lg text-white text-center text-sm font-medium animate-shake">
                {forgotPasswordError}
              </div>
            )}

            {forgotPasswordSuccess && (
              <div className="mb-3 p-2 bg-green-500/20 border border-green-400/50 rounded-lg text-white text-center text-sm font-medium flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {forgotPasswordSuccess}
              </div>
            )}

            {/* Step 1: Verify Email and Current Password */}
            {forgotPasswordStep === 1 && (
              <form onSubmit={handleVerifyCurrentPassword} className="space-y-3">
                {/* Email */}
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <input
                      type="email"
                      name="email"
                      value={forgotPasswordData.email}
                      onChange={handleForgotPasswordChange}
                      required
                      className="w-full bg-pink-50 border border-pink-200 rounded-lg py-2 px-10 text-gray-900 placeholder-pink-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={forgotPasswordData.currentPassword}
                      onChange={handleForgotPasswordChange}
                      required
                      className="w-full bg-pink-50 border border-pink-200 rounded-lg py-2 px-10 pr-10 text-gray-900 placeholder-pink-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500 hover:text-pink-700 transition-all p-1"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {forgotPasswordLoading ? "Verifying..." : "Verify & Continue"}
                </button>
              </form>
            )}

            {/* Step 2: Set New Password */}
            {forgotPasswordStep === 2 && (
              <form onSubmit={handleSetNewPassword} className="space-y-3">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={goBackToStep1}
                  className="flex items-center gap-2 text-pink-400 hover:text-pink-300 text-sm font-medium mb-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to verification
                </button>

                {/* New Password */}
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={forgotPasswordData.newPassword}
                      onChange={handleForgotPasswordChange}
                      required
                      className="w-full bg-pink-50 border border-pink-200 rounded-lg py-2 px-10 pr-10 text-gray-900 placeholder-pink-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500 hover:text-pink-700 transition-all p-1"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={forgotPasswordData.confirmPassword}
                      onChange={handleForgotPasswordChange}
                      required
                      className="w-full bg-pink-50 border border-pink-200 rounded-lg py-2 px-10 pr-10 text-gray-900 placeholder-pink-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500 hover:text-pink-700 transition-all p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {forgotPasswordLoading ? "Changing Password..." : "Change Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Debug CSS */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;