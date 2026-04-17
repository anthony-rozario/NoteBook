// components/editor/EditorHeader.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiCheck, FiLayers, FiImage, FiType, FiUserPlus } from 'react-icons/fi';

interface EditorHeaderProps {
  notebook: any;
  activePageId?: string; // NEW
  provider?: any;
  isSaving: boolean;
  viewMode: 'images' | 'text';
  setViewMode: (mode: 'images' | 'text') => void;
  showExtractButton: boolean;
  isExtractingAll: boolean;
  extractionProgress: { current: number, total: number };
  onExtractAll: () => void;
  onOpenSharePanel: () => void;
  onRenameNotebook?: (title: string) => void;
}

export default function EditorHeader({
  notebook, activePageId, provider, isSaving, viewMode, setViewMode, 
  showExtractButton, isExtractingAll, extractionProgress, onExtractAll, onOpenSharePanel, onRenameNotebook
}: EditorHeaderProps) {
  const [activePeers, setActivePeers] = useState<any[]>([]);

  useEffect(() => {
    if (!provider) {
      setActivePeers([]);
      return;
    }
    const awareness = provider.getAwareness();
    if (!awareness) return;
    const updatePeers = () => {
      const states = Array.from(awareness.getStates().values()) as any[];
      const peers = states.map(s => s.user).filter(Boolean);
      setActivePeers(peers);
    };
    awareness.on('change', updatePeers);
    updatePeers();
    return () => awareness.off('change', updatePeers);
  }, [provider]);

  return (
    <div className="h-16 flex items-center justify-between px-6 shrink-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-200">
      <div className="flex items-center gap-4">
        <Link href="/u/notebooks" >
          <button className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"><FiChevronLeft size={22} /></button>
        </Link>
        <div className="flex flex-col">
          <input
            type="text"
            value={notebook?.title || ''}
            onChange={(e) => onRenameNotebook?.(e.target.value)}
            className="text-lg font-bold text-[#1c1c21] leading-tight bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-200 rounded px-1 -ml-1 transition-all w-64"
            placeholder="Untitled Notebook"
          />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mt-0.5 ml-1">
            {isSaving ? <span className="text-blue-500 animate-pulse">Saving changes...</span> : <><FiCheck size={12} className="text-green-500" /> Saved to cloud</>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Online Peers Avatars */}
        {activePeers.length > 1 && (
          <div className="flex -space-x-2 mr-2">
            {activePeers.map((peer, i) => (
              <div key={i} className="group/peer relative">
                <div style={{ borderColor: peer.color || '#fff' }} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shadow-sm bg-gray-100 text-gray-700">
                  {peer.name?.slice(0,2).toUpperCase()}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-xl opacity-0 scale-95 group-hover/peer:opacity-100 group-hover/peer:scale-100 transition-all pointer-events-none z-50 text-xs font-bold">
                  {peer.name}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NEW: The Page-Level Share Button */}
        {activePageId && (
          <button 
            onClick={onOpenSharePanel}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-semibold transition-colors border border-blue-200"
          >
            <FiUserPlus size={16} />
            Share Page
          </button>
        )}

        {/* Existing Extract and Toggle Buttons */}
        {notebook?.type === 'pdf' && (
          <div className="flex items-center gap-4">
            {showExtractButton && (
              <button onClick={onExtractAll} disabled={isExtractingAll} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all text-sm disabled:opacity-50">
                {isExtractingAll ? <span className="animate-spin">⚙️</span> : <FiLayers size={16} />}
                {isExtractingAll ? `Extracting ${extractionProgress.current} / ${extractionProgress.total}` : 'Extract All Text'}
              </button>
            )}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button onClick={() => setViewMode('images')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'images' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <FiImage size={14} /> Scans
              </button>
              <button onClick={() => setViewMode('text')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'text' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <FiType size={14} /> Editor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}