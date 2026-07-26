'use client';

import { Navigation } from '@/components/layout/header/TabNavigation';
import { Dialog } from '@/components/ui/dialog/Dialog';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { NavigationBar } from './NavigationBar';

export const Header = () => {
  const [isShow, setIsShow] = useState(false);
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const nextIsShow = latest > 80;
    setIsShow((current) =>
      current === nextIsShow ? current : nextIsShow
    );
  });

  return (
    <div className="sticky top-0 z-[999]">
      <div className="relative w-full px-5 py-2">
        {/* 背景层，使用动画 */}
        <AnimatePresence>
          {isShow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.3,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 filter-bg"
            />
          )}
        </AnimatePresence>

        <div className="relative mx-auto flex max-w-4xl items-center justify-center">
          <Link href="/" className="z-0 mr-auto lg:z-[5]">
            <Image
              src={'/avatar.png'}
              width={40}
              height={40}
              alt="avatar"
              priority
              className="rounded-full"
            />
          </Link>
          <div className="ml-[-40px] hidden flex-1 lg:block">
            <NavigationBar
              className={!isShow ? 'filter-bg' : ''}
              hasBackground={isShow}
            />
          </div>
        </div>
      </div>
      <div className="fixed right-4 top-2 z-50 lg:hidden">
        <Dialog hasHeaderBackground={isShow}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Navigation />
            </motion.div>
          </AnimatePresence>
        </Dialog>
      </div>
    </div>
  );
};
