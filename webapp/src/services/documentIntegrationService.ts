export interface DocumentIntegration {
  id: number;
  company_id: number;
  name: string;
  type: 'sharepoint' | 'google_drive' | 'dropbox' | 'box' | 'onedrive' | 's3' | 'custom';
  description?: string;
  connection_config: {
    base_url?: string;
    api_key?: string;
    client_id?: string;
    client_secret?: string;
    tenant_id?: string;
    bucket_name?: string;
    region?: string;
    access_token?: string;
    refresh_token?: string;
    [key: string]: any;
  };
  sync_config: {
    sync_direction: 'inbound' | 'outbound' | 'bidirectional';
    sync_frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
    folder_mappings: Array<{
      local_folder: string;
      remote_folder: string;
      document_types: string[];
      sync_filters: {
        file_extensions?: string[];
        max_file_size?: number;
        created_after?: string;
        [key: string]: any;
      };
    }>;
    conflict_resolution: 'local_wins' | 'remote_wins' | 'newest_wins' | 'manual';
  };
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  last_sync_at?: string | null;
  last_error?: string | null;
  sync_stats: {
    total_files_synced: number;
    total_files_failed: number;
    last_sync_duration: number;
    storage_used: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentSyncJob {
  id: number;
  integration_id: number;
  job_type: 'full_sync' | 'incremental_sync' | 'folder_sync' | 'file_sync';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  direction: 'upload' | 'download' | 'bidirectional';
  folder_mapping_index: number;
  total_files: number;
  processed_files: number;
  failed_files: number;
  started_at?: string | null;
  completed_at?: string | null;
  error_log?: string[];
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: number;
  integration_id: number;
  document_id: number;
  remote_file_id: string;
  remote_version: string;
  local_version: string;
  file_name: string;
  file_size: number;
  file_hash: string;
  mime_type: string;
  last_modified_at: string;
  sync_status: 'synced' | 'pending' | 'conflict' | 'error';
  conflict_resolution?: 'local' | 'remote' | 'merge' | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentOCRResult {
  id: number;
  document_id: number;
  integration_id: number;
  ocr_provider: 'aws_textract' | 'google_vision' | 'azure_form_recognizer' | 'tesseract';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_text?: string | null;
  confidence_score?: number | null;
  extracted_data?: Record<string, any> | null;
  processing_time?: number | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

class DocumentIntegrationService {
  private readonly STORAGE_KEY = 'document_integrations';
  private readonly SYNC_JOBS_KEY = 'document_sync_jobs';
  private readonly VERSIONS_KEY = 'document_versions';
  private readonly OCR_RESULTS_KEY = 'document_ocr_results';

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  async getIntegrations(companyId: number): Promise<DocumentIntegration[]> {
    await this.seedMockData();
    const integrations = this.getStoredData<DocumentIntegration>(this.STORAGE_KEY);
    return integrations.filter(i => i.company_id === companyId);
  }

  async getIntegration(id: number): Promise<DocumentIntegration | null> {
    const integrations = await this.getIntegrations(1);
    return integrations.find(i => i.id === id) || null;
  }

  async createIntegration(data: Omit<DocumentIntegration, 'id' | 'created_at' | 'updated_at' | 'status' | 'last_sync_at' | 'last_error' | 'sync_stats'>): Promise<DocumentIntegration> {
    const integration: DocumentIntegration = {
      ...data,
      id: this.generateId(),
      status: 'disconnected',
      last_sync_at: null,
      last_error: null,
      sync_stats: {
        total_files_synced: 0,
        total_files_failed: 0,
        last_sync_duration: 0,
        storage_used: 0
      },
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp()
    };

    const integrations = await this.getIntegrations(data.company_id);
    integrations.push(integration);
    this.setStoredData(this.STORAGE_KEY, integrations);

    return integration;
  }

  async updateIntegration(id: number, data: Partial<DocumentIntegration>): Promise<DocumentIntegration | null> {
    const integrations = await this.getIntegrations(1);
    const index = integrations.findIndex(i => i.id === id);
    
    if (index === -1) return null;

    integrations[index] = {
      ...integrations[index],
      ...data,
      updated_at: this.getCurrentTimestamp()
    };

    this.setStoredData(this.STORAGE_KEY, integrations);
    return integrations[index];
  }

  async deleteIntegration(id: number): Promise<boolean> {
    const integrations = await this.getIntegrations(1);
    const filtered = integrations.filter(i => i.id !== id);
    
    if (filtered.length === integrations.length) return false;
    
    this.setStoredData(this.STORAGE_KEY, filtered);
    return true;
  }

  async testConnection(id: number): Promise<boolean> {
    const integration = await this.getIntegration(id);
    if (!integration) return false;

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isSuccess = Math.random() > 0.2; // 80% success rate
    const status = isSuccess ? 'connected' : 'error';
    
    await this.updateIntegration(id, { 
      status,
      last_sync_at: isSuccess ? this.getCurrentTimestamp() : integration.last_sync_at
    });

    return isSuccess;
  }

  // Sync Job methods
  async getSyncJobs(integrationId: number): Promise<DocumentSyncJob[]> {
    await this.seedMockSyncJobs();
    const jobs = this.getStoredData<DocumentSyncJob>(this.SYNC_JOBS_KEY);
    return jobs.filter(j => j.integration_id === integrationId);
  }

  async createSyncJob(data: Omit<DocumentSyncJob, 'id' | 'created_at' | 'updated_at' | 'status' | 'started_at' | 'completed_at' | 'total_files' | 'processed_files' | 'failed_files' | 'error_log'>): Promise<DocumentSyncJob> {
    const job: DocumentSyncJob = {
      ...data,
      id: this.generateId(),
      status: 'pending',
      started_at: null,
      completed_at: null,
      total_files: 0,
      processed_files: 0,
      failed_files: 0,
      error_log: [],
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp()
    };

    const jobs = await this.getSyncJobs(data.integration_id);
    jobs.push(job);
    this.setStoredData(this.SYNC_JOBS_KEY, jobs);

    return job;
  }

  async executeSyncJob(jobId: number): Promise<boolean> {
    const jobs = this.getStoredData<DocumentSyncJob>(this.SYNC_JOBS_KEY);
    const job = jobs.find(j => j.id === jobId);
    
    if (!job) return false;

    await this.updateSyncJob(jobId, {
      status: 'running',
      started_at: this.getCurrentTimestamp()
    });

    try {
      // Simulate sync job execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const totalFiles = Math.floor(Math.random() * 100) + 10;
      const failedFiles = Math.floor(Math.random() * (totalFiles * 0.1));
      const processedFiles = totalFiles - failedFiles;

      await this.updateSyncJob(jobId, {
        status: 'completed',
        completed_at: this.getCurrentTimestamp(),
        total_files: totalFiles,
        processed_files: processedFiles,
        failed_files: failedFiles
      });

      // Update integration stats
      const integration = await this.getIntegration(job.integration_id);
      if (integration) {
        await this.updateIntegration(job.integration_id, {
          sync_stats: {
            ...integration.sync_stats,
            total_files_synced: integration.sync_stats.total_files_synced + processedFiles,
            total_files_failed: integration.sync_stats.total_files_failed + failedFiles,
            last_sync_duration: 3000,
            storage_used: integration.sync_stats.storage_used + (processedFiles * 1024 * 1024) // 1MB per file average
          },
          last_sync_at: this.getCurrentTimestamp()
        });
      }

      return true;
    } catch (error) {
      await this.updateSyncJob(jobId, {
        status: 'failed',
        completed_at: this.getCurrentTimestamp(),
        error_log: [error instanceof Error ? error.message : String(error)]
      });

      return false;
    }
  }

  async updateSyncJob(id: number, data: Partial<DocumentSyncJob>): Promise<DocumentSyncJob | null> {
    const jobs = this.getStoredData<DocumentSyncJob>(this.SYNC_JOBS_KEY);
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

  // Document Version methods
  async getDocumentVersions(integrationId: number): Promise<DocumentVersion[]> {
    await this.seedMockVersions();
    const versions = this.getStoredData<DocumentVersion>(this.VERSIONS_KEY);
    return versions.filter(v => v.integration_id === integrationId);
  }

  async createDocumentVersion(data: Omit<DocumentVersion, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentVersion> {
    const version: DocumentVersion = {
      ...data,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp()
    };

    const versions = await this.getDocumentVersions(data.integration_id);
    versions.push(version);
    this.setStoredData(this.VERSIONS_KEY, versions);

    return version;
  }

  // OCR methods
  async getOCRResults(integrationId: number): Promise<DocumentOCRResult[]> {
    await this.seedMockOCRResults();
    const results = this.getStoredData<DocumentOCRResult>(this.OCR_RESULTS_KEY);
    return results.filter(r => r.integration_id === integrationId);
  }

  async processOCR(documentId: number, integrationId: number, ocrProvider: DocumentOCRResult['ocr_provider']): Promise<DocumentOCRResult> {
    const result: DocumentOCRResult = {
      id: this.generateId(),
      document_id: documentId,
      integration_id: integrationId,
      ocr_provider: ocrProvider,
      status: 'pending',
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp()
    };

    const results = await this.getOCRResults(integrationId);
    results.push(result);
    this.setStoredData(this.OCR_RESULTS_KEY, results);

    // Simulate OCR processing
    setTimeout(async () => {
      await this.updateOCRResult(result.id, {
        status: 'processing'
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const isSuccess = Math.random() > 0.1; // 90% success rate
      
      if (isSuccess) {
        await this.updateOCRResult(result.id, {
          status: 'completed',
          extracted_text: 'Sample extracted text from document...',
          confidence_score: Math.random() * 0.3 + 0.7, // 70-100% confidence
          extracted_data: {
            invoice_number: 'INV-2024-001',
            total_amount: 1000.00,
            vendor_name: 'Sample Vendor',
            invoice_date: '2024-01-15'
          },
          processing_time: 2000
        });
      } else {
        await this.updateOCRResult(result.id, {
          status: 'failed',
          error_message: 'OCR processing failed due to poor image quality'
        });
      }
    }, 100);

    return result;
  }

  async updateOCRResult(id: number, data: Partial<DocumentOCRResult>): Promise<DocumentOCRResult | null> {
    const results = this.getStoredData<DocumentOCRResult>(this.OCR_RESULTS_KEY);
    const index = results.findIndex(r => r.id === id);
    
    if (index === -1) return null;

    results[index] = {
      ...results[index],
      ...data,
      updated_at: this.getCurrentTimestamp()
    };

    this.setStoredData(this.OCR_RESULTS_KEY, results);
    return results[index];
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
    const existing = this.getStoredData<DocumentIntegration>(this.STORAGE_KEY);
    if (existing.length > 0) return;

    const mockIntegrations: DocumentIntegration[] = [
      {
        id: 1,
        company_id: 1,
        name: 'SharePoint Production',
        type: 'sharepoint',
        description: 'Main document repository for procurement documents',
        connection_config: {
          base_url: 'https://company.sharepoint.com',
          tenant_id: 'tenant-123',
          client_id: 'client-456'
        },
        sync_config: {
          sync_direction: 'bidirectional',
          sync_frequency: 'daily',
          folder_mappings: [
            {
              local_folder: 'purchase_orders',
              remote_folder: '/sites/procurement/POs',
              document_types: ['purchase_order', 'contract'],
              sync_filters: {
                file_extensions: ['.pdf', '.docx'],
                max_file_size: 10485760, // 10MB
                created_after: '2024-01-01'
              }
            },
            {
              local_folder: 'invoices',
              remote_folder: '/sites/finance/invoices',
              document_types: ['invoice', 'receipt'],
              sync_filters: {
                file_extensions: ['.pdf'],
                max_file_size: 5242880, // 5MB
                created_after: '2024-01-01'
              }
            }
          ],
          conflict_resolution: 'newest_wins'
        },
        status: 'connected',
        last_sync_at: new Date(Date.now() - 3600000).toISOString(),
        last_error: null,
        sync_stats: {
          total_files_synced: 1250,
          total_files_failed: 25,
          last_sync_duration: 180000, // 3 minutes
          storage_used: 1073741824 // 1GB
        },
        is_active: true,
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        company_id: 1,
        name: 'Google Drive Backup',
        type: 'google_drive',
        description: 'Backup integration for critical documents',
        connection_config: {
          client_id: 'google-client-789',
          refresh_token: 'refresh-token-xyz'
        },
        sync_config: {
          sync_direction: 'outbound',
          sync_frequency: 'weekly',
          folder_mappings: [
            {
              local_folder: 'contracts',
              remote_folder: '/MPSOne/Backups/Contracts',
              document_types: ['contract', 'agreement'],
              sync_filters: {
                file_extensions: ['.pdf'],
                max_file_size: 20971520, // 20MB
                created_after: '2024-01-01'
              }
            }
          ],
          conflict_resolution: 'remote_wins'
        },
        status: 'disconnected',
        last_sync_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        last_error: 'Authentication token expired',
        sync_stats: {
          total_files_synced: 450,
          total_files_failed: 15,
          last_sync_duration: 300000, // 5 minutes
          storage_used: 536870912 // 512MB
        },
        is_active: false,
        created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    this.setStoredData(this.STORAGE_KEY, mockIntegrations);
  }

  private async seedMockSyncJobs(): Promise<void> {
    const existing = this.getStoredData<DocumentSyncJob>(this.SYNC_JOBS_KEY);
    if (existing.length > 0) return;

    const mockJobs: DocumentSyncJob[] = [
      {
        id: 1,
        integration_id: 1,
        job_type: 'incremental_sync',
        status: 'completed',
        direction: 'bidirectional',
        folder_mapping_index: 0,
        total_files: 25,
        processed_files: 25,
        failed_files: 0,
        started_at: new Date(Date.now() - 7200000).toISOString(),
        completed_at: new Date(Date.now() - 6600000).toISOString(),
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 6600000).toISOString()
      },
      {
        id: 2,
        integration_id: 1,
        job_type: 'folder_sync',
        status: 'running',
        direction: 'download',
        folder_mapping_index: 1,
        total_files: 0,
        processed_files: 0,
        failed_files: 0,
        started_at: new Date(Date.now() - 1800000).toISOString(),
        completed_at: null,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    this.setStoredData(this.SYNC_JOBS_KEY, mockJobs);
  }

  private async seedMockVersions(): Promise<void> {
    const existing = this.getStoredData<DocumentVersion>(this.VERSIONS_KEY);
    if (existing.length > 0) return;

    const mockVersions: DocumentVersion[] = [
      {
        id: 1,
        integration_id: 1,
        document_id: 101,
        remote_file_id: 'sharepoint-file-123',
        remote_version: '1.0',
        local_version: '1.0',
        file_name: 'PO-2024-001.pdf',
        file_size: 245760, // 240KB
        file_hash: 'sha256-hash-abc',
        mime_type: 'application/pdf',
        last_modified_at: new Date(Date.now() - 3600000).toISOString(),
        sync_status: 'synced',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        integration_id: 1,
        document_id: 102,
        remote_file_id: 'sharepoint-file-456',
        remote_version: '2.1',
        local_version: '2.0',
        file_name: 'Contract-Vendor-ABC.docx',
        file_size: 524288, // 512KB
        file_hash: 'sha256-hash-def',
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        last_modified_at: new Date(Date.now() - 1800000).toISOString(),
        sync_status: 'conflict',
        conflict_resolution: null,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    this.setStoredData(this.VERSIONS_KEY, mockVersions);
  }

  private async seedMockOCRResults(): Promise<void> {
    const existing = this.getStoredData<DocumentOCRResult>(this.OCR_RESULTS_KEY);
    if (existing.length > 0) return;

    const mockResults: DocumentOCRResult[] = [
      {
        id: 1,
        document_id: 101,
        integration_id: 1,
        ocr_provider: 'aws_textract',
        status: 'completed',
        extracted_text: 'INVOICE\nInvoice Number: INV-2024-001\nDate: January 15, 2024\nVendor: ABC Supplies\nTotal Amount: $1,000.00',
        confidence_score: 0.95,
        extracted_data: {
          invoice_number: 'INV-2024-001',
          invoice_date: '2024-01-15',
          vendor_name: 'ABC Supplies',
          total_amount: 1000.00,
          line_items: [
            { description: 'Office Supplies', quantity: 10, unit_price: 100.00, total: 1000.00 }
          ]
        },
        processing_time: 1500,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        document_id: 102,
        integration_id: 1,
        ocr_provider: 'google_vision',
        status: 'processing',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    this.setStoredData(this.OCR_RESULTS_KEY, mockResults);
  }
}

export const documentIntegrationService = new DocumentIntegrationService();
