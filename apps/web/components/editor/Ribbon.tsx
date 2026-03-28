"use client"

export default function Ribbon({ editor }: any) {

  if (!editor) return null

  return (
    <div className="bg-[#f3f2f1] border-b px-4 py-2 flex gap-2">

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="px-3 py-1 border rounded"
      >
        Bold
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="px-3 py-1 border rounded"
      >
        Italic
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className="px-3 py-1 border rounded"
      >
        Underline
      </button>

    </div>
  )
}