"use client";

import React, { useState } from 'react';
import { FiMonitor, FiCpu, FiBell, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function PreferencesPage() {
  const [pref, setPref] = useState({
    theme: 'light',
    aiAssistant: true,
    notifications: true,
    realtimeSync: true
  });

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <motion.div 
        animate={{ x: active ? 24 : 2 }}
        initial={false}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiMonitor className="text-blue-500" /> Interface Preferences
        </h2>
        
        <div className="bg-gray-50/50 rounded-[2.5rem] border border-gray-100 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm"><FiBell className="text-gray-400" /></div>
              <div>
                <p className="font-bold text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-400">Receive alerts when collaborators edit your pages</p>
              </div>
            </div>
            <Toggle active={pref.notifications} onClick={() => setPref(p => ({ ...p, notifications: !p.notifications }))} />
          </div>

          <div className="h-px bg-gray-100 w-full" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm"><FiCpu className="text-gray-400" /></div>
              <div>
                <p className="font-bold text-gray-900">AI Sidekick</p>
                <p className="text-xs text-gray-400">Enable Gemini-powered workspace analysis and chat</p>
              </div>
            </div>
            <Toggle active={pref.aiAssistant} onClick={() => setPref(p => ({ ...p, aiAssistant: !p.aiAssistant }))} />
          </div>

          <div className="h-px bg-gray-100 w-full" />

          <div className="flex items-center justify-between opacity-50">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm"><FiMonitor className="text-gray-400" /></div>
              <div>
                <p className="font-bold text-gray-900">Dark Mode</p>
                <p className="text-xs text-gray-400">Switch to a dark color palette (Coming Soon)</p>
              </div>
            </div>
            <Toggle active={false} onClick={() => {}} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiLock className="text-indigo-500" /> Privacy & Sync
        </h2>
        
        <div className="bg-gray-50/50 rounded-[2.5rem] border border-gray-100 p-8">
           <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm"><FiMonitor className="text-gray-400" /></div>
              <div>
                <p className="font-bold text-gray-900">Real-time Presence</p>
                <p className="text-xs text-gray-400">Show your active status to friends in the workspace</p>
              </div>
            </div>
            <Toggle active={pref.realtimeSync} onClick={() => setPref(p => ({ ...p, realtimeSync: !p.realtimeSync }))} />
          </div>
        </div>
      </section>

      <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] flex items-center justify-between">
        <p className="text-sm text-blue-600/70 font-medium">These settings are saved locally on this browser.</p>
        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 tracking-tight">Restore Defaults</button>
      </div>
    </div>
  );
}
