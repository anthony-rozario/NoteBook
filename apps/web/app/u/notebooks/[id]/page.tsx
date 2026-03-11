// apps/web/app/u/notebooks/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FiChevronLeft, FiShare2, FiClock, FiMoreVertical } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotebookEditor() {
  const params = useParams();
  const router = useRouter();
  const notebookId = params.id as string;
  const supabase = createClient();

  const [notebook, setNotebook] = useState<any>(null);
  const [activePage, setActivePage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch the notebook and its first page
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get the notebook details
        const { data: nbData, error: nbError } = await supabase
          .from('notebooks')
          .select('*')
          .eq('id', notebookId)
          .single();
          
        if (nbError) throw nbError;
        if (nbData) setNotebook(nbData);

        // 2. Get the pages for this notebook (Ordered by position)
        const { data: pagesData, error: pagesError } = await supabase
          .from('pages')
          .select('*')
          .eq('notebook_id', notebookId)
          .order('position_index', { ascending: true });

        if (pagesError) throw pagesError;
        if (pagesData && pagesData.length > 0) {
          setActivePage(pagesData[0]); // Load the first page by default
        }
      } catch (error) {
        console.error("Error fetching document data:", error);
        // You could add a setErrorMessage state here in the future
      } finally {
        // This GUARANTEES the loading spinner goes away, no matter what!
        setLoading(false);
      }
    };

    if (notebookId) fetchData();
  }, [notebookId]);

  // Handle auto-saving when the user types
  const handleContentChange = async (newTitle: string, newContent: string) => {
    if (!activePage) return;
    
    // Optimistically update the UI instantly
    setActivePage({ ...activePage, title: newTitle, content: newContent });
    setSaving(true);

    // Save to Supabase
    const { error } = await supabase
      .from('pages')
      .update({ title: newTitle, content: newContent, updated_at: new Date().toISOString() })
      .eq('id', activePage.id);

    if (!error) {
      setTimeout(() => setSaving(false), 500); // Small delay so the "Saving..." text doesn't flicker too fast
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#f3f4f6]">Loading document...</div>;
  }

  if (!notebook) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f3f4f6]">
        <h2 className="text-xl font-bold text-gray-800">Notebook not found</h2>
        <button onClick={() => router.push('/u/notebooks')} className="mt-4 text-blue-600 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    // The "Desk" - Grey background filling the screen
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] -m-4 sm:-m-8 pb-12 flex flex-col font-sans">
      
      {/* EDITOR TOP BAR */}
      <div className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/u/notebooks" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <FiChevronLeft size={20} />
          </Link>
          <div className="h-4 w-px bg-gray-300"></div>
          <span className="text-sm font-semibold text-gray-700 truncate max-w-50">{notebook.title}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md hidden sm:inline-block">
            {saving ? 'Saving...' : 'Saved to cloud'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Share Button Placeholder */}
          <button className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
            <FiShare2 size={16} /> Share
          </button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <FiClock size={18} />
          </button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <FiMoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* THE PHYSICAL PAPER */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-8 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          // Here is the MS Word magic: max-w-[816px] (standard letter width) and min-h-[1056px]
          className="mx-auto w-full max-w-204 min-h-264 bg-white shadow-xl ring-1 ring-gray-200 rounded-sm"
        >
          {activePage ? (
            // The "Margins" of the paper (p-12 sm:p-20)
            <div className="flex flex-col h-full p-10 sm:p-16 md:p-24">
              
              {/* Auto-resizing Page Title */}
              <input
                type="text"
                value={activePage.title}
                onChange={(e) => handleContentChange(e.target.value, activePage.content)}
                placeholder="Page Title"
                className="text-4xl sm:text-5xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none focus:ring-0 bg-transparent mb-8 w-full"
              />

              {/* The Body Content */}
              <textarea
                value={activePage.content || ''}
                onChange={(e) => handleContentChange(activePage.title, e.target.value)}
                placeholder="Start typing your notes here..."
                className="flex-1 w-full text-lg text-gray-800 placeholder-gray-300 border-none outline-none focus:ring-0 bg-transparent resize-none leading-relaxed"
                style={{ minHeight: '500px' }}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No pages found in this notebook.
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}