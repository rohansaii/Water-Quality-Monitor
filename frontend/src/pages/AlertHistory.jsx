import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, MapPin, Search, FileText, User, LogOut,
  Droplets, AlertTriangle, Clock, CheckCircle, Filter, Download,
  Zap, Flame, WifiOff, ChevronRight, ChevronLeft, Bell
} from "lucide-react";
import { useAlertContext } from "../hooks/AlertContext";
import { saveAs } from "file-saver";

const AlertHistory = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // all, boil_notice, contamination, outage
  const [filterSource, setFilterSource] = useState("all"); // all, manual, predictive
  const [filterStatus, setFilterStatus] = useState("all"); // all, resolved, unresolved
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Real-time alerts via context
  const { newAlerts, clearNewAlert } = useAlertContext();

  useEffect(() => {
    if (newAlerts.length === 0) return;
    setAlerts((prev) => {
      const existingIds = new Set(prev.map((a) => a.id));
      const fresh = newAlerts
        .filter((a) => !existingIds.has(a.id))
        .map((a) => ({ ...a, _isNew: true }));
      if (fresh.length === 0) return prev;
      return [...fresh, ...prev];
    });
    
    // Clear the new flag after some time
    newAlerts.forEach(a => {
      setTimeout(() => {
        setAlerts(prev => prev.map(x => x.id === a.id ? { ...x, _isNew: false } : x));
        clearNewAlert(a.id);
      }, 5000);
    });
  }, [newAlerts, clearNewAlert]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/alerts`, {
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getTypeColor = (type) => {
    switch(type) {
      case "boil_notice": return "text-orange-700 bg-orange-100 border-orange-200";
      case "contamination": return "text-red-700 bg-red-100 border-red-200";
      case "outage": return "text-gray-700 bg-gray-100 border-gray-200";
      default: return "text-blue-700 bg-blue-100 border-blue-200";
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "boil_notice": return Flame;
      case "contamination": return AlertTriangle;
      case "outage": return WifiOff;
      default: return Zap;
    }
  };

  const getSourceBadge = (source) => {
    if (source === "predictive") {
      return "bg-teal-100 text-teal-700 border-teal-200";
    }
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterType !== "all" && alert.type !== filterType) return false;
    if (filterSource !== "all") {
      const alertSource = alert.source || "manual";
      if (filterSource !== alertSource) return false;
    }
    if (filterStatus !== "all") {
      const isResolved = alert.is_resolved;
      if (filterStatus === "resolved" && !isResolved) return false;
      if (filterStatus === "unresolved" && isResolved) return false;
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      const msgMatch = (alert.message || "").toLowerCase().includes(q);
      const locMatch = (alert.location || "").toLowerCase().includes(q);
      if (!msgMatch && !locMatch) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredAlerts.length / PAGE_SIZE);
  const pagedAlerts = filteredAlerts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    try {
      // Create CSV content manually
      const headers = ["ID", "Type", "Message", "Location", "Source", "Status", "Issued_At"];
      
      const csvRows = filteredAlerts.map(alert => [
        alert.id,
        alert.type,
        `"${alert.message.replace(/"/g, '""')}"`, // Escape quotes in message
        `"${(alert.location || "N/A").replace(/"/g, '""')}"`,
        alert.source || "manual",
        alert.is_resolved ? "Resolved" : "Active",
        new Date(alert.issued_at).toLocaleString()
      ]);
      
      const csvContent = [
        headers.join(","),
        ...csvRows.map(row => row.join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `alert-history-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error("Failed to export alerts:", error);
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
        <p className="text-sky-600 font-semibold text-sm animate-pulse">Loading Alert History…</p>
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
          <p className="text-[10px] uppercase tracking-widest text-sky-200 mb-1">User</p>
          <p className="font-bold text-base leading-tight">{localStorage.getItem("userName") || "User"}</p>
          <span className="mt-2 inline-block text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">
            {localStorage.getItem("userRole") || "citizen"}
          </span>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
            { icon: MapPin, label: "Live Map View", path: "/map" },
            { icon: Search, label: "Search Stations", path: "/search" },
            { icon: AlertTriangle, label: "System Alerts", path: "/alerts" },
            { icon: Clock, label: "Alert History", path: "/alert-history" },
            { icon: Bell, label: "Auto Alerts", path: "/auto-alerts" },
            { icon: FileText, label: "Reports", path: "/reports" },
            { icon: User,            label: "Profile",         path: "/profile" },
          ].map(({ icon: Icon, label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className={path === "/alert-history" ? "wqm-sidebar-active w-full text-left" : "wqm-sidebar-item w-full text-left"}>
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
            <h1 className="text-3xl font-bold text-sky-900">Alert History</h1>
            <p className="text-sky-600 font-medium tracking-tight mt-1">Chronological timeline of all water quality alerts</p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </header>

        {/* Filters */}
        <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-sky-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Alert Type</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="boil_notice">Boil Notice</option>
                <option value="contamination">Contamination</option>
                <option value="outage">Outage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Source</label>
              <select 
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="all">All Sources</option>
                <option value="manual">Manual</option>
                <option value="predictive">Predictive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="resolved">Resolved</option>
                <option value="unresolved">Unresolved</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 bg-sky-50 p-3 rounded-xl border border-sky-100">
            <Search className="w-5 h-5 text-sky-400" />
            <input 
              type="text"
              placeholder="Search by message or location..."
              className="bg-transparent border-none outline-none w-full text-sm"
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Alerts Timeline */}
        <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-sky-900">
              Timeline ({filteredAlerts.length} of {alerts.length})
            </h2>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-sky-200 disabled:opacity-30 hover:bg-sky-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-sky-700 mx-2">
                  Page {page} / {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-sky-200 disabled:opacity-30 hover:bg-sky-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No alerts found matching your filters.</p>
              <p className="text-sm">Try adjusting your filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pagedAlerts.map((alert) => {
                const TypeIcon = getTypeIcon(alert.type);
                return (
                  <div 
                    key={alert.id}
                    className={`border-l-4 rounded-r-xl p-4 transition-all hover:shadow-md cursor-pointer relative overflow-hidden ${getTypeColor(alert.type)} ${alert._isNew ? 'ring-2 ring-teal-500 animate-pulse' : ''}`}
                    onClick={() => navigate(`/alerts/${alert.id}`)}
                  >
                    {alert._isNew && (
                      <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm">
                        <Bell className="w-3 h-3" /> NEW
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${alert.source === "predictive" ? "bg-teal-200" : "bg-white/50"}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm">{alert.type.replace('_', ' ').toUpperCase()}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getSourceBadge(alert.source)}`}>
                              {alert.source || "manual"}
                            </span>
                            {alert.is_resolved && (
                              <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold text-xs border border-green-100">
                                <CheckCircle className="w-3 h-3" /> RESOLVED
                              </span>
                            )}
                          </div>
                          <p className="text-sm opacity-90 mb-2">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs opacity-75">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {alert.location || "N/A"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(alert.issued_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-50" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertHistory;
