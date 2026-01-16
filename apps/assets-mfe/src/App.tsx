import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

const API_URL = 'http://localhost:3000/api/assets';

interface Asset {
  id: string;
  internalCode: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'IN_MAINTENANCE' | 'DECOMMISSIONED';
  condition: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  price: number;
  tenantId: string;
  locationId?: string;
  acquisitionDate?: string;
}

interface CreateAssetDto {
  internalCode: string;
  name: string;
  description?: string;
  price: number;
  status?: string;
  condition?: string;
  locationId: string;
  acquisitionDate: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: '#10b981',
  IN_MAINTENANCE: '#f59e0b',
  DECOMMISSIONED: '#ef4444',
};

const conditionColors: Record<string, string> = {
  NEW: '#8b5cf6',
  EXCELLENT: '#10b981',
  GOOD: '#3b82f6',
  FAIR: '#f59e0b',
  POOR: '#ef4444',
};

// Get token from localStorage (set by login)
const getAuthToken = () => localStorage.getItem('token') || '';

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAsset, setNewAsset] = useState<CreateAssetDto>({
    internalCode: '',
    name: '',
    description: '',
    price: 0,
    status: 'ACTIVE',
    condition: 'NEW',
    locationId: 'LOC-001',
    acquisitionDate: new Date().toISOString().split('T')[0],
  });

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Not authenticated. Please login first.');
          setAssets([]);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Unable to connect to server. Make sure backend is running.');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAsset),
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setNewAsset({
          internalCode: '',
          name: '',
          description: '',
          price: 0,
          status: 'ACTIVE',
          condition: 'NEW',
          locationId: 'LOC-001',
          acquisitionDate: new Date().toISOString().split('T')[0],
        });
        fetchAssets();
      } else {
        const err = await response.json();
        alert(`Error: ${err.message || 'Failed to create asset'}`);
      }
    } catch (err) {
      alert('Failed to create asset');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        fetchAssets();
      } else {
        alert('Failed to delete asset');
      }
    } catch (err) {
      alert('Failed to delete asset');
    }
  };

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.internalCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = filteredAssets.reduce((sum, asset) => sum + (Number(asset.price) || 0), 0);

  if (loading) {
    return (
      <div className="mfe-container">
        <div className="loading">⏳ Loading assets from server...</div>
      </div>
    );
  }

  return (
    <div className="mfe-container">
      <div className="mfe-header">
        <div className="header-left">
          <h1>📦 Asset Management</h1>
          <p className="subtitle">Connected to real backend API</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Add Asset
        </button>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={fetchAssets} style={{ marginLeft: '1rem' }}>🔄 Retry</button>
        </div>
      )}

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
        <button onClick={fetchAssets} className="btn-refresh">🔄 Refresh</button>
      </div>

      {filteredAssets.length === 0 && !error ? (
        <div className="empty-state">
          <p>📭 No assets found. Create your first asset!</p>
        </div>
      ) : (
        <div className="assets-grid">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="asset-card">
              <div className="asset-header">
                <span className="asset-code">{asset.internalCode}</span>
                <span
                  className="status-badge"
                  style={{ backgroundColor: statusColors[asset.status] || '#666' }}
                >
                  {asset.status}
                </span>
              </div>
              <h3 className="asset-name">{asset.name}</h3>
              {asset.description && <p className="asset-description">{asset.description}</p>}
              <div className="asset-details">
                <div className="detail-row">
                  <span className="detail-label">Condition:</span>
                  <span
                    className="condition-badge"
                    style={{ color: conditionColors[asset.condition] || '#666' }}
                  >
                    {asset.condition}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Value:</span>
                  <span className="detail-value">${Number(asset.price).toLocaleString()}</span>
                </div>
              </div>
              <div className="asset-actions">
                <button className="btn-icon" title="Edit">✏️</button>
                <button className="btn-icon" title="View">👁️</button>
                <button className="btn-icon" title="Delete" onClick={() => handleDeleteAsset(asset.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Asset Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>➕ Create New Asset</h2>
            <form onSubmit={handleCreateAsset}>
              <div className="form-group">
                <label>Internal Code *</label>
                <input
                  type="text"
                  required
                  value={newAsset.internalCode}
                  onChange={e => setNewAsset({...newAsset, internalCode: e.target.value})}
                  placeholder="e.g., LAP-001"
                />
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={newAsset.name}
                  onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                  placeholder="e.g., Dell Laptop"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newAsset.description}
                  onChange={e => setNewAsset({...newAsset, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newAsset.price}
                  onChange={e => setNewAsset({...newAsset, price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Acquisition Date *</label>
                <input
                  type="date"
                  required
                  value={newAsset.acquisitionDate}
                  onChange={e => setNewAsset({...newAsset, acquisitionDate: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
