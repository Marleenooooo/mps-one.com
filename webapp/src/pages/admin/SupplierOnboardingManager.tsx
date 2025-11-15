import React, { useEffect, useState } from 'react';
import { useModule } from '../../hooks/useModule';
import { useI18n } from '../../hooks/useI18n';
import { StatisticsCard } from '../../components/StatisticsCard';
import { DataTable, Column } from '../../components/DataTable';
import { Badge } from '../../components/UI/badge';
import { Button } from '../../components/UI/button';
import type { VendorTrustSignal } from '../../../../thebridge/contracts/trustGraph';

type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'in_review';
interface SupplierApplication {
  id: number;
  supplier_name: string;
  status: ApplicationStatus;
  submitted_at: string;
}

interface KYCDocument {
  id: number;
  supplier_id: number;
  document_type: string;
  document_number: string;
  verification_status: 'pending' | 'verified' | 'failed';
  expiry_date: string | null;
}

interface ComplianceCheck {
  id: number;
  supplier_id: number;
  check_type: string;
  status: 'pending' | 'passed' | 'failed';
  created_at: string;
}

export default function SupplierOnboardingManager() {
  useModule('procurement');
  const { t } = useI18n();
  const [applications, setApplications] = useState<SupplierApplication[]>([]);
  const [kycDocs, setKycDocs] = useState<KYCDocument[]>([]);
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [trust, setTrust] = useState<VendorTrustSignal[]>([]);

  useEffect(() => {
    // Minimal mock data to make the page functional
    setApplications([
      { id: 1, supplier_name: 'PT Nusantara Abadi', status: 'pending', submitted_at: new Date().toISOString() },
      { id: 2, supplier_name: 'CV Sumber Rejeki', status: 'approved', submitted_at: new Date(Date.now() - 86400000).toISOString() },
    ]);
    setKycDocs([
      { id: 11, supplier_id: 1, document_type: 'NPWP', document_number: '12.345.678.9-012.345', verification_status: 'pending', expiry_date: null },
      { id: 12, supplier_id: 2, document_type: 'SIUP', document_number: 'SIUP-998877', verification_status: 'verified', expiry_date: null },
    ]);
    setChecks([
      { id: 21, supplier_id: 1, check_type: 'Sanctions', status: 'pending', created_at: new Date().toISOString() },
      { id: 22, supplier_id: 2, check_type: 'Watchlist', status: 'passed', created_at: new Date().toISOString() },
    ]);
    setTrust([
      { vendorId: 'PT Nusantara Abadi', score: 82, badges: [{ key: 'kyc_verified', label: 'KYC' }] },
      { vendorId: 'CV Sumber Rejeki', score: 91, badges: [{ key: 'kyc_verified', label: 'KYC' }, { key: 'on_time', label: 'On‑time' }] },
    ]);
  }, []);

  const statusBadge = (s: string) => {
    const map: Record<string, 'secondary' | 'success' | 'danger' | 'warning' | 'info'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      in_review: 'info',
      verified: 'success',
      failed: 'danger',
      passed: 'success',
    };
    return <Badge variant={map[s] || 'secondary'}>{s.replace('_', ' ')}</Badge>;
  };

  const applicationCols: Column<SupplierApplication>[] = [
    { key: 'supplier_name', header: t('suppliers_manager') || 'Supplier' },
    { key: 'id' as keyof SupplierApplication, header: t('supplierOnboarding.risk_score') || 'Trust', render: (_v, row) => {
      const s = trust.find(x => x.vendorId === row.supplier_name)?.score ?? 0;
      const v = s >= 85 ? 'success' : s >= 70 ? 'info' : s >= 50 ? 'warning' : 'danger';
      return <Badge variant={v}>{s}</Badge>;
    } },
    { key: 'status', header: t('supplierOnboarding.status') || 'Status', render: (_v, row) => statusBadge(row.status) },
    { key: 'submitted_at', header: t('admin.realtime.timestamp') || 'Submitted', render: (v) => new Date(v).toLocaleString() },
    { key: 'id', header: t('common.actions') || 'Actions', render: (_v, row) => (
      <Button size="sm" variant="outline" onClick={() => alert(`Review application #${row.id}`)}>{t('supplierOnboarding.actions.review') || 'Review'}</Button>
    ) },
  ];

  const kycCols: Column<KYCDocument>[] = [
    { key: 'document_type', header: t('supplierOnboarding.kycDocuments') || 'Document' },
    { key: 'document_number', header: t('suppliers_manager') || 'Number' },
    { key: 'verification_status', header: t('supplierOnboarding.status') || 'Status', render: (_v, row) => statusBadge(row.verification_status) },
    { key: 'expiry_date', header: t('common.expiry') || 'Expiry', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  const checkCols: Column<ComplianceCheck>[] = [
    { key: 'check_type', header: t('supplierOnboarding.complianceChecks') || 'Check' },
    { key: 'status', header: t('supplierOnboarding.status') || 'Status', render: (_v, row) => statusBadge(row.status) },
    { key: 'created_at', header: t('admin.realtime.timestamp') || 'Created', render: (v) => new Date(v).toLocaleString() },
  ];

  return (
    <div className="main" role="main" aria-label={t('supplierOnboarding.title') || 'Supplier Onboarding'}>
      <div className="page-header procurement">
        <h1>{t('supplierOnboarding.title') || 'Supplier Onboarding'}</h1>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
        <StatisticsCard title={t('supplierOnboarding.applications') || 'Applications'} value={applications.length} />
        <StatisticsCard title={t('supplierOnboarding.kycDocuments') || 'KYC Documents'} value={kycDocs.length} />
        <StatisticsCard title={t('supplierOnboarding.complianceChecks') || 'Compliance Checks'} value={checks.length} />
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 className="section-title">{t('supplierOnboarding.applications') || 'Applications'}</h2>
        <DataTable data={applications} columns={applicationCols} />
      </div>
      <div style={{ marginTop: 24 }}>
        <h2 className="section-title">{t('supplierOnboarding.kycDocuments') || 'KYC Documents'}</h2>
        <DataTable data={kycDocs} columns={kycCols} />
      </div>
      <div style={{ marginTop: 24 }}>
        <h2 className="section-title">{t('supplierOnboarding.complianceChecks') || 'Compliance Checks'}</h2>
        <DataTable data={checks} columns={checkCols} />
      </div>
    </div>
  );
}
