import { API_BASE_URL } from '../config';
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  LayoutDashboard,
  MapPin,
  Search,
  FileText,
  User,
  LogOut,
  Droplets,
  AlertTriangle,
  Clock,
  Info,
  CheckCircle,
  Globe
} from "lucide-react";

const AlertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "citizen";

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [isUsaAlert, setIsUsaAlert] = useState(false);

  useEffect(() => {
    // Check if USA alert data was passed via navigation state
    if (location.state?.alertData) {
      setAlert(location.state.alertData);
      setIsUsaAlert(true);
      setLoading(false);
    } else if (id && !id.startsWith('usa-')) {
      fetchAlertDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchAlertDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAlert(data);
      } else {
        console.error("Failed to fetch alert details");
      }
    } catch (error) {
      console.error("Error fetching alert details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async () => {
    if (isUsaAlert) return; // Can't resolve USGS-generated alerts
    setResolving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/alerts/${id}/resolve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setAlert({ ...alert, is_resolved: true });
      } else {
        const errData = await res.json();
        console.error("Failed to resolve alert: " + (errData.detail || "Unknown error"));
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
    } finally {
      setResolving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-700";
      case "authority": return "bg-purple-100 text-purple-700";
      case "ngo": return "bg-blue-100 text-blue-700";
      default: return "bg-green-100 text-green-700";
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case "boil_notice": return "text-orange-700 bg-orange-100 border-orange-200";
      case "contamination": return "text-red-700 bg-red-100 border-red-200";
      case "outage": return "text-gray-700 bg-gray-100 border-gray-200";
      default: return "text-blue-700 bg-blue-100 border-blue-200";
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
        <p className="text-sky-600 font-semibold text-sm animate-pulse">Loading Alert Details…</p>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-xl font-bold bg-sky-50 text-sky-900">
        <p>Alert not found!</p>
        <button onClick={() => navigate("/alerts")} className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition">
          Back to Alerts
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-sky-50 text-slate-800 font-sans">
      <aside className="w-64 bg-sky-600 text-white flex flex-col p-5 shadow-xl shrink-0">
        <h2 className="text-2xl font-black mb-8 italic flex items-center gap-2 px-1">
          <Droplets className="w-6 h-6" /> WQM
        </h2>
        <div className="mb-6 p-4 bg-sky-700/50 rounded-2xl border border-sky-400/30 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-sky-500/30 rounded-full" />
          <p className="text-[10px] uppercase tracking-widest text-sky-200 mb-1">Session</p>
          <p className="font-bold text-base leading-tight">{userName}</p>
          <span className="mt-2 inline-block text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">{userRole}</span>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard",       path: "/dashboard" },
            { icon: MapPin,          label: "Live Map View",   path: "/map" },
            { icon: AlertTriangle,   label: "System Alerts",  path: "/alerts" },
            { icon: Search,          label: "Search Stations", path: "/search" },
            { icon: FileText,        label: "My Reports",      path: "/reports" },
            { icon: User,            label: "Profile",         path: "/profile" },
          ].map(({ icon: Icon, label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className={path === "/alerts" ? "wqm-sidebar-active w-full text-left" : "wqm-sidebar-item w-full text-left"}>
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
        <button 
          onClick={() => navigate("/alerts")}
          className="flex items-center gap-2 text-sky-700 hover:text-sky-900 font-semibold mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Alerts List
        </button>

        <div className="max-w-4xl">
          <div className="bg-white rounded-3xl p-8 shadow-md border border-sky-100">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border ${getTypeColor(alert.type)}`}>
                    {alert.type.replace('_', ' ')}
                  </span>
                  {/* Country badge */}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                    alert.country === "USA" || isUsaAlert
                      ? "bg-blue-50 text-blue-700 border-blue-200" 
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}>
                    <Globe className="w-3 h-3 inline mr-1" />
                    {alert.country === "USA" || isUsaAlert ? "🇺🇸 USA (USGS Live)" : "🇮🇳 India"}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {isUsaAlert ? "USGS Alert Details" : `Alert ID #${alert.id} Details`}
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                {alert.is_resolved ? (
                  <span className="flex items-center gap-2 text-green-700 bg-green-100 px-4 py-2 rounded-xl font-bold border border-green-200">
                    <CheckCircle className="w-5 h-5" /> Resolved
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-700 bg-red-100 px-4 py-2 rounded-xl font-bold border border-red-200">
                    <AlertTriangle className="w-5 h-5" /> Action Required
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100">
                <h3 className="text-sm font-bold text-sky-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Description
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed font-medium">
                  {alert.message}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location
                  </h3>
                  <p className="text-gray-900 text-lg font-semibold">{alert.location || 'Unknown location'}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Time Reported
                  </h3>
                  <p className="text-gray-900 text-lg font-semibold">{new Date(alert.issued_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* USGS data notice */}
            {isUsaAlert && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  This alert was generated from live USGS (U.S. Geological Survey) water quality monitoring data. 
                  It indicates a threshold violation detected at a USA monitoring station.
                </p>
              </div>
            )}

            {/* Admin/Authority Actions - only for DB alerts */}
            {!isUsaAlert && (userRole === "admin" || userRole === "authority") && !alert.is_resolved && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Management Actions</h3>
                <p className="text-gray-600 mb-6">As an authorized user, you can verify and mark this alert as resolved once the issue has been addressed at the location.</p>
                
                <button 
                  onClick={handleResolveAlert}
                  disabled={resolving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {resolving ? "Resolving..." : "Mark Alert as Resolved"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetails;
