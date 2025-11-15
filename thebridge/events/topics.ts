export type EventTopic =
  | 'quote_created'
  | 'po_generated'
  | 'vendor_updated'
  | 'invoice_submitted'
  | 'payment_run_scheduled';

export interface EventEnvelope<T = unknown> {
  id: string;
  topic: EventTopic;
  createdAt: string;
  payload: T;
}

