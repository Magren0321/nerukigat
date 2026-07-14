'use client';

import { useSyncExternalStore } from 'react';

const hoverMediaQuery = '(hover: hover) and (pointer: fine)';

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(hoverMediaQuery);
  const handleChange = () => onStoreChange();

  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}

function getSnapshot() {
  return window.matchMedia(hoverMediaQuery).matches;
}

export function useSupportsHover() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
