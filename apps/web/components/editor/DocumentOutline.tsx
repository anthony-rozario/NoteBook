// components/editor/DocumentOutline.tsx
import React, { useEffect, useRef } from 'react';
import { FiPlus, FiFileText, FiTrash2 } from 'react-icons/fi';

interface DocumentOutlineProps {
  pages: any[];
  activePageId?: string;
  onPageSwitch: (page: any) => void;
  onAddPage: () => void;
  onRenamePage?: (pageId: string, newTitle: string) => void;
  onDeletePage?: (pageId: string) => void;
}

export default function DocumentOutline({ pages, activePageId, onPageSwitch, onAddPage, onRenamePage, onDeletePage }: DocumentOutlineProps) {
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active page
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activePageId]);

  return (
    <div className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col shrink-0 z-10">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <span className="font-bold text-xs uppercase tracking-wider text-gray-400">Document Outline</span>
        <button onClick={onAddPage} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white border border-gray-100 rounded-lg">
          <FiPlus size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {pages.map((page, idx) => (
          <div
            key={page.id}
            ref={activePageId === page.id ? activeItemRef : null}
            className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all cursor-pointer ${activePageId === page.id ? 'bg-white shadow-sm border border-gray-100 text-blue-600' : 'text-gray-500 hover:bg-white/50 border border-transparent'}`}
            onClick={(e) => {
              // Only trigger switch if we didn't click delete
              if ((e.target as HTMLElement).closest('.delete-btn')) return;
              onPageSwitch(page);
            }}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activePageId === page.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
              <FiFileText size={12} />
            </div>
            
            <input 
              type="text"
              value={page.title || ''}
              onChange={(e) => onRenamePage?.(page.id, e.target.value)}
              placeholder={`Page ${idx + 1}`}
              className="flex-1 truncate bg-transparent outline-none border-none border-b border-transparent focus:border-blue-300 w-full"
            />

            {onDeletePage && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
                className="delete-btn opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-all shrink-0"
                title="Delete Page"
              >
                <FiTrash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}