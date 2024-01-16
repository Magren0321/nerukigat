'use client'

import React, { createContext, useState } from 'react';

export const HeadingMapContext = createContext<Map<string, number>>(new Map());

export const PostProvider = ({ children } : {
  children: React.ReactNode
}) => {
  const [idMap, setIdMap] = useState<Map<string, number>>(new Map());

  return (
    <HeadingMapContext.Provider value={idMap}>
      {children}
    </HeadingMapContext.Provider>
  );
};
