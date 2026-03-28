"use client";

import React, { useEffect, useRef, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';

// ─── Page constants (Letter, 96 dpi) ────────────────────────────────────────
const PAGE_W   = 816;
const PAGE_H   = 1056;
const PAGE_GAP = 40;
const MARGIN_X = 96;   // left & right
const MARGIN_Y = 96;   // top & bottom per page

// Content height per page (area where text lives)
const CONTENT_H = PAGE_H - MARGIN_Y * 2;   // 864 px

// Full "slot" height each page occupies in the scroll (card + gap)
const PAGE_SLOT = PAGE_H + PAGE_GAP;

// ─── Component ───────────────────────────────────────────────────────────────
// Props mirror whatever your parent already passes down
interface WordEditorDeskProps {
  editor: any;       // TipTap editor instance
  // Remove the per-page props — we no longer need them
}

export function WordEditorDesk({ editor }: WordEditorDeskProps) {
  const [pageCount, setPageCount]       = useState(1);
  const [showRuler, setShowRuler]       = useState(true);
  const deskRef                         = useRef<HTMLDivElement>(null);

  // ── Watch ProseMirror height → update page count ─────────────────────────
  useEffect(() => {
    const el = document.querySelector('.ProseMirror') as HTMLElement | null;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const h = el.scrollHeight;
      setPageCount(Math.max(1, Math.ceil(h / CONTENT_H)));
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [editor]);

  // ── Keep cursor visible when it moves near a page break ──────────────────
  useEffect(() => {
    if (!editor) return;

    const onUpdate = () => {
      const { from } = editor.state.selection;
      const domEl = editor.view.domAtPos(from)?.node as HTMLElement | null;
      domEl?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    };

    editor.on('selectionUpdate', onUpdate);
    return () => editor.off('selectionUpdate', onUpdate);
  }, [editor]);

  // ── Background that paints page-break gray bands ─────────────────────────
  //   Each band = bottom margin of page N  +  PAGE_GAP  +  top margin of page N+1
  //   = MARGIN_Y + PAGE_GAP + MARGIN_Y = 232 px of non-content per break
  //
  //   The gradient repeats every PAGE_SLOT (1096 px):
  //     0 → CONTENT_H  : white (text area)
  //     CONTENT_H → PAGE_SLOT : gray (break zone)
  const breakBg = `repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent ${CONTENT_H}px,
    #b8bcc4 ${CONTENT_H}px,
    #b8bcc4 ${PAGE_SLOT}px
  )`;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#c1c4ca]">

      {/* ── Ruler ── */}
      <AnimatePresence>
        {showRuler && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 32, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 bg-[#f0f0f0] border-b border-gray-300 flex items-center overflow-hidden select-none z-10"
            style={{ paddingLeft: `calc(50% - ${PAGE_W / 2}px + ${MARGIN_X}px)` }}
          >
            <div
              className="relative text-[10px] text-gray-400 font-mono"
              style={{ width: PAGE_W - MARGIN_X * 2 }}
            >
              {/* Ruler ticks every 0.5 inch (48px) */}
              {Array.from({ length: 14 }).map((_, i) => {
                const isMajor = i % 2 === 0;
                const label   = i / 2;
                return (
                  <div
                    key={i}
                    className="absolute top-0 flex flex-col items-center"
                    style={{ left: i * 48 - 1 }}
                  >
                    <div className={`w-px bg-gray-400 ${isMajor ? 'h-3' : 'h-1.5'}`} />
                    {isMajor && label > 0 && (
                      <span className="mt-0.5 text-[9px] text-gray-400">{label}"</span>
                    )}
                  </div>
                );
              })}
              {/* Margin guides */}
              <div className="absolute top-0 left-0 bottom-0 w-px bg-blue-300 opacity-60" />
              <div className="absolute top-0 right-0 bottom-0 w-px bg-blue-300 opacity-60" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Desk scroll area ── */}
      <div
        ref={deskRef}
        className="flex-1 overflow-y-auto overflow-x-auto"
        style={{ background: '#c1c4ca' }}
      >
        {/* Centre column — exactly PAGE_W wide */}
        <div
          className="relative mx-auto"
          style={{
            width:     PAGE_W,
            // Total desk height = all page slots + bottom breathing room
            minHeight: pageCount * PAGE_SLOT + PAGE_GAP,
            marginTop: PAGE_GAP,
            marginBottom: PAGE_GAP * 2,
          }}
        >

          {/* ── Page card backgrounds (purely visual) ── */}
          {Array.from({ length: pageCount }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i === 0 ? 0 : 0.1 }}
              className="absolute bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18)]"
              style={{
                top:    i * PAGE_SLOT,
                left:   0,
                width:  PAGE_W,
                height: PAGE_H,
                // Subtle page texture
                backgroundImage:
                  'linear-gradient(rgba(0,0,0,0.005) 1px, transparent 1px)',
                backgroundSize: '100% 24px',
              }}
            >
              {/* Page number badge — left gutter */}
              <div
                className="absolute flex items-center gap-1.5 select-none"
                style={{ left: -52, top: 16 }}
              >
                <span className="text-[11px] font-semibold text-gray-400 tabular-nums">
                  {i + 1}
                </span>
              </div>

              {/* Top margin guide line */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-blue-200/60 pointer-events-none"
                style={{ top: MARGIN_Y }}
              />
              {/* Bottom margin guide line */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-blue-200/60 pointer-events-none"
                style={{ top: PAGE_H - MARGIN_Y }}
              />
            </motion.div>
          ))}

          {/* ── The single TipTap editor — overlaid on all pages ── */}
          {/*
            The editor is positioned absolutely so it can span across page cards.
            padding-top = MARGIN_Y  (first page top margin)
            padding-x   = MARGIN_X  (left & right margins)
            The background gradient paints the gray bands at page break positions,
            making it look like separate pages even though the editor is one div.

            IMPORTANT: set the editor's background to transparent in your global CSS:
              .ProseMirror { background: transparent; outline: none; }
          */}
          <div
            className="absolute inset-x-0 top-0 cursor-text"
            style={{
              paddingLeft:   MARGIN_X,
              paddingRight:  MARGIN_X,
              paddingTop:    MARGIN_Y,
              // The editor area grows to cover all page cards
              minHeight:     pageCount * PAGE_SLOT,
              // Paint gray break bands
              backgroundImage: breakBg,
              backgroundPosition: `0 ${CONTENT_H}px`,
              backgroundRepeat: 'repeat-y',
            }}
            onClick={() => editor?.commands.focus()}
          >
            <EditorContent
              editor={editor}
              className="word-editor-content"
            />
          </div>
        </div>
      </div>

      {/* ── Status bar (like Word's bottom bar) ── */}
      <div className="shrink-0 h-7 bg-[#2b579a] flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-blue-100">
            Page {pageCount} of {pageCount}
          </span>
          <span className="text-[11px] text-blue-200/60">|</span>
          <span className="text-[11px] text-blue-100">
            {editor?.storage?.characterCount?.words?.() ?? 0} words
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRuler(v => !v)}
            className="text-[11px] text-blue-200 hover:text-white transition-colors"
          >
            {showRuler ? 'Hide Ruler' : 'Show Ruler'}
          </button>
          {/* Zoom indicator */}
          <span className="text-[11px] text-blue-200">100%</span>
        </div>
      </div>
    </div>
  );
}

/**
 * ─── CSS to add to your globals.css ─────────────────────────────────────────
 *
 * .word-editor-content .ProseMirror {
 *   background: transparent;
 *   outline: none;
 *   min-height: 864px;       ← at least one page of content height
 *   font-family: 'Times New Roman', Times, serif;
 *   font-size: 12pt;         ← Word default
 *   line-height: 1.5;
 *   color: #000;
 *   caret-color: #000;
 * }
 *
 * .word-editor-content .ProseMirror p {
 *   margin-bottom: 0;
 *   min-height: 1.5em;       ← empty lines still occupy space
 * }
 *
 * .word-editor-content .ProseMirror:focus {
 *   outline: none;
 * }
 *
 * ─── If you use @tiptap/extension-character-count: ──────────────────────────
 * import CharacterCount from '@tiptap/extension-character-count'
 * // add to extensions array: CharacterCount
 *
 * ─── Minimal TipTap setup that works with this desk: ────────────────────────
 *
 * const editor = useEditor({
 *   extensions: [
 *     StarterKit,
 *     CharacterCount,
 *   ],
 *   content: '',
 *   autofocus: true,
 *   editorProps: {
 *     attributes: {
 *       spellcheck: 'true',
 *     },
 *   },
 * });
 */
