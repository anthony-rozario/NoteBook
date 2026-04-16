"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import CreateNotebookButton from '@/components/CreateNotebookButton';
import {
  FiSearch, FiMoreVertical, FiBook, FiClock,
  FiStar, FiFilter, FiTrash2, FiCpu, FiX,
  FiFileText, FiCheckCircle, FiAlertCircle,
} from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const cardColors = [
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-teal-100', text: 'text-teal-600' },
];

// ── AI Analysis Modal ─────────────────────────────────────────────────────────
type Analysis = {
  summary: string;
  key_takeaways: string[];
  topics: string[];
  question_paper: { question: string; type: string }[];
};

function AIAnalysisModal({
  notebookTitle,
  analysis,
  onClose,
}: {
  notebookTitle: string;
  analysis: Analysis;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'summary' | 'questions'>('summary');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <BsStars size={20} />
            </div>
            <div>
              <h2 className="font-bold text-[#1c1c21] text-lg">AI Analysis</h2>
              <p className="text-sm text-gray-500 truncate max-w-xs">{notebookTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Topics row */}
        {analysis.topics && analysis.topics.length > 0 && (
          <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2 shrink-0">
            {analysis.topics.map((t, i) => (
              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-2 shrink-0">
          {(['summary', 'questions'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors capitalize ${
                tab === t ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {t === 'summary' ? 'Summary & Key Points' : 'Question Paper'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === 'summary' ? (
            <>
              {/* Summary */}
              <div>
                <h3 className="font-semibold text-[#1c1c21] mb-3 flex items-center gap-2">
                  <FiFileText size={16} className="text-blue-500" /> Summary
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">{analysis.summary}</p>
              </div>

              {/* Key Takeaways */}
              {analysis.key_takeaways && analysis.key_takeaways.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#1c1c21] mb-3 flex items-center gap-2">
                    <FiCheckCircle size={16} className="text-green-500" /> Key Takeaways
                  </h3>
                  <ul className="space-y-2">
                    {analysis.key_takeaways.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="mt-0.5 w-5 h-5 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              {analysis.question_paper && analysis.question_paper.length > 0 ? (
                analysis.question_paper.map((q, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-7 h-7 bg-white border border-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-[#1c1c21] font-medium leading-relaxed">{q.question}</p>
                        <span className={`mt-2 inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wide ${
                          q.type === 'mcq' ? 'bg-purple-50 text-purple-600' :
                          q.type === 'long' ? 'bg-orange-50 text-orange-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {q.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No questions generated.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NotebooksPage() {
  const { user, profile } = useUser();
  const supabase = createClient();
  const router = useRouter();

  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // AI Analysis states
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisModal, setAnalysisModal] = useState<{ title: string; data: Analysis } | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const displayFirstName =
    profile?.name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    'there';
  const organization = profile?.university || profile?.company || 'daily';
  const focusArea = profile?.major || profile?.role || 'workspace';

  useEffect(() => {
    const fetchNotebooks = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('notebooks')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        if (error) throw error;
        if (data) setNotebooks(data);
      } catch (error) {
        console.error('Error fetching notebooks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotebooks();
  }, [user, supabase]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDeleteNotebook = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this notebook? This cannot be undone.')) {
      setOpenDropdownId(null);
      return;
    }
    try {
      const { error } = await supabase.from('notebooks').delete().eq('id', id);
      if (error) throw error;
      setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
    } catch (error) {
      alert('Failed to delete notebook. Please try again.');
    } finally {
      setOpenDropdownId(null);
    }
  };

  const handleAnalysisClick = async (e: React.MouseEvent, notebook: any) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdownId(null);
    setAnalysisError(null);

    // If already analyzed, fetch existing summary from DB first
    if (notebook.has_ai_summary) {
      const { data: existing } = await supabase
        .from('ai_summaries')
        .select('summary_content, key_takeaways')
        .eq('notebook_id', notebook.id)
        .single();

      if (existing?.key_takeaways) {
        setAnalysisModal({ title: notebook.title, data: existing.key_takeaways as Analysis });
        return;
      }
    }

    setAnalyzingId(notebook.id);
    try {
      const res = await fetch('/api/ai/analyze-notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebookId: notebook.id }),
      });

      const json = await res.json();
      if (!res.ok) {
        setAnalysisError(json.error || 'Analysis failed. Please try again.');
        return;
      }

      // Mark notebook as analyzed in local state
      setNotebooks((prev) =>
        prev.map((nb) => (nb.id === notebook.id ? { ...nb, has_ai_summary: true } : nb))
      );

      setAnalysisModal({ title: notebook.title, data: json.analysis as Analysis });
    } catch (err: any) {
      setAnalysisError('Failed to connect to AI service.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const filteredNotebooks = notebooks.filter(
    (nb) =>
      nb.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nb.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-8 md:p-12 z-10 relative">
      {/* AI Analysis Modal */}
      {analysisModal && (
        <AIAnalysisModal
          notebookTitle={analysisModal.title}
          analysis={analysisModal.data}
          onClose={() => setAnalysisModal(null)}
        />
      )}

      {/* Error toast */}
      {analysisError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl shadow-lg font-medium text-sm">
          <FiAlertCircle size={16} />
          {analysisError}
          <button onClick={() => setAnalysisError(null)} className="ml-2 text-red-400 hover:text-red-600">
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#1c1c21] tracking-tight mb-2">
            {displayFirstName}'s Notebooks
          </h1>
          <p className="text-gray-500 font-medium">
            Organize your {organization} work, research, and {focusArea} projects.
          </p>
        </div>
        <CreateNotebookButton className="flex items-center justify-center gap-2 bg-[#1c1c21] hover:bg-black text-white px-5 py-3 sm:py-2.5 rounded-xl sm:rounded-full font-semibold transition-all shadow-md hover:shadow-lg w-full sm:w-auto" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 shrink-0">
        <div className="relative w-full sm:max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notebooks..."
            className="w-full bg-white border border-gray-200 text-gray-900 rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0">
            <FiFilter size={14} /> Filter
          </button>
          <div className="h-6 w-px bg-gray-200 mx-1" />
          {['All', 'Recent', 'Favorites'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors shrink-0 ${
                activeFilter === filter
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'text-gray-500 hover:bg-gray-100 border border-transparent'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Notebooks Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filteredNotebooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotebooks.map((notebook, index) => {
            const colors = cardColors[index % cardColors.length];
            const isDropdownOpen = openDropdownId === notebook.id;
            const isThisAnalyzing = analyzingId === notebook.id;

            return (
              <div key={notebook.id} className="relative group h-full">
                <div
                  onClick={() => router.push(`/u/notebooks/${notebook.id}`)}
                  className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 hover:border-blue-100 transition-all cursor-pointer flex flex-col h-full min-h-[200px]"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${colors.bg} ${colors.text} rounded-2xl flex items-center justify-center shadow-sm`}>
                      <FiBook size={20} />
                    </div>

                    <div className={`flex items-center gap-1 transition-opacity ${isDropdownOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <FiStar size={16} />
                      </button>

                      <div
                        className="relative"
                        onMouseEnter={() => setOpenDropdownId(notebook.id)}
                        onMouseLeave={() => setOpenDropdownId(null)}
                      >
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className={`p-2 rounded-full transition-colors ${isDropdownOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'}`}
                        >
                          <FiMoreVertical size={18} />
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute right-0 top-8 w-52 bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-xl py-2 z-50">
                            <button
                              onClick={(e) => handleAnalysisClick(e, notebook)}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <BsStars className="text-blue-500" size={16} />
                              {notebook.has_ai_summary ? 'View AI Analysis' : 'Run AI Analysis'}
                            </button>
                            <div className="h-px bg-gray-100 my-1 mx-4" />
                            <button
                              onClick={(e) => handleDeleteNotebook(e, notebook.id)}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                            >
                              <FiTrash2 size={16} /> Delete Notebook
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1c1c21] text-lg mb-1.5 line-clamp-2 leading-tight">
                      {notebook.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-400 line-clamp-2">
                      {notebook.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                      <FiClock size={12} />
                      <span>{timeAgo(notebook.updated_at)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isThisAnalyzing && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] uppercase font-bold tracking-wider rounded-md border border-blue-100 flex items-center gap-1 animate-pulse">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin border border-transparent border-t-blue-500" /> Analyzing…
                        </span>
                      )}
                      {!isThisAnalyzing && notebook.has_ai_summary && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] uppercase font-bold tracking-wider rounded-md border border-blue-100 flex items-center gap-1 shadow-sm">
                          <FiCpu size={10} /> Analyzed
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-wider rounded-md border border-gray-100">
                        Notebook
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center bg-white/50 border border-dashed border-gray-200 rounded-[2rem] text-center p-8 mt-4">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <FiSearch className="text-gray-300" size={28} />
          </div>
          <h3 className="text-xl font-bold text-[#1c1c21] mb-2">No notebooks found</h3>
          <p className="text-gray-500 font-medium max-w-sm mb-6">
            {searchQuery
              ? "We couldn't find any notebooks matching your search. Try adjusting your filters or create a new one."
              : "You haven't created any notebooks yet. Start by creating one!"}
          </p>
          <CreateNotebookButton className="flex items-center gap-2 bg-[#1c1c21] hover:bg-black text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg" />
        </div>
      )}
    </div>
  );
}
