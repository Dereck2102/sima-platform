import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

const API_URL = 'http://localhost:3000/api';

// Types
interface DashboardStats {
  totalAssets: number;
  totalValue: number;
  activeAssets: number;
  inMaintenance: number;
  decommissioned: number;
}

interface Asset {
  id: string;
  name: string;
  internalCode: string;
  status: string;
  price: number;
  custodianId?: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  userId: string;
  timestamp: string;
}

// Helpers
const getAuthToken = () => localStorage.getItem('token') || '';

const getUserFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      email: payload.email,
      fullName: payload.fullName || payload.email?.split('@')[0],
      role: payload.role || 'viewer',
      tenantId: payload.tenantId,
    };
  } catch {
    return null;
  }
};

// Role constants
const ROLE_SUPER_ADMIN = 'super_admin';
const ROLE_ADMIN = 'admin';

// ============== SUPER ADMIN DASHBOARD ==============
const SuperAdminDashboard = ({ 
  stats, tenants, users, auditLogs, onRefresh 
}: { 
  stats: DashboardStats;
  tenants: Tenant[];
  users: User[];
  auditLogs: AuditLog[];
  onRefresh: () => void;
}) => (
  <div className="dashboard-role super-admin">
    <div className="dashboard-header">
      <div>
        <h1>👑 Super Admin Dashboard</h1>
        <p className="subtitle">Global system overview and management</p>
      </div>
      <button className="btn-refresh" onClick={onRefresh}>🔄 Refresh</button>
    </div>

    {/* Global Metrics */}
    <div className="metrics-grid super-admin-metrics">
      <div className="metric-card gradient-blue">
        <div className="metric-icon">🏢</div>
        <div className="metric-content">
          <span className="metric-value">{tenants.length}</span>
          <span className="metric-title">Total Tenants</span>
        </div>
      </div>
      <div className="metric-card gradient-purple">
        <div className="metric-icon">👥</div>
        <div className="metric-content">
          <span className="metric-value">{users.length}</span>
          <span className="metric-title">Total Users</span>
        </div>
      </div>
      <div className="metric-card gradient-green">
        <div className="metric-icon">📦</div>
        <div className="metric-content">
          <span className="metric-value">{stats.totalAssets}</span>
          <span className="metric-title">Total Assets</span>
        </div>
      </div>
      <div className="metric-card gradient-gold">
        <div className="metric-icon">💰</div>
        <div className="metric-content">
          <span className="metric-value">${stats.totalValue.toLocaleString()}</span>
          <span className="metric-title">Total Value</span>
        </div>
      </div>
    </div>

    {/* Admin Panels Grid */}
    <div className="admin-panels">
      {/* Tenants Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <h3>🏢 Tenants</h3>
          <button className="btn-small">+ Add</button>
        </div>
        <div className="panel-list">
          {tenants.length === 0 ? (
            <p className="empty">No tenants registered</p>
          ) : (
            tenants.slice(0, 5).map(t => (
              <div key={t.id} className="list-item">
                <span className="item-name">{t.name}</span>
                <span className={`status-dot ${t.isActive ? 'active' : 'inactive'}`} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Users Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <h3>👥 Users</h3>
          <span className="badge">{users.filter(u => u.isActive).length} active</span>
        </div>
        <div className="panel-list">
          {users.slice(0, 5).map(u => (
            <div key={u.id} className="list-item">
              <div className="user-info">
                <span className="item-name">{u.fullName || u.email}</span>
                <span className="role-badge">{u.role}</span>
              </div>
              <span className={`status-dot ${u.isActive ? 'active' : 'inactive'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs Panel */}
      <div className="panel-card full-width">
        <div className="panel-header">
          <h3>📋 Recent Audit Logs</h3>
          <button className="btn-small">View All</button>
        </div>
        <div className="audit-list">
          {auditLogs.length === 0 ? (
            <p className="empty">No audit logs available</p>
          ) : (
            auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="audit-item">
                <span className="audit-action">{log.action}</span>
                <span className="audit-entity">{log.entity}</span>
                <span className="audit-time">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    {/* Asset Status Overview */}
    <div className="status-overview">
      <h3>📊 Asset Status Distribution</h3>
      <div className="status-bars">
        <div className="status-row">
          <span className="label">Active</span>
          <div className="bar-container">
            <div className="bar-fill active" style={{ width: `${stats.totalAssets > 0 ? (stats.activeAssets / stats.totalAssets) * 100 : 0}%` }} />
          </div>
          <span className="count">{stats.activeAssets}</span>
        </div>
        <div className="status-row">
          <span className="label">Maintenance</span>
          <div className="bar-container">
            <div className="bar-fill maintenance" style={{ width: `${stats.totalAssets > 0 ? (stats.inMaintenance / stats.totalAssets) * 100 : 0}%` }} />
          </div>
          <span className="count">{stats.inMaintenance}</span>
        </div>
        <div className="status-row">
          <span className="label">Decommissioned</span>
          <div className="bar-container">
            <div className="bar-fill decommissioned" style={{ width: `${stats.totalAssets > 0 ? (stats.decommissioned / stats.totalAssets) * 100 : 0}%` }} />
          </div>
          <span className="count">{stats.decommissioned}</span>
        </div>
      </div>
    </div>
  </div>
);

// ============== ADMIN DASHBOARD ==============
const AdminDashboard = ({ 
  stats, users, recentAssets, onRefresh 
}: { 
  stats: DashboardStats;
  users: User[];
  recentAssets: Asset[];
  onRefresh: () => void;
}) => (
  <div className="dashboard-role admin">
    <div className="dashboard-header">
      <div>
        <h1>🔑 Admin Dashboard</h1>
        <p className="subtitle">Tenant management and asset overview</p>
      </div>
      <button className="btn-refresh" onClick={onRefresh}>🔄 Refresh</button>
    </div>

    {/* Metrics */}
    <div className="metrics-grid">
      <div className="metric-card gradient-blue">
        <div className="metric-icon">📦</div>
        <div className="metric-content">
          <span className="metric-value">{stats.totalAssets}</span>
          <span className="metric-title">Total Assets</span>
        </div>
      </div>
      <div className="metric-card gradient-green">
        <div className="metric-icon">💰</div>
        <div className="metric-content">
          <span className="metric-value">${stats.totalValue.toLocaleString()}</span>
          <span className="metric-title">Total Value</span>
        </div>
      </div>
      <div className="metric-card gradient-purple">
        <div className="metric-icon">👥</div>
        <div className="metric-content">
          <span className="metric-value">{users.length}</span>
          <span className="metric-title">Tenant Users</span>
        </div>
      </div>
      <div className="metric-card gradient-orange">
        <div className="metric-icon">🔧</div>
        <div className="metric-content">
          <span className="metric-value">{stats.inMaintenance}</span>
          <span className="metric-title">In Maintenance</span>
        </div>
      </div>
    </div>

    {/* Content Grid */}
    <div className="dashboard-grid">
      {/* Users Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <h3>👥 Tenant Users</h3>
          <button className="btn-small">+ Add User</button>
        </div>
        <div className="panel-list">
          {users.map(u => (
            <div key={u.id} className="list-item">
              <div className="user-info">
                <span className="item-name">{u.fullName || u.email}</span>
                <span className="role-badge">{u.role}</span>
              </div>
              <div className="item-actions">
                <button className="btn-icon" title="Edit">✏️</button>
                <button className="btn-icon" title="Deactivate">🚫</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assets */}
      <div className="panel-card">
        <div className="panel-header">
          <h3>📦 Recent Assets</h3>
          <button className="btn-small">View All</button>
        </div>
        <div className="panel-list">
          {recentAssets.map(asset => (
            <div key={asset.id} className="list-item">
              <div className="asset-info">
                <span className="item-name">{asset.name}</span>
                <span className="item-code">{asset.internalCode}</span>
              </div>
              <span className={`status-badge ${asset.status.toLowerCase()}`}>{asset.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="quick-actions">
      <h3>⚡ Quick Actions</h3>
      <div className="actions-grid">
        <button className="action-btn">📦 New Asset</button>
        <button className="action-btn">👤 Add User</button>
        <button className="action-btn">📊 Generate Report</button>
        <button className="action-btn">📤 Export Data</button>
      </div>
    </div>
  </div>
);

// ============== USER DASHBOARD ==============
const UserDashboard = ({ 
  myAssets, userName, onRefresh 
}: { 
  myAssets: Asset[];
  userName: string;
  onRefresh: () => void;
}) => {
  const totalValue = myAssets.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  
  return (
    <div className="dashboard-role user">
      <div className="dashboard-header">
        <div>
          <h1>👤 My Dashboard</h1>
          <p className="subtitle">Welcome, {userName}! Here are your assigned assets.</p>
        </div>
        <button className="btn-refresh" onClick={onRefresh}>🔄 Refresh</button>
      </div>

      {/* User Metrics */}
      <div className="metrics-grid user-metrics">
        <div className="metric-card gradient-blue">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <span className="metric-value">{myAssets.length}</span>
            <span className="metric-title">My Assets</span>
          </div>
        </div>
        <div className="metric-card gradient-green">
          <div className="metric-icon">💼</div>
          <div className="metric-content">
            <span className="metric-value">${totalValue.toLocaleString()}</span>
            <span className="metric-title">Total Value</span>
          </div>
        </div>
        <div className="metric-card gradient-purple">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <span className="metric-value">{myAssets.filter(a => a.status === 'ACTIVE').length}</span>
            <span className="metric-title">Active</span>
          </div>
        </div>
      </div>

      {/* My Assets List */}
      <div className="my-assets-section">
        <h3>📋 My Assigned Assets</h3>
        {myAssets.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No assets assigned to you yet.</p>
            <p className="hint">Contact your administrator to get assets assigned.</p>
          </div>
        ) : (
          <div className="assets-grid">
            {myAssets.map(asset => (
              <div key={asset.id} className="asset-card user-asset">
                <div className="asset-header">
                  <span className="asset-code">{asset.internalCode}</span>
                  <span className={`status-badge ${asset.status.toLowerCase()}`}>{asset.status}</span>
                </div>
                <h4 className="asset-name">{asset.name}</h4>
                <div className="asset-footer">
                  <span className="asset-price">${Number(asset.price).toLocaleString()}</span>
                  <button className="btn-view">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============== MAIN APP ==============
function App() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0, totalValue: 0, activeAssets: 0, inMaintenance: 0, decommissioned: 0
  });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = getUserFromToken();
  const userRole = currentUser?.role || 'viewer';
  const isSuperAdmin = userRole === ROLE_SUPER_ADMIN;
  const isAdmin = userRole === ROLE_ADMIN || isSuperAdmin;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    try {
      // Fetch assets
      const assetsRes = await fetch(`${API_URL}/assets`, { headers });
      if (assetsRes.ok) {
        const assetsData: Asset[] = await assetsRes.json();
        setAssets(assetsData);
        
        // Calculate stats
        setStats({
          totalAssets: assetsData.length,
          totalValue: assetsData.reduce((sum, a) => sum + (Number(a.price) || 0), 0),
          activeAssets: assetsData.filter(a => a.status === 'ACTIVE').length,
          inMaintenance: assetsData.filter(a => a.status === 'IN_MAINTENANCE').length,
          decommissioned: assetsData.filter(a => a.status === 'DECOMMISSIONED').length,
        });
      }

      // Fetch users (admin+ only)
      if (isAdmin) {
        try {
          const usersRes = await fetch(`${API_URL}/auth/users`, { headers });
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setUsers(Array.isArray(usersData) ? usersData : []);
          }
        } catch { /* Users endpoint might not exist */ }
      }

      // Fetch tenants (super admin only)
      if (isSuperAdmin) {
        try {
          const tenantsRes = await fetch(`${API_URL}/tenants`, { headers });
          if (tenantsRes.ok) {
            const tenantsData = await tenantsRes.json();
            setTenants(Array.isArray(tenantsData) ? tenantsData : []);
          }
        } catch { /* Tenants endpoint might not exist */ }

        // Fetch audit logs
        try {
          const auditRes = await fetch(`${API_URL}/audit/logs`, { headers });
          if (auditRes.ok) {
            const auditData = await auditRes.json();
            setAuditLogs(Array.isArray(auditData) ? auditData : []);
          }
        } catch { /* Audit endpoint might not exist */ }
      }
    } catch {
      setError('Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isSuperAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter assets for regular users (only their assigned assets)
  const myAssets = !isAdmin 
    ? assets.filter(a => a.custodianId === currentUser?.id)
    : assets;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-skeleton">
          <div className="skeleton-header" />
          <div className="skeleton-metrics">
            <div className="skeleton-card" /><div className="skeleton-card" />
            <div className="skeleton-card" /><div className="skeleton-card" />
          </div>
          <div className="skeleton-content" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={fetchData}>🔄 Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {isSuperAdmin ? (
        <SuperAdminDashboard 
          stats={stats}
          tenants={tenants}
          users={users}
          auditLogs={auditLogs}
          onRefresh={fetchData}
        />
      ) : isAdmin ? (
        <AdminDashboard 
          stats={stats}
          users={users}
          recentAssets={assets.slice(0, 10)}
          onRefresh={fetchData}
        />
      ) : (
        <UserDashboard 
          myAssets={myAssets}
          userName={currentUser?.fullName || 'User'}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}

export default App;
