"use client";

import { useEffect, useState } from 'react';
import { Package, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/Card';
import { fetchJson } from '../../lib/api';
import { AuthGate } from '../../components/AuthGate';

type Asset = { id: string; name: string; status: string; location?: string; lastCheck?: string };
type AssetStats = { title: string; value: number };

export default function AssetsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assetStats, setAssetStats] = useState<AssetStats[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetchJson<{ stats: AssetStats[]; assets: Asset[] }>('/assets');
      if (res.error || !res.data) {
        setError(res.error || 'No data');
        setLoading(false);
        return;
      }
      setAssetStats(res.data.stats || []);
      setAssets(res.data.assets || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AuthGate allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ASSET_MANAGER']}>
      <Navbar />
      <main className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Inventory</p>
            <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          </div>
          <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
            New Asset
          </button>
        </div>

        {loading && <p className="text-sm text-gray-600">Loading...</p>}
        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {assetStats.length === 0 ? (
                <p className="text-sm text-gray-500">No asset stats available.</p>
              ) : (
                assetStats.map((s, idx) => (
                  <Card
                    key={s.title}
                    title={s.title}
                    value={s.value}
                    icon={[<Package key="p" size={28} />, <ShieldCheck key="s" size={28} />, <AlertTriangle key="a" size={28} />][idx % 3]}
                    color={['border-blue-500', 'border-green-500', 'border-yellow-500'][idx % 3]}
                  />
                ))
              )}
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <table className="min-w-full">
                <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Last check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
                  {assets.length === 0 ? (
                    <tr><td className="px-4 py-3 text-gray-500" colSpan={5}>No assets available.</td></tr>
                  ) : (
                    assets.map((a) => (
                      <tr key={a.id}>
                        <td className="px-4 py-3 font-semibold">{a.id}</td>
                        <td className="px-4 py-3">{a.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.status === 'Healthy' ? 'bg-green-100 text-green-700' : a.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{a.location || '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{a.lastCheck || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </AuthGate>
  );
}
