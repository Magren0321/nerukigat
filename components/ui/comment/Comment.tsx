'use client';

import {
  init,
  type WalineInitOptions,
  type WalineInstance,
} from '@waline/client';
import React, { useEffect, useRef } from 'react';

export type WalineOptions = Omit<WalineInitOptions, 'el'> & { path: string };

export const Comment = (props: WalineOptions) => {
  const walineInstanceRef = useRef<WalineInstance | null>(null);
  const containerRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    walineInstanceRef.current = init({
      ...props,
      emoji: ['//cdn.jsdelivr.net/gh/walinejs/emojis@1.1.0/tw-emoji'],
      dark: 'auto',
      meta: ['nick', 'mail'],
      imageUploader: false,
      search: false,
      copyright: false,
      locale: {
        placeholder: '随便说点什么吧，不用登陆也可以直接留言',
      },
      el: containerRef.current,
    });

    return () => walineInstanceRef.current?.destroy();
  }, [containerRef, props]);

  useEffect(() => {
    walineInstanceRef.current?.update(props);
  }, [props]);

  return <div className="mt-5" ref={containerRef} />;
};
