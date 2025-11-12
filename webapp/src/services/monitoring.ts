/* Lightweight monitoring and analytics hooks (dev-friendly, no external deps)
   Plus minimal OpenTelemetry-like spans behind env flags */
type EventPayload = {
  name: string;
  data?: Record<string, any>;
  ts: number;
  url: string;
  ua: string;
};

// Use explicit analytics URL only; avoid proxy fallback to prevent dev errors when backend isn't running.
const ANALYTICS_URL: string | undefined = (import.meta as any).env?.VITE_ANALYTICS_URL;
const OTEL_ENABLED: boolean = String((import.meta as any).env?.VITE_OTEL_ENABLED || '').toLowerCase() === 'true';
const OTEL_EXPORT_URL: string | undefined = (import.meta as any).env?.VITE_OTEL_EXPORT_URL;

type Span = {
  traceId: string;
  spanId: string;
  name: string;
  startTime: number;
  endTime?: number;
  attributes?: Record<string, any>;
};
function rid() { return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2); }

export function initMonitoring() {
  // Global error listeners
  window.addEventListener('error', (ev) => {
    const payload: EventPayload = {
      name: 'error',
      data: {
        message: ev.message,
        filename: (ev as any).filename,
        lineno: (ev as any).lineno,
        colno: (ev as any).colno,
        stack: (ev.error && ev.error.stack) || undefined,
      },
      ts: Date.now(),
      url: location.href,
      ua: navigator.userAgent,
    };
    dispatch(payload);
  });

  window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
    const payload: EventPayload = {
      name: 'unhandledrejection',
      data: {
        reason: serializeReason(ev.reason),
      },
      ts: Date.now(),
      url: location.href,
      ua: navigator.userAgent,
    };
    dispatch(payload);
  });
}

export function trackEvent(name: string, data: Record<string, any> = {}) {
  const payload: EventPayload = {
    name,
    data,
    ts: Date.now(),
    url: location.href,
    ua: navigator.userAgent,
  };
  dispatch(payload);
}

// Minimal OpenTelemetry-like span helpers
export function startSpan(name: string, attributes: Record<string, any> = {}): Span {
  const span: Span = {
    traceId: rid(),
    spanId: rid(),
    name,
    startTime: performance.now(),
    attributes,
  };
  if ((import.meta as any).env?.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[otel] span_start', { name: span.name, attributes: span.attributes });
  }
  return span;
}

export function endSpan(span: Span, extraAttributes: Record<string, any> = {}) {
  span.endTime = performance.now();
  const durationMs = (span.endTime - span.startTime);
  const payload = {
    name: 'span',
    data: {
      traceId: span.traceId,
      spanId: span.spanId,
      name: span.name,
      startTime: span.startTime,
      endTime: span.endTime,
      durationMs,
      attributes: { ...(span.attributes || {}), ...extraAttributes },
    },
    ts: Date.now(),
    url: location.href,
    ua: navigator.userAgent,
  } satisfies EventPayload;
  // Console visibility
  if ((import.meta as any).env?.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[otel] span_end', { name: span.name, durationMs });
  }
  // Mirror to analytics if configured
  dispatch(payload);
  // Optional export to OTEL collector
  if (OTEL_ENABLED && OTEL_EXPORT_URL) {
    try {
      fetch(OTEL_EXPORT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // swallow
    }
  }
}

export function withSpan<T>(name: string, fn: () => T, attributes: Record<string, any> = {}): T {
  const s = startSpan(name, attributes);
  try {
    const res = fn();
    endSpan(s);
    return res;
  } catch (e) {
    endSpan(s, { error: serializeReason(e) });
    throw e;
  }
}

function serializeReason(reason: any) {
  if (reason instanceof Error) {
    return { message: reason.message, stack: reason.stack };
  }
  if (typeof reason === 'object') {
    try { return JSON.parse(JSON.stringify(reason)); } catch { return String(reason); }
  }
  return String(reason);
}

function dispatch(payload: EventPayload) {
  // Dev console visibility
  if ((import.meta as any).env?.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', payload);
  }
  // Optional POST to backend analytics collector
  if (ANALYTICS_URL) {
    try {
      fetch(ANALYTICS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // swallow network errors
    }
  }
}
