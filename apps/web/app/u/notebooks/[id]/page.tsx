// app/u/notebooks/[id]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';
import { useUser } from '@/context/UserContext';
import Tesseract from 'tesseract.js';
import { FiCpu, FiFileText, FiPlus } from 'react-icons/fi';

// Import our new components̥
import { FontSize } from '../../../lib/tiptap-extensions';
import RibbonToolbar from '@/components/editor/RibbonToolbar';
import EditorHeader from '@/components/editor/EditorHeader';
import DocumentOutline from '@/components/editor/DocumentOutline';
import PageCanvas from '@/components/editor/PageCanvas';
import PageSharePanel from '@/components/editor/PageSharePanel';

export default function NotebookEditor() {
  const params = useParams();
  const notebookId = params.id as string;
  const supabase = createClient();
  const { user } = useUser();

  // State Management
  const [notebook, setNotebook] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [activePage, setActivePage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'images' | 'text'>('images');
  const [isExtractingAll, setIsExtractingAll] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 });
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState<any[]>([]);

  const activePageRef = useRef<any>(null);
  useEffect(() => { activePageRef.current = activePage; }, [activePage]);
  const saveTimer = useRef<NodeJS.Timeout>();

  const fetchCollaborators = async () => {
    if (!activePageRef.current) return;
    
    // We join with the auth.users table to get the email (requires Supabase RPC or careful querying depending on your auth setup. 
    // If querying auth.users fails due to permissions, fetch just the collab data first).
    const { data, error } = await supabase
      .from('page_collaborators')
      .select('*, users:user_id(email)') // Assumes you have a public.users table mirroring auth.users
      .eq('page_id', activePageRef.current.id);
      
    if (data) setActiveCollaborators(data);
  };

  // TipTap Initialization
  const editor = useEditor({
    extensions: [
      StarterKit, Underline, TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, Color, FontFamily, FontSize, Highlight.configure({ multicolor: true }),
    ],
    immediatelyRender: false,
    editorProps: { attributes: { class: 'prose prose-slate max-w-none focus:outline-none min-h-full' } },
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        handleSaveContent(editor.getHTML());
        setTimeout(() => setIsSaving(false), 800);
      }, 600);
    },
  });

  // Data Fetching
  const fetchNotebookPages = async () => {
    const { data } = await supabase.from('pages').select('*').eq('notebook_id', notebookId).order('position_index', { ascending: true });
    if (data && data.length > 0) {
      setPages(data);
      if (!activePageRef.current) {
        setActivePage(data[0]);
        editor?.commands.setContent(data[0].content || '');
      }
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.id) return;
      const { data: nbData } = await supabase.from('notebooks').select('*').eq('id', notebookId).single();
      if (nbData) setNotebook(nbData);
      
      const { data: pagesData } = await supabase.from('pages').select('*').eq('notebook_id', notebookId).order('position_index', { ascending: true });
      if (pagesData && pagesData.length > 0) {
        setPages(pagesData);
        setActivePage(pagesData[0]);
        editor?.commands.setContent(pagesData[0].content || '');
        if (pagesData.every(p => p.content)) setViewMode('text');
      }
      setLoading(false);
    };
    if (notebookId && editor) fetchInitialData();
  }, [notebookId, editor, supabase, user]);

  // Actions
  const processPdfImages = async () => {
    try {
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: `${user?.id}/${notebookId}/document.pdf`, notebookId, userId: user?.id })
      });
      if (!response.ok) throw new Error("Processing failed.");
      await fetchNotebookPages();
    } catch (error: any) { alert(`Error: ${error.message}`); }
  };

  const handleExtractAll = async () => {
    const pagesToExtract = pages.filter(p => !p.content && p.image_url);
    if (pagesToExtract.length === 0) {
      alert("All pages have already been extracted!");
      setViewMode('text');
      return;
    }
    
    setIsExtractingAll(true);
    setExtractionProgress({ current: 0, total: pagesToExtract.length });
    let updatedPages = [...pages];
    
    try {
      for (let i = 0; i < pagesToExtract.length; i++) {
        const page = pagesToExtract[i];
        setExtractionProgress({ current: i + 1, total: pagesToExtract.length });
        
        // 1. Send the image URL to our new High-Accuracy AI Backend
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: page.image_url })
        });
        
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.error || "Extraction failed");
        
        // The AI already formatted it as perfect HTML for TipTap!
        const formattedHtml = result.html; 
        
        // 2. Save the perfectly formatted HTML to Supabase
        await supabase
          .from('pages')
          .update({ 
            ocr_text: formattedHtml.replace(/<[^>]*>?/gm, ''), // Strip HTML for the raw search index
            content: formattedHtml 
          })
          .eq('id', page.id);
          
        updatedPages = updatedPages.map(p => p.id === page.id ? { ...p, content: formattedHtml } : p);
      }
      
      setPages(updatedPages);
      setViewMode('text');
      
      // Update the active editor view if we are looking at an extracted page
      if (activePageRef.current) {
        const currentActive = updatedPages.find(p => p.id === activePageRef.current.id);
        if (currentActive) editor?.commands.setContent(currentActive.content || '');
      }
      
    } catch (error: any) { 
      alert(`High-Accuracy Extraction Failed: ${error.message}`); 
    } finally { 
      setIsExtractingAll(false); 
    }
  };

  const handlePageSwitch = (page: any) => { 
    setActivePage(page); 
    editor?.commands.setContent(page.content || ''); 
    setIsSharePanelOpen(false); // Close share panel on page change
  };


  const handleSaveContent = async (htmlContent: string) => {
    if (!activePageRef.current) return;
    const currentPage = activePageRef.current;
    setPages(prev => prev.map(p => p.id === currentPage.id ? { ...p, content: htmlContent } : p));
    await supabase.from('pages').update({ content: htmlContent }).eq('id', currentPage.id);
  };

  if (loading) return <div className="flex h-full items-center justify-center text-gray-400">Loading document...</div>;

  return (
    <div className="flex flex-col h-full font-sans overflow-hidden bg-[#e5e7eb] relative">
      <EditorHeader 
        notebook={notebook} 
        activePageId={activePage?.id}
        isSaving={isSaving} 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        showExtractButton={pages.some(p => !p.content && p.image_url)}
        isExtractingAll={isExtractingAll} 
        extractionProgress={extractionProgress}
        onExtractAll={handleExtractAll}
        onOpenSharePanel={() => {
          fetchCollaborators();
          setIsSharePanelOpen(true);
        }}
      />

      <RibbonToolbar editor={editor} />

      <div className="flex flex-1 overflow-hidden relative">
        <DocumentOutline pages={pages} activePageId={activePage?.id} onPageSwitch={handlePageSwitch} onAddPage={() => {}} />

        <div className="flex-1 overflow-y-auto overflow-x-auto p-8 md:p-12 flex flex-col items-center gap-10 bg-[#e5e7eb] custom-scrollbar">
          {pages.length === 0 ? (
            <div className="w-full max-w-204 flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-gray-200 shadow-sm text-center mt-10">
              {notebook?.type === 'pdf' ? (
                <>
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6"><FiCpu size={40} /></div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Notebook is Empty</h3>
                  <button onClick={processPdfImages} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-full shadow-lg transition-all mt-4">Process PDF Now</button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6"><FiFileText size={40} /></div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Start Writing</h3>
                  <button onClick={() => {}} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-full shadow-lg flex items-center gap-2 mt-4"><FiPlus size={20} /> Add First Page</button>
                </>
              )}
            </div>
          ) : (
            pages.map((page, index) => (
              <PageCanvas 
                key={page.id} page={page} index={index} 
                isActive={activePage?.id === page.id} 
                showEditor={notebook?.type !== 'pdf' || viewMode === 'text'} 
                notebookType={notebook?.type} editor={editor} 
                onSelect={() => handlePageSwitch(page)} 
              />
            ))
          )}
        </div>
        {isSharePanelOpen && activePage && (
          <PageSharePanel 
            pageId={activePage.id}
            ownerId={user?.id}
            activeCollaborators={activeCollaborators}
            onClose={() => setIsSharePanelOpen(false)}
            refreshData={fetchCollaborators}
          />
        )}
      </div>
    </div>
  );
}