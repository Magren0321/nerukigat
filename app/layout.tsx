import { Header } from '@/components/layout/header/Header';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const openHuninn = localFont({
  src: '../public/fonts/jf-openhuninn-2.1.ttf',
  display: 'swap',
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji',
  ],
});

export const metadata: Metadata = {
  title: "Magren's Blog",
  description: '不为繁华易匠心',
  alternates: {
    canonical: 'https://magren.cc',
    types: {
      'application/rss+xml': [{ url: 'feed.xml', title: 'RSS' }],
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={openHuninn.className}>
        <Analytics mode={'production'} />
        <ScrollToTop />
        <div>
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
