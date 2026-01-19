import { useState, useEffect, useCallback } from 'react';
import './styles.css';

const API_URL = 'http://localhost:3000/api';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userEmail?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  tenantId: string;
  timestamp: string;
}

const actionColors: Record<string, string> = {
  CREATE: '#10b981',
  UPDATE: '#3b82f6',
  DELETE: '#ef4444',
  LOGIN: '#8b5cf6',
  LOGOUT: '#64748b',
  EXPORT: '#f59e0b',
  IMPORT: '#06b6d4',
};

const actionIcons: Record<string, string> = {
  CREATE: '➕',
  UPDATE: '✏️',
  DELETE: '🗑️',
  LOGIN: '🔐',
  LOGOUT: '🚪',
  EXPORT: '📤',
  IMPORT: '📥',
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

function App() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const user = getUserFromToken();
  const isSuperAdmin = user?.role === 'super_admin';

  const fetchLogs = useCallback(async () => {
    if (!isSuperAdmin) {
      setError('Access denied. Super Admin privileges required.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/audit/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please login to view audit logs');
          return;
        }
        if (response.status === 403) {
          setError('Access denied. Super Admin required.');
          return;
        }
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      // Generate mock data for demo
      setLogs([
        {
          id: '1',
          action: 'CREATE',
          entity: 'Asset',
          entityId: 'asset-001',
          userId: 'user-1',
          userEmail: 'admin@uce.edu.ec',
          tenantId: 'tenant-1',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          action: 'UPDATE',
          entity: 'Asset',
          entityId: 'asset-001',
          userId: 'user-1',
          userEmail: 'admin@uce.edu.ec',
          oldValue: { status: 'ACTIVE' },
          newValue: { status: 'IN_MAINTENANCE' },
          tenantId: 'tenant-1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          action: 'LOGIN',
          entity: 'User',
          entityId: 'user-1',
          userId: 'user-1',
          userEmail: 'admin@uce.edu.ec',
          ipAddress: '192.168.1.100',
          tenantId: 'tenant-1',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '4',
          action: 'DELETE',
          entity: 'Asset',
          entityId: 'asset-002',
          userId: 'user-2',
          userEmail: 'operator@uce.edu.ec',
          tenantId: 'tenant-1',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '5',
          action: 'EXPORT',
          entity: 'Report',
          entityId: 'report-001',
          userId: 'user-1',
          userEmail: 'admin@uce.edu.ec',
          tenantId: 'tenant-1',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const openDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setSelectedLog(null);
    setShowDetail(false);
  };

  // Get unique entities from logs
  const entities = [...new Set(logs.map(l => l.entity))];

  // Filtering
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'ALL' || log.entity === entityFilter;
    
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && new Date(log.timestamp) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      matchesDate = matchesDate && new Date(log.timestamp) <= new Date(dateRange.end + 'T23:59:59');
    }
    
    return matchesSearch && matchesAction && matchesEntity && matchesDate;
  });

  // Stats
  const stats = {
    total: logs.length,
    creates: logs.filter(l => l.action === 'CREATE').length,
    updates: logs.filter(l => l.action === 'UPDATE').length,
    deletes: logs.filter(l => l.action === 'DELETE').length,
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  if (!isSuperAdmin) {
    return (
      <div className="mfe-container">
        <div className="access-denied">
          <span className="denied-icon">🚫</span>
          <h2>Access Denied</h2>
          <p>You need Super Admin privileges to view audit logs.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mfe-container">
        <div className="loading">⏳ Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="mfe-container">
      <div className="mfe-header">
        <div className="header-left">
          <h1>📋 Audit Logs</h1>
          <p className="subtitle">Super Admin • System activity tracking</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">📤 Export</button>
          <button className="btn-refresh" onClick={fetchLogs}>🔄 Refresh</button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={fetchLogs}>🔄 Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Events</span>
        </div>
        <div className="stat-card create">
          <span className="stat-value">{stats.creates}</span>
          <span className="stat-label">Creates</span>
        </div>
        <div className="stat-card update">
          <span className="stat-value">{stats.updates}</span>
          <span className="stat-label">Updates</span>
        </div>
        <div className="stat-card delete">
          <span className="stat-value">{stats.deletes}</span>
          <span className="stat-label">Deletes</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by entity, ID, or user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="ALL">All Actions</option>
          {Object.keys(actionColors).map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        >
          <option value="ALL">All Entities</option>
          {entities.map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <input
          type="date"
          className="date-input"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          placeholder="From"
        />
        <input
          type="date"
          className="date-input"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          placeholder="To"
        />
      </div>

      {/* Logs Table */}
      <div className="logs-table">
        <div className="table-header">
          <span className="col-action">Action</span>
          <span className="col-entity">Entity</span>
          <span className="col-user">User</span>
          <span className="col-time">Time</span>
          <span className="col-detail"></span>
        </div>
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="table-body">
            {filteredLogs.map((log) => (
              <div key={log.id} className="table-row" onClick={() => openDetail(log)}>
                <span className="col-action">
                  <span className="action-badge" style={{ backgroundColor: actionColors[log.action] }}>
                    {actionIcons[log.action]} {log.action}
                  </span>
                </span>
                <span className="col-entity">
                  <span className="entity-name">{log.entity}</span>
                  <span className="entity-id">{log.entityId}</span>
                </span>
                <span className="col-user">{log.userEmail || log.userId}</span>
                <span className="col-time">{formatTimestamp(log.timestamp)}</span>
                <span className="col-detail">
                  <button className="btn-view-detail">👁️</button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedLog && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Log Details</h2>
              <button className="modal-close" onClick={closeDetail}>✕</button>
            </div>
            <div className="log-detail">
              <div className="detail-row">
                <label>Action</label>
                <span className="action-badge" style={{ backgroundColor: actionColors[selectedLog.action] }}>
                  {actionIcons[selectedLog.action]} {selectedLog.action}
                </span>
              </div>
              <div className="detail-row">
                <label>Entity</label>
                <span>{selectedLog.entity}</span>
              </div>
              <div className="detail-row">
                <label>Entity ID</label>
                <span className="mono">{selectedLog.entityId}</span>
              </div>
              <div className="detail-row">
                <label>User</label>
                <span>{selectedLog.userEmail || selectedLog.userId}</span>
              </div>
              <div className="detail-row">
                <label>Tenant</label>
                <span>{selectedLog.tenantId}</span>
              </div>
              <div className="detail-row">
                <label>Timestamp</label>
                <span>{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
              {selectedLog.ipAddress && (
                <div className="detail-row">
                  <label>IP Address</label>
                  <span className="mono">{selectedLog.ipAddress}</span>
                </div>
              )}
              {selectedLog.oldValue && (
                <div className="detail-section">
                  <label>Old Value</label>
                  <pre>{JSON.stringify(selectedLog.oldValue, null, 2)}</pre>
                </div>
              )}
              {selectedLog.newValue && (
                <div className="detail-section">
                  <label>New Value</label>
                  <pre>{JSON.stringify(selectedLog.newValue, null, 2)}</pre>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeDetail}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
