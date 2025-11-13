import React, { useState } from 'react';
import { Star, Phone, Mail, MapPin, TrendingUp, Award, Clock, DollarSign } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalOrders: number;
  totalSpend: number;
  status: 'active' | 'pending' | 'inactive';
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  performance: {
    onTimeDelivery: number;
    qualityScore: number;
    costCompetitiveness: number;
  };
  lastOrder?: string;
}

interface SupplierOverviewProps {
  className?: string;
  maxItems?: number;
}

export const SupplierOverview: React.FC<SupplierOverviewProps> = ({ 
  className = '', 
  maxItems = 5 
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  const suppliers: Supplier[] = [
    {
      id: '1',
      name: 'PT. Makmur Sejahtera',
      category: 'Electronics',
      rating: 4.8,
      totalOrders: 156,
      totalSpend: 2850000000,
      status: 'active',
      contact: {
        email: 'procurement@makmur.co.id',
        phone: '+62 21 5555 1234',
        location: 'Jakarta'
      },
      performance: {
        onTimeDelivery: 95,
        qualityScore: 92,
        costCompetitiveness: 88
      },
      lastOrder: '2024-11-10'
    },
    {
      id: '2',
      name: 'CV. Sumber Daya Indah',
      category: 'Office Supplies',
      rating: 4.5,
      totalOrders: 89,
      totalSpend: 1250000000,
      status: 'active',
      contact: {
        email: 'sales@sumberdaya.co.id',
        phone: '+62 22 3333 5678',
        location: 'Bandung'
      },
      performance: {
        onTimeDelivery: 88,
        qualityScore: 85,
        costCompetitiveness: 92
      },
      lastOrder: '2024-11-08'
    },
    {
      id: '3',
      name: 'PT. Global Teknologi Solusi',
      category: 'IT Equipment',
      rating: 4.7,
      totalOrders: 67,
      totalSpend: 3200000000,
      status: 'active',
      contact: {
        email: 'business@globaltek.id',
        phone: '+62 21 7777 9999',
        location: 'Tangerang'
      },
      performance: {
        onTimeDelivery: 91,
        qualityScore: 94,
        costCompetitiveness: 85
      },
      lastOrder: '2024-11-12'
    },
    {
      id: '4',
      name: 'PT. Karya Abadi Sentosa',
      category: 'Construction',
      rating: 4.3,
      totalOrders: 45,
      totalSpend: 1800000000,
      status: 'pending',
      contact: {
        email: 'info@karyaabadi.co.id',
        phone: '+62 24 8888 1111',
        location: 'Semarang'
      },
      performance: {
        onTimeDelivery: 82,
        qualityScore: 88,
        costCompetitiveness: 90
      },
      lastOrder: '2024-10-28'
    },
    {
      id: '5',
      name: 'CV. Sehat Bersama',
      category: 'Medical Supplies',
      rating: 4.6,
      totalOrders: 72,
      totalSpend: 950000000,
      status: 'active',
      contact: {
        email: 'order@sehatbersama.co.id',
        phone: '+62 31 6666 2222',
        location: 'Surabaya'
      },
      performance: {
        onTimeDelivery: 89,
        qualityScore: 91,
        costCompetitiveness: 87
      },
      lastOrder: '2024-11-09'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
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

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Top Suppliers</h2>
          <div className="text-xs text-gray-400">{suppliers.length} suppliers</div>
        </div>

        <div className="space-y-4">
          {suppliers.slice(0, maxItems).map((supplier) => (
            <div
              key={supplier.id}
              className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                selectedSupplier === supplier.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600/50 hover:border-gray-500 hover:bg-gray-700/30'
              }`}
              onClick={() => setSelectedSupplier(selectedSupplier === supplier.id ? null : supplier.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white text-sm">{supplier.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{supplier.category}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  {getRatingStars(supplier.rating)}
                  <span className="text-xs text-gray-400 ml-1">{supplier.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{supplier.totalOrders}</div>
                  <div className="text-xs text-gray-500">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{formatCurrency(supplier.totalSpend)}</div>
                  <div className="text-xs text-gray-500">Total Spend</div>
                </div>
              </div>

              {selectedSupplier === supplier.id && (
                <div className="pt-3 border-t border-gray-600/50 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-gray-400">Delivery</span>
                      </div>
                      <div className="text-sm font-medium text-white">{supplier.performance.onTimeDelivery}%</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Award className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-gray-400">Quality</span>
                      </div>
                      <div className="text-sm font-medium text-white">{supplier.performance.qualityScore}%</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-400">Cost</span>
                      </div>
                      <div className="text-sm font-medium text-white">{supplier.performance.costCompetitiveness}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Mail className="w-3 h-3" />
                      <span>{supplier.contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Phone className="w-3 h-3" />
                      <span>{supplier.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{supplier.contact.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
                      Contact
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 text-xs rounded-lg transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm rounded-lg transition-all duration-300">
            View All Suppliers
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierOverview;