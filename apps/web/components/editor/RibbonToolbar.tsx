// components/editor/RibbonToolbar.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify,
  FiList, FiCornerUpLeft, FiCornerUpRight, FiScissors, FiCopy, FiClipboard,
  FiChevronDown, FiMinus, FiLink, FiCode, FiMessageSquare
} from 'react-icons/fi';

const COLORS = [
  '#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#d9d9d9','#ffffff',
  '#ff0000','#ff4500','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff',
  '#9900ff','#ff00ff','#ea4335','#fbbc04','#34a853','#4285f4','#a142f4','#e94235',
  '#c00000','#e06000','#bf8f00','#38761d','#134f5c','#1155cc','#351c75','#741b47',
];

const FONTS = [
  'Aptos', 'Arial', 'Calibri', 'Cambria', 'Comic Sans MS', 'Courier New',
  'Georgia', 'Helvetica', 'Impact', 'Lato', 'Merriweather', 'Montserrat',
  'Open Sans', 'Roboto', 'Times New Roman', 'Trebuchet MS', 'Verdana'
];
const SIZES = ['8','9','10','11','12','14','16','18','20','22','24','28','32','36','40','48','54','60','72'];

// --- Helper Components ---
function ColorPicker({ onSelect, current }: { onSelect: (c: string) => void; current?: string }) {
  return (
    <div className="absolute top-full left-0 z-50 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-xl w-48 grid grid-cols-8 gap-1">
      {COLORS.map(c => (
        <button
          key={c} onClick={() => onSelect(c)} title={c}
          className={`w-5 h-5 rounded-sm border hover:scale-110 transition-transform ${current === c ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-gray-300'}`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

const Sep = () => <div className="w-px self-stretch bg-gray-200 mx-1" />;

function RBtn({ onClick, active, disabled, title, children, wide = false }: any) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick?.(); }}
      disabled={disabled} title={title}
      className={`inline-flex items-center justify-center gap-1 ${wide ? 'px-2 min-w-[28px]' : 'w-7'} h-7 text-xs rounded transition-all select-none ${active ? 'bg-[#d4e4f7] border border-[#b3d0ee] text-[#0066cc]' : 'hover:bg-gray-200 text-gray-700 border border-transparent'} disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function Group({ label, children, className = '' }: any) {
  return (
    <div className={`flex flex-col items-stretch border-r border-gray-200 pr-3 mr-1 ${className}`}>
      <div className="flex items-center gap-0.5 flex-wrap flex-1">{children}</div>
      <span className="text-[9px] text-gray-400 text-center mt-1 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}

// --- Main Ribbon Component ---
export default function RibbonToolbar({ editor }: { editor: any }) {
  const [activeTab, setActiveTab] = useState<'Home' | 'Insert' | 'Layout' | 'Review' | 'View'>('Home');
  const [fontInput, setFontInput] = useState('Aptos');
  const [sizeInput, setSizeInput] = useState('11');
  const [showFontDrop, setShowFontDrop] = useState(false);
  const [showSizeDrop, setShowSizeDrop] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');

  const fontRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLDivElement>(null);
  const hlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!fontRef.current?.contains(e.target as Node)) setShowFontDrop(false);
      if (!sizeRef.current?.contains(e.target as Node)) setShowSizeDrop(false);
      if (!tcRef.current?.contains(e.target as Node)) setShowTextColor(false);
      if (!hlRef.current?.contains(e.target as Node)) setShowHighlight(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!editor) return null;

  const applyFont = (f: string) => { setFontInput(f); setShowFontDrop(false); editor.chain().focus().setFontFamily(f).run(); };
  const applySize = (s: string) => { setSizeInput(s); setShowSizeDrop(false); (editor.chain().focus() as any).setFontSize(s).run(); };
  
  // Cut/Copy/Paste logic...
  const handleCut = () => document.execCommand('cut');
  const handleCopy = () => document.execCommand('copy');
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text).run();
    } catch { document.execCommand('paste'); }
  };
  
  const indent = () => editor.chain().focus().sinkListItem('listItem').run();
  const outdent = () => editor.chain().focus().liftListItem('listItem').run();

  const stylePresets = [
    { label: 'Normal', preview: 'AaBbCc', cls: 'text-sm text-gray-800', action: () => editor.chain().focus().setParagraph().run(), active: () => editor.isActive('paragraph') && !editor.isActive('heading') },
    { label: 'No Spacing', preview: 'AaBbCc', cls: 'text-sm text-gray-800', action: () => editor.chain().focus().setParagraph().run(), active: () => false },
    { label: 'Heading 1', preview: 'AaBbCc', cls: 'text-base font-bold text-[#2b579a]', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: () => editor.isActive('heading', { level: 1 }) },
    { label: 'Heading 2', preview: 'AaBbCc', cls: 'text-sm font-semibold text-[#2b579a]', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: () => editor.isActive('heading', { level: 2 }) },
    { label: 'Heading 3', preview: 'AaBb..', cls: 'text-sm font-medium italic text-[#2b579a]', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: () => editor.isActive('heading', { level: 3 }) },
    { label: 'Title', preview: 'Title', cls: 'text-xl font-bold tracking-wide text-gray-900', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: () => false },
    { label: 'Subtitle', preview: 'Subtitle', cls: 'text-sm italic text-gray-500', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: () => false },
    { label: 'Quote', preview: '" AaBb"', cls: 'text-sm italic text-gray-600 border-l-2 border-gray-400 pl-1', action: () => editor.chain().focus().toggleBlockquote().run(), active: () => editor.isActive('blockquote') },
  ];

  return (
    <div className="flex flex-col w-full select-none shrink-0 z-20 bg-[#f3f2f1] border-b border-gray-300 shadow-sm font-sans">
      {/* TABS */}
      <div className="flex items-end bg-white border-b border-gray-200 px-3 pt-1.5 gap-0.5 text-[12px]">
        {(['Home','Insert','Layout','Review','View'] as const).map(tab => (
          <button
            key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-t transition-colors font-medium ${activeTab === tab ? 'bg-[#f3f2f1] border border-b-[#f3f2f1] border-gray-300 text-gray-800 -mb-px relative z-10' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* HOME TAB BODY */}
      {activeTab === 'Home' && (
        <div className="flex items-stretch px-3 py-1.5 gap-0 text-xs text-gray-700 bg-[#f3f2f1] min-h-[80px] overflow-x-auto">
          {/* CLIPBOARD */}
          <Group label="Clipboard">
            <div className="flex gap-1 items-center py-0.5">
              <button
                onMouseDown={e => { e.preventDefault(); handlePaste(); }}
                title="Paste (Ctrl+V)"
                className="flex flex-col items-center justify-center px-3 py-1 hover:bg-gray-200 rounded border border-transparent hover:border-gray-300 transition-all"
              >
                <FiClipboard size={24} className="text-[#c75b00] mb-0.5" />
                <span className="text-[10px] text-gray-600">Paste</span>
              </button>
              <div className="flex flex-col gap-0.5">
                <button onMouseDown={e => { e.preventDefault(); handleCut(); }} title="Cut (Ctrl+X)" className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-200 rounded text-gray-600 text-[11px] transition-colors">
                  <FiScissors size={13} /> Cut
                </button>
                <button onMouseDown={e => { e.preventDefault(); handleCopy(); }} title="Copy (Ctrl+C)" className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-200 rounded text-gray-600 text-[11px] transition-colors">
                  <FiCopy size={13} /> Copy
                </button>
              </div>
            </div>
          </Group>
          
          {/* UNDO/REDO */}
          <Group label="History">
            <RBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)"><FiCornerUpLeft size={15} /></RBtn>
            <RBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)"><FiCornerUpRight size={15} /></RBtn>
          </Group>

          {/* FONT */}
          <Group label="Font" className="min-w-[180px]">
            {/* Row 1: Font family + size */}
            <div className="flex gap-1 mb-1 w-full">
              {/* Font Family */}
              <div ref={fontRef} className="relative">
                <div
                  className="flex items-center gap-1 border border-gray-300 bg-white rounded px-2 py-0.5 w-36 cursor-pointer hover:border-blue-400 text-[11px]"
                  onClick={() => setShowFontDrop(v => !v)}
                >
                  <span className="flex-1 truncate" style={{ fontFamily: fontInput }}>{fontInput}</span>
                  <FiChevronDown size={10} className="text-gray-400 shrink-0" />
                </div>
                {showFontDrop && (
                  <div className="absolute top-full left-0 z-50 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-xl w-52 max-h-60 overflow-y-auto">
                    <div className="p-1">
                      <input
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:border-blue-400"
                        placeholder="Search fonts…"
                        autoFocus
                        onChange={e => {}}
                      />
                      {FONTS.map(f => (
                        <button key={f} onMouseDown={e => { e.preventDefault(); applyFont(f); }}
                          className={`w-full text-left px-3 py-1.5 text-xs rounded hover:bg-blue-50 hover:text-blue-700 ${fontInput === f ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                          style={{ fontFamily: f }}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Font Size */}
              <div ref={sizeRef} className="relative">
                <div
                  className="flex items-center gap-0.5 border border-gray-300 bg-white rounded px-1.5 py-0.5 w-14 cursor-pointer hover:border-blue-400 text-[11px]"
                  onClick={() => setShowSizeDrop(v => !v)}
                >
                  <input
                    className="w-8 bg-transparent focus:outline-none text-center"
                    value={sizeInput}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setSizeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') applySize(sizeInput); }}
                  />
                  <FiChevronDown size={10} className="text-gray-400 shrink-0" />
                </div>
                {showSizeDrop && (
                  <div className="absolute top-full left-0 z-50 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-xl w-20 max-h-52 overflow-y-auto">
                    {SIZES.map(s => (
                      <button key={s} onMouseDown={e => { e.preventDefault(); applySize(s); }}
                        className={`w-full text-right px-3 py-1 text-xs hover:bg-blue-50 hover:text-blue-700 ${sizeInput === s ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Formatting buttons + color pickers */}
            <div className="flex items-center gap-0.5 flex-wrap">
              <RBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
                <strong className="text-xs leading-none">B</strong>
              </RBtn>
              <RBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
                <em className="text-xs leading-none font-serif">I</em>
              </RBtn>
              <RBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
                <span className="text-xs leading-none underline">U</span>
              </RBtn>
              <RBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                <span className="text-xs leading-none line-through">ab</span>
              </RBtn>
              <RBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
                <FiCode size={11} />
              </RBtn>

              <Sep />

              {/* Text Color */}
              <div ref={tcRef} className="relative">
                <button
                  title="Font Color"
                  onMouseDown={e => { e.preventDefault(); setShowTextColor(v => !v); setShowHighlight(false); }}
                  className="w-7 h-7 flex flex-col items-center justify-center rounded hover:bg-gray-200 border border-transparent hover:border-gray-300 transition-all"
                >
                  <span className="text-xs font-bold leading-none" style={{ color: textColor }}>A</span>
                  <div className="w-4 h-1 rounded-sm mt-0.5" style={{ background: textColor }} />
                </button>
                {showTextColor && (
                  <ColorPicker
                    current={textColor}
                    onSelect={c => {
                      setTextColor(c);
                      editor.chain().focus().setColor(c).run();
                      setShowTextColor(false);
                    }}
                  />
                )}
              </div>

              {/* Highlight Color */}
              <div ref={hlRef} className="relative">
                <button
                  title="Text Highlight Color"
                  onMouseDown={e => { e.preventDefault(); setShowHighlight(v => !v); setShowTextColor(false); }}
                  className="w-7 h-7 flex flex-col items-center justify-center rounded hover:bg-gray-200 border border-transparent hover:border-gray-300 transition-all"
                >
                  <span className="text-xs font-bold leading-none">ab</span>
                  <div className="w-4 h-1 rounded-sm mt-0.5" style={{ background: highlightColor }} />
                </button>
                {showHighlight && (
                  <ColorPicker
                    current={highlightColor}
                    onSelect={c => {
                      setHighlightColor(c);
                      editor.chain().focus().toggleHighlight({ color: c }).run();
                      setShowHighlight(false);
                    }}
                  />
                )}
              </div>

              {/* Increase/Decrease font size quickly */}
              <RBtn
                onClick={() => { const s = String(Math.min(96, parseInt(sizeInput || '11') + 2)); applySize(s); }}
                title="Increase Font Size"
              >
                <span className="font-bold text-[11px]">A<sup>+</sup></span>
              </RBtn>
              <RBtn
                onClick={() => { const s = String(Math.max(6, parseInt(sizeInput || '11') - 2)); applySize(s); }}
                title="Decrease Font Size"
              >
                <span className="font-bold text-[11px]">A<sup>-</sup></span>
              </RBtn>

              <RBtn
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                title="Clear All Formatting"
              >
                <FiMinus size={11} />
              </RBtn>
            </div>
          </Group>
          
          {/* PARAGRAPH */}
          <Group label="Paragraph">
            <div className="flex flex-col gap-1 py-0.5">
              {/* Row 1: Lists + indent */}
              <div className="flex gap-0.5 items-center">
                <RBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
                  <FiList size={14} />
                </RBtn>
                <RBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
                  <span className="text-[10px] font-bold">1.</span>
                </RBtn>
                <RBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Block Quote">
                  <FiMessageSquare size={12} />
                </RBtn>
                <Sep />
                <RBtn onClick={outdent} title="Decrease Indent">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="2" y1="3" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="5" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="2" y1="11" x2="12" y2="11" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4.5 5.5L2 7l2.5 1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  </svg>
                </RBtn>
                <RBtn onClick={indent} title="Increase Indent">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="2" y1="3" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="5" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="2" y1="11" x2="12" y2="11" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 5.5L4.5 7L2 8.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  </svg>
                </RBtn>
              </div>
              {/* Row 2: Alignment */}
              <div className="flex gap-0.5 items-center">
                <RBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left (Ctrl+L)">
                  <FiAlignLeft size={13} />
                </RBtn>
                <RBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center (Ctrl+E)">
                  <FiAlignCenter size={13} />
                </RBtn>
                <RBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right (Ctrl+R)">
                  <FiAlignRight size={13} />
                </RBtn>
                <RBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify (Ctrl+J)">
                  <FiAlignJustify size={13} />
                </RBtn>
                <Sep />
                <RBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                  <FiMinus size={13} />
                </RBtn>
              </div>
            </div>
          </Group>

          {/* STYLES GALLERY */}
          <Group label="Styles" className="flex-1 min-w-0">
            <div className="flex gap-1 h-full items-center bg-white border border-gray-300 px-1.5 py-1 rounded overflow-x-auto w-full">
              {stylePresets.map(({ label, preview, cls, action, active }) => (
                <button
                  key={label}
                  onMouseDown={e => { e.preventDefault(); action(); }}
                  className={`
                    px-3 py-1.5 border flex flex-col items-center justify-center min-w-[72px] rounded transition-all shrink-0
                    ${active()
                      ? 'border-[#b3d0ee] bg-[#d4e4f7]'
                      : 'border-transparent hover:bg-gray-100 hover:border-gray-200'}
                  `}
                >
                  <span className={cls}>{preview}</span>
                  <span className="text-[9px] text-gray-500 mt-0.5">{label}</span>
                </button>
              ))}
            </div>
          </Group>
        </div>
      )}
      
      {/* INSERT TAB BODY */}
      {activeTab === 'Insert' && (
        <div className="flex items-stretch px-3 py-1.5 gap-0 text-xs text-gray-700 bg-[#f3f2f1] min-h-[80px] overflow-x-auto">
          <Group label="Text">
            <RBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code" wide>
              <FiCode size={13} /> <span>Code</span>
            </RBtn>
            <RBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote" wide>
              <FiMessageSquare size={13} /> <span>Quote</span>
            </RBtn>
          </Group>
          <Group label="Links">
            <RBtn
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
              title="Insert Link" wide
            >
              <FiLink size={13} /> <span>Link</span>
            </RBtn>
            <RBtn
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Remove Link" wide
            >
              <FiLink size={13} /> <span>Unlink</span>
            </RBtn>
          </Group>
          <Group label="Structure">
            <RBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule" wide>
              <FiMinus size={13} /> <span>H. Line</span>
            </RBtn>
            <RBtn onClick={() => editor.chain().focus().setHardBreak().run()} title="Hard Break" wide>
              <span>↵</span> <span>Break</span>
            </RBtn>
          </Group>
        </div>
      )}

      {/* LAYOUT TAB BODY */}
      {activeTab === 'Layout' && (
        <div className="flex items-stretch px-3 py-1.5 gap-0 text-xs text-gray-700 bg-[#f3f2f1] min-h-[80px] overflow-x-auto">
          <Group label="Paragraph Spacing">
            <div className="flex flex-col gap-1 py-0.5">
              <div className="text-[11px] text-gray-500">Line spacing options (use custom CSS or extension)</div>
            </div>
          </Group>
        </div>
      )}

      {/* REVIEW TAB BODY */}
      {activeTab === 'Review' && (
        <div className="flex items-stretch px-3 py-1.5 gap-0 text-xs text-gray-700 bg-[#f3f2f1] min-h-[80px] overflow-x-auto">
          <Group label="Editing">
            <RBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear All Formatting" wide>
              <FiMinus size={13} /> <span>Clear Format</span>
            </RBtn>
          </Group>
          <Group label="History">
            <RBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} wide>
              <FiCornerUpLeft size={14} /> <span>Undo</span>
            </RBtn>
            <RBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} wide>
              <FiCornerUpRight size={14} /> <span>Redo</span>
            </RBtn>
          </Group>
        </div>
      )}

      {/* VIEW TAB BODY */}
      {activeTab === 'View' && (
        <div className="flex items-stretch px-3 py-1.5 gap-0 text-xs text-gray-700 bg-[#f3f2f1] min-h-[80px] overflow-x-auto">
          <Group label="Document Views">
            <div className="py-0.5 text-[11px] text-gray-500">Switch view modes using the toolbar above</div>
          </Group>
        </div>
      )}
    </div>
  );
}