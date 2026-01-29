"use client";

import React, { useEffect, useState } from 'react';
import { Users, Package, BarChart3, Zap } from 'lucide-react';
import { Card } from '../components/Card';
import { Navbar } from '../components/Navbar';
import { AuthGate } from '../components/AuthGate';
import { fetchJson } from '../lib/api';

type StatItem = {
  title: string;
  value: string | number;
  icon: JSX.Element;
  color: string;
  trend?: { direction: 'up' | 'down'; value: number };
};

type DashboardResponse = {
  stats: Array<{ title: string; value: number; trendDirection?: 'up' | 'down'; trendValue?: number }>;
  activities: string[];
  health: { cpu?: number; memory?: number; disk?: number };
};

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [health, setHealth] = useState<{ cpu?: number; memory?: number; disk?: number }>({});

  useEffect(() => {
    const load = async () => {
      const res = await fetchJson<DashboardResponse>('/dashboard');
      if (res.error || !res.data) {
        setError(res.error || 'No data');
        setLoading(false);
        return;
      }
      const mapped: StatItem[] = res.data.stats.map((s, idx) => ({
        title: s.title,
        value: s.value,
        icon: [<Users key="u" size={32} />, <Package key="p" size={32} />, <Zap key="z" size={32} />, <BarChart3 key="b" size={32} />][idx % 4],
        color: ['border-blue-500', 'border-green-500', 'border-yellow-500', 'border-purple-500'][idx % 4],
        trend: s.trendDirection && s.trendValue !== undefined ? { direction: s.trendDirection, value: s.trendValue } : undefined,
      }));
      setStats(mapped);
      setActivities(res.data.activities || []);
      setHealth(res.data.health || {});
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AuthGate allowedRoles={['SUPER_ADMIN']}>
      <Navbar />
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h2>

        {loading && <p className="text-sm text-gray-600">Loading...</p>}
        {error && !loading && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.length === 0 ? (
                <p className="text-sm text-gray-500">No stats available.</p>
              ) : (
                stats.map((stat, idx) => (
                  <Card
                    key={idx}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                    trend={stat.trend}
                  />
                ))
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Recent Activities</h3>
                <div className="space-y-3 text-sm">
                  {activities.length === 0 ? (
                    <p className="text-gray-500">No activities yet.</p>
                  ) : (
                    activities.map((a) => (
                      <p key={a} className="text-gray-600">{a}</p>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">System Health</h3>
                <div className="space-y-3">
                  {['cpu', 'memory', 'disk'].map((k) => {
                    const val = (health as any)[k];
                    return (
                      <div key={k}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">{k.toUpperCase()}</span>
                          <span className="text-sm font-bold">{val !== undefined ? `${val}%` : 'N/A'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: val !== undefined ? `${Math.min(100, val)}%` : '0%' }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGate>
  );
};

export default Dashboard;
