"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation'; // Added Router
import { FiPlus, FiX, FiFileText, FiUploadCloud } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/UserContext';

export default function CreateNotebookButton({ 
  className = "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 active:scale-95" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [creationType, setCreationType] = useState<'digital' | 'pdf'>('digital');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  const { user } = useUser();
  const supabase = createClient();
  const router = useRouter(); // Initialize router

  useEffect(() => { setMounted(true); }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) return;
    if (creationType === 'pdf' && !pdfFile) {
      alert("Please select a PDF file first.");
      return;
    }
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    // STEP 1: Create the Notebook Binder
    const { data: newNotebook, error: notebookError } = await supabase
      .from('notebooks')
      .insert({
        user_id: user.id,
        title,
        category,
        description: creationType === 'digital' ? description : 'Imported PDF Document',
        type: creationType, 
      })
      .select()
      .single();

    if (notebookError || !newNotebook) {
      console.error("Error creating notebook:", notebookError);
      alert("Failed to create notebook.");
      setLoading(false);
      return;
    }

    if (creationType === 'digital') {
      await supabase.from('pages').insert({
        notebook_id: newNotebook.id,
        user_id: user.id,
        title: 'Untitled Page 1',
        content: '', 
        position_index: 1
      });
    } else {
      const fileExt = pdfFile!.name.split('.').pop();
      const filePath = `${user.id}/${newNotebook.id}/document.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('notebook_files')
        .upload(filePath, pdfFile!);

      if (uploadError) {
        console.error("Upload error:", uploadError);
      } 
    }

    setLoading(false);
    setIsOpen(false);
    setPdfFile(null); 
    
    // TELEPORT THE USER TO THE NEW NOTEBOOK!
    router.push(`/u/notebooks/${newNotebook.id}`);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Modal Box */}
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1c1c21]">New Notebook</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><FiX size={20} /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-left">
              
              <div className="flex p-1 bg-gray-50 border border-gray-200 rounded-xl mb-4">
                <button type="button" onClick={() => setCreationType('digital')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${creationType === 'digital' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>
                  <FiFileText size={16} /> Blank Document
                </button>
                <button type="button" onClick={() => setCreationType('pdf')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${creationType === 'pdf' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>
                  <FiUploadCloud size={16} /> Import PDF
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input type="text" name="title" required autoFocus placeholder={creationType === 'digital' ? "e.g., Advanced React Patterns" : "e.g., Lecture 4 Slides"} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category (Optional)</label>
                <input type="text" name="category" placeholder="e.g., KIIT REPORTS" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none" />
              </div>

              <AnimatePresence mode="wait">
                {creationType === 'digital' ? (
                  <motion.div key="digital" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">Description (Optional)</label>
                    <textarea name="description" rows={3} placeholder="What will this notebook contain?" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none resize-none"></textarea>
                  </motion.div>
                ) : (
                  <motion.div key="pdf" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">Upload File *</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors relative cursor-pointer group">
                      <div className="space-y-1 text-center">
                        <FiUploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-blue-500" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>{pdfFile ? pdfFile.name : 'Click to upload a PDF'}</span>
                            <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-6">
                <button type="submit" disabled={loading} className="w-full px-4 py-3.5 bg-[#1c1c21] hover:bg-black text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-50">
                  {loading ? (creationType === 'pdf' ? 'Uploading...' : 'Creating...') : 'Create Notebook'}
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
        <FiPlus size={18} /> {className.includes('New Notebook') ? 'New Notebook' : 'Create Notebook'}
      </button>
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}