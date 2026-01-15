import React, { useState, useEffect } from 'react';
import './styles.css';

interface Asset {
  id: string;
  internalCode: string;
  name: string;
  status: 'ACTIVE' | 'IN_MAINTENANCE' | 'RETIRED';
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  price: number;
}

// Mock data for demonstration
const mockAssets: Asset[] = [
  { id: '1', internalCode: 'LAP-001', name: 'Dell Latitude 7490', status: 'ACTIVE', condition: 'EXCELLENT', price: 1500 },
  { id: '2', internalCode: 'MON-001', name: 'LG Monitor 27"', status: 'ACTIVE', condition: 'GOOD', price: 450 },
  { id: '3', internalCode: 'PRN-001', name: 'HP LaserJet Pro', status: 'IN_MAINTENANCE', condition: 'FAIR', price: 800 },
  { id: '4', internalCode: 'DSK-001', name: 'Standing Desk', status: 'ACTIVE', condition: 'EXCELLENT', price: 650 },
  { id: '5', internalCode: 'CAM-001', name: 'Security Camera', status: 'RETIRED', condition: 'POOR', price: 200 },
];

const statusColors: Record<string, string> = {
  ACTIVE: '#10b981',
  IN_MAINTENANCE: '#f59e0b',
  RETIRED: '#ef4444',
};

const conditionColors: Record<string, string> = {
  EXCELLENT: '#10b981',
  GOOD: '#3b82f6',
  FAIR: '#f59e0b',
  POOR: '#ef4444',
};

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAssets(mockAssets);
      setLoading(false);
    }, 500);
  }, []);

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.internalCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.price, 0);

  if (loading) {
    return (
      <div className="mfe-container">
        <div className="loading">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="mfe-container">
      <div className="mfe-header">
        <div className="header-left">
          <h1>📦 Asset Management</h1>
          <p className="subtitle">Manage your organization's fixed assets</p>
        </div>
        <button className="btn-primary">+ Add Asset</button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{filteredAssets.length}</span>
          <span className="stat-label">Total Assets</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">${totalValue.toLocaleString()}</span>
          <span className="stat-label">Total Value</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{filteredAssets.filter(a => a.status === 'ACTIVE').length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{filteredAssets.filter(a => a.status === 'IN_MAINTENANCE').length}</span>
          <span className="stat-label">In Maintenance</span>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="assets-grid">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="asset-card">
            <div className="asset-header">
              <span className="asset-code">{asset.internalCode}</span>
              <span
                className="status-badge"
                style={{ backgroundColor: statusColors[asset.status] }}
              >
                {asset.status}
              </span>
            </div>
            <h3 className="asset-name">{asset.name}</h3>
            <div className="asset-details">
              <div className="detail-row">
                <span className="detail-label">Condition:</span>
                <span
                  className="condition-badge"
                  style={{ color: conditionColors[asset.condition] }}
                >
                  {asset.condition}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Value:</span>
                <span className="detail-value">${asset.price.toLocaleString()}</span>
              </div>
            </div>
            <div className="asset-actions">
              <button className="btn-icon" title="Edit">✏️</button>
              <button className="btn-icon" title="View">👁️</button>
              <button className="btn-icon" title="Delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
