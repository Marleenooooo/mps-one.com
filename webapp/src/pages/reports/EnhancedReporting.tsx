import React, { useState } from 'react';
import { Download, Filter, Calendar, TrendingUp, Building2, DollarSign, FileText, BarChart3, PieChart, Users, Package } from 'lucide-react';

interface ReportData {
  monthlySpend: Array<{
    month: string;
    amount: number;
    orders: number;
    suppliers: number;
  }>;
  topSuppliers: Array<{
    id: string;
    name: string;
    totalSpend: number;
    orders: number;
    category: string;
    rating: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  procurementMetrics: {
    totalSpend: number;
    totalOrders: number;
    avgOrderValue: number;
    topCategory: string;
    savings: number;
  };
}

const mockReportData: ReportData = {
  monthlySpend: [
    { month: 'Jan 2024', amount: 1250000000, orders: 45, suppliers: 12 },
    { month: 'Feb 2024', amount: 980000000, orders: 38, suppliers: 10 },
    { month: 'Mar 2024', amount: 1420000000, orders: 52, suppliers: 15 },
    { month: 'Apr 2024', amount: 1180000000, orders: 41, suppliers: 11 },
    { month: 'May 2024', amount: 1650000000, orders: 58, suppliers: 18 },
    { month: 'Jun 2024', amount: 1380000000, orders: 47, suppliers: 14 }
  ],
  topSuppliers: [
    { id: '1', name: 'PT Teknologi Indonesia', totalSpend: 450000000, orders: 15, category: 'IT Equipment', rating: 4.8 },
    { id: '2', name: 'PT Suplai Global', totalSpend: 380000000, orders: 12, category: 'Office Supplies', rating: 4.6 },
    { id: '3', name: 'PT Solusi Bisnis', totalSpend: 320000000, orders: 10, category: 'Software', rating: 4.9 },
    { id: '4', name: 'PT Mandiri Sejahtera', totalSpend: 280000000, orders: 9, category: 'Furniture', rating: 4.5 },
    { id: '5', name: 'PT Inovasi Teknik', totalSpend: 250000000, orders: 8, category: 'Engineering', rating: 4.7 }
  ],
  categoryBreakdown: [
    { category: 'IT Equipment', amount: 850000000, percentage: 28, color: '#3B82F6' },
    { category: 'Office Supplies', amount: 620000000, percentage: 21, color: '#10B981' },
    { category: 'Software', amount: 480000000, percentage: 16, color: '#F59E0B' },
    { category: 'Furniture', amount: 420000000, percentage: 14, color: '#EF4444' },
    { category: 'Engineering', amount: 360000000, percentage: 12, color: '#8B5CF6' },
    { category: 'Others', amount: 270000000, percentage: 9, color: '#6B7280' }
  ],
  procurementMetrics: {
    totalSpend: 3000000000,
    totalOrders: 281,
    avgOrderValue: 10670000,
    topCategory: 'IT Equipment',
    savings: 125000000
  }
};

export const EnhancedReporting: React.FC = () => {
  const [reportData] = useState<ReportData>(mockReportData);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedReport, setSelectedReport] = useState('spend');
  const [showFilters, setShowFilters] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const exportReport = (type: string) => {
    const data = JSON.stringify(reportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${type}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Laporan & Analitik</h1>
              <p className="text-slate-600">Analisis pengeluaran, performa supplier, dan metrik procurement</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportReport('full')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <select
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="1month">1 Bulan</option>
                <option value="3months">3 Bulan</option>
                <option value="6months">6 Bulan</option>
                <option value="1year">1 Tahun</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-400" />
              <select
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                <option value="spend">Pengeluaran</option>
                <option value="suppliers">Supplier</option>
                <option value="categories">Kategori</option>
                <option value="performance">Performa</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter Lanjutan
            </button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Semua Kategori</option>
                  <option value="it">IT Equipment</option>
                  <option value="office">Office Supplies</option>
                  <option value="software">Software</option>
                  <option value="furniture">Furniture</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Supplier</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Semua Supplier</option>
                  <option value="1">PT Teknologi Indonesia</option>
                  <option value="2">PT Suplai Global</option>
                  <option value="3">PT Solusi Bisnis</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Semua Status</option>
                  <option value="completed">Selesai</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">+12%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(reportData.procurementMetrics.totalSpend)}</p>
              <p className="text-sm text-slate-500 mt-1">6 bulan terakhir</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">+8%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Pesanan</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(reportData.procurementMetrics.totalOrders)}</p>
              <p className="text-sm text-slate-500 mt-1">281 pesanan</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">+5%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Rata-rata Nilai Pesanan</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(reportData.procurementMetrics.avgOrderValue)}</p>
              <p className="text-sm text-slate-500 mt-1">Per pesanan</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">+15%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Penghematan</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(reportData.procurementMetrics.savings)}</p>
              <p className="text-sm text-slate-500 mt-1">Dihemat tahun ini</p>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Spend Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Tren Pengeluaran Bulanan</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Lihat Detail
              </button>
            </div>
            <div className="space-y-4">
              {reportData.monthlySpend.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{month.month}</span>
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(month.amount)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                        style={{ width: `${(month.amount / Math.max(...reportData.monthlySpend.map(m => m.amount))) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                      <span>{month.orders} pesanan</span>
                      <span>{month.suppliers} supplier</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Pengeluaran per Kategori</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Lihat Detail
              </button>
            </div>
            <div className="space-y-4">
              {reportData.categoryBreakdown.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-slate-700">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(category.amount)}</p>
                    <p className="text-xs text-slate-500">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Total</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(reportData.categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Supplier Teratas</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Supplier</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total Spend</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Pesanan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportData.topSuppliers.map((supplier, index) => (
                  <tr key={supplier.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{supplier.name}</p>
                        <p className="text-sm text-slate-500">{supplier.orders} pesanan</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {supplier.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{formatCurrency(supplier.totalSpend)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">{supplier.orders}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-400' : 'text-slate-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{supplier.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};