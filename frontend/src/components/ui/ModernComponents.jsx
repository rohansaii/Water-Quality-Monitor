import React from 'react';
import { motion } from 'framer-motion';

/**
 * ModernCard - Premium card component with hover effects
 */
const ModernCard = ({ 
  children, 
  className = '', 
  hover = true,
  onClick 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { scale: 1.01, y: -2 } : {}}
      onClick={onClick}
      className={`
        bg-white/80 backdrop-blur-lg 
        border border-white/20 
        rounded-2xl 
        p-6 
        shadow-sm 
        ${hover ? 'shadow-md hover:shadow-xl' : ''}
        transition-all 
        duration-200
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

/**
 * ModernButton - Animated button with smooth transitions
 */
const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  icon: Icon
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-lg shadow-sky-500/30',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/30',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/30',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        font-semibold
        rounded-xl
        transition-all
        duration-200
        flex
        items-center
        justify-center
        gap-2
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
};

/**
 * ModernBadge - Styled badge component
 */
const ModernBadge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-sky-100 text-sky-700 border-sky-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    predictive: 'bg-teal-100 text-teal-700 border-teal-200 shadow-sm shadow-teal-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`
        ${variants[variant]}
        ${sizes[size]}
        inline-flex
        items-center
        gap-1.5
        font-bold
        uppercase
        tracking-wide
        rounded-full
        border
        ${className}
      `}
    >
      {children}
    </span>
  );
};

/**
 * SkeletonLoader - Loading placeholder
 */
export const SkeletonLoader = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

/**
 * EmptyState - Modern empty state component
 */
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description,
  action 
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12"
  >
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>
    {action && <div className="flex justify-center gap-2">{action}</div>}
  </motion.div>
);

export { ModernCard, ModernButton, ModernBadge };
