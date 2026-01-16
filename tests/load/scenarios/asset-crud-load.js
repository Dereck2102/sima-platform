// =============================================================================
// SIMA Platform - Asset CRUD Load Test (k6)
// Tests asset management operations under load
// =============================================================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const assetErrors = new Rate('asset_errors');
const createDuration = new Trend('asset_create_duration');
const readDuration = new Trend('asset_read_duration');
const updateDuration = new Trend('asset_update_duration');
const deleteDuration = new Trend('asset_delete_duration');
const assetsCreated = new Counter('assets_created');

export const options = {
  stages: [
    { duration: '20s', target: 10 },  // Warm up
    { duration: '1m', target: 30 },   // Normal load
    { duration: '2m', target: 50 },   // Peak load
    { duration: '30s', target: 0 },   // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    asset_errors: ['rate<0.1'],
    asset_create_duration: ['p(95)<2000'],
    asset_read_duration: ['p(95)<500'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

// Get auth token first
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: 'admin@uce.edu.ec',
      password: 'Admin123!',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (loginRes.status !== 200) {
    throw new Error('Failed to authenticate for test');
  }

  const body = JSON.parse(loginRes.body);
  return { token: body.accessToken };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // CREATE - Create a new asset
  const assetData = {
    internalCode: `ASSET-${Date.now()}-${__VU}`,
    name: `Load Test Asset ${__VU}-${__ITER}`,
    description: 'Created during load testing',
    status: 'ACTIVE',
    condition: 'NEW',
    price: Math.floor(Math.random() * 10000) + 100,
  };

  const createRes = http.post(
    `${BASE_URL}/api/assets`,
    JSON.stringify(assetData),
    { headers }
  );

  createDuration.add(createRes.timings.duration);

  const createSuccess = check(createRes, {
    'create status is 201': (r) => r.status === 201,
    'create returns id': (r) => {
      try {
        return JSON.parse(r.body).id !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (!createSuccess) {
    assetErrors.add(1);
    sleep(1);
    return;
  }

  assetsCreated.add(1);
  const asset = JSON.parse(createRes.body);
  
  sleep(0.5);

  // READ - Get the created asset
  const readRes = http.get(`${BASE_URL}/api/assets/${asset.id}`, { headers });
  readDuration.add(readRes.timings.duration);

  check(readRes, {
    'read status is 200': (r) => r.status === 200,
  });

  sleep(0.5);

  // UPDATE - Modify the asset
  const updateData = {
    name: `Updated Asset ${__VU}-${__ITER}`,
    price: asset.price + 100,
  };

  const updateRes = http.patch(
    `${BASE_URL}/api/assets/${asset.id}`,
    JSON.stringify(updateData),
    { headers }
  );

  updateDuration.add(updateRes.timings.duration);

  check(updateRes, {
    'update status is 200': (r) => r.status === 200,
  });

  sleep(0.5);

  // READ ALL - List assets
  const listRes = http.get(`${BASE_URL}/api/assets`, { headers });
  
  check(listRes, {
    'list status is 200': (r) => r.status === 200,
    'list returns array': (r) => {
      try {
        return Array.isArray(JSON.parse(r.body));
      } catch {
        return false;
      }
    },
  });

  sleep(0.5);

  // DELETE - Soft delete the asset
  const deleteRes = http.del(`${BASE_URL}/api/assets/${asset.id}`, null, { headers });
  deleteDuration.add(deleteRes.timings.duration);

  check(deleteRes, {
    'delete status is 200': (r) => r.status === 200,
  });

  // Think time
  sleep(Math.random() * 2 + 1);
}

export function teardown(data) {
  console.log('Load test completed');
}
