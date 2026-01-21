import { useState, useEffect } from 'react';
import './App.css';
import {
  TestResult,
  ServiceHealth,
  checkServicesHealth,
  runUnitTests,
  runLintTests,
  testMqttConnection,
  testSoapService,
  runLoadTest,
  testAuthentication,
} from './api/testing.api';

type TabType = 'health' | 'load' | 'unit' | 'quality' | 'protocols';

interface LoadTestMetrics {
  vus: number;
  requests: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('health');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>([]);
  const [loadMetrics, setLoadMetrics] = useState<LoadTestMetrics>({
    vus: 0,
    requests: 0,
    responseTime: 0,
    errorRate: 0,
    throughput: 0,
  });

  // Load test scenarios
  const loadTestScenarios = [
    { id: 'login-stress', name: 'Login Stress Test', vus: 100, duration: '3m' },
    { id: 'asset-crud-load', name: 'Asset CRUD Load Test', vus: 50, duration: '2m' },
  ];

  // Unit test suites (based on actual services)
  const unitTestSuites = [
    { id: 'core-service', name: 'Core Service (Auth + Tenant)', tests: '~30' },
    { id: 'inventory-service', name: 'Inventory Service', tests: '~20' },
    { id: 'shared-service', name: 'Shared Service (Notify + Report)', tests: '~25' },
    { id: 'api-gateway', name: 'API Gateway', tests: '~15' },
    { id: 'mobile-bff', name: 'Mobile BFF', tests: '~12' },
  ];

