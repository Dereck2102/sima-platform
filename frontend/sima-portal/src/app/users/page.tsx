"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { fetchJson } from '../../lib/api';
import { AuthGate } from '../../components/AuthGate';

type User = { name: string; role: string; status: string; lastLogin?: string };

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetchJson<{ users: User[] }>('/users');
      if (res.error || !res.data) {
        setError(res.error || 'No data');
        setLoading(false);
        return;
      }
      setUsers(res.data.users || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AuthGate allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <Navbar />
      <main className="p-8 bg-gray-50 min-h-screen">
        <header className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Directory</p>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          </div>
          <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
            Invite User
          </button>
        </header>

        {loading && <p className="text-sm text-gray-600">Loading...</p>}
        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full">
              <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-gray-500" colSpan={4}>No users available.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={`${u.name}-${u.role}`}>
                      <td className="px-4 py-3 font-semibold">{u.name}</td>
                      <td className="px-4 py-3">{u.role}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.status === 'Active' ? 'bg-green-100 text-green-700' : u.status === 'Invited' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.lastLogin || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </AuthGate>
  );
}
