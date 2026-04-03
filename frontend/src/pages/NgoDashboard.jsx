import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Search,
  FileText,
  User,
  LogOut,
  Droplets,
  AlertTriangle,
  Briefcase,
  Users,
  CheckCircle,
  PlusCircle,
  Link as LinkIcon
} from "lucide-react";

const KpiCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="wqm-stat-card flex items-center gap-4">
    <div className={`p-4 rounded-2xl flex-shrink-0 ${colorClass}`}>
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

const NgoDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "ngo";

  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    project_name: "",
    ngo_name: "",
    contact_email: ""
  });
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/collaborations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCollaborations(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch collaborations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/collaborations`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowForm(false);
        setFormData({ project_name: "", ngo_name: "", contact_email: "" });
        fetchCollaborations(); // Refresh list
      } else {
        const errData = await res.json();
        setSubmitError(errData.detail || "Failed to create collaboration");
      }
    } catch (error) {
      setSubmitError("Network error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-sky-50 flex-col gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-sky-500" />
          </div>
        </div>
        <p className="text-sky-600 font-semibold text-sm animate-pulse">Loading NGO Hub…</p>
      </div>
    );
  }

  // Calculate KPIs
  const activeCount = collaborations.filter(c => c.status === "active").length;
  const totalReportsCount = collaborations.reduce((sum, c) => sum + (c.report_count || 0), 0);
  const uniqueNgosCount = new Set(collaborations.map(c => c.ngo_name)).size;

  return (
    <div className="min-h-screen flex bg-sky-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-sky-600 text-white flex flex-col p-5 shadow-xl shrink-0">
        <h2 className="text-2xl font-black mb-8 italic flex items-center gap-2 px-1">
          <Droplets className="w-6 h-6" /> WQM
        </h2>
        <div className="mb-6 p-4 bg-sky-700/50 rounded-2xl border border-sky-400/30 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-sky-500/30 rounded-full" />
          <p className="text-[10px] uppercase tracking-widest text-sky-200 mb-1">Partner</p>
          <p className="font-bold text-base leading-tight">{userName}</p>
          <span className="mt-2 inline-block text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">{userRole}</span>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard",       path: "/dashboard" },
            { icon: Briefcase,       label: "Partner Hub",     path: "/ngo/dashboard" },
            { icon: MapPin,          label: "Live Map View",   path: "/map" },
            { icon: Search,          label: "Search Stations", path: "/search" },
            { icon: AlertTriangle,   label: "System Alerts",  path: "/alerts" },
          ].map(({ icon: Icon, label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className={path === "/ngo/dashboard" ? "wqm-sidebar-active w-full text-left" : "wqm-sidebar-item w-full text-left"}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout}
          className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-900">NGO Partner Dashboard</h1>
            <p className="text-sky-600 font-medium tracking-tight mt-1">Manage collaborations and monitor station reports</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            New Collaboration
          </button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KpiCard 
            title="Active Partnerships" 
            value={activeCount} 
            icon={Briefcase} 
            colorClass="bg-blue-100 text-blue-600" 
          />
          <KpiCard 
            title="Total Reports Linked" 
            value={totalReportsCount} 
            icon={FileText} 
            colorClass="bg-emerald-100 text-emerald-600" 
          />
          <KpiCard 
            title="NGO Network Count" 
            value={uniqueNgosCount} 
            icon={Users} 
            colorClass="bg-purple-100 text-purple-600" 
          />
        </div>

        {/* Form Overlay Area (Inline) */}
        {showForm && (
          <div className="bg-white border-2 border-sky-100 rounded-3xl p-8 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold text-sky-900 mb-6 italic">Initiate New Collaboration</h2>
            {submitError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold">
                {submitError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Project/Initiative Name</label>
                <input 
                  type="text"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  placeholder="e.g. Ganges Clean-up"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Organization/NGO Name</label>
                <input 
                  type="text"
                  name="ngo_name"
                  value={formData.ngo_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  placeholder="e.g. WaterAid India"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Primary Contact Email</label>
                <input 
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  required
                  className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  placeholder="contact@ngo.org"
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition"
                >
                  Submit Partnership
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Collaborations Table */}
        <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-sky-900 mb-6">Active Resource Collaborations</h2>
          {collaborations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg">No active collaborations found.</p>
              <p className="text-sm">Initiate a new collaboration to start tracking progress.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-sky-100 text-sky-800 text-sm">
                    <th className="pb-3 font-semibold">Project Details</th>
                    <th className="pb-3 font-semibold">NGO / Org</th>
                    <th className="pb-3 font-semibold">Contact Email</th>
                    <th className="pb-3 font-semibold">Initiated</th>
                    <th className="pb-3 font-semibold text-center">Linked Reports</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {collaborations.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-sky-50/50 transition-colors">
                      <td className="py-4 font-bold text-sky-900">{c.project_name}</td>
                      <td className="py-4 text-gray-700 font-medium">{c.ngo_name}</td>
                      <td className="py-4 text-gray-500">{c.contact_email}</td>
                      <td className="py-4 text-gray-500">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-700 px-3 py-1 rounded-full font-bold">
                          <FileText className="w-3.5 h-3.5" />
                          {c.report_count}
                        </span>
                      </td>
                      <td className="py-4">
                        {c.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-md font-semibold text-xs border border-green-100">
                            <CheckCircle className="w-3.5 h-3.5" /> ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md font-semibold text-xs border border-gray-200">
                            INACTIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NgoDashboard;
