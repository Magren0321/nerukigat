'use client';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

export const AnimateContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
