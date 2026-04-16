// components/editor/EditorHeader.tsx
import React from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiCheck, FiLayers, FiImage, FiType, FiUserPlus } from 'react-icons/fi';

interface EditorHeaderProps {
  notebook: any;
  activePageId?: string; // NEW
  isSaving: boolean;
  viewMode: 'images' | 'text';
  setViewMode: (mode: 'images' | 'text') => void;
  showExtractButton: boolean;
  isExtractingAll: boolean;
  extractionProgress: { current: number, total: number };
  onExtractAll: () => void;
  onOpenSharePanel: () => void; // NEW
}

export default function EditorHeader({
  notebook, activePageId, isSaving, viewMode, setViewMode, 
  showExtractButton, isExtractingAll, extractionProgress, onExtractAll, onOpenSharePanel
}: EditorHeaderProps) {
  return (
    <div className="h-16 flex items-center justify-between px-6 shrink-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-200">
      <div className="flex items-center gap-4">
        <Link href="/u/dashboard">
          <button className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"><FiChevronLeft size={22} /></button>
        </Link>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-[#1c1c21] leading-tight">{notebook?.title || "Loading..."}</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            {isSaving ? <span className="text-blue-500 animate-pulse">Saving changes...</span> : <><FiCheck size={12} className="text-green-500" /> Saved to cloud</>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
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