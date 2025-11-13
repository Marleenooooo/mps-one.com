import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  className = '',
  variant = 'primary'
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    } else if (trend.value < 0) {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    if (trend.value > 0) {
      return 'text-green-400';
    } else if (trend.value < 0) {
      return 'text-red-400';
    }
    return 'text-gray-400';
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-blue-600/20 to-blue-500/10 border-blue-500/30';
      case 'secondary':
        return 'bg-gradient-to-br from-purple-600/20 to-purple-500/10 border-purple-500/30';
      case 'success':
        return 'bg-gradient-to-br from-green-600/20 to-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 border-yellow-500/30';
      case 'danger':
        return 'bg-gradient-to-br from-red-600/20 to-red-500/10 border-red-500/30';
      default:
        return 'bg-gradient-to-br from-blue-600/20 to-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className={`relative p-6 rounded-xl border backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${getVariantStyles()} ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
          <div className="text-2xl font-bold text-white mb-1">{value}</div>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {Math.abs(trend.value)}%
          </span>
          <span className="text-sm text-gray-500">{trend.label}</span>
        </div>
      )}

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  );
};

export default MetricCard;