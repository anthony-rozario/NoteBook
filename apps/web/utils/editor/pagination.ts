import { CONTENT_HEIGHT } from "./editorConfig"

export function calculatePages(editor: any) {

  const dom = editor.view.dom
  const blocks = dom.children

  let pages: HTMLElement[][] = []
  let currentPage: HTMLElement[] = []

  let height = 0

  for (let i = 0; i < blocks.length; i++) {

    const block = blocks[i] as HTMLElement
    const blockHeight = block.offsetHeight

    if (height + blockHeight > CONTENT_HEIGHT) {

      pages.push(currentPage)
      currentPage = []
      height = 0
    }

    currentPage.push(block)
    height += blockHeight
  }

  if (currentPage.length) pages.push(currentPage)

  return pages
}