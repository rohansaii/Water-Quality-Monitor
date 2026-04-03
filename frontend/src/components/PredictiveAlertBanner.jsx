import React, { useState, useEffect } from "react";
import { X, ChevronRight, Zap, AlertTriangle, Flame, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAlertContext } from "../hooks/AlertContext";
import { API_BASE_URL } from "../config";

/**
 * Site-wide dismissible banner for active predictive alerts.
 * Uses AlertContext (shared WS connection) to update in real-time.
 * Dismissed state stored in sessionStorage.
 */
const ICON_MAP = {
  boil_notice: Flame,
  contamination: AlertTriangle,
  outage: WifiOff,
  predictive: Zap,
};

const PredictiveAlertBanner = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const { newAlerts } = useAlertContext();

  useEffect(() => {
    if (sessionStorage.getItem("predictiveBannerDismissed") === "true") {
      setDismissed(true);
      return;
    }
    fetchPredictiveAlerts();
  }, []);

  // Update banner when a new predictive alert arrives via WebSocket
  useEffect(() => {
    if (newAlerts.length === 0) return;
    const predictive = newAlerts.filter((a) => a.type === "predictive");
    if (predictive.length > 0) {
      setDismissed(false);
      sessionStorage.removeItem("predictiveBannerDismissed");
      setAlerts((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const fresh = predictive.filter((a) => !existingIds.has(a.id));
        return [...fresh, ...prev];
      });
    }
  }, [newAlerts]);

  const fetchPredictiveAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const userLocation = localStorage.getItem("userLocation") || "";
      const url = `${API_BASE_URL}/api/v1/alerts/predictive${userLocation ? `?location=${encodeURIComponent(userLocation)}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch predictive alerts:", error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("predictiveBannerDismissed", "true");
  };

  if (dismissed || alerts.length === 0) return null;

  const latestAlert = alerts[0];
  const Icon = ICON_MAP[latestAlert?.type] || Zap;

  return (
    <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 flex items-center justify-between shadow-lg z-50 sticky top-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="bg-teal-500 p-2 rounded-lg flex-shrink-0 animate-pulse">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm">
            ⚡ {alerts.length} Predictive Alert{alerts.length > 1 ? "s" : ""} Active
          </p>
          <p className="text-teal-100 text-xs truncate">
            {latestAlert?.message || "Water quality threshold approaching in your area"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <button
          onClick={() => navigate("/alerts")}
          className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
        >
          View Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDismiss}
          className="hover:bg-white/20 p-1.5 rounded-lg transition"
          aria-label="Dismiss predictive alert banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PredictiveAlertBanner;
