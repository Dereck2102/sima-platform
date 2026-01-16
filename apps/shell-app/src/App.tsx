import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000/api';

// Lazy load remote microfrontends
const AssetsMfe = lazy(() => import('assetsMfe/App'));
const DashboardMfe = lazy(() => import('dashboardMfe/App'));
const UsersMfe = lazy(() => import('usersMfe/App'));

// Auth context types
interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string;
}

// Error boundary for microfrontend loading failures
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Loading component
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading module...</p>
  </div>
);

// Error fallback
const MfeFallback = ({ name }: { name: string }) => (
  <div className="mfe-error">
    <h3>⚠️ Unable to load {name}</h3>
    <p>Make sure the microfrontend is running.</p>
  </div>
);

// Login Page Component
const LoginPage = ({ onLogin }: { onLogin: (token: string, user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and get user profile
      localStorage.setItem('token', data.accessToken);
      
      // Decode JWT to get user info (simple base64 decode)
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
      const user: User = {
        id: payload.sub,
        email: payload.email,
        fullName: payload.fullName || payload.email.split('@')[0],
        role: payload.role,
        tenantId: payload.tenantId,
      };

      onLogin(data.accessToken, user);
    } catch (err: any) {
      setError(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <span className="login-logo">🏢</span>
          <h1>SIMA Platform</h1>
          <p>Sistema Integrado de Manejo de Activos</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">⚠️ {error}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@uce.edu.ec"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? '⏳ Logging in...' : '🔐 Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo credentials: admin@uce.edu.ec / Test123!</p>
        </div>
      </div>
    </div>
  );
};

// Navigation component with logout
const Navigation = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: '🏠 Home', icon: '🏠' },
    { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { path: '/assets', label: '📦 Assets', icon: '📦' },
    { path: '/users', label: '👥 Users', icon: '👥' },
  ];

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <span className="brand-icon">🏢</span>
        <span className="brand-text">SIMA</span>
      </div>
      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label.split(' ').slice(1).join(' ')}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="nav-user">
        <div className="user-info">
          <span className="user-name">{user.fullName}</span>
          <span className="user-role">{user.role}</span>
        </div>
        <button onClick={onLogout} className="btn-logout" title="Logout">
          🚪
        </button>
      </div>
    </nav>
  );
};

// Home page
const HomePage = ({ user }: { user: User }) => (
  <div className="home-page">
    <div className="hero-section">
      <h1>Welcome, {user.fullName}! 👋</h1>
      <p>Sistema Integrado de Manejo de Activos</p>
      <div className="user-badge">
        <span className="badge-role">{user.role}</span>
        <span className="badge-tenant">📍 {user.tenantId}</span>
      </div>
    </div>
    <div className="feature-cards">
      <div className="feature-card">
        <span className="card-icon">📊</span>
        <h3>Dashboard</h3>
        <p>View analytics and reports</p>
        <Link to="/dashboard" className="card-link">Go to Dashboard →</Link>
      </div>
      <div className="feature-card">
        <span className="card-icon">📦</span>
        <h3>Assets</h3>
        <p>Manage your fixed assets</p>
        <Link to="/assets" className="card-link">Go to Assets →</Link>
      </div>
      <div className="feature-card">
        <span className="card-icon">👥</span>
        <h3>Users</h3>
        <p>User management</p>
        <Link to="/users" className="card-link">Go to Users →</Link>
      </div>
    </div>
  </div>
);

// Main App with Auth
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check if token is expired
        if (payload.exp * 1000 > Date.now()) {
          setUser({
            id: payload.sub,
            email: payload.email,
            fullName: payload.fullName || payload.email.split('@')[0],
            role: payload.role,
            tenantId: payload.tenantId,
          });
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (token: string, userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading SIMA Platform...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navigation user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route
              path="/dashboard/*"
              element={
                <ErrorBoundary fallback={<MfeFallback name="Dashboard" />}>
                  <Suspense fallback={<Loading />}>
                    <DashboardMfe />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/assets/*"
              element={
                <ErrorBoundary fallback={<MfeFallback name="Assets" />}>
                  <Suspense fallback={<Loading />}>
                    <AssetsMfe />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/users/*"
              element={
                <ErrorBoundary fallback={<MfeFallback name="Users" />}>
                  <Suspense fallback={<Loading />}>
                    <UsersMfe />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
