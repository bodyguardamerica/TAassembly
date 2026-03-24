import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPdfs } from '../../../../lib/getPdfs'
import PdfViewer from '../../../components/PdfViewer'

export async function generateStaticParams() {
  return getPdfs().map((g) => ({ slug: g.slug }))
}

export default function ViewerPage({ params }: { params: { slug: string } }) {
  const guides = getPdfs()
  const guide = guides.find((g) => g.slug === params.slug)

  if (!guide) notFound()

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Toolbar */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-body text-xs tracking-widest uppercase text-muted hover:text-tan transition-colors duration-200 flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Guides
        </Link>

        <h1 className="font-display text-text text-sm tracking-wide text-center flex-1 truncate">
          {guide.title}
        </h1>

        <a
          href={guide.url}
          download
          aria-label={`Download ${guide.title} PDF`}
          className="
            font-body text-xs tracking-widest uppercase
            border border-border text-muted px-3 py-2 rounded-sm
            hover:border-tan hover:text-tan transition-colors duration-200
            flex items-center gap-2 shrink-0
          "
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </a>
      </header>

      {/* PDF Viewer */}
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <PdfViewer url={guide.url} title={guide.title} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-5 text-center">
        <p className="font-body text-muted text-xs tracking-wide">
          &copy; {new Date().getFullYear()} Tabletop Armory
        </p>
      </footer>
    </div>
  )
}
