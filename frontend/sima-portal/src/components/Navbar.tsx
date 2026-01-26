import React, { useState } from 'react';
import { Menu, LogOut, Settings } from 'lucide-react';

interface NavbarProps {
  user?: { name: string; role: string };
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">SIMA Platform</h1>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <a href="/dashboard" className="hover:text-blue-400">Dashboard</a>
          <a href="/users" className="hover:text-blue-400">Users</a>
          <a href="/assets" className="hover:text-blue-400">Assets</a>
          <a href="/reports" className="hover:text-blue-400">Reports</a>
          {user && (
            <div className="flex items-center gap-4 border-l pl-4 border-slate-700">
              <span className="text-sm">
                {user.name} <span className="text-xs text-blue-300">({user.role})</span>
              </span>
              <Settings size={20} className="cursor-pointer hover:text-blue-400" />
              <LogOut size={20} className="cursor-pointer hover:text-red-400" onClick={onLogout} />
            </div>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-2 text-center">
          <a href="/dashboard" className="block py-2 hover:text-blue-400">Dashboard</a>
          <a href="/users" className="block py-2 hover:text-blue-400">Users</a>
          <a href="/assets" className="block py-2 hover:text-blue-400">Assets</a>
          <a href="/reports" className="block py-2 hover:text-blue-400">Reports</a>
        </div>
      )}
    </nav>
  );
};
