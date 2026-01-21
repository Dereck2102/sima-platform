import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

const ASSETS_API_URL = 'http://localhost:3000/api/assets';
const SEARCH_API_URL = 'http://localhost:3000/api/search/assets';

interface Asset {
  id: string;
  internalCode: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'IN_MAINTENANCE' | 'DECOMMISSIONED' | 'LOST';
  condition: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  price: number;
  tenantId: string;
  locationId?: string;
  custodianId?: string;
  acquisitionDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AssetFormData {
  internalCode: string;
  name: string;
  description: string;
  price: number;
  status: string;
  condition: string;
  locationId: string;
  custodianId: string;
  acquisitionDate: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const STATUSES = ['ACTIVE', 'IN_MAINTENANCE', 'DECOMMISSIONED', 'LOST'] as const;
const CONDITIONS = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'] as const;

const statusColors: Record<string, string> = {
  ACTIVE: '#10b981',
  IN_MAINTENANCE: '#f59e0b',
  DECOMMISSIONED: '#ef4444',
  LOST: '#6b7280',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  IN_MAINTENANCE: 'In Maintenance',
  DECOMMISSIONED: 'Decommissioned',
  LOST: 'Lost',
};

const conditionColors: Record<string, string> = {
  NEW: '#8b5cf6',
  EXCELLENT: '#10b981',
  GOOD: '#3b82f6',
  FAIR: '#f59e0b',
  POOR: '#ef4444',
};

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
};

const getAuthToken = () => localStorage.getItem('token') || '';

const getUserInfo = () => {
  const token = getAuthToken();
  if (!token) return { role: 'viewer', userId: null, tenantId: null };
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      role: payload.role || 'viewer',
      userId: payload.sub || payload.userId || null,
      tenantId: payload.tenantId || null,
    };
  } catch { return { role: 'viewer', userId: null, tenantId: null }; }
};

const getUserRole = () => getUserInfo().role;

