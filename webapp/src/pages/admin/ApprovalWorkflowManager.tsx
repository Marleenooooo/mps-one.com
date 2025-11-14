import React, { useEffect, useState } from 'react';
import { useModule } from '../../components/useModule';
import { useI18n } from '../../components/I18nProvider';
import { canPerform } from '../../utils/permissions';
import { DataTable } from '../../components/UI/DataTable';
import { Plus, Settings, Clock, Users, AlertCircle } from 'lucide-react';
import { apiGetApprovalWorkflows, ApprovalWorkflow as ApiApprovalWorkflow, ApprovalStep as ApiApprovalStep } from '../../services/approvalWorkflow';

interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  documentType: 'pr' | 'po' | 'invoice' | 'contract';
  department: string;
  amountMin: number | null;
  amountMax: number | null;
  isActive: boolean;
  steps: ApprovalStep[];
  createdAt: string;
}

interface ApprovalStep {
  id: string;
  stepOrder: number;
  stepName: string;
  roleRequired: string;
  department: string;
  slaHours: number;
  isParallel: boolean;
  requiredApprovals: number;
}

export default function ApprovalWorkflowManager() {
  useModule('procurement');
  const { t } = useI18n();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<ApprovalWorkflow | null>(null);

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const { workflows } = await apiGetApprovalWorkflows();
        const mappedWorkflows: ApprovalWorkflow[] = workflows.map(wf => ({
          id: wf.id,
          name: wf.name,
          description: wf.description || '',
          documentType: wf.document_type,
          department: 'All Departments', // TODO: Map department_id to department name
          amountMin: wf.amount_min,
          amountMax: wf.amount_max,
          isActive: wf.is_active,
          steps: [], // TODO: Load steps separately
          createdAt: wf.created_at
        }));
        setWorkflows(mappedWorkflows);
      } catch (error) {
        console.error('Failed to load approval workflows:', error);
        // Fallback to mock data
        const mockWorkflows: ApprovalWorkflow[] = [
      {
        id: 'wf-001',
        name: 'Standard PR Approval',
        description: 'Standard procurement request approval workflow for general purchases',
        documentType: 'pr',
        department: 'All Departments',
        amountMin: 0,
        amountMax: 10000,
        isActive: true,
        steps: [
          {
            id: 'step-001',
            stepOrder: 1,
            stepName: 'Department Manager Review',
            roleRequired: 'PIC_Operational',
            department: 'Requesting Department',
            slaHours: 24,
            isParallel: false,
            requiredApprovals: 1
          },
          {
            id: 'step-002',
            stepOrder: 2,
            stepName: 'Procurement Approval',
            roleRequired: 'PIC_Procurement',
            department: 'Procurement',
            slaHours: 48,
            isParallel: false,
            requiredApprovals: 1
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'wf-002',
        name: 'High Value PR Approval',
        description: 'Enhanced approval workflow for high-value procurement requests',
        documentType: 'pr',
        department: 'All Departments',
        amountMin: 10000,
        amountMax: null,
        isActive: true,
        steps: [
          {
            id: 'step-003',
            stepOrder: 1,
            stepName: 'Department Manager Review',
            roleRequired: 'PIC_Operational',
            department: 'Requesting Department',
            slaHours: 24,
            isParallel: false,
            requiredApprovals: 1
          },
          {
            id: 'step-004',
            stepOrder: 2,
            stepName: 'Finance Director Approval',
            roleRequired: 'PIC_Finance',
            department: 'Finance',
            slaHours: 72,
            isParallel: false,
            requiredApprovals: 1
          },
          {
            id: 'step-005',
            stepOrder: 3,
            stepName: 'Executive Approval',
            roleRequired: 'Admin',
            department: 'Executive',
            slaHours: 120,
            isParallel: false,
            requiredApprovals: 1
          }
        ],
        createdAt: new Date().toISOString()
      }
    ];
        setWorkflows(mockWorkflows);
      }
    };

    loadWorkflows();
  }, []);

  const handleCreateWorkflow = () => {
    setEditingWorkflow(null);
    setShowCreateModal(true);
  };

  const handleEditWorkflow = (workflow: ApprovalWorkflow) => {
    setEditingWorkflow(workflow);
    setShowCreateModal(true);
  };

  const handleToggleActive = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const formatAmount = (min: number | null, max: number | null) => {
    if (min === null && max === null) return 'Any amount';
    if (min === null) return `Up to ${max?.toLocaleString()}`;
    if (max === null) return `${min?.toLocaleString()}+`;
    return `${min?.toLocaleString()} - ${max?.toLocaleString()}`;
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'pr': return 'Purchase Request';
      case 'po': return 'Purchase Order';
      case 'invoice': return 'Invoice';
      case 'contract': return 'Contract';
      default: return type.toUpperCase();
    }
  };

  if (!canPerform('view:approval-workflow', 'procurement')) {
    return (
      <div className="main" role="main" aria-label={t('approval_workflow.title')}>
        <div className="page-header procurement">
          <h1>{t('approval_workflow.title')}</h1>
        </div>
        <div className="alert warning">
          <AlertCircle size={16} />
          {t('error.permission_denied') || 'You do not have permission to access this page.'}
        </div>
      </div>
    );
  }

  return (
    <div className="main" role="main" aria-label={t('approval_workflow.title')}>
      <div className="page-header procurement">
        <h1>{t('approval_workflow.title')}</h1>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2>{t('approval_workflow.subtitle') || 'Approval Workflow Management'}</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            {t('approval_workflow.description') || 'Configure multi-level approval processes with SLAs and escalation rules'}
          </p>
        </div>
        <button 
          className="btn primary"
          onClick={handleCreateWorkflow}
          disabled={!canPerform('create:approval-workflow', 'procurement')}
        >
          <Plus size={16} />
          {t('approval_workflow.create_workflow') || 'Create Workflow'}
        </button>
      </div>

      <div className="status-badge info">{workflows.length} {t('approval_workflow.total_workflows') || 'Total Workflows'}</div>

      <div style={{ marginTop: 24 }}>
        <DataTable
          data={workflows}
          columns={[
            { 
              key: 'name', 
              header: t('approval_workflow.workflow_name') || 'Workflow Name',
              render: (v, row) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{v}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{row.description}</div>
                </div>
              )
            },
            { 
              key: 'documentType', 
              header: t('approval_workflow.document_type') || 'Document Type',
              render: v => getDocumentTypeLabel(v)
            },
            { 
              key: 'department', 
              header: t('approval_workflow.department') || 'Department'
            },
            { 
              key: 'amountMin', 
              header: t('approval_workflow.amount_range') || 'Amount Range',
              render: (_v, row) => formatAmount(row.amountMin, row.amountMax)
            },
            { 
              key: 'steps', 
              header: t('approval_workflow.steps') || 'Steps',
              render: (_v, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Settings size={14} />
                  {row.steps.length} {t('approval_workflow.steps') || 'steps'}
                </div>
              )
            },
            { 
              key: 'steps', 
              header: t('approval_workflow.sla') || 'SLA',
              render: (_v, row) => {
                const totalSLA = row.steps.reduce((sum, step) => sum + step.slaHours, 0);
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} />
                    {totalSLA}h
                  </div>
                );
              }
            },
            { 
              key: 'isActive', 
              header: t('approval_workflow.status') || 'Status',
              render: (v) => (
                <span className={`status-badge ${v ? 'success' : 'warning'}`}>
                  {v ? t('approval_workflow.active') || 'Active' : t('approval_workflow.inactive') || 'Inactive'}
                </span>
              )
            },
            { 
              key: 'id', 
              header: t('action.actions') || 'Actions',
              render: (_v, row) => (
                <div className="btn-row">
                  <button 
                    className="btn sm outline"
                    onClick={() => handleEditWorkflow(row)}
                    disabled={!canPerform('edit:approval-workflow', 'procurement')}
                  >
                    {t('action.edit') || 'Edit'}
                  </button>
                  <button 
                    className={`btn sm ${row.isActive ? 'warning' : 'success'}`}
                    onClick={() => handleToggleActive(row.id)}
                    disabled={!canPerform('toggle:approval-workflow', 'procurement')}
                  >
                    {row.isActive ? t('action.deactivate') || 'Deactivate' : t('action.activate') || 'Activate'}
                  </button>
                </div>
              )
            },
          ]}
        />
      </div>

      {showCreateModal && (
        <ApprovalWorkflowModal
          workflow={editingWorkflow}
          onClose={() => setShowCreateModal(false)}
          onSave={(workflow) => {
            if (editingWorkflow) {
              setWorkflows(prev => prev.map(w => w.id === workflow.id ? workflow : w));
            } else {
              setWorkflows(prev => [...prev, { ...workflow, id: `wf-${Date.now()}` }]);
            }
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

interface ApprovalWorkflowModalProps {
  workflow: ApprovalWorkflow | null;
  onClose: () => void;
  onSave: (workflow: ApprovalWorkflow) => void;
}

function ApprovalWorkflowModal({ workflow, onClose, onSave }: ApprovalWorkflowModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<ApprovalWorkflow>(
    workflow || {
      id: '',
      name: '',
      description: '',
      documentType: 'pr',
      department: 'All Departments',
      amountMin: null,
      amountMax: null,
      isActive: true,
      steps: [],
      createdAt: new Date().toISOString()
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{workflow ? t('approval_workflow.edit_workflow') || 'Edit Workflow' : t('approval_workflow.create_workflow') || 'Create Workflow'}</h3>
          <button className="btn icon" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>{t('approval_workflow.workflow_name') || 'Workflow Name'}</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('approval_workflow.description') || 'Description'}</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('approval_workflow.document_type') || 'Document Type'}</label>
                <select
                  value={formData.documentType}
                  onChange={e => setFormData(prev => ({ ...prev, documentType: e.target.value as any }))}
                >
                  <option value="pr">Purchase Request</option>
                  <option value="po">Purchase Order</option>
                  <option value="invoice">Invoice</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('approval_workflow.department') || 'Department'}</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="All Departments"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('approval_workflow.min_amount') || 'Minimum Amount'}</label>
                <input
                  type="number"
                  value={formData.amountMin || ''}
                  onChange={e => setFormData(prev => ({ ...prev, amountMin: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="No minimum"
                />
              </div>
              <div className="form-group">
                <label>{t('approval_workflow.max_amount') || 'Maximum Amount'}</label>
                <input
                  type="number"
                  value={formData.amountMax || ''}
                  onChange={e => setFormData(prev => ({ ...prev, amountMax: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="No maximum"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn outline" onClick={onClose}>
              {t('action.cancel') || 'Cancel'}
            </button>
            <button type="submit" className="btn primary">
              {workflow ? t('action.save') || 'Save' : t('action.create') || 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
