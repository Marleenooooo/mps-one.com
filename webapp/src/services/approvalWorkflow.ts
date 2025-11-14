import { getOfflineMode } from '../config';

export interface ApprovalWorkflow {
  id: string;
  company_id: number;
  name: string;
  description: string | null;
  document_type: 'pr' | 'po' | 'invoice' | 'contract';
  department_id: number | null;
  amount_min: number | null;
  amount_max: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_name: string;
  role_required: 'Admin' | 'PIC_Operational' | 'PIC_Procurement' | 'PIC_Finance';
  department_id: number | null;
  min_amount: number | null;
  max_amount: number | null;
  sla_hours: number;
  is_parallel: boolean;
  required_approvals: number;
  created_at: string;
  updated_at: string;
}

export interface ApprovalInstance {
  id: string;
  workflow_id: string;
  document_type: 'pr' | 'po' | 'invoice' | 'contract';
  document_id: number;
  requester_id: number;
  current_step: number;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'cancelled';
  amount: number | null;
  department_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalAction {
  id: string;
  instance_id: string;
  step_id: string;
  approver_id: number;
  action: 'approved' | 'rejected' | 'escalated' | 'delegated';
  comment: string | null;
  created_at: string;
}

export async function apiGetApprovalWorkflows(companyId?: number): Promise<{ workflows: ApprovalWorkflow[] }> {
  if (getOfflineMode()) {
    // Mock data for offline mode
    return {
      workflows: [
        {
          id: 'wf-001',
          company_id: 1,
          name: 'Standard PR Approval',
          description: 'Standard procurement request approval workflow for general purchases',
          document_type: 'pr',
          department_id: null,
          amount_min: 0,
          amount_max: 10000,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'wf-002',
          company_id: 1,
          name: 'High Value PR Approval',
          description: 'Enhanced approval workflow for high-value procurement requests',
          document_type: 'pr',
          department_id: null,
          amount_min: 10000,
          amount_max: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  const params = new URLSearchParams();
  if (companyId) params.append('company_id', companyId.toString());
  
  const res = await fetch(`/api/approval-workflows?${params}`);
  if (!res.ok) throw new Error('Failed to fetch approval workflows');
  return res.json();
}

export async function apiGetApprovalSteps(workflowId: string): Promise<{ steps: ApprovalStep[] }> {
  if (getOfflineMode()) {
    // Mock data for offline mode
    return {
      steps: [
        {
          id: 'step-001',
          workflow_id: workflowId,
          step_order: 1,
          step_name: 'Department Manager Review',
          role_required: 'PIC_Operational',
          department_id: null,
          min_amount: null,
          max_amount: null,
          sla_hours: 24,
          is_parallel: false,
          required_approvals: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'step-002',
          workflow_id: workflowId,
          step_order: 2,
          step_name: 'Procurement Approval',
          role_required: 'PIC_Procurement',
          department_id: null,
          min_amount: null,
          max_amount: null,
          sla_hours: 48,
          is_parallel: false,
          required_approvals: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  const res = await fetch(`/api/approval-workflows/${workflowId}/steps`);
  if (!res.ok) throw new Error('Failed to fetch approval steps');
  return res.json();
}

export async function apiCreateApprovalWorkflow(workflow: Omit<ApprovalWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<{ workflow: ApprovalWorkflow }> {
  if (getOfflineMode()) {
    // Mock creation for offline mode
    return {
      workflow: {
        ...workflow,
        id: `wf-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  const res = await fetch('/api/approval-workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow)
  });
  if (!res.ok) throw new Error('Failed to create approval workflow');
  return res.json();
}

export async function apiUpdateApprovalWorkflow(id: string, workflow: Partial<ApprovalWorkflow>): Promise<{ workflow: ApprovalWorkflow }> {
  if (getOfflineMode()) {
    // Mock update for offline mode
    return {
      workflow: {
        ...workflow,
        id,
        updated_at: new Date().toISOString()
      } as ApprovalWorkflow
    };
  }

  const res = await fetch(`/api/approval-workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow)
  });
  if (!res.ok) throw new Error('Failed to update approval workflow');
  return res.json();
}