// =============================================================================
// SIMA Platform - Login Stress Test (k6)
// Tests authentication endpoint under load
// =============================================================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const loginErrorRate = new Rate('login_errors');
const loginDuration = new Trend('login_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '30s', target: 100 }, // Peak at 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be below 1%
    login_errors: ['rate<0.05'],      // Login errors below 5%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

// Test credentials
const testUsers = [
  { email: 'admin@uce.edu.ec', password: 'Admin123!' },
  { email: 'user@uce.edu.ec', password: 'User123!' },
  { email: 'viewer@uce.edu.ec', password: 'Viewer123!' },
];

export default function () {
  // Pick a random user
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Login request
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: user.email,
      password: user.password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  // Record duration
  loginDuration.add(loginRes.timings.duration);

  // Check response
  const loginSuccess = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login has access token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.accessToken !== undefined;
      } catch {
        return false;
      }
    },
  });

  loginErrorRate.add(!loginSuccess);

  // If login successful, make authenticated request
  if (loginRes.status === 200) {
    try {
      const body = JSON.parse(loginRes.body);
      const token = body.accessToken;

      // Get profile
      const profileRes = http.get(`${BASE_URL}/api/auth/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      check(profileRes, {
        'profile status is 200': (r) => r.status === 200,
        'profile has user data': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.email !== undefined;
          } catch {
            return false;
          }
        },
      });
    } catch (e) {
      console.error('Error parsing login response:', e);
    }
  }

  // Think time between requests
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const { metrics } = data;
  return `
========================================
SIMA Platform - Login Stress Test Results
========================================

Total Requests: ${metrics.http_reqs.values.count}
Failed Requests: ${metrics.http_req_failed.values.passes}
Avg Response Time: ${metrics.http_req_duration.values.avg.toFixed(2)}ms
95th Percentile: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
Max Response Time: ${metrics.http_req_duration.values.max.toFixed(2)}ms
Login Error Rate: ${(metrics.login_errors.values.rate * 100).toFixed(2)}%

Thresholds:
- http_req_duration p(95)<500ms: ${metrics.http_req_duration.values['p(95)'] < 500 ? '✅ PASS' : '❌ FAIL'}
- http_req_failed rate<1%: ${metrics.http_req_failed.values.rate < 0.01 ? '✅ PASS' : '❌ FAIL'}
- login_errors rate<5%: ${metrics.login_errors.values.rate < 0.05 ? '✅ PASS' : '❌ FAIL'}
========================================
`;
}
