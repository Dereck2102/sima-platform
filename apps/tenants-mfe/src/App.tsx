import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

const API_URL = 'http://localhost:3000/api';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  maxUsers: number;
  maxAssets: number;
  createdAt: string;
  updatedAt: string;
}

interface TenantFormData {
  name: string;
  subdomain: string;
  plan: string;
  maxUsers: number;
  maxAssets: number;
}

const PLANS = ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'] as const;

const planColors: Record<string, string> = {
  FREE: '#64748b',
  BASIC: '#3b82f6',
  PREMIUM: '#8b5cf6',
  ENTERPRISE: '#f59e0b',
};

const planLimits: Record<string, { users: number; assets: number }> = {
  FREE: { users: 5, assets: 100 },
  BASIC: { users: 25, assets: 500 },
  PREMIUM: { users: 100, assets: 2000 },
  ENTERPRISE: { users: 9999, assets: 99999 },
};

const getAuthToken = () => localStorage.getItem('token') || '';

const getUserFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { role: payload.role };
  } catch {
    return null;
  }
};

const emptyForm: TenantFormData = {
  name: '',
  subdomain: '',
  plan: 'FREE',
  maxUsers: 5,
  maxAssets: 100,
};

function App() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<TenantFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const user = getUserFromToken();
  const isSuperAdmin = user?.role === 'super_admin';

  const fetchTenants = useCallback(async () => {
    if (!isSuperAdmin) {
      setError('Access denied. Super Admin privileges required.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/tenants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please login to manage tenants');
          return;
        }
        if (response.status === 403) {
          setError('Access denied. Super Admin required.');
          return;
        }
        throw new Error('Failed to fetch tenants');
      }

      const data = await response.json();
      setTenants(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to connect to tenant service');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // Modal functions
  const openCreateModal = () => {
    setFormData(emptyForm);
    setSelectedTenant(null);
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name,
      subdomain: tenant.subdomain,
      plan: tenant.plan,
      maxUsers: tenant.maxUsers,
      maxAssets: tenant.maxAssets,
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openViewModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setModalMode('view');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTenant(null);
    setFormData(emptyForm);
  };

  // Plan change handler
  const handlePlanChange = (plan: string) => {
    const limits = planLimits[plan] || planLimits.FREE;
    setFormData({
      ...formData,
      plan,
      maxUsers: limits.users,
      maxAssets: limits.assets,
    });
  };

  // CRUD operations
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/tenants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        closeModal();
        fetchTenants();
      } else {
        const err = await response.json();
        alert(`Error: ${err.message || 'Could not create tenant'}`);
      }
    } catch {
      alert('Error creating tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    setSaving(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/tenants/${selectedTenant.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        closeModal();
        fetchTenants();
      } else {
        const err = await response.json();
        alert(`Error: ${err.message || 'Could not update tenant'}`);
      }
    } catch {
      alert('Error updating tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete tenant "${name}"? This will delete ALL associated data.`)) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/tenants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchTenants();
      } else {
        alert('Error deleting tenant');
      }
    } catch {
      alert('Error deleting tenant');
    }
  };

  const toggleActive = async (tenant: Tenant) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !tenant.isActive }),
      });

      if (response.ok) {
        fetchTenants();
      }
    } catch {
      alert('Error toggling tenant status');
    }
  };

  // Filtering
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.subdomain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'ALL' || tenant.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  // Stats
  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.isActive).length,
    premium: tenants.filter(t => t.plan === 'PREMIUM' || t.plan === 'ENTERPRISE').length,
  };

  if (!isSuperAdmin) {
    return (
      <div className="mfe-container">
        <div className="access-denied">
          <span className="denied-icon">🚫</span>
          <h2>Access Denied</h2>
          <p>You need Super Admin privileges to access tenant management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mfe-container">
        <div className="loading">⏳ Loading tenants...</div>
      </div>
    );
  }

  return (
    <div className="mfe-container">
      <div className="mfe-header">
        <div className="header-left">
          <h1>🏢 Tenant Management</h1>
          <p className="subtitle">Super Admin • Manage organizations</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          + New Tenant
        </button>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={fetchTenants}>🔄 Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Tenants</span>
        </div>
        <div className="stat-card active">
          <span className="stat-value">{stats.active}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-card premium">
          <span className="stat-value">{stats.premium}</span>
          <span className="stat-label">Premium+</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by name or subdomain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="ALL">📊 All Plans</option>
          {PLANS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button onClick={fetchTenants} className="btn-refresh">🔄</button>
      </div>

      {/* Tenants Grid */}
      {filteredTenants.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏢</span>
          <p>No tenants found</p>
          <button className="btn-primary" onClick={openCreateModal}>Create first tenant</button>
        </div>
      ) : (
        <div className="tenants-grid">
          {filteredTenants.map((tenant) => (
            <div key={tenant.id} className={`tenant-card ${!tenant.isActive ? 'inactive' : ''}`}>
              <div className="tenant-header">
                <div className="tenant-status">
                  <span className={`status-dot ${tenant.isActive ? 'active' : 'inactive'}`} />
                  <span className="plan-badge" style={{ backgroundColor: planColors[tenant.plan] }}>
                    {tenant.plan}
                  </span>
                </div>
                <div className="tenant-actions">
                  <button className="btn-icon" title="Edit" onClick={() => openEditModal(tenant)}>✏️</button>
                  <button className="btn-icon" title={tenant.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleActive(tenant)}>
                    {tenant.isActive ? '🔒' : '🔓'}
                  </button>
                  <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(tenant.id, tenant.name)}>🗑️</button>
                </div>
              </div>
              <h3 className="tenant-name" onClick={() => openViewModal(tenant)}>{tenant.name}</h3>
              <p className="tenant-subdomain">{tenant.subdomain}.sima.app</p>
              <div className="tenant-limits">
                <span>👥 {tenant.maxUsers} users</span>
                <span>📦 {tenant.maxAssets} assets</span>
              </div>
              <div className="tenant-footer">
                <span className="tenant-date">Created {new Date(tenant.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {modalMode === 'view' && selectedTenant ? (
              <>
                <div className="modal-header">
                  <h2>🏢 Tenant Details</h2>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="tenant-detail-view">
                  <div className="detail-row">
                    <label>Name</label>
                    <span>{selectedTenant.name}</span>
                  </div>
                  <div className="detail-row">
                    <label>Subdomain</label>
                    <span>{selectedTenant.subdomain}.sima.app</span>
                  </div>
                  <div className="detail-row">
                    <label>Plan</label>
                    <span className="plan-badge" style={{ backgroundColor: planColors[selectedTenant.plan] }}>
                      {selectedTenant.plan}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Status</label>
                    <span className={selectedTenant.isActive ? 'text-green' : 'text-red'}>
                      {selectedTenant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Max Users</label>
                    <span>{selectedTenant.maxUsers}</span>
                  </div>
                  <div className="detail-row">
                    <label>Max Assets</label>
                    <span>{selectedTenant.maxAssets}</span>
                  </div>
                  <div className="detail-row">
                    <label>Created</label>
                    <span>{new Date(selectedTenant.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="modal-actions">
                    <button className="btn-primary" onClick={() => { setModalMode('edit'); setFormData({
                      name: selectedTenant.name,
                      subdomain: selectedTenant.subdomain,
                      plan: selectedTenant.plan,
                      maxUsers: selectedTenant.maxUsers,
                      maxAssets: selectedTenant.maxAssets,
                    }); }}>
                      ✏️ Edit
                    </button>
                    <button className="btn-secondary" onClick={closeModal}>Close</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="modal-header">
                  <h2>{modalMode === 'create' ? '➕ New Tenant' : '✏️ Edit Tenant'}</h2>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <form onSubmit={modalMode === 'create' ? handleCreate : handleUpdate}>
                  <div className="form-group">
                    <label>Organization Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Universidad Central del Ecuador"
                    />
                  </div>
                  <div className="form-group">
                    <label>Subdomain *</label>
                    <div className="subdomain-input">
                      <input
                        type="text"
                        required
                        value={formData.subdomain}
                        onChange={e => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                        placeholder="uce"
                        disabled={modalMode === 'edit'}
                      />
                      <span>.sima.app</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Plan *</label>
                    <select
                      value={formData.plan}
                      onChange={e => handlePlanChange(e.target.value)}
                    >
                      {PLANS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Max Users</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxUsers}
                        onChange={e => setFormData({...formData, maxUsers: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Max Assets</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxAssets}
                        onChange={e => setFormData({...formData, maxAssets: parseInt(e.target.value) || 1})}
                      />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={closeModal} disabled={saving}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? '⏳ Saving...' : (modalMode === 'create' ? 'Create Tenant' : 'Save Changes')}
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
