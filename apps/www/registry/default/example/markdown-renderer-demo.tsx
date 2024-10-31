import { MarkdownRenderer } from "@/registry/default/ui/markdown-renderer"

export default function MarkdownRendererDemo() {
  return (
    <div className="w-full">
      <MarkdownRenderer>
        {`# Hello World
 
 This is a paragraph with **bold** and *italic* text.
  
 ## Lists
 - Item 1
 - Item 2
   - Nested item
  
 ## Code
 \`\`\`tsx
 console.log("Hello World")
 \`\`\`
  
 ## Tables
 | Header 1 | Header 2 |
 |----------|----------|
 | Cell 1   | Cell 2   |
 `}
      </MarkdownRenderer>
    </div>
  )
}
