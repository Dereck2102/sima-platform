import axios from 'axios';

// Testing API Configuration
const API_BASE_URL = import.meta.env.VITE_TESTING_API_URL || 'http://localhost:3099';
const SERVICES_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface TestResult {
  id: string;
  name: string;
  type: 'unit' | 'load' | 'e2e' | 'lint' | 'mqtt' | 'soap' | 'grpc';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  message?: string;
  details?: unknown;
  timestamp: Date;
}

export interface LoadTestMetrics {
  vus: number;
  requests: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

export interface ServiceHealth {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
}

// Health check for all services
export async function checkServicesHealth(): Promise<ServiceHealth[]> {
  const services = [
    { name: 'API Gateway', url: `${SERVICES_BASE_URL}/health`, port: 3000 },
    { name: 'Core Service', url: 'http://localhost:3002/health', port: 3002 },
    { name: 'Inventory Service', url: 'http://localhost:3004/health', port: 3004 },
    { name: 'Shared Service', url: 'http://localhost:3006/health', port: 3006 },
    { name: 'Geo Tracker', url: 'http://localhost:3009/health', port: 3009 },
    { name: 'Analytics Engine', url: 'http://localhost:3010/health', port: 3010 },
    { name: 'Mobile BFF', url: 'http://localhost:3011/health', port: 3011 },
  ];

  const results: ServiceHealth[] = [];
  
  for (const service of services) {
    const start = Date.now();
    try {
      await axios.get(service.url, { timeout: 5000 });
      results.push({
        name: service.name,
        url: service.url,
        status: 'healthy',
        responseTime: Date.now() - start,
      });
    } catch {
      results.push({
        name: service.name,
        url: service.url,
        status: 'unhealthy',
        responseTime: Date.now() - start,
      });
    }
  }

  return results;
}

// Run Unit Tests
export async function runUnitTests(service: string): Promise<TestResult> {
  const start = Date.now();
  try {
    const response = await axios.post(`${API_BASE_URL}/api/tests/unit/${service}`, {}, {
      timeout: 120000, // 2 minute timeout for tests
    });
    return {
      id: `unit-${service}-${Date.now()}`,
      name: `Unit Tests: ${service}`,
      type: 'unit',
      status: response.data.success ? 'passed' : 'failed',
      duration: Date.now() - start,
      message: response.data.message,
      details: response.data.output,
      timestamp: new Date(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    return {
      id: `unit-${service}-${Date.now()}`,
      name: `Unit Tests: ${service}`,
      type: 'unit',
      status: 'failed',
      duration: Date.now() - start,
      message: `Error: ${message}`,
      timestamp: new Date(),
    };
  }
}

// Run Lint Tests
export async function runLintTests(): Promise<TestResult> {
  const start = Date.now();
  try {
    const response = await axios.post(`${API_BASE_URL}/api/tests/lint`, {}, {
      timeout: 300000, // 5 minute timeout for lint
    });
    return {
      id: `lint-${Date.now()}`,
      name: 'ESLint Quality Check',
      type: 'lint',
      status: response.data.success ? 'passed' : 'failed',
      duration: Date.now() - start,
      message: response.data.message,
      details: response.data.output,
      timestamp: new Date(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    return {
      id: `lint-${Date.now()}`,
      name: 'ESLint Quality Check',
      type: 'lint',
      status: 'failed',
      duration: Date.now() - start,
      message: `Error: ${message}`,
      timestamp: new Date(),
    };
  }
}

// Test MQTT Connection
export async function testMqttConnection(): Promise<TestResult> {
  const start = Date.now();
  try {
    const response = await axios.post(`${API_BASE_URL}/api/tests/mqtt`, {
      topic: 'sima/test',
      message: 'ping',
    }, { timeout: 30000 });
    return {
      id: `mqtt-${Date.now()}`,
      name: 'MQTT Connection Test',
      type: 'mqtt',
      status: response.data.success ? 'passed' : 'failed',
      duration: Date.now() - start,
      message: response.data.message,
      details: response.data,
      timestamp: new Date(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    return {
      id: `mqtt-${Date.now()}`,
      name: 'MQTT Connection Test',
      type: 'mqtt',
      status: 'failed',
      duration: Date.now() - start,
      message: `Error: ${message}`,
      timestamp: new Date(),
    };
  }
}

// Test SOAP Service
export async function testSoapService(): Promise<TestResult> {
  const start = Date.now();
  try {
    // First try to get WSDL
    const wsdlResponse = await axios.get(`${SERVICES_BASE_URL}/api/reports/soap?wsdl`, {
      timeout: 10000,
    });
    
    const hasWsdl = wsdlResponse.data && wsdlResponse.data.includes('wsdl');
    
    return {
      id: `soap-${Date.now()}`,
      name: 'SOAP Service Test',
      type: 'soap',
      status: hasWsdl ? 'passed' : 'failed',
      duration: Date.now() - start,
      message: hasWsdl ? 'WSDL endpoint accessible' : 'WSDL not found',
      timestamp: new Date(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    return {
      id: `soap-${Date.now()}`,
      name: 'SOAP Service Test',
      type: 'soap',
      status: 'failed',
      duration: Date.now() - start,
      message: `Error: ${message}`,
      timestamp: new Date(),
    };
  }
}

// Run Load Test
export async function runLoadTest(scenario: string): Promise<TestResult> {
  const start = Date.now();
  try {
    const response = await axios.post(`${API_BASE_URL}/api/tests/load/${scenario}`, {}, {
      timeout: 600000, // 10 minute timeout for load tests
    });
    return {
      id: `load-${scenario}-${Date.now()}`,
      name: `Load Test: ${scenario}`,
      type: 'load',
      status: response.data.success ? 'passed' : 'failed',
      duration: Date.now() - start,
      message: response.data.message,
      details: response.data.metrics,
      timestamp: new Date(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    return {
      id: `load-${scenario}-${Date.now()}`,
      name: `Load Test: ${scenario}`,
      type: 'load',
      status: 'failed',
      duration: Date.now() - start,
      message: `Error: ${message}`,
      timestamp: new Date(),
    };
  }
}

// Get Load Test Metrics (for live updates)
export async function getLoadTestMetrics(): Promise<LoadTestMetrics | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tests/load/metrics`);
    return response.data;
  } catch {
    return null;
  }
}

// Authentication test
export async function testAuthentication(): Promise<TestResult> {
  const start = Date.now();
  try {
    const response = await axios.post(`${SERVICES_BASE_URL}/api/auth/login`, {
      email: 'dsamacoria@uce.edu.ec',
      password: 'Admin123!',
    }, { timeout: 10000 });
    
    const hasToken = response.data && response.data.accessToken;
    
    return {
      id: `auth-${Date.now()}`,
      name: 'Authentication Test',
      type: 'e2e',
      status: hasToken ? 'passed' : 'failed',
      duration: Date.now() - start,
      message: hasToken ? 'Login successful, token received' : 'Login failed',
      timestamp: new Date(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    return {
      id: `auth-${Date.now()}`,
      name: 'Authentication Test',
      type: 'e2e',
      status: 'failed',
      duration: Date.now() - start,
      message: `Error: ${message}`,
      timestamp: new Date(),
    };
  }
}
