'use client';

import { useSyncExternalStore } from 'react';

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

const subscribe = (onStoreChange: () => void) => {
  const mediaQuery = window.matchMedia(HOVER_QUERY);

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', onStoreChange);
    return () => mediaQuery.removeEventListener('change', onStoreChange);
  }

  mediaQuery.addListener(onStoreChange);
  return () => mediaQuery.removeListener(onStoreChange);
};

const getSnapshot = () => window.matchMedia(HOVER_QUERY).matches;
const getServerSnapshot = () => false;

export const useSupportsHover = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
