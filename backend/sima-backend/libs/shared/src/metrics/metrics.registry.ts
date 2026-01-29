import { collectDefaultMetrics, Histogram, Registry } from 'prom-client';

// Shared metrics registry for all services that import from @sima/shared.
const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
});

metricsRegistry.registerMetric(httpRequestDurationSeconds);

export { metricsRegistry, httpRequestDurationSeconds };
