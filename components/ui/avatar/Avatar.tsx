'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

export function Avatar() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
      whileHover={shouldReduceMotion ? undefined : { rotate: 360 }}
      className="size-48 sm:size-60 lg:size-[300px] 2xl:size-[336px]"
    >
      <Image
        width={336}
        height={336}
        priority
        sizes="(min-width: 1536px) 336px, (min-width: 1024px) 300px, (min-width: 640px) 240px, 192px"
        src={'/avatar.png'}
        alt="Magren 的狐狸头像插画"
        className="size-full rounded-full border border-zinc-200 object-cover shadow-[0_20px_45px_-28px_rgba(39,39,42,0.45)] dark:border-zinc-700 dark:brightness-90 dark:shadow-[0_20px_45px_-28px_rgba(9,9,11,0.8)]"
      />
    </motion.div>
  );
}
