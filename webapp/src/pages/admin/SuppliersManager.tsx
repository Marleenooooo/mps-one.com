import React, { useState, useEffect } from 'react';
import { useModule } from '../../hooks/useModule';
import { useI18n } from '../../hooks/useI18n';
import { canPerform } from '../../utils/permissions';
import { DataTable, Column } from '../../components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/card';
import { Badge } from '../../components/UI/badge';
import { Button } from '../../components/UI/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/UI/tabs';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Upload,
  Eye,
  Play,
  Calculator,
  AlertCircle,
  UserCheck,
  Building2
} from 'lucide-react';
import { supplierService, Supplier, SupplierOnboarding, SupplierKYC, SupplierCompliance, SupplierRiskScore, SupplierCorrectiveAction } from '../../services/supplierService';
import { useToast } from '../../hooks/useToast';

export default function SuppliersManager() {
  const { module } = useModule();
  const { t } = useI18n();
  const { push } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [onboardingSteps, setOnboardingSteps] = useState<SupplierOnboarding[]>([]);
  const [kycDocuments, setKycDocuments] = useState<SupplierKYC[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<SupplierCompliance[]>([]);
  const [riskScore, setRiskScore] = useState<SupplierRiskScore | null>(null);
  const [correctiveActions, setCorrectiveActions] = useState<SupplierCorrectiveAction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      loadSupplierDetails(selectedSupplier.id);
    }
  }, [selectedSupplier]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getSuppliers(1);
      setSuppliers(data);
    } catch (error) {
      push({ message: 'Failed to load suppliers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierDetails = async (supplierId: number) => {
    try {
      const [steps, kyc, compliance] = await Promise.all([
        supplierService.getOnboardingSteps(supplierId),
        supplierService.getKYCDocuments(supplierId),
        supplierService.getCorrectiveActions(supplierId)
      ]);
      
      setOnboardingSteps(steps);
      setKycDocuments(kyc);
      setCorrectiveActions(compliance);
      
      // Calculate risk score if not exists
      const supplier = suppliers.find(s => s.id === supplierId);
      if (supplier && supplier.risk_score === 0) {
        try {
          const score = await supplierService.calculateSupplierRisk(supplierId, 1);
          setRiskScore(score);
        } catch (error) {
          console.error('Failed to calculate risk score:', error);
        }
      }
    } catch (error) {
      push({ message: 'Failed to load supplier details', type: 'error' });
    }
  };

  const handleStartOnboarding = async (supplierId: number) => {
    try {
      const steps = await supplierService.startOnboarding(supplierId);
      setOnboardingSteps(steps);
      push({ message: 'Onboarding started successfully', type: 'success' });
    } catch (error) {
      push({ message: 'Failed to start onboarding', type: 'error' });
    }
  };

  const handleCompleteStep = async (step: SupplierOnboarding) => {
    try {
      const success = await supplierService.updateOnboardingStep(
        step.supplier_id,
        step.step,
        'completed',
        'Step completed by reviewer'
      );
      if (success) {
        const updatedSteps = await supplierService.getOnboardingSteps(step.supplier_id);
        setOnboardingSteps(updatedSteps);
        push({ message: 'Step completed successfully', type: 'success' });
      }
    } catch (error) {
      push({ message: 'Failed to complete step', type: 'error' });
    }
  };

  const handleRunComplianceCheck = async (supplierId: number, checkType: string) => {
    try {
      const check = await supplierService.runComplianceCheck(supplierId, checkType, 1);
      setComplianceChecks(prev => [...prev, check]);
      push({ message: 'Compliance check completed', type: 'success' });
    } catch (error) {
      push({ message: 'Failed to run compliance check', type: 'error' });
    }
  };

  const handleCalculateRisk = async (supplierId: number) => {
    try {
      const score = await supplierService.calculateSupplierRisk(supplierId, 1);
      setRiskScore(score);
      push({ message: 'Risk score calculated successfully', type: 'success' });
    } catch (error) {
      push({ message: 'Failed to calculate risk score', type: 'error' });
    }
  };

  const handleCreateCorrectiveAction = async (action: Partial<SupplierCorrectiveAction>) => {
    if (!selectedSupplier) return;
    
    try {
      const newAction = await supplierService.createCorrectiveAction({
        supplier_id: selectedSupplier.id,
        action_type: action.action_type || 'performance_improvement',
        description: action.description || '',
        due_date: action.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: action.assigned_to || 1
      });
      setCorrectiveActions(prev => [...prev, newAction]);
      push({ message: 'Corrective action created successfully', type: 'success' });
    } catch (error) {
      push({ message: 'Failed to create corrective action', type: 'error' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'success',
      pending_review: 'warning',
      rejected: 'destructive',
      suspended: 'destructive',
      draft: 'secondary',
      completed: 'success',
      in_progress: 'default',
      pending: 'warning',
      failed: 'destructive'
    } as Record<string, any>;
    return <Badge variant={variants[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
  };

  const getRiskBadge = (category: string) => {
    const variants = {
      low: 'success',
      medium: 'warning',
      high: 'destructive',
      critical: 'destructive'
    } as Record<string, any>;
    return <Badge variant={variants[category] || 'secondary'}>{category}</Badge>;
  };

  const supplierColumns: Column<Supplier>[] = [
    { key: 'supplier_code', header: 'Code' },
    { key: 'company_name', header: 'Company Name' },
    { key: 'contact_person', header: 'Contact' },
    { key: 'country', header: 'Country' },
    { key: 'status', header: 'Status', render: (_v, row) => getStatusBadge(row.status) },
    { key: 'onboarding_status', header: 'Onboarding', render: (_v, row) => getStatusBadge(row.onboarding_status) },
    { key: 'risk_category', header: 'Risk', render: (_v, row) => getRiskBadge(row.risk_category) },
    { key: 'id', header: 'Actions', render: (_v, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedSupplier(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.onboarding_status === 'not_started' && (
            <Button
              size="sm"
              onClick={() => handleStartOnboarding(row.id)}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) }
  ];

  const onboardingColumns: Column<SupplierOnboarding>[] = [
    { key: 'step', header: 'Step' },
    { key: 'status', header: 'Status', render: (_v, row) => getStatusBadge(row.status) },
    { key: 'completed_at', header: 'Completed', render: (_v, row) => row.completed_at ? new Date(row.completed_at).toLocaleDateString() : '-' },
    { key: 'id', header: 'Actions', render: (_v, row) => (
        <div className="flex gap-2">
          {row.status === 'in_progress' && canPerform(module, 'update_supplier') && (
            <Button
              size="sm"
              onClick={() => handleCompleteStep(row)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) }
  ];

  const kycColumns: Column<SupplierKYC>[] = [
    { key: 'document_type', header: 'Document Type' },
    { key: 'document_number', header: 'Number' },
    { key: 'verification_status', header: 'Status', render: (_v, row) => getStatusBadge(row.verification_status) },
    { key: 'expiry_date', header: 'Expiry', render: (_v, row) => row.expiry_date ? new Date(row.expiry_date).toLocaleDateString() : '-' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('suppliers_manager')}</h1>
        {canPerform(module, 'create_supplier') && (
          <Button>
            <Building2 className="mr-2 h-4 w-4" />
            {t('add_supplier')}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('suppliers_list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={supplierColumns} data={suppliers} />
        </CardContent>
      </Card>

      {selectedSupplier && (
        <Tabs defaultValue="onboarding" className="space-y-4">
          <TabsList>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="kyc">KYC Documents</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="actions">Corrective Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="onboarding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Onboarding Workflow</span>
                  <div className="flex gap-2">
                    {canPerform(module, 'run_compliance_checks') && (
                      <Button
                        size="sm"
                        onClick={() => handleRunComplianceCheck(selectedSupplier.id, 'sanctions')}
                      >
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Run Sanctions Check
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={onboardingColumns} data={onboardingSteps} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>KYC Documents</span>
                  {canPerform(module, 'upload_documents') && (
                    <Button size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={kycColumns} data={kycDocuments} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Compliance Checks</span>
                  <div className="flex gap-2">
                    {['sanctions', 'pep', 'adverse_media', 'credit_rating', 'environmental'].map(checkType => (
                      <Button
                        key={checkType}
                        size="sm"
                        variant="outline"
                        onClick={() => handleRunComplianceCheck(selectedSupplier.id, checkType)}
                      >
                        {checkType.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceChecks.map(check => (
                    <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{check.check_type.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-500">
                            Conducted on {new Date(check.conducted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(check.check_result)}
                        <Badge variant="outline">Risk: {check.risk_score}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Risk Assessment</span>
                  <Button
                    size="sm"
                    onClick={() => handleCalculateRisk(selectedSupplier.id)}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Risk
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Current Risk Score</p>
                      <p className="text-2xl font-bold">{selectedSupplier.risk_score}</p>
                    </div>
                    <div>
                      {getRiskBadge(selectedSupplier.risk_category)}
                    </div>
                  </div>
                  
                  {riskScore && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Risk Factors</h4>
                      {riskScore.factors.map(factor => (
                        <div key={factor.category} className="flex items-center justify-between">
                          <span className="text-sm">{factor.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{factor.score}</span>
                            <Badge variant="outline">{factor.weight * 100}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Corrective Actions</span>
                  <Button
                    size="sm"
                    onClick={() => handleCreateCorrectiveAction({})}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Create Action
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {correctiveActions.map(action => (
                    <div key={action.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{action.action_type.replace('_', ' ')}</h4>
                        {getStatusBadge(action.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Due: {new Date(action.due_date).toLocaleDateString()}</span>
                        <span>Assigned to: User {action.assigned_to}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
