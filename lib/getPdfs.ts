import fs from 'fs'
import path from 'path'

export type GuideEntry = {
  slug: string
  filename: string
  title: string
  url: string
  imageUrl: string | null
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

export function getPdfs(): GuideEntry[] {
  const pdfDir = path.join(process.cwd(), 'public', 'pdfs')
  const imgDir = path.join(process.cwd(), 'public', 'images')

  if (!fs.existsSync(pdfDir)) return []

  return fs
    .readdirSync(pdfDir)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .map(filename => {
      const base = filename.replace(/\.pdf$/i, '')
      const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const title = base
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())

      const imageExt = IMAGE_EXTENSIONS.find(ext =>
        fs.existsSync(path.join(imgDir, `${base}.${ext}`))
      )
      const imageUrl = imageExt ? `/images/${base}.${imageExt}` : null

      return { slug, filename, title, url: `/pdfs/${filename}`, imageUrl }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}
