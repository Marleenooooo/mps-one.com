// Mock data storage for suppliers
const SUPPLIERS_KEY = 'mock_suppliers';
const SUPPLIER_ONBOARDING_KEY = 'mock_supplier_onboarding';
const SUPPLIER_KYC_KEY = 'mock_supplier_kyc';
const SUPPLIER_COMPLIANCE_KEY = 'mock_supplier_compliance';
const SUPPLIER_CORRECTIVE_ACTIONS_KEY = 'mock_supplier_corrective_actions';

function getMockSuppliers(): any[] {
  try {
    const raw = localStorage.getItem(SUPPLIERS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  const seeded = seedSuppliers();
  try { localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(seeded)); } catch {}
  return seeded;
}

function setMockSuppliers(rows: any[]) {
  try { localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(rows)); } catch {}
}

function getMockSupplierOnboarding(): any[] {
  try {
    const raw = localStorage.getItem(SUPPLIER_ONBOARDING_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  try { localStorage.setItem(SUPPLIER_ONBOARDING_KEY, JSON.stringify([])); } catch {}
  return [];
}

function setMockSupplierOnboarding(rows: any[]) {
  try { localStorage.setItem(SUPPLIER_ONBOARDING_KEY, JSON.stringify(rows)); } catch {}
}

function getMockSupplierKYC(): any[] {
  try {
    const raw = localStorage.getItem(SUPPLIER_KYC_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  try { localStorage.setItem(SUPPLIER_KYC_KEY, JSON.stringify([])); } catch {}
  return [];
}

function setMockSupplierKYC(rows: any[]) {
  try { localStorage.setItem(SUPPLIER_KYC_KEY, JSON.stringify(rows)); } catch {}
}

function getMockSupplierCompliance(): any[] {
  try {
    const raw = localStorage.getItem(SUPPLIER_COMPLIANCE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  try { localStorage.setItem(SUPPLIER_COMPLIANCE_KEY, JSON.stringify([])); } catch {}
  return [];
}

function setMockSupplierCompliance(rows: any[]) {
  try { localStorage.setItem(SUPPLIER_COMPLIANCE_KEY, JSON.stringify(rows)); } catch {}
}

function getMockSupplierCorrectiveActions(): any[] {
  try {
    const raw = localStorage.getItem(SUPPLIER_CORRECTIVE_ACTIONS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  try { localStorage.setItem(SUPPLIER_CORRECTIVE_ACTIONS_KEY, JSON.stringify([])); } catch {}
  return [];
}

function setMockSupplierCorrectiveActions(rows: any[]) {
  try { localStorage.setItem(SUPPLIER_CORRECTIVE_ACTIONS_KEY, JSON.stringify(rows)); } catch {}
}

function seedSuppliers(): any[] {
  return [
    {
      id: 1,
      company_id: 1,
      supplier_code: 'SUP-001',
      company_name: 'PT. Teknik Utama',
      tax_id: '123456789',
      contact_person: 'Budi Santoso',
      email: 'budi@teknikutama.co.id',
      phone: '+62-21-555-1234',
      address: 'Jl. Sudirman No. 45, Jakarta',
      country: 'ID',
      status: 'approved',
      onboarding_status: 'completed',
      risk_score: 25,
      risk_category: 'low',
      created_at: '2025-01-15T08:00:00Z',
      updated_at: '2025-01-15T08:00:00Z'
    },
    {
      id: 2,
      company_id: 1,
      supplier_code: 'SUP-002',
      company_name: 'Global Mining Solutions',
      tax_id: '987654321',
      contact_person: 'John Smith',
      email: 'john@gms.com',
      phone: '+1-555-987-6543',
      address: '123 Mining Ave, Denver, CO',
      country: 'US',
      status: 'pending_review',
      onboarding_status: 'in_progress',
      risk_score: 45,
      risk_category: 'medium',
      created_at: '2025-01-20T10:30:00Z',
      updated_at: '2025-01-20T10:30:00Z'
    }
  ];
}

export interface Supplier {
  id: number;
  company_id: number;
  supplier_code: string;
  company_name: string;
  tax_id: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'suspended';
  onboarding_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  risk_score: number;
  risk_category: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface SupplierOnboarding {
  id: number;
  supplier_id: number;
  step: 'basic_info' | 'kyc_documents' | 'compliance_check' | 'risk_assessment' | 'final_approval';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  completed_at?: string | null;
  reviewed_by?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierKYC {
  id: number;
  supplier_id: number;
  document_type: 'business_license' | 'tax_certificate' | 'bank_statement' | 'identity_proof' | 'address_proof';
  document_number: string;
  document_url: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired';
  verified_by?: number | null;
  verified_at?: string | null;
  expiry_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierCompliance {
  id: number;
  supplier_id: number;
  check_type: 'sanctions' | 'pep' | 'adverse_media' | 'credit_rating' | 'environmental';
  check_result: 'pass' | 'fail' | 'review_required';
  risk_score: number;
  details?: any;
  conducted_at: string;
  conducted_by: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierRiskScore {
  id: number;
  supplier_id: number;
  total_score: number;
  financial_risk: number;
  compliance_risk: number;
  operational_risk: number;
  geographical_risk: number;
  calculated_at: string;
  calculated_by: number;
  factors: {
    category: string;
    score: number;
    weight: number;
    description: string;
  }[];
}

export interface SupplierCorrectiveAction {
  id: number;
  supplier_id: number;
  action_type: 'performance_improvement' | 'compliance_remediation' | 'risk_mitigation' | 'contract_review';
  description: string;
  due_date: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: number;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

class SupplierService {
  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private calculateRiskScore(supplier: Partial<Supplier>, compliance: SupplierCompliance[]): SupplierRiskScore {
    const financialRisk = Math.floor(Math.random() * 30) + 10;
    const complianceRisk = compliance.length > 0 
      ? compliance.reduce((sum, c) => sum + (c.check_result === 'fail' ? 25 : c.check_result === 'review_required' ? 15 : 5), 0) / compliance.length
      : 15;
    const operationalRisk = Math.floor(Math.random() * 25) + 10;
    const geographicalRisk = ['US', 'CA', 'GB', 'DE', 'AU'].includes(supplier.country || '') ? 10 : 25;
    
    const totalScore = Math.round(financialRisk + complianceRisk + operationalRisk + geographicalRisk);
    
    return {
      id: this.generateId(),
      supplier_id: supplier.id || 0,
      total_score: totalScore,
      financial_risk: financialRisk,
      compliance_risk: Math.round(complianceRisk),
      operational_risk: operationalRisk,
      geographical_risk: geographicalRisk,
      calculated_at: new Date().toISOString(),
      calculated_by: 1,
      factors: [
        { category: 'Financial', score: financialRisk, weight: 0.3, description: 'Financial stability assessment' },
        { category: 'Compliance', score: Math.round(complianceRisk), weight: 0.3, description: 'Regulatory compliance status' },
        { category: 'Operational', score: operationalRisk, weight: 0.25, description: 'Operational capability assessment' },
        { category: 'Geographical', score: geographicalRisk, weight: 0.15, description: 'Country risk assessment' }
      ]
    };
  }

  async getSuppliers(companyId: number): Promise<Supplier[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const suppliers = getMockSuppliers();
    return suppliers.filter(s => s.company_id === companyId);
  }

  async getSupplierById(id: number): Promise<Supplier | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const suppliers = getMockSuppliers();
    return suppliers.find(s => s.id === id) || null;
  }

  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'status' | 'onboarding_status' | 'risk_score' | 'risk_category'>): Promise<Supplier> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const suppliers = getMockSuppliers();
    const newSupplier: Supplier = {
      ...supplier,
      id: this.generateId(),
      status: 'draft',
      onboarding_status: 'not_started',
      risk_score: 0,
      risk_category: 'low',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    suppliers.push(newSupplier);
    setMockSuppliers(suppliers);
    return newSupplier;
  }

  async updateSupplier(id: number, updates: Partial<Supplier>): Promise<Supplier | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const suppliers = getMockSuppliers();
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    suppliers[index] = {
      ...suppliers[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    setMockSuppliers(suppliers);
    return suppliers[index];
  }

  async getOnboardingSteps(supplierId: number): Promise<SupplierOnboarding[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const onboarding = getMockSupplierOnboarding();
    return onboarding.filter(o => o.supplier_id === supplierId);
  }

  async startOnboarding(supplierId: number): Promise<SupplierOnboarding[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const onboarding = getMockSupplierOnboarding();
    const steps: Omit<SupplierOnboarding, 'id' | 'created_at' | 'updated_at'>[] = [
      { supplier_id: supplierId, step: 'basic_info', status: 'in_progress' },
      { supplier_id: supplierId, step: 'kyc_documents', status: 'pending' },
      { supplier_id: supplierId, step: 'compliance_check', status: 'pending' },
      { supplier_id: supplierId, step: 'risk_assessment', status: 'pending' },
      { supplier_id: supplierId, step: 'final_approval', status: 'pending' }
    ];
    
    const newSteps = steps.map(step => ({
      ...step,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    onboarding.push(...newSteps);
    setMockSupplierOnboarding(onboarding);
    
    // Update supplier onboarding status
    const suppliers = getMockSuppliers();
    const supplierIndex = suppliers.findIndex(s => s.id === supplierId);
    if (supplierIndex !== -1) {
      suppliers[supplierIndex].onboarding_status = 'in_progress';
      suppliers[supplierIndex].updated_at = new Date().toISOString();
      setMockSuppliers(suppliers);
    }
    
    return newSteps;
  }

  async updateOnboardingStep(supplierId: number, step: string, status: string, notes?: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const onboarding = getMockSupplierOnboarding();
    const onboardingStep = onboarding.find(
      o => o.supplier_id === supplierId && o.step === step
    );
    
    if (!onboardingStep) return false;
    
    onboardingStep.status = status as any;
    onboardingStep.notes = notes;
    onboardingStep.updated_at = new Date().toISOString();
    
    if (status === 'completed') {
      onboardingStep.completed_at = new Date().toISOString();
      
      // Move to next step
      const steps = ['basic_info', 'kyc_documents', 'compliance_check', 'risk_assessment', 'final_approval'];
      const currentIndex = steps.indexOf(step);
      if (currentIndex < steps.length - 1) {
        const nextStep = onboarding.find(
          o => o.supplier_id === supplierId && o.step === steps[currentIndex + 1]
        );
        if (nextStep) {
          nextStep.status = 'in_progress';
          nextStep.updated_at = new Date().toISOString();
        }
      }
      
      // If all steps completed, update supplier status
      if (step === 'final_approval' && status === 'completed') {
        const suppliers = getMockSuppliers();
        const supplierIndex = suppliers.findIndex(s => s.id === supplierId);
        if (supplierIndex !== -1) {
          suppliers[supplierIndex].onboarding_status = 'completed';
          suppliers[supplierIndex].status = 'approved';
          suppliers[supplierIndex].updated_at = new Date().toISOString();
          setMockSuppliers(suppliers);
        }
      }
    }
    
    setMockSupplierOnboarding(onboarding);
    return true;
  }

  async getKYCDocuments(supplierId: number): Promise<SupplierKYC[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const kyc = getMockSupplierKYC();
    return kyc.filter(k => k.supplier_id === supplierId);
  }

  async uploadKYCDocument(document: Omit<SupplierKYC, 'id' | 'created_at' | 'updated_at' | 'verification_status'>): Promise<SupplierKYC> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const kyc = getMockSupplierKYC();
    const newDocument: SupplierKYC = {
      ...document,
      id: this.generateId(),
      verification_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    kyc.push(newDocument);
    setMockSupplierKYC(kyc);
    return newDocument;
  }

  async verifyKYCDocument(id: number, status: string, verifiedBy: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const kyc = getMockSupplierKYC();
    const document = kyc.find(d => d.id === id);
    if (!document) return false;
    
    document.verification_status = status as any;
    document.verified_by = verifiedBy;
    document.verified_at = new Date().toISOString();
    document.updated_at = new Date().toISOString();
    
    setMockSupplierKYC(kyc);
    return true;
  }

  async runComplianceCheck(supplierId: number, checkType: string, conductedBy: number): Promise<SupplierCompliance> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const compliance = getMockSupplierCompliance();
    const results = ['pass', 'fail', 'review_required'];
    const result = results[Math.floor(Math.random() * results.length)];
    
    const newCompliance: SupplierCompliance = {
      id: this.generateId(),
      supplier_id: supplierId,
      check_type: checkType as any,
      check_result: result as any,
      risk_score: result === 'fail' ? 80 : result === 'review_required' ? 50 : 20,
      details: { automated_check: true, source: 'external_api' },
      conducted_at: new Date().toISOString(),
      conducted_by: conductedBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    compliance.push(newCompliance);
    setMockSupplierCompliance(compliance);
    return newCompliance;
  }

  async calculateSupplierRisk(supplierId: number, calculatedBy: number): Promise<SupplierRiskScore> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const suppliers = getMockSuppliers();
    const compliance = getMockSupplierCompliance();
    const supplier = suppliers.find(s => s.id === supplierId);
    const supplierCompliance = compliance.filter(c => c.supplier_id === supplierId);
    
    if (!supplier) throw new Error('Supplier not found');
    
    const riskScore = this.calculateRiskScore(supplier, supplierCompliance);
    riskScore.calculated_by = calculatedBy;
    
    // Update supplier risk information
    const supplierIndex = suppliers.findIndex(s => s.id === supplierId);
    if (supplierIndex !== -1) {
      suppliers[supplierIndex].risk_score = riskScore.total_score;
      suppliers[supplierIndex].risk_category = riskScore.total_score >= 70 ? 'critical' : 
                                                riskScore.total_score >= 50 ? 'high' : 
                                                riskScore.total_score >= 30 ? 'medium' : 'low';
      suppliers[supplierIndex].updated_at = new Date().toISOString();
      setMockSuppliers(suppliers);
    }
    
    return riskScore;
  }

  async createCorrectiveAction(action: Omit<SupplierCorrectiveAction, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<SupplierCorrectiveAction> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const actions = getMockSupplierCorrectiveActions();
    const newAction: SupplierCorrectiveAction = {
      ...action,
      id: this.generateId(),
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    actions.push(newAction);
    setMockSupplierCorrectiveActions(actions);
    return newAction;
  }

  async getCorrectiveActions(supplierId: number): Promise<SupplierCorrectiveAction[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const actions = getMockSupplierCorrectiveActions();
    return actions.filter(a => a.supplier_id === supplierId);
  }
}

export const supplierService = new SupplierService();