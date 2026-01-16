import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

const API_URL = 'http://localhost:3000/api';

interface DashboardStats {
  totalAssets: number;
  totalValue: number;
  activeAssets: number;
  inMaintenance: number;
}

interface Asset {
  id: string;
  name: string;
  status: string;
  price: number;
  createdAt: string;
}

const getAuthToken = () => localStorage.getItem('token') || '';

function App() {
  const [stats, setStats] = useState<DashboardStats>({ totalAssets: 0, totalValue: 0, activeAssets: 0, inMaintenance: 0 });
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/assets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please login to view dashboard');
          return;
        }
        throw new Error('Failed to fetch');
      }

      const assets: Asset[] = await response.json();
      
      // Calculate stats from assets
      const totalAssets = assets.length;
      const totalValue = assets.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      const activeAssets = assets.filter(a => a.status === 'ACTIVE').length;
      const inMaintenance = assets.filter(a => a.status === 'IN_MAINTENANCE').length;

      setStats({ totalAssets, totalValue, activeAssets, inMaintenance });
      setRecentAssets(assets.slice(0, 5)); // Last 5 assets
    } catch {
      setError('Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const metrics = [
    { title: 'Total Assets', value: stats.totalAssets, icon: '📦', color: '#3b82f6' },
    { title: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, icon: '💰', color: '#10b981' },
    { title: 'Active', value: stats.activeAssets, icon: '✅', color: '#8b5cf6' },
    { title: 'Maintenance', value: stats.inMaintenance, icon: '🔧', color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>📊 Dashboard</h1>
          <p className="subtitle">Real-time asset management overview</p>
        </div>
        <button className="btn-refresh" onClick={fetchDashboardData}>🔄 Refresh</button>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={fetchDashboardData}>🔄 Retry</button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-content">
              <span className="metric-title">{metric.title}</span>
              <span className="metric-value" style={{ color: metric.color }}>{metric.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="dashboard-grid">
        {/* Chart Placeholder */}
        <div className="chart-card">
          <h3>📈 Asset Status Distribution</h3>
          <div className="chart-placeholder">
            <div className="status-bars">
              <div className="status-bar">
                <span>Active</span>
                <div className="bar-container">
                  <div className="bar-fill active" style={{ width: `${stats.totalAssets > 0 ? (stats.activeAssets / stats.totalAssets) * 100 : 0}%` }} />
                </div>
                <span>{stats.activeAssets}</span>
              </div>
              <div className="status-bar">
                <span>Maintenance</span>
                <div className="bar-container">
                  <div className="bar-fill maintenance" style={{ width: `${stats.totalAssets > 0 ? (stats.inMaintenance / stats.totalAssets) * 100 : 0}%` }} />
                </div>
                <span>{stats.inMaintenance}</span>
              </div>
              <div className="status-bar">
                <span>Other</span>
                <div className="bar-container">
                  <div className="bar-fill other" style={{ width: `${stats.totalAssets > 0 ? ((stats.totalAssets - stats.activeAssets - stats.inMaintenance) / stats.totalAssets) * 100 : 0}%` }} />
                </div>
                <span>{stats.totalAssets - stats.activeAssets - stats.inMaintenance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assets */}
        <div className="categories-card">
          <h3>🆕 Recent Assets</h3>
          <div className="categories-list">
            {recentAssets.length === 0 ? (
              <p className="empty-message">No assets yet. Create your first asset!</p>
            ) : (
              recentAssets.map((asset) => (
                <div key={asset.id} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{asset.name}</span>
                    <span className="category-count">${Number(asset.price).toLocaleString()}</span>
                  </div>
                  <span className={`status-badge ${asset.status.toLowerCase()}`}>{asset.status}</span>
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
