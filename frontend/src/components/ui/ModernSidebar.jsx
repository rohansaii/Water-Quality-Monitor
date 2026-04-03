import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, MapPin, Search, FileText, User, LogOut,
  Droplets, AlertTriangle, Clock, TrendingUp, Wifi, WifiOff, Bell
} from "lucide-react";

/**
 * ModernSidebar - Premium sidebar with animations and active states
 */
const ModernSidebar = ({ 
  userName, 
  userRole, 
  onLogout,
  isConnected,
  menuItems 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: MapPin, label: "Live Map View", path: "/map" },
    { icon: AlertTriangle, label: "System Alerts", path: "/alerts" },
    { icon: Clock, label: "Alert History", path: "/alert-history" },
    { icon: Bell, label: "Auto Alerts", path: "/auto-alerts" },
    { icon: Search, label: "Search Stations", path: "/search" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const items = menuItems || defaultMenuItems;

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-64 bg-gradient-to-b from-sky-600 to-sky-700 text-white flex flex-col p-5 shadow-2xl shrink-0"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 mb-8 px-1"
      >
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
          <Droplets className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black italic tracking-tight">WQM</h2>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6 p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 relative overflow-hidden"
      >
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
        <p className="text-[10px] uppercase tracking-widest text-sky-200 mb-1 relative z-10">
          {userRole === "admin" ? "Administrator" : userRole}
        </p>
        <p className="font-bold text-base leading-tight relative z-10 truncate">
          {userName || "User"}
        </p>
      </motion.div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1.5">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className={`
                w-full text-left
                px-3 py-2.5
                rounded-xl
                font-semibold
                transition-all
                duration-200
                flex
                items-center
                gap-3
                ${isActive
                  ? "bg-white text-sky-700 shadow-lg shadow-sky-900/20"
                  : "text-white hover:bg-white/10"
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className="text-sm">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1 h-4 bg-sky-600 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mb-3 flex items-center gap-2 text-xs px-1"
      >
        {isConnected ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-green-300" />
            <span className="font-semibold text-green-100">Live Updates</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-red-300" />
            <span className="font-semibold text-red-100">Offline</span>
          </>
        )}
      </motion.div>

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onLogout}
        className="mt-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm backdrop-blur-lg"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </motion.button>
    </motion.aside>
  );
};

export default ModernSidebar;
