import { useState, useEffect } from 'react';
import './styles.css';

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

interface SettingsSection {
  id: string;
  name: string;
  icon: string;
  requiresAdmin: boolean;
}

const SECTIONS: SettingsSection[] = [
  { id: 'profile', name: 'Profile', icon: '👤', requiresAdmin: false },
  { id: 'security', name: 'Security', icon: '🔐', requiresAdmin: false },
  { id: 'notifications', name: 'Notifications', icon: '🔔', requiresAdmin: false },
  { id: 'appearance', name: 'Appearance', icon: '🎨', requiresAdmin: false },
  { id: 'system', name: 'System', icon: '⚙️', requiresAdmin: true },
  { id: 'integrations', name: 'Integrations', icon: '🔗', requiresAdmin: true },
];

function App() {
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    assetChanges: true,
    reports: false,
  });
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
  });

  const user = getUserFromToken();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const availableSections = SECTIONS.filter(s => !s.requiresAdmin || isAdmin);

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: '',
        department: '',
      });
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="settings-content">
            <h2>👤 Profile Settings</h2>
            <p className="section-desc">Manage your personal information</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="john@example.com"
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  placeholder="IT Department"
                />
              </div>
            </div>
            
            <div className="info-card">
              <h4>Account Information</h4>
              <div className="info-row">
                <span>Role</span>
                <span className="role-badge">{user?.role}</span>
              </div>
              <div className="info-row">
                <span>Tenant ID</span>
                <span className="mono">{user?.tenantId}</span>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="settings-content">
            <h2>🔐 Security Settings</h2>
            <p className="section-desc">Manage password and security options</p>
            
            <div className="security-card">
              <h4>Change Password</h4>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <button className="btn-secondary">Update Password</button>
            </div>
            
            <div className="security-card">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security to your account</p>
              <button className="btn-primary">Enable 2FA</button>
            </div>
            
            <div className="security-card">
              <h4>Active Sessions</h4>
              <div className="session-item">
                <div className="session-info">
                  <span className="session-device">🖥️ Windows - Chrome</span>
                  <span className="session-location">Current session</span>
                </div>
                <span className="session-active">Active Now</span>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-content">
            <h2>🔔 Notification Settings</h2>
            <p className="section-desc">Configure how you receive notifications</p>
            
            <div className="toggle-list">
              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-name">Email Notifications</span>
                  <span className="toggle-desc">Receive notifications via email</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-name">Push Notifications</span>
                  <span className="toggle-desc">Browser push notifications</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-name">Asset Changes</span>
                  <span className="toggle-desc">Notify when assets are modified</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notifications.assetChanges}
                    onChange={(e) => setNotifications({ ...notifications, assetChanges: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-name">Report Generation</span>
                  <span className="toggle-desc">Notify when reports are ready</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notifications.reports}
                    onChange={(e) => setNotifications({ ...notifications, reports: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-content">
            <h2>🎨 Appearance Settings</h2>
            <p className="section-desc">Customize the look and feel</p>
            
            <div className="toggle-list">
              <div className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-name">Dark Mode</span>
                  <span className="toggle-desc">Use dark theme across the application</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="theme-preview">
              <h4>Theme Preview</h4>
              <div className={`preview-box ${darkMode ? 'dark' : 'light'}`}>
                <span className="preview-text">Sample text in {darkMode ? 'dark' : 'light'} theme</span>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="settings-content">
            <h2>⚙️ System Settings</h2>
            <p className="section-desc">Configure system-wide settings (Admin only)</p>
            
            <div className="info-card warning">
              <h4>⚠️ Admin Area</h4>
              <p>Changes here affect all users in the system</p>
            </div>
            
            <div className="form-group">
              <label>Session Timeout (minutes)</label>
              <input type="number" defaultValue={30} min={5} max={120} />
            </div>
            
            <div className="form-group">
              <label>Max Login Attempts</label>
              <input type="number" defaultValue={5} min={3} max={10} />
            </div>
            
            <div className="form-group">
              <label>Maintenance Mode</label>
              <select defaultValue="disabled">
                <option value="disabled">Disabled</option>
                <option value="enabled">Enabled</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="settings-content">
            <h2>🔗 Integrations</h2>
            <p className="section-desc">Manage external service integrations</p>
            
            <div className="integration-grid">
              <div className="integration-card">
                <span className="integration-icon">📊</span>
                <h4>Grafana</h4>
                <p>Monitoring dashboards</p>
                <span className="status-badge connected">Connected</span>
              </div>
              <div className="integration-card">
                <span className="integration-icon">📧</span>
                <h4>SMTP</h4>
                <p>Email notifications</p>
                <span className="status-badge connected">Connected</span>
              </div>
              <div className="integration-card">
                <span className="integration-icon">💬</span>
                <h4>Slack</h4>
                <p>Team notifications</p>
                <span className="status-badge disconnected">Not Connected</span>
              </div>
              <div className="integration-card">
                <span className="integration-icon">☁️</span>
                <h4>AWS S3</h4>
                <p>File storage</p>
                <span className="status-badge connected">Connected</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mfe-container">
      <div className="mfe-header">
        <div className="header-left">
          <h1>⚙️ Settings</h1>
          <p className="subtitle">Manage your account and preferences</p>
        </div>
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav">
          {availableSections.map((section) => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-name">{section.name}</span>
              {section.requiresAdmin && <span className="admin-tag">Admin</span>}
            </button>
          ))}
        </nav>

        <main className="settings-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
