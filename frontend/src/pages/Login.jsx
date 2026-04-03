import { API_BASE_URL } from '../config';
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Droplets, Eye, EyeOff, Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userRole", data.user.role);
        navigate("/dashboard");
      } else {
        alert(data.detail || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      // Fallback to legacy endpoint
      try {
        const legacyResponse = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const legacyData = await legacyResponse.json();
        if (legacyResponse.ok) {
          localStorage.setItem("token", legacyData.token || legacyData.access_token);
          localStorage.setItem("userName", legacyData.user?.name || "User");
          localStorage.setItem("userRole", legacyData.user?.role || "citizen");
          navigate("/dashboard");
          return;
        }
      } catch {}
      alert("Cannot connect to server. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google-login`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userRole", data.user.role);
        navigate("/dashboard");
      } else {
        alert(data.detail);
      }
    } catch {
      alert("Google login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 p-4">
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-w-6xl w-full min-h-[80vh]">

        {/* Left Panel — Branding */}
        <div className="md:w-5/12 bg-gradient-to-br from-sky-700 to-sky-500 flex flex-col items-center justify-center p-10 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full" />

          <div className="relative z-10 text-center">
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl inline-block mb-6 border border-white/30 shadow-lg">
              <Droplets className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-2 tracking-tight">WaterWatch</h1>
            <p className="text-sky-100 text-sm leading-relaxed max-w-xs">
              Real-time water quality intelligence for communities, NGOs, and authorities worldwide.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 text-center">
              {[
                { label: "Stations", value: "500+" },
                { label: "Countries", value: "2" },
                { label: "Alerts/day", value: "1.2k" },
                { label: "Uptime", value: "99.9%" },
              ].map((s) => (
                <div key={s.label} className="bg-white/15 rounded-xl px-3 py-2 backdrop-blur-sm border border-white/20">
                  <p className="text-lg font-black">{s.value}</p>
                  <p className="text-sky-200 text-[11px] uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-black text-slate-800 mb-1">Welcome back</h2>
            <p className="text-gray-400 text-sm mb-8">Sign in to your WaterWatch account</p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="wqm-label">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  required
                  placeholder="name@company.com"
                  onChange={handleChange}
                  className="wqm-input"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="wqm-label mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs text-sky-600 hover:text-sky-800 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="wqm-input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="wqm-btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing In…</>
                ) : "Sign In"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 uppercase tracking-wider">or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full border border-gray-200 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium text-gray-600"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Continue with Google
            </button>

            <p className="text-sm text-center mt-8 text-gray-500">
              Don't have an account?{" "}
              <Link to="/signup" className="text-sky-600 font-bold hover:text-sky-800 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
