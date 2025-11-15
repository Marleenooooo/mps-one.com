export type EventTopic =
  | 'profile.updated'
  | 'post.created'
  | 'post.liked'
  | 'trust.updated'
  | 'rfq.broadcast'
  | 'quote.created'
  | 'po.created'
  | 'analytics.funnel.step'
  | 'analytics.drilldown.request'
  | 'analytics.cohort.created'
  | 'analytics.anomaly.detected'
  | 'analytics.forecast.request'
  | 'supplier.performance.updated'
  | 'quote.comparison.request'
  | 'procurement.approval.made'
  | 'budget.forecast.updated';

export interface EventEnvelope<T = any> {
  topic: EventTopic;
  ts: number;
  payload: T;
  source?: 'mpsbook' | 'mpsone' | 'external';
}

