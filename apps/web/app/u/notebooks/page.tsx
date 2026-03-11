// apps/web/app/u/notebooks/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { FiSearch, FiBook } from 'react-icons/fi';
import CreateNotebookButton from '@/components/CreateNotebookButton';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

// 1. Framer Motion Animation Rules
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, ease: "easeOut" },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

// Helper function for dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

export default function NotebooksPage() {
  const { user, isLoading: userLoading } = useUser();
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch ALL notebooks (no limit)
  const fetchAllNotebooks = async (userId: string) => {
    const { data } = await supabase
      .from('notebooks')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
      
    if (data) setNotebooks(data);
    setLoading(false);
  };

  useEffect(() => {
    if (userLoading || !user?.id) return;

    // Initial fetch
    fetchAllNotebooks(user.id);

    // Auto-update if a notebook is added/changed
    const channel = supabase
      .channel('realtime-all-notebooks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notebooks', filter: `user_id=eq.${user.id}` },
        () => fetchAllNotebooks(user.id)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, userLoading]);

  // Instantly filter notebooks based on the search bar!
  const filteredNotebooks = notebooks.filter(notebook => 
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (notebook.description && notebook.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Smooth loading skeleton
  if (userLoading || loading) {
    return (
      <motion.div key="notebooks-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto space-y-8">
        <div className="animate-pulse h-16 bg-gray-100 rounded-xl w-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="animate-pulse h-48 bg-gray-100 rounded-xl w-full"></div>)}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      key="notebooks-content"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10"
    >
      
      {/* HEADER - Slides in first */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Notebooks</h1>
          <p className="text-gray-500 mt-1 text-sm">Organize your thoughts, research, and projects.</p>
        </div>
        
        <CreateNotebookButton className="bg-white text-blue-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 active:scale-95" />
      </motion.div>

      {/* SEARCH BAR - Slides in second */}
      <motion.div variants={itemVariants} className="relative w-full md:max-w-lg">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search notebooks..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-50 rounded-xl text-sm transition-all outline-none shadow-sm"
        />
      </motion.div>

      {/* NOTEBOOKS GRID - Cards slide in sequentially */}
      {filteredNotebooks.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
            <FiBook size={24} />
          </div>
          <p className="text-gray-900 font-semibold mb-1">No notebooks found</p>
          <p className="text-gray-500 text-sm">
            {searchQuery ? "Try adjusting your search terms." : "You don't have any notebooks yet."}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredNotebooks.map((notebook) => (
            <motion.div variants={itemVariants} key={notebook.id}>
              <Link href={`/u/notebooks/${notebook.id}`} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer group">
                <div className="w-10 h-10 bg-blue-50 text-[#3b82f6] rounded-lg flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <FiBook size={20} />
                </div>
                
                <div className="flex-1 mb-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight">{notebook.title}</h3>
                  
                  {notebook.category && (
                    <p className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider mb-2">
                      {notebook.category}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {notebook.description || "No description provided."}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                  <span className="text-xs text-gray-400">
                    Updated {formatDate(notebook.updated_at)}
                  </span>
                  <span className="text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">
                    Notebook
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

    </motion.div>
  );
}