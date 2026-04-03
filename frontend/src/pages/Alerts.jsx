import { API_BASE_URL } from '../config';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from "recharts";
import {
  LayoutDashboard, MapPin, Search, FileText, User, LogOut,
  Droplets, AlertTriangle, CheckCircle, Bell, Globe,
  BarChart2, TrendingUp, Filter, ChevronLeft, ChevronRight, WifiOff
} from "lucide-react";
import AlertTypeBadge from "../components/AlertTypeBadge";
import { useAlertContext } from "../hooks/AlertContext";
import ModernSidebar from "../components/ui/ModernSidebar";
import { 
  ModernCard, 
  ModernButton, 
  ModernBadge,
  PageContainer,
  ContentArea,
  SectionHeader,
  SkeletonLoader,
  TwoColumnLayout
} from "../components/ui";

const PAGE_SIZE = 20;
const ALL_TYPES = ["boil_notice", "contamination", "outage", "predictive"];

const BAR_COLORS = {
  boil_notice: "#ea580c",
  contamination: "#dc2626",
  outage: "#4b5563",
  predictive: "#0d9488",
};
const getBarColor = (type, index) => {
  const palette = ["#0284c7", "#16a34a", "#9333ea", "#eab308", "#db2777"];
  return BAR_COLORS[type] || palette[index % palette.length];
};

