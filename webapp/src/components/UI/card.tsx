import React from 'react';

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-lg border">{children}</div>;
}
export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 border-b border-gray-200">{children}</div>;
}
export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-medium ${className || ''}`}>{children}</h3>;
}
export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
}
