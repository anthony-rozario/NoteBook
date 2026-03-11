"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/UserContext';

export default function CreateNotebookButton({ 
  className = "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 active:scale-95" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    // STEP 1: Create the Notebook (The Binder)
    const { data: newNotebook, error: notebookError } = await supabase
      .from('notebooks')
      .insert({
        user_id: user.id,
        title,
        category,
        description,
        type: 'digital' // Default to digital text
      })
      .select() // Ask Supabase to return the created row
      .single();

    if (notebookError || !newNotebook) {
      console.error("Error creating notebook:", notebookError);
      alert("Failed to create notebook.");
      setLoading(false);
      return;
    }

    // STEP 2: Create the first blank "MS Word" style Page inside it
    const { error: pageError } = await supabase
      .from('pages')
      .insert({
        notebook_id: newNotebook.id,
        user_id: user.id,
        title: 'Untitled Page 1',
        content: '', // Blank canvas ready for typing
        position_index: 1
      });

    if (pageError) {
      console.error("Error creating initial page:", pageError);
      // We don't block the UI here, but it's good to log
    }

    setLoading(false);
    setIsOpen(false);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0" onClick={() => setIsOpen(false)} 
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create New Notebook</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                <input 
                  type="text" name="title" required autoFocus placeholder="e.g., MCA Semester Project"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category (Optional)</label>
                <input 
                  type="text" name="category" placeholder="e.g., KIIT REPORTS"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  name="description" rows={3} placeholder="What will this notebook contain?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Notebook'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        <FiPlus size={18} /> New Notebook
      </button>
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}