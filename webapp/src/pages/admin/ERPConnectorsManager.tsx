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
import { erpConnectorService, ERPConnector, ERPWebhook, ERPSyncJob, ERPLog } from '../../services/erpConnectorService';

export default function ERPConnectorsManager() {
  const { t } = useI18n();
  const { module } = useModule('erp_connectors');
  
  const [connectors, setConnectors] = useState<ERPConnector[]>([]);
  const [webhooks, setWebhooks] = useState<ERPWebhook[]>([]);
  const [syncJobs, setSyncJobs] = useState<ERPSyncJob[]>([]);
  const [logs, setLogs] = useState<ERPLog[]>([]);
  const [activeTab, setActiveTab] = useState<'connectors' | 'webhooks' | 'sync_jobs' | 'logs'>('connectors');
  const [selectedConnector, setSelectedConnector] = useState<ERPConnector | null>(null);
  const [showConnectorModal, setShowConnectorModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showSyncJobModal, setShowSyncJobModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [connectorForm, setConnectorForm] = useState({
    name: '',
    type: 'sap' as ERPConnector['type'],
    description: '',
    base_url: '',
    api_version: '',
    auth_type: 'oauth2' as ERPConnector['auth_type'],
    auth_config: '',
    sync_frequency: 'daily' as ERPConnector['sync_frequency'],
    sync_direction: 'bidirectional' as ERPConnector['sync_direction'],
    enabled_modules: [] as string[]
  });

  const [webhookForm, setWebhookForm] = useState({
    name: '',
    event_type: '',
    endpoint_url: '',
    http_method: 'POST' as ERPWebhook['http_method'],
    headers: '',
    payload_template: '',
    retry_config: {
      max_retries: 3,
      retry_delay: 60,
      backoff_strategy: 'exponential' as const
    }
  });

  const [syncJobForm, setSyncJobForm] = useState({
    job_type: 'incremental_sync' as ERPSyncJob['job_type'],
    entity_type: 'vendors' as ERPSyncJob['entity_type']
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedConnector) {
      loadConnectorDetails();
    }
  }, [selectedConnector, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await erpConnectorService.getConnectors(1);
      setConnectors(data);
      
      if (data.length > 0 && !selectedConnector) {
        setSelectedConnector(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connectors');
    } finally {
      setLoading(false);
    }
  };

  const loadConnectorDetails = async () => {
    if (!selectedConnector) return;

    try {
      switch (activeTab) {
        case 'webhooks':
          const webhookData = await erpConnectorService.getWebhooks(selectedConnector.id);
          setWebhooks(webhookData);
          break;
        case 'sync_jobs':
          const jobData = await erpConnectorService.getSyncJobs(selectedConnector.id);
          setSyncJobs(jobData);
          break;
        case 'logs':
          const logData = await erpConnectorService.getLogs(selectedConnector.id, 50);
          setLogs(logData);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connector details');
    }
  };

  const handleCreateConnector = async () => {
    try {
      let authConfig = {};
      try {
        authConfig = JSON.parse(connectorForm.auth_config || '{}');
      } catch {
        authConfig = {};
      }

      const newConnector = await erpConnectorService.createConnector({
        company_id: 1,
        name: connectorForm.name,
        type: connectorForm.type,
        description: connectorForm.description,
        base_url: connectorForm.base_url,
        api_version: connectorForm.api_version,
        auth_type: connectorForm.auth_type,
        auth_config: authConfig,
        sync_frequency: connectorForm.sync_frequency,
        sync_direction: connectorForm.sync_direction,
        enabled_modules: connectorForm.enabled_modules,
        mapping_config: {},
        is_active: true
      });

      setConnectors(prev => [...prev, newConnector]);
      setShowConnectorModal(false);
      resetConnectorForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connector');
    }
  };

  const handleTestConnection = async (connectorId: number) => {
    try {
      const success = await erpConnectorService.testConnection(connectorId);
      if (success) {
        const updated = await erpConnectorService.getConnector(connectorId);
        if (updated) {
          setConnectors(prev => prev.map(c => c.id === connectorId ? updated : c));
          if (selectedConnector?.id === connectorId) {
            setSelectedConnector(updated);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed');
    }
  };

  const handleCreateWebhook = async () => {
    if (!selectedConnector) return;

    try {
      let headers = {};
      try {
        headers = JSON.parse(webhookForm.headers || '{}');
      } catch {
        headers = {};
      }

      const newWebhook = await erpConnectorService.createWebhook({
        connector_id: selectedConnector.id,
        name: webhookForm.name,
        event_type: webhookForm.event_type,
        endpoint_url: webhookForm.endpoint_url,
        http_method: webhookForm.http_method,
        headers,
        payload_template: webhookForm.payload_template || null,
        retry_config: webhookForm.retry_config,
        is_active: true
      });

      setWebhooks(prev => [...prev, newWebhook]);
      setShowWebhookModal(false);
      resetWebhookForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create webhook');
    }
  };

  const handleCreateSyncJob = async () => {
    if (!selectedConnector) return;

    try {
      const newJob = await erpConnectorService.createSyncJob({
        connector_id: selectedConnector.id,
        job_type: syncJobForm.job_type,
        entity_type: syncJobForm.entity_type
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
      await erpConnectorService.executeSyncJob(jobId);
      await loadConnectorDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute sync job');
    }
  };

  const resetConnectorForm = () => {
    setConnectorForm({
      name: '',
      type: 'sap',
      description: '',
      base_url: '',
      api_version: '',
      auth_type: 'oauth2',
      auth_config: '',
      sync_frequency: 'daily',
      sync_direction: 'bidirectional',
      enabled_modules: []
    });
  };

  const resetWebhookForm = () => {
    setWebhookForm({
      name: '',
      event_type: '',
      endpoint_url: '',
      http_method: 'POST',
      headers: '',
      payload_template: '',
      retry_config: {
        max_retries: 3,
        retry_delay: 60,
        backoff_strategy: 'exponential'
      }
    });
  };

  const resetSyncJobForm = () => {
    setSyncJobForm({
      job_type: 'incremental_sync',
      entity_type: 'vendors'
    });
  };

  const getConnectionStatusBadge = (status: ERPConnector['connection_status']) => {
    const variants: Record<ERPConnector['connection_status'], 'success' | 'secondary' | 'danger' | 'warning'> = {
      connected: 'success',
      disconnected: 'secondary',
      error: 'danger',
      testing: 'warning'
    };
    return <Badge variant={variants[status]}>{t(`erp_connectors.status.${status}`)}</Badge>;
  };

  const getSyncStatusBadge = (status: ERPSyncJob['status']) => {
    const variants: Record<ERPSyncJob['status'], 'warning' | 'primary' | 'success' | 'danger' | 'secondary'> = {
      pending: 'warning',
      running: 'primary',
      completed: 'success',
      failed: 'danger',
      cancelled: 'secondary'
    };
    return <Badge variant={variants[status]}>{t(`erp_connectors.sync_status.${status}`)}</Badge>;
  };

  const getLogTypeBadge = (type: ERPLog['log_type']) => {
    const variants: Record<ERPLog['log_type'], 'info' | 'warning' | 'danger' | 'secondary'> = {
      info: 'info',
      warning: 'warning',
      error: 'danger',
      debug: 'secondary'
    };
    return <Badge variant={variants[type]}>{t(`erp_connectors.log_type.${type}`)}</Badge>;
  };

  const stats = {
    total: connectors.length,
    connected: connectors.filter(c => c.connection_status === 'connected').length,
    active: connectors.filter(c => c.is_active).length,
    withErrors: connectors.filter(c => c.error_count > 0).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('erp_connectors.title')}</h1>
        {canPerform(module, 'create') && (
          <Button
            onClick={() => setShowConnectorModal(true)}
            variant="primary"
          >
            {t('erp_connectors.add_connector')}
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
          title={t('erp_connectors.stats.total')}
          value={stats.total}
          icon="Server"
        />
        <StatisticsCard
          title={t('erp_connectors.stats.connected')}
          value={stats.connected}
          icon="CheckCircle"
          variant="success"
        />
        <StatisticsCard
          title={t('erp_connectors.stats.active')}
          value={stats.active}
          icon="Activity"
          variant="info"
        />
        <StatisticsCard
          title={t('erp_connectors.stats.with_errors')}
          value={stats.withErrors}
          icon="AlertTriangle"
          variant="danger"
        />
      </div>

      {/* Connector Selection */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{t('erp_connectors.select_connector')}</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map(connector => (
              <div
                key={connector.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedConnector?.id === connector.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedConnector(connector)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{connector.name}</h4>
                  {getConnectionStatusBadge(connector.connection_status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">{connector.type.toUpperCase()}</p>
                <p className="text-xs text-gray-500">{connector.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedConnector && (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'connectors', label: t('erp_connectors.tabs.connectors') },
                { key: 'webhooks', label: t('erp_connectors.tabs.webhooks') },
                { key: 'sync_jobs', label: t('erp_connectors.tabs.sync_jobs') },
                { key: 'logs', label: t('erp_connectors.tabs.logs') }
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
            {activeTab === 'connectors' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{selectedConnector.name}</h3>
                  <div className="space-x-2">
                    <Button
                      onClick={() => handleTestConnection(selectedConnector.id)}
                      variant="outline"
                      size="sm"
                    >
                      {t('erp_connectors.test_connection')}
                    </Button>
                    {canPerform(module, 'update') && (
                      <Button
                        onClick={() => setShowWebhookModal(true)}
                        variant="primary"
                        size="sm"
                      >
                        {t('erp_connectors.add_webhook')}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('erp_connectors.type')}</label>
                      <p className="text-sm text-gray-900">{selectedConnector.type.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('erp_connectors.api_version')}</label>
                      <p className="text-sm text-gray-900">{selectedConnector.api_version}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('erp_connectors.auth_type')}</label>
                      <p className="text-sm text-gray-900">{selectedConnector.auth_type.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('erp_connectors.sync_frequency')}</label>
                      <p className="text-sm text-gray-900">{t(`erp_connectors.frequency.${selectedConnector.sync_frequency}`)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('erp_connectors.last_sync')}</label>
                      <p className="text-sm text-gray-900">
                        {selectedConnector.last_sync_at
                          ? new Date(selectedConnector.last_sync_at).toLocaleString()
                          : t('common.never')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('erp_connectors.error_count')}</label>
                      <p className="text-sm text-gray-900">{selectedConnector.error_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'webhooks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{t('erp_connectors.webhooks')}</h3>
                  {canPerform(module, 'create') && (
                    <Button
                      onClick={() => setShowWebhookModal(true)}
                      variant="primary"
                      size="sm"
                    >
                      {t('erp_connectors.add_webhook')}
                    </Button>
                  )}
                </div>
                <DataTable
                  data={webhooks}
                  columns={[
                    { key: 'name', header: t('erp_connectors.name') },
                    { key: 'event_type', header: t('erp_connectors.event_type') },
                    { key: 'http_method', header: t('erp_connectors.method') },
                    {
                      key: 'success_count',
                      header: t('erp_connectors.success_rate'),
                      render: (webhook: ERPWebhook) => {
                        const total = webhook.success_count + webhook.failure_count;
                        const rate = total > 0 ? Math.round((webhook.success_count / total) * 100) : 0;
                        return <Badge variant={rate >= 90 ? 'success' : rate >= 70 ? 'warning' : 'danger'}>{rate}%</Badge>;
                      }
                    },
                    {
                      key: 'last_triggered_at',
                      header: t('erp_connectors.last_triggered'),
                      render: (webhook: ERPWebhook) =>
                        webhook.last_triggered_at
                          ? new Date(webhook.last_triggered_at).toLocaleString()
                          : t('common.never')
                    }
                  ]}
                />
              </div>
            )}

            {activeTab === 'sync_jobs' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{t('erp_connectors.sync_jobs')}</h3>
                  {canPerform(module, 'create') && (
                    <Button
                      onClick={() => setShowSyncJobModal(true)}
                      variant="primary"
                      size="sm"
                    >
                      {t('erp_connectors.add_sync_job')}
                    </Button>
                  )}
                </div>
                <DataTable
                  data={syncJobs}
                  columns={[
                    { key: 'job_type', header: t('erp_connectors.job_type') },
                    { key: 'entity_type', header: t('erp_connectors.entity_type') },
                    {
                      key: 'status',
                      header: t('erp_connectors.status'),
                      render: (job: ERPSyncJob) => getSyncStatusBadge(job.status)
                    },
                    {
                      key: 'processed_records',
                      header: t('erp_connectors.progress'),
                      render: (job: ERPSyncJob) => {
                        const progress = job.total_records > 0 ? Math.round((job.processed_records / job.total_records) * 100) : 0;
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
                      key: 'started_at',
                      header: t('erp_connectors.started_at'),
                      render: (job: ERPSyncJob) =>
                        job.started_at ? new Date(job.started_at).toLocaleString() : '-'
                    },
                    {
                      key: 'id',
                      header: t('common.actions'),
                      render: (job: ERPSyncJob) => (
                        <div className="flex space-x-2">
                          {job.status === 'pending' && (
                            <Button
                              onClick={() => handleExecuteSyncJob(job.id)}
                              variant="outline"
                              size="sm"
                            >
                              {t('erp_connectors.execute')}
                            </Button>
                          )}
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{t('erp_connectors.logs')}</h3>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {logs.map(log => (
                      <div key={log.id} className="p-4">
                        <div className="flex items-start space-x-3">
                          {getLogTypeBadge(log.log_type)}
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{log.message}</p>
                            {log.context && (
                              <p className="text-xs text-gray-500 mt-1">
                                {JSON.stringify(log.context)}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Connector Modal */}
      <Modal
        isOpen={showConnectorModal}
        onClose={() => setShowConnectorModal(false)}
        title={t('erp_connectors.add_connector')}
      >
        <Form
          onSubmit={handleCreateConnector}
          className="space-y-4"
        >
          <Form.Input
            label={t('erp_connectors.name')}
            value={connectorForm.name}
            onChange={(e) => setConnectorForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Form.Select
            label={t('erp_connectors.type')}
            value={connectorForm.type}
            onChange={(e) => setConnectorForm(prev => ({ ...prev, type: e.target.value as any }))}
            options={[
              { value: 'sap', label: 'SAP' },
              { value: 'oracle', label: 'Oracle' },
              { value: 'netsuite', label: 'NetSuite' },
              { value: 'microsoft_dynamics', label: 'Microsoft Dynamics' },
              { value: 'sage', label: 'Sage' },
              { value: 'quickbooks', label: 'QuickBooks' },
              { value: 'custom', label: 'Custom' }
            ]}
            required
          />
          <Form.Textarea
            label={t('erp_connectors.description')}
            value={connectorForm.description}
            onChange={(e) => setConnectorForm(prev => ({ ...prev, description: e.target.value }))}
          />
          <Form.Input
            label={t('erp_connectors.base_url')}
            type="url"
            value={connectorForm.base_url}
            onChange={(e) => setConnectorForm(prev => ({ ...prev, base_url: e.target.value }))}
            required
          />
          <Form.Input
            label={t('erp_connectors.api_version')}
            value={connectorForm.api_version}
            onChange={(e) => setConnectorForm(prev => ({ ...prev, api_version: e.target.value }))}
            required
          />
          <Form.Select
            label={t('erp_connectors.auth_type')}
            value={connectorForm.auth_type}
            onChange={(e) => setConnectorForm(prev => ({ ...prev, auth_type: e.target.value as any }))}
            options={[
              { value: 'basic', label: 'Basic Auth' },
              { value: 'bearer', label: 'Bearer Token' },
              { value: 'oauth2', label: 'OAuth 2.0' },
              { value: 'api_key', label: 'API Key' },
              { value: 'custom', label: 'Custom' }
            ]}
            required
          />
          <Form.Textarea
            label={t('erp_connectors.auth_config')}
            value={connectorForm.auth_config}
            onChange={(e) => setConnectorForm(prev => ({ ...prev, auth_config: e.target.value }))}
            placeholder='{"client_id": "your_client_id", "client_secret": "your_secret"}'
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <Form.Select
              label={t('erp_connectors.sync_frequency')}
              value={connectorForm.sync_frequency}
              onChange={(e) => setConnectorForm(prev => ({ ...prev, sync_frequency: e.target.value as any }))}
              options={[
                { value: 'manual', label: 'Manual' },
                { value: 'hourly', label: 'Hourly' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' }
              ]}
              required
            />
            <Form.Select
              label={t('erp_connectors.sync_direction')}
              value={connectorForm.sync_direction}
              onChange={(e) => setConnectorForm(prev => ({ ...prev, sync_direction: e.target.value as any }))}
              options={[
                { value: 'inbound', label: 'Inbound' },
                { value: 'outbound', label: 'Outbound' },
                { value: 'bidirectional', label: 'Bidirectional' }
              ]}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConnectorModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {t('common.create')}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Webhook Modal */}
      <Modal
        isOpen={showWebhookModal}
        onClose={() => setShowWebhookModal(false)}
        title={t('erp_connectors.add_webhook')}
      >
        <Form
          onSubmit={handleCreateWebhook}
          className="space-y-4"
        >
          <Form.Input
            label={t('erp_connectors.name')}
            value={webhookForm.name}
            onChange={(e) => setWebhookForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Form.Input
            label={t('erp_connectors.event_type')}
            value={webhookForm.event_type}
            onChange={(e) => setWebhookForm(prev => ({ ...prev, event_type: e.target.value }))}
            placeholder="vendor.created, invoice.updated"
            required
          />
          <Form.Input
            label={t('erp_connectors.endpoint_url')}
            type="url"
            value={webhookForm.endpoint_url}
            onChange={(e) => setWebhookForm(prev => ({ ...prev, endpoint_url: e.target.value }))}
            required
          />
          <Form.Select
            label={t('erp_connectors.method')}
            value={webhookForm.http_method}
            onChange={(e) => setWebhookForm(prev => ({ ...prev, http_method: e.target.value as any }))}
            options={[
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'DELETE', label: 'DELETE' }
            ]}
            required
          />
          <Form.Textarea
            label={t('erp_connectors.headers')}
            value={webhookForm.headers}
            onChange={(e) => setWebhookForm(prev => ({ ...prev, headers: e.target.value }))}
            placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
            rows={3}
          />
          <Form.Textarea
            label={t('erp_connectors.payload_template')}
            value={webhookForm.payload_template}
            onChange={(e) => setWebhookForm(prev => ({ ...prev, payload_template: e.target.value }))}
            placeholder='{"id": "{{id}}", "status": "{{status}}"}'
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowWebhookModal(false)}
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
        title={t('erp_connectors.add_sync_job')}
      >
        <Form
          onSubmit={handleCreateSyncJob}
          className="space-y-4"
        >
          <Form.Select
            label={t('erp_connectors.job_type')}
            value={syncJobForm.job_type}
            onChange={(e) => setSyncJobForm(prev => ({ ...prev, job_type: e.target.value as any }))}
            options={[
              { value: 'full_sync', label: 'Full Sync' },
              { value: 'incremental_sync', label: 'Incremental Sync' },
              { value: 'initial_sync', label: 'Initial Sync' }
            ]}
            required
          />
          <Form.Select
            label={t('erp_connectors.entity_type')}
            value={syncJobForm.entity_type}
            onChange={(e) => setSyncJobForm(prev => ({ ...prev, entity_type: e.target.value as any }))}
            options={[
              { value: 'vendors', label: 'Vendors' },
              { value: 'customers', label: 'Customers' },
              { value: 'items', label: 'Items' },
              { value: 'orders', label: 'Orders' },
              { value: 'invoices', label: 'Invoices' },
              { value: 'payments', label: 'Payments' },
              { value: 'gl_entries', label: 'GL Entries' },
              { value: 'budgets', label: 'Budgets' }
            ]}
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
