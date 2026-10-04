import clsx from 'clsx';
import * as React from 'react';

type MenuToggleProps = {
  isOpen: boolean;
  hasHeaderBackground: boolean;
  toggle: () => void;
};

export const MenuToggle = React.forwardRef<
  HTMLButtonElement,
  MenuToggleProps
>(({ isOpen, hasHeaderBackground, toggle }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={toggle}
    aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
    aria-expanded={isOpen}
    aria-controls="mobile-navigation"
    aria-hidden={isOpen || undefined}
    disabled={isOpen}
    className={clsx(
      'relative z-20 inline-flex size-11 items-center justify-center rounded-full',
      'text-zinc-800 transition-[transform,color,opacity,box-shadow] duration-200 dark:text-zinc-100',
      'hover:text-blue-700 dark:hover:text-blue-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-bgColor dark:focus-visible:ring-blue-400',
      'active:scale-[0.98] motion-reduce:transition-none',
      isOpen && 'pointer-events-none opacity-0',
      hasHeaderBackground
        ? 'bg-transparent shadow-none ring-0'
        : 'filter-bg'
    )}
  >
    <span
      aria-hidden="true"
      className={clsx(
        'size-5 shrink-0',
        isOpen ? 'icon-[tabler--x]' : 'icon-[tabler--menu-2]'
      )}
    />
    <span className="sr-only">{isOpen ? 'Close' : 'Menu'}</span>
  </button>
));

MenuToggle.displayName = 'MenuToggle';
