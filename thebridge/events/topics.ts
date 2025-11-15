export type EventTopic =
  | 'profile.updated'
  | 'post.created'
  | 'post.liked'
  | 'trust.updated'
  | 'rfq.broadcast'
  | 'quote.created'
  | 'po.created';

export interface EventEnvelope<T = any> {
  topic: EventTopic;
  ts: number;
  payload: T;
  source?: 'mpsbook' | 'mpsone' | 'external';
}

