import {
  DialogContext,
  DialogProvider,
} from '@/providers/dialog/DialogProvider';
import { motion } from 'framer-motion';
import { ReactNode, useContext } from 'react';
import { MenuToggle } from './MenuToggle';

const sidebar = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    y: '-100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

const DialogContent = ({ children }: { children: ReactNode }) => {
  const { isOpen, updateIsOpen } = useContext(DialogContext);

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      className="z-10 flex h-full items-center justify-center"
    >
      <motion.div
        className="fixed top-0 left-0 right-0 bottom-0 bg-white dark:bg-zinc-800"
        variants={sidebar}
      >
        {isOpen && children}
      </motion.div>
      <MenuToggle toggle={() => updateIsOpen()} />
    </motion.nav>
  );
};

export const Dialog = ({ children }: { children: ReactNode }) => {
  return (
    <DialogProvider>
      <DialogContent>{children}</DialogContent>
    </DialogProvider>
  );
};
