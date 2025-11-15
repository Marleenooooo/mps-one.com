import type { EventEnvelope, EventTopic } from '../events/topics';

export function subscribeSSE(url: string, topics: EventTopic[], onMessage: (e: EventEnvelope) => void): EventSource | null {
  if (typeof window === 'undefined') return null;
  const u = new URL(url);
  for (const t of topics) u.searchParams.append('topic', t);
  const es = new EventSource(u.toString());
  es.onmessage = ev => {
    try {
      const data = JSON.parse(ev.data);
      onMessage(data);
    } catch {}
  };
  return es;
}

