import React from 'react';
import { Plus } from 'lucide-react';

export default function DepartmentalBudgetManager() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departmental Budgets</h1>
          <p className="text-muted-foreground">
            Manage departmental budgets, threshold routing, and escalations
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          Create Department
        </button>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Departments</h3>
        </div>
        <div className="p-6 pt-0">
          <p className="text-muted-foreground">Departmental budget management coming soon...</p>
        </div>
      </div>
    </div>
  );
}