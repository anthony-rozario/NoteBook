"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import { 
  FiFileText, FiClock, FiUsers, FiPlus, 
  FiMoreVertical, FiArrowRight, FiCpu
} from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

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
  return `${days}d ago`;
};

const cardColors = [
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-green-100', text: 'text-green-600' },
];

export default function DashboardPage() {
  const { profile, user } = useUser();
  const supabase = createClient();
  const displayFirstName = profile?.name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  const [recentNotebooks, setRecentNotebooks] = useState<any[]>([]);
  const [totalNotebooks, setTotalNotebooks] = useState(0);
  const [latestInsight, setLatestInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        const { count } = await supabase
          .from('notebooks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        setTotalNotebooks(count || 0);

        const { data: notebooksData } = await supabase
          .from('notebooks')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(4);

        if (notebooksData) setRecentNotebooks(notebooksData);

        const { data: insightData } = await supabase
          .from('ai_summaries')
          .select('*, notebooks(title)') 
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (insightData) setLatestInsight(insightData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, supabase]);

  const collaborators = [
    { name: 'Rahul S.', action: 'edited an hour ago', initial: 'R', color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Priya M.', action: 'viewed recently', initial: 'P', color: 'bg-rose-100 text-rose-700' },
  ];

  if (loading) {
    return <div className="flex h-full items-center justify-center text-gray-400 font-medium">Loading dashboard...</div>;
  }

  return (
    // Adjusted padding for mobile (p-5), tablet (sm:p-8), and desktop (lg:p-12)
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-5 sm:p-8 lg:p-12 z-10 relative">
      
      {/* 1. Header & Greeting */}
      {/* Changes layout to column on small screens, and perfectly aligns them on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8 lg:mb-10 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1c1c21] tracking-tight mb-1 sm:mb-2">
            Welcome back, {displayFirstName}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium">
            Here is what's happening with your workspace today.
          </p>
        </div>
        
        {/* Button becomes full width on mobile, and standard pill on tablet+ */}
        <Link href="/u/notebooks" className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1c1c21] hover:bg-black text-white px-5 py-3 sm:py-2.5 rounded-xl sm:rounded-full font-semibold transition-all shadow-md hover:shadow-lg">
            <FiPlus size={18} /> New Notebook
          </button>
        </Link>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 flex-1">
        
        {/* LEFT COLUMN: Insights & Recent Notes */}
        <div className="flex-1 flex flex-col gap-6 lg:gap-8">
          
          {/* AI Insights Banner */}
          {latestInsight ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-[20px] lg:rounded-[24px] p-5 sm:p-6 border border-blue-100 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <BsStars className="text-blue-500 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h3 className="text-[#1c1c21] font-bold text-base sm:text-lg flex items-center gap-2">
                      AI Insight Ready <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider rounded-full">New</span>
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 max-w-md leading-relaxed">
                      The summary for <span className="font-semibold text-gray-900">{latestInsight.notebooks?.title || 'your notebook'}</span> is complete. 
                    </p>
                  </div>
                </div>
                <Link href={`/u/notebooks/${latestInsight.notebook_id}`} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 bg-white border border-gray-100 px-4 py-2.5 sm:py-2 rounded-xl shadow-sm hover:shadow transition-all shrink-0">
                    View Summary <FiArrowRight />
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] lg:rounded-[24px] p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-10 h-10 bg-blue-50/50 rounded-xl shadow-sm border border-blue-100/50 flex items-center justify-center shrink-0">
                <BsStars className="text-blue-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                No AI insights generated yet. Open a notebook and click "Summarize" to see magic happen here.
              </p>
            </div>
          )}

          {/* Recent Notebooks Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#1c1c21] flex items-center gap-2">
                <FiClock className="text-gray-400" /> Recent Notebooks
              </h2>
              <Link href="/u/notebooks" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            {recentNotebooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {recentNotebooks.map((note, index) => {
                  const colors = cardColors[index % 4]; 
                  
                  return (
                    <Link key={note.id} href={`/u/notebooks/${note.id}`}>
                      <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-10 h-10 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center`}>
                            <FiFileText size={18} />
                          </div>
                          <button className="text-gray-400 hover:text-gray-800 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FiMoreVertical />
                          </button>
                        </div>
                        
                        <h3 className="font-bold text-[#1c1c21] text-base sm:text-lg mb-1 truncate">{note.title}</h3>
                        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-medium text-gray-500 flex-wrap">
                          <span>{timeAgo(note.updated_at)}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="uppercase tracking-wider">{note.type}</span>
                          
                          {note.has_ai_summary && (
                            <>
                              <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
                              <span className="flex items-center gap-1 text-blue-500">
                                <FiCpu size={12} /> Summarized
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 sm:py-12 bg-white/50 border border-dashed border-gray-200 rounded-[20px] lg:rounded-3xl">
                <FiFileText className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-gray-500 font-medium text-sm sm:text-base">You haven't created any notebooks yet.</p>
              </div>
            )}
          </div>
          
        </div>

        {/* RIGHT COLUMN: Collaborators & Activity */}
        <div className="w-full xl:w-80 flex flex-col sm:flex-row xl:flex-col gap-6 shrink-0">
          
          {/* Quick Storage Stat */}
          <div className="flex-1 bg-white rounded-[20px] lg:rounded-[24px] p-5 sm:p-6 border border-gray-100 shadow-sm">
             <h2 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Workspace Usage</h2>
             <div className="flex items-end justify-between mb-2">
               <span className="text-2xl font-bold text-[#1c1c21]">{totalNotebooks}<span className="text-base sm:text-lg text-gray-400 font-medium">/20</span></span>
               <span className="text-xs sm:text-sm font-semibold text-blue-600">Notebooks</span>
             </div>
             <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-[#1c1c21] rounded-full transition-all duration-1000" 
                 style={{ width: `${Math.min((totalNotebooks / 20) * 100, 100)}%` }}
               ></div>
             </div>
             <p className="text-[10px] sm:text-xs text-gray-500 mt-3 text-center">Upgrade to Pro for unlimited notebooks.</p>
          </div>

          {/* Active Collaborators Card */}
          <div className="flex-1 bg-gray-50/50 rounded-[20px] lg:rounded-[24px] p-5 sm:p-6 border border-gray-100">
            <h2 className="text-base sm:text-lg font-bold text-[#1c1c21] mb-5 sm:mb-6 flex items-center gap-2">
              <FiUsers className="text-gray-400" /> Network
            </h2>
            
            <div className="flex flex-col gap-4 sm:gap-5">
              {collaborators.map((collab, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${collab.color} flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 border-2 border-white shadow-sm`}>
                    {collab.initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1c1c21]">{collab.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{collab.action}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-5 sm:mt-6 py-2.5 border border-dashed border-gray-300 text-gray-500 rounded-xl text-xs sm:text-sm font-semibold hover:bg-white hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
              <FiPlus /> Invite Friends
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}