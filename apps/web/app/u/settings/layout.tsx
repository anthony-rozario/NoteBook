"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiUser, FiSettings, FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { id: 'profile', label: 'Edit Profile', icon: FiUser, href: '/u/settings/profile' },
    { id: 'preferences', label: 'Preferences', icon: FiSettings, href: '/u/settings/preferences' },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full">
      {/* Settings Navigation */}
      <aside className="w-full md:w-80 bg-gray-50/50 border-r border-gray-100 flex flex-col p-6 overflow-y-auto">
        <div className="mb-8">
          <Link 
            href="/u"
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors gap-2 mb-4"
          >
            <FiArrowLeft /> Back to Library
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account and app behavior</p>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-white shadow-sm ring-1 ring-gray-100 text-blue-600' 
                    : 'text-gray-500 hover:bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                  }`}>
                    <item.icon size={18} />
                  </div>
                  <span className="font-semibold text-sm md:text-base">{item.label}</span>
                </div>
                <FiChevronRight className={`transition-transform ${isActive ? 'translate-x-0' : '-translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Settings Content Area */}
      <main className="flex-1 bg-white overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto p-6 md:p-12 pb-24">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
