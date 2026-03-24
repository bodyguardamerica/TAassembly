import Link from 'next/link'
import { getPdfs } from '../../lib/getPdfs'

export default function HomePage() {
  const guides = getPdfs()

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-8 text-center">
        <p className="font-display text-tan text-xs tracking-[0.3em] uppercase mb-2">
          Tabletop Armory
        </p>
        <h1 className="font-display text-text text-3xl md:text-4xl tracking-wide">
          Assembly Guides
        </h1>
        <div className="mt-4 mx-auto w-24 h-px bg-border" />
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
        {guides.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-muted text-lg">No guides available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {guides.map((guide) => (
              <div
                key={guide.slug}
                className="
                  bg-surface border border-border rounded-sm
                  p-6 flex flex-col gap-4
                  transition-all duration-200
                  hover:border-tan hover:scale-[1.015]
                "
              >
                <div className="text-tan opacity-60">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h2 className="font-display text-text text-sm tracking-wide leading-snug flex-1">
                  {guide.title}
                </h2>
                <div className="flex gap-2">
                  <Link
                    href={`/viewer/${guide.slug}`}
                    className="
                      flex-1 text-center font-body text-xs tracking-widest uppercase
                      border border-tan text-tan px-4 py-2 rounded-sm
                      transition-colors duration-200
                      hover:bg-tan hover:text-bg
                    "
                  >
                    View Guide
                  </Link>
                  <a
                    href={guide.url}
                    download
                    aria-label={`Download ${guide.title} PDF`}
                    className="
                      font-body text-xs tracking-widest uppercase
                      border border-border text-muted px-3 py-2 rounded-sm
                      transition-colors duration-200
                      hover:border-tan hover:text-tan
                      flex items-center
                    "
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
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
