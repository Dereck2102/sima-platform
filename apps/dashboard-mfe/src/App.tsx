import React from 'react';
import './styles.css';

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

const metrics: MetricCard[] = [
  { title: 'Total Assets', value: '2,847', change: '+12.5%', changeType: 'positive', icon: '📦' },
  { title: 'Total Value', value: '$1.2M', change: '+8.2%', changeType: 'positive', icon: '💰' },
  { title: 'Active Users', value: '156', change: '+3.1%', changeType: 'positive', icon: '👥' },
  { title: 'Pending Tasks', value: '23', change: '-5.4%', changeType: 'negative', icon: '📋' },
];

const recentActivity = [
  { id: 1, action: 'Asset added', asset: 'MacBook Pro 16"', user: 'John Doe', time: '2 min ago' },
  { id: 2, action: 'Status changed', asset: 'Dell Monitor', user: 'Jane Smith', time: '15 min ago' },
  { id: 3, action: 'Maintenance scheduled', asset: 'HP Printer', user: 'Admin', time: '1 hour ago' },
  { id: 4, action: 'Asset retired', asset: 'Old Server', user: 'IT Team', time: '3 hours ago' },
];

const assetsByCategory = [
  { category: 'Electronics', count: 1245, percentage: 44 },
  { category: 'Furniture', count: 856, percentage: 30 },
  { category: 'Vehicles', count: 423, percentage: 15 },
  { category: 'Equipment', count: 323, percentage: 11 },
];

function App() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>📊 Dashboard</h1>
          <p className="subtitle">Overview of your asset management</p>
        </div>
        <div className="date-range">
          <span>📅 Last 30 days</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-content">
              <span className="metric-title">{metric.title}</span>
              <span className="metric-value">{metric.value}</span>
              <span className={`metric-change ${metric.changeType}`}>
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="dashboard-grid">
        {/* Chart Placeholder */}
        <div className="chart-card">
          <h3>Asset Value Trend</h3>
          <div className="chart-placeholder">
            <div className="chart-bars">
              {[65, 45, 75, 55, 85, 70, 90].map((height, i) => (
                <div
                  key={i}
                  className="chart-bar"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="chart-labels">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="categories-card">
          <h3>Assets by Category</h3>
          <div className="categories-list">
            {assetsByCategory.map((item, index) => (
              <div key={index} className="category-item">
                <div className="category-info">
                  <span className="category-name">{item.category}</span>
                  <span className="category-count">{item.count} items</span>
                </div>
                <div className="category-bar">
                  <div
                    className="category-fill"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-card">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((item) => (
            <div key={item.id} className="activity-item">
              <div className="activity-dot" />
              <div className="activity-content">
                <span className="activity-action">{item.action}</span>
                <span className="activity-asset">{item.asset}</span>
              </div>
              <div className="activity-meta">
                <span className="activity-user">{item.user}</span>
                <span className="activity-time">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
