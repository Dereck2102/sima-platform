import { useState, useEffect } from 'react';
import './App.css';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  message?: string;
  timestamp: Date;
}

interface LoadTestMetrics {
  vus: number;
  requests: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<'load' | 'unit' | 'e2e'>('load');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [loadMetrics, setLoadMetrics] = useState<LoadTestMetrics>({
    vus: 0,
    requests: 0,
    responseTime: 0,
    errorRate: 0,
    throughput: 0,
  });

  // Simulated test scenarios
  const loadTestScenarios = [
    { id: 'login-stress', name: 'Login Stress Test', vus: 100, duration: '30s' },
    { id: 'asset-crud', name: 'Asset CRUD Load Test', vus: 50, duration: '1m' },
    { id: 'api-spike', name: 'API Gateway Spike Test', vus: 200, duration: '2m' },
  ];

  const unitTestSuites = [
    { id: 'auth-service', name: 'Auth Service Tests', tests: 24 },
    { id: 'inventory-service', name: 'Inventory Service Tests', tests: 18 },
    { id: 'tenant-service', name: 'Tenant Service Tests', tests: 12 },
    { id: 'api-gateway', name: 'API Gateway Tests', tests: 15 },
  ];

  const e2eTestSuites = [
    { id: 'login-flow', name: 'Login Flow', steps: 5 },
    { id: 'asset-management', name: 'Asset Management', steps: 8 },
    { id: 'user-management', name: 'User Management', steps: 6 },
  ];

