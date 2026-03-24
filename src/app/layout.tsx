import type { Metadata } from 'next'
import { Cinzel, Raleway } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Assembly Guides — Tabletop Armory',
  description: 'Step-by-step assembly instruction guides for Tabletop Armory products.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${raleway.variable}`}>
      <body>{children}</body>
    </html>
  )
}
