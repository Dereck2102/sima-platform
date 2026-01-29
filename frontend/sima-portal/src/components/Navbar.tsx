"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface NavbarProps {
  user?: { name: string; role: string };
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const storeUser = useAuthStore((s) => s.user);
  const effectiveUser = user || storeUser;

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image src="/uce-logo.png" alt="UCE logo" width={40} height={40} priority className="h-10 w-10" />
          <h1 className="text-2xl font-bold">SIMA Platform</h1>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-blue-400">Dashboard</Link>
          <Link href="/users" className="hover:text-blue-400">Users</Link>
          <Link href="/assets" className="hover:text-blue-400">Assets</Link>
          <Link href="/reports" className="hover:text-blue-400">Reports</Link>
          {effectiveUser && (
            <div className="flex items-center gap-4 border-l pl-4 border-slate-700">
              <span className="text-sm">
                {effectiveUser.name || 'User'} <span className="text-xs text-blue-300">({effectiveUser.role || 'ROLE'})</span>
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
          <Link href="/" className="block py-2 hover:text-blue-400">Dashboard</Link>
          <Link href="/users" className="block py-2 hover:text-blue-400">Users</Link>
          <Link href="/assets" className="block py-2 hover:text-blue-400">Assets</Link>
          <Link href="/reports" className="block py-2 hover:text-blue-400">Reports</Link>
        </div>
      )}
    </nav>
  );
};
