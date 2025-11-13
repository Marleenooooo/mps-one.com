import React, { useState, useEffect } from 'react';
import { useI18n } from '../../components/I18nProvider';
import { Plus, Search, Users, DollarSign, FileText, Send } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'pending' | 'inactive';
}

interface RFQItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  specifications: string;
  deliveryDate: string;
}

export const EnhancedRFQCreation: React.FC = () => {
  const { t } = useI18n();
  const [activeStep, setActiveStep] = useState(0);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [items, setItems] = useState<RFQItem[]>([]);
  const [newItem, setNewItem] = useState({ description: '', quantity: 1, specifications: '', deliveryDate: '' });
const [rfqInfo, setRfqInfo] = useState<{ title: string; description: string; category: string; urgency: 'low' | 'medium' | 'high'; deadline: string }>({ title: '', description: '', category: '', urgency: 'medium', deadline: '' });

  useEffect(() => {
    const savedSuppliers = localStorage.getItem('mpsone_suppliers');
    if (savedSuppliers) {
      try {
        const parsed = JSON.parse(savedSuppliers);
        setSuppliers(parsed.map((s: any, index: number) => ({
          id: s.id || `supplier-${index}`,
          name: s.name || s.company || 'Unknown Supplier',
          category: s.category || 'General',
          rating: s.rating || 4.0,
          email: s.email || '',
          phone: s.phone || '',
          location: s.location || 'Indonesia',
          status: s.status || 'active'
        })));
      } catch (error) {
        console.error('Error loading suppliers:', error);
      }
    }
  }, []);

  const steps = [
    { title: 'RFQ Details', icon: FileText },
    { title: 'Items & Specs', icon: DollarSign },
    { title: 'Supplier Selection', icon: Users },
    { title: 'Review & Send', icon: Send }
  ];

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) && supplier.status === 'active'
  );

  const addItem = () => {
    if (newItem.description && newItem.quantity > 0) {
      const item: RFQItem = {
        id: `item-${Date.now()}`,
        description: newItem.description,
        quantity: newItem.quantity,
        unit: 'pcs',
        specifications: newItem.specifications,
        deliveryDate: newItem.deliveryDate
      };
      setItems([...items, item]);
      setNewItem({ description: '', quantity: 1, specifications: '', deliveryDate: '' });
    }
  };

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) ? prev.filter(id => id !== supplierId) : [...prev, supplierId]
    );
  };

  const sendRFQ = () => {
    const rfqData = {
      id: `rfq-${Date.now()}`,
      title: rfqInfo.title,
      description: rfqInfo.description,
      category: rfqInfo.category,
      urgency: rfqInfo.urgency,
      deadline: rfqInfo.deadline,
      items,
      selectedSuppliers,
      status: 'sent',
      createdAt: new Date().toISOString()
    };
    
    const existingRFQs = JSON.parse(localStorage.getItem('mpsone_rfq') || '[]');
    localStorage.setItem('mpsone_rfq', JSON.stringify([...existingRFQs, rfqData]));
    
    alert('RFQ sent successfully to selected suppliers!');
    setActiveStep(0);
    setItems([]);
    setSelectedSuppliers([]);
    setRfqInfo({ title: '', description: '', category: '', urgency: 'medium', deadline: '' });
  };

  return (
    <div className="main" role="main">
      <div className="page-header procurement">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Create Request for Quotation</h1>
            <p className="text-gray-400 mt-1">Send RFQ to multiple suppliers for competitive pricing</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  index <= activeStep ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-800 border-gray-600 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${index <= activeStep ? 'text-white' : 'text-gray-400'}`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-6 ${index < activeStep ? 'bg-blue-600' : 'bg-gray-600'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeStep === 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-6">RFQ Details</h2>
              <div className="space-y-4">
                <input type="text" placeholder="RFQ Title *" value={rfqInfo.title} onChange={(e) => setRfqInfo({...rfqInfo, title: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" />
                <textarea placeholder="Detailed Description *" value={rfqInfo.description} onChange={(e) => setRfqInfo({...rfqInfo, description: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" rows={4} />
                <div className="grid grid-cols-2 gap-4">
                  <select value={rfqInfo.category} onChange={(e) => setRfqInfo({...rfqInfo, category: e.target.value})} className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="office">Office Supplies</option>
                    <option value="machinery">Machinery</option>
                    <option value="raw-materials">Raw Materials</option>
                    <option value="services">Services</option>
                  </select>
                  <select value={rfqInfo.urgency} onChange={(e) => setRfqInfo({...rfqInfo, urgency: e.target.value as any})} className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <input type="date" value={rfqInfo.deadline} onChange={(e) => setRfqInfo({...rfqInfo, deadline: e.target.value})} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" />
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Items & Specifications</h2>
                <div className="text-sm text-gray-400">Total Items: <span className="text-white font-semibold">{items.length}</span></div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-white mb-4">Add New Item</h3>
                <div className="space-y-4">
                  <div><input type="text" placeholder="Item Description *" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" /></div>
                  <textarea placeholder="Technical Specifications *" value={newItem.specifications} onChange={(e) => setNewItem({...newItem, specifications: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" rows={2} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Quantity *" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                    <input type="date" placeholder="Required Delivery Date" value={newItem.deliveryDate} onChange={(e) => setNewItem({...newItem, deliveryDate: e.target.value})} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                  </div>
                </div>
                <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg mt-4"><Plus className="w-4 h-4" /> Add Item</button>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{item.description}</h4>
                        <div className="text-sm text-gray-400 mt-1">Quantity: {item.quantity} | Delivery: {item.deliveryDate || 'Not specified'}</div>
                        {item.specifications && <div className="text-sm text-gray-300 mt-2 p-2 bg-gray-700/50 rounded"><strong>Specs:</strong> {item.specifications}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Supplier Selection</h2>
                <div className="text-sm text-gray-400">Selected: <span className="text-white font-semibold">{selectedSuppliers.length}</span></div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search suppliers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" />
              </div>

              <div className="space-y-4">
                {filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className={`p-4 rounded-lg border cursor-pointer ${selectedSuppliers.includes(supplier.id) ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`} onClick={() => toggleSupplier(supplier.id)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-white">{supplier.name}</h3>
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">{supplier.rating}/5 ★</span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{supplier.category} • {supplier.location}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSuppliers.includes(supplier.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-600'}`}>
                        {selectedSuppliers.includes(supplier.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Review & Send</h2>
              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-3">RFQ Summary</h3>
                  <div className="text-sm text-gray-400 space-y-2">
                    <div className="flex justify-between"><span>Title:</span><span className="text-white">{rfqInfo.title}</span></div>
                    <div className="flex justify-between"><span>Category:</span><span className="text-white">{rfqInfo.category}</span></div>
                    <div className="flex justify-between"><span>Priority:</span><span className="text-white">{rfqInfo.urgency}</span></div>
                    <div className="flex justify-between"><span>Items:</span><span className="text-white">{items.length}</span></div>
                    <div className="flex justify-between"><span>Suppliers:</span><span className="text-white">{selectedSuppliers.length}</span></div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-3">Selected Suppliers</h3>
                  <div className="space-y-2">
                    {selectedSuppliers.map(supplierId => {
                      const supplier = suppliers.find(s => s.id === supplierId);
                      return supplier ? (
                        <div key={supplierId} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{supplier.name}</span>
                          <span className="text-gray-400">{supplier.email}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-4">
            <h3 className="font-medium text-white mb-4">RFQ Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Items Count</span><span className="text-white">{items.length}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Selected Suppliers</span><span className="text-white">{selectedSuppliers.length}</span></div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Priority</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  rfqInfo.urgency === 'high' ? 'bg-red-600/20 text-red-400' :
                  rfqInfo.urgency === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-green-600/20 text-green-400'
                }`}>{rfqInfo.urgency}</span>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="space-y-3">
              <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0} className="w-full px-4 py-2 border border-gray-600 text-gray-300 rounded-lg disabled:opacity-50">Previous</button>
              {activeStep < steps.length - 1 ? (
                <button onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg">Next</button>
              ) : (
                <button onClick={sendRFQ} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send RFQ</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRFQCreation;
