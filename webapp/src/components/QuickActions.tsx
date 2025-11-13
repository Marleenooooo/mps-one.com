import React from 'react';
import { Plus, FileText, Users, TrendingUp, Download, Filter } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  variant: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  href?: string;
}

interface QuickActionsProps {
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ className = '' }) => {
  const actions: QuickAction[] = [
    {
      id: 'create-rfq',
      title: 'Create RFQ',
      description: 'Start a new request for quotation',
      icon: <Plus className="w-5 h-5" />,
      variant: 'primary',
      href: '/procurement/rfq/enhanced'
    },
    {
      id: 'create-po',
      title: 'Create PO',
      description: 'Generate new purchase order',
      icon: <FileText className="w-5 h-5" />,
      variant: 'secondary',
      href: '/procurement/pr/enhanced'
    },
    {
      id: 'manage-suppliers',
      title: 'Manage Suppliers',
      description: 'View and manage supplier list',
      icon: <Users className="w-5 h-5" />,
      variant: 'outline',
      href: '/client/suppliers'
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Access spending analytics',
      icon: <TrendingUp className="w-5 h-5" />,
      variant: 'outline',
      href: '/supplier/reporting'
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download procurement data',
      icon: <Download className="w-5 h-5" />,
      variant: 'outline',
      onClick: () => console.log('Export Data clicked')
    },
    {
      id: 'advanced-filter',
      title: 'Advanced Filter',
      description: 'Filter and search records',
      icon: <Filter className="w-5 h-5" />,
      variant: 'outline',
      onClick: () => console.log('Advanced Filter clicked')
    }
  ];

  const getButtonStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-blue-500/25';
      case 'secondary':
        return 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 shadow-lg hover:shadow-purple-500/25';
      case 'outline':
        return 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white';
      default:
        return 'bg-gray-700 text-white hover:bg-gray-600';
    }
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
        <div className="text-xs text-gray-400">6 actions available</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          action.href ? (
            <a
              key={action.id}
              href={action.href}
              className={`group relative p-4 rounded-lg border border-gray-600/50 hover:border-gray-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${getButtonStyles(action.variant)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  {action.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{action.description}</p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </a>
          ) : (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`group relative p-4 rounded-lg border border-gray-600/50 hover:border-gray-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${getButtonStyles(action.variant)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  {action.icon}
                </div>
              
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{action.description}</p>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </button>
          )
        ))}
      </div>

      {/* Action summary */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last action: Create RFQ</span>
          <span>2 minutes ago</span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;