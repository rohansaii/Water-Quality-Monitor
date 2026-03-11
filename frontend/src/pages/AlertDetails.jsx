import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CheckCircle
} from "lucide-react";

const AlertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "citizen";

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchAlertDetails();
  }, [id]);

  const fetchAlertDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/alerts/${id}`, {
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
    setResolving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/alerts/${id}/resolve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setAlert({ ...alert, is_resolved: true });
      } else {
        const errData = await res.json();
        alert("Failed to resolve alert: " + (errData.detail || "Unknown error"));
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
    return <div className="flex items-center justify-center h-screen text-xl font-bold">Loading Alert Details...</div>;
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
      {/* Sidebar */}
      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8 italic flex items-center gap-2">
          <Droplets className="w-6 h-6" /> WQM
        </h2>
        <div className="mb-8 p-4 bg-sky-700 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-600 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <p className="text-[10px] uppercase tracking-widest text-sky-200 mb-1 z-10 relative">
            Session
          </p>
          <p className="font-bold text-lg leading-tight z-10 relative">
            {userName}
          </p>
          <span className="mt-2 inline-block text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-sm font-bold uppercase z-10 relative">
            {userRole}
          </span>
        </div>
        <ul className="space-y-2 flex-1">
          <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </li>
          <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Live Map View
          </li>
          <li onClick={() => navigate("/alerts")} className="bg-white text-sky-600 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> System Alerts
          </li>
          <li onClick={() => navigate("/search")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" /> Search Stations
          </li>
          <li onClick={() => navigate("/reports")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" /> My Reports
          </li>
          <li onClick={() => navigate("/profile")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </li>
        </ul>
        <button onClick={handleLogout} className="mt-auto bg-white text-sky-600 hover:bg-sky-50 py-2.5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

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
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border mb-4 ${getTypeColor(alert.type)}`}>
                  {alert.type.replace('_', ' ')}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">Alert ID #{alert.id} Details</h1>
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

            {/* Admin/Authority Actions */}
            {(userRole === "admin" || userRole === "authority") && !alert.is_resolved && (
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
