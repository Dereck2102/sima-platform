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

interface UserFormData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  tenantId: string;
}

const ROLES = ['super_admin', 'admin', 'auditor', 'operator', 'viewer'] as const;

const roleColors: Record<string, string> = {
  super_admin: '#ef4444',
  admin: '#8b5cf6',
  auditor: '#f59e0b',
  operator: '#3b82f6',
  viewer: '#94a3b8',
};

const roleLabels: Record<string, string> = {
  super_admin: '👑 Super Admin',
  admin: '🔑 Administrador',
  auditor: '📋 Auditor',
  operator: '⚙️ Operador',
  viewer: '👁️ Visualizador',
};

const roleDescriptions: Record<string, string> = {
  super_admin: 'Acceso total: backups, servicios, todos los tenants/usuarios',
  admin: 'Admin de tenant: gestiona usuarios dentro del tenant',
  auditor: 'Solo lectura de logs de auditoría y reportes',
  operator: 'Gestiona inventario y activos',
  viewer: 'Solo lectura',
};

const getAuthToken = () => localStorage.getItem('token') || '';

const getUserInfo = () => {
  const token = getAuthToken();
  if (!token) return { role: 'viewer', userId: null, tenantId: null };
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      role: payload.role || 'viewer',
      userId: payload.sub || null,
      tenantId: payload.tenantId || null,
    };
  } catch { return { role: 'viewer', userId: null, tenantId: null }; }
};

