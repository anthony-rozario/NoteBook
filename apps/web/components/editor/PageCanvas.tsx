// components/editor/PageCanvas.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { EditorContent } from '@tiptap/react';
import { FiType } from 'react-icons/fi';

interface PageCanvasProps {
  page: any;
  index: number;
  isActive: boolean;
  showEditor: boolean;
  notebookType: string;
  editor: any;
  onSelect: () => void;
}

export default function PageCanvas({ page, index, isActive, showEditor, notebookType, editor, onSelect }: PageCanvasProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => !isActive && onSelect()}
      className={`relative w-full max-w-204 min-h-[1056px] h-auto bg-white rounded-sm shadow-md transition-all shrink-0 overflow-hidden ${isActive ? 'ring-2 ring-blue-400' : 'ring-1 ring-gray-200 opacity-60 hover:opacity-100 cursor-pointer'}`}
    >
      <div className="absolute -left-16 top-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden xl:block">Page {index + 1}</div>
      
      {!showEditor ? (
        <div className="w-full h-full flex justify-center bg-gray-50">
          {page.image_url
            ? <img src={page.image_url} alt={`Page ${index + 1}`} className="w-full h-auto object-contain" />
            : <div className="p-24 text-gray-400">No scan available for this page.</div>}
        </div>
      ) : (
        <div className="h-full p-20 md:p-24 flex flex-col cursor-text min-h-[1056px]">
          {(!page.content && notebookType === 'pdf') ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
              <FiType size={40} className="opacity-20" />
              <p>No text extracted yet. Click "Extract All Text" above.</p>
            </div>
          ) : isActive ? (
            <EditorContent editor={editor} className="flex-1" />
          ) : (
            <div className="flex-1 prose prose-slate max-w-none pointer-events-none" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
          )}
        </div>
      )}
    </motion.div>
  );
}