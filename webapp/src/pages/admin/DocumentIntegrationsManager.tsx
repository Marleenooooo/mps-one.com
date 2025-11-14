import React, { useState, useEffect } from 'react';
import { useModule } from '../../hooks/useModule';
import { useI18n } from '../../hooks/useI18n';
import { canPerform } from '../../utils/permissions';
import { DataTable } from '../../components/DataTable';
import { StatisticsCard } from '../../components/StatisticsCard';
import { Modal } from '../../components/Modal';
import { Form } from '../../components/Form';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Alert } from '../../components/Alert';
import { 
  documentIntegrationService, 
  DocumentIntegration, 
  DocumentSyncJob, 
  DocumentVersion, 
  DocumentOCRResult 
} from '../../services/documentIntegrationService';

export default function DocumentIntegrationsManager() {
  const { t } = useI18n();
  const { module } = useModule('document_integrations');
  
  const [integrations, setIntegrations] = useState<DocumentIntegration[]>([]);
  const [syncJobs, setSyncJobs] = useState<DocumentSyncJob[]>([]);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [ocrResults, setOCRResults] = useState<DocumentOCRResult[]>([]);
  const [activeTab, setActiveTab] = useState<'integrations' | 'sync_jobs' | 'versions' | 'ocr'>('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<DocumentIntegration | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showSyncJobModal, setShowSyncJobModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [integrationForm, setIntegrationForm] = useState({
    name: '',
    type: 'sharepoint' as DocumentIntegration['type'],
    description: '',
    connection_config: '',
    sync_config: '',
    sync_direction: 'bidirectional' as DocumentIntegration['sync_config']['sync_direction'],
    sync_frequency: 'daily' as DocumentIntegration['sync_config']['sync_frequency'],
    conflict_resolution: 'newest_wins' as DocumentIntegration['sync_config']['conflict_resolution']
  });

  const [syncJobForm, setSyncJobForm] = useState({
    job_type: 'incremental_sync' as DocumentSyncJob['job_type'],
    direction: 'bidirectional' as DocumentSyncJob['direction'],
    folder_mapping_index: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedIntegration) {
      loadIntegrationDetails();
    }
  }, [selectedIntegration, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentIntegrationService.getIntegrations(1);
      setIntegrations(data);
      
      if (data.length > 0 && !selectedIntegration) {
        setSelectedIntegration(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrationDetails = async () => {
    if (!selectedIntegration) return;

    try {
      switch (activeTab) {
        case 'sync_jobs':
          const jobData = await documentIntegrationService.getSyncJobs(selectedIntegration.id);
          setSyncJobs(jobData);
          break;
        case 'versions':
          const versionData = await documentIntegrationService.getDocumentVersions(selectedIntegration.id);
          setDocumentVersions(versionData);
          break;
        case 'ocr':
          const ocrData = await documentIntegrationService.getOCRResults(selectedIntegration.id);
          setOCRResults(ocrData);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integration details');
    }
  };

  const handleCreateIntegration = async () => {
    try {
      let connectionConfig = {};
      let syncConfig = {};
      
      try {
        connectionConfig = JSON.parse(integrationForm.connection_config || '{}');
      } catch {
        connectionConfig = {};
      }

      try {
        syncConfig = JSON.parse(integrationForm.sync_config || '{}');
      } catch {
        syncConfig = {
          sync_direction: integrationForm.sync_direction,
          sync_frequency: integrationForm.sync_frequency,
          folder_mappings: [],
          conflict_resolution: integrationForm.conflict_resolution
        };
      }

      const newIntegration = await documentIntegrationService.createIntegration({
        company_id: 1,
        name: integrationForm.name,
        type: integrationForm.type,
        description: integrationForm.description,
        connection_config: connectionConfig,
        sync_config: {
          sync_direction: integrationForm.sync_direction,
          sync_frequency: integrationForm.sync_frequency,
          folder_mappings: [],
          conflict_resolution: integrationForm.conflict_resolution
        },
        is_active: true
      });

      setIntegrations(prev => [...prev, newIntegration]);
      setShowIntegrationModal(false);
      resetIntegrationForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create integration');
    }
  };

  const handleTestConnection = async (integrationId: number) => {
    try {
      const success = await documentIntegrationService.testConnection(integrationId);
      if (success) {
        const updated = await documentIntegrationService.getIntegration(integrationId);
        if (updated) {
          setIntegrations(prev => prev.map(i => i.id === integrationId ? updated : i));
          if (selectedIntegration?.id === integrationId) {
            setSelectedIntegration(updated);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed');
    }
  };

  const handleCreateSyncJob = async () => {
    if (!selectedIntegration) return;

    try {
      const newJob = await documentIntegrationService.createSyncJob({
        integration_id: selectedIntegration.id,
        job_type: syncJobForm.job_type,
        direction: syncJobForm.direction,
        folder_mapping_index: syncJobForm.folder_mapping_index
      });

      setSyncJobs(prev => [...prev, newJob]);
      setShowSyncJobModal(false);
      resetSyncJobForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sync job');
    }
  };

  const handleExecuteSyncJob = async (jobId: number) => {
    try {
      await documentIntegrationService.executeSyncJob(jobId);
      await loadIntegrationDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute sync job');
    }
  };

  const handleProcessOCR = async (documentId: number, ocrProvider: DocumentOCRResult['ocr_provider']) => {
    if (!selectedIntegration) return;

    try {
      await documentIntegrationService.processOCR(documentId, selectedIntegration.id, ocrProvider);
      await loadIntegrationDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process OCR');
    }
  };

  const resetIntegrationForm = () => {
    setIntegrationForm({
      name: '',
      type: 'sharepoint',
      description: '',
      connection_config: '',
      sync_config: '',
      sync_direction: 'bidirectional',
      sync_frequency: 'daily',
      conflict_resolution: 'newest_wins'
    });
  };

  const resetSyncJobForm = () => {
    setSyncJobForm({
      job_type: 'incremental_sync',
      direction: 'bidirectional',
      folder_mapping_index: 0
    });
  };

  const getStatusBadge = (status: DocumentIntegration['status']) => {
    const variants: Record<DocumentIntegration['status'], 'success' | 'secondary' | 'danger' | 'warning'> = {
      connected: 'success',
      disconnected: 'secondary',
      error: 'danger',
      syncing: 'warning'
    };
    return <Badge variant={variants[status]}>{t(`document_integrations.status.${status}`)}</Badge>;
  };

  const getSyncStatusBadge = (status: DocumentSyncJob['status']) => {
    const variants: Record<DocumentSyncJob['status'], 'warning' | 'primary' | 'success' | 'danger' | 'secondary'> = {
      pending: 'warning',
      running: 'primary',
      completed: 'success',
      failed: 'danger',
      cancelled: 'secondary'
    };
    return <Badge variant={variants[status]}>{t(`document_integrations.sync_status.${status}`)}</Badge>;
  };

  const getOCRStatusBadge = (status: DocumentOCRResult['status']) => {
    const variants: Record<DocumentOCRResult['status'], 'warning' | 'primary' | 'success' | 'danger'> = {
      pending: 'warning',
      processing: 'primary',
      completed: 'success',
      failed: 'danger'
    };
    return <Badge variant={variants[status]}>{t(`document_integrations.ocr_status.${status}`)}</Badge>;
  };

  const getSyncStatusBadgeV = (status: DocumentVersion['sync_status']) => {
    const variants: Record<DocumentVersion['sync_status'], 'success' | 'warning' | 'danger'> = {
      synced: 'success',
      pending: 'warning',
      conflict: 'danger',
      error: 'danger'
    };
    return <Badge variant={variants[status]}>{t(`document_integrations.version_status.${status}`)}</Badge>;
  };

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    active: integrations.filter(i => i.is_active).length,
    withErrors: integrations.filter(i => i.last_error).length,
    totalFiles: integrations.reduce((sum, i) => sum + i.sync_stats.total_files_synced, 0),
    failedFiles: integrations.reduce((sum, i) => sum + i.sync_stats.total_files_failed, 0),
    storageUsed: integrations.reduce((sum, i) => sum + i.sync_stats.storage_used, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('document_integrations.title')}</h1>
        {canPerform(module, 'create') && (
          <Button
            onClick={() => setShowIntegrationModal(true)}
            variant="primary"
          >
            {t('document_integrations.add_integration')}
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatisticsCard
          title={t('document_integrations.stats.total_integrations')}
          value={stats.total}
          icon="Cloud"
        />
        <StatisticsCard
          title={t('document_integrations.stats.connected')}
          value={stats.connected}
          icon="CheckCircle"
          variant="success"
        />
        <StatisticsCard
          title={t('document_integrations.stats.total_files')}
          value={stats.totalFiles.toLocaleString()}
          icon="File"
          variant="info"
        />
        <StatisticsCard
          title={t('document_integrations.stats.storage_used')}
          value={`${(stats.storageUsed / 1024 / 1024 / 1024).toFixed(1)} GB`}
          icon="Database"
          variant="warning"
        />
      </div>

      {/* Integration Selection */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{t('document_integrations.select_integration')}</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map(integration => (
              <div
                key={integration.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedIntegration?.id === integration.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedIntegration(integration)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{integration.name}</h4>
                  {getStatusBadge(integration.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{integration.type.replace('_', ' ').toUpperCase()}</p>
                <p className="text-xs text-gray-500">{integration.description}</p>
                <div className="mt-2 text-xs text-gray-400">
                  {t('document_integrations.files_synced')}: {integration.sync_stats.total_files_synced}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedIntegration && (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'integrations', label: t('document_integrations.tabs.integrations') },
                { key: 'sync_jobs', label: t('document_integrations.tabs.sync_jobs') },
                { key: 'versions', label: t('document_integrations.tabs.versions') },
                { key: 'ocr', label: t('document_integrations.tabs.ocr') }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'integrations' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{selectedIntegration.name}</h3>
                  <div className="space-x-2">
                    <Button
                      onClick={() => handleTestConnection(selectedIntegration.id)}
                      variant="outline"
                      size="sm"
                    >
                      {t('document_integrations.test_connection')}
                    </Button>
                    {canPerform(module, 'create') && (
                      <Button
                        onClick={() => setShowSyncJobModal(true)}
                        variant="primary"
                        size="sm"
                      >
                        {t('document_integrations.add_sync_job')}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('document_integrations.type')}</label>
                      <p className="text-sm text-gray-900">{selectedIntegration.type.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('document_integrations.sync_frequency')}</label>
                      <p className="text-sm text-gray-900">{t(`document_integrations.frequency.${selectedIntegration.sync_config.sync_frequency}`)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('document_integrations.sync_direction')}</label>
                      <p className="text-sm text-gray-900">{t(`document_integrations.direction.${selectedIntegration.sync_config.sync_direction}`)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('document_integrations.last_sync')}</label>
                      <p className="text-sm text-gray-900">
                        {selectedIntegration.last_sync_at
                          ? new Date(selectedIntegration.last_sync_at).toLocaleString()
                          : t('common.never')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('document_integrations.folder_mappings')}</label>
                      <p className="text-sm text-gray-900">{selectedIntegration.sync_config.folder_mappings.length} mappings</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('document_integrations.conflict_resolution')}</label>
                      <p className="text-sm text-gray-900">{selectedIntegration.sync_config.conflict_resolution}</p>
                    </div>
                  </div>
                  
                  {/* Folder Mappings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('document_integrations.folder_mappings')}</label>
                    <div className="space-y-2">
                      {selectedIntegration.sync_config.folder_mappings.map((mapping, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{mapping.local_folder}</p>
                              <p className="text-xs text-gray-600">→ {mapping.remote_folder}</p>
                              <p className="text-xs text-gray-500">
                                {mapping.document_types.join(', ')} | {mapping.sync_filters.file_extensions?.join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sync_jobs' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{t('document_integrations.sync_jobs')}</h3>
                  {canPerform(module, 'create') && (
                    <Button
                      onClick={() => setShowSyncJobModal(true)}
                      variant="primary"
                      size="sm"
                    >
                      {t('document_integrations.add_sync_job')}
                    </Button>
                  )}
                </div>
                <DataTable
                  data={syncJobs}
                  columns={[
                    { key: 'job_type', header: t('document_integrations.job_type') },
                    { key: 'direction', header: t('document_integrations.direction') },
                    {
                      key: 'status',
                      header: t('document_integrations.status'),
                      render: (job: DocumentSyncJob) => getSyncStatusBadge(job.status)
                    },
                    {
                      key: 'processed_files',
                      header: t('document_integrations.progress'),
                      render: (job: DocumentSyncJob) => {
                        const progress = job.total_files > 0 ? Math.round((job.processed_files / job.total_files) * 100) : 0;
                        return (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{progress}%</span>
                          </div>
                        );
                      }
                    },
                    {
                      key: 'processed_files',
                      header: t('document_integrations.files'),
                      render: (job: DocumentSyncJob) => `${job.processed_files}/${job.total_files}`
                    },
                    {
                      key: 'started_at',
                      header: t('document_integrations.started_at'),
                      render: (job: DocumentSyncJob) =>
                        job.started_at ? new Date(job.started_at).toLocaleString() : '-'
                    },
                    {
                      key: 'id',
                      header: t('common.actions'),
                      render: (job: DocumentSyncJob) => (
                        <div className="flex space-x-2">
                          {job.status === 'pending' && (
                            <Button
                              onClick={() => handleExecuteSyncJob(job.id)}
                              variant="outline"
                              size="sm"
                            >
                              {t('document_integrations.execute')}
                            </Button>
                          )}
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            )}

            {activeTab === 'versions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{t('document_integrations.document_versions')}</h3>
                <DataTable
                  data={documentVersions}
                  columns={[
                    { key: 'file_name', header: t('document_integrations.file_name') },
                    { key: 'file_size', header: t('document_integrations.file_size') },
                    { key: 'mime_type', header: t('document_integrations.mime_type') },
                    {
                      key: 'sync_status',
                      header: t('document_integrations.sync_status'),
                      render: (version: DocumentVersion) => getSyncStatusBadgeV(version.sync_status)
                    },
                    {
                      key: 'local_version',
                      header: t('document_integrations.versions'),
                      render: (version: DocumentVersion) => `Local: ${version.local_version} | Remote: ${version.remote_version}`
                    },
                    {
                      key: 'last_modified_at',
                      header: t('document_integrations.last_modified'),
                      render: (version: DocumentVersion) =>
                        new Date(version.last_modified_at).toLocaleString()
                    }
                  ]}
                />
              </div>
            )}

            {activeTab === 'ocr' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{t('document_integrations.ocr_results')}</h3>
                <DataTable
                  data={ocrResults}
                  columns={[
                    { key: 'document_id', header: t('document_integrations.document_id') },
                    { key: 'ocr_provider', header: t('document_integrations.ocr_provider') },
                    {
                      key: 'status',
                      header: t('document_integrations.status'),
                      render: (result: DocumentOCRResult) => getOCRStatusBadge(result.status)
                    },
                    {
                      key: 'confidence_score',
                      header: t('document_integrations.confidence'),
                      render: (result: DocumentOCRResult) =>
                        result.confidence_score ? `${Math.round(result.confidence_score * 100)}%` : '-'
                    },
                    {
                      key: 'processing_time',
                      header: t('document_integrations.processing_time'),
                      render: (result: DocumentOCRResult) =>
                        result.processing_time ? `${result.processing_time}ms` : '-'
                    },
                    {
                      key: 'id',
                      header: t('common.actions'),
                      render: (result: DocumentOCRResult) => (
                        <div className="flex space-x-2">
                          {result.status === 'completed' && result.extracted_data && (
                            <Button
                              onClick={() => alert(JSON.stringify(result.extracted_data, null, 2))}
                              variant="outline"
                              size="sm"
                            >
                              {t('document_integrations.view_data')}
                            </Button>
                          )}
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Integration Modal */}
      <Modal
        isOpen={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
        title={t('document_integrations.add_integration')}
      >
        <Form
          onSubmit={handleCreateIntegration}
          className="space-y-4"
        >
          <Form.Input
            label={t('document_integrations.name')}
            value={integrationForm.name}
            onChange={(e) => setIntegrationForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Form.Select
            label={t('document_integrations.type')}
            value={integrationForm.type}
            onChange={(e) => setIntegrationForm(prev => ({ ...prev, type: e.target.value as any }))}
            options={[
              { value: 'sharepoint', label: 'Microsoft SharePoint' },
              { value: 'google_drive', label: 'Google Drive' },
              { value: 'dropbox', label: 'Dropbox' },
              { value: 'box', label: 'Box' },
              { value: 'onedrive', label: 'OneDrive' },
              { value: 's3', label: 'Amazon S3' },
              { value: 'custom', label: 'Custom' }
            ]}
            required
          />
          <Form.Textarea
            label={t('document_integrations.description')}
            value={integrationForm.description}
            onChange={(e) => setIntegrationForm(prev => ({ ...prev, description: e.target.value }))}
          />
          <Form.Textarea
            label={t('document_integrations.connection_config')}
            value={integrationForm.connection_config}
            onChange={(e) => setIntegrationForm(prev => ({ ...prev, connection_config: e.target.value }))}
            placeholder='{"client_id": "your_client_id", "client_secret": "your_secret"}'
            rows={3}
          />
          <Form.Textarea
            label={t('document_integrations.sync_config')}
            value={integrationForm.sync_config}
            onChange={(e) => setIntegrationForm(prev => ({ ...prev, sync_config: e.target.value }))}
            placeholder='{"folder_mappings": [{"local_folder": "docs", "remote_folder": "/Documents"}]}'
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <Form.Select
              label={t('document_integrations.sync_direction')}
              value={integrationForm.sync_direction}
              onChange={(e) => setIntegrationForm(prev => ({ ...prev, sync_direction: e.target.value as any }))}
              options={[
                { value: 'inbound', label: 'Inbound' },
                { value: 'outbound', label: 'Outbound' },
                { value: 'bidirectional', label: 'Bidirectional' }
              ]}
              required
            />
            <Form.Select
              label={t('document_integrations.sync_frequency')}
              value={integrationForm.sync_frequency}
              onChange={(e) => setIntegrationForm(prev => ({ ...prev, sync_frequency: e.target.value as any }))}
              options={[
                { value: 'manual', label: 'Manual' },
                { value: 'hourly', label: 'Hourly' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' }
              ]}
              required
            />
          </div>
          <Form.Select
            label={t('document_integrations.conflict_resolution')}
            value={integrationForm.conflict_resolution}
            onChange={(e) => setIntegrationForm(prev => ({ ...prev, conflict_resolution: e.target.value as any }))}
            options={[
              { value: 'local_wins', label: 'Local Wins' },
              { value: 'remote_wins', label: 'Remote Wins' },
              { value: 'newest_wins', label: 'Newest Wins' },
              { value: 'manual', label: 'Manual' }
            ]}
            required
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowIntegrationModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {t('common.create')}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Sync Job Modal */}
      <Modal
        isOpen={showSyncJobModal}
        onClose={() => setShowSyncJobModal(false)}
        title={t('document_integrations.add_sync_job')}
      >
        <Form
          onSubmit={handleCreateSyncJob}
          className="space-y-4"
        >
          <Form.Select
            label={t('document_integrations.job_type')}
            value={syncJobForm.job_type}
            onChange={(e) => setSyncJobForm(prev => ({ ...prev, job_type: e.target.value as any }))}
            options={[
              { value: 'full_sync', label: 'Full Sync' },
              { value: 'incremental_sync', label: 'Incremental Sync' },
              { value: 'folder_sync', label: 'Folder Sync' },
              { value: 'file_sync', label: 'File Sync' }
            ]}
            required
          />
          <Form.Select
            label={t('document_integrations.direction')}
            value={syncJobForm.direction}
            onChange={(e) => setSyncJobForm(prev => ({ ...prev, direction: e.target.value as any }))}
            options={[
              { value: 'upload', label: 'Upload' },
              { value: 'download', label: 'Download' },
              { value: 'bidirectional', label: 'Bidirectional' }
            ]}
            required
          />
          <Form.Input
            label={t('document_integrations.folder_mapping_index')}
            type="number"
            value={syncJobForm.folder_mapping_index}
            onChange={(e) => setSyncJobForm(prev => ({ ...prev, folder_mapping_index: parseInt(e.target.value) }))}
            min="0"
            required
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSyncJobModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {t('common.create')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
