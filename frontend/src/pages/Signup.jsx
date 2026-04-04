import { API_BASE_URL } from '../config';
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Droplets, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const ROLES = [
  { value: "citizen",   label: "Citizen",   desc: "Report and track local water quality", emoji: "🏘️" },
  { value: "ngo",       label: "NGO",        desc: "Manage partnerships and collaborations", emoji: "🤝" },
  { value: "authority", label: "Authority",  desc: "Monitor and enforce water standards",  emoji: "🏛️" },
  { value: "admin",     label: "Admin",      desc: "Full platform administration access",   emoji: "⚙️" },
];

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", role: "citizen", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const passwordMatch =
    formData.confirmPassword === "" || formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordMatch) { alert("Passwords do not match!"); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Registration Successful! Please sign in.");
        navigate("/");
      } else {
        alert(data.detail || data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Server Error. The backend might be restarting or there is a database issue (500). Please try again in a few seconds or check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 p-4">
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-w-5xl w-full">

        {/* Left Panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-sky-700 to-sky-500 flex flex-col items-center justify-center p-10 text-white relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full" />
          <div className="relative z-10 text-center">
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl inline-block mb-6 border border-white/30 shadow-lg">
              <Droplets className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-2">Join WaterWatch</h1>
            <p className="text-sky-100 text-sm leading-relaxed max-w-xs">
              Be part of a global network protecting clean water access for everyone.
            </p>
            <div className="mt-8 space-y-3 text-left">
              {["Real-time water quality alerts", "Live station map view", "Collaboration tools for NGOs", "Role-based access control"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-sky-100">
                  <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-black text-slate-800 mb-1">Create your account</h2>
            <p className="text-gray-400 text-sm mb-7">Fill in your details to get started</p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="wqm-label">Full Name</label>
                <input
                  type="text" name="name" required placeholder="Jane Smith"
                  onChange={handleChange} className="wqm-input"
                />
              </div>

              <div>
                <label className="wqm-label">Email Address</label>
                <input
                  type="email" name="email" required placeholder="jane@company.com"
                  onChange={handleChange} className="wqm-input"
                />
              </div>

              {/* Role Selector Pill Grid */}
              <div>
                <label className="wqm-label">Join as</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                        formData.role === r.value
                          ? "border-sky-500 bg-sky-50"
                          : "border-gray-200 hover:border-sky-300 hover:bg-sky-50/50"
                      }`}
                    >
                      <input
                        type="radio" name="role" value={r.value}
                        checked={formData.role === r.value}
                        onChange={handleChange} className="sr-only"
                      />
                      <span className="text-lg">{r.emoji}</span>
                      <div>
                        <p className={`text-xs font-bold ${formData.role === r.value ? "text-sky-700" : "text-slate-700"}`}>{r.label}</p>
                        <p className="text-[10px] text-gray-400 leading-tight">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="wqm-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} name="password"
                    required placeholder="••••••••" onChange={handleChange}
                    className="wqm-input pr-11"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="wqm-label">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password" name="confirmPassword" required placeholder="••••••••"
                    onChange={handleChange}
                    className={`wqm-input pr-11 ${
                      formData.confirmPassword && !passwordMatch ? "border-red-400 focus:ring-red-400" : ""
                    }`}
                  />
                  {formData.confirmPassword && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordMatch
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : <XCircle className="w-4 h-4 text-red-400" />}
                    </span>
                  )}
                </div>
                {formData.confirmPassword && !passwordMatch && (
                  <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
                )}
              </div>

              <button
                type="submit" disabled={loading || !passwordMatch}
                className="wqm-btn-primary w-full"
              >
                {loading ? "Creating Account…" : "Create Account"}
              </button>
            </form>

            <p className="text-sm text-center mt-6 text-gray-500">
              Already have an account?{" "}
              <Link to="/" className="text-sky-600 font-bold hover:text-sky-800 transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;