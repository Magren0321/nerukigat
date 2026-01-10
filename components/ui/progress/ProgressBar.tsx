'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from './useProgress';

export const ProgressBar = () => {
  const { isLoading, progress } = useProgress();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[1000] h-0.5 bg-zinc-200/50 dark:bg-zinc-800/50"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 shadow-lg shadow-blue-500/50"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

