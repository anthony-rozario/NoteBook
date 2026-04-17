"use client";

import React from 'react';
import { FiBell, FiBook, FiUsers, FiZap } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

export default function NotificationsPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-8 md:p-12 z-10 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1c1c21] tracking-tight mb-2">
            Notifications
          </h1>
          <p className="text-gray-500 font-medium">
            Stay updated on your notebooks and collaboration activity.
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-all">
          Mark all as read
        </button>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <FiBell size={36} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#1c1c21] mb-3">All Caught Up!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            No new notifications. We will let you know when someone shares a page with you or when your AI analysis is complete.
          </p>

          {/* Notification Types Preview */}
          <div className="w-full space-y-3 text-left">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">You will be notified about</p>
            {[
              { icon: FiUsers, label: 'Page shares & collaboration invites', color: 'bg-blue-100 text-blue-600' },
              { icon: BsStars, label: 'AI analysis completions', color: 'bg-purple-100 text-purple-600' },
              { icon: FiBook, label: 'Notebook activity updates', color: 'bg-teal-100 text-teal-600' },
              { icon: FiZap, label: 'New features and tips', color: 'bg-orange-100 text-orange-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50/60 rounded-xl border border-gray-100">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm ${item.color}`}>
                  <item.icon size={16} />
                </div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}