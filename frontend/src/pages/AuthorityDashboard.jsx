import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import {
  LayoutDashboard, MapPin, Search, FileText, User, LogOut,
  Droplets, AlertTriangle, CheckCircle, XCircle, Shield,
  Users, BarChart3, Bell, PlusCircle, Eye, Forward, Check, X
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

// WHO Thresholds
const WHO_THRESHOLDS = {
  ph: { min: 6.5, max: 8.5, label: "pH" },
  turbidity: { max: 4.0, label: "Turbidity (NTU)" },
  dissolved_oxygen: { min: 6.0, label: "DO (mg/L)" },
  lead: { max: 0.01, label: "Lead (mg/L)" },
  arsenic: { max: 0.01, label: "Arsenic (mg/L)" }
};

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "authority";

  const [pendingReports, setPendingReports] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [aggregateData, setAggregateData] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("moderation"); // moderation, charts, alerts, users
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [newAlert, setNewAlert] = useState({ type: "contamination", message: "", location: "" });
  const [kpis, setKpis] = useState({ pending: 0, activeAlerts: 0, aboveThreshold: 0, verified: 0 });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPendingReports(),
        fetchActiveAlerts(),
        fetchAggregateData(),
        userRole === "admin" && fetchUsers()
      ]);
    } catch (e) {
      console.error("Error loading authority dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReports = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/all?status_filter=pending_authority`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPendingReports(data || []);
        setKpis(prev => ({ ...prev, pending: (data || []).length }));
      }
    } catch (e) { console.error(e); }
  };

  const fetchActiveAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts`, { headers });
      if (res.ok) {
        const data = await res.json();
        const active = (data || []).filter(a => !a.is_resolved);
        setActiveAlerts(active);
        setKpis(prev => ({ ...prev, activeAlerts: active.length }));
      }
    } catch (e) { console.error(e); }
  };

  const fetchAggregateData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/stations/readings/aggregate?days=30`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAggregateData(data?.parameters || {});
      }
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (e) { console.error(e); }
  };

  const handleModerateReport = async (reportId, newStatus) => {
    // Optimistic update
    setPendingReports(prev => prev.filter(r => r.id !== reportId));
    setKpis(prev => ({
      ...prev,
      pending: prev.pending - 1,
      verified: newStatus === "resolved" ? prev.verified + 1 : prev.verified
    }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/${reportId}/status?status=${newStatus}`, {
        method: "PUT",
        headers
      });
      if (!res.ok) {
        fetchPendingReports(); // rollback
      }
    } catch (e) {
      fetchPendingReports(); // rollback
    }
  };

  /**
   * State-Machine Workflow: Update Report Status
   * @param {number} reportId - The ID of the report to update
   * @param {string} newStatus - The new status to set
   */
  const updateReportStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/status`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Failed to update report status to ${newStatus}`);
      }

      const updatedReport = await response.json();
      
      // Refresh the reports list to reflect changes
      fetchPendingReports();
      
      return updatedReport;
    } catch (error) {
      console.error("Error updating report status:", error);
      alert(`Failed to update report status: ${error.message}`);
      throw error;
    }
  };

  /**
   * State-Machine Workflow: Render Actions based on Role and Status
   * Workflow Logic:
   * - NGO: Can 'Resolve' (→ Resolved) or 'Forward' (→ Pending Admin)
   * - Admin: If status is 'Pending Admin', can 'Reject' (→ Rejected) or 'Verify' (→ Pending Authority)
   * - Authority: If status is 'Pending Authority', can 'Resolve' (→ Finalized)
   * 
   * @param {object} report - The report object
   * @returns {JSX.Element|null} - Action buttons or null if no actions available
   */
  const renderActions = (report) => {
    // DEBUG: Log to verify this function is being called
    console.log("🎯 renderActions called for report:", report.id, "Status:", report.status, "Your Role:", userRole);
    
    const currentRole = userRole.toLowerCase();
    const currentStatus = report.status?.toLowerCase() || "pending";

    // NGO Actions
    if (currentRole === "ngo") {
      return (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => updateReportStatus(report.id, "Resolved")}
            className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-sm"
            title="Mark as resolved"
          >
            <Check className="w-3.5 h-3.5" /> Resolve
          </button>
          <button
            onClick={() => updateReportStatus(report.id, "Pending Admin")}
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-sm"
            title="Forward to admin"
          >
            <Forward className="w-3.5 h-3.5" /> Forward
          </button>
        </div>
      );
    }

    // Admin Actions - Only when status is 'Pending Admin'
    if (currentRole === "admin" && currentStatus === "pending admin") {
      return (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => updateReportStatus(report.id, "Rejected")}
            className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-sm"
            title="Reject report"
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>
          <button
            onClick={() => updateReportStatus(report.id, "Pending Authority")}
            className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-sm"
            title="Verify and forward to authority"
          >
            <Check className="w-3.5 h-3.5" /> Verify
          </button>
        </div>
      );
    }

    // Authority Actions - Only when status is 'Pending Authority'
    if (currentRole === "authority" && currentStatus === "pending authority") {
      return (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => updateReportStatus(report.id, "Finalized")}
            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-sm"
            title="Finalize report"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Finalize
          </button>
        </div>
      );
    }

    // No actions available for this role/status combination
    return (
      <span className="text-gray-400 text-xs italic">No actions available</span>
    );
  };

  const handleResolveAlert = async (alertId) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    setKpis(prev => ({ ...prev, activeAlerts: prev.activeAlerts - 1 }));
    try {
      await fetch(`${API_BASE_URL}/api/alerts/${alertId}/resolve`, {
        method: "PUT", headers
      });
    } catch (e) {
      fetchActiveAlerts(); // rollback
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.message || !newAlert.type) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts`, {
        method: "POST",
        headers,
        body: JSON.stringify(newAlert)
      });
      if (res.ok) {
        setShowNewAlertModal(false);
        setNewAlert({ type: "contamination", message: "", location: "" });
        fetchActiveAlerts();
      }
    } catch (e) { console.error(e); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/role`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (e) { console.error(e); }
  };

  const handleGeneratePredictive = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/alerts/predictive/generate`, {
        method: "POST", headers
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Predictive scan complete: ${data.generated} new alerts, ${data.skipped} skipped (duplicates).`);
        fetchActiveAlerts();
      }
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const getTypeColor = (type) => {
    switch(type) {
      case "boil_notice": return "text-orange-700 bg-orange-100";
      case "contamination": return "text-red-700 bg-red-100";
      case "outage": return "text-gray-700 bg-gray-100";
      default: return "text-blue-700 bg-blue-100";
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case "admin": return "bg-red-100 text-red-700";
      case "authority": return "bg-purple-100 text-purple-700";
      case "ngo": return "bg-blue-100 text-blue-700";
      default: return "bg-green-100 text-green-700";
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
        <p className="text-sky-600 font-semibold text-sm animate-pulse">Loading Authority Dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-sky-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-sky-600 text-white flex flex-col p-5 shadow-xl shrink-0">
        <h2 className="text-2xl font-black mb-8 italic flex items-center gap-2 px-1">
          <Droplets className="w-6 h-6" /> WQM
        </h2>
        <div className="mb-6 p-4 bg-sky-700/50 rounded-2xl border border-sky-400/30 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-sky-500/30 rounded-full" />
          <p className="text-[10px] uppercase tracking-widest text-sky-200 mb-1">Authority</p>
          <p className="font-bold text-base leading-tight">{userName}</p>
          <span className="mt-2 inline-block text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase">{userRole}</span>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard",        path: "/dashboard" },
            { icon: Shield,          label: "Authority Portal", path: "/authority/dashboard" },
            { icon: MapPin,          label: "Live Map View",    path: "/map" },
            { icon: AlertTriangle,   label: "System Alerts",   path: "/alerts" },
            { icon: Search,          label: "Search Stations", path: "/search" },
            { icon: FileText,        label: "Reports",          path: "/reports" },
          ].map(({ icon: Icon, label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className={path === "/authority/dashboard" ? "wqm-sidebar-active w-full text-left" : "wqm-sidebar-item w-full text-left"}>
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
            <h1 className="text-3xl font-bold text-sky-900">Authority Dashboard</h1>
            <p className="text-sky-600 font-medium tracking-tight italic">Monitor, moderate, and manage water quality</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleGeneratePredictive} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow flex items-center gap-2 transition">
              <BarChart3 className="w-4 h-4" /> Run Predictive Scan
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Pending Reports" value={kpis.pending} icon={FileText} colorClass="bg-amber-100 text-amber-600" />
          <KpiCard title="Active Alerts" value={kpis.activeAlerts} icon={AlertTriangle} colorClass="bg-red-100 text-red-600" />
          <KpiCard title="Stations Monitored" value={Object.keys(aggregateData).length} icon={MapPin} colorClass="bg-sky-100 text-sky-600" />
          <KpiCard title="Verified Reports" value={kpis.verified} icon={CheckCircle} colorClass="bg-emerald-100 text-emerald-600" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm border border-sky-100">
          {[
            { key: "moderation", label: "Report Moderation", icon: Eye },
            { key: "charts", label: "Water Quality", icon: BarChart3 },
            { key: "alerts", label: "Alert Management", icon: Bell },
            ...(userRole === "admin" ? [{ key: "users", label: "User Management", icon: Users }] : [])
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition ${
                tab === t.key
                  ? "bg-sky-600 text-white shadow-md"
                  : "text-sky-700 hover:bg-sky-50"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Report Moderation Queue */}
        {tab === "moderation" && (
          <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
            {/* VERSION MARKER - Remove after testing */}
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 text-sm font-bold">
              🚀 NEW: State-Machine Workflow v2.0 Active | Your Role: {userRole}
            </div>
            
            <h2 className="text-xl font-bold text-sky-900 mb-6">Report Moderation Queue</h2>
            {pendingReports.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg">All reports have been reviewed. Queue is empty.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-sky-100 text-sky-800 text-sm">
                      <th className="pb-3 font-semibold">Reporter</th>
                      <th className="pb-3 font-semibold">Location</th>
                      <th className="pb-3 font-semibold">Water Source</th>
                      <th className="pb-3 font-semibold">Description</th>
                      <th className="pb-3 font-semibold">Submitted</th>
                      <th className="pb-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingReports.map(report => (
                      <tr key={report.id} className="border-b border-gray-50 hover:bg-sky-50/50 transition">
                        <td className="py-4 font-medium text-gray-800">{report.user_name || report.userName || "Unknown"}</td>
                        <td className="py-4 text-gray-600">{report.location}</td>
                        <td className="py-4 text-gray-600">{report.water_source}</td>
                        <td className="py-4 text-gray-600 max-w-xs truncate">{report.description}</td>
                        <td className="py-4 text-gray-500 text-sm">{new Date(report.created_at).toLocaleDateString()}</td>
                        <td className="py-4 text-center">
                          {renderActions(report)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Water Quality Charts */}
        {tab === "charts" && (
          <div className="space-y-6">
            {Object.entries(WHO_THRESHOLDS).map(([param, thresh]) => {
              const paramData = aggregateData[param] || [];
              return (
                <div key={param} className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-sky-900 mb-4">{thresh.label} — 30 Day Trend</h3>
                  {paramData.length > 0 ? (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={paramData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                          <XAxis dataKey="date" stroke="#0ea5e9" fontSize={11} />
                          <YAxis stroke="#0ea5e9" fontSize={11} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Legend />
                          <Line type="monotone" dataKey="avg_value" stroke="#0ea5e9" strokeWidth={2} name={thresh.label} dot={{ r: 2 }} />
                          {thresh.max && <ReferenceLine y={thresh.max} label={`WHO Max: ${thresh.max}`} stroke="#dc2626" strokeDasharray="5 5" />}
                          {thresh.min && <ReferenceLine y={thresh.min} label={`WHO Min: ${thresh.min}`} stroke="#ea580c" strokeDasharray="5 5" />}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No data available for {thresh.label}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Alert Management */}
        {tab === "alerts" && (
          <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-sky-900">Active Alerts</h2>
              <button
                onClick={() => setShowNewAlertModal(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" /> Issue New Alert
              </button>
            </div>
            {activeAlerts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No active alerts. System is stable.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-sky-100 text-sky-800 text-sm">
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Message</th>
                      <th className="pb-3 font-semibold">Location</th>
                      <th className="pb-3 font-semibold">Source</th>
                      <th className="pb-3 font-semibold">Issued</th>
                      <th className="pb-3 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAlerts.map(alert => (
                      <tr key={alert.id} className="border-b border-gray-50 hover:bg-sky-50/50 transition">
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getTypeColor(alert.type)}`}>
                            {alert.type?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 text-gray-700 max-w-sm truncate">{alert.message}</td>
                        <td className="py-4 text-gray-500">{alert.location || "N/A"}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            alert.source === "predictive" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            {alert.source || "manual"}
                          </span>
                        </td>
                        <td className="py-4 text-gray-500 text-sm">{new Date(alert.issued_at).toLocaleString()}</td>
                        <td className="py-4 text-center">
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition mx-auto"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* User Management (Admin Only) */}
        {tab === "users" && userRole === "admin" && (
          <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-sky-900 mb-6">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-sky-100 text-sky-800 text-sm">
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-sky-50/50 transition">
                      <td className="py-4 font-medium text-gray-800">{user.name}</td>
                      <td className="py-4 text-gray-600">{user.email}</td>
                      <td className="py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-0 cursor-pointer ${getRoleBadge(user.role)}`}
                        >
                          <option value="citizen">Citizen</option>
                          <option value="ngo">NGO</option>
                          <option value="authority">Authority</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-4 text-gray-500">{user.location || "N/A"}</td>
                      <td className="py-4 text-gray-500 text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* New Alert Modal */}
        {showNewAlertModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold text-sky-900 mb-6">Issue New Alert</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Alert Type</label>
                  <select
                    value={newAlert.type}
                    onChange={e => setNewAlert(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    <option value="boil_notice">Boil Notice</option>
                    <option value="contamination">Contamination</option>
                    <option value="outage">Outage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                  <textarea
                    value={newAlert.message}
                    onChange={e => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none h-24 resize-none"
                    placeholder="Describe the alert..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newAlert.location}
                    onChange={e => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="e.g., Delhi - Yamuna River"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewAlertModal(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAlert}
                  disabled={!newAlert.message}
                  className="bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white px-6 py-2.5 rounded-xl font-bold shadow transition"
                >
                  Issue Alert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
