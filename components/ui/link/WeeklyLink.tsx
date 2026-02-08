'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// 检测是否支持真正的 hover（而非触摸）
const useSupportsHover = () => {
  const [supportsHover, setSupportsHover] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setSupportsHover(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSupportsHover(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return supportsHover;
};

interface WeeklyLinkProps {
  href: string;
  children: React.ReactNode;
}

export const WeeklyLink = ({ href, children }: WeeklyLinkProps) => {
  const supportsHover = useSupportsHover();

  return (
    <Link
      href={href}
      className={`relative min-w-0 flex-1 font-medium text-zinc-900 transition-colors dark:text-zinc-100 ${
        supportsHover
          ? 'hover:text-blue-600 dark:hover:text-blue-400'
          : ''
      }`}
    >
      {children}
    </Link>
  );
};

