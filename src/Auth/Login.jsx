import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, changePassword } from '../Api/AuthApi';
import { Mail, Lock, Eye, EyeOff, X, CheckCircle, ArrowLeft } from 'lucide-react';
import axiosInstance from '../Utils/Axios';
import { Renderer, Program, Mesh, Triangle, Vec3 } from 'ogl';

// Orb Component
function Orb({ hue = 0, hoverIntensity = 0.2, rotateOnHover = true, forceHoverState = false }) {
  const ctnDom = useRef(null);

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    varying vec2 vUv;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }
    
    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }
    
    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    vec3 hash33(vec3 p3) {
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }

    float snoise3(vec3 p) {
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0, d0),
        dot(d1, d1),
        dot(d2, d2),
        dot(d3, d3)
      ), 0.0);
      vec4 n = h * h * h * h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    vec4 extractAlpha(vec3 colorIn) {
      float a = max(max(colorIn.r, colorIn.g), colorIn.b);
      return vec4(colorIn.rgb / (a + 1e-5), a);
    }

    const vec3 baseColor1 = vec3(0.611765, 0.262745, 0.996078);
    const vec3 baseColor2 = vec3(0.298039, 0.760784, 0.913725);
    const vec3 baseColor3 = vec3(0.062745, 0.078431, 0.600000);
    const float innerRadius = 0.6;
    const float noiseScale = 0.65;

    float light1(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * attenuation);
    }
    float light2(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * dist * attenuation);
    }

    vec4 draw(vec2 uv) {
      vec3 color1 = adjustHue(baseColor1, hue);
      vec3 color2 = adjustHue(baseColor2, hue);
      vec3 color3 = adjustHue(baseColor3, hue);
      
      float ang = atan(uv.y, uv.x);
      float len = length(uv);
      float invLen = len > 0.0 ? 1.0 / len : 0.0;
      
      float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
      float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
      float d0 = distance(uv, (r0 * invLen) * uv);
      float v0 = light1(1.0, 10.0, d0);
      v0 *= smoothstep(r0 * 1.05, r0, len);
      float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;
      
      float a = iTime * -1.0;
      vec2 pos = vec2(cos(a), sin(a)) * r0;
      float d = distance(uv, pos);
      float v1 = light2(1.5, 5.0, d);
      v1 *= light1(1.0, 50.0, d0);
      
      float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
      float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
      
      vec3 col = mix(color1, color2, cl);
      col = mix(color3, col, v0);
      col = (col + v1) * v2 * v3;
      col = clamp(col, 0.0, 1.0);
      
      return extractAlpha(col);
    }

    vec4 mainImage(vec2 fragCoord) {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      
      float angle = rot;
      float s = sin(angle);
      float c = cos(angle);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
      
      uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);
      
      return draw(uv);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = vec4(col.rgb * col.a, col.a);
    }
  `;

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: hoverIntensity }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + 'px';
      gl.canvas.style.height = height + 'px';
      program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    let targetHover = 0;
    let lastTime = 0;
    let currentRot = 0;
    const rotationSpeed = 0.3;

    const handleMouseMove = e => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;
      const size = Math.min(width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const uvX = ((x - centerX) / size) * 2.0;
      const uvY = ((y - centerY) / size) * 2.0;

      if (Math.sqrt(uvX * uvX + uvY * uvY) < 0.8) {
        targetHover = 1;
      } else {
        targetHover = 0;
      }
    };

    const handleMouseLeave = () => {
      targetHover = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    let rafId;
    const update = t => {
      rafId = requestAnimationFrame(update);
      const dt = (t - lastTime) * 0.001;
      lastTime = t;
      program.uniforms.iTime.value = t * 0.001;
      program.uniforms.hue.value = hue;
      program.uniforms.hoverIntensity.value = hoverIntensity;

      const effectiveHover = forceHoverState ? 1 : targetHover;
      program.uniforms.hover.value += (effectiveHover - program.uniforms.hover.value) * 0.1;

      if (rotateOnHover && effectiveHover > 0.5) {
        currentRot += dt * rotationSpeed;
      }
      program.uniforms.rot.value = currentRot;

      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

  return <div ref={ctnDom} className="orb-container" />;
}

// Main Login Component
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Orb Background Animation */}
      <div className="absolute inset-0 z-0">
        <Orb
          hoverIntensity={0.3}
          rotateOnHover={true}
          hue={320}
          forceHoverState={false}
        />
      </div>

      {/* Login Form - Smaller and Transparent */}
      <div className="w-full max-w-xs mx-auto relative z-10">
        <div className="relative bg-transparent rounded-2xl p-6">
          {/* Logo */}
        <div className="flex justify-center mb-3">
  <img src="/Logo.jpg" alt="Company Logo" className="w-20 h-16 object-contain" />
</div>


          <h2 className="text-lg font-bold text-white text-center mb-1">Welcome Back Developer</h2>
          <p className="text-gray-300 text-center text-xs mb-3">Please sign in to your account</p>

          {errorMsg && (
            <div className="mb-2 p-2 bg-red-500/20 border border-red-400/50 rounded-lg text-white text-center text-xs font-medium animate-shake">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Email */}
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-pink-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-1.5 px-8 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-pink-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-1.5 px-8 pr-8 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-pink-300 transition-all p-0.5"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
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
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-1.5 rounded-lg hover:from-pink-600 hover:to-rose-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-1 text-xs"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-3 text-center">
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
          <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-gray-700/50 w-full max-w-sm relative z-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-white">
                {forgotPasswordStep === 1 ? "Verify Your Account" : "Set New Password"}
              </h3>
              <button
                onClick={closeForgotPassword}
                className="text-gray-400 hover:text-white transition-all p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-gray-300 text-xs mb-3">
              {forgotPasswordStep === 1 
                ? "Enter your email and current password to verify your identity."
                : "Now you can set your new password."
              }
            </p>

            {forgotPasswordError && (
              <div className="mb-2 p-2 bg-red-500/20 border border-red-400/50 rounded-lg text-white text-center text-xs font-medium animate-shake">
                {forgotPasswordError}
              </div>
            )}

            {forgotPasswordSuccess && (
              <div className="mb-2 p-2 bg-green-500/20 border border-green-400/50 rounded-lg text-white text-center text-xs font-medium flex items-center justify-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {forgotPasswordSuccess}
              </div>
            )}

            {/* Step 1: Verify Email and Current Password */}
            {forgotPasswordStep === 1 && (
              <form onSubmit={handleVerifyCurrentPassword} className="space-y-2">
                {/* Email */}
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-pink-400" />
                    <input
                      type="email"
                      name="email"
                      value={forgotPasswordData.email}
                      onChange={handleForgotPasswordChange}
                      required
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-1.5 px-8 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-pink-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={forgotPasswordData.currentPassword}
                      onChange={handleForgotPasswordChange}
                      required
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-1.5 px-8 pr-8 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-pink-300 transition-all p-0.5"
                    >
                      {showCurrentPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-1.5 rounded-lg hover:from-pink-600 hover:to-rose-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-1 text-xs"
                >
                  {forgotPasswordLoading ? "Verifying..." : "Verify & Continue"}
                </button>
              </form>
            )}

            {/* Step 2: Set New Password */}
            {forgotPasswordStep === 2 && (
              <form onSubmit={handleSetNewPassword} className="space-y-2">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={goBackToStep1}
                  className="flex items-center gap-1 text-pink-400 hover:text-pink-300 text-xs font-medium mb-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to verification
                </button>

                {/* New Password */}
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-pink-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={forgotPasswordData.newPassword}
                      onChange={handleForgotPasswordChange}
                      required
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-1.5 px-8 pr-8 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-pink-300 transition-all p-0.5"
                    >
                      {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-gray-300 text-xs font-medium mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-pink-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={forgotPasswordData.confirmPassword}
                      onChange={handleForgotPasswordChange}
                      required
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-1.5 px-8 pr-8 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-pink-300 transition-all p-0.5"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-1.5 rounded-lg hover:from-pink-600 hover:to-rose-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-1 text-xs"
                >
                  {forgotPasswordLoading ? "Changing Password..." : "Change Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .orb-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }
      `}</style>
    </div>
  );
};

export default Login;