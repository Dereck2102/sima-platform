import { useState, useCallback } from 'react';
import './styles.css';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  formats: string[];
  requiresAdmin: boolean;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'asset-inventory',
    name: 'Asset Inventory',
    description: 'Complete list of all assets with details',
    icon: '📦',
    formats: ['PDF', 'CSV', 'XLSX'],
    requiresAdmin: false,
  },
  {
    id: 'asset-valuation',
    name: 'Asset Valuation',
    description: 'Asset values by category and status',
    icon: '💰',
    formats: ['PDF', 'CSV'],
    requiresAdmin: false,
  },
  {
    id: 'depreciation',
    name: 'Depreciation Report',
    description: 'Asset depreciation calculations',
    icon: '📉',
    formats: ['PDF', 'XLSX'],
    requiresAdmin: true,
  },
  {
    id: 'maintenance',
    name: 'Maintenance History',
    description: 'Assets maintenance records and schedules',
    icon: '🔧',
    formats: ['PDF', 'CSV'],
    requiresAdmin: false,
  },
  {
    id: 'user-activity',
    name: 'User Activity',
    description: 'User actions and audit trail',
    icon: '👥',
    formats: ['PDF', 'CSV'],
    requiresAdmin: true,
  },
  {
    id: 'location-summary',
    name: 'Location Summary',
    description: 'Assets grouped by location',
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
    return { role: payload.role };
  } catch {
    return null;
  }
};

function App() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [format, setFormat] = useState<string>('PDF');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generating, setGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<Array<{ id: string; name: string; date: string; format: string }>>([]);

  const user = getUserFromToken();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const availableReports = REPORT_TYPES.filter(r => !r.requiresAdmin || isAdmin);

  const generateReport = useCallback(async () => {
    if (!selectedReport) return;
    
    setGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReport = {
      id: Date.now().toString(),
      name: selectedReport.name,
      date: new Date().toISOString(),
      format,
    };
    
    setGeneratedReports(prev => [newReport, ...prev]);
    setGenerating(false);
    setSelectedReport(null);
  }, [selectedReport, format]);

  const downloadReport = (reportId: string) => {
    // In real implementation, this would download from API
    alert(`Downloading report ${reportId}...`);
  };

  return (
    <div className="mfe-container">
      <div className="mfe-header">
        <div className="header-left">
          <h1>📊 Reports</h1>
          <p className="subtitle">Generate and export reports • {isAdmin ? 'Admin' : 'User'}</p>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="section">
        <h2>📋 Available Reports</h2>
        <div className="reports-grid">
          {availableReports.map((report) => (
            <div 
              key={report.id} 
              className={`report-card ${selectedReport?.id === report.id ? 'selected' : ''}`}
              onClick={() => setSelectedReport(report)}
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
                <span className="admin-badge">Admin Only</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generate Report Panel */}
      {selectedReport && (
        <div className="generate-panel">
          <div className="panel-header">
            <h2>⚙️ Generate: {selectedReport.name}</h2>
            <button className="btn-close" onClick={() => setSelectedReport(null)}>✕</button>
          </div>
          <div className="panel-content">
            <div className="form-row">
              <div className="form-group">
                <label>Output Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  {selectedReport.formats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
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
              {generating ? '⏳ Generating...' : '🚀 Generate Report'}
            </button>
          </div>
        </div>
      )}

      {/* Generated Reports */}
      <div className="section">
        <h2>📁 Generated Reports</h2>
        {generatedReports.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No reports generated yet</p>
            <p className="hint">Select a report type above to generate</p>
          </div>
        ) : (
          <div className="generated-list">
            {generatedReports.map((report) => (
              <div key={report.id} className="generated-item">
                <div className="item-info">
                  <span className="item-name">{report.name}</span>
                  <span className="item-date">{new Date(report.date).toLocaleString()}</span>
                </div>
                <div className="item-actions">
                  <span className="format-badge">{report.format}</span>
                  <button className="btn-download" onClick={() => downloadReport(report.id)}>
                    📥 Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
