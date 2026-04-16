"use client";

// app/u/home/page.tsx  (or wherever your dashboard route is)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import CreateNotebookButton from '@/components/CreateNotebookButton';
import {
  FiClock, FiBook, FiUsers, FiCpu, FiZap,
} from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

// ── Types ─────────────────────────────────────────────────────────────────────
type DashboardData = {
  recentNotebooks: {
    id: string; title: string; type: string; updated_at: string; has_ai_summary: boolean; description?: string;
  }[];
  aiInsights: {
    id: string; notebook_id: string; notebookTitle: string; summary_content: string;
    key_takeaways: { key_takeaways: string[]; topics: string[] };
    created_at: string;
  }[];
  networkUsers: { id: string; name: string; initials: string; action: string }[];
  workspaceUsage: { used: number; limit: number };
};

// ── Time helper ───────────────────────────────────────────────────────────────
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const cardColors = [
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-teal-100', text: 'text-teal-600' },
];

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
];

// ── Dashboard Page ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, profile } = useUser();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const displayFirstName =
    profile?.name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    'there';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard');
        const json: DashboardData = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const latestInsight = data?.aiInsights?.[0];
  const usagePct = data ? Math.round((data.workspaceUsage.used / data.workspaceUsage.limit) * 100) : 0;

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-8 md:p-12 z-10 relative">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1c1c21] tracking-tight mb-2">
            Welcome back, {displayFirstName}
          </h1>
          <p className="text-gray-500 font-medium">
            Here is what's happening with your workspace today.
          </p>
        </div>
        <CreateNotebookButton className="flex items-center justify-center gap-2 bg-[#1c1c21] hover:bg-black text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg" />
      </div>

      {/* ── AI Insights Banner ─────────────────────────────────────────────── */}
      <div className={`mb-8 rounded-2xl p-5 border flex items-start gap-4 ${
        latestInsight
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
          : 'bg-gray-50 border-gray-100'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          latestInsight ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
        }`}>
          <BsStars size={20} />
        </div>
        {latestInsight ? (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-blue-700 mb-1">
              Latest AI Insight — {latestInsight.notebookTitle}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {latestInsight.summary_content}
            </p>
            {latestInsight.key_takeaways?.topics?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {latestInsight.key_takeaways.topics.slice(0, 4).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1">
            <p className="text-sm text-gray-500 font-medium">
              No AI insights yet. Open a notebook and click{' '}
              <span className="font-bold text-gray-700">"Run AI Analysis"</span> to see magic here.
            </p>
          </div>
        )}
      </div>

      {/* ── Two Column Layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left col — Recent Notebooks */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1c1c21] flex items-center gap-2">
              <FiClock size={18} className="text-gray-400" /> Recent Notebooks
            </h2>
            <button
              onClick={() => router.push('/u/notebooks')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All
            </button>
          </div>

          {data?.recentNotebooks && data.recentNotebooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.recentNotebooks.map((nb, idx) => {
                const colors = cardColors[idx % cardColors.length];
                return (
                  <div
                    key={nb.id}
                    onClick={() => router.push(`/u/notebooks/${nb.id}`)}
                    className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-start gap-4"
                  >
                    <div className={`w-11 h-11 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center shrink-0`}>
                      <FiBook size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1c1c21] text-sm mb-0.5 truncate">{nb.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <span>{timeAgo(nb.updated_at)}</span>
                        <span>·</span>
                        <span className="uppercase">{nb.type || 'digital'}</span>
                        {nb.has_ai_summary && (
                          <>
                            <span>·</span>
                            <span className="text-blue-500 flex items-center gap-1">
                              <FiCpu size={10} /> AI
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <FiBook className="mx-auto text-gray-200 mb-3" size={36} />
              <p className="text-gray-500 font-medium mb-4">No notebooks yet.</p>
              <CreateNotebookButton className="inline-flex items-center gap-2 bg-[#1c1c21] text-white px-4 py-2 rounded-full text-sm font-semibold" />
            </div>
          )}
        </div>

        {/* Right col — Sidebar widgets */}
        <div className="space-y-6">

          {/* Workspace Usage */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Workspace Usage
            </p>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-[#1c1c21]">{data?.workspaceUsage.used}</span>
              <span className="text-gray-400 font-medium text-sm mb-1">/ {data?.workspaceUsage.limit}</span>
              <span
                onClick={() => router.push('/u/notebooks')}
                className="ml-auto text-sm font-semibold text-blue-600 cursor-pointer hover:underline"
              >
                Notebooks
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${usagePct >= 80 ? 'bg-orange-400' : 'bg-[#1c1c21]'}`}
                style={{ width: `${Math.min(usagePct, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 font-medium">
              {usagePct >= 80
                ? 'Running low — upgrade for unlimited notebooks.'
                : 'Upgrade to Pro for unlimited notebooks.'}
            </p>
          </div>

          {/* Network — real collaborators only */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-sm font-bold text-[#1c1c21] flex items-center gap-2 mb-4">
              <FiUsers size={16} className="text-gray-500" /> Network
            </p>

            {data?.networkUsers && data.networkUsers.length > 0 ? (
              <div className="space-y-3">
                {data.networkUsers.map((u, i) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarColors[i % avatarColors.length]}`}>
                      {u.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1c1c21] leading-tight">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <FiUsers className="mx-auto text-gray-200 mb-2" size={28} />
                <p className="text-xs text-gray-400 font-medium">
                  No collaborators yet. Share a page to see your network here.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push('/u/collaboration')}
              className="mt-4 w-full text-center text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors py-2 border border-gray-100 rounded-xl hover:border-blue-100 hover:bg-blue-50"
            >
              + Invite Collaborators
            </button>
          </div>

          {/* AI Hub shortcut */}
          <div
            onClick={() => router.push('/u/ai')}
            className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 cursor-pointer hover:opacity-90 transition-opacity text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <FiZap size={20} />
              <p className="font-bold">AI Hub</p>
            </div>
            <p className="text-sm text-blue-100 leading-snug">
              Ask questions about your notes, generate summaries, and create study materials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
