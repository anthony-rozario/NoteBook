"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [creationType, setCreationType] = useState<'digital' | 'pdf'>('digital'); // The new toggle!
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  const { user } = useUser();
  const supabase = createClient();

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
        type: creationType, // 'digital' or 'pdf'
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
      // SCENARIO A: DIGITAL NOTEBOOK (Insert blank MS Word style page)
      await supabase.from('pages').insert({
        notebook_id: newNotebook.id,
        user_id: user.id,
        title: 'Untitled Page 1',
        content: '', 
        position_index: 1
      });
    } else {
      // SCENARIO B: PDF NOTEBOOK (Upload to storage, trigger backend processing)
      const fileExt = pdfFile!.name.split('.').pop();
      const filePath = `${user.id}/${newNotebook.id}/document.${fileExt}`;
      
      // 1. Upload the raw PDF to Supabase Storage (Assumes a 'notebook_files' bucket exists)
      const { error: uploadError } = await supabase.storage
        .from('notebook_files')
        .upload(filePath, pdfFile!);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Fallback or cleanup logic would go here
      } else {
        // 2. Call our Next.js API to process the PDF (OCR + Image Splitting)
        // We will build this API route next!
        console.log(`PDF uploaded to ${filePath}. Ready to trigger OCR backend...`);
        /* await fetch('/api/process-pdf', {
          method: 'POST',
          body: JSON.stringify({ notebookId: newNotebook.id, filePath })
        });
        */
      }
    }

    setLoading(false);
    setIsOpen(false);
    setPdfFile(null); // Reset
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create New Notebook</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><FiX size={20} /></button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-left">
              
              {/* THE TOGGLE SWITCH */}
              <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                <button 
                  type="button" onClick={() => setCreationType('digital')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${creationType === 'digital' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FiFileText size={16} /> Blank Document
                </button>
                <button 
                  type="button" onClick={() => setCreationType('pdf')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${creationType === 'pdf' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FiUploadCloud size={16} /> Import PDF
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                <input type="text" name="title" required autoFocus placeholder={creationType === 'digital' ? "e.g., Advanced React Patterns" : "e.g., Lecture 4 Slides"} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category (Optional)</label>
                <input type="text" name="category" placeholder="e.g., KIIT CLASSES" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none" />
              </div>

              {/* DYNAMIC BOTTOM SECTION based on toggle */}
              <AnimatePresence mode="wait">
                {creationType === 'digital' ? (
                  <motion.div key="digital" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                    <textarea name="description" rows={3} placeholder="What will this notebook contain?" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none resize-none"></textarea>
                  </motion.div>
                ) : (
                  <motion.div key="pdf" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Upload File *</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors relative cursor-pointer group">
                      <div className="space-y-1 text-center">
                        <FiUploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-blue-500" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>{pdfFile ? pdfFile.name : 'Upload a PDF file'}</span>
                            <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
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
        <FiPlus size={18} /> New Notebook
      </button>
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}