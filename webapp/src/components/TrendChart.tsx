import React, { useState } from 'react';
import { TrendingUp, Calendar, Download, Filter } from 'lucide-react';

interface DataPoint {
  month: string;
  spend: number;
  orders: number;
  suppliers: number;
}

interface TrendChartProps {
  className?: string;
  title?: string;
  data?: DataPoint[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ 
  className = '', 
  title = 'Procurement Trends',
  data = [
    { month: 'Jul', spend: 2100000000, orders: 45, suppliers: 12 },
    { month: 'Aug', spend: 2400000000, orders: 52, suppliers: 14 },
    { month: 'Sep', spend: 2200000000, orders: 48, suppliers: 13 },
    { month: 'Oct', spend: 2800000000, orders: 61, suppliers: 15 },
    { month: 'Nov', spend: 3200000000, orders: 68, suppliers: 16 },
    { month: 'Dec', spend: 2900000000, orders: 55, suppliers: 14 }
  ]
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'spend' | 'orders' | 'suppliers'>('spend');
  const [period, setPeriod] = useState<'6m' | '3m' | '1m'>('6m');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}M`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}Jt`;
    }
    return num.toString();
  };

  const getMaxValue = () => {
    return Math.max(...data.map(d => d[selectedMetric]));
  };

  const getMinValue = () => {
    return Math.min(...data.map(d => d[selectedMetric]));
  };

  const getBarHeight = (value: number) => {
    const max = getMaxValue();
    const min = getMinValue();
    const range = max - min || 1;
    return ((value - min) / range) * 100;
  };

  const getMetricColor = () => {
    switch (selectedMetric) {
      case 'spend':
        return 'bg-blue-500';
      case 'orders':
        return 'bg-green-500';
      case 'suppliers':
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getTrendData = () => {
    const firstValue = data[0][selectedMetric];
    const lastValue = data[data.length - 1][selectedMetric];
    const change = ((lastValue - firstValue) / firstValue) * 100;
    return {
      change,
      isPositive: change > 0,
      firstValue,
      lastValue
    };
  };

  const trend = getTrendData();

  const metrics = [
    {
      key: 'spend' as const,
      label: 'Total Spend',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      format: formatCurrency
    },
    {
      key: 'orders' as const,
      label: 'Orders',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      format: (num: number) => num.toString()
    },
    {
      key: 'suppliers' as const,
      label: 'Active Suppliers',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      format: (num: number) => num.toString()
    }
  ];

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex bg-gray-700/50 rounded-lg p-1">
            {[
              { key: '1m' as const, label: '1M' },
              { key: '3m' as const, label: '3M' },
              { key: '6m' as const, label: '6M' }
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  period === p.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={`p-3 rounded-lg border transition-all ${
                selectedMetric === metric.key
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-600/50 hover:border-gray-500 hover:bg-gray-700/30'
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${metric.color}`}>
                {metric.label}
              </div>
              <div className="text-lg font-bold text-white">
                {metric.format(data[data.length - 1][metric.key])}
              </div>
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="mb-4">
          <div className="flex items-end justify-between h-32 mb-4">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full h-full flex items-end justify-center">
                  <div
                    className={`w-8 ${getMetricColor()} rounded-t transition-all duration-500 hover:opacity-80`}
                    style={{
                      height: `${getBarHeight(item[selectedMetric])}%`,
                      minHeight: '4px'
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium">
                      {selectedMetric === 'spend' ? formatNumber(item[selectedMetric]) : item[selectedMetric]}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{item.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Summary */}
        <div className="p-4 bg-gray-700/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Period Change</div>
              <div className={`text-lg font-bold ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.change.toFixed(1)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">vs Previous Period</div>
              <div className="text-xs text-gray-500">
                {metrics.find(m => m.key === selectedMetric)?.format(trend.firstValue)} → {metrics.find(m => m.key === selectedMetric)?.format(trend.lastValue)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;