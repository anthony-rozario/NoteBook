"use client"

import { useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"

import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"

import Page from "./Page"
import Ribbon from "./Ribbon"

import { calculatePages } from "@/utils/editor/pagination"

export default function AdvancedEditor() {

  const [pages, setPages] = useState<number[]>([0])

 const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
  ],

  // ⭐ IMPORTANT FIX
  immediatelyRender: false,

  editorProps: {
    attributes: {
      class: "prose max-w-none focus:outline-none",
    },
  },

  onUpdate: ({ editor }) => {
    setTimeout(() => {
      const pageData = calculatePages(editor)
      setPages(pageData.map((_, i) => i))
    }, 10)
  },
})

  return (
    <div className="flex flex-col h-screen bg-[#e5e5e5]">

      <Ribbon editor={editor} />

      <div className="flex-1 overflow-y-auto flex flex-col items-center gap-12 py-12">

        {pages.map((p) => (

          <Page key={p}>

            {p === 0 && (
              <EditorContent editor={editor} />
            )}

          </Page>

        ))}

      </div>

    </div>
  )
}