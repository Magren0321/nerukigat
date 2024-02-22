'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function Avatar() {
  return (
    <motion.div
      transition={{ duration: 0.5 }}
      whileHover={{ rotate: 360 }}
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
