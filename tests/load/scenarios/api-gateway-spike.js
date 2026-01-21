// =============================================================================
// SIMA Platform - API Gateway Spike Test (k6)
// Tests API Gateway behavior under sudden traffic spikes
// =============================================================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const spikeErrorRate = new Rate('spike_errors');
const spikeLatency = new Trend('spike_latency');

// Spike test configuration
export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Baseline load
    { duration: '5s', target: 200 },   // Spike to 200 users
    { duration: '30s', target: 200 },  // Maintain spike
    { duration: '5s', target: 10 },    // Recover
    { duration: '20s', target: 10 },   // Verify recovery
    { duration: '5s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% under 2s during spike
    http_req_failed: ['rate<0.10'],     // Allow up to 10% errors during spike
    spike_errors: ['rate<0.15'],        // Spike-specific error tracking
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

// Various endpoints to test
const endpoints = [
  { path: '/health', method: 'GET' },
  { path: '/api/auth/login', method: 'POST', body: { email: 'admin@uce.edu.ec', password: 'Admin123!' } },
];

export default function () {
  // Pick random endpoint
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const url = `${BASE_URL}${endpoint.path}`;
  
  let response;
  const start = Date.now();

  if (endpoint.method === 'GET') {
    response = http.get(url, {
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    response = http.post(url, JSON.stringify(endpoint.body), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Track latency
  spikeLatency.add(Date.now() - start);

  // Check response
  const success = check(response, {
    'status is 2xx or 4xx (not 5xx)': (r) => r.status < 500,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  spikeErrorRate.add(!success);

  // Minimal think time during spike
  sleep(Math.random() * 0.5);
}

export function handleSummary(data) {
  const { metrics } = data;
  
  return {
    'summary.json': JSON.stringify(data, null, 2),
    stdout: `
========================================
SIMA Platform - API Gateway Spike Test
========================================

Peak Virtual Users: 200
Duration: ~75 seconds

Total Requests: ${metrics.http_reqs?.values?.count || 'N/A'}
Failed Requests: ${metrics.http_req_failed?.values?.passes || 0}
Avg Response Time: ${metrics.http_req_duration?.values?.avg?.toFixed(2) || 'N/A'}ms
95th Percentile: ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
Max Response Time: ${metrics.http_req_duration?.values?.max?.toFixed(2) || 'N/A'}ms
Spike Error Rate: ${((metrics.spike_errors?.values?.rate || 0) * 100).toFixed(2)}%

Results:
- Response time p(95)<2000ms: ${(metrics.http_req_duration?.values?.['p(95)'] || 0) < 2000 ? '✅ PASS' : '❌ FAIL'}
- Error rate < 10%: ${(metrics.http_req_failed?.values?.rate || 0) < 0.10 ? '✅ PASS' : '❌ FAIL'}
========================================
`,
  };
}
