import {
  DialogContext,
  DialogProvider,
} from '@/providers/dialog/DialogProvider';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ReactNode, useContext, useEffect, useRef } from 'react';
import { MenuToggle } from './MenuToggle';

const DialogContent = ({
  children,
  hasHeaderBackground,
}: {
  children: ReactNode;
  hasHeaderBackground: boolean;
}) => {
  const { isOpen, closeDialog, toggleDialog } = useContext(DialogContext);
  const shouldReduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen) {
      panelRef.current
        ?.querySelector<HTMLElement>('[data-mobile-nav-close]')
        ?.focus();
    } else if (wasOpen.current) {
      triggerRef.current?.focus();
    }

    wasOpen.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeDialog, isOpen]);

  return (
    <div className="flex items-center justify-center">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              aria-hidden="true"
              className="fixed inset-0 z-0 bg-zinc-950/30 backdrop-blur-[2px] dark:bg-zinc-950/55"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              onPointerDown={closeDialog}
            />
            <motion.div
              ref={panelRef}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="fixed inset-x-2 z-10 mx-auto max-w-lg overflow-hidden rounded-[1.75rem] border border-zinc-900/10 bg-zinc-50 shadow-[0_-16px_48px_rgba(24,24,27,0.16)] dark:border-zinc-50/10 dark:bg-zinc-900 dark:shadow-[0_-16px_48px_rgba(0,0,0,0.4)]"
              style={{
                bottom:
                  process.env.NODE_ENV === 'development'
                    ? 'max(4.75rem, calc(env(safe-area-inset-bottom) + 4rem))'
                    : 'max(0.5rem, env(safe-area-inset-bottom))',
              }}
              initial={
                shouldReduceMotion ? false : { y: 'calc(100% + 1rem)', opacity: 0 }
              }
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 'calc(100% + 1rem)', opacity: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 380, damping: 36 }
              }
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <MenuToggle
        ref={triggerRef}
        isOpen={isOpen}
        hasHeaderBackground={hasHeaderBackground}
        toggle={toggleDialog}
      />
    </div>
  );
};

export const Dialog = ({
  children,
  hasHeaderBackground = false,
}: {
  children: ReactNode;
  hasHeaderBackground?: boolean;
}) => {
  return (
    <DialogProvider>
      <DialogContent hasHeaderBackground={hasHeaderBackground}>
        {children}
      </DialogContent>
    </DialogProvider>
  );
};
