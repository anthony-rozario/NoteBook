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
import * as Y from 'yjs';
import { SupabaseProvider } from '@supabase-labs/y-supabase';
import Collaboration from '@tiptap/extension-collaboration';

import { useUser } from '@/context/UserContext';
import { FiCpu, FiFileText, FiPlus, FiLoader } from 'react-icons/fi';

// Import our components
import { FontSize } from '../../../lib/tiptap-extensions';
import RibbonToolbar from '@/components/editor/RibbonToolbar';
import EditorHeader from '@/components/editor/EditorHeader';
import DocumentOutline from '@/components/editor/DocumentOutline';
import PageCanvas from '@/components/editor/PageCanvas';
import SharePanel from '@/components/editor/SharePanel';

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
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [viewMode, setViewMode] = useState<'images' | 'text'>('images');
  const [isExtractingAll, setIsExtractingAll] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 });
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState<any[]>([]);
  const [processingPdf, setProcessingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [permissionLevel, setPermissionLevel] = useState<'owner' | 'editor' | 'viewer'>('owner');
  const isReadOnly = permissionLevel === 'viewer';

  const activePageRef = useRef<any>(null);
  useEffect(() => { activePageRef.current = activePage; }, [activePage]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const titleTimer = useRef<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const fetchCollaborators = async () => {
    if (!activePageRef.current) return;
    const { data } = await supabase
      .from('page_collaborators')
      .select('*, users:user_id(email)')
      .eq('page_id', activePageRef.current.id);
    if (data) setActiveCollaborators(data);
  };

  const [ydocState, setYdocState] = useState<any>(null);
  const [providerState, setProviderState] = useState<any>(null);

  // Real-time Provider Effect
  useEffect(() => {
    if (!activePage?.id || !user?.id) return;

    const doc = new Y.Doc();
    const roomName = `notebook-${notebookId}-page-${activePage.id}`;

    const provider = new SupabaseProvider(roomName, doc, supabase, {
      awareness: true,
      resyncInterval: 10000,
    });

    // Set ydoc immediately so Collaboration extension can attach
    setYdocState(doc);

    // Only expose providerState AFTER awareness is confirmed ready
    // This prevents CollaborationCursor from accessing `.doc` on an
    // uninitialized (undefined) awareness object.
    const trySetProvider = () => {
      const awareness = provider.getAwareness();
      if (awareness) {
        const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        awareness.setLocalStateField('user', {
          name: user.name || user.email?.split('@')[0] || 'Peer',
          color: userColor,
        });
        setProviderState(provider);

        const stateSize = awareness.getStates().size || 1;
        const isDocEmpty = doc.getXmlFragment('default').length === 0;
        if (isDocEmpty && stateSize <= 1 && activePage.content) {
          setTimeout(() => {
            localEditorRef.current?.commands.setContent(activePage.content, false);
          }, 200);
        }
      }
    };

    provider.on('synced', trySetProvider);

    // Fallback: if already synced immediately (cached), check right away
    trySetProvider();

    return () => {
      provider.destroy();
      doc.destroy();
      setYdocState(null);
      setProviderState(null);
    };
  }, [activePage?.id, user?.id]);

  // TipTap Initialization
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      ...(ydocState ? [
        Collaboration.configure({ document: ydocState }),
      ] : [])
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
  }, [ydocState, providerState]);

  const localEditorRef = useRef<any>(null);
  useEffect(() => { localEditorRef.current = editor; }, [editor]);

  // Data Fetching
  const fetchNotebookPages = async () => {
    const res = await fetch(`/api/notebook-data?notebookId=${notebookId}`);
    if (!res.ok) return;
    const { pages: data } = await res.json();
    if (data && data.length > 0) {
      setPages(data);
      if (!activePageRef.current) {
        setActivePage(data[0]);
      }
    }
  };

  // ─── Sync DB pages from existing storage PNGs (recovery) ──────────────────
  // If pngs already exist in storage (previous partial run) but DB has no rows,
  // this rebuilds the rows without re-processing the PDF.
  const syncPagesFromStorage = async (): Promise<boolean> => {
    if (!user?.id || !notebookId) return false;
    try {
      const prefix = `${user.id}/${notebookId}/`;
      const { data: storageFiles, error } = await supabase.storage
        .from('notebook_files')
        .list(`${user.id}/${notebookId}`, { limit: 200, sortBy: { column: 'name', order: 'asc' } });

      if (error || !storageFiles) return false;

      // Find page_N.png files and sort them numerically
      const pageFiles = storageFiles
        .filter(f => /^page_\d+\.png$/i.test(f.name))
        .sort((a, b) => {
          const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
          return numA - numB;
        });

      if (pageFiles.length === 0) return false;

      // Build DB rows
      const rows = pageFiles.map((f, i) => {
        const pageNum = parseInt(f.name.match(/\d+/)?.[0] || String(i + 1));
        const { data: { publicUrl } } = supabase.storage
          .from('notebook_files')
          .getPublicUrl(`${prefix}${f.name}`);
        return {
          notebook_id: notebookId,
          user_id: user.id,
          title: `Page ${pageNum}`,
          position_index: pageNum,
          image_url: publicUrl,
          content: '',
          ocr_text: null,
        };
      });

      const { error: insertError } = await supabase.from('pages').insert(rows);
      if (insertError) {
        console.error('Sync insert error:', insertError);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.id) return;

      // Use the admin API route so collaborators can also read the notebook
      // (direct Supabase client queries are blocked by RLS for non-owners)
      const res = await fetch(`/api/notebook-data?notebookId=${notebookId}`);
      if (!res.ok) {
        console.error('Failed to load notebook:', await res.text());
        setLoading(false);
        return;
      }
      const { notebook: nbData, pages: pagesData, permissionLevel: perm } = await res.json();
      if (perm) setPermissionLevel(perm);

      if (nbData) setNotebook(nbData);

      if (pagesData && pagesData.length > 0) {
        setPages(pagesData);
        setActivePage(pagesData[0]);
        if (pagesData.every((p: any) => p.content)) setViewMode('text');
      } else if (nbData?.type === 'pdf') {
        // PDF notebook with 0 DB pages — check if storage images already exist
        const synced = await syncPagesFromStorage();
        if (synced) {
          // Reload via API after sync
          const res2 = await fetch(`/api/notebook-data?notebookId=${notebookId}`);
          if (res2.ok) {
            const { pages: synced_pages } = await res2.json();
            if (synced_pages && synced_pages.length > 0) {
              setPages(synced_pages);
              setActivePage(synced_pages[0]);
            }
          }
        }
      }
      setLoading(false);
    };
    if (notebookId) fetchInitialData();
  }, [notebookId, user]);

  // Add a new blank page
  const handleAddPage = async () => {
    if (isAddingPage || !user?.id) return;
    setIsAddingPage(true);
    try {
      const res = await fetch('/api/add-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebookId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const newPage = json.page;
      setPages(prev => [...prev, newPage]);
      // Auto-switch to the new page
      setActivePage(newPage);
    } catch (err: any) {
      alert(`Failed to add page: ${err.message}`);
    } finally {
      setIsAddingPage(false);
    }
  };

  // Re-upload a PDF file in case the original upload failed
  const reuploadPdfFile = async (file: File) => {
    if (!user?.id || !notebookId) return;
    setProcessingPdf(true);
    try {
      const filePath = `${user.id}/${notebookId}/document.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('notebook_files')
        .upload(filePath, file, { contentType: 'application/pdf', upsert: true });
      
      if (uploadError) {
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          alert(`Storage bucket missing!\n\nGo to your Supabase dashboard:\nStorage → New Bucket → Name: notebook_files → Public: ON\n\nThen try again.`);
        } else {
          alert(`Upload failed: ${uploadError.message}`);
        }
        return;
      }
      // Now process the PDF
      await processPdfImages();
    } catch (err: any) {
      alert(`Re-upload failed: ${err.message}`);
    } finally {
      setProcessingPdf(false);
    }
  };

  // Process PDF using pdfjs-dist loaded dynamically in the browser
  const processPdfImages = async () => {
    if (!user?.id || !notebookId) return;
    setProcessingPdf(true);

    try {
      // Dynamically import pdfjs-dist to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      // Use a CDN worker to avoid bundling issues
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      // 1. Download the raw PDF binary from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('notebook_files')
        .download(`${user.id}/${notebookId}/document.pdf`);

      if (downloadError || !fileData) {
        throw new Error('Could not find the PDF file in Storage. Please re-upload the PDF.');
      }

      const arrayBuffer = await fileData.arrayBuffer();

      // 2. Load the PDF
      const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDocument.numPages;
      const pagesDataToInsert = [];

      console.log(`PDF Loaded. Rasterizing ${numPages} pages...`);
      setExtractionProgress({ current: 0, total: numPages });

      // 3. Loop through each page, render to canvas, upload
      for (let i = 1; i <= numPages; i++) {
        setExtractionProgress({ current: i, total: numPages });
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const canvasContext = canvas.getContext('2d');
        if (!canvasContext) continue;

        await page.render({ canvasContext, viewport }).promise;

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error(`Failed to convert page ${i} to image.`);

        const imageStoragePath = `${user.id}/${notebookId}/page_${i}.png`;

        const { error: uploadError } = await supabase.storage
          .from('notebook_files')
          .upload(imageStoragePath, blob, { contentType: 'image/png', upsert: true });

        if (uploadError) {
          console.error(`Failed to upload page ${i}:`, uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('notebook_files')
          .getPublicUrl(imageStoragePath);

        pagesDataToInsert.push({
          notebook_id: notebookId,
          user_id: user.id,
          title: `Page ${i}`,
          position_index: i,
          image_url: publicUrl,
          content: '',
          ocr_text: null,
        });
      }

      // 4. Insert all pages into the database
      const { error: dbError } = await supabase.from('pages').insert(pagesDataToInsert);
      if (dbError) throw dbError;

      setExtractionProgress({ current: 0, total: 0 });
      await fetchNotebookPages();
    } catch (error: any) {
      console.error('PDF Processing Error:', error);
      const msg: string = error?.message || String(error);
      if (
        msg.toLowerCase().includes('not found') ||
        msg.toLowerCase().includes('bucket') ||
        msg.toLowerCase().includes('could not find')
      ) {
        setPdfError('bucket_or_file_missing');
      } else {
        setPdfError(msg);
      }
    } finally {
      setProcessingPdf(false);
    }
  };

  const handleExtractAll = async () => {
    const pagesToExtract = pages.filter(p => !p.content && p.image_url);
    if (pagesToExtract.length === 0) {
      alert('All pages have already been extracted!');
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

        const response = await fetch('/api/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: page.image_url }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Extraction failed');

        const formattedHtml = result.html;

        await supabase
          .from('pages')
          .update({
            ocr_text: formattedHtml.replace(/<[^>]*>?/gm, ''),
            content: formattedHtml,
          })
          .eq('id', page.id);

        updatedPages = updatedPages.map(p => p.id === page.id ? { ...p, content: formattedHtml } : p);
      }

      setPages(updatedPages);
      setViewMode('text');

      if (activePageRef.current) {
        const currentActive = updatedPages.find(p => p.id === activePageRef.current.id);
        // TipTap editor syncs via Yjs automatically based on active room
      }
    } catch (error: any) {
      alert(`Text Extraction Failed: ${error.message}`);
    } finally {
      setIsExtractingAll(false);
      setExtractionProgress({ current: 0, total: 0 });
    }
  };

  const handlePageSwitch = (page: any) => {
    setActivePage(page);
    setIsSharePanelOpen(false);
    // Scroll the selected page into view
    setTimeout(() => {
      const el = pageRefs.current.get(page.id);
      if (el && scrollContainerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleSaveContent = async (htmlContent: string) => {
    if (!activePageRef.current) return;
    const currentPage = activePageRef.current;
    setPages(prev => prev.map(p => p.id === currentPage.id ? { ...p, content: htmlContent } : p));
    await supabase.from('pages').update({ content: htmlContent }).eq('id', currentPage.id);
    // Also update notebook's updated_at
    await supabase.from('notebooks').update({ updated_at: new Date().toISOString() }).eq('id', notebookId);
  };

  const handleRenameNotebook = (newTitle: string) => {
    setNotebook((prev: any) => prev ? { ...prev, title: newTitle } : prev);
    setIsSaving(true);
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(async () => {
      await supabase.from('notebooks').update({ title: newTitle }).eq('id', notebookId);
      setIsSaving(false);
    }, 600);
  };

  const handleRenamePage = (pageId: string, newTitle: string) => {
    setPages((prev: any[]) => prev.map(p => p.id === pageId ? { ...p, title: newTitle } : p));
    setIsSaving(true);
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(async () => {
      await supabase.from('pages').update({ title: newTitle }).eq('id', pageId);
      setIsSaving(false);
    }, 600);
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    
    // Optimistic UI Update
    const newPages = pages.filter(p => p.id !== pageId);
    setPages(newPages);
    
    if (activePage?.id === pageId) {
      if (newPages.length > 0) handlePageSwitch(newPages[0]);
      else {
        setActivePage(null);
        editor?.commands.setContent('');
      }
    }
    
    // DB Update
    await supabase.from('pages').delete().eq('id', pageId);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400 flex-col gap-3">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading document...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans overflow-hidden bg-[#e5e7eb] relative">
      <EditorHeader
        notebook={notebook}
        activePageId={activePage?.id}
        provider={providerState}
        isSaving={isSaving}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showExtractButton={pages.some(p => !p.content && p.image_url)}
        isExtractingAll={isExtractingAll}
        extractionProgress={extractionProgress}
        onExtractAll={handleExtractAll}
        onOpenSharePanel={() => setIsSharePanelOpen(true)}
        onRenameNotebook={handleRenameNotebook}
      />

      {!isReadOnly && <RibbonToolbar editor={editor} />}

      <div className="flex flex-1 overflow-hidden relative">
        <DocumentOutline
          pages={pages}
          activePageId={activePage?.id}
          onPageSwitch={handlePageSwitch}
          onAddPage={handleAddPage}
          onRenamePage={handleRenamePage}
          onDeletePage={handleDeletePage}
        />

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-auto p-8 md:p-12 flex flex-col items-center gap-10 bg-[#e5e7eb] custom-scrollbar">
          {pages.length === 0 ? (
            <div className="w-full max-w-2xl flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-gray-200 shadow-sm text-center mt-10">
              {notebook?.type === 'pdf' ? (
                <>
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                    <FiCpu size={40} />
                  </div>

                  {pdfError === 'bucket_or_file_missing' ? (
                    <>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">PDF File Not Found</h3>
                      <p className="text-gray-500 mb-2 max-w-sm text-sm">
                        The original PDF couldn't be found in storage. This usually means the storage bucket doesn't exist yet, or the upload failed silently.
                      </p>
                      <div className="w-full max-w-sm bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-left">
                        <p className="text-xs font-bold text-amber-800 mb-1">⚠️ If bucket is missing:</p>
                        <p className="text-xs text-amber-700">
                          Go to <strong>Supabase → Storage → New Bucket</strong><br />
                          Name: <code className="bg-amber-100 px-1 rounded">notebook_files</code> · Public: <strong>ON</strong>
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-3">Re-upload your PDF to fix it:</p>
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all flex items-center gap-2">
                        <FiPlus size={18} />
                        Select PDF to Re-upload
                        <input
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) { setPdfError(null); reuploadPdfFile(file); }
                          }}
                        />
                      </label>
                    </>
                  ) : pdfError ? (
                    <>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Failed</h3>
                      <p className="text-sm text-red-500 mb-4 max-w-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{pdfError}</p>
                      <button onClick={() => { setPdfError(null); processPdfImages(); }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all flex items-center gap-2">
                        <FiCpu size={18} /> Retry Processing
                      </button>
                    </>
                  ) : processingPdf ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-blue-600 font-medium text-sm">
                        {extractionProgress.total > 0
                          ? `Processing page ${extractionProgress.current} of ${extractionProgress.total}...`
                          : 'Initializing PDF...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Process Your PDF</h3>
                      <p className="text-gray-500 mb-6 max-w-sm text-sm">
                        Renders each PDF page as a high-resolution image, then you can extract all text via AI.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 items-center mt-2">
                        <button
                          onClick={processPdfImages}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-8 rounded-full shadow-lg transition-all flex items-center gap-2"
                        >
                          <FiCpu size={18} /> Process PDF Now
                        </button>
                        <button
                          onClick={async () => {
                            setPdfError(null);
                            const synced = await syncPagesFromStorage();
                            if (synced) {
                              await fetchNotebookPages();
                            } else {
                              setPdfError('No existing page images found in storage. Please use "Process PDF Now" instead.');
                            }
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 px-6 rounded-full transition-all flex items-center gap-2 text-sm border border-gray-200"
                        >
                          ↻ Already processed? Sync from Storage
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                    <FiFileText size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Start Writing</h3>
                  <p className="text-gray-500 mb-6">Add your first page to get started.</p>
                  <button
                    onClick={handleAddPage}
                    disabled={isAddingPage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-full shadow-lg flex items-center gap-2 mt-4 disabled:opacity-50"
                  >
                    {isAddingPage ? <FiLoader size={20} className="animate-spin" /> : <FiPlus size={20} />}
                    Add First Page
                  </button>
                </>
              )}
            </div>
          ) : (
            pages.map((page, index) => (
              <PageCanvas
                key={page.id}
                page={page}
                index={index}
                isActive={activePage?.id === page.id}
                showEditor={notebook?.type !== 'pdf' || viewMode === 'text'}
                notebookType={notebook?.type}
                editor={editor}
                onSelect={() => handlePageSwitch(page)}
                isReadOnly={isReadOnly}
                setRef={(el: HTMLDivElement | null) => {
                  if (el) pageRefs.current.set(page.id, el);
                  else pageRefs.current.delete(page.id);
                }}
              />
            ))
          )}
        </div>

        {isSharePanelOpen && (
          <SharePanel
            pageId={activePage?.id || null}
            notebookId={notebookId}
            ownerId={notebook?.user_id || user?.id}
            onClose={() => setIsSharePanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}