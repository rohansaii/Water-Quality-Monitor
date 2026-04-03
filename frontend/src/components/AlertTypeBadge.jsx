import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Flame, Zap, WifiOff } from "lucide-react";

/**
 * Enhanced AlertTypeBadge component with animations
 * Types: boil_notice (amber), contamination (red), outage (grey), predictive (teal)
 */
const AlertTypeBadge = ({ alertType, className = "", animated = true }) => {
  const config = {
    boil_notice: {
      bg: "bg-gradient-to-br from-amber-50 to-orange-50",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: Flame,
      label: "Boil Notice",
      shadow: "shadow-amber-500/20"
    },
    contamination: {
      bg: "bg-gradient-to-br from-red-50 to-rose-50",
      text: "text-red-800",
      border: "border-red-200",
      icon: AlertTriangle,
      label: "Contamination",
      shadow: "shadow-red-500/20"
    },
    outage: {
      bg: "bg-gradient-to-br from-gray-50 to-slate-50",
      text: "text-gray-800",
      border: "border-gray-200",
      icon: WifiOff,
      label: "Outage",
      shadow: "shadow-gray-500/20"
    },
    predictive: {
      bg: "bg-gradient-to-br from-teal-50 to-cyan-50",
      text: "text-teal-800",
      border: "border-teal-200",
      icon: Zap,
      label: "Predictive",
      shadow: "shadow-teal-500/30"
    }
  };

  const c = config[alertType] || config.contamination;
  const Icon = c.icon;

  const BadgeContent = (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${c.bg} ${c.text} ${c.border} ${c.shadow} shadow-sm ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );

  if (!animated) return BadgeContent;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="inline-block"
    >
      {BadgeContent}
    </motion.span>
  );
};

export default AlertTypeBadge;