const Alerts = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "citizen";

  // ── remote data ──────────────────────────────────────────────
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState("");

  // ── local UI state ────────────────────────────────────────────
  const [chartType, setChartType] = useState("bar");          // "bar" | "line"
  const [searchText, setSearchText] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);     // [] = all
  const [page, setPage] = useState(1);
  const [showBanner, setShowBanner] = useState(true);

  // ── WebSocket new-alerts ──────────────────────────────────────
  const { newAlerts, clearNewAlert, isConnected } = useAlertContext();
  const flashTimers = useRef({});

  // Prepend socket alerts into the list with a "new" flag
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
    // Auto-clear the "New" badge after 5s
    newAlerts.forEach((a) => {
      if (flashTimers.current[a.id]) return;
      flashTimers.current[a.id] = setTimeout(() => {
        setAlerts((prev) =>
          prev.map((x) => (x.id === a.id ? { ...x, _isNew: false } : x))
        );
        clearNewAlert(a.id);
        delete flashTimers.current[a.id];
      }, 5000);
    });
  }, [newAlerts, clearNewAlert]);

  useEffect(() => {
    return () => {
      Object.values(flashTimers.current).forEach(clearTimeout);
    };
  }, []);

  // ── fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchAlerts();
    setPage(1);
  }, [countryFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (countryFilter) params.append("country", countryFilter);
      const url = `${API_BASE_URL}/api/alerts${params.toString() ? "?" + params.toString() : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── chart data ────────────────────────────────────────────────
  const processChartData = () => {
    const grouped = {};
    const typesSet = new Set();
    alerts.forEach((a) => {
      const date = new Date(a.issued_at).toLocaleDateString("en-CA");
      typesSet.add(a.type);
      if (!grouped[date]) grouped[date] = { date };
      grouped[date][a.type] = (grouped[date][a.type] || 0) + 1;
    });
    const sortedData = Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    sortedData.forEach((d) => {
      typesSet.forEach((t) => { if (d[t] === undefined) d[t] = 0; });
    });
    return { data: sortedData, types: Array.from(typesSet) };
  };

  const { data: chartData, types: chartTypes } = processChartData();

  // ── filtering ─────────────────────────────────────────────────
  const filteredAlerts = alerts.filter((a) => {
    const matchText =
      !searchText ||
      (a.message || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (a.location || "").toLowerCase().includes(searchText.toLowerCase());
    const matchType =
      selectedTypes.length === 0 || 
      selectedTypes.some(t => t === "predictive" ? a.source === "predictive" : a.type === t);
    return matchText && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));
  const pagedAlerts = filteredAlerts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleType = (t) =>
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const handleSearch = (v) => { setSearchText(v); setPage(1); };
  const handleTypeToggle = (t) => { toggleType(t); setPage(1); };

  // ── misc ──────────────────────────────────────────────────────
  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const getStatusBadge = (isResolved) => 
    isResolved 
      ? { variant: "success", label: "Resolved", icon: CheckCircle }
      : { variant: "danger", label: "Active", icon: AlertTriangle };

  const getSourceBadge = (source) =>
    source === "predictive"
      ? { variant: "predictive", label: "⚡ Predictive" }
      : { variant: "default", label: "Manual" };

  const getCountryBadgeVariant = (country) =>
    country === "USA" ? "primary" : "success";

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-screen items-center justify-center flex-col gap-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-sky-500" />
            </div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sky-600 font-semibold text-sm"
          >
            Loading Alerts...
          </motion.p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <TwoColumnLayout
        sidebar={
          <ModernSidebar 
            userName={userName}
            userRole={userRole}
            onLogout={handleLogout}
            isConnected={isConnected}
          />
        }
        main={
          <ContentArea>
            {/* Header */}
            <SectionHeader 
              title="System Alerts"
              subtitle="Monitor critical water quality events worldwide"
              icon={AlertTriangle}
              action={
                <div className="flex items-center gap-2">
                  <ModernBadge variant="danger" size="lg">
                    <AlertTriangle className="w-4 h-4" />
                    {alerts.filter((a) => !a.is_resolved).length} Active
                  </ModernBadge>
                  {newAlerts.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <ModernBadge variant="predictive" size="lg">
                        <Bell className="w-4 h-4" />
                        {newAlerts.length} New
                      </ModernBadge>
                    </motion.div>
                  )}
                </div>
              }
            />

            {/* Predictive Alert Banner */}
            {showBanner && alerts.some(a => a.source === "predictive") && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-5 rounded-2xl shadow-lg shadow-teal-500/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Predictive Insights Active</p>
                    <p className="text-teal-50 text-sm mt-0.5">
                      System has identified <span className="font-bold">{alerts.filter(a => a.source === "predictive" && !a.is_resolved).length}</span> potential future water quality risks
                    </p>
                  </div>
                </div>
                <ModernButton 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowBanner(false)}
                  className="text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-5 h-5 rotate-90" />
                </ModernButton>
              </motion.div>
            )}

            {/* Region Filter */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <Globe className="w-5 h-5 text-sky-700" />
              <span className="text-sm font-bold text-sky-800 uppercase tracking-wider">Region:</span>
              {[
                { label: "All", value: "" },
                { label: "🇮🇳 India", value: "India" },
                { label: "🇺🇸 USA", value: "USA" },
              ].map((tab) => (
                <ModernButton
                  key={tab.value}
                  variant={countryFilter === tab.value ? "primary" : "secondary"}
                  size="md"
                  onClick={() => setCountryFilter(tab.value)}
                >
                  {tab.label}
                </ModernButton>
              ))}
            </motion.div>

            {/* Chart Section */}
            <ModernCard className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-sky-900">
                  Alert Trends
                  {countryFilter && (
                    <span className="text-sm font-medium text-sky-400 ml-2">({countryFilter})</span>
                  )}
                </h2>
                <div className="flex items-center gap-2 bg-sky-50 rounded-xl p-1">
                  <ModernButton
                    variant={chartType === "bar" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    icon={BarChart2}
                  >
                    Bar
                  </ModernButton>
                  <ModernButton
                    variant={chartType === "line" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("line")}
                    icon={TrendingUp}
                  >
                    Line
                  </ModernButton>
                </div>
              </div>
              <div className="h-72 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "bar" ? (
                      <BarChart data={chartData} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                        <XAxis dataKey="date" stroke="#0ea5e9" fontSize={12} />
                        <YAxis stroke="#0ea5e9" fontSize={12} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ 
                            borderRadius: "12px", 
                            border: "none", 
                            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                            backgroundColor: "rgba(255,255,255,0.95)"
                          }}
                        />
                        <Legend />
                        {chartTypes.map((type, idx) => (
                          <Bar
                            key={type}
                            dataKey={type}
                            fill={getBarColor(type, idx)}
                            name={type.replace(/_/g, " ").toUpperCase()}
                            radius={[8, 8, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    ) : (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                        <XAxis dataKey="date" stroke="#0ea5e9" fontSize={12} />
                        <YAxis stroke="#0ea5e9" fontSize={12} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ 
                            borderRadius: "12px", 
                            border: "none", 
                            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                            backgroundColor: "rgba(255,255,255,0.95)"
                          }}
                        />
                        <Legend />
                        {chartTypes.map((type, idx) => (
                          <Line
                            key={type}
                            type="monotone"
                            dataKey={type}
                            stroke={getBarColor(type, idx)}
                            strokeWidth={3}
                            name={type.replace(/_/g, " ").toUpperCase()}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>No alert trend data available for the selected region.</p>
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Search & Filter Bar */}
            <ModernCard className="mb-6">
              <div className="flex flex-wrap items-start gap-4">
                {/* Search */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-sky-400" />
                  <input
                    type="text"
                    placeholder="Search by message or location…"
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 text-sm border-0 outline-none bg-transparent text-slate-700 placeholder-gray-400"
                  />
                </div>
                {/* Type checkboxes */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Filter className="w-4 h-4 text-sky-400" />
                  {ALL_TYPES.map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(t)}
                        onChange={() => handleTypeToggle(t)}
                        className="accent-sky-600 w-4 h-4 cursor-pointer"
                      />
                      <AlertTypeBadge alertType={t} animated />
                    </label>
                  ))}
                  {selectedTypes.length > 0 && (
                    <ModernButton
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSelectedTypes([]); setPage(1); }}
                    >
                      Clear
                    </ModernButton>
                  )}
                </div>
              </div>
            </ModernCard>

            {/* Alerts Table */}
            <ModernCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-sky-900">
                  Recent Alerts
                  {countryFilter && (
                    <span className="text-sm font-medium text-sky-500 ml-2">({countryFilter})</span>
                  )}
                  <span className="text-sm text-gray-400 font-normal ml-2">
                    {filteredAlerts.length} result{filteredAlerts.length !== 1 ? "s" : ""}
                  </span>
                </h2>
              </div>

              {pagedAlerts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg">No alerts found matching your filters.</p>
                  <p className="text-sm mt-1">Try adjusting your filter criteria.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b-2 border-sky-100 text-sky-800">
                          <th className="pb-3 font-semibold text-sm">Type</th>
                          <th className="pb-3 font-semibold text-sm">Message</th>
                          <th className="pb-3 font-semibold text-sm">Location</th>
                          <th className="pb-3 font-semibold text-sm">Country</th>
                          <th className="pb-3 font-semibold text-sm">Source</th>
                          <th className="pb-3 font-semibold text-sm">Reported</th>
                          <th className="pb-3 font-semibold text-sm">Status</th>
                          <th className="pb-3 font-semibold text-sm">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedAlerts.map((alert, index) => {
                          const statusBadge = getStatusBadge(alert.is_resolved);
                          const sourceBadge = getSourceBadge(alert.source);
                          const StatusIcon = statusBadge.icon;
                          
                          return (
                            <tr
                              key={`${alert.id}-${index}`}
                              className={`border-b border-gray-50 transition-all duration-200 ${
                                alert._isNew 
                                  ? "bg-teal-50 hover:bg-teal-100" 
                                  : "hover:bg-sky-50"
                              }`}
                            >
                              <td className="py-4 pr-2">
                                <div className="flex items-center gap-2">
                                  <AlertTypeBadge alertType={alert.type} animated />
                                  {alert._isNew && (
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm shadow-teal-500/30"
                                    >
                                      New
                                    </motion.span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 font-medium text-gray-700 max-w-xs truncate pr-4">
                                {alert.message}
                              </td>
                              <td className="py-4 text-gray-500 pr-4 text-sm">{alert.location || "N/A"}</td>
                              <td className="py-4">
                                <ModernBadge variant={getCountryBadgeVariant(alert.country)} size="sm">
                                  {alert.country === "USA" ? "🇺🇸 USA" : "🇮🇳 India"}
                                </ModernBadge>
                              </td>
                              <td className="py-4">
                                <ModernBadge variant={sourceBadge.variant} size="sm">
                                  {sourceBadge.label}
                                </ModernBadge>
                              </td>
                              <td className="py-4 text-gray-500 text-sm">
                                {new Date(alert.issued_at).toLocaleString()}
                              </td>
                              <td className="py-4">
                                <ModernBadge variant={statusBadge.variant} size="sm">
                                  <StatusIcon className="w-3 h-3" />
                                  {statusBadge.label}
                                </ModernBadge>
                              </td>
                              <td className="py-4">
                                <ModernButton
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    if (alert.country === "USA") {
                                      navigate(`/alerts/usa-${index}`, { state: { alertData: alert } });
                                    } else {
                                      navigate(`/alerts/${alert.id}`);
                                    }
                                  }}
                                >
                                  Details
                                </ModernButton>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-sky-100">
                      <p className="text-sm text-gray-500 font-medium">
                        Page {page} of {totalPages} · {filteredAlerts.length} total
                      </p>
                      <div className="flex items-center gap-2">
                        <ModernButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          icon={ChevronLeft}
                        >
                          Prev
                        </ModernButton>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          const pg = i + 1;
                          return (
                            <ModernButton
                              key={pg}
                              variant={page === pg ? "primary" : "secondary"}
                              size="sm"
                              onClick={() => setPage(pg)}
                            >
                              {pg}
                            </ModernButton>
                          );
                        })}
                        <ModernButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          icon={ChevronRight}
                        >
                          Next
                        </ModernButton>
                      </div>
                    </div>
                  )}
                </>
              )}
            </ModernCard>
          </ContentArea>
        }
      />
    </PageContainer>
  );
};

export default Alerts;
