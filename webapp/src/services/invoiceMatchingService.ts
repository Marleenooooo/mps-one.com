// Invoice matching service for 3-way/4-way matching with OCR
export interface InvoiceMatching {
  id: number;
  invoice_id: number;
  invoice_number: string;
  vendor_name: string;
  invoice_amount: number;
  invoice_date: string;
  po_id?: number;
  po_number?: string;
  delivery_id?: number;
  delivery_number?: string;
  contract_id?: number;
  contract_number?: string;
  matching_type: '2-way' | '3-way' | '4-way';
  status: 'pending' | 'matched' | 'exception' | 'rejected' | 'approved';
  matching_score?: number;
  exception_count: number;
  exception_reason?: string;
  ocr_confidence_score?: number;
  ocr_extracted_data?: any;
  manual_override: boolean;
  created_at: string;
  updated_at: string;
}

class InvoiceMatchingService {
  private mockMatchings: InvoiceMatching[] = [
    {
      id: 1,
      invoice_id: 101,
      invoice_number: 'INV-2024-001',
      vendor_name: 'TechCorp Solutions',
      invoice_amount: 12500.00,
      invoice_date: '2024-01-15',
      po_id: 201,
      po_number: 'PO-2024-045',
      delivery_id: 301,
      delivery_number: 'DEL-2024-023',
      matching_type: '3-way',
      status: 'matched',
      matching_score: 98.5,
      exception_count: 0,
      ocr_confidence_score: 92.3,
      manual_override: false,
      created_at: '2024-01-16T10:30:00Z',
      updated_at: '2024-01-16T10:35:00Z'
    },
    {
      id: 2,
      invoice_id: 102,
      invoice_number: 'INV-2024-002',
      vendor_name: 'Office Supplies Inc',
      invoice_amount: 2850.00,
      invoice_date: '2024-01-16',
      po_id: 202,
      po_number: 'PO-2024-046',
      delivery_id: 302,
      delivery_number: 'DEL-2024-024',
      matching_type: '3-way',
      status: 'exception',
      matching_score: 75.2,
      exception_count: 2,
      exception_reason: 'Price variance detected, Missing delivery confirmation',
      ocr_confidence_score: 88.7,
      manual_override: false,
      created_at: '2024-01-17T09:15:00Z',
      updated_at: '2024-01-17T09:20:00Z'
    }
  ];

  async getInvoiceMatchings(): Promise<InvoiceMatching[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockMatchings;
  }

  async processMatching(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const matching = this.mockMatchings.find(m => m.id === id);
    if (matching) {
      const randomScore = Math.random() * 40 + 60;
      matching.matching_score = Math.round(randomScore * 10) / 10;
      matching.status = randomScore > 80 ? 'matched' : randomScore > 60 ? 'exception' : 'rejected';
      matching.updated_at = new Date().toISOString();
    }
  }
}

export const invoiceMatchingService = new InvoiceMatchingService();