'use client'

import React, { useEffect, useRef } from 'react';
import {
  type WalineInstance,
  type WalineInitOptions,
  init,
} from '@waline/client';


export type WalineOptions = Omit<WalineInitOptions, 'el'> & { path: string };

export const Comment = (props: WalineOptions) => {
  const walineInstanceRef = useRef<WalineInstance | null>(null);
  const containerRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    walineInstanceRef.current = init({
      ...props,
      el: containerRef.current,
    });

    return () => walineInstanceRef.current?.destroy();
  }, [containerRef, props]);

  useEffect(() => {
    walineInstanceRef.current?.update(props);
  }, [props]);

  return <div className='mt-5 lg:mr-[200px]' ref={containerRef} />;
};
