import React from 'react';
import { motion } from 'framer-motion';

/**
 * PageContainer - Wrapper for all pages with fade-in animation
 */
export const PageContainer = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className={`min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 ${className}`}
  >
    {children}
  </motion.div>
);

/**
 * ContentArea - Main content wrapper with padding
 */
export const ContentArea = ({ children, className = '' }) => (
  <div className={`p-8 overflow-y-auto ${className}`}>
    {children}
  </div>
);

/**
 * SectionHeader - Consistent page/section headers
 */
export const SectionHeader = ({ 
  title, 
  subtitle, 
  icon: Icon,
  action 
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-between items-start mb-8"
  >
    <div>
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className="p-2 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-lg shadow-sky-500/30">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-900 to-sky-700 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-sky-600 font-medium tracking-tight mt-1">
          {subtitle}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </motion.div>
);

/**
 * StatsGrid - Grid layout for statistics cards
 */
export const StatsGrid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {children}
  </div>
);

/**
 * TwoColumnLayout - Main content + sidebar layout
 */
export const TwoColumnLayout = ({ sidebar, main }) => (
  <div className="flex min-h-screen">
    {sidebar}
    <div className="flex-1">{main}</div>
  </div>
);
