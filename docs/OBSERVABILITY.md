# Observability

This document defines service-level objectives (SLOs), tracing practices, and verification steps for the SPA. It focuses on client-side instrumentation compatible with mock-mode and optional backends.

## SLOs (Initial Targets)
- Availability (SPA render success): 99.5% monthly.
- Navigation latency (route switch to first content): p95 ≤ 1200ms.
- Error rate (uncaught exceptions per 1000 route views): ≤ 2.

## Instrumentation
- Client-side spans (OpenTelemetry-like) for:
  - `route_navigation`: start on route change, end after initial paint.
  - `action`: wrap key user actions (button clicks, form submissions).
- Export (optional): POST spans to `VITE_OTEL_EXPORT_URL` if `VITE_OTEL_ENABLED=true`.
- Dev visibility: logs to console in `DEV` mode.

### Env Flags
- `VITE_OTEL_ENABLED=true|false` — enable client span export.
- `VITE_OTEL_EXPORT_URL` — collector HTTP endpoint (e.g., `http://localhost:4318/v1/traces` or custom ingestor).
- `VITE_ANALYTICS_URL` — existing lightweight analytics collector; spans can also mirror here.

## Setup
1) Enable flags in `webapp/.env.development` or `webapp/.env.production`:
```
VITE_OTEL_ENABLED=true
VITE_OTEL_EXPORT_URL=http://localhost:4318/v1/spans
```
2) Spans are produced automatically for route navigation. Use `withSpan('action:submit-po', fn)` for actions.

## Verification
- Dev server: navigate `/procurement/pr`, `/comms`, `/supply/order-tracker`.
- Console: confirm `[otel] span_start` and `span_end` logs; no errors.
- Network: if export enabled, verify POST requests to `VITE_OTEL_EXPORT_URL` succeed (200/204).

## Dashboards (Templates)
- See `ops/observability/` for Grafana/Tempo/Jaeger JSON templates.
- Metrics to visualize: route navigation durations, action durations, error counts.

## Notes
- Instrumentation is minimal and behind flags; performance impact is negligible.
- Backends are optional; spans can be inspected in console during development.
