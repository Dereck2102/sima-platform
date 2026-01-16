import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

const API_URL = 'http://localhost:3000/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  super_admin: '#ef4444',
  admin: '#8b5cf6',
  auditor: '#f59e0b',
  operator: '#3b82f6',
  viewer: '#94a3b8',
};

const getAuthToken = () => localStorage.getItem('token') || '';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please login to view users');
          return;
        }
        if (response.status === 403) {
          setError('You need admin privileges to view users');
          return;
        }
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      // If endpoint doesn't exist yet, show current user from token
      const token = getAuthToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUsers([{
            id: payload.sub,
            email: payload.email,
            fullName: payload.email.split('@')[0],
            role: payload.role,
            isActive: true,
            tenantId: payload.tenantId,
            createdAt: new Date().toISOString(),
          }]);
          setError('User list endpoint not available. Showing current user.');
        } catch {
          setError('Unable to load users');
        }
      } else {
        setError('Unable to load users');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter((u) => u.role === 'super_admin' || u.role === 'admin').length,
  };

  const uniqueRoles = [...new Set(users.map(u => u.role))];

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading">⏳ Loading users...</div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <div>
          <h1>👥 User Management</h1>
          <p className="subtitle">Connected to auth-service</p>
        </div>
        <button className="btn-primary" onClick={fetchUsers}>🔄 Refresh</button>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div className="users-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-text">Total Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.active}</span>
          <span className="stat-text">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.admins}</span>
          <span className="stat-text">Admins</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          {uniqueRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="users-table">
        <div className="table-header">
          <span className="col-user">User</span>
          <span className="col-role">Role</span>
          <span className="col-status">Status</span>
          <span className="col-tenant">Tenant</span>
        </div>
        {filteredUsers.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="table-row">
              <div className="col-user">
                <span className="user-avatar">👤</span>
                <div className="user-info">
                  <span className="user-name">{user.fullName || user.email.split('@')[0]}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
              <span className="col-role">
                <span
                  className="role-badge"
                  style={{ backgroundColor: roleColors[user.role] || '#666' }}
                >
                  {user.role}
                </span>
              </span>
              <span className="col-status">
                <span
                  className="status-dot"
                  style={{ backgroundColor: user.isActive ? '#10b981' : '#ef4444' }}
                />
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="col-tenant">{user.tenantId}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
