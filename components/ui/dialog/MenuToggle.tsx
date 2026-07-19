import clsx from 'clsx';
import * as React from 'react';

type MenuToggleProps = {
  isOpen: boolean;
  toggle: () => void;
};

export const MenuToggle = React.forwardRef<
  HTMLButtonElement,
  MenuToggleProps
>(({ isOpen, toggle }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={toggle}
    aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
    aria-expanded={isOpen}
    aria-controls="mobile-navigation"
    className={clsx(
      'filter-bg relative z-10 inline-flex min-h-11 min-w-[88px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold',
      'text-zinc-800 transition-[transform,color,box-shadow] duration-200 dark:text-zinc-100',
      'hover:text-blue-700 dark:hover:text-blue-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-bgColor dark:focus-visible:ring-blue-400',
      'active:scale-[0.98] motion-reduce:transition-none'
    )}
  >
    <span
      aria-hidden="true"
      className={clsx(
        'size-5 shrink-0',
        isOpen ? 'icon-[tabler--x]' : 'icon-[tabler--menu-2]'
      )}
    />
    <span>{isOpen ? 'Close' : 'Menu'}</span>
  </button>
));

MenuToggle.displayName = 'MenuToggle';
