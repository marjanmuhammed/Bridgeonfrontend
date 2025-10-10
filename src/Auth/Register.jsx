import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../Api/AuthApi";
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
    if (errorMsg) setErrorMsg("");
  };

  const validateForm = () => {
    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) {
      setErrorMsg("⚠️ Please fill all fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("⚠️ Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setErrorMsg("⚠️ Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMsg("⚠️ Passwords do not match");
      return false;
    }

    setErrorMsg("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await register({
        email: formData.email,
        password: formData.password,
      });

      console.log("✅ Register success:", res);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";

    if (errorMessage === "ALREADY_REGISTERED") {
    setErrorMsg("❌ This email is already registered. Please try logging in.");
  } else if (errorMessage === "EMAIL_NOT_REGISTERED") {
    setErrorMsg("⚠️ Email exists but not registered. Contact admin to complete registration.");
  } else if (errorMessage === "EMAIL_NOT_IN_SYSTEM") {
    setErrorMsg("⚠️ Email not found in system. Contact admin to add your email.");
  } else {
    setErrorMsg(errorMessage);
  }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 sm:w-60 sm:h-60 md:w-72 md:h-72 bg-pink-500 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-purple-500 opacity-10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="w-full max-w-sm mx-auto">
        <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/50">
          <div className="flex justify-center mb-4">
            <img src="/download.png" alt="Company Logo" className="w-40 h-32 object-contain" />
          </div>

          <h2 className="text-xl font-bold text-white text-center mb-2">Create Account</h2>
          <p className="text-gray-300 text-center text-sm mb-4">Sign up to get started</p>

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
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-pink-50 border border-pink-200 rounded-lg py-2 px-10 pr-10 text-gray-900 placeholder-pink-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500 hover:text-pink-700 transition-all p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-pink-50 border border-pink-200 rounded-lg py-2 px-10 pr-10 text-gray-900 placeholder-pink-400 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={toggleConfirmPasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-500 hover:text-pink-700 transition-all p-1">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating Account...
                </>
              ) : "Create Account"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-300 text-xs">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-pink-400 hover:text-pink-300 hover:underline transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Register;
