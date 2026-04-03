import { API_BASE_URL } from '../config';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle, Clock, TrendingUp, RefreshCw, MapPin,
  Droplets, Activity, Info, CheckCircle
} from "lucide-react";
import ModernSidebar from "../components/ui/ModernSidebar";
import { 
  ModernCard, 
  ModernButton, 
  ModernBadge,
  PageContainer,
  ContentArea,
  SectionHeader,
  SkeletonLoader
} from "../components/ui";

const SEVERITY_COLORS = {
  HIGH: "#dc2626",    // red-600
  MEDIUM: "#ea580c",  // orange-600
  LOW: "#16a34a",     // green-600
};

const SEVERITY_BG = {
  HIGH: "bg-red-50 border-red-200",
  MEDIUM: "bg-orange-50 border-orange-200",
  LOW: "bg-green-50 border-green-200",
};

const AutoAlerts = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "citizen";

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    totalStations: 0,
    totalAlerts: 0,
    modelUsed: "",
  });

  // Fetch auto alerts on mount + auto-refresh every 30 seconds
  useEffect(() => {
    fetchAutoAlerts();
    const interval = setInterval(fetchAutoAlerts, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAutoAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/auto-alerts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setAlerts(data.alerts || []);
      setStats({
        totalStations: data.total_stations_analyzed || 0,
        totalAlerts: data.total_alerts_generated || 0,
        modelUsed: data.model_used || "Unknown",
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching auto alerts:", err);
      setError(err.message || "Failed to fetch auto alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const getSeverityBadge = (severity) => {
    const color = SEVERITY_COLORS[severity] || "#6b7280";
    return (
      <ModernBadge color={color}>{severity}</ModernBadge>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageContainer>
      <div className="flex min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        {/* Sidebar */}
        <ModernSidebar
          userName={userName}
          userRole={userRole}
          onLogout={handleLogout}
          isConnected={true}
        />

        {/* Main Content */}
        <ContentArea className="flex-1 w-full max-w-none">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <SectionHeader
              icon={AlertTriangle}
              title="Auto Predictive Alerts"
              subtitle="AI-powered water quality predictions using ML models"
            />
            
            {/* Action Bar */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {lastUpdated && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
              
              <ModernButton
                onClick={fetchAutoAlerts}
                disabled={loading}
                variant="primary"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? "Refreshing..." : "Refresh Now"}
              </ModernButton>
            </div>
          </motion.div>

          {/* Stats Cards */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <ModernCard className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-semibold mb-1">Stations Analyzed</p>
                    <p className="text-3xl font-black">{stats.totalStations}</p>
                  </div>
                  <MapPin className="w-12 h-12 text-blue-200 opacity-50" />
                </div>
              </ModernCard>

              <ModernCard className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-semibold mb-1">Active Alerts</p>
                    <p className="text-3xl font-black">{stats.totalAlerts}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-orange-200 opacity-50" />
                </div>
              </ModernCard>

              <ModernCard className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-semibold mb-1">ML Model</p>
                    <p className="text-lg font-bold truncate">{stats.modelUsed.replace(/_/g, ' ')}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-200 opacity-50" />
                </div>
              </ModernCard>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <ModernCard className="p-6 bg-red-50 border-2 border-red-200">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-2">Error Loading Alerts</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                    <ModernButton
                      onClick={fetchAutoAlerts}
                      variant="primary"
                      size="sm"
                      className="mt-3"
                    >
                      Try Again
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonLoader key={i} className="h-32" />
              ))}
            </div>
          )}

          {/* Alerts List */}
          {!loading && !error && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {alerts.length === 0 ? (
                <ModernCard className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    No Alerts Detected
                  </h3>
                  <p className="text-gray-600 mb-6">
                    All water quality parameters are within safe limits based on current predictions.
                  </p>
                  <ModernButton onClick={fetchAutoAlerts} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </ModernButton>
                </ModernCard>
              ) : (
                <>
                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <Activity className="w-4 h-4" />
                    <span>Showing {alerts.length} predictive alert(s)</span>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                    {alerts.map((alert, index) => (
                      <motion.div
                        key={`${alert.station_id}-${index}`}
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <ModernCard className={`p-6 border-2 ${SEVERITY_BG[alert.severity]} hover:shadow-lg transition-all duration-300`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <MapPin className="w-5 h-5 text-gray-600" />
                                <h3 className="text-xl font-bold text-gray-900">
                                  Station: {alert.station_id}
                                </h3>
                                {getSeverityBadge(alert.severity)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Droplets className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs text-gray-600 font-semibold">Alert Type</span>
                                  </div>
                                  <p className="text-sm font-bold text-gray-900">{alert.alert_type}</p>
                                </div>

                                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Activity className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs text-gray-600 font-semibold">Predicted pH</span>
                                  </div>
                                  <p className="text-lg font-black text-gray-900">{alert.predicted_ph}</p>
                                </div>

                                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-4 h-4 text-orange-600" />
                                    <span className="text-xs text-gray-600 font-semibold">Risk Score</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-lg font-black text-gray-900">{alert.risk_score}</p>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{
                                          width: `${alert.risk_score}%`,
                                          backgroundColor: SEVERITY_COLORS[alert.severity]
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>Generated at: {new Date(alert.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </ModernCard>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </ContentArea>
      </div>
    </PageContainer>
  );
};

export default AutoAlerts;