const emptyForm: AssetFormData = {
  internalCode: '',
  name: '',
  description: '',
  price: 0,
  status: 'ACTIVE',
  condition: 'NEW',
  locationId: '',
  custodianId: '',
  acquisitionDate: new Date().toISOString().split('T')[0],
};

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<AssetFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const userRole = getUserRole();
  const canEdit = ['super_admin', 'admin', 'operator'].includes(userRole);
  const canDelete = ['super_admin', 'admin'].includes(userRole);
  const canCreate = ['super_admin', 'admin', 'operator'].includes(userRole);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      
      // Build Query Params for Server-Side Search
      const params = new URLSearchParams();
      if (searchTerm) params.append('query', searchTerm);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (conditionFilter !== 'ALL') params.append('condition', conditionFilter);
      params.append('page', page.toString());
      params.append('limit', '8'); // 8 items per page for grid view

      const response = await fetch(`${SEARCH_API_URL}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('No autenticado. Por favor inicie sesión.');
          setAssets([]);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      // Helper to handle both structure types if necessary, but expecting { data, meta }
      if (result.data && Array.isArray(result.data)) {
         setAssets(result.data);
         setMeta(result.meta);
      } else if (Array.isArray(result)) {
         // Fallback if endpoint returns just array (shouldn't happen with SearchController)
         setAssets(result);
         setMeta(null);
      } else {
         setAssets([]);
      }

    } catch (e) {
      console.error(e);
      setError('No se puede conectar al servidor. Verifique que el backend esté corriendo.');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, conditionFilter, page]);

  useEffect(() => {
    // Debounce search to avoid too many requests
    const timer = setTimeout(() => {
      fetchAssets();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchAssets]);

  // Open modal functions
  const openCreateModal = () => {
    setFormData(emptyForm);
    setSelectedAsset(null);
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData({
      internalCode: asset.internalCode,
      name: asset.name,
      description: asset.description || '',
      price: asset.price,
      status: asset.status,
      condition: asset.condition,
      locationId: asset.locationId || '',
      custodianId: asset.custodianId || '',
      acquisitionDate: asset.acquisitionDate?.split('T')[0] || '',
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openViewModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setModalMode('view');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
    setFormData(emptyForm);
  };

  // CRUD operations use ASSETS_API_URL
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getAuthToken();
      const response = await fetch(ASSETS_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        closeModal();
        fetchAssets();
      } else {
        const err = await response.json();
        alert(`Error: ${err.message || 'Could not create asset'}`);
      }
    } catch {
      alert('Error creating asset');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setSaving(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${ASSETS_API_URL}/${selectedAsset.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        closeModal();
        fetchAssets();
      } else {
        const err = await response.json();
        alert(`Error: ${err.message || 'Could not update asset'}`);
      }
    } catch {
      alert('Error updating asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${ASSETS_API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        fetchAssets();
      } else {
        alert('Error deleting asset');
      }
    } catch {
      alert('Error deleting asset');
    }
  };

  // Stats calculation - Note: With server-side pagination, 
  // we can only show stats for the *current page* or we need a separate stats endpoint.
  // For now, we'll just sum the current page (limitation of search endpoint not returning aggregation).
  const totalValue = assets.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const activeCount = assets.filter(a => a.status === 'ACTIVE').length;
  const maintenanceCount = assets.filter(a => a.status === 'IN_MAINTENANCE').length;

  return (
    <div className="mfe-container">
      <div className="mfe-header">
        <div className="header-left">
          <h1>📦 Asset Management</h1>
          <p className="subtitle">
            Server-Side Search & Pagination • Role: <strong>{userRole}</strong>
          </p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={openCreateModal}>
            + New Asset
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={fetchAssets}>🔄 Retry</button>
        </div>
      )}

      {/* Stats - Contextual to current view */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{meta?.total || 0}</span>
          <span className="stat-label">Total Results</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">${totalValue.toLocaleString()}</span>
          <span className="stat-label">Value (Page)</span>
        </div>
        <div className="stat-card active">
          <span className="stat-value">{activeCount}</span>
          <span className="stat-label">Active (Page)</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-value">{maintenanceCount}</span>
          <span className="stat-label">Maint. (Page)</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search backend (name, code)..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="ALL">📊 All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={conditionFilter}
          onChange={(e) => { setConditionFilter(e.target.value); setPage(1); }}
        >
          <option value="ALL">🔧 All Conditions</option>
          {CONDITIONS.map(c => (
            <option key={c} value={c}>{conditionLabels[c]}</option>
          ))}
        </select>
        <button onClick={fetchAssets} className="btn-refresh">🔄</button>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="loading-skeleton">
          <div className="skeleton-grid">
             {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
          </div>
          <p style={{textAlign: 'center', marginTop: 20}}>Searching backend...</p>
        </div>
      ) : assets.length === 0 && !error ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No assets found</p>
          {canCreate && <button className="btn-primary" onClick={openCreateModal}>Create first asset</button>}
        </div>
      ) : (
        <>
          <div className="assets-grid">
            {assets.map((asset) => (
              <div key={asset.id} className="asset-card" onClick={() => openViewModal(asset)}>
                <div className="asset-header">
                  <span className="asset-code">{asset.internalCode}</span>
                  <span className="status-badge" style={{ backgroundColor: statusColors[asset.status] }}>
                    {statusLabels[asset.status]}
                  </span>
                </div>
                <h3 className="asset-name">{asset.name}</h3>
                {asset.description && <p className="asset-description">{asset.description}</p>}
                <div className="asset-details">
                  <div className="detail-row">
                    <span className="detail-label">Condition:</span>
                    <span className="condition-badge" style={{ color: conditionColors[asset.condition] }}>
                      {conditionLabels[asset.condition]}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Value:</span>
                    <span className="detail-value">${Number(asset.price).toLocaleString()}</span>
                  </div>
                </div>
                <div className="asset-actions" onClick={e => e.stopPropagation()}>
                  {canEdit && <button className="btn-icon" title="Edit" onClick={() => openEditModal(asset)}>✏️</button>}
                  <button className="btn-icon" title="View Details" onClick={() => openViewModal(asset)}>👁️</button>
                  {canDelete && <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(asset.id, asset.name)}>🗑️</button>}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {meta && (
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', alignItems: 'center' }}>
              <button 
                className="btn-secondary" 
                disabled={!meta.hasPrevPage}
                onClick={() => setPage(p => p - 1)}
              >
                ← Previous
              </button>
              <span style={{ fontWeight: 'bold' }}>
                Page {meta.page} of {meta.totalPages} ({meta.total} items)
              </span>
              <button 
                className="btn-secondary" 
                disabled={!meta.hasNextPage}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            {modalMode === 'view' && selectedAsset ? (
              // View Mode
              <>
                <div className="modal-header">
                  <h2>📋 Asset Details</h2>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="asset-detail-view">
                  <div className="detail-header">
                    <div className="detail-title">
                      <span className="asset-code-large">{selectedAsset.internalCode}</span>
                      <h3>{selectedAsset.name}</h3>
                    </div>
                    <span className="status-badge large" style={{ backgroundColor: statusColors[selectedAsset.status] }}>
                      {statusLabels[selectedAsset.status]}
                    </span>
                  </div>
                  
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Description</label>
                      <p>{selectedAsset.description || 'No description'}</p>
                    </div>
                    <div className="detail-item">
                      <label>Condition</label>
                      <span style={{ color: conditionColors[selectedAsset.condition], fontWeight: 600 }}>
                        {conditionLabels[selectedAsset.condition]}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Value</label>
                      <span className="price-large">${Number(selectedAsset.price).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <label>Location</label>
                      <span>{selectedAsset.locationId || 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Custodian</label>
                      <span>{selectedAsset.custodianId || 'Not assigned'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Acquisition Date</label>
                      <span>{selectedAsset.acquisitionDate ? new Date(selectedAsset.acquisitionDate).toLocaleDateString() : 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Tenant ID</label>
                      <span className="tenant-id">{selectedAsset.tenantId}</span>
                    </div>
                    <div className="detail-item">
                      <label>System ID</label>
                      <span className="system-id">{selectedAsset.id}</span>
                    </div>
                  </div>

                  <div className="modal-actions">
                    {canEdit && (
                      <button className="btn-primary" onClick={() => { setModalMode('edit'); setFormData({
                        internalCode: selectedAsset.internalCode,
                        name: selectedAsset.name,
                        description: selectedAsset.description || '',
                        price: selectedAsset.price,
                        status: selectedAsset.status,
                        condition: selectedAsset.condition,
                        locationId: selectedAsset.locationId || '',
                        custodianId: selectedAsset.custodianId || '',
                        acquisitionDate: selectedAsset.acquisitionDate?.split('T')[0] || '',
                      }); }}>
                        ✏️ Edit
                      </button>
                    )}
                    <button className="btn-secondary" onClick={closeModal}>Close</button>
                  </div>
                </div>
              </>
            ) : (
              // Create/Edit Mode
              <>
                <div className="modal-header">
                  <h2>{modalMode === 'create' ? '➕ New Asset' : '✏️ Edit Asset'}</h2>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <form onSubmit={modalMode === 'create' ? handleCreate : handleUpdate}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Internal Code *</label>
                      <input
                        type="text"
                        required
                        value={formData.internalCode}
                        onChange={e => setFormData({...formData, internalCode: e.target.value})}
                        placeholder="e.g., LAP-001"
                        disabled={modalMode === 'edit'}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Dell Laptop XPS 15"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Optional asset description"
                        rows={3}
                      />
                    </div>
                    <div className="form-group">
                      <label>Status *</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Condition *</label>
                      <select
                        value={formData.condition}
                        onChange={e => setFormData({...formData, condition: e.target.value})}
                      >
                        {CONDITIONS.map(c => (
                          <option key={c} value={c}>{conditionLabels[c]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Value ($) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Acquisition Date</label>
                      <input
                        type="date"
                        value={formData.acquisitionDate}
                        onChange={e => setFormData({...formData, acquisitionDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={formData.locationId}
                        onChange={e => setFormData({...formData, locationId: e.target.value})}
                        placeholder="e.g., Office 301"
                      />
                    </div>
                    <div className="form-group">
                      <label>Custodian</label>
                      <input
                        type="text"
                        value={formData.custodianId}
                        onChange={e => setFormData({...formData, custodianId: e.target.value})}
                        placeholder="e.g., John Doe"
                      />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={closeModal} disabled={saving}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? '⏳ Saving...' : (modalMode === 'create' ? 'Create Asset' : 'Save Changes')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
