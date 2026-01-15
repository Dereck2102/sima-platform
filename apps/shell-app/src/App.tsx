import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

// Lazy load remote microfrontends
const AssetsMfe = lazy(() => import('assetsMfe/App'));
const DashboardMfe = lazy(() => import('dashboardMfe/App'));
const UsersMfe = lazy(() => import('usersMfe/App'));

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

// Navigation component
const Navigation = () => {
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
        <span className="user-avatar">👤</span>
        <span className="user-name">Admin</span>
      </div>
    </nav>
  );
};

// Home page
const HomePage = () => (
  <div className="home-page">
    <div className="hero-section">
      <h1>Welcome to SIMA Platform</h1>
      <p>Sistema Integrado de Manejo de Activos</p>
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

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