  // Check services health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsRunning(true);
    const health = await checkServicesHealth();
    setServiceHealth(health);
    setIsRunning(false);
  };

  const addResult = (result: TestResult) => {
    setTestResults((prev) => [result, ...prev].slice(0, 50)); // Keep last 50 results
  };

  const handleRunLoadTest = async (scenarioId: string) => {
    setIsRunning(true);
    const scenario = loadTestScenarios.find((s) => s.id === scenarioId);
    
    // Add pending result
    addResult({
      id: `load-${scenarioId}-${Date.now()}`,
      name: `Load Test: ${scenario?.name || scenarioId}`,
      type: 'load',
      status: 'running',
      timestamp: new Date(),
    });

    const result = await runLoadTest(scenarioId);
    
    // Update result
    setTestResults((prev) =>
      prev.map((r) =>
        r.id.includes(`load-${scenarioId}`) && r.status === 'running' ? result : r
      )
    );
    
    setIsRunning(false);
  };

  const handleRunUnitTests = async (suiteId: string) => {
    setIsRunning(true);
    const suite = unitTestSuites.find((s) => s.id === suiteId);
    
    addResult({
      id: `unit-${suiteId}-${Date.now()}`,
      name: `Unit Tests: ${suite?.name || suiteId}`,
      type: 'unit',
      status: 'running',
      timestamp: new Date(),
    });

    const result = await runUnitTests(suiteId);
    
    setTestResults((prev) =>
      prev.map((r) =>
        r.id.includes(`unit-${suiteId}`) && r.status === 'running' ? result : r
      )
    );
    
    setIsRunning(false);
  };

  const handleRunLint = async () => {
    setIsRunning(true);
    addResult({
      id: `lint-${Date.now()}`,
      name: 'ESLint Quality Check',
      type: 'lint',
      status: 'running',
      timestamp: new Date(),
    });

    const result = await runLintTests();
    
    setTestResults((prev) =>
      prev.map((r) => (r.type === 'lint' && r.status === 'running' ? result : r))
    );
    
    setIsRunning(false);
  };

  const handleTestMqtt = async () => {
    setIsRunning(true);
    addResult({
      id: `mqtt-${Date.now()}`,
      name: 'MQTT Connection Test',
      type: 'mqtt',
      status: 'running',
      timestamp: new Date(),
    });

    const result = await testMqttConnection();
    
    setTestResults((prev) =>
      prev.map((r) => (r.type === 'mqtt' && r.status === 'running' ? result : r))
    );
    
    setIsRunning(false);
  };

  const handleTestSoap = async () => {
    setIsRunning(true);
    addResult({
      id: `soap-${Date.now()}`,
      name: 'SOAP Service Test',
      type: 'soap',
      status: 'running',
      timestamp: new Date(),
    });

    const result = await testSoapService();
    
    setTestResults((prev) =>
      prev.map((r) => (r.type === 'soap' && r.status === 'running' ? result : r))
    );
    
    setIsRunning(false);
  };

  const handleTestAuth = async () => {
    setIsRunning(true);
    addResult({
      id: `auth-${Date.now()}`,
      name: 'Authentication Test',
      type: 'e2e',
      status: 'running',
      timestamp: new Date(),
    });

    const result = await testAuthentication();
    
    setTestResults((prev) =>
      prev.map((r) => (r.type === 'e2e' && r.status === 'running' ? result : r))
    );
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return '⏳';
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      default: return '⏸️';
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🧪 SIMA Testing Dashboard</h1>
        <p>Automated Testing Interface - QA Environment</p>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'health' ? 'active' : ''}`} onClick={() => setActiveTab('health')}>
          🏥 Health Check
        </button>
        <button className={`tab ${activeTab === 'load' ? 'active' : ''}`} onClick={() => setActiveTab('load')}>
          ⚡ Load Testing
        </button>
        <button className={`tab ${activeTab === 'unit' ? 'active' : ''}`} onClick={() => setActiveTab('unit')}>
          🔬 Unit Tests
        </button>
        <button className={`tab ${activeTab === 'quality' ? 'active' : ''}`} onClick={() => setActiveTab('quality')}>
          ✨ Quality
        </button>
        <button className={`tab ${activeTab === 'protocols' ? 'active' : ''}`} onClick={() => setActiveTab('protocols')}>
          📡 Protocols
        </button>
      </div>

      <div className="content">
        {/* Health Check Panel */}
        {activeTab === 'health' && (
          <div className="panel">
            <div className="panel-header">
              <h2>🏥 Service Health Check</h2>
              <p>Check the status of all microservices</p>
            </div>

            <button className="run-all-btn" onClick={checkHealth} disabled={isRunning}>
              {isRunning ? '⏳ Checking...' : '🔄 Refresh Health Status'}
            </button>

            <div className="health-grid">
              {serviceHealth.map((service) => (
                <div key={service.name} className={`health-card ${service.status}`}>
                  <span className="health-icon">
                    {service.status === 'healthy' ? '✅' : '❌'}
                  </span>
                  <div className="health-info">
                    <span className="health-name">{service.name}</span>
                    <span className="health-url">{service.url}</span>
                    {service.responseTime && (
                      <span className="health-time">{service.responseTime}ms</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <button className="action-btn" onClick={handleTestAuth} disabled={isRunning}>
                🔐 Test Authentication
              </button>
            </div>
          </div>
        )}

        {/* Load Testing Panel */}
        {activeTab === 'load' && (
          <div className="panel">
            <div className="panel-header">
              <h2>⚡ Load Testing (k6)</h2>
              <p>Stress test your API endpoints</p>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-value">{loadMetrics.vus}</span>
                <span className="metric-label">Virtual Users</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">{loadMetrics.requests.toLocaleString()}</span>
                <span className="metric-label">Total Requests</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">{loadMetrics.responseTime}ms</span>
                <span className="metric-label">Avg Response Time</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">{loadMetrics.errorRate.toFixed(2)}%</span>
                <span className="metric-label">Error Rate</span>
              </div>
              <div className="metric-card">
                <span className="metric-value">{loadMetrics.throughput}</span>
                <span className="metric-label">Req/sec</span>
              </div>
            </div>

            <div className="scenarios">
              <h3>Test Scenarios</h3>
              {loadTestScenarios.map((scenario) => (
                <div key={scenario.id} className="scenario-card">
                  <div className="scenario-info">
                    <span className="scenario-name">{scenario.name}</span>
                    <span className="scenario-details">{scenario.vus} VUs • {scenario.duration}</span>
                  </div>
                  <button
                    className="run-btn"
                    onClick={() => handleRunLoadTest(scenario.id)}
                    disabled={isRunning}
                  >
                    {isRunning ? '⏳' : '▶️'} Run
                  </button>
                </div>
              ))}
            </div>

            <div className="info-box">
              <p>ℹ️ Requires k6 installed: <code>choco install k6</code> (Windows) or <code>brew install k6</code> (Mac)</p>
            </div>
          </div>
        )}

        {/* Unit Tests Panel */}
        {activeTab === 'unit' && (
          <div className="panel">
            <div className="panel-header">
              <h2>🔬 Unit Tests (Jest)</h2>
              <p>Run service unit tests</p>
            </div>

            <div className="scenarios">
              <h3>Test Suites</h3>
              {unitTestSuites.map((suite) => (
                <div key={suite.id} className="scenario-card">
                  <div className="scenario-info">
                    <span className="scenario-name">{suite.name}</span>
                    <span className="scenario-details">{suite.tests} tests</span>
                  </div>
                  <button
                    className="run-btn"
                    onClick={() => handleRunUnitTests(suite.id)}
                    disabled={isRunning}
                  >
                    {isRunning ? '⏳' : '▶️'} Run
                  </button>
                </div>
              ))}
            </div>

            <div className="info-box">
              <p>ℹ️ Tests are executed via the Testing API Server</p>
            </div>
          </div>
        )}

        {/* Quality Panel */}
        {activeTab === 'quality' && (
          <div className="panel">
            <div className="panel-header">
              <h2>✨ Code Quality</h2>
              <p>Run linting and code quality checks</p>
            </div>

            <div className="quality-actions">
              <div className="quality-card">
                <div className="quality-icon">🔍</div>
                <h3>ESLint</h3>
                <p>Check code style and potential errors across all services</p>
                <button className="run-btn large" onClick={handleRunLint} disabled={isRunning}>
                  {isRunning ? '⏳ Running...' : '▶️ Run ESLint'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Protocols Panel */}
        {activeTab === 'protocols' && (
          <div className="panel">
            <div className="panel-header">
              <h2>📡 Protocol Testing</h2>
              <p>Validate MQTT, SOAP, and gRPC implementations</p>
            </div>

            <div className="protocol-grid">
              <div className="protocol-card">
                <div className="protocol-icon">📡</div>
                <h3>MQTT</h3>
                <p>Test IoT messaging with Mosquitto broker</p>
                <code>sima/assets/+/location</code>
                <button className="run-btn" onClick={handleTestMqtt} disabled={isRunning}>
                  {isRunning ? '⏳' : '▶️'} Test MQTT
                </button>
              </div>

              <div className="protocol-card">
                <div className="protocol-icon">🧼</div>
                <h3>SOAP</h3>
                <p>Test SOAP web services endpoint</p>
                <code>/api/reports/soap?wsdl</code>
                <button className="run-btn" onClick={handleTestSoap} disabled={isRunning}>
                  {isRunning ? '⏳' : '▶️'} Test SOAP
                </button>
              </div>

              <div className="protocol-card">
                <div className="protocol-icon">⚡</div>
                <h3>gRPC</h3>
                <p>Test gRPC service communication</p>
                <code>libs/shared/proto/asset.proto</code>
                <button className="run-btn disabled" disabled>
                  🔧 Coming Soon
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Panel */}
        <div className="results-panel">
          <div className="results-header">
            <h3>📊 Test Results</h3>
            <button className="clear-btn" onClick={clearResults}>
              🗑️ Clear
            </button>
          </div>
          <div className="results-list">
            {testResults.length === 0 ? (
              <p className="no-results">No test results yet. Run a test to see results.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={`${result.id}-${index}`} className={`result-item ${result.status}`}>
                  <div className="result-status">{getStatusIcon(result.status)}</div>
                  <div className="result-info">
                    <span className="result-name">{result.name}</span>
                    <span className="result-message">{result.message}</span>
                  </div>
                  <div className="result-meta">
                    {result.duration && (
                      <span className="result-duration">{(result.duration / 1000).toFixed(1)}s</span>
                    )}
                    <span className="result-time">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
