import React from 'react';

export function StatisticsCard({ title, value, icon, variant }: { title: string; value: React.ReactNode; icon?: React.ReactNode | string; variant?: 'default' | 'warning' | 'success' | 'danger' | 'info' | 'secondary' }) {
  return (
    <div className={`bg-white rounded-lg border p-4`}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
