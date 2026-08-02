'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

export function Avatar() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
      whileHover={shouldReduceMotion ? undefined : { rotate: 360 }}
      className="w-[220px]  lg:w-[300px] "
    >
      <Image
        height={300}
        width={300}
        src={'/avatar.png'}
        alt="Site Owner Avatar"
        className="aspect-square w-full rounded-full border border-slate-200 dark:border-neutral-800"
      />
    </motion.div>
  );
}
