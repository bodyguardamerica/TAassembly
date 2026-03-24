'use client'

import { useEffect, useRef, useState } from 'react'

interface PdfViewerProps {
  url: string
  title: string
}

export default function PdfViewer({ url, title }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef = useRef<any>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPdf() {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const pdf = await pdfjsLib.getDocument(url).promise
        if (cancelled) return

        pdfRef.current = pdf
        setNumPages(pdf.numPages)
        setLoading(false)
      } catch {
        if (!cancelled) setError(true)
      }
    }

    loadPdf()
    return () => { cancelled = true }
  }, [url])

  useEffect(() => {
    if (!pdfRef.current || loading) return

    async function renderPage() {
      const canvas = canvasRef.current
      if (!canvas) return

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }

      try {
        const page = await pdfRef.current.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.5 })
        canvas.width = viewport.width
        canvas.height = viewport.height

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const renderTask = page.render({ canvasContext: ctx, viewport })
        renderTaskRef.current = renderTask
        await renderTask.promise
        renderTaskRef.current = null
      } catch (err: unknown) {
        // Ignore cancelled render tasks
        if (err instanceof Error && err.name !== 'RenderingCancelledException') {
          setError(true)
        }
      }
    }

    renderPage()
  }, [pageNum, loading])

  if (error) {
    return (
      <div className="text-center py-16 max-w-md">
        <p className="font-body text-muted mb-4">Failed to load this PDF.</p>
        <a
          href={url}
          download
          className="font-body text-xs tracking-widest uppercase border border-tan text-tan px-4 py-2 rounded-sm hover:bg-tan hover:text-bg transition-colors duration-200"
        >
          Download Instead
        </a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <div className="w-8 h-8 border-2 border-border border-t-tan rounded-full animate-spin" />
        <p className="font-body text-muted text-sm">Loading guide&hellip;</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
      {/* Canvas */}
      <div className="w-full overflow-auto border border-border rounded-sm bg-surface">
        <canvas
          ref={canvasRef}
          aria-label={`${title} — page ${pageNum} of ${numPages}`}
          className="block mx-auto"
        />
      </div>

      {/* Pagination */}
      {numPages > 1 && (
        <div className="flex items-center gap-6">
          <button
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            disabled={pageNum <= 1}
            aria-label="Previous page"
            className="
              font-body text-xs tracking-widest uppercase
              border border-border text-muted px-4 py-2 rounded-sm
              hover:border-tan hover:text-tan transition-colors duration-200
              disabled:opacity-30 disabled:cursor-not-allowed
            "
          >
            Prev
          </button>
          <span className="font-body text-muted text-sm">
            Page {pageNum} of {numPages}
          </span>
          <button
            onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
            disabled={pageNum >= numPages}
            aria-label="Next page"
            className="
              font-body text-xs tracking-widest uppercase
              border border-border text-muted px-4 py-2 rounded-sm
              hover:border-tan hover:text-tan transition-colors duration-200
              disabled:opacity-30 disabled:cursor-not-allowed
            "
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
