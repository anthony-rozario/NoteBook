"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  FiChevronLeft, FiCheck, FiCpu, FiPlus, FiFileText
} from 'react-icons/fi';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';

// --- The Modern Ribbon Toolbar ---
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 flex flex-col w-full select-none shrink-0 z-20">
      <div className="flex items-center px-8 py-3 gap-6 bg-gray-50/30">
        <div className="flex items-center gap-3 border-r border-gray-200 pr-6">
          <select className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-3 py-1.5 w-32 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm cursor-pointer">
            <option>Aptos (Body)</option>
            <option>Inter</option>
            <option>Merriweather</option>
          </select>
          <select className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-2 py-1.5 w-16 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm cursor-pointer">
            <option>11</option><option>12</option><option>14</option><option>16</option>
          </select>
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          <div className="flex gap-1 bg-white border border-gray-200 p-0.5 rounded-lg shadow-sm">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`w-8 h-8 flex items-center justify-center font-bold rounded-md transition-colors ${editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-100'}`}>B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`w-8 h-8 flex items-center justify-center italic rounded-md transition-colors ${editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-100'}`}>I</button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`w-8 h-8 flex items-center justify-center underline rounded-md transition-colors ${editor.isActive('underline') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-100'}`}>U</button>
          </div>
        </div>
        <div className="flex items-center gap-3 border-r border-gray-200 pr-6">
          <div className="flex gap-1 bg-white border border-gray-200 p-0.5 rounded-lg shadow-sm">
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-black' : 'text-gray-500 hover:bg-gray-100'}`}>≡L</button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-black' : 'text-gray-500 hover:bg-gray-100'}`}>≡C</button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-black' : 'text-gray-500 hover:bg-gray-100'}`}>≡R</button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => editor.chain().focus().setParagraph().run()} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${editor.isActive('paragraph') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Normal</button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-50 text-blue-700' : 'text-gray-800 hover:bg-gray-100'}`}>Heading 1</button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>Heading 2</button>
        </div>
      </div>
    </div>
  );
};

