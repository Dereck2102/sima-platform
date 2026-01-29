export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string | null;
};

export type Asset = {
  id: string;
  name: string;
  status: string;
  location?: string | null;
  lastCheck?: string | null;
};

export type Report = {
  id: string;
  title: string;
  author?: string | null;
  created?: string | null;
  status?: string | null;
  downloadUrl?: string | null;
};

export type UserSettings = {
  theme: string;
  notifications: boolean;
  autoSave: boolean;
  language: string;
};

const users: User[] = [
  { id: 'u1', name: 'María González', email: 'maria@sima.io', role: 'SUPER_ADMIN', status: 'Active', lastLogin: '2026-01-20' },
  { id: 'u2', name: 'Carlos Rivera', email: 'carlos@sima.io', role: 'ADMIN', status: 'Active', lastLogin: '2026-01-21' },
  { id: 'u3', name: 'Lucía Torres', email: 'lucia@sima.io', role: 'ASSET_MANAGER', status: 'Invited', lastLogin: null },
  { id: 'u4', name: 'Diego Fernández', email: 'diego@sima.io', role: 'ANALYST', status: 'Suspended', lastLogin: '2025-12-12' },
];

const assets: Asset[] = [
  { id: 'AS-1021', name: 'Compresor Norte', status: 'Healthy', location: 'Planta Quito', lastCheck: '2026-01-28' },
  { id: 'AS-1044', name: 'Cinta transportadora', status: 'Warning', location: 'Planta Latacunga', lastCheck: '2026-01-27' },
  { id: 'AS-1078', name: 'Sensor vibración #33', status: 'Critical', location: 'Planta Quito', lastCheck: '2026-01-29' },
];

const reports: Report[] = [
  { id: 'RP-2301', title: 'Reporte semanal de mantenimiento', author: 'María González', created: '2026-01-28', status: 'Ready', downloadUrl: 'https://example.com/report-weekly.pdf' },
  { id: 'RP-2302', title: 'Informe de vibración', author: 'Carlos Rivera', created: '2026-01-27', status: 'Processing' },
  { id: 'RP-2303', title: 'Salud de activos críticos', author: 'Lucía Torres', created: '2026-01-25', status: 'Ready', downloadUrl: 'https://example.com/report-health.pdf' },
];

const settingsByUser: Record<string, UserSettings> = {
  u1: { theme: 'light', notifications: true, autoSave: true, language: 'es' },
};

export function listUsers() {
  return users;
}

export function addUser(data: Partial<User>) {
  const id = `u${Date.now()}`;
  const user: User = {
    id,
    name: data.name || 'Nuevo Usuario',
    email: data.email || `user${id}@example.com`,
    role: data.role || 'ADMIN',
    status: data.status || 'Active',
    lastLogin: data.lastLogin ?? null,
  };
  users.push(user);
  return user;
}

export function updateUser(id: string, data: Partial<User>) {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data };
  return users[idx];
}

export function deleteUser(id: string) {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
}

export function listAssets() {
  return assets;
}

export function addAsset(data: Partial<Asset>) {
  const id = data.id || `AS-${Date.now()}`;
  const asset: Asset = {
    id,
    name: data.name || 'Nuevo Activo',
    status: data.status || 'Healthy',
    location: data.location ?? null,
    lastCheck: data.lastCheck ?? null,
  };
  assets.push(asset);
  return asset;
}

export function updateAsset(id: string, data: Partial<Asset>) {
  const idx = assets.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  assets[idx] = { ...assets[idx], ...data };
  return assets[idx];
}

export function deleteAsset(id: string) {
  const idx = assets.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  assets.splice(idx, 1);
  return true;
}

export function listReports() {
  return reports;
}

export function addReport(data: Partial<Report>) {
  const id = data.id || `RP-${Date.now()}`;
  const report: Report = {
    id,
    title: data.title || 'Nuevo Reporte',
    author: data.author ?? null,
    created: data.created ?? new Date().toISOString().slice(0, 10),
    status: data.status || 'Processing',
    downloadUrl: data.downloadUrl ?? null,
  };
  reports.push(report);
  return report;
}

export function updateReport(id: string, data: Partial<Report>) {
  const idx = reports.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  reports[idx] = { ...reports[idx], ...data };
  return reports[idx];
}

export function deleteReport(id: string) {
  const idx = reports.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  reports.splice(idx, 1);
  return true;
}

export function getSettings(userId: string) {
  return settingsByUser[userId] || { theme: 'light', notifications: true, autoSave: true, language: 'es' };
}

export function updateSettings(userId: string, data: Partial<UserSettings>) {
  const current = getSettings(userId);
  const next = { ...current, ...data } as UserSettings;
  settingsByUser[userId] = next;
  return next;
}

export function currentUser(): User {
  return users[0];
}

export function dashboardData() {
  return {
    stats: [
      { title: 'Active users', value: users.length, trendDirection: 'up', trendValue: 3 },
      { title: 'Managed assets', value: assets.length, trendDirection: 'up', trendValue: 2 },
      { title: 'Open alerts', value: 4, trendDirection: 'down', trendValue: 5 },
      { title: 'Reports generated', value: reports.length, trendDirection: 'up', trendValue: 7 },
    ],
    activities: [
      'Nueva alerta de vibración en compresor #12',
      'Usuario María González aprobó reporte semanal',
      'Sensor IoT #AC-331 restablecido',
      'Se agregaron 3 activos al inventario',
    ],
    health: {
      cpu: 32,
      memory: 58,
      disk: 41,
    },
  };
}
