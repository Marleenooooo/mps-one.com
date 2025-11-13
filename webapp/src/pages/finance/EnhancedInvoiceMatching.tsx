import React, { useState } from 'react';
import { Search, Filter, Download, CheckCircle, XCircle, Clock, AlertCircle, Eye, FileText, DollarSign } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber: string;
  supplierName: string;
  invoiceDate: string;
  dueDate: string;
  invoiceAmount: number;
  poAmount: number;
  status: 'pending' | 'matched' | 'discrepancy' | 'approved' | 'paid' | 'overdue';
  discrepancyAmount?: number;
  discrepancyReason?: string;
  paymentStatus: 'pending' | 'scheduled' | 'paid' | 'overdue';
  paymentDate?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    poNumber: 'PO-2024-001',
    supplierName: 'PT Teknologi Indonesia',
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-14',
    invoiceAmount: 50000000,
    poAmount: 50000000,
    status: 'matched',
    paymentStatus: 'scheduled',
    paymentDate: '2024-02-10'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    poNumber: 'PO-2024-002',
    supplierName: 'PT Suplai Global',
    invoiceDate: '2024-01-20',
    dueDate: '2024-02-19',
    invoiceAmount: 25200000,
    poAmount: 25000000,
    status: 'discrepancy',
    discrepancyAmount: 200000,
    discrepancyReason: 'Harga satuan berbeda',
    paymentStatus: 'pending'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    poNumber: 'PO-2024-003',
    supplierName: 'PT Solusi Bisnis',
    invoiceDate: '2024-01-25',
    dueDate: '2024-02-24',
    invoiceAmount: 75000000,
    poAmount: 75000000,
    status: 'approved',
    paymentStatus: 'paid',
    paymentDate: '2024-01-30'
  }
];

export const EnhancedInvoiceMatching: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || invoice.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'matched':
      case 'approved':
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'discrepancy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched':
      case 'approved':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'discrepancy':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Pencocokan Invoice</h1>
              <p className="text-slate-600">Kelola dan cocokan invoice dengan purchase orders</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Invoice</p>
                <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tercocok</p>
                <p className="text-2xl font-bold text-green-600">
                  {invoices.filter(i => i.status === 'matched' || i.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Diskrepansi</p>
                <p className="text-2xl font-bold text-red-600">
                  {invoices.filter(i => i.status === 'discrepancy').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Dibayar</p>
                <p className="text-2xl font-bold text-blue-600">
                  {invoices.filter(i => i.paymentStatus === 'paid').length}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari invoice, PO, atau supplier..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="matched">Tercocok</option>
                <option value="discrepancy">Diskrepansi</option>
                <option value="approved">Disetujui</option>
              </select>
              
              <select
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">Semua Pembayaran</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Terjadwal</option>
                <option value="paid">Dibayar</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Invoice</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">PO Reference</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Supplier</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Jumlah</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Pembayaran</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-slate-500">{invoice.supplierName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{invoice.poNumber}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(invoice.poAmount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{invoice.supplierName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-900">{new Date(invoice.invoiceDate).toLocaleDateString('id-ID')}</p>
                        <p className="text-slate-500">Jatuh tempo: {new Date(invoice.dueDate).toLocaleDateString('id-ID')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-slate-900">{formatCurrency(invoice.invoiceAmount)}</p>
                        {invoice.discrepancyAmount && (
                          <p className="text-red-600 text-xs">
                            Selisih: {formatCurrency(invoice.discrepancyAmount)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {invoice.status === 'matched' && 'Tercocok'}
                        {invoice.status === 'discrepancy' && 'Diskrepansi'}
                        {invoice.status === 'pending' && 'Pending'}
                        {invoice.status === 'approved' && 'Disetujui'}
                        {invoice.status === 'paid' && 'Dibayar'}
                        {invoice.status === 'overdue' && 'Terlambat'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                        {invoice.paymentStatus === 'paid' && 'Dibayar'}
                        {invoice.paymentStatus === 'scheduled' && 'Terjadwal'}
                        {invoice.paymentStatus === 'pending' && 'Pending'}
                        {invoice.paymentStatus === 'overdue' && 'Terlambat'}
                      </span>
                      {invoice.paymentDate && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(invoice.paymentDate).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Detail Invoice</h2>
                    <p className="text-slate-600">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Invoice</label>
                      <p className="text-slate-900">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nomor PO</label>
                      <p className="text-slate-900">{selectedInvoice.poNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                      <p className="text-slate-900">{selectedInvoice.supplierName}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Invoice</label>
                      <p className="text-slate-900">{new Date(selectedInvoice.invoiceDate).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Jatuh Tempo</label>
                      <p className="text-slate-900">{new Date(selectedInvoice.dueDate).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedInvoice.status)}`}>
                        {selectedInvoice.status === 'matched' && 'Tercocok'}
                        {selectedInvoice.status === 'discrepancy' && 'Diskrepansi'}
                        {selectedInvoice.status === 'pending' && 'Pending'}
                        {selectedInvoice.status === 'approved' && 'Disetujui'}
                        {selectedInvoice.status === 'paid' && 'Dibayar'}
                        {selectedInvoice.status === 'overdue' && 'Terlambat'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 pt-6 mt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-600">Total Invoice</p>
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(selectedInvoice.invoiceAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Total PO</p>
                      <p className="text-lg font-semibold text-slate-700">{formatCurrency(selectedInvoice.poAmount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};