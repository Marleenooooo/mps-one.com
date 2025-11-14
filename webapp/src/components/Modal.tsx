import React from 'react';

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow w-full max-w-lg">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-500">×</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
