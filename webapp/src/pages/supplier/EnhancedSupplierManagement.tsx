import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, Phone, Mail, MapPin, TrendingUp, Award, Clock, DollarSign, Users, ChevronRight, Download, Plus, Edit, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../components/ThemeProvider';

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalOrders: number;
  onTimeDelivery: number;
  qualityScore: number;
  costCompetitiveness: number;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  status: 'active' | 'inactive' | 'pending';
  lastOrder: string;
  totalSpend: number;
  certifications: string[];
}

const mockSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'PT. Makmur Sejahtera',
    category: 'Electronics',
    rating: 4.8,
    totalOrders: 156,
    onTimeDelivery: 95,
    qualityScore: 92,
    costCompetitiveness: 88,
    contact: {
      email: 'procurement@makmur.co.id',
      phone: '+62 21 5555 1000',
      address: 'Jakarta Selatan, Indonesia'
    },
    status: 'active',
    lastOrder: '2024-01-15',
    totalSpend: 2850000000,
    certifications: ['ISO 9001', 'ISO 14001']
  },
  {
    id: 'SUP-002',
    name: 'CV. Sumber Rejeki',
    category: 'Office Supplies',
    rating: 4.5,
    totalOrders: 89,
    onTimeDelivery: 88,
    qualityScore: 85,
    costCompetitiveness: 92,
    contact: {
      email: 'sales@sumberrejeki.co.id',
      phone: '+62 21 5555 2000',
      address: 'Tangerang, Indonesia'
    },
    status: 'active',
    lastOrder: '2024-01-10',
    totalSpend: 1250000000,
    certifications: ['SNI']
  },
  {
    id: 'SUP-003',
    name: 'PT. Global Mandiri',
    category: 'Industrial Equipment',
    rating: 4.3,
    totalOrders: 67,
    onTimeDelivery: 82,
    qualityScore: 89,
    costCompetitiveness: 78,
    contact: {
      email: 'info@globalmandiri.co.id',
      phone: '+62 21 5555 3000',
      address: 'Surabaya, Indonesia'
    },
    status: 'pending',
    lastOrder: '2023-12-20',
    totalSpend: 890000000,
    certifications: ['ISO 9001']
  },
  {
    id: 'SUP-004',
    name: 'CV. Sentosa Abadi',
    category: 'Chemicals',
    rating: 4.6,
    totalOrders: 134,
    onTimeDelivery: 91,
    qualityScore: 94,
    costCompetitiveness: 85,
    contact: {
      email: 'order@sentosaabadi.co.id',
      phone: '+62 21 5555 4000',
      address: 'Bandung, Indonesia'
    },
    status: 'active',
    lastOrder: '2024-01-12',
    totalSpend: 2100000000,
    certifications: ['ISO 9001', 'Halal']
  }
];

export const EnhancedSupplierManagement: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'orders' | 'spend'>('rating');
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState<string | null>(null);

  const categories = ['all', 'Electronics', 'Office Supplies', 'Industrial Equipment', 'Chemicals'];
  const statuses = ['all', 'active', 'inactive', 'pending'];

  const filteredSuppliers = useMemo(() => {
    let filtered = mockSuppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || supplier.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || supplier.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'orders':
          return b.totalOrders - a.totalOrders;
        case 'spend':
          return b.totalSpend - a.totalSpend;
        default:
          return 0;
      }
    });
  }, [searchTerm, selectedCategory, selectedStatus, sortBy]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleContactSupplier = (supplierId: string, method: 'email' | 'phone') => {
    const supplier = mockSuppliers.find(s => s.id === supplierId);
    if (supplier) {
      if (method === 'email') {
        window.location.href = `mailto:${supplier.contact.email}`;
      } else {
        window.location.href = `tel:${supplier.contact.phone}`;
      }
    }
  };

  const handleExportSuppliers = () => {
    const csvContent = [
      ['Supplier Name', 'Category', 'Rating', 'Total Orders', 'Total Spend', 'Status'],
      ...filteredSuppliers.map(supplier => [
        supplier.name,
        supplier.category,
        supplier.rating.toString(),
        supplier.totalOrders.toString(),
        formatCurrency(supplier.totalSpend),
        supplier.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suppliers-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('supplier.management')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {t('supplier.management.subtitle')}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExportSuppliers}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('common.export')}
              </button>
              <button className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                {t('supplier.add.new')}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockSuppliers.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockSuppliers.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(mockSuppliers.reduce((sum, s) => sum + s.rating, 0) / mockSuppliers.length).toFixed(1)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spend</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(mockSuppliers.reduce((sum, s) => sum + s.totalSpend, 0))}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? t('common.all.categories') : category}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? t('common.all.statuses') : t(`supplier.status.${status}`)}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'orders' | 'spend')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="rating">{t('supplier.sort.rating')}</option>
                <option value="orders">{t('supplier.sort.orders')}</option>
                <option value="spend">{t('supplier.sort.spend')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Supplier Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {supplier.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          supplier.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : supplier.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {t(`supplier.status.${supplier.status}`)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {supplier.contact.address}
                      </span>
                      <span>{supplier.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {renderStars(supplier.rating)}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {supplier.rating.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {supplier.totalOrders}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {supplier.onTimeDelivery}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">On-Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(supplier.totalSpend)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Spend</div>
                  </div>
                </div>

                {/* Certifications */}
                {supplier.certifications.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {supplier.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setExpandedSupplier(expandedSupplier === supplier.id ? null : supplier.id)}
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    {t('supplier.view.details')}
                    <ChevronRight
                      className={`w-4 h-4 ml-1 transform transition-transform ${
                        expandedSupplier === supplier.id ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleContactSupplier(supplier.id, 'email')}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      title={t('common.contact.email')}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleContactSupplier(supplier.id, 'phone')}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                      title={t('common.contact.phone')}
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedSupplier === supplier.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance Metrics</div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Quality Score</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{supplier.qualityScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Cost Competitiveness</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{supplier.costCompetitiveness}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Information</div>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {supplier.contact.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {supplier.contact.phone}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {supplier.contact.address}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Last Order: {new Date(supplier.lastOrder).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('supplier.no.results')}</p>
              <p className="text-sm">{t('supplier.try.different.search')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};