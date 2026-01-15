import React, { useState } from 'react';
import './styles.css';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  avatar: string;
}

const mockUsers: User[] = [
  { id: '1', email: 'admin@uce.edu.ec', fullName: 'Dereck Amacoria', role: 'admin', status: 'active', createdAt: '2024-01-15', avatar: '👨‍💻' },
  { id: '2', email: 'jguevara@uce.edu.ec', fullName: 'Juan Guevara', role: 'admin', status: 'active', createdAt: '2024-01-10', avatar: '👨‍🏫' },
  { id: '3', email: 'maria@uce.edu.ec', fullName: 'María García', role: 'manager', status: 'active', createdAt: '2024-02-01', avatar: '👩‍💼' },
  { id: '4', email: 'carlos@uce.edu.ec', fullName: 'Carlos López', role: 'user', status: 'inactive', createdAt: '2024-02-15', avatar: '👨' },
  { id: '5', email: 'ana@uce.edu.ec', fullName: 'Ana Martínez', role: 'user', status: 'pending', createdAt: '2024-03-01', avatar: '👩' },
];

const roleColors: Record<string, string> = {
  admin: '#8b5cf6',
  manager: '#3b82f6',
  user: '#94a3b8',
};

const statusColors: Record<string, string> = {
  active: '#10b981',
  inactive: '#ef4444',
  pending: '#f59e0b',
};

function App() {
  const [users] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    admins: users.filter((u) => u.role === 'admin').length,
    managers: users.filter((u) => u.role === 'manager').length,
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <div>
          <h1>👥 User Management</h1>
          <p className="subtitle">Manage system users and permissions</p>
        </div>
        <button className="btn-primary">+ Add User</button>
      </div>

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
        <div className="stat-item">
          <span className="stat-number">{stats.managers}</span>
          <span className="stat-text">Managers</span>
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
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="users-table">
        <div className="table-header">
          <span className="col-user">User</span>
          <span className="col-role">Role</span>
          <span className="col-status">Status</span>
          <span className="col-date">Created</span>
          <span className="col-actions">Actions</span>
        </div>
        {filteredUsers.map((user) => (
          <div key={user.id} className="table-row">
            <div className="col-user">
              <span className="user-avatar">{user.avatar}</span>
              <div className="user-info">
                <span className="user-name">{user.fullName}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            <span className="col-role">
              <span
                className="role-badge"
                style={{ backgroundColor: roleColors[user.role] }}
              >
                {user.role}
              </span>
            </span>
            <span className="col-status">
              <span
                className="status-dot"
                style={{ backgroundColor: statusColors[user.status] }}
              />
              {user.status}
            </span>
            <span className="col-date">{user.createdAt}</span>
            <span className="col-actions">
              <button className="action-btn" title="Edit">✏️</button>
              <button className="action-btn" title="View">👁️</button>
              <button className="action-btn" title="Delete">🗑️</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
