import React from 'react';
import { Users, Package, BarChart3, Zap } from 'lucide-react';
import { Card } from '../components/Card';
import { Navbar } from '../components/Navbar';

export const Dashboard: React.FC = () => {
  const stats = [
    { title: 'Total Users', value: 1250, icon: <Users size={32} />, color: 'border-blue-500', trend: { direction: 'up' as const, value: 12 } },
    { title: 'Active Assets', value: 856, icon: <Package size={32} />, color: 'border-green-500', trend: { direction: 'up' as const, value: 8 } },
    { title: 'System Uptime', value: '99.9%', icon: <Zap size={32} />, color: 'border-yellow-500' },
    { title: 'Avg Response Time', value: '142ms', icon: <BarChart3 size={32} />, color: 'border-purple-500' },
  ];

  return (
    <>
      <Navbar user={{ name: 'Dereck Amacoria', role: 'SUPER_ADMIN' }} />
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <Card
              key={idx}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Recent Activities</h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-600">✓ User DSAMACORIA logged in</p>
              <p className="text-gray-600">✓ Asset AST-001 status updated</p>
              <p className="text-gray-600">✓ Report RPT-042 generated</p>
              <p className="text-gray-600">✓ New device DEV-015 registered</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">System Health</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">CPU Usage</span>
                  <span className="text-sm font-bold">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Memory</span>
                  <span className="text-sm font-bold">62%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Disk</span>
                  <span className="text-sm font-bold">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
