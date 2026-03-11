import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from "recharts";
import {
  LayoutDashboard,
  MapPin,
  Search,
  FileText,
  User,
  LogOut,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Bell
} from "lucide-react";

const Alerts = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "citizen";

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/api/alerts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = () => {
    const counts = { boil_notice: 0, contamination: 0, outage: 0 };
    alerts.forEach(a => {
      if (counts[a.type] !== undefined) {
        counts[a.type]++;
      } else {
        counts[a.type] = 1;
      }
    });
    return [
      { name: "Boil Notice", count: counts.boil_notice },
      { name: "Contamination", count: counts.contamination },
      { name: "Outage", count: counts.outage }
    ];
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
      case "boil_notice": return "text-orange-600 bg-orange-100";
      case "contamination": return "text-red-600 bg-red-100";
      case "outage": return "text-gray-600 bg-gray-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  const chartData = processChartData();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl font-bold">Loading Alerts...</div>;
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
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-900">System Alerts</h1>
            <p className="text-sky-600 font-medium tracking-tight italic">Monitor critical water quality events</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-sm font-bold border border-red-200 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {alerts.filter(a => !a.is_resolved).length} Active Alerts
            </span>
          </div>
        </header>

        {/* Charts Section */}
        <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-sky-900 mb-6 italic">Alert Trends by Type</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                <XAxis dataKey="name" stroke="#0ea5e9" fontSize={12} />
                <YAxis stroke="#0ea5e9" fontSize={12} allowDecimals={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} name="Total Alerts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-sky-900 mb-6">Recent Alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No alerts found in the system. Great!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-sky-100 text-sky-800">
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Message</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Reported</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="border-b border-gray-50 hover:bg-sky-50 transition-colors">
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getTypeColor(alert.type)}`}>
                          {alert.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 font-medium text-gray-700 max-w-sm truncate pr-4">{alert.message}</td>
                      <td className="py-4 text-gray-500">{alert.location || 'N/A'}</td>
                      <td className="py-4 text-gray-500 text-sm">
                        {new Date(alert.issued_at).toLocaleString()}
                      </td>
                      <td className="py-4">
                        {alert.is_resolved ? (
                          <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                            <CheckCircle className="w-4 h-4" /> Resolved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 font-semibold text-sm">
                            <AlertTriangle className="w-4 h-4" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <button 
                          onClick={() => navigate(`/alerts/${alert.id}`)}
                          className="bg-sky-100 text-sky-700 hover:bg-sky-200 px-3 py-1 rounded font-medium transition-colors text-sm"
                        >
                          Details
                        </button>
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

export default Alerts;
