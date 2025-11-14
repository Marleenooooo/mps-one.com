export interface ERPConnector {
  id: number;
  company_id: number;
  name: string;
  type: 'sap' | 'oracle' | 'netsuite' | 'microsoft_dynamics' | 'sage' | 'quickbooks' | 'custom';
  description?: string;
  base_url: string;
  api_version: string;
  auth_type: 'basic' | 'bearer' | 'oauth2' | 'api_key' | 'custom';
  auth_config: Record<string, any>;
  connection_status: 'connected' | 'disconnected' | 'error' | 'testing';
  last_sync_at?: string | null;
  sync_frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  sync_direction: 'inbound' | 'outbound' | 'bidirectional';
  enabled_modules: string[];
  mapping_config: Record<string, any>;
  error_count: number;
  last_error?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ERPWebhook {
  id: number;
  connector_id: number;
  name: string;
  event_type: string;
  endpoint_url: string;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  payload_template?: string | null;
  retry_config: {
    max_retries: number;
    retry_delay: number;
    backoff_strategy: 'linear' | 'exponential';
  };
  filter_config?: Record<string, any> | null;
  is_active: boolean;
  last_triggered_at?: string | null;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface ERPSyncJob {
  id: number;
  connector_id: number;
  job_type: 'full_sync' | 'incremental_sync' | 'initial_sync';
  entity_type: 'vendors' | 'customers' | 'items' | 'orders' | 'invoices' | 'payments' | 'gl_entries' | 'budgets';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at?: string | null;
  completed_at?: string | null;
  total_records: number;
  processed_records: number;
  error_records: number;
  error_log?: string[];
  created_at: string;
  updated_at: string;
}

export interface ERPLog {
  id: number;
  connector_id: number;
  log_type: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  context?: Record<string, any> | null;
  request_data?: Record<string, any> | null;
  response_data?: Record<string, any> | null;
  error_details?: string | null;
  created_at: string;
}

class ERPConnectorService {
  private readonly STORAGE_KEY = 'erp_connectors';
  private readonly WEBHOOKS_KEY = 'erp_webhooks';
  private readonly SYNC_JOBS_KEY = 'erp_sync_jobs';
  private readonly LOGS_KEY = 'erp_logs';

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  async getConnectors(companyId: number): Promise<ERPConnector[]> {
    await this.seedMockData();
    const connectors = this.getStoredData<ERPConnector>(this.STORAGE_KEY);
    return connectors.filter(c => c.company_id === companyId);
  }

  async getConnector(id: number): Promise<ERPConnector | null> {
    const connectors = await this.getConnectors(1);
    return connectors.find(c => c.id === id) || null;
  }

  async createConnector(data: Omit<ERPConnector, 'id' | 'created_at' | 'updated_at' | 'error_count' | 'connection_status' | 'last_sync_at'>): Promise<ERPConnector> {
    const connector: ERPConnector = {
      ...data,
      id: this.generateId(),
      error_count: 0,
      connection_status: 'disconnected',
      last_sync_at: null,
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp()
    };

    const connectors = await this.getConnectors(data.company_id);
    connectors.push(connector);
    this.setStoredData(this.STORAGE_KEY, connectors);

    return connector;
  }

  async updateConnector(id: number, data: Partial<ERPConnector>): Promise<ERPConnector | null> {
    const connectors = await this.getConnectors(1);
    const index = connectors.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    connectors[index] = {
      ...connectors[index],
      ...data,
      updated_at: this.getCurrentTimestamp()
    };

    this.setStoredData(this.STORAGE_KEY, connectors);
    return connectors[index];
  }

  async deleteConnector(id: number): Promise<boolean> {
    const connectors = await this.getConnectors(1);
    const filtered = connectors.filter(c => c.id !== id);
    
    if (filtered.length === connectors.length) return false;
    
    this.setStoredData(this.STORAGE_KEY, filtered);
    return true;
  }

  async testConnection(id: number): Promise<boolean> {
    const connector = await this.getConnector(id);
    if (!connector) return false;

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isSuccess = Math.random() > 0.2; // 80% success rate
    const status = isSuccess ? 'connected' : 'error';
    
    await this.updateConnector(id, { 
      connection_status: status,
      last_sync_at: isSuccess ? this.getCurrentTimestamp() : connector.last_sync_at
    });

    await this.logEvent(id, isSuccess ? 'info' : 'error', 
      `Connection test ${isSuccess ? 'successful' : 'failed'}`,
      { connector_type: connector.type, base_url: connector.base_url }
    );

    return isSuccess;
  }

  // Webhook methods
  async getWebhooks(connectorId: number): Promise<ERPWebhook[]> {
    await this.seedMockWebhooks();
    const webhooks = this.getStoredData<ERPWebhook>(this.WEBHOOKS_KEY);
    return webhooks.filter(w => w.connector_id === connectorId);
  }

  async createWebhook(data: Omit<ERPWebhook, 'id' | 'created_at' | 'updated_at' | 'success_count' | 'failure_count' | 'last_triggered_at'>): Promise<ERPWebhook> {
    const webhook: ERPWebhook = {
      ...data,
      id: this.generateId(),
      success_count: 0,
      failure_count: 0,
      last_triggered_at: null,
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp()
    };

    const webhooks = await this.getWebhooks(data.connector_id);
    webhooks.push(webhook);
    this.setStoredData(this.WEBHOOKS_KEY, webhooks);

    return webhook;
  }

  async updateWebhook(id: number, data: Partial<ERPWebhook>): Promise<ERPWebhook | null> {
    const webhooks = this.getStoredData<ERPWebhook>(this.WEBHOOKS_KEY);
    const index = webhooks.findIndex(w => w.id === id);
    
    if (index === -1) return null;

    webhooks[index] = {
      ...webhooks[index],
      ...data,
      updated_at: this.getCurrentTimestamp()
    };

    this.setStoredData(this.WEBHOOKS_KEY, webhooks);
    return webhooks[index];
  }

  async deleteWebhook(id: number): Promise<boolean> {
    const webhooks = this.getStoredData<ERPWebhook>(this.WEBHOOKS_KEY);
    const filtered = webhooks.filter(w => w.id !== id);
    
    if (filtered.length === webhooks.length) return false;
    
    this.setStoredData(this.WEBHOOKS_KEY, filtered);
    return true;
  }

  async triggerWebhook(webhookId: number, payload: Record<string, any>): Promise<boolean> {
    const webhooks = this.getStoredData<ERPWebhook>(this.WEBHOOKS_KEY);
    const webhook = webhooks.find(w => w.id === webhookId);
    
    if (!webhook || !webhook.is_active) return false;

    try {
      // Simulate webhook trigger
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isSuccess = Math.random() > 0.1; // 90% success rate
      
      await this.updateWebhook(webhookId, {
        last_triggered_at: this.getCurrentTimestamp(),
        success_count: webhook.success_count + (isSuccess ? 1 : 0),
        failure_count: webhook.failure_count + (isSuccess ? 0 : 1)
      });

      await this.logEvent(webhook.connector_id, isSuccess ? 'info' : 'error',
        `Webhook ${webhook.name} ${isSuccess ? 'triggered successfully' : 'failed'}`,
        { webhook_id: webhookId, event_type: webhook.event_type, payload }
      );

      return isSuccess;
    } catch (error) {
      await this.updateWebhook(webhookId, {
        failure_count: webhook.failure_count + 1
      });

      await this.logEvent(webhook.connector_id, 'error',
        `Webhook ${webhook.name} failed with error`,
        { webhook_id: webhookId, error: error instanceof Error ? error.message : String(error) }
      );

      return false;
    }
  }

  // Sync job methods
  async getSyncJobs(connectorId: number): Promise<ERPSyncJob[]> {
    await this.seedMockSyncJobs();
    const jobs = this.getStoredData<ERPSyncJob>(this.SYNC_JOBS_KEY);
    return jobs.filter(j => j.connector_id === connectorId);
  }

  async createSyncJob(data: Omit<ERPSyncJob, 'id' | 'created_at' | 'updated_at' | 'status' | 'started_at' | 'completed_at' | 'total_records' | 'processed_records' | 'error_records'>): Promise<ERPSyncJob> {
    const job: ERPSyncJob = {
      ...data,
      id: this.generateId(),
      status: 'pending',
      started_at: null,
      completed_at: null,
      total_records: 0,
      processed_records: 0,
      error_records: 0,
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp()
    };

    const jobs = await this.getSyncJobs(data.connector_id);
    jobs.push(job);
    this.setStoredData(this.SYNC_JOBS_KEY, jobs);

    return job;
  }

  async updateSyncJob(id: number, data: Partial<ERPSyncJob>): Promise<ERPSyncJob | null> {
    const jobs = this.getStoredData<ERPSyncJob>(this.SYNC_JOBS_KEY);
    const index = jobs.findIndex(j => j.id === id);
    
    if (index === -1) return null;

    jobs[index] = {
      ...jobs[index],
      ...data,
      updated_at: this.getCurrentTimestamp()
    };

    this.setStoredData(this.SYNC_JOBS_KEY, jobs);
    return jobs[index];
  }

  async executeSyncJob(jobId: number): Promise<boolean> {
    const jobs = this.getStoredData<ERPSyncJob>(this.SYNC_JOBS_KEY);
    const job = jobs.find(j => j.id === jobId);
    
    if (!job) return false;

    await this.updateSyncJob(jobId, {
      status: 'running',
      started_at: this.getCurrentTimestamp()
    });

    try {
      // Simulate sync job execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const totalRecords = Math.floor(Math.random() * 1000) + 100;
      const errorRecords = Math.floor(Math.random() * (totalRecords * 0.1));
      const processedRecords = totalRecords - errorRecords;

      await this.updateSyncJob(jobId, {
        status: 'completed',
        completed_at: this.getCurrentTimestamp(),
        total_records: totalRecords,
        processed_records: processedRecords,
        error_records: errorRecords
      });

      await this.logEvent(job.connector_id, 'info',
        `Sync job completed: ${job.entity_type} (${processedRecords}/${totalRecords} records processed)`,
        { job_id: jobId, entity_type: job.entity_type, processed_records: processedRecords, error_records: errorRecords }
      );

      return true;
    } catch (error) {
      await this.updateSyncJob(jobId, {
        status: 'failed',
        completed_at: this.getCurrentTimestamp()
      });

      await this.logEvent(job.connector_id, 'error',
        `Sync job failed: ${job.entity_type}`,
        { job_id: jobId, error: error instanceof Error ? error.message : String(error) }
      );

      return false;
    }
  }

  // Logging methods
  async getLogs(connectorId: number, limit = 100): Promise<ERPLog[]> {
    await this.seedMockLogs();
    const logs = this.getStoredData<ERPLog>(this.LOGS_KEY);
    return logs
      .filter(l => l.connector_id === connectorId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  async logEvent(connectorId: number, logType: ERPLog['log_type'], message: string, context?: Record<string, any>): Promise<void> {
    const log: ERPLog = {
      id: this.generateId(),
      connector_id: connectorId,
      log_type: logType,
      message,
      context,
      created_at: this.getCurrentTimestamp()
    };

    const logs = this.getStoredData<ERPLog>(this.LOGS_KEY);
    logs.push(log);
    
    // Keep only last 1000 logs
    const trimmedLogs = logs.slice(-1000);
    this.setStoredData(this.LOGS_KEY, trimmedLogs);
  }

  // Helper methods
  private getStoredData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setStoredData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to store data for key ${key}:`, error);
    }
  }

  private async seedMockData(): Promise<void> {
    const existing = this.getStoredData<ERPConnector>(this.STORAGE_KEY);
    if (existing.length > 0) return;

    const mockConnectors: ERPConnector[] = [
      {
        id: 1,
        company_id: 1,
        name: 'SAP S/4HANA Production',
        type: 'sap',
        description: 'Main ERP system for financial data',
        base_url: 'https://sap.company.com/api',
        api_version: 'v2',
        auth_type: 'oauth2',
        auth_config: {
          client_id: 'sap_client_123',
          client_secret: 'encrypted_secret',
          token_url: 'https://sap.company.com/oauth/token'
        },
        connection_status: 'connected',
        last_sync_at: new Date(Date.now() - 3600000).toISOString(),
        sync_frequency: 'daily',
        sync_direction: 'bidirectional',
        enabled_modules: ['vendors', 'customers', 'items', 'orders', 'invoices', 'payments'],
        mapping_config: {
          vendor_mapping: { local_field: 'supplier_id', erp_field: 'vendor_code' },
          currency_mapping: { local_currency: 'USD', erp_currency: 'USD' }
        },
        error_count: 0,
        last_error: null,
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        company_id: 1,
        name: 'NetSuite Sandbox',
        type: 'netsuite',
        description: 'Sandbox environment for testing',
        base_url: 'https://sandbox.netsuite.com/api',
        api_version: 'v1',
        auth_type: 'bearer',
        auth_config: {
          token: 'encrypted_bearer_token'
        },
        connection_status: 'disconnected',
        last_sync_at: null,
        sync_frequency: 'manual',
        sync_direction: 'inbound',
        enabled_modules: ['vendors', 'items'],
        mapping_config: {},
        error_count: 3,
        last_error: 'Connection timeout',
        is_active: false,
        created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    this.setStoredData(this.STORAGE_KEY, mockConnectors);
  }

  private async seedMockWebhooks(): Promise<void> {
    const existing = this.getStoredData<ERPWebhook>(this.WEBHOOKS_KEY);
    if (existing.length > 0) return;

    const mockWebhooks: ERPWebhook[] = [
      {
        id: 1,
        connector_id: 1,
        name: 'Vendor Sync Webhook',
        event_type: 'vendor.created',
        endpoint_url: 'https://api.company.com/webhooks/erp/vendor-created',
        http_method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'webhook_secret_key'
        },
        payload_template: '{"vendor_id": "{{vendor_id}}", "vendor_code": "{{vendor_code}}"}',
        retry_config: {
          max_retries: 3,
          retry_delay: 60,
          backoff_strategy: 'exponential'
        },
        filter_config: { vendor_type: 'external' },
        is_active: true,
        last_triggered_at: new Date(Date.now() - 1800000).toISOString(),
        success_count: 45,
        failure_count: 2,
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 2,
        connector_id: 1,
        name: 'Invoice Status Update',
        event_type: 'invoice.status_changed',
        endpoint_url: 'https://api.company.com/webhooks/erp/invoice-status',
        http_method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        payload_template: '{"invoice_id": "{{invoice_id}}", "status": "{{status}}"}',
        retry_config: {
          max_retries: 5,
          retry_delay: 30,
          backoff_strategy: 'linear'
        },
        is_active: true,
        last_triggered_at: new Date(Date.now() - 3600000).toISOString(),
        success_count: 23,
        failure_count: 1,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    this.setStoredData(this.WEBHOOKS_KEY, mockWebhooks);
  }

  private async seedMockSyncJobs(): Promise<void> {
    const existing = this.getStoredData<ERPSyncJob>(this.SYNC_JOBS_KEY);
    if (existing.length > 0) return;

    const mockJobs: ERPSyncJob[] = [
      {
        id: 1,
        connector_id: 1,
        job_type: 'incremental_sync',
        entity_type: 'vendors',
        status: 'completed',
        started_at: new Date(Date.now() - 7200000).toISOString(),
        completed_at: new Date(Date.now() - 6600000).toISOString(),
        total_records: 156,
        processed_records: 156,
        error_records: 0,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 6600000).toISOString()
      },
      {
        id: 2,
        connector_id: 1,
        job_type: 'full_sync',
        entity_type: 'invoices',
        status: 'running',
        started_at: new Date(Date.now() - 1800000).toISOString(),
        completed_at: null,
        total_records: 0,
        processed_records: 0,
        error_records: 0,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    this.setStoredData(this.SYNC_JOBS_KEY, mockJobs);
  }

  private async seedMockLogs(): Promise<void> {
    const existing = this.getStoredData<ERPLog>(this.LOGS_KEY);
    if (existing.length > 0) return;

    const mockLogs: ERPLog[] = [
      {
        id: 1,
        connector_id: 1,
        log_type: 'info',
        message: 'Successfully connected to SAP S/4HANA',
        context: { api_version: 'v2', endpoint: '/api/vendors' },
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        connector_id: 1,
        log_type: 'warning',
        message: 'Rate limit approaching for vendor API',
        context: { remaining_calls: 50, reset_time: '2024-01-15T10:00:00Z' },
        created_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 3,
        connector_id: 2,
        log_type: 'error',
        message: 'Connection timeout to NetSuite sandbox',
        error_details: 'ETIMEDOUT: Connection attempt timed out',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    this.setStoredData(this.LOGS_KEY, mockLogs);
  }
}

export const erpConnectorService = new ERPConnectorService();