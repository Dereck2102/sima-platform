import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';

export interface QATestMetrics {
  timestamp: string;
  passCount: number;
  failCount: number;
  totalTests: number;
  responseTime: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface QADashboardProps {
  apiEndpoint: string;
}

export const QADashboard: React.FC<QADashboardProps> = ({ apiEndpoint }) => {
  const [metrics, setMetrics] = useState<QATestMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<QATestMetrics | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedService, setSelectedService] = useState('all');

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [selectedService]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/qa/metrics?service=${selectedService}`);
      const data = await response.json();
      setCurrentMetrics(data);
      setMetrics((prev) => [...prev.slice(-59), data]);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const passPercentage = currentMetrics
    ? Math.round((currentMetrics.passCount / currentMetrics.totalTests) * 100)
    : 0;

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">SIMA Platform - QA Testing Dashboard</h1>
        <p className="text-slate-400">Real-time monitoring and testing metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Pass Rate */}
        <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-2">Pass Rate</p>
              <p className="text-3xl font-bold">{passPercentage}%</p>
            </div>
            <CheckCircle size={40} className="text-green-400" />
          </div>
        </div>

        {/* Total Tests */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-2">Total Tests</p>
              <p className="text-3xl font-bold">{currentMetrics?.totalTests || 0}</p>
            </div>
            <Activity size={40} className="text-blue-400" />
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm mb-2">Avg Response Time</p>
              <p className="text-3xl font-bold">{currentMetrics?.responseTime || 0}ms</p>
            </div>
            <Clock size={40} className="text-yellow-400" />
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-gradient-to-br from-red-900 to-red-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-sm mb-2">Error Rate</p>
              <p className="text-3xl font-bold">{currentMetrics?.errorRate || 0}%</p>
            </div>
            <AlertCircle size={40} className="text-red-400" />
          </div>
        </div>
      </div>

      {/* Service Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Service</label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full max-w-xs bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">All Services</option>
          <option value="api-gateway">API Gateway</option>
          <option value="auth-service">Auth Service</option>
          <option value="users-service">Users Service</option>
          <option value="assets-service">Assets Service</option>
          <option value="audit-service">Audit Service</option>
          <option value="iot-service">IoT Service</option>
          <option value="notifications-service">Notifications Service</option>
          <option value="reports-service">Reports Service</option>
          <option value="storage-service">Storage Service</option>
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Test Results Over Time */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Test Results Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Line type="monotone" dataKey="passCount" stroke="#22c55e" name="Passed" />
              <Line type="monotone" dataKey="failCount" stroke="#ef4444" name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Usage */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Resource Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.slice(-10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="cpuUsage" fill="#3b82f6" name="CPU %" />
              <Bar dataKey="memoryUsage" fill="#8b5cf6" name="Memory %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold mb-4">Test Controls</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRunning ? 'Stop Tests' : 'Start Tests'}
          </button>
          <button
            onClick={fetchMetrics}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Refresh Metrics
          </button>
          <button className="px-6 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg font-medium transition-colors">
            Export Report
          </button>
          <button className="px-6 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg font-medium transition-colors">
            Run Load Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default QADashboard;
