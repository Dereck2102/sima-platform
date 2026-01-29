"use client";

import { useEffect, useState } from 'react';
import { fetchJson } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface AuthGateProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const AuthGate: React.FC<AuthGateProps> = ({ children, allowedRoles }) => {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetchJson<{ id: string; email: string; name: string; role: string }>('/me');
      if (res.error || !res.data) {
        setError(res.error || 'Unable to load user');
        setLoading(false);
        return;
      }
      setUser({
        id: res.data.id,
        email: res.data.email,
        name: res.data.name,
        role: res.data.role,
      });
      setLoading(false);
    };
    load();
  }, [setUser]);

  if (loading) {
    return <p className="p-4 text-sm text-gray-600">Loading session...</p>;
  }

  if (error) {
    return <p className="p-4 text-sm text-red-600">{error}</p>;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <p className="p-4 text-sm text-red-600">Access restricted for your role.</p>;
  }

  return <>{children}</>;
};