const emptyForm: UserFormData = {
  email: '',
  password: '',
  fullName: '',
  role: 'viewer',
  tenantId: '',
};

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const currentUser = getUserInfo();
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'admin' || isSuperAdmin;
  const canCreate = isAdmin;
  const canEdit = isAdmin;
  const canDelete = isSuperAdmin;

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
          setError('Por favor inicie sesión para ver usuarios');
          return;
        }
        if (response.status === 403) {
          setError('Necesita privilegios de administrador');
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
            fullName: payload.fullName || payload.email.split('@')[0],
            role: payload.role,
            isActive: true,
            tenantId: payload.tenantId,
            createdAt: new Date().toISOString(),
          }]);
          setError('Endpoint de usuarios no disponible. Mostrando usuario actual.');
        } catch {
          setError('No se pueden cargar los usuarios');
        }
      } else {
        setError('No se pueden cargar los usuarios');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Modal functions
  const openCreateModal = () => {
    setFormData({
      ...emptyForm,
      tenantId: currentUser.tenantId || '',
    });
    setSelectedUser(null);
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '', // Don't show password
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData(emptyForm);
  };

  // CRUD operations
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        closeModal();
        fetchUsers();
      } else {
        const err = await response.json();
        alert(`Error: ${err.message || 'No se pudo crear el usuario'}`);
      }
    } catch {
      alert('Error al crear usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      const token = getAuthToken();
      const updateData: Partial<UserFormData> = {
        fullName: formData.fullName,
        role: formData.role,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${API_URL}/auth/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        closeModal();
        fetchUsers();
      } else {
        const err = await response.json();
        alert(`Error: ${err.message || 'No se pudo actualizar el usuario'}`);
      }
    } catch {
      alert('Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`¿Está seguro de eliminar a "${userName}"? Esta acción no se puede deshacer.`)) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchUsers();
      } else {
        alert('Error al eliminar usuario');
      }
    } catch {
      alert('Error al eliminar usuario');
    }
  };

  const toggleActive = async (user: User) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch {
      alert('Error al cambiar estado del usuario');
    }
  };

  // Filtering
  const filteredUsers = users.filter((user) => {
    // Admin only sees users from their tenant
    if (!isSuperAdmin && user.tenantId !== currentUser.tenantId) {
      return false;
    }
    
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: filteredUsers.length,
    active: filteredUsers.filter((u) => u.isActive).length,
    admins: filteredUsers.filter((u) => u.role === 'super_admin' || u.role === 'admin').length,
  };

  const uniqueRoles = [...new Set(users.map(u => u.role))];

  if (!isAdmin) {
    return (
      <div className="users-container">
        <div className="access-denied">
          <span className="denied-icon">🚫</span>
          <h2>Acceso Denegado</h2>
          <p>Necesita privilegios de administrador para gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading">⏳ Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <div>
          <h1>👥 Gestión de Usuarios</h1>
          <p className="subtitle">Conectado a auth-service • Rol: <strong>{roleLabels[currentUser.role]}</strong></p>
        </div>
        <div className="header-actions">
          {canCreate && (
            <button className="btn-primary" onClick={openCreateModal}>
              + Nuevo Usuario
            </button>
          )}
          <button className="btn-secondary" onClick={fetchUsers}>🔄</button>
        </div>
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
          <span className="stat-text">Total Usuarios</span>
        </div>
        <div className="stat-item active">
          <span className="stat-number">{stats.active}</span>
          <span className="stat-text">Activos</span>
        </div>
        <div className="stat-item admins">
          <span className="stat-number">{stats.admins}</span>
          <span className="stat-text">Administradores</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Todos los Roles</option>
          {uniqueRoles.map(role => (
            <option key={role} value={role}>{roleLabels[role] || role}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="users-table">
        <div className="table-header">
          <span className="col-user">Usuario</span>
          <span className="col-role">Rol</span>
          <span className="col-status">Estado</span>
          <span className="col-tenant">Tenant</span>
          <span className="col-actions">Acciones</span>
        </div>
        {filteredUsers.length === 0 ? (
          <div className="empty-state">No se encontraron usuarios</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className={`table-row ${!user.isActive ? 'inactive' : ''}`}>
              <div className="col-user" onClick={() => openViewModal(user)}>
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
                  {roleLabels[user.role] || user.role}
                </span>
              </span>
              <span className="col-status">
                <span
                  className="status-dot"
                  style={{ backgroundColor: user.isActive ? '#10b981' : '#ef4444' }}
                />
                {user.isActive ? 'Activo' : 'Inactivo'}
              </span>
              <span className="col-tenant">{user.tenantId?.substring(0, 8)}...</span>
              <div className="col-actions">
                {canEdit && (
                  <>
                    <button className="btn-icon" title="Editar" onClick={() => openEditModal(user)}>✏️</button>
                    <button 
                      className="btn-icon" 
                      title={user.isActive ? 'Desactivar' : 'Activar'} 
                      onClick={() => toggleActive(user)}
                    >
                      {user.isActive ? '🔒' : '🔓'}
                    </button>
                  </>
                )}
                {canDelete && user.id !== currentUser.userId && (
                  <button 
                    className="btn-icon danger" 
                    title="Eliminar" 
                    onClick={() => handleDelete(user.id, user.fullName || user.email)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {modalMode === 'view' && selectedUser ? (
              <>
                <div className="modal-header">
                  <h2>👤 Detalles del Usuario</h2>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="user-detail-view">
                  <div className="detail-row">
                    <label>Nombre Completo</label>
                    <span>{selectedUser.fullName}</span>
                  </div>
                  <div className="detail-row">
                    <label>Email</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <label>Rol</label>
                    <span className="role-badge" style={{ backgroundColor: roleColors[selectedUser.role] }}>
                      {roleLabels[selectedUser.role]}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Permisos</label>
                    <span className="permission-text">{roleDescriptions[selectedUser.role]}</span>
                  </div>
                  <div className="detail-row">
                    <label>Estado</label>
                    <span className={selectedUser.isActive ? 'text-green' : 'text-red'}>
                      {selectedUser.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Tenant ID</label>
                    <span className="tenant-id">{selectedUser.tenantId}</span>
                  </div>
                  <div className="detail-row">
                    <label>Creado</label>
                    <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="modal-actions">
                    {canEdit && (
                      <button className="btn-primary" onClick={() => openEditModal(selectedUser)}>
                        ✏️ Editar
                      </button>
                    )}
                    <button className="btn-secondary" onClick={closeModal}>Cerrar</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="modal-header">
                  <h2>{modalMode === 'create' ? '➕ Nuevo Usuario' : '✏️ Editar Usuario'}</h2>
                  <button className="modal-close" onClick={closeModal}>✕</button>
                </div>
                <form onSubmit={modalMode === 'create' ? handleCreate : handleUpdate}>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="usuario@ejemplo.com"
                      disabled={modalMode === 'edit'}
                    />
                  </div>
                  <div className="form-group">
                    <label>{modalMode === 'create' ? 'Contraseña *' : 'Nueva Contraseña (opcional)'}</label>
                    <input
                      type="password"
                      required={modalMode === 'create'}
                      minLength={8}
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder={modalMode === 'create' ? 'Mínimo 8 caracteres' : 'Dejar vacío para mantener actual'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Juan Pérez García"
                    />
                  </div>
                  <div className="form-group">
                    <label>Rol *</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                      {ROLES.filter(r => isSuperAdmin || r !== 'super_admin').map(role => (
                        <option key={role} value={role}>{roleLabels[role]}</option>
                      ))}
                    </select>
                    <p className="role-description">{roleDescriptions[formData.role]}</p>
                  </div>
                  {modalMode === 'create' && isSuperAdmin && (
                    <div className="form-group">
                      <label>Tenant ID *</label>
                      <input
                        type="text"
                        required
                        value={formData.tenantId}
                        onChange={e => setFormData({...formData, tenantId: e.target.value})}
                        placeholder="UUID del tenant"
                      />
                    </div>
                  )}
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={closeModal} disabled={saving}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? '⏳ Guardando...' : (modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios')}
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
