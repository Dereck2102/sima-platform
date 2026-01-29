"use client";

import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { fetchJson } from '../../lib/api';
import { AuthGate } from '../../components/AuthGate';

type Report = { id: string; title: string; author?: string; created?: string; status?: string; downloadUrl?: string };

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetchJson<{ reports: Report[] }>('/reports');
      if (res.error || !res.data) {
        setError(res.error || 'No data');
        setLoading(false);
        return;
      }
      setReports(res.data.reports || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AuthGate allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ANALYST']}>
      <Navbar />
      <main className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Analytics</p>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          </div>
          <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
            New Report
          </button>
        </div>

        {loading && <p className="text-sm text-gray-600">Loading...</p>}
        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full">
              <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
                {reports.length === 0 ? (
                  <tr><td className="px-4 py-3 text-gray-500" colSpan={6}>No reports available.</td></tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-semibold">{r.id}</td>
                      <td className="px-4 py-3">{r.title}</td>
                      <td className="px-4 py-3">{r.author || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{r.created || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {r.status || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 disabled:text-gray-400"
                          disabled={!r.downloadUrl}
                          onClick={() => r.downloadUrl && window.open(r.downloadUrl, '_blank')}
                        >
                          <Download size={16} /> Download
                        </button>
                      </td>
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