export default function NotebookEditor() {
  const params = useParams();
  const notebookId = params.id as string;
  const supabase = createClient();
  const { user } = useUser();

  const [notebook, setNotebook] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [activePage, setActivePage] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // FIX #2: Ref to always hold the latest activePage, avoiding stale closure in onUpdate
  const activePageRef = useRef<any>(null);
  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  // FIX #3: Debounce timer ref to avoid saving on every keystroke
  const saveTimer = useRef<NodeJS.Timeout>();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-full',
      },
    },
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      // FIX #3: Debounce — only save 600ms after the user stops typing
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        handleSaveContent(editor.getHTML());
        setTimeout(() => setIsSaving(false), 800);
      }, 600);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      const { data: nbData } = await supabase.from('notebooks').select('*').eq('id', notebookId).single();
      if (nbData) setNotebook(nbData);

      const { data: pagesData } = await supabase
        .from('pages')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('position_index', { ascending: true });

      // PDF PROCESSING TRIGGER — only when it's a fresh PDF with no pages yet
      if (nbData?.type === 'pdf' && (!pagesData || pagesData.length === 0)) {
        setIsExtracting(true);
        await extractRealPdf(nbData.id, user.id);

        // Re-fetch after extraction
        const { data: newPagesData } = await supabase
          .from('pages')
          .select('*')
          .eq('notebook_id', notebookId)
          .order('position_index', { ascending: true });

        if (newPagesData && newPagesData.length > 0) {
          setPages(newPagesData);
          setActivePage(newPagesData[0]);
          editor?.commands.setContent(newPagesData[0].content || '');
        }
        setIsExtracting(false);

      // FIX #1: Actually load pages for notebooks that already have them
      } else if (pagesData && pagesData.length > 0) {
        setPages(pagesData);
        setActivePage(pagesData[0]);
        editor?.commands.setContent(pagesData[0].content || '');
      }
      
      setLoading(false);
    };

    if (notebookId && editor) fetchData();
  }, [notebookId, editor, supabase, user]);

  // --- REAL PDF EXTRACTION ---
  const extractRealPdf = async (nbId: string, userId: string) => {
    try {
      const filePath = `${userId}/${nbId}/document.pdf`;

      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, notebookId: nbId, userId })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Backend Extraction Error:", result);
        alert(`Extraction failed: ${result.error}. Check browser console for details.`);
        return;
      }

      console.log("PDF Extraction Complete!");

    } catch (error) {
      console.error("Network process failed:", error);
      alert("There was a network issue reaching the extraction API.");
    }
  };

  const handlePageSwitch = (page: any) => {
    setActivePage(page);
    if (editor) {
      editor.commands.setContent(page.content || '');
      editor.commands.focus();
    }
  };

  const handleAddPage = async () => {
    if (!user) return;
    const newPos = pages.length > 0 ? pages[pages.length - 1].position_index + 1 : 1;
    
    const { data: newPage, error } = await supabase.from('pages').insert({
      notebook_id: notebookId, user_id: user.id, title: `Untitled Page ${newPos}`, content: '', position_index: newPos
    }).select().single();

    if (!error && newPage) {
      setPages(prev => [...prev, newPage]);
      handlePageSwitch(newPage);
    }
  };

  // FIX #2: Use activePageRef instead of activePage state to avoid stale closure
  const handleSaveContent = async (htmlContent: string) => {
    if (!activePageRef.current) return;
    const currentPage = activePageRef.current;
    setPages(prev => prev.map(p => p.id === currentPage.id ? { ...p, content: htmlContent } : p));
    await supabase
      .from('pages')
      .update({ content: htmlContent, updated_at: new Date().toISOString() })
      .eq('id', currentPage.id);
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center text-gray-400 font-medium">
      Loading document...
    </div>
  );
  
  if (isExtracting) return (
    <div className="flex flex-col h-full items-center justify-center bg-[#f8f9fa] text-center p-8">
      <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 relative">
        <FiCpu size={32} className="text-blue-600 animate-pulse" />
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-3xl animate-spin"></div>
      </div>
      <h2 className="text-2xl font-bold text-[#1c1c21] mb-2">Extracting PDF Data...</h2>
      <p className="text-gray-500 max-w-sm">NoteBook AI Hub is scanning your document and generating separate, editable pages.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full font-sans overflow-hidden bg-[#e5e7eb] relative">
      
      {/* 1. Top Title Bar */}
      <div className="h-16 flex items-center justify-between px-6 shrink-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/u/notebooks">
            <button className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
              <FiChevronLeft size={22} />
            </button>
          </Link>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[#1c1c21] leading-tight">{notebook?.title}</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              {isSaving ? (
                <span className="text-blue-500 animate-pulse">Saving changes...</span>
              ) : (
                <><FiCheck size={12} className="text-green-500" /> Saved to cloud</>
              )}
            </div>
          </div>
        </div>
      </div>

      <MenuBar editor={editor} />

      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. Left Navigation Pane (Pages) */}
        <div className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col shrink-0 z-10">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-400">Document Outline</span>
            <button onClick={handleAddPage} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm bg-white border border-gray-100" title="Add Page">
              <FiPlus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {pages.map((page, idx) => (
              <button
                key={page.id}
                onClick={() => handlePageSwitch(page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${activePage?.id === page.id ? 'bg-white shadow-sm border border-gray-100 text-blue-600' : 'text-gray-500 hover:bg-white/50 hover:text-gray-800 border border-transparent'}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activePage?.id === page.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  <FiFileText size={12} />
                </div>
                <span className="truncate">{page.title || `Page ${idx + 1}`}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. The Stacked Desk & Canvas */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-8 md:p-12 flex flex-col items-center gap-10 bg-[#e5e7eb] custom-scrollbar">
          {pages.map((page, index) => {
            const isActive = activePage?.id === page.id;
            return (
              <motion.div 
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => !isActive && handlePageSwitch(page)}
                className={`relative w-full max-w-204 min-h-264 h-auto bg-white rounded-sm shadow-md transition-all shrink-0 ${isActive ? 'ring-2 ring-blue-400' : 'ring-1 ring-gray-200 opacity-60 hover:opacity-100 cursor-pointer'}`}
              >
                <div className="absolute -left-16 top-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden xl:block">
                  Page {index + 1}
                </div>
                <div className="h-full p-20 md:p-24 flex flex-col cursor-text min-h-264">
                  {isActive ? (
                    <EditorContent editor={editor} className="flex-1" />
                  ) : (
                    <div className="flex-1 prose prose-slate max-w-none pointer-events-none" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
                  )}
                </div>
              </motion.div>
            );
          })}
          
          <button 
            onClick={handleAddPage}
            className="flex items-center justify-center gap-2 w-full max-w-204 py-6 bg-white/50 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 text-gray-500 hover:text-blue-600 rounded-2xl font-semibold transition-all mb-20 shadow-sm"
          >
            <FiPlus size={20} /> Add Next Page
          </button>
        </div>

      </div>
    </div>
  );
}