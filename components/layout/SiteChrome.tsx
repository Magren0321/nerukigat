'use client';

import { usePathname } from 'next/navigation';

import { ScrollToTop } from '@/components/ScrollToTop';
import { Header } from '@/components/layout/header/Header';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
      <ScrollToTop />
      <div>
        <Header />
        <main>{children}</main>
      </div>
    </>
  );
}
