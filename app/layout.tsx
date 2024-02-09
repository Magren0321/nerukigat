import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Magren's Blog",
  description: "不为繁华易匠心",
  alternates: {
    canonical: 'https://magren.cc',
    types: {
      'application/rss+xml': [{ url: 'feed.xml', title: 'RSS' }],
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div>
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
