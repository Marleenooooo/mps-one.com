import React from 'react';

export function Tabs({ children }: { children: React.ReactNode; defaultValue?: string; className?: string }) {
  return <div className="space-y-4">{children}</div>;
}
export function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2">{children}</div>;
}
export function TabsTrigger({ children }: { children: React.ReactNode; value: string }) {
  return <button className="px-3 py-1 border-b-2">{children}</button>;
}
export function TabsContent({ children }: { children: React.ReactNode; value: string; className?: string }) {
  return <div>{children}</div>;
}
