/**
 * SIMA Testing API Server
 * 
 * Backend service for the Testing Dashboard that executes real tests.
 * Run with: npx ts-node apps/testing-dashboard/src/api/server.ts
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as mqtt from 'mqtt';

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.TESTING_API_PORT || 3099;

// Middleware
app.use(cors());
app.use(express.json());

// Store for running tests
let currentLoadTest: ChildProcess | null = null;
let loadTestMetrics = {
  vus: 0,
  requests: 0,
  responseTime: 0,
  errorRate: 0,
  throughput: 0,
};

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Run Unit Tests for a specific service
app.post('/api/tests/unit/:service', async (req: Request, res: Response) => {
  const { service } = req.params;
  
  console.log(`🧪 Running unit tests for: ${service}`);
  
  try {
    const { stdout, stderr } = await execAsync(
      `npx nx test ${service} --passWithNoTests`,
      { 
        cwd: process.cwd(),
        timeout: 120000, // 2 minutes
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      }
    );
    
    const output = stdout + stderr;
    const passed = !output.includes('FAIL') && !output.includes('failed');
    
    res.json({
      success: passed,
      message: passed ? 'All tests passed' : 'Some tests failed',
      output: output.slice(-5000), // Last 5000 chars
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorOutput = (error as { stdout?: string; stderr?: string })?.stdout || 
                       (error as { stdout?: string; stderr?: string })?.stderr || 
                       errorMessage;
    
    res.json({
      success: false,
      message: 'Tests failed or error occurred',
      output: typeof errorOutput === 'string' ? errorOutput.slice(-5000) : errorMessage,
    });
  }
});

// Run ESLint on entire project
app.post('/api/tests/lint', async (_req: Request, res: Response) => {
  console.log('🔍 Running ESLint...');
  
  try {
    const { stdout, stderr } = await execAsync(
      'npx nx run-many --target=lint --all --parallel=4',
      {
        cwd: process.cwd(),
        timeout: 300000, // 5 minutes
        maxBuffer: 1024 * 1024 * 10,
      }
    );
    
    const output = stdout + stderr;
    const hasErrors = output.includes('error') || output.includes('Error');
    
    res.json({
      success: !hasErrors,
      message: hasErrors ? 'Lint errors found' : 'All lint checks passed',
      output: output.slice(-5000),
    });
  } catch (error: unknown) {
    const errorOutput = (error as { stdout?: string; stderr?: string })?.stdout || 
                       (error as { stdout?: string; stderr?: string })?.stderr || '';
    
    res.json({
      success: false,
      message: 'Lint check failed',
      output: typeof errorOutput === 'string' ? errorOutput.slice(-5000) : 'Error running lint',
    });
  }
});

// Test MQTT Connection
app.post('/api/tests/mqtt', async (req: Request, res: Response) => {
  const { topic = 'sima/test', message = 'ping' } = req.body;
  const brokerUrl = process.env.MQTT_URL || 'mqtt://localhost:1883';
  
  console.log(`📡 Testing MQTT connection to ${brokerUrl}...`);
  
  try {
    const client = mqtt.connect(brokerUrl, {
      clientId: `sima-test-${Date.now()}`,
      connectTimeout: 10000,
    });

    const result = await new Promise<{ success: boolean; message: string }>((resolve) => {
      const timeout = setTimeout(() => {
        client.end();
        resolve({ success: false, message: 'Connection timeout' });
      }, 15000);

      client.on('connect', () => {
        console.log('✅ MQTT connected');
        
        // Subscribe to test topic
        client.subscribe(topic, (err) => {
          if (err) {
            clearTimeout(timeout);
            client.end();
            resolve({ success: false, message: `Subscribe error: ${err.message}` });
            return;
          }
          
          // Publish test message
          client.publish(topic, message, (pubErr) => {
            if (pubErr) {
              clearTimeout(timeout);
              client.end();
              resolve({ success: false, message: `Publish error: ${pubErr.message}` });
              return;
            }
            console.log(`📤 Published to ${topic}: ${message}`);
          });
        });
      });

      client.on('message', (receivedTopic, payload) => {
        if (receivedTopic === topic && payload.toString() === message) {
          clearTimeout(timeout);
          client.end();
          console.log(`📥 Received message on ${receivedTopic}`);
          resolve({ success: true, message: 'MQTT publish/subscribe working correctly' });
        }
      });

      client.on('error', (err) => {
        clearTimeout(timeout);
        client.end();
        resolve({ success: false, message: `Connection error: ${err.message}` });
      });
    });

    res.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.json({
      success: false,
      message: `MQTT test failed: ${errorMessage}`,
    });
  }
});

// Run Load Test with k6
app.post('/api/tests/load/:scenario', async (req: Request, res: Response) => {
  const { scenario } = req.params;
  const scriptPath = `tests/load/scenarios/${scenario}.js`;
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  
  console.log(`⚡ Running load test: ${scenario}`);
  
  // Reset metrics
  loadTestMetrics = { vus: 0, requests: 0, responseTime: 0, errorRate: 0, throughput: 0 };
  
  try {
    // Check if k6 is installed
    await execAsync('k6 version');
    
    const { stdout, stderr } = await execAsync(
      `k6 run --env API_URL=${apiUrl} ${scriptPath}`,
      {
        cwd: process.cwd(),
        timeout: 600000, // 10 minutes max
        maxBuffer: 1024 * 1024 * 50,
      }
    );
    
    const output = stdout + stderr;
    const passed = output.includes('✅') || output.includes('PASS') || !output.includes('✗');
    
    res.json({
      success: passed,
      message: passed ? 'Load test completed successfully' : 'Load test completed with failures',
      output: output.slice(-10000),
      metrics: loadTestMetrics,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isK6Missing = errorMessage.includes('k6') && (errorMessage.includes('not found') || errorMessage.includes('no se reconoce'));
    
    if (isK6Missing) {
      res.json({
        success: false,
        message: 'k6 is not installed. Install with: choco install k6 (Windows) or brew install k6 (Mac)',
        output: 'k6 binary not found in PATH',
      });
    } else {
      const errorOutput = (error as { stdout?: string })?.stdout || errorMessage;
      res.json({
        success: false,
        message: 'Load test failed',
        output: typeof errorOutput === 'string' ? errorOutput.slice(-5000) : errorMessage,
      });
    }
  }
});

// Get current load test metrics (for live updates)
app.get('/api/tests/load/metrics', (_req: Request, res: Response) => {
  res.json(loadTestMetrics);
});

// Run all unit tests
app.post('/api/tests/unit-all', async (_req: Request, res: Response) => {
  console.log('🧪 Running all unit tests...');
  
  try {
    const { stdout, stderr } = await execAsync(
      'npm run test:unit',
      {
        cwd: process.cwd(),
        timeout: 300000, // 5 minutes
        maxBuffer: 1024 * 1024 * 20,
      }
    );
    
    const output = stdout + stderr;
    const passed = !output.includes('FAIL') && !output.includes('failed');
    
    res.json({
      success: passed,
      message: passed ? 'All unit tests passed' : 'Some unit tests failed',
      output: output.slice(-10000),
    });
  } catch (error: unknown) {
    const errorOutput = (error as { stdout?: string; stderr?: string })?.stdout || 
                       (error as { stdout?: string; stderr?: string })?.stderr || '';
    
    res.json({
      success: false,
      message: 'Unit tests failed',
      output: typeof errorOutput === 'string' ? errorOutput.slice(-10000) : 'Error running tests',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                   SIMA Testing API Server                      ║
║                                                                ║
║   🚀 Server running on http://localhost:${PORT}                  ║
║                                                                ║
║   Endpoints:                                                   ║
║   POST /api/tests/unit/:service  - Run unit tests              ║
║   POST /api/tests/unit-all       - Run all unit tests          ║
║   POST /api/tests/lint           - Run ESLint                  ║
║   POST /api/tests/mqtt           - Test MQTT connection        ║
║   POST /api/tests/load/:scenario - Run k6 load test            ║
║   GET  /api/tests/load/metrics   - Get load test metrics       ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
