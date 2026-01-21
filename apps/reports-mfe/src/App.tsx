import { useState, useEffect, useCallback } from 'react';
import './styles.css';

const API_URL = 'http://localhost:3000/api';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  formats: string[];
  requiresAdmin: boolean;
}

interface GeneratedReport {
  id: string;
  type: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  fileName?: string;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'asset-inventory',
    name: 'Inventario de Activos',
    description: 'Lista completa de todos los activos con detalles',
    icon: '📦',
    formats: ['PDF', 'CSV', 'XLSX'],
    requiresAdmin: false,
  },
  {
    id: 'asset-valuation',
    name: 'Valoración de Activos',
    description: 'Valores por categoría y estado',
    icon: '💰',
    formats: ['PDF', 'CSV'],
    requiresAdmin: false,
  },
  {
    id: 'depreciation',
    name: 'Reporte de Depreciación',
    description: 'Cálculos de depreciación de activos',
    icon: '📉',
    formats: ['PDF', 'XLSX'],
    requiresAdmin: true,
  },
  {
    id: 'maintenance',
    name: 'Historial de Mantenimiento',
    description: 'Registros y programación de mantenimiento',
    icon: '🔧',
    formats: ['PDF', 'CSV'],
    requiresAdmin: false,
  },
  {
    id: 'user-activity',
    name: 'Actividad de Usuarios',
    description: 'Acciones de usuarios y auditoría',
    icon: '👥',
    formats: ['PDF', 'CSV'],
    requiresAdmin: true,
  },
  {
    id: 'location-summary',
    name: 'Resumen por Ubicación',
    description: 'Activos agrupados por ubicación',
    icon: '📍',
    formats: ['PDF', 'CSV', 'XLSX'],
    requiresAdmin: false,
  },
];

const getAuthToken = () => localStorage.getItem('token') || '';

const getUserFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { role: payload.role, tenantId: payload.tenantId };
  } catch {
    return null;
  }
};

function App() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [format, setFormat] = useState<string>('PDF');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generating, setGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = getUserFromToken();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const availableReports = REPORT_TYPES.filter(r => !r.requiresAdmin || isAdmin);

  // Fetch existing reports
  const fetchReports = useCallback(async () => {
    if (!user?.tenantId) return;
    
    setLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': user.tenantId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedReports(Array.isArray(data) ? data : []);
      } else {
        // API may not be available yet, use empty array
        setGeneratedReports([]);
      }
    } catch {
      setError('No se puede conectar al servicio de reportes');
      setGeneratedReports([]);
    } finally {
      setLoading(false);
    }
  }, [user?.tenantId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const generateReport = async () => {
    if (!selectedReport || !user?.tenantId) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-tenant-id': user.tenantId,
        },
        body: JSON.stringify({
          type: selectedReport.id,
          format,
          dateFrom: dateRange.start || undefined,
          dateTo: dateRange.end || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedReports(prev => [{
          id: result.id || Date.now().toString(),
          type: selectedReport.name,
          format,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }, ...prev]);
        setSelectedReport(null);
      } else {
        const err = await response.json();
        setError(err.message || 'Error al generar reporte');
      }
    } catch {
      setError('Error de conexión al generar reporte');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (reportId: string) => {
    if (!user?.tenantId) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': user.tenantId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Create download with data
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error al descargar reporte');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const checkStatus = async (reportId: string) => {
    if (!user?.tenantId) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/reports/${reportId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': user.tenantId,
        },
      });

      if (response.ok) {
        const status = await response.json();
        setGeneratedReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, status: status.status } : r
        ));
      }
    } catch {
      // Silently fail
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      pending: { color: '#f59e0b', label: '⏳ Pendiente' },
      processing: { color: '#3b82f6', label: '🔄 Procesando' },
      completed: { color: '#10b981', label: '✅ Completado' },
      failed: { color: '#ef4444', label: '❌ Error' },
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="mfe-container">
      <div className="mfe-header">
        <div className="header-left">
          <h1>📊 Reportes</h1>
          <p className="subtitle">
            Generar y exportar reportes • {isAdmin ? 'Administrador' : 'Usuario'}
          </p>
        </div>
        <button className="btn-refresh" onClick={fetchReports}>🔄</button>
      </div>

      {error && (
        <div className="error-banner">⚠️ {error}</div>
      )}

      {/* Report Types Grid */}
      <div className="section">
        <h2>📋 Reportes Disponibles</h2>
        <div className="reports-grid">
          {availableReports.map((report) => (
            <div 
              key={report.id} 
              className={`report-card ${selectedReport?.id === report.id ? 'selected' : ''}`}
              onClick={() => { setSelectedReport(report); setFormat(report.formats[0]); }}
            >
              <div className="report-icon">{report.icon}</div>
              <h3>{report.name}</h3>
              <p>{report.description}</p>
              <div className="report-formats">
                {report.formats.map(f => (
                  <span key={f} className="format-tag">{f}</span>
                ))}
              </div>
              {report.requiresAdmin && (
                <span className="admin-badge">Solo Admin</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generate Report Panel */}
      {selectedReport && (
        <div className="generate-panel">
          <div className="panel-header">
            <h2>⚙️ Generar: {selectedReport.name}</h2>
            <button className="btn-close" onClick={() => setSelectedReport(null)}>✕</button>
          </div>
          <div className="panel-content">
            <div className="form-row">
              <div className="form-group">
                <label>Formato de Salida</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  {selectedReport.formats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Fecha Fin</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
            <button 
              className="btn-generate" 
              onClick={generateReport}
              disabled={generating}
            >
              {generating ? '⏳ Generando...' : '🚀 Generar Reporte'}
            </button>
          </div>
        </div>
      )}

      {/* Generated Reports */}
      <div className="section">
        <h2>📁 Reportes Generados</h2>
        {loading ? (
          <div className="loading">⏳ Cargando reportes...</div>
        ) : generatedReports.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No hay reportes generados</p>
            <p className="hint">Seleccione un tipo de reporte arriba para generar</p>
          </div>
        ) : (
          <div className="generated-list">
            {generatedReports.map((report) => {
              const badge = getStatusBadge(report.status);
              return (
                <div key={report.id} className="generated-item">
                  <div className="item-info">
                    <span className="item-name">{report.type}</span>
                    <span className="item-date">{new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="item-actions">
                    <span className="status-badge" style={{ backgroundColor: badge.color }}>
                      {badge.label}
                    </span>
                    <span className="format-badge">{report.format}</span>
                    {report.status === 'pending' && (
                      <button className="btn-icon" onClick={() => checkStatus(report.id)} title="Verificar estado">
                        🔄
                      </button>
                    )}
                    {report.status === 'completed' && (
                      <button className="btn-download" onClick={() => downloadReport(report.id)}>
                        📥 Descargar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