  const runLoadTest = async (scenarioId: string) => {
    setIsRunning(true);
    const result: TestResult = {
      id: scenarioId,
      name: loadTestScenarios.find((s) => s.id === scenarioId)?.name || 'Unknown',
      status: 'running',
      timestamp: new Date(),
    };
    setTestResults((prev) => [result, ...prev]);

    // Simulate load test execution
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 1;
      setLoadMetrics({
        vus: Math.floor(Math.random() * 100) + 1,
        requests: Math.floor(Math.random() * 1000) + elapsed * 100,
        responseTime: Math.floor(Math.random() * 200) + 50,
        errorRate: Math.random() * 5,
        throughput: Math.floor(Math.random() * 500) + 100,
      });
    }, 1000);

    // Complete after simulated duration
    setTimeout(() => {
      clearInterval(interval);
      setTestResults((prev) =>
        prev.map((r) =>
          r.id === scenarioId
            ? { ...r, status: 'passed', duration: 30000, message: 'All thresholds passed' }
            : r
        )
      );
      setIsRunning(false);
    }, 5000);
  };

  const runUnitTests = async (suiteId: string) => {
    setIsRunning(true);
    const suite = unitTestSuites.find((s) => s.id === suiteId);
    const result: TestResult = {
      id: suiteId,
      name: suite?.name || 'Unknown',
      status: 'running',
      timestamp: new Date(),
    };
    setTestResults((prev) => [result, ...prev]);

    // Simulate test execution
    setTimeout(() => {
      const passed = Math.random() > 0.2;
      setTestResults((prev) =>
        prev.map((r) =>
          r.id === suiteId
            ? {
                ...r,
                status: passed ? 'passed' : 'failed',
                duration: Math.floor(Math.random() * 5000) + 2000,
                message: passed
                  ? `${suite?.tests}/${suite?.tests} tests passed`
                  : `${Math.floor((suite?.tests || 0) * 0.9)}/${suite?.tests} tests passed`,
              }
            : r
        )
      );
      setIsRunning(false);
    }, 3000);
  };

  const runE2ETests = async (suiteId: string) => {
    setIsRunning(true);
    const suite = e2eTestSuites.find((s) => s.id === suiteId);
    const result: TestResult = {
      id: suiteId,
      name: suite?.name || 'Unknown',
      status: 'running',
      timestamp: new Date(),
    };
    setTestResults((prev) => [result, ...prev]);

    // Simulate E2E test execution
    setTimeout(() => {
      const passed = Math.random() > 0.15;
      setTestResults((prev) =>
        prev.map((r) =>
          r.id === suiteId
            ? {
                ...r,
                status: passed ? 'passed' : 'failed',
                duration: Math.floor(Math.random() * 10000) + 5000,
                message: passed
                  ? `All ${suite?.steps} steps completed`
                  : `Failed at step ${Math.floor((suite?.steps || 0) * 0.7)}`,
              }
            : r
        )
      );
      setIsRunning(false);
    }, 4000);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🧪 SIMA Testing Dashboard</h1>
        <p>Automated Testing Interface</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'load' ? 'active' : ''}`}
          onClick={() => setActiveTab('load')}
        >
          ⚡ Load Testing
        </button>
        <button
          className={`tab ${activeTab === 'unit' ? 'active' : ''}`}
          onClick={() => setActiveTab('unit')}
        >
          🔬 Unit Tests
        </button>
        <button
          className={`tab ${activeTab === 'e2e' ? 'active' : ''}`}
          onClick={() => setActiveTab('e2e')}
        >
          🎭 E2E Tests
        </button>
      </div>

      <div className="content">
        {/* Load Testing Panel */}
        {activeTab === 'load' && (
          <div className="panel">
            <div className="panel-header">
              <h2>⚡ Load Testing (k6)</h2>
              <p>Stress test your API endpoints</p>
            </div>

            {/* Metrics Cards */}
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

            {/* Test Scenarios */}
            <div className="scenarios">
              <h3>Test Scenarios</h3>
              {loadTestScenarios.map((scenario) => (
                <div key={scenario.id} className="scenario-card">
                  <div className="scenario-info">
                    <span className="scenario-name">{scenario.name}</span>
                    <span className="scenario-details">
                      {scenario.vus} VUs • {scenario.duration}
                    </span>
                  </div>
                  <button
                    className="run-btn"
                    onClick={() => runLoadTest(scenario.id)}
                    disabled={isRunning}
                  >
                    {isRunning ? '⏳' : '▶️'} Run
                  </button>
                </div>
              ))}
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
                    onClick={() => runUnitTests(suite.id)}
                    disabled={isRunning}
                  >
                    {isRunning ? '⏳' : '▶️'} Run
                  </button>
                </div>
              ))}
            </div>

            <button className="run-all-btn" disabled={isRunning}>
              🚀 Run All Unit Tests
            </button>
          </div>
        )}

        {/* E2E Tests Panel */}
        {activeTab === 'e2e' && (
          <div className="panel">
            <div className="panel-header">
              <h2>🎭 E2E Tests (Playwright)</h2>
              <p>End-to-end browser testing</p>
            </div>

            <div className="scenarios">
              <h3>Test Flows</h3>
              {e2eTestSuites.map((suite) => (
                <div key={suite.id} className="scenario-card">
                  <div className="scenario-info">
                    <span className="scenario-name">{suite.name}</span>
                    <span className="scenario-details">{suite.steps} steps</span>
                  </div>
                  <button
                    className="run-btn"
                    onClick={() => runE2ETests(suite.id)}
                    disabled={isRunning}
                  >
                    {isRunning ? '⏳' : '▶️'} Run
                  </button>
                </div>
              ))}
            </div>

            <button className="run-all-btn" disabled={isRunning}>
              🚀 Run All E2E Tests
            </button>
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
                  <div className="result-status">
                    {result.status === 'running' && '⏳'}
                    {result.status === 'passed' && '✅'}
                    {result.status === 'failed' && '❌'}
                    {result.status === 'pending' && '⏸️'}
                  </div>
                  <div className="result-info">
                    <span className="result-name">{result.name}</span>
                    <span className="result-message">{result.message}</span>
                  </div>
                  <div className="result-meta">
                    {result.duration && (
                      <span className="result-duration">{(result.duration / 1000).toFixed(1)}s</span>
                    )}
                    <span className="result-time">
                      {result.timestamp.toLocaleTimeString()}
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
