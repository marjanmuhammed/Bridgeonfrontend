import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../Api/AuthApi";
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axiosInstance from "../Utils/Axios";

const Login = () => {
  const navigate = useNavigate();

  // states
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // handlers
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
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
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  setErrorMsg("");

  try {
    // Step 1: Check if email exists
    const check = await axiosInstance.get(`/Auth/check-email?email=${formData.email}`);
    const userData = check.data.data; // ✅ Correct access

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
